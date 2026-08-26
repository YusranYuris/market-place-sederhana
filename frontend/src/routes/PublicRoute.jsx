import { Navigate } from "react-router-dom";

import { useAuthStore } from "../stores/authStore.js";

// Halaman login/register tidak perlu dibuka lagi kalau sudah masuk
function PublicRoute({ children }) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  if (token && user) {
    return (
      <Navigate
        to={user.role === "penjual" ? "/seller/produk" : "/"}
        replace
      />
    );
  }

  return children;
}

export default PublicRoute;
