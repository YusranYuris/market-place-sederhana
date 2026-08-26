import * as orderService from "../services/orderService.js";

// =========== ORDER CONTROLLER ===========

// ----- Collection ------

// Get Orders
export const getOrders = async (req, res) => {
    try {
        const orders = await orderService.getOrders(req.user);

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

// Create New Order
export const createOrder = async (req, res) => {
    try {
        const order = await orderService.createOrder(
            req.body,
            req.user
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

// ----- Resource ------

// Get Order By ID
export const getOrderById = async (req, res) => {
    try {
        const order = await orderService.getOrderById(
            req.params.id,
            req.user
        );

        return res.status(200).json({
            success: true,
            message: "Data order berhasil diambil",
            data: order,
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

// ----- Order Actions ------

// Upload Payment Proof
export const uploadPaymentProof = async (req, res) => {
    try {
        const order = await orderService.uploadPaymentProof(
            req.params.id,
            req.file,
            req.user
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

// Accept Order
export const acceptOrder = async (req, res) => {
    try {
        const order = await orderService.acceptOrder(
            req.params.id,
            req.user
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
        const order = await orderService.rejectOrder(
            req.params.id,
            req.user
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
        const order = await orderService.updateOrderStatus(
            req.params.id,
            req.body,
            req.user
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