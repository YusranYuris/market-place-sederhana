import axios from "axios";

// Semua request ke backend lewat instance ini
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Token disimpan di localStorage oleh authStore
export const TOKEN_KEY = "marketplace_token";

// Sisipkan token ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Seragamkan pesan error + tendang keluar kalau token invalid
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    const message =
      error.response?.data?.message ||
      (error.code === "ERR_NETWORK"
        ? "Tidak bisa terhubung ke server"
        : "Terjadi kesalahan");

    if (status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("marketplace_user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
