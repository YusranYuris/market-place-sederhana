import { and, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { products } from "../db/schema.js";

import {
  uploadFile,
  getPublicUrl,
  deleteFile,
} from "./storageService.js";

// =========== PRODUCT SERVICE ===========

// Map stored file path to public URL
const withImageUrl = (product) => ({
  ...product,
  gambarProduct: product.gambarProduct
    ? getPublicUrl(
        "product-images",
        product.gambarProduct
      )
    : null,
});

// Status produk mengikuti stok
const statusFromStok = (stok) =>
  Number(stok) > 0 ? "tersedia" : "habis";

// ----- Collection ------

// Get All Products
export const getProducts = async (filter = {}) => {
  const conditions = [];

  if (filter.idPenjual) {
    conditions.push(
      eq(products.idPenjual, Number(filter.idPenjual))
    );
  }

  if (filter.kategori) {
    conditions.push(
      eq(products.kategori, filter.kategori)
    );
  }

  const query = db.select().from(products);

  const result =
    conditions.length > 0
      ? await query.where(and(...conditions))
      : await query;

  return result.map(withImageUrl);
};

// Create New Product
export const createProduct = async (
  sellerId,
  data,
  file
) => {
  const {
    namaProduct,
    deskripsi,
    harga,
    stok,
    kategori,
  } = data;

  if (!namaProduct) {
    throw new Error("Nama produk wajib diisi");
  }

  if (!deskripsi) {
    throw new Error("Deskripsi produk wajib diisi");
  }

  if (harga === undefined || harga === "") {
    throw new Error("Harga produk wajib diisi");
  }

  if (Number.isNaN(Number(harga)) || Number(harga) < 0) {
    throw new Error("Harga produk tidak valid");
  }

  if (!kategori) {
    throw new Error("Kategori produk wajib diisi");
  }

  const jumlahStok =
    stok === undefined || stok === "" ? 0 : Number(stok);

  if (Number.isNaN(jumlahStok) || jumlahStok < 0) {
    throw new Error("Stok produk tidak valid");
  }

  let gambarProduct = null;

  // Upload product image
  if (file) {
    const uploaded = await uploadFile({
      bucket: "product-images",
      folder: sellerId.toString(),
      file,
    });

    gambarProduct = uploaded.path;
  }

  const [product] = await db
    .insert(products)
    .values({
      idPenjual: sellerId,
      namaProduct,
      deskripsi,
      harga: Number(harga).toFixed(2),
      stok: jumlahStok,
      kategori,
      gambarProduct,
      statusProduct: statusFromStok(jumlahStok),
    })
    .returning();

  return withImageUrl(product);
};

// ----- Resource ------

// Get Product By ID
export const getProductById = async (
  productId
) => {
  const result = await db
    .select()
    .from(products)
    .where(eq(products.idProduct, productId));

  if (result.length === 0) {
    throw new Error("Produk tidak ditemukan");
  }

  return withImageUrl(result[0]);
};

// Update Product
export const updateProduct = async (
  sellerId,
  productId,
  data,
  file
) => {
  const result = await db
    .select()
    .from(products)
    .where(eq(products.idProduct, productId));

  if (result.length === 0) {
    throw new Error("Produk tidak ditemukan");
  }

  const product = result[0];

  // Make sure seller owns the product
  if (product.idPenjual !== sellerId) {
    throw new Error(
      "Anda tidak memiliki akses ke produk ini"
    );
  }

  const updateData = {};

  if (data.namaProduct !== undefined) {
    updateData.namaProduct = data.namaProduct;
  }

  if (data.deskripsi !== undefined) {
    updateData.deskripsi = data.deskripsi;
  }

  if (data.harga !== undefined) {
    if (
      Number.isNaN(Number(data.harga)) ||
      Number(data.harga) < 0
    ) {
      throw new Error("Harga produk tidak valid");
    }

    updateData.harga = Number(data.harga).toFixed(2);
  }

  if (data.kategori !== undefined) {
    updateData.kategori = data.kategori;
  }

  if (data.stok !== undefined) {
    const jumlahStok = Number(data.stok);

    if (Number.isNaN(jumlahStok) || jumlahStok < 0) {
      throw new Error("Stok produk tidak valid");
    }

    updateData.stok = jumlahStok;
    updateData.statusProduct =
      statusFromStok(jumlahStok);
  }

  // Upload new image
  if (file) {
    const uploaded = await uploadFile({
      bucket: "product-images",
      folder: sellerId.toString(),
      file,
    });

    updateData.gambarProduct = uploaded.path;
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error("Tidak ada data yang diperbarui");
  }

  const [updatedProduct] = await db
    .update(products)
    .set(updateData)
    .where(eq(products.idProduct, productId))
    .returning();

  // Delete old image
  if (file && product.gambarProduct) {
    try {
      await deleteFile(
        "product-images",
        product.gambarProduct
      );
    } catch (error) {
      console.error(
        "Gagal menghapus gambar lama:",
        error.message
      );
    }
  }

  return withImageUrl(updatedProduct);
};

// Delete Product
export const deleteProduct = async (
  sellerId,
  productId
) => {
  const result = await db
    .select()
    .from(products)
    .where(eq(products.idProduct, productId));

  if (result.length === 0) {
    throw new Error("Produk tidak ditemukan");
  }

  const product = result[0];

  if (product.idPenjual !== sellerId) {
    throw new Error(
      "Anda tidak memiliki akses ke produk ini"
    );
  }

  try {
    await db
      .delete(products)
      .where(eq(products.idProduct, productId));
  } catch (error) {
    // FK restrict: produk sudah pernah masuk order
    throw new Error(
      "Produk tidak bisa dihapus karena sudah pernah dipesan"
    );
  }

  // Delete image from storage
  if (product.gambarProduct) {
    try {
      await deleteFile(
        "product-images",
        product.gambarProduct
      );
    } catch (error) {
      console.error(
        "Gagal menghapus gambar produk:",
        error.message
      );
    }
  }

  return true;
};
