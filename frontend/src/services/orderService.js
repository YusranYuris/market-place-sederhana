import api from "./api.js";

// ----- Pembeli ------

// POST /orders
export const createOrder = async ({ items, alamatPengiriman }) => {
  const { data } = await api.post("/orders", {
    items: items.map((item) => ({
      idProduct: item.idProduct,
      qty: item.qty,
    })),
    alamatPengiriman,
  });

  return data.data;
};

// GET /orders/my-orders
export const getMyOrders = async () => {
  const { data } = await api.get("/orders/my-orders");

  return data.data;
};

// GET /orders/:id
export const getOrderById = async (id) => {
  const { data } = await api.get(`/orders/${id}`);

  return data.data;
};

// POST /orders/:id/payment-proof
export const uploadPaymentProof = async (id, file) => {
  const formData = new FormData();

  formData.append("bukti_bayar", file);

  const { data } = await api.post(
    `/orders/${id}/payment-proof`,
    formData
  );

  return data.data;
};

// ----- Penjual ------

// GET /orders/seller/orders
export const getSellerOrders = async () => {
  const { data } = await api.get("/orders/seller/orders");

  return data.data;
};

// PATCH /orders/seller/:id/accept
export const acceptOrder = async (id) => {
  const { data } = await api.patch(`/orders/seller/${id}/accept`);

  return data.data;
};

// PATCH /orders/seller/:id/reject
export const rejectOrder = async (id) => {
  const { data } = await api.patch(`/orders/seller/${id}/reject`);

  return data.data;
};

// PATCH /orders/seller/:id/status
export const updateOrderStatus = async (id, status) => {
  const { data } = await api.patch(`/orders/seller/${id}/status`, {
    status,
  });

  return data.data;
};
