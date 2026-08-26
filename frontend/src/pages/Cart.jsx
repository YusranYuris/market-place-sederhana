import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Minus, Plus, Trash2 } from "lucide-react";

import ProductImage from "../components/ProductImage.jsx";
import { useCartStore } from "../stores/cartStore.js";
import { formatCurrency } from "../utils/format.js";

import "./Cart.css";

function Cart() {
  const navigate = useNavigate();

  const items = useCartStore((state) => state.items);
  const updateQty = useCartStore((state) => state.updateQty);
  const removeItem = useCartStore((state) => state.removeItem);
  const totalHarga = useCartStore((state) => state.totalHarga());

  const [alamat, setAlamat] = useState("");
  const [error, setError] = useState("");

  const handleCheckout = () => {
    if (!alamat.trim()) {
      setError("Alamat pengiriman wajib diisi");
      return;
    }

    setError("");
    navigate("/checkout", { state: { alamatPengiriman: alamat.trim() } });
  };

  if (items.length === 0) {
    return (
      <div className="container page state-box">
        <h1 className="page-title" style={{ marginBottom: 8 }}>
          Keranjang Belanja
        </h1>
        <p>Keranjang Anda masih kosong.</p>
        <p style={{ marginTop: 20 }}>
          <Link to="/" className="btn btn-primary">
            Mulai Belanja
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container page">
      <h1 className="page-title">Keranjang Belanja</h1>
      <p className="page-subtitle">
        Anda memiliki {items.length} produk di keranjang Anda.
      </p>

      <div className="cart-layout">
        <div className="card cart-table">
          <div className="cart-row cart-row-head">
            <span>Produk</span>
            <span>Harga</span>
            <span>Jumlah</span>
            <span>Subtotal</span>
            <span>Aksi</span>
          </div>

          {items.map((item) => (
            <div className="cart-row" key={item.idProduct}>
              <div className="cart-product">
                <ProductImage
                  src={item.gambarProduct}
                  alt={item.namaProduct}
                  className="cart-product-image"
                />
                <div>
                  <Link
                    to={`/produk/${item.idProduct}`}
                    className="cart-product-name"
                  >
                    {item.namaProduct}
                  </Link>
                  <p className="cart-product-category">{item.kategori}</p>
                </div>
              </div>

              <span>{formatCurrency(item.harga)}</span>

              <div className="qty-stepper qty-stepper-sm">
                <button
                  type="button"
                  onClick={() => updateQty(item.idProduct, item.qty - 1)}
                >
                  <Minus size={13} />
                </button>
                <span>{item.qty}</span>
                <button
                  type="button"
                  onClick={() => updateQty(item.idProduct, item.qty + 1)}
                  disabled={item.qty >= item.stok}
                >
                  <Plus size={13} />
                </button>
              </div>

              <span className="cart-subtotal">
                {formatCurrency(item.harga * item.qty)}
              </span>

              <button
                type="button"
                className="cart-remove"
                onClick={() => removeItem(item.idProduct)}
              >
                <Trash2 size={15} />
                Hapus
              </button>
            </div>
          ))}
        </div>

        <div className="card cart-summary">
          <h2>Ringkasan Pesanan</h2>

          <div className="cart-summary-row">
            <span>Total Harga ({items.length} Barang)</span>
            <span>{formatCurrency(totalHarga)}</span>
          </div>

          <hr className="divider" />

          <div className="cart-summary-row cart-summary-total">
            <span>Total Bayar</span>
            <span>{formatCurrency(totalHarga)}</span>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="alamat">
              Alamat Pengiriman
            </label>
            <div className="input-wrap">
              <textarea
                id="alamat"
                placeholder="Contoh: Jl. Sudirman No. 123, Kebayoran Baru, Jakarta Selatan, 12190"
                value={alamat}
                onChange={(event) => setAlamat(event.target.value)}
              />
            </div>
            {error && <p className="field-error">{error}</p>}
          </div>

          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={handleCheckout}
          >
            Checkout Sekarang
          </button>
        </div>
      </div>

      <Link to="/" className="back-link cart-back">
        <ChevronLeft size={16} />
        Kembali Belanja
      </Link>
    </div>
  );
}

export default Cart;
