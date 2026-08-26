import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

import Logo from "./Logo.jsx";
import { useAuthStore } from "../stores/authStore.js";

import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();

    toast.success("Anda telah keluar");

    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link
          to={user?.role === "penjual" ? "/seller/produk" : "/"}
          className="navbar-brand"
        >
          <Logo />
        </Link>

        <nav className="navbar-menu">
          {!user && (
            <>
              <NavLink to="/" className="navbar-link">
                Katalog Produk
              </NavLink>
              <NavLink to="/login" className="navbar-link">
                Login
              </NavLink>
              <Link to="/register" className="btn btn-primary btn-sm">
                Daftar
              </Link>
            </>
          )}

          {user?.role === "pembeli" && (
            <>
              <NavLink to="/" className="navbar-link">
                Katalog Produk
              </NavLink>
              <NavLink to="/pesanan" className="navbar-link">
                Pesanan Saya
              </NavLink>
              <NavLink to="/keranjang" className="navbar-icon">
                <ShoppingCart size={19} />
              </NavLink>
            </>
          )}

          {user?.role === "penjual" && (
            <>
              <NavLink to="/seller/produk" className="navbar-link">
                Produk Saya
              </NavLink>
              <NavLink to="/seller/pesanan" className="navbar-link">
                Validasi Pesanan
              </NavLink>
            </>
          )}

          {user && (
            <div className="navbar-user">
              <span className="navbar-username">{user.namaUser}</span>
              <button
                type="button"
                className="navbar-icon"
                onClick={handleLogout}
                title="Keluar"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
