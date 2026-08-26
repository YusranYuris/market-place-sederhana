import {
    eq,
    and,
    desc,
    gte,
} from "drizzle-orm";

import { db } from "../db/index.js";
import {
    orders,
    orderDetails,
    produk,
} from "../db/schema.js";

// =========== ORDER SERVICE ===========

// ----- Helper ------

const getOrderDetails = async (orderId) => {
    const details = await db
        .select({
            idDetail: orderDetails.idDetail,
            idProduct: orderDetails.idProduct,
            namaProduct: produk.namaProduct,
            gambarProduct: produk.gambarProduct,
            qty: orderDetails.qty,
            hargaSatuan: orderDetails.hargaSatuan,
            subtotal: orderDetails.subtotal,
        })
        .from(orderDetails)
        .innerJoin(
            produk,
            eq(
                orderDetails.idProduct,
                produk.idProduct
            )
        )
        .where(
            eq(orderDetails.idOrder, orderId)
        );

    return details;
};

// ----- Collection ------

// Get Orders
export const getOrders = async (user) => {
    let userOrders = [];

    // ==========================
    // PEMBELI
    // ==========================

    if (user.role === "pembeli") {
        userOrders = await db
            .select()
            .from(orders)
            .where(
                eq(
                    orders.idPembeli,
                    user.idUser
                )
            )
            .orderBy(desc(orders.tglOrder));
    }

    // ==========================
    // PENJUAL
    // ==========================

    else if (user.role === "penjual") {
        userOrders = await db
            .selectDistinct({
                idOrder: orders.idOrder,
                idPembeli: orders.idPembeli,
                tglOrder: orders.tglOrder,
                totalHarga: orders.totalHarga,
                statusOrder: orders.statusOrder,
                alamatPengiriman: orders.alamatPengiriman,
                buktiBayar: orders.buktiBayar,
            })
            .from(orders)
            .innerJoin(
                orderDetails,
                eq(
                    orders.idOrder,
                    orderDetails.idOrder
                )
            )
            .innerJoin(
                produk,
                eq(
                    orderDetails.idProduct,
                    produk.idProduct
                )
            )
            .where(
                eq(
                    produk.idPenjual,
                    user.idUser
                )
            )
            .orderBy(desc(orders.tglOrder));
    }

    else {
        throw new Error("Role user tidak valid");
    }

    // Tambahkan detail produk
    const result = await Promise.all(
        userOrders.map(async (order) => {
            const details = await getOrderDetails(
                order.idOrder
            );

            return {
                ...order,
                details,
            };
        })
    );

    return result;
};

// Create New Order
export const createOrder = async (data, user) => {
    // Pastikan pembeli
    if (user.role !== "pembeli") {
        throw new Error(
            "Hanya pembeli yang dapat membuat order"
        );
    }

    const {
        alamatPengiriman,
        items,
    } = data;

    if (!alamatPengiriman) {
        throw new Error(
            "Alamat pengiriman wajib diisi"
        );
    }

    if (!Array.isArray(items) || items.length === 0) {
        throw new Error(
            "Produk order tidak boleh kosong"
        );
    }

    return await db.transaction(async (tx) => {
        let totalHarga = 0;
        let sellerId = null;

        const orderItems = [];

        // ========================================
        // 1. VALIDASI SEMUA PRODUK
        // ========================================

        for (const item of items) {
            const productId = Number(
                item.idProduct
            );

            const qty = Number(item.qty);

            if (!productId || qty <= 0) {
                throw new Error(
                    "Data produk atau quantity tidak valid"
                );
            }

            const [product] = await tx
                .select()
                .from(produk)
                .where(
                    eq(
                        produk.idProduct,
                        productId
                    )
                )
                .limit(1);

            if (!product) {
                throw new Error(
                    `Produk ${productId} tidak ditemukan`
                );
            }

            if (
                product.statusProduct !==
                "tersedia"
            ) {
                throw new Error(
                    `Produk ${product.namaProduct} sedang tidak tersedia`
                );
            }

            if (product.stok < qty) {
                throw new Error(
                    `Stok ${product.namaProduct} tidak mencukupi`
                );
            }

            // ========================================
            // 2. SATU ORDER = SATU PENJUAL
            // ========================================

            if (sellerId === null) {
                sellerId = product.idPenjual;
            }

            if (
                product.idPenjual !== sellerId
            ) {
                throw new Error(
                    "Satu order hanya dapat berisi produk dari satu penjual"
                );
            }

            const subtotal =
                product.harga * qty;

            totalHarga += subtotal;

            orderItems.push({
                product,
                qty,
                subtotal,
            });
        }

        // ========================================
        // 3. CREATE ORDER
        // ========================================

        const [newOrder] = await tx
            .insert(orders)
            .values({
                idPembeli: user.idUser,
                totalHarga,
                statusOrder: "menunggu_bayar",
                alamatPengiriman,
            })
            .returning();

        // ========================================
        // 4. CREATE ORDER DETAILS
        // ========================================

        for (const item of orderItems) {
            await tx
                .insert(orderDetails)
                .values({
                    idOrder: newOrder.idOrder,
                    idProduct:
                        item.product.idProduct,
                    qty: item.qty,
                    hargaSatuan:
                        item.product.harga,
                    subtotal: item.subtotal,
                });

            // ========================================
            // 5. KURANGI STOK
            // ========================================

            const updatedProduct =
                await tx
                    .update(produk)
                    .set({
                        stok:
                            item.product.stok -
                            item.qty,

                        statusProduct:
                            item.product.stok -
                            item.qty >
                            0
                                ? "tersedia"
                                : "habis",
                    })
                    .where(
                        and(
                            eq(
                                produk.idProduct,
                                item.product
                                    .idProduct
                            ),
                            gte(
                                produk.stok,
                                item.qty
                            )
                        )
                    )
                    .returning({
                        idProduct:
                            produk.idProduct,
                    });

            if (updatedProduct.length === 0) {
                throw new Error(
                    `Stok produk ${item.product.namaProduct} berubah. Silakan coba lagi`
                );
            }
        }

        return {
            ...newOrder,
            details: orderItems.map(
                (item) => ({
                    idProduct:
                        item.product.idProduct,
                    namaProduct:
                        item.product.namaProduct,
                    qty: item.qty,
                    hargaSatuan:
                        item.product.harga,
                    subtotal:
                        item.subtotal,
                })
            ),
        };
    });
};

