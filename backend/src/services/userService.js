import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { users } from "../db/schema.js";

import {
  uploadFile,
  getPublicUrl,
  deleteFile,
} from "./storageService.js";

// =========== USER SERVICE ===========

const ALLOWED_ROLES = ["pembeli", "penjual"];

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.idUser,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );
};

// Map stored file path to public URL
const withPhotoUrl = (user) => ({
  ...user,
  fotoProfil: user.fotoProfil
    ? getPublicUrl("profile-images", user.fotoProfil)
    : null,
});

// ----- Collection ------

// Create New User
export const createUser = async (data) => {
  const {
    namaUser,
    email,
    password,
    role,
  } = data;

  if (!namaUser || !email || !password || !role) {
    throw new Error(
      "Nama, email, password, dan role wajib diisi"
    );
  }

  if (!ALLOWED_ROLES.includes(role)) {
    throw new Error(
      "Role harus 'pembeli' atau 'penjual'"
    );
  }

  // Check existing email
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUser.length > 0) {
    throw new Error("Email sudah terdaftar");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(users)
    .values({
      namaUser,
      email,
      password: hashedPassword,
      role,
    })
    .returning({
      idUser: users.idUser,
      namaUser: users.namaUser,
      email: users.email,
      role: users.role,
    });

  return user;
};

// Login
export const loginUser = async (data) => {
  const {
    email,
    password,
  } = data;

  if (!email || !password) {
    throw new Error("Email dan password wajib diisi");
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (result.length === 0) {
    throw new Error("Email atau password salah");
  }

  const user = result[0];

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Email atau password salah");
  }

  if (user.statusUser !== "aktif") {
    throw new Error("Akun tidak aktif");
  }

  const token = generateToken(user);

  return {
    token,
    user: withPhotoUrl({
      idUser: user.idUser,
      namaUser: user.namaUser,
      email: user.email,
      role: user.role,
      fotoProfil: user.fotoProfil,
    }),
  };
};

// ----- Profile ------

// Get Profile
export const getProfile = async (userId) => {
  const result = await db
    .select({
      idUser: users.idUser,
      namaUser: users.namaUser,
      email: users.email,
      role: users.role,
      fotoProfil: users.fotoProfil,
      tglDaftar: users.tglDaftar,
    })
    .from(users)
    .where(eq(users.idUser, userId));

  if (result.length === 0) {
    throw new Error("User tidak ditemukan");
  }

  return withPhotoUrl(result[0]);
};

// Update Profile
export const updateProfile = async (
  userId,
  data,
  file
) => {
  const currentUser = await db
    .select()
    .from(users)
    .where(eq(users.idUser, userId));

  if (currentUser.length === 0) {
    throw new Error("User tidak ditemukan");
  }

  const oldPhoto = currentUser[0].fotoProfil;

  const updateData = {};

  if (data.namaUser) {
    updateData.namaUser = data.namaUser;
  }

  // Upload new profile image
  if (file) {
    const uploaded = await uploadFile({
      bucket: "profile-images",
      folder: userId.toString(),
      file,
    });

    updateData.fotoProfil = uploaded.path;
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error("Tidak ada data yang diperbarui");
  }

  const [updatedUser] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.idUser, userId))
    .returning({
      idUser: users.idUser,
      namaUser: users.namaUser,
      email: users.email,
      role: users.role,
      fotoProfil: users.fotoProfil,
    });

  // Delete old image after database update
  if (file && oldPhoto) {
    try {
      await deleteFile(
        "profile-images",
        oldPhoto
      );
    } catch (error) {
      console.error(
        "Gagal menghapus foto profil lama:",
        error.message
      );
    }
  }

  return withPhotoUrl(updatedUser);
};
