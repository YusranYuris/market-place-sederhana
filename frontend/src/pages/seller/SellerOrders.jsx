import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import toast from "react-hot-toast";

import StatusBadge from "../../components/StatusBadge.jsx";
import SellerOrderDetailModal from "./SellerOrderDetailModal.jsx";
import * as orderService from "../../services/orderService.js";
import { ORDER_STATUS, ORDER_STATUS_LIST } from "../../utils/orderStatus.js";
import { formatCurrency, formatDateTime } from "../../utils/format.js";

import "./SellerOrders.css";

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [detailId, setDetailId] = useState(null);

  const load = () => {
    orderService
      .getSellerOrders()
      .then((data) => {
        setOrders(
          [...data].sort(
            (a, b) => new Date(b.tglOrder) - new Date(a.tglOrder)
          )
        );
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = activeTab
    ? orders.filter((order) => order.statusOrder === activeTab)
    : orders;

  const runAction = async (order, action, successMessage) => {
    setBusyId(order.idOrder);

    try {
      await action();
      toast.success(successMessage);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const renderAction = (order) => {
    const disabled = busyId === order.idOrder;

    switch (order.statusOrder) {
      case "menunggu_konfirmasi":
        return (
          <div className="seller-orders-actions">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={disabled}
              onClick={() =>
                runAction(
                  order,
                  () => orderService.rejectOrder(order.idOrder),
                  "Order ditolak"
                )
              }
            >
              Tolak
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={disabled}
              onClick={() =>
                runAction(
                  order,
                  () => orderService.acceptOrder(order.idOrder),
                  "Order diterima"
                )
              }
            >
              Terima
            </button>
          </div>
        );
      case "diproses":
        return (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={disabled}
            onClick={() =>
              runAction(
                order,
                () =>
                  orderService.updateOrderStatus(order.idOrder, "dikirim"),
                "Order dikirim"
              )
            }
          >
            Kirim Order
          </button>
        );
      case "dikirim":
        return (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={disabled}
            onClick={() =>
              runAction(
                order,
                () =>
                  orderService.updateOrderStatus(order.idOrder, "selesai"),
                "Order selesai"
              )
            }
          >
            Selesaikan
          </button>
        );
      default:
        return <span className="text-muted">-</span>;
    }
  };

  return (
    <div className="container page">
      <h1 className="page-title">Validasi Order</h1>
      <p className="page-subtitle">
        Kelola dan konfirmasi pesanan masuk dari pembeli.
      </p>

      <div className="card seller-orders-card">
        <div className="seller-orders-tabs">
          <button
            type="button"
            className={activeTab === "" ? "active" : ""}
            onClick={() => setActiveTab("")}
          >
            Semua Order
          </button>
          {ORDER_STATUS_LIST.map((status) => (
            <button
              key={status}
              type="button"
              className={activeTab === status ? "active" : ""}
              onClick={() => setActiveTab(status)}
            >
              {ORDER_STATUS[status].label}
            </button>
          ))}
        </div>

        <div className="seller-orders-row seller-orders-row-head">
          <span>ID Order</span>
          <span>Tanggal</span>
          <span>Total</span>
          <span>Status</span>
          <span>Aksi</span>
          <span />
        </div>

        {loading && <p className="state-box">Memuat order...</p>}

        {!loading && error && <p className="state-box">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <p className="state-box">Belum ada order.</p>
        )}

        {!loading &&
          !error &&
          filtered.map((order) => (
            <div className="seller-orders-row" key={order.idOrder}>
              <span className="orders-id">#ORD-{order.idOrder}</span>
              <span>{formatDateTime(order.tglOrder)}</span>
              <span className="orders-total">
                {formatCurrency(order.totalHarga)}
              </span>
              <span>
                <StatusBadge status={order.statusOrder} />
              </span>
              <span>{renderAction(order)}</span>
              <button
                type="button"
                className="icon-btn"
                title="Lihat detail"
                onClick={() => setDetailId(order.idOrder)}
              >
                <Eye size={15} />
              </button>
            </div>
          ))}
      </div>

      {detailId && (
        <SellerOrderDetailModal
          orderId={detailId}
          onClose={() => setDetailId(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}

export default SellerOrders;
