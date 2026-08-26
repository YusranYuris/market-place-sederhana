import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

import ProductImage from "./ProductImage.jsx";
import { useAuthStore } from "../stores/authStore.js";
import { useCartStore } from "../stores/cartStore.js";
import { formatCurrency } from "../utils/format.js";

import "./ProductCard.css";

function ProductCard({ product }) {
  const isPembeli = useAuthStore((state) => state.isPembeli());
  const addItem = useCartStore((state) => state.addItem);

  const habis = product.statusProduct === "habis";

  const handleAdd = (event) => {
    event.preventDefault();

    if (!isPembeli) {
      toast.error("Login sebagai pembeli untuk menambah ke keranjang");
      return;
    }

    addItem(product, 1);
    toast.success("Ditambahkan ke keranjang");
  };

  return (
    <Link to={`/produk/${product.idProduct}`} className="product-card">
      <div className="product-card-media">
        <ProductImage
          src={product.gambarProduct}
          alt={product.namaProduct}
          className="product-card-image"
        />
        {habis && <span className="product-card-tag">Habis</span>}
      </div>

      <p className="product-card-category">{product.kategori}</p>
      <h3 className="product-card-name">{product.namaProduct}</h3>

      <div className="product-card-footer">
        <span className="product-card-price">
          {formatCurrency(product.harga)}
        </span>

        <button
          type="button"
          className="product-card-add"
          onClick={handleAdd}
          disabled={habis}
          title="Tambah ke keranjang"
        >
          <Plus size={16} />
        </button>
      </div>
    </Link>
  );
}

export default ProductCard;