// ----- Resource ------

// Get Order By ID
export const getOrderById = async (
    id,
    user
) => {
    const orderId = Number(id);

    const [order] = await db
        .select()
        .from(orders)
        .where(
            eq(
                orders.idOrder,
                orderId
            )
        )
        .limit(1);

    if (!order) {
        throw new Error(
            "Order tidak ditemukan"
        );
    }

    const details =
        await getOrderDetails(orderId);

    // ========================================
    // CEK AKSES PEMBELI
    // ========================================

    if (user.role === "pembeli") {
        if (
            order.idPembeli !==
            user.idUser
        ) {
            throw new Error(
                "Anda tidak memiliki akses ke order ini"
            );
        }
    }

    // ========================================
    // CEK AKSES PENJUAL
    // ========================================

    if (user.role === "penjual") {
        const isSellerOrder =
            details.some(
                (detail) => {
                    return true;
                }
            );

        if (!isSellerOrder) {
            throw new Error(
                "Anda tidak memiliki akses ke order ini"
            );
        }

        // Ambil produk dari detail
        for (const detail of details) {
            const [product] =
                await db
                    .select({
                        idPenjual:
                            produk.idPenjual,
                    })
                    .from(produk)
                    .where(
                        eq(
                            produk.idProduct,
                            detail.idProduct
                        )
                    )
                    .limit(1);

            if (
                product &&
                product.idPenjual ===
                    user.idUser
            ) {
                return {
                    ...order,
                    details,
                };
            }
        }

        throw new Error(
            "Anda tidak memiliki akses ke order ini"
        );
    }

    return {
        ...order,
        details,
    };
};

// ----- Order Actions ------

// Upload Payment Proof
export const uploadPaymentProof = async (
    id,
    file,
    user
) => {
    const orderId = Number(id);

    if (!file) {
        throw new Error(
            "Bukti pembayaran wajib diupload"
        );
    }

    const [order] = await db
        .select()
        .from(orders)
        .where(
            eq(
                orders.idOrder,
                orderId
            )
        )
        .limit(1);

    if (!order) {
        throw new Error(
            "Order tidak ditemukan"
        );
    }

    // Hanya pembeli pemilik order
    if (
        order.idPembeli !==
        user.idUser
    ) {
        throw new Error(
            "Anda tidak memiliki akses ke order ini"
        );
    }

    if (
        order.statusOrder !==
        "menunggu_bayar"
    ) {
        throw new Error(
            "Order tidak dapat menerima bukti pembayaran"
        );
    }

    /*
     * Sementara menggunakan lokasi file dari multer.
     *
     * Nanti ketika storage bucket sudah
     * diintegrasikan, bagian ini diganti
     * dengan URL hasil upload bucket.
     */
    const buktiBayar =
        file.path ||
        file.location ||
        file.filename;

    if (!buktiBayar) {
        throw new Error(
            "File bukti pembayaran tidak valid"
        );
    }

    const [updatedOrder] =
        await db
            .update(orders)
            .set({
                buktiBayar,
                statusOrder:
                    "menunggu_konfirmasi",
            })
            .where(
                eq(
                    orders.idOrder,
                    orderId
                )
            )
            .returning();

    return updatedOrder;
};

