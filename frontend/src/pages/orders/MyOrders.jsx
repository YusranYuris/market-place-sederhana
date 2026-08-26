import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import StatusBadge from "../../components/StatusBadge.jsx";
import * as orderService from "../../services/orderService.js";
import { ORDER_STATUS, ORDER_STATUS_LIST } from "../../utils/orderStatus.js";
import { formatCurrency, formatDateTime } from "../../utils/format.js";

import "./Orders.css";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeStatus, setActiveStatus] = useState("");

  useEffect(() => {
    orderService
      .getMyOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const map = {};
    ORDER_STATUS_LIST.forEach((status) => {
      map[status] = orders.filter((o) => o.statusOrder === status).length;
    });
    return map;
  }, [orders]);

  const filtered = activeStatus
    ? orders.filter((order) => order.statusOrder === activeStatus)
    : orders;

  return (
    <div className="container page">
      <h1 className="page-title">Pesanan Saya</h1>
      <p className="page-subtitle">
        Kelola dan pantau semua status transaksi Anda di sini.
      </p>

      <div className="orders-layout">
        <div className="card orders-filter">
          <p className="orders-filter-title">Status Transaksi</p>

          <button
            type="button"
            className={`orders-filter-item ${
              activeStatus === "" ? "active" : ""
            }`}
            onClick={() => setActiveStatus("")}
          >
            <span>Semua Pesanan</span>
            <span className="orders-filter-count">{orders.length}</span>
          </button>

          {ORDER_STATUS_LIST.map((status) => (
            <button
              key={status}
              type="button"
              className={`orders-filter-item ${
                activeStatus === status ? "active" : ""
              }`}
              onClick={() => setActiveStatus(status)}
            >
              <span>{ORDER_STATUS[status].label}</span>
              <span className="orders-filter-count">{counts[status]}</span>
            </button>
          ))}
        </div>

        <div className="card orders-table">
          <div className="orders-row orders-row-head">
            <span>ID Order</span>
            <span>Tanggal</span>
            <span>Total Harga</span>
            <span>Status</span>
            <span>Aksi</span>
          </div>

          {loading && <p className="state-box">Memuat pesanan...</p>}

          {!loading && error && <p className="state-box">{error}</p>}

          {!loading && !error && filtered.length === 0 && (
            <p className="state-box">Belum ada pesanan.</p>
          )}

          {!loading &&
            !error &&
            filtered.map((order) => (
              <div className="orders-row" key={order.idOrder}>
                <span className="orders-id">#ORD-{order.idOrder}</span>
                <span>{formatDateTime(order.tglOrder)}</span>
                <span className="orders-total">
                  {formatCurrency(order.totalHarga)}
                </span>
                <span>
                  <StatusBadge status={order.statusOrder} />
                </span>
                <span>
                  {order.statusOrder === "menunggu_bayar" ? (
                    <Link
                      to={`/pesanan/${order.idOrder}`}
                      className="btn btn-primary btn-sm"
                    >
                      Upload Bukti
                    </Link>
                  ) : (
                    <Link to={`/pesanan/${order.idOrder}`}>
                      Detail Pesanan
                    </Link>
                  )}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default MyOrders;
