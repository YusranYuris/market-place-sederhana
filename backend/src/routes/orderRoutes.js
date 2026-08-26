import express from "express";

import {
  createOrder,
  getMyOrders,
  getOrderById,
  uploadPaymentProof,
  getSellerOrders,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";

import {
  authMiddleware,
  requireRole,
} from "../middleware/authMiddleware.js";

import { uploadImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// =========== ORDER ROUTES ===========

// ----- Seller ------

// Get Seller Orders
router.get(
  "/seller/orders",
  authMiddleware,
  requireRole("penjual"),
  getSellerOrders
);

// Accept Order
router.patch(
  "/seller/:id/accept",
  authMiddleware,
  requireRole("penjual"),
  acceptOrder
);

// Reject Order
router.patch(
  "/seller/:id/reject",
  authMiddleware,
  requireRole("penjual"),
  rejectOrder
);

// Update Order Status
router.patch(
  "/seller/:id/status",
  authMiddleware,
  requireRole("penjual"),
  updateOrderStatus
);

// ----- Buyer ------

// Create New Order
router.post(
  "/",
  authMiddleware,
  requireRole("pembeli"),
  createOrder
);

// Get My Orders
router.get(
  "/my-orders",
  authMiddleware,
  requireRole("pembeli"),
  getMyOrders
);

// Upload Payment Proof
router.post(
  "/:id/payment-proof",
  authMiddleware,
  requireRole("pembeli"),
  uploadImage.single("bukti_bayar"),
  uploadPaymentProof
);

// ----- Resource ------

// Get Order By ID (pembeli & penjual)
router.get(
  "/:id",
  authMiddleware,
  getOrderById
);

export default router;
