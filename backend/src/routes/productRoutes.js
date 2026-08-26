import express from "express";

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import {
  authMiddleware,
  requireRole,
} from "../middleware/authMiddleware.js";

import { uploadImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// =========== PRODUCT ROUTES ===========

// ----- Collection ------

// Get All Products
router.get("/", getProducts);

// Create New Product
router.post(
  "/",
  authMiddleware,
  requireRole("penjual"),
  uploadImage.single("gambar_product"),
  createProduct
);

// ----- Resource ------

// Get Product By ID
router.get("/:id", getProductById);

// Update Product
router.put(
  "/:id",
  authMiddleware,
  requireRole("penjual"),
  uploadImage.single("gambar_product"),
  updateProduct
);

// Delete Product
router.delete(
  "/:id",
  authMiddleware,
  requireRole("penjual"),
  deleteProduct
);

export default router;