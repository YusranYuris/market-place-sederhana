import express from "express";

const router = express.Router();

// =========== ORDER ROUTES ===========

// ----- Collection ------

// Get Orders
router.get("/", );

// Create New Order
router.post("/", );

// ----- Resource ------

// Get Order By ID
router.get("/:id", );

// ----- Order Actions ------

// Upload Payment Proof
router.patch("/:id/payment", );

// Accept Order
router.patch("/:id/accept", );

// Reject Order
router.patch("/:id/reject", );

// Update Order Status
router.patch("/:id/status", );

export default router;