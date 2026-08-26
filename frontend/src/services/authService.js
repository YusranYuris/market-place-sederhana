import api from "./api.js";

// POST /users
export const register = async (payload) => {
  const { data } = await api.post("/users", payload);

  return data.data;
};

// POST /users/login
export const login = async (payload) => {
  const { data } = await api.post("/users/login", payload);

  return data.data;
};

// GET /users/profile
export const getProfile = async () => {
  const { data } = await api.get("/users/profile");

  return data.data;
};

// PUT /users/profile
export const updateProfile = async ({ namaUser, fotoProfil }) => {
  const formData = new FormData();

  if (namaUser) {
    formData.append("namaUser", namaUser);
  }

  if (fotoProfil) {
    formData.append("foto_profil", fotoProfil);
  }

  const { data } = await api.put("/users/profile", formData);

  return data.data;
};
