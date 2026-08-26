import * as productService from "../services/productService.js";

// =========== PRODUCT CONTROLLER ===========

// ----- Collection ------

// Get All Products
export const getProducts = async (req, res) => {
  try {
    const products = await productService.getProducts({
      idPenjual: req.query.idPenjual,
      kategori: req.query.kategori,
    });

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

// Get Product By ID
export const getProductById = async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        success: false,
        message: "ID produk tidak valid",
      });
    }

    const product = await productService.getProductById(
      productId
    );

    return res.status(200).json({
      success: true,
      message: "Detail produk berhasil diambil",
      data: product,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// Create New Product
export const createProduct = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const product = await productService.createProduct(
      sellerId,
      req.body,
      req.file
    );

    return res.status(201).json({
      success: true,
      message: "Produk berhasil ditambahkan",
      data: product,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        success: false,
        message: "ID produk tidak valid",
      });
    }

    const product = await productService.updateProduct(
      sellerId,
      productId,
      req.body,
      req.file
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
    const sellerId = req.user.id;
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        success: false,
        message: "ID produk tidak valid",
      });
    }

    await productService.deleteProduct(
      sellerId,
      productId
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
