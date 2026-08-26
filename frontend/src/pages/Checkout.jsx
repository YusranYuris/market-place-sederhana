import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Calendar, CircleCheckBig, MapPin, User } from "lucide-react";
import toast from "react-hot-toast";

import ProductImage from "../components/ProductImage.jsx";
import { useAuthStore } from "../stores/authStore.js";
import { useCartStore } from "../stores/cartStore.js";
import * as orderService from "../services/orderService.js";
import { formatCurrency, formatDateTime } from "../utils/format.js";

import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((state) => state.user);

  const items = useCartStore((state) => state.items);
  const totalHarga = useCartStore((state) => state.totalHarga());
  const clearCart = useCartStore((state) => state.clear);

  const [submitting, setSubmitting] = useState(false);

  const alamatPengiriman = location.state?.alamatPengiriman;

  // Tidak ada alamat / keranjang kosong -> kembali ke keranjang
  if (!alamatPengiriman || items.length === 0) {
    return <Navigate to="/keranjang" replace />;
  }

  const handleConfirm = async () => {
    setSubmitting(true);

    try {
      const order = await orderService.createOrder({
        items,
        alamatPengiriman,
      });

      clearCart();
      toast.success("Order berhasil dibuat");
      navigate(`/pesanan/${order.idOrder}`, { replace: true });
    } catch (err) {
      toast.error(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="container page checkout-page">
      <div className="center">
        <h1 className="page-title">Konfirmasi Pesanan</h1>
        <p className="page-subtitle">
          Mohon periksa kembali detail pesanan Anda sebelum melakukan
          pembayaran.
        </p>
      </div>

      <div className="card checkout-card">
        <div className="checkout-top">
          <div>
            <p className="checkout-label">Informasi Pesanan</p>
            <div className="checkout-info-row">
              <Calendar size={16} />
              <span>{formatDateTime(new Date().toISOString())}</span>
            </div>
            <div className="checkout-info-row">
              <User size={16} />
              <span>{user.namaUser}</span>
            </div>
          </div>

          <div>
            <p className="checkout-label">Alamat Pengiriman</p>
            <div className="checkout-info-row checkout-address">
              <MapPin size={16} />
              <span>{alamatPengiriman}</span>
            </div>
          </div>
        </div>

        <hr className="divider" />

        <p className="checkout-label">Daftar Produk ({items.length})</p>

        <div className="checkout-items">
          {items.map((item) => (
            <div className="checkout-item" key={item.idProduct}>
              <ProductImage
                src={item.gambarProduct}
                alt={item.namaProduct}
                className="checkout-item-image"
              />
              <div className="checkout-item-info">
                <p className="checkout-item-name">{item.namaProduct}</p>
                <p className="checkout-item-category">{item.kategori}</p>
              </div>
              <div className="checkout-item-price">
                <p className="text-muted">
                  {item.qty}x {formatCurrency(item.harga)}
                </p>
                <p className="checkout-item-subtotal">
                  {formatCurrency(item.harga * item.qty)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <hr className="divider" />

        <div className="checkout-total-row">
          <span>Total Pembayaran</span>
          <span className="checkout-total">
            {formatCurrency(totalHarga)}
          </span>
        </div>

        <div className="checkout-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate("/keranjang")}
            disabled={submitting}
          >
            Kembali ke Keranjang
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? (
              <span className="spinner" />
            ) : (
              <>
                <CircleCheckBig size={16} />
                Konfirmasi Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
