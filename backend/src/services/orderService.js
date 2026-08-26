import { eq, inArray, sql } from "drizzle-orm";

import { db } from "../db/index.js";

import {
  orders,
  orderDetails,
  products,
} from "../db/schema.js";

import {
  uploadFile,
  getSignedUrl,
} from "./storageService.js";

// =========== ORDER SERVICE ===========

// ----- Helper ------

// Ambil semua id order yang memuat produk milik seller
const getSellerOrderIds = async (sellerId) => {
  const rows = await db
    .select({
      idOrder: orderDetails.idOrder,
    })
    .from(orderDetails)
    .innerJoin(
      products,
      eq(orderDetails.idProduct, products.idProduct)
    )
    .where(eq(products.idPenjual, sellerId));

  return [
    ...new Set(rows.map((row) => row.idOrder)),
  ];
};

const verifySellerOrder = async (
  sellerId,
  orderId
) => {
  const orderIds = await getSellerOrderIds(sellerId);

  if (!orderIds.includes(orderId)) {
    throw new Error(
      "Anda tidak memiliki akses ke order ini"
    );
  }

  return true;
};

// Bukti bayar disimpan sebagai path, dikirim sebagai signed URL
const withPaymentProofUrl = async (order) => {
  if (!order.buktiBayar) {
    return { ...order, buktiBayar: null };
  }

  try {
    return {
      ...order,
      buktiBayar: await getSignedUrl(
        "payment-proofs",
        order.buktiBayar
      ),
    };
  } catch (error) {
    console.error(
      "Gagal membuat signed URL bukti bayar:",
      error.message
    );

    return { ...order, buktiBayar: null };
  }
};

// ----- Buyer ------

// Create New Order
export const createOrder = async (
  buyerId,
  data
) => {
  const {
    items,
    alamatPengiriman,
  } = data;

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(
      "Order harus memiliki produk"
    );
  }

  if (!alamatPengiriman) {
    throw new Error(
      "Alamat pengiriman wajib diisi"
    );
  }

  return await db.transaction(async (tx) => {
    let totalHarga = 0;

    const detailRows = [];

    for (const item of items) {
      const idProduct = Number(item.idProduct);
      const qty = Number(item.qty);

      if (!idProduct || Number.isNaN(qty) || qty <= 0) {
        throw new Error("Item order tidak valid");
      }

      const found = await tx
        .select()
        .from(products)
        .where(eq(products.idProduct, idProduct));

      if (found.length === 0) {
        throw new Error(
          `Produk dengan id ${idProduct} tidak ditemukan`
        );
      }

      const product = found[0];

      if (product.stok < qty) {
        throw new Error(
          `Stok produk ${product.namaProduct} tidak mencukupi`
        );
      }

      // Harga diambil dari database, bukan dari client
      const hargaSatuan = Number(product.harga);
      const subtotal = hargaSatuan * qty;

      totalHarga += subtotal;

      detailRows.push({
        idProduct,
        qty,
        hargaSatuan: hargaSatuan.toFixed(2),
        subtotal: subtotal.toFixed(2),
      });

      // Kurangi stok
      const sisaStok = product.stok - qty;

      await tx
        .update(products)
        .set({
          stok: sisaStok,
          statusProduct:
            sisaStok > 0 ? "tersedia" : "habis",
        })
        .where(eq(products.idProduct, idProduct));
    }

    const [order] = await tx
      .insert(orders)
      .values({
        idPembeli: buyerId,
        totalHarga: totalHarga.toFixed(2),
        alamatPengiriman,
        statusOrder: "menunggu_bayar",
      })
      .returning();

    const details = await tx
      .insert(orderDetails)
      .values(
        detailRows.map((row) => ({
          ...row,
          idOrder: order.idOrder,
        }))
      )
      .returning();

    return {
      ...order,
      items: details,
    };
  });
};

// Get My Orders
export const getMyOrders = async (
  buyerId
) => {
  return await db
    .select()
    .from(orders)
    .where(eq(orders.idPembeli, buyerId));
};

// ----- Resource ------

