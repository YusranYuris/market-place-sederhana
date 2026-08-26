import express from "express";
import {
    getOrders,
    createOrder,
    getOrderById,
    uploadPaymentProof,
    acceptOrder,
    rejectOrder,
    updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

// =========== ORDER ROUTES ===========

// ----- Collection ------

// Get Orders
router.get("/", getOrders);

// Create New Order
router.post("/", createOrder);

// ----- Resource ------

// Get Order By ID
router.get("/:id", getOrderById);

// ----- Order Actions ------

// Upload Payment Proof
router.patch("/:id/payment", uploadPaymentProof);

// Accept Order
router.patch("/:id/accept", acceptOrder);

// Reject Order
router.patch("/:id/reject", rejectOrder);

// Update Order Status
router.patch("/:id/status", updateOrderStatus);

export default router;