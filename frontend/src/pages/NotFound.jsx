import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="container page state-box">
      <h1 className="page-title">Halaman tidak ditemukan</h1>
      <p className="page-subtitle">
        Alamat yang Anda tuju tidak tersedia.
      </p>
      <p style={{ marginTop: 20 }}>
        <Link to="/" className="btn btn-primary">
          Kembali ke Katalog
        </Link>
      </p>
    </div>
  );
}

export default NotFound;