// Get Order By ID
export const getOrderById = async (
  userId,
  role,
  orderId
) => {
  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.idOrder, orderId));

  if (result.length === 0) {
    throw new Error("Order tidak ditemukan");
  }

  const order = result[0];

  // Pembeli harus memiliki order, penjual harus punya produk di order ini
  if (role === "penjual") {
    await verifySellerOrder(userId, orderId);
  } else if (order.idPembeli !== userId) {
    throw new Error(
      "Anda tidak memiliki akses ke order ini"
    );
  }

  const details = await db
    .select({
      idDetail: orderDetails.idDetail,
      idOrder: orderDetails.idOrder,
      idProduct: orderDetails.idProduct,
      namaProduct: products.namaProduct,
      qty: orderDetails.qty,
      hargaSatuan: orderDetails.hargaSatuan,
      subtotal: orderDetails.subtotal,
    })
    .from(orderDetails)
    .innerJoin(
      products,
      eq(orderDetails.idProduct, products.idProduct)
    )
    .where(eq(orderDetails.idOrder, orderId));

  return {
    ...(await withPaymentProofUrl(order)),
    items: details,
  };
};

// Upload Payment Proof
export const uploadPaymentProof = async (
  buyerId,
  orderId,
  file
) => {
  if (!file) {
    throw new Error(
      "Bukti pembayaran wajib diupload"
    );
  }

  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.idOrder, orderId));

  if (result.length === 0) {
    throw new Error(
      "Order tidak ditemukan"
    );
  }

  const order = result[0];

  if (order.idPembeli !== buyerId) {
    throw new Error(
      "Anda tidak memiliki akses ke order ini"
    );
  }

  if (order.statusOrder !== "menunggu_bayar") {
    throw new Error(
      "Bukti pembayaran hanya bisa diupload saat order menunggu pembayaran"
    );
  }

  const uploaded = await uploadFile({
    bucket: "payment-proofs",
    folder: orderId.toString(),
    file,
  });

  const [updatedOrder] = await db
    .update(orders)
    .set({
      buktiBayar: uploaded.path,
      statusOrder: "menunggu_konfirmasi",
    })
    .where(eq(orders.idOrder, orderId))
    .returning();

  return await withPaymentProofUrl(updatedOrder);
};

// ----- Seller ------

// Get Seller Orders
export const getSellerOrders = async (
  sellerId
) => {
  const orderIds = await getSellerOrderIds(sellerId);

  if (orderIds.length === 0) {
    return [];
  }

  return await db
    .select()
    .from(orders)
    .where(inArray(orders.idOrder, orderIds));
};

// Accept Order
export const acceptOrder = async (
  sellerId,
  orderId
) => {
  await verifySellerOrder(sellerId, orderId);

  const current = await db
    .select()
    .from(orders)
    .where(eq(orders.idOrder, orderId));

  if (current[0].statusOrder !== "menunggu_konfirmasi") {
    throw new Error(
      "Order hanya bisa diterima saat menunggu konfirmasi"
    );
  }

  const [order] = await db
    .update(orders)
    .set({
      statusOrder: "diproses",
    })
    .where(eq(orders.idOrder, orderId))
    .returning();

  return order;
};

// Reject Order
export const rejectOrder = async (
  sellerId,
  orderId
) => {
  await verifySellerOrder(sellerId, orderId);

  return await db.transaction(async (tx) => {
    const current = await tx
      .select()
      .from(orders)
      .where(eq(orders.idOrder, orderId));

    const finalStatus = [
      "selesai",
      "dibatalkan",
    ];

    if (finalStatus.includes(current[0].statusOrder)) {
      throw new Error(
        "Order sudah selesai atau sudah dibatalkan"
      );
    }

    // Kembalikan stok produk
    const details = await tx
      .select()
      .from(orderDetails)
      .where(eq(orderDetails.idOrder, orderId));

    for (const detail of details) {
      await tx
        .update(products)
        .set({
          stok: sql`${products.stok} + ${detail.qty}`,
          statusProduct: "tersedia",
        })
        .where(
          eq(products.idProduct, detail.idProduct)
        );
    }

    const [order] = await tx
      .update(orders)
      .set({
        statusOrder: "dibatalkan",
      })
      .where(eq(orders.idOrder, orderId))
      .returning();

    return order;
  });
};

// Update Order Status
export const updateOrderStatus = async (
  sellerId,
  orderId,
  status
) => {
  await verifySellerOrder(sellerId, orderId);

  const allowedStatuses = [
    "diproses",
    "dikirim",
    "selesai",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error(
      "Status order tidak valid"
    );
  }

  const [order] = await db
    .update(orders)
    .set({
      statusOrder: status,
    })
    .where(eq(orders.idOrder, orderId))
    .returning();

  return order;
};
