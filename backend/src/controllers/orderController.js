import * as orderService from "../services/orderService.js";

// =========== ORDER CONTROLLER ===========

// ----- Helper ------

const parseOrderId = (req, res) => {
  const orderId = Number(req.params.id);

  if (!Number.isInteger(orderId)) {
    res.status(400).json({
      success: false,
      message: "ID order tidak valid",
    });

    return null;
  }

  return orderId;
};

// ----- Collection ------

// Create New Order
export const createOrder = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const order = await orderService.createOrder(
      buyerId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Order berhasil dibuat",
      data: order,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get My Orders
export const getMyOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const orders = await orderService.getMyOrders(
      buyerId
    );

    return res.status(200).json({
      success: true,
      message: "Data order berhasil diambil",
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ----- Resource ------

// Get Order By ID
export const getOrderById = async (req, res) => {
  try {
    const orderId = parseOrderId(req, res);

    if (orderId === null) {
      return;
    }

    const order = await orderService.getOrderById(
      req.user.id,
      req.user.role,
      orderId
    );

    return res.status(200).json({
      success: true,
      message: "Detail order berhasil diambil",
      data: order,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// Upload Payment Proof
export const uploadPaymentProof = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const orderId = parseOrderId(req, res);

    if (orderId === null) {
      return;
    }

    const order = await orderService.uploadPaymentProof(
      buyerId,
      orderId,
      req.file
    );

    return res.status(200).json({
      success: true,
      message: "Bukti pembayaran berhasil diupload",
      data: order,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ----- Seller ------

// Get Seller Orders
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const orders = await orderService.getSellerOrders(
      sellerId
    );

    return res.status(200).json({
      success: true,
      message: "Data order berhasil diambil",
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Accept Order
export const acceptOrder = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const orderId = parseOrderId(req, res);

    if (orderId === null) {
      return;
    }

    const order = await orderService.acceptOrder(
      sellerId,
      orderId
    );

    return res.status(200).json({
      success: true,
      message: "Order berhasil diterima",
      data: order,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Reject Order
export const rejectOrder = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const orderId = parseOrderId(req, res);

    if (orderId === null) {
      return;
    }

    const order = await orderService.rejectOrder(
      sellerId,
      orderId
    );

    return res.status(200).json({
      success: true,
      message: "Order berhasil ditolak",
      data: order,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Order Status
export const updateOrderStatus = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const orderId = parseOrderId(req, res);

    if (orderId === null) {
      return;
    }

    const order = await orderService.updateOrderStatus(
      sellerId,
      orderId,
      req.body.status
    );

    return res.status(200).json({
      success: true,
      message: "Status order berhasil diperbarui",
      data: order,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
