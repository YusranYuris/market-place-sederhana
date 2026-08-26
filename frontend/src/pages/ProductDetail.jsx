import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Minus, Plus } from "lucide-react";
import toast from "react-hot-toast";

import ProductImage from "../components/ProductImage.jsx";
import { useAuthStore } from "../stores/authStore.js";
import { useCartStore } from "../stores/cartStore.js";
import * as productService from "../services/productService.js";
import { formatCurrency } from "../utils/format.js";

import "./ProductDetail.css";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isPembeli = useAuthStore((state) => state.isPembeli());
  const addItem = useCartStore((state) => state.addItem);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    let cancelled = false;

    productService
      .getProductById(id)
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
        setError("");
        setQty(1);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <p className="container page state-box">Memuat produk...</p>;
  }

  if (error || !product) {
    return (
      <div className="container page state-box">
        <p>{error || "Produk tidak ditemukan"}</p>
        <p style={{ marginTop: 16 }}>
          <Link to="/">Kembali ke katalog</Link>
        </p>
      </div>
    );
  }

  const habis = product.statusProduct === "habis";

  const handleQty = (delta) => {
    setQty((current) =>
      Math.min(Math.max(current + delta, 1), product.stok)
    );
  };

  const requireLogin = () => {
    if (!isPembeli) {
      toast.error("Login sebagai pembeli untuk membeli produk ini");
      return true;
    }
    return false;
  };

  const handleAddToCart = () => {
    if (requireLogin()) return;

    addItem(product, qty);
    toast.success("Ditambahkan ke keranjang");
  };

  const handleBuyNow = () => {
    if (requireLogin()) return;

    addItem(product, qty);
    navigate("/keranjang");
  };

  return (
    <div className="container page">
      <Link to="/" className="back-link">
        <ChevronLeft size={16} />
        Kembali Belanja
      </Link>

      <div className="pd-layout">
        <ProductImage
          src={product.gambarProduct}
          alt={product.namaProduct}
          className="pd-image"
        />

        <div className="pd-info">
          <p className="pd-category">{product.kategori}</p>
          <h1 className="pd-name">{product.namaProduct}</h1>
          <p className="pd-price">{formatCurrency(product.harga)}</p>

          <span
            className={`badge ${habis ? "badge-red" : "badge-green"} pd-stock-badge`}
          >
            {habis ? "Stok habis" : `Stok: ${product.stok}`}
          </span>

          <p className="pd-desc">{product.deskripsi}</p>

          {!habis && (
            <div className="pd-qty">
              <span className="field-label">Jumlah</span>
              <div className="qty-stepper">
                <button
                  type="button"
                  onClick={() => handleQty(-1)}
                  disabled={qty <= 1}
                >
                  <Minus size={14} />
                </button>
                <span>{qty}</span>
                <button
                  type="button"
                  onClick={() => handleQty(1)}
                  disabled={qty >= product.stok}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="pd-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleAddToCart}
              disabled={habis}
            >
              Tambah ke Keranjang
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleBuyNow}
              disabled={habis}
            >
              Beli Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
