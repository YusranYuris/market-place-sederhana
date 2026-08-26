// Satu sumber kebenaran untuk label & warna status order,
// mengikuti enum status_order di backend/src/db/schema.js

export const ORDER_STATUS = {
  menunggu_bayar: { label: "Menunggu Bayar", badge: "badge-amber" },
  menunggu_konfirmasi: { label: "Menunggu Konfirmasi", badge: "badge-blue" },
  diproses: { label: "Diproses", badge: "badge-purple" },
  dikirim: { label: "Dikirim", badge: "badge-amber" },
  selesai: { label: "Selesai", badge: "badge-green" },
  dibatalkan: { label: "Dibatalkan", badge: "badge-red" },
};

export const ORDER_STATUS_LIST = Object.keys(ORDER_STATUS);

export const getOrderStatus = (status) =>
  ORDER_STATUS[status] || { label: status, badge: "badge-gray" };
