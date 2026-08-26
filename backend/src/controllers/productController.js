import * as productService from "../services/productService.js";

// =========== PRODUCT CONTROLLER ===========

// ----- Collection ------

// Get All Products
export const getProducts = async (req, res) => {
    try {
        const products = await productService.getProducts(req.query);

        return res.status(200).json({
            success: true,
            message: "Data produk berhasil diambil",
            data: products,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Create New Product
export const createProduct = async (req, res) => {
    try {
        const product = await productService.createProduct(
            req.body,
            req.user
        );

        return res.status(201).json({
            success: true,
            message: "Produk berhasil dibuat",
            data: product,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// ----- Resource ------

// Get Product By ID
export const getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(
            req.params.id
        );

        return res.status(200).json({
            success: true,
            message: "Data produk berhasil diambil",
            data: product,
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

// Update Product
export const updateProduct = async (req, res) => {
    try {
        const product = await productService.updateProduct(
            req.params.id,
            req.body,
            req.user
        );

        return res.status(200).json({
            success: true,
            message: "Produk berhasil diperbarui",
            data: product,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete Product
export const deleteProduct = async (req, res) => {
    try {
        await productService.deleteProduct(
            req.params.id,
            req.user
        );

        return res.status(200).json({
            success: true,
            message: "Produk berhasil dihapus",
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};