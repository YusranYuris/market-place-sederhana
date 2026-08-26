import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";

import Logo from "../components/Logo.jsx";
import { useAuthStore } from "../stores/authStore.js";

import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Email dan password wajib diisi");
      return;
    }

    try {
      const user = await login(form);

      toast.success(`Selamat datang, ${user.namaUser}`);

      // Kembali ke halaman yang tadi dituju, atau beranda sesuai role
      const fallback =
        user.role === "penjual" ? "/seller/produk" : "/";

      navigate(location.state?.from || fallback, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth">
      <div className="auth-brand">
        <Logo size="lg" />
      </div>

      <div className="card auth-card">
        <div className="auth-center">
          <h1 className="auth-title">Selamat Datang Kembali</h1>
          <p className="auth-subtitle">
            Silakan masukkan detail akun Anda untuk masuk.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <div className="input-wrap">
              <Mail size={17} />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <div className="input-wrap">
              <Lock size={17} />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {error && <p className="field-error">{error}</p>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : "Masuk Sekarang"}
          </button>
        </form>

        <hr className="divider" />

        <p className="auth-footer">
          Belum punya akun? <Link to="/register">Daftar</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
