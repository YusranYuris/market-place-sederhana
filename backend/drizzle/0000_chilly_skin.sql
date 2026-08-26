CREATE TYPE "public"."status_order" AS ENUM('menunggu_bayar', 'menunggu_konfirmasi', 'diproses', 'dikirim', 'selesai', 'dibatalkan');--> statement-breakpoint
CREATE TYPE "public"."status_product" AS ENUM('tersedia', 'habis');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('pembeli', 'penjual');--> statement-breakpoint
CREATE TYPE "public"."status_user" AS ENUM('aktif', 'tidak_aktif');--> statement-breakpoint
CREATE TABLE "order_detail" (
	"id_detail" serial PRIMARY KEY NOT NULL,
	"id_order" integer NOT NULL,
	"id_product" integer NOT NULL,
	"qty" integer NOT NULL,
	"harga_satuan" numeric(12, 2) NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id_order" serial PRIMARY KEY NOT NULL,
	"id_pembeli" integer NOT NULL,
	"tgl_order" timestamp with time zone DEFAULT now() NOT NULL,
	"total_harga" numeric(12, 2) NOT NULL,
	"status_order" "status_order" DEFAULT 'menunggu_bayar' NOT NULL,
	"alamat_pengiriman" varchar(300) NOT NULL,
	"bukti_bayar" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "produk" (
	"id_product" serial PRIMARY KEY NOT NULL,
	"id_penjual" integer NOT NULL,
	"nama_product" varchar(100) NOT NULL,
	"deskripsi" text NOT NULL,
	"harga" numeric(12, 2) NOT NULL,
	"stok" integer DEFAULT 0 NOT NULL,
	"kategori" varchar(50) NOT NULL,
	"gambar_product" varchar(255),
	"status_product" "status_product" DEFAULT 'tersedia' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id_user" serial PRIMARY KEY NOT NULL,
	"nama_user" varchar(100) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "role" NOT NULL,
	"tgl_daftar" timestamp with time zone DEFAULT now() NOT NULL,
	"foto_profil" varchar(255),
	"status_user" "status_user" DEFAULT 'aktif' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_detail" ADD CONSTRAINT "order_detail_id_order_orders_id_order_fk" FOREIGN KEY ("id_order") REFERENCES "public"."orders"("id_order") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "order_detail" ADD CONSTRAINT "order_detail_id_product_produk_id_product_fk" FOREIGN KEY ("id_product") REFERENCES "public"."produk"("id_product") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_id_pembeli_users_id_user_fk" FOREIGN KEY ("id_pembeli") REFERENCES "public"."users"("id_user") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "produk" ADD CONSTRAINT "produk_id_penjual_users_id_user_fk" FOREIGN KEY ("id_penjual") REFERENCES "public"."users"("id_user") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");