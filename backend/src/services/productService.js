import {
    eq,
    and,
    ilike,
} from "drizzle-orm";

import { db } from "../db/index.js";
import { products } from "../db/schema.js";

// =========== PRODUCT SERVICE ===========

// ----- Collection ------

// Get All Products
export const getProducts = async (query = {}) => {
    const {
        search,
        kategori,
    } = query;

    const conditions = [
        eq(products.statusProduct, "tersedia"),
    ];

    // Search berdasarkan nama products
    if (search) {
        conditions.push(
            ilike(products.namaProduct, `%${search}%`)
        );
    }

    // Filter kategori
    if (kategori) {
        conditions.push(
            eq(products.kategori, kategori)
        );
    }

    const products = await db
        .select()
        .from(products)
        .where(and(...conditions))
        .orderBy(products.idProduct);

    return products;
};

// Create New Product
export const createProduct = async (data, user) => {
    const {
        namaProduct,
        deskripsi,
        harga,
        stok,
        kategori,
        gambarProduct,
    } = data;

    // Pastikan user adalah penjual
    if (user.role !== "penjual") {
        throw new Error(
            "Hanya penjual yang dapat menambahkan products"
        );
    }

    if (!namaProduct || !harga || stok === undefined) {
        throw new Error(
            "Nama products, harga, dan stok wajib diisi"
        );
    }

    if (harga < 0) {
        throw new Error("Harga tidak boleh negatif");
    }

    if (stok < 0) {
        throw new Error("Stok tidak boleh negatif");
    }

    const statusProduct =
        Number(stok) > 0
            ? "tersedia"
            : "habis";

    const [newProduct] = await db
        .insert(products)
        .values({
            idPenjual: user.idUser,
            namaProduct,
            deskripsi,
            harga: Number(harga),
            stok: Number(stok),
            kategori,
            gambarProduct,
            statusProduct,
        })
        .returning();

    return newProduct;
};

// ----- Resource ------

// Get Product By ID
export const getProductById = async (id) => {
    const [product] = await db
        .select()
        .from(products)
        .where(eq(products.idProduct, Number(id)))
        .limit(1);

    if (!product) {
        throw new Error("products tidak ditemukan");
    }

    return product;
};

// Update Product
export const updateProduct = async (id, data, user) => {
    const productId = Number(id);

    // Cari products
    const [existingProduct] = await db
        .select()
        .from(products)
        .where(eq(products.idProduct, productId))
        .limit(1);

    if (!existingProduct) {
        throw new Error("products tidak ditemukan");
    }

    // Pastikan pemilik products
    if (existingProduct.idPenjual !== user.idUser) {
        throw new Error(
            "Anda tidak memiliki akses ke products ini"
        );
    }

    const {
        namaProduct,
        deskripsi,
        harga,
        stok,
        kategori,
        gambarProduct,
    } = data;

    const updateData = {};

    if (namaProduct !== undefined) {
        updateData.namaProduct = namaProduct;
    }

    if (deskripsi !== undefined) {
        updateData.deskripsi = deskripsi;
    }

    if (harga !== undefined) {
        if (Number(harga) < 0) {
            throw new Error("Harga tidak boleh negatif");
        }

        updateData.harga = Number(harga);
    }

    if (stok !== undefined) {
        if (Number(stok) < 0) {
            throw new Error("Stok tidak boleh negatif");
        }

        updateData.stok = Number(stok);

        updateData.statusProduct =
            Number(stok) > 0
                ? "tersedia"
                : "habis";
    }

    if (kategori !== undefined) {
        updateData.kategori = kategori;
    }

    if (gambarProduct !== undefined) {
        updateData.gambarProduct = gambarProduct;
    }

    if (Object.keys(updateData).length === 0) {
        throw new Error("Tidak ada data yang diperbarui");
    }

    const [updatedProduct] = await db
        .update(products)
        .set(updateData)
        .where(eq(products.idProduct, productId))
        .returning();

    return updatedProduct;
};

// Delete Product
export const deleteProduct = async (id, user) => {
    const productId = Number(id);

    const [existingProduct] = await db
        .select()
        .from(products)
        .where(eq(products.idProduct, productId))
        .limit(1);

    if (!existingProduct) {
        throw new Error("products tidak ditemukan");
    }

    // Pastikan pemilik products
    if (existingProduct.idPenjual !== user.idUser) {
        throw new Error(
            "Anda tidak memiliki akses ke products ini"
        );
    }

    await db
        .delete(products)
        .where(eq(products.idProduct, productId));

    return true;
};