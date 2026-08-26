import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

import Modal from "../../components/Modal.jsx";
import ProductImage from "../../components/ProductImage.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import * as orderService from "../../services/orderService.js";
import { formatCurrency, formatDateTime } from "../../utils/format.js";

function SellerOrderDetailModal({ orderId, onClose, onChanged }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    orderService
      .getOrderById(orderId)
      .then((data) => {
        setOrder(data);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [orderId]);

  const runAction = async (action) => {
    setBusy(true);

    try {
      await action();
      onChanged();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const actions = () => {
    if (!order) return null;

    switch (order.statusOrder) {
      case "menunggu_konfirmasi":
        return (
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() =>
                runAction(() => orderService.rejectOrder(orderId))
              }
              disabled={busy}
            >
              Tolak
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                runAction(() => orderService.acceptOrder(orderId))
              }
              disabled={busy}
            >
              Terima Pesanan
            </button>
          </>
        );
      case "diproses":
        return (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              runAction(() =>
                orderService.updateOrderStatus(orderId, "dikirim")
              )
            }
            disabled={busy}
          >
            Kirim Order
          </button>
        );
      case "dikirim":
        return (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              runAction(() =>
                orderService.updateOrderStatus(orderId, "selesai")
              )
            }
            disabled={busy}
          >
            Selesaikan Order
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      title={`Detail Order #ORD-${orderId}`}
      badge={order && <StatusBadge status={order.statusOrder} />}
      onClose={onClose}
      width={640}
      footer={
        <>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={busy}
          >
            Tutup
          </button>
          {actions()}
        </>
      }
    >
      {loading && <p className="state-box">Memuat detail order...</p>}

      {!loading && error && <p className="field-error">{error}</p>}

      {!loading && order && (
        <>
          <p className="checkout-label">Tanggal Order</p>
          <p style={{ marginBottom: 18, fontWeight: 600 }}>
            {formatDateTime(order.tglOrder)}
          </p>

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
                <ProductImage
                  alt={item.namaProduct}
                  className="checkout-item-image"
                />
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

          <div className="checkout-total-row" style={{ marginBottom: 20 }}>
            <span>Total Pembayaran</span>
            <span className="checkout-total">
              {formatCurrency(order.totalHarga)}
            </span>
          </div>

          {order.buktiBayar && (
            <>
              <p className="checkout-label">Bukti Pembayaran</p>
              <img
                src={order.buktiBayar}
                alt="Bukti pembayaran"
                className="order-proof-image"
              />
            </>
          )}
        </>
      )}
    </Modal>
  );
}

export default SellerOrderDetailModal;
