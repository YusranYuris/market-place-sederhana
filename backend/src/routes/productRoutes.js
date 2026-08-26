import express from "express";
import {
    getProducts,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// =========== PRODUCT ROUTES ===========

// ----- Collection ------

// Get All Products
router.get("/", getProducts);

// Create New Product
router.post("/", createProduct);

// ----- Resource ------

// Get Product By ID
router.get("/:id", getProductById);

// Update Product
router.put("/:id", updateProduct);

// Delete Product
router.delete("/:id", deleteProduct);

export default router;