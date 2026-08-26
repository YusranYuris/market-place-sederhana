import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, MapPin, Upload } from "lucide-react";
import toast from "react-hot-toast";

import ProductImage from "../../components/ProductImage.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import * as orderService from "../../services/orderService.js";
import { formatCurrency, formatDateTime } from "../../utils/format.js";

import "./OrderDetail.css";

function OrderDetail() {
  const { id } = useParams();
  const fileRef = useRef(null);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    orderService
      .getOrderById(id)
      .then((data) => {
        setOrder(data);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Pilih file bukti pembayaran terlebih dahulu");
      return;
    }

    setUploading(true);

    try {
      await orderService.uploadPaymentProof(id, file);

      toast.success("Bukti pembayaran berhasil diupload");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <p className="container page state-box">Memuat pesanan...</p>;
  }

  if (error || !order) {
    return (
      <div className="container page state-box">
        <p>{error || "Pesanan tidak ditemukan"}</p>
        <p style={{ marginTop: 16 }}>
          <Link to="/pesanan">Kembali ke pesanan saya</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container page order-detail-page">
      <Link to="/pesanan" className="back-link">
        <ChevronLeft size={16} />
        Kembali ke Pesanan Saya
      </Link>

      <div className="order-detail-head">
        <div>
          <h1 className="page-title">Order #ORD-{order.idOrder}</h1>
          <p className="page-subtitle">
            {formatDateTime(order.tglOrder)}
          </p>
        </div>
        <StatusBadge status={order.statusOrder} />
      </div>

      <div className="card order-detail-card">
        <p className="checkout-label">Alamat Pengiriman</p>
        <div className="checkout-info-row checkout-address">
          <MapPin size={16} />
          <span>{order.alamatPengiriman}</span>
        </div>

        <hr className="divider" />

        <p className="checkout-label">Produk</p>

        <div className="checkout-items">
          {order.items.map((item) => (
            <div className="checkout-item" key={item.idDetail}>
              <ProductImage alt={item.namaProduct} className="checkout-item-image" />
              <div className="checkout-item-info">
                <p className="checkout-item-name">{item.namaProduct}</p>
              </div>
              <div className="checkout-item-price">
                <p className="text-muted">
                  {item.qty}x {formatCurrency(item.hargaSatuan)}
                </p>
                <p className="checkout-item-subtotal">
                  {formatCurrency(item.subtotal)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <hr className="divider" />

        <div className="checkout-total-row">
          <span>Total Pembayaran</span>
          <span className="checkout-total">
            {formatCurrency(order.totalHarga)}
          </span>
        </div>
      </div>

      {order.statusOrder === "menunggu_bayar" && (
        <div className="card order-upload-card">
          <p className="checkout-label">Upload Bukti Pembayaran</p>

          <div className="order-upload-row">
            <label className="order-upload-input">
              <Upload size={16} />
              {file ? file.name : "Pilih file gambar (JPG/PNG/WEBP)"}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={(event) => setFile(event.target.files[0] || null)}
                hidden
              />
            </label>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? <span className="spinner" /> : "Upload"}
            </button>
          </div>
        </div>
      )}

      {order.buktiBayar && order.statusOrder !== "menunggu_bayar" && (
        <div className="card order-upload-card">
          <p className="checkout-label">Bukti Pembayaran</p>
          <img
            src={order.buktiBayar}
            alt="Bukti pembayaran"
            className="order-proof-image"
          />
        </div>
      )}
    </div>
  );
}

export default OrderDetail;