// Accept Order
export const acceptOrder = async (
    id,
    user
) => {
    if (user.role !== "penjual") {
        throw new Error(
            "Hanya penjual yang dapat menerima order"
        );
    }

    const orderId = Number(id);

    const [order] = await db
        .select()
        .from(orders)
        .where(
            eq(
                orders.idOrder,
                orderId
            )
        )
        .limit(1);

    if (!order) {
        throw new Error(
            "Order tidak ditemukan"
        );
    }

    if (
        order.statusOrder !==
        "menunggu_konfirmasi"
    ) {
        throw new Error(
            "Order belum dapat diterima"
        );
    }

    // Pastikan order milik produk seller
    const details =
        await getOrderDetails(orderId);

    let sellerOwnsOrder = false;

    for (const detail of details) {
        const [product] =
            await db
                .select({
                    idPenjual:
                        produk.idPenjual,
                })
                .from(produk)
                .where(
                    eq(
                        produk.idProduct,
                        detail.idProduct
                    )
                )
                .limit(1);

        if (
            product &&
            product.idPenjual ===
                user.idUser
        ) {
            sellerOwnsOrder = true;
            break;
        }
    }

    if (!sellerOwnsOrder) {
        throw new Error(
            "Anda tidak memiliki akses ke order ini"
        );
    }

    const [updatedOrder] =
        await db
            .update(orders)
            .set({
                statusOrder: "diproses",
            })
            .where(
                eq(
                    orders.idOrder,
                    orderId
                )
            )
            .returning();

    return updatedOrder;
};

// Reject Order
export const rejectOrder = async (
    id,
    user
) => {
    if (user.role !== "penjual") {
        throw new Error(
            "Hanya penjual yang dapat menolak order"
        );
    }

    const orderId = Number(id);

    const [order] = await db
        .select()
        .from(orders)
        .where(
            eq(
                orders.idOrder,
                orderId
            )
        )
        .limit(1);

    if (!order) {
        throw new Error(
            "Order tidak ditemukan"
        );
    }

    if (
        order.statusOrder !==
        "menunggu_konfirmasi"
    ) {
        throw new Error(
            "Order tidak dapat ditolak"
        );
    }

    const details =
        await getOrderDetails(orderId);

    let sellerOwnsOrder = false;

    for (const detail of details) {
        const [product] =
            await db
                .select({
                    idPenjual:
                        produk.idPenjual,
                })
                .from(produk)
                .where(
                    eq(
                        produk.idProduct,
                        detail.idProduct
                    )
                )
                .limit(1);

        if (
            product &&
            product.idPenjual ===
                user.idUser
        ) {
            sellerOwnsOrder = true;
            break;
        }
    }

    if (!sellerOwnsOrder) {
        throw new Error(
            "Anda tidak memiliki akses ke order ini"
        );
    }

    const [updatedOrder] =
        await db
            .update(orders)
            .set({
                statusOrder: "dibatalkan",
            })
            .where(
                eq(
                    orders.idOrder,
                    orderId
                )
            )
            .returning();

    return updatedOrder;
};

// Update Order Status
export const updateOrderStatus = async (
    id,
    data,
    user
) => {
    if (user.role !== "penjual") {
        throw new Error(
            "Hanya penjual yang dapat mengubah status order"
        );
    }

    const orderId = Number(id);

    const {
        statusOrder,
    } = data;

    const allowedStatuses = [
        "diproses",
        "dikirim",
        "selesai",
    ];

    if (
        !allowedStatuses.includes(
            statusOrder
        )
    ) {
        throw new Error(
            "Status order tidak valid"
        );
    }

    const [order] = await db
        .select()
        .from(orders)
        .where(
            eq(
                orders.idOrder,
                orderId
            )
        )
        .limit(1);

    if (!order) {
        throw new Error(
            "Order tidak ditemukan"
        );
    }

    // Validasi urutan status
    const statusFlow = {
        diproses: [
            "dikirim",
        ],
        dikirim: [
            "selesai",
        ],
    };

    const allowedNextStatuses =
        statusFlow[
            order.statusOrder
        ];

    if (
        !allowedNextStatuses ||
        !allowedNextStatuses.includes(
            statusOrder
        )
    ) {
        throw new Error(
            `Order dengan status ${order.statusOrder} tidak dapat diubah menjadi ${statusOrder}`
        );
    }

    // Pastikan seller memiliki order
    const details =
        await getOrderDetails(orderId);

    let sellerOwnsOrder = false;

    for (const detail of details) {
        const [product] =
            await db
                .select({
                    idPenjual:
                        produk.idPenjual,
                })
                .from(produk)
                .where(
                    eq(
                        produk.idProduct,
                        detail.idProduct
                    )
                )
                .limit(1);

        if (
            product &&
            product.idPenjual ===
                user.idUser
        ) {
            sellerOwnsOrder = true;
            break;
        }
    }

    if (!sellerOwnsOrder) {
        throw new Error(
            "Anda tidak memiliki akses ke order ini"
        );
    }

    const [updatedOrder] =
        await db
            .update(orders)
            .set({
                statusOrder,
            })
            .where(
                eq(
                    orders.idOrder,
                    orderId
                )
            )
            .returning();

    return updatedOrder;
};