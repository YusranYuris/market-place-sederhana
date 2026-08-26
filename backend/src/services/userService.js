import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

// =========== USER SERVICE ===========

// ----- Collection ------

// Create New User
export const createUser = async (data) => {
    const {
        namaUser,
        email,
        password,
        role,
    } = data;

    // Validasi input dasar
    if (!namaUser || !email || !password || !role) {
        throw new Error("Nama, email, password, dan role wajib diisi");
    }

    // Validasi role
    if (!["pembeli", "penjual"].includes(role)) {
        throw new Error("Role tidak valid");
    }

    // Cek apakah email sudah digunakan
    const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (existingUser.length > 0) {
        throw new Error("Email sudah digunakan");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user
    const [newUser] = await db
        .insert(users)
        .values({
            namaUser,
            email,
            password: hashedPassword,
            role,
            statusUser: "aktif",
        })
        .returning({
            idUser: users.idUser,
            namaUser: users.namaUser,
            email: users.email,
            role: users.role,
            tglDaftar: users.tglDaftar,
            fotoProfil: users.fotoProfil,
            statusUser: users.statusUser,
        });

    return newUser;
};

// Login
export const login = async (data) => {
    const {
        email,
        password,
    } = data;

    if (!email || !password) {
        throw new Error("Email dan password wajib diisi");
    }

    // Cari user
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (!user) {
        throw new Error("Email atau password salah");
    }

    // Cek status user
    if (user.statusUser !== "aktif") {
        throw new Error("Akun tidak aktif");
    }

    // Cek password
    const passwordMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatch) {
        throw new Error("Email atau password salah");
    }

    // Buat token
    const token = jwt.sign(
        {
            idUser: user.idUser,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d",
        }
    );

    return {
        token,
        user: {
            idUser: user.idUser,
            namaUser: user.namaUser,
            email: user.email,
            role: user.role,
            fotoProfil: user.fotoProfil,
        },
    };
};