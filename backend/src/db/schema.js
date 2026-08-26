import {
  pgEnum,
  pgTable,
  serial,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

// Enum for some attributes
export const roleEnum = pgEnum("role", [
  "pembeli",
  "penjual",
]);

export const userStatusEnum = pgEnum("status_user", [
  "aktif",
  "tidak_aktif",
]);

export const productStatusEnum = pgEnum("status_product", [
  "tersedia",
  "habis",
]);

export const orderStatusEnum = pgEnum("status_order", [
  "menunggu_bayar",
  "menunggu_konfirmasi",
  "diproses",
  "dikirim",
  "selesai",
  "dibatalkan",
]);

// Users Table
export const users = pgTable(
  "users",
  {
    idUser: serial("id_user").primaryKey(),

    namaUser: varchar("nama_user", {
      length: 100,
    }).notNull(),

    email: varchar("email", {
      length: 100,
    }).notNull(),

    password: varchar("password", {
      length: 255,
    }).notNull(),

    role: roleEnum("role").notNull(),

    tglDaftar: timestamp("tgl_daftar", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    fotoProfil: varchar("foto_profil", {
      length: 255,
    }),

    statusUser: userStatusEnum("status_user")
      .default("aktif")
      .notNull(),
  },

  (table) => ({
    emailUnique: uniqueIndex("users_email_unique").on(
      table.email
    ),
  })
);

// Product Table
export const produk = pgTable("produk", {
  idProduct: serial("id_product").primaryKey(),

  idPenjual: integer("id_penjual")
    .notNull()
    .references(() => users.idUser, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),

  namaProduct: varchar("nama_product", {
    length: 100,
  }).notNull(),

  deskripsi: text("deskripsi").notNull(),

  harga: numeric("harga", {
    precision: 12,
    scale: 2,
  }).notNull(),

  stok: integer("stok")
    .notNull()
    .default(0),

  kategori: varchar("kategori", {
    length: 50,
  }).notNull(),

  gambarProduct: varchar("gambar_product", {
    length: 255,
  }),

  statusProduct: productStatusEnum("status_product")
    .default("tersedia")
    .notNull(),
});

// Order Table
export const orders = pgTable("orders", {
  idOrder: serial("id_order").primaryKey(),

  idPembeli: integer("id_pembeli")
    .notNull()
    .references(() => users.idUser, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),

  tglOrder: timestamp("tgl_order", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  totalHarga: numeric("total_harga", {
    precision: 12,
    scale: 2,
  }).notNull(),

  statusOrder: orderStatusEnum("status_order")
    .default("menunggu_bayar")
    .notNull(),

  alamatPengiriman: varchar("alamat_pengiriman", {
    length: 300,
  }).notNull(),

  buktiBayar: varchar("bukti_bayar", {
    length: 255,
  }),
});

// Order Detail Table
export const orderDetails = pgTable("order_detail", {
  idDetail: serial("id_detail").primaryKey(),

  idOrder: integer("id_order")
    .notNull()
    .references(() => orders.idOrder, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),

  idProduct: integer("id_product")
    .notNull()
    .references(() => produk.idProduct, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),

  qty: integer("qty")
    .notNull(),

  hargaSatuan: numeric("harga_satuan", {
    precision: 12,
    scale: 2,
  }).notNull(),

  subtotal: numeric("subtotal", {
    precision: 12,
    scale: 2,
  }).notNull(),
});

// Table Relations
export const usersRelations = relations(
  users,
  ({ many }) => ({
    produk: many(produk),
    orders: many(orders),
  })
);

export const produkRelations = relations(
  produk,
  ({ one, many }) => ({
    penjual: one(users, {
      fields: [produk.idPenjual],
      references: [users.idUser],
    }),

    orderDetails: many(orderDetails),
  })
);

export const ordersRelations = relations(
  orders,
  ({ one, many }) => ({
    pembeli: one(users, {
      fields: [orders.idPembeli],
      references: [users.idUser],
    }),

    orderDetails: many(orderDetails),
  })
);

export const orderDetailsRelations = relations(
  orderDetails,
  ({ one }) => ({
    order: one(orders, {
      fields: [orderDetails.idOrder],
      references: [orders.idOrder],
    }),

    product: one(produk, {
      fields: [orderDetails.idProduct],
      references: [produk.idProduct],
    }),
  })
);