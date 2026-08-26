ALTER TABLE "produk" RENAME TO "products";--> statement-breakpoint
ALTER TABLE "order_detail" DROP CONSTRAINT "order_detail_id_product_produk_id_product_fk";
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "produk_id_penjual_users_id_user_fk";
--> statement-breakpoint
ALTER TABLE "order_detail" ADD CONSTRAINT "order_detail_id_product_products_id_product_fk" FOREIGN KEY ("id_product") REFERENCES "public"."products"("id_product") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_id_penjual_users_id_user_fk" FOREIGN KEY ("id_penjual") REFERENCES "public"."users"("id_user") ON DELETE restrict ON UPDATE cascade;