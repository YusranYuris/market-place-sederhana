import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CircleCheckBig,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShoppingBag,
  Store,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

import Logo from "../components/Logo.jsx";
import { useAuthStore } from "../stores/authStore.js";

import "./Auth.css";

const ROLES = [
  { value: "pembeli", label: "PEMBELI", Icon: ShoppingBag },
  { value: "penjual", label: "PENJUAL", Icon: Store },
];

function Register() {
  const navigate = useNavigate();

  const register = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);

  const [form, setForm] = useState({
    role: "pembeli",
    namaUser: "",
    email: "",
    password: "",
    konfirmasiPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const validate = () => {
    if (!form.namaUser || !form.email || !form.password) {
      return "Nama, email, dan password wajib diisi";
    }

    if (form.password.length < 6) {
      return "Password minimal 6 karakter";
    }

    if (form.password !== form.konfirmasiPassword) {
      return "Konfirmasi password tidak cocok";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const message = validate();

    if (message) {
      setError(message);
      return;
    }

    setError("");

    try {
      await register({
        namaUser: form.namaUser,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      setSuccess(true);

      toast.success("Pendaftaran berhasil");

      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth">
      <div className="auth-brand">
        <Logo size="lg" />
      </div>

      {success && (
        <div className="auth-alert">
          <CircleCheckBig size={18} />
          <div>
            <strong>Pendaftaran berhasil!</strong>
            <p>
              Akun Anda telah dibuat. Silakan <Link to="/login">login</Link>{" "}
              untuk memulai.
            </p>
          </div>
        </div>
      )}

      <div className="card auth-card">
        <h1 className="auth-title">Buat Akun Baru</h1>
        <p className="auth-subtitle">
          Lengkapi data di bawah ini untuk bergabung dengan komunitas kami.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label className="field-label">Daftar sebagai</label>
          <div className="role-picker">
            {ROLES.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                className={`role-option ${
                  form.role === value ? "selected" : ""
                }`}
                onClick={() => setForm({ ...form, role: value })}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="namaUser">
              Nama Lengkap
            </label>
            <div className="input-wrap">
              <User size={17} />
              <input
                id="namaUser"
                name="namaUser"
                type="text"
                placeholder="Contoh: Budi Santoso"
                value={form.namaUser}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
          </div>

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
                autoComplete="new-password"
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
          </div>

          <div className="field">
            <label className="field-label" htmlFor="konfirmasiPassword">
              Konfirmasi Password
            </label>
            <div className="input-wrap">
              <Lock size={17} />
              <input
                id="konfirmasiPassword"
                name="konfirmasiPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.konfirmasiPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
            {error && <p className="field-error">{error}</p>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : "Daftar Sekarang"}
          </button>
        </form>

        <hr className="divider" />

        <p className="auth-footer">
          Sudah punya akun? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
