import { Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "../stores/authStore.js";

// Bungkus halaman yang butuh login.
// Beri prop `role` untuk membatasi ke "pembeli" atau "penjual".
function ProtectedRoute({ role, children }) {
  const location = useLocation();

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  if (!token || !user) {
    return (
      <Navigate to="/login" state={{ from: location.pathname }} replace />
    );
  }

  if (role && user.role !== role) {
    // Arahkan ke beranda sesuai role-nya sendiri
    return (
      <Navigate
        to={user.role === "penjual" ? "/seller/produk" : "/"}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;
