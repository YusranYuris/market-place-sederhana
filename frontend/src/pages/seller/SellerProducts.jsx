import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import ProductImage from "../../components/ProductImage.jsx";
import ProductFormModal from "../../components/ProductFormModal.jsx";
import { useAuthStore } from "../../stores/authStore.js";
import * as productService from "../../services/productService.js";
import { formatCurrency } from "../../utils/format.js";

import "./SellerProducts.css";

const LOW_STOCK_THRESHOLD = 5;

function SellerProducts() {
  const user = useAuthStore((state) => state.user);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("");
  const [modalMode, setModalMode] = useState(null); // null | "create" | product object
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    productService
      .getProducts({ idPenjual: user.idUser })
      .then((data) => {
        setProducts(data);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [user.idUser]);

  const stats = useMemo(
    () => ({
      total: products.length,
      aktif: products.filter((p) => p.statusProduct === "tersedia").length,
      menipis: products.filter(
        (p) => p.stok > 0 && p.stok <= LOW_STOCK_THRESHOLD
      ).length,
      habis: products.filter((p) => p.statusProduct === "habis").length,
    }),
    [products]
  );

  const kategoriList = useMemo(
    () => [...new Set(products.map((p) => p.kategori))].sort(),
    [products]
  );

  const filtered = products.filter((product) => {
    const matchSearch = product.namaProduct
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    const matchKategori = !kategori || product.kategori === kategori;

    return matchSearch && matchKategori;
  });

  const handleDelete = async (product) => {
    if (
      !window.confirm(`Hapus produk "${product.namaProduct}"?`)
    ) {
      return;
    }

    setDeletingId(product.idProduct);

    try {
      await productService.deleteProduct(product.idProduct);
      toast.success("Produk berhasil dihapus");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaved = () => {
    setModalMode(null);
    toast.success(
      modalMode === "create" ? "Produk berhasil ditambahkan" : "Produk berhasil diperbarui"
    );
    load();
  };

  return (
    <div className="container page">
      <div className="seller-head">
        <div>
          <h1 className="page-title">Daftar Produk</h1>
          <p className="page-subtitle">
            Kelola semua produk yang Anda jual di marketplace.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setModalMode("create")}
        >
          <Plus size={16} />
          Tambah Produk
        </button>
      </div>

      <div className="seller-stats">
        <div className="card seller-stat">
          <p className="seller-stat-label">Total Produk</p>
          <p className="seller-stat-value">{stats.total}</p>
        </div>
        <div className="card seller-stat">
          <p className="seller-stat-label">Produk Aktif</p>
          <p className="seller-stat-value seller-stat-green">{stats.aktif}</p>
        </div>
        <div className="card seller-stat">
          <p className="seller-stat-label">Stok Menipis</p>
          <p className="seller-stat-value seller-stat-amber">
            {stats.menipis}
          </p>
        </div>
        <div className="card seller-stat">
          <p className="seller-stat-label">Produk Habis</p>
          <p className="seller-stat-value seller-stat-red">{stats.habis}</p>
        </div>
      </div>

      <div className="card seller-table">
        <div className="seller-table-tools">
          <div className="input-wrap seller-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Cari nama produk..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="input-wrap seller-filter">
            <select
              value={kategori}
              onChange={(event) => setKategori(event.target.value)}
            >
              <option value="">Semua Kategori</option>
              {kategoriList.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="seller-row seller-row-head">
          <span>Produk</span>
          <span>Kategori</span>
          <span>Harga</span>
          <span>Stok</span>
          <span>Status</span>
          <span>Aksi</span>
        </div>

        {loading && <p className="state-box">Memuat produk...</p>}

        {!loading && error && <p className="state-box">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <p className="state-box">Belum ada produk.</p>
        )}

        {!loading &&
          !error &&
          filtered.map((product) => (
            <div className="seller-row" key={product.idProduct}>
              <div className="seller-product">
                <ProductImage
                  src={product.gambarProduct}
                  alt={product.namaProduct}
                  className="seller-product-image"
                />
                <span className="seller-product-name">
                  {product.namaProduct}
                </span>
              </div>

              <span>{product.kategori}</span>
              <span>{formatCurrency(product.harga)}</span>
              <span>{product.stok}</span>

              <span>
                <span
                  className={`badge ${
                    product.statusProduct === "tersedia"
                      ? "badge-green"
                      : "badge-red"
                  }`}
                >
                  {product.statusProduct === "tersedia"
                    ? "Tersedia"
                    : "Habis"}
                </span>
              </span>

              <span className="seller-actions">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setModalMode(product)}
                  title="Edit"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  className="icon-btn icon-btn-danger"
                  onClick={() => handleDelete(product)}
                  disabled={deletingId === product.idProduct}
                  title="Hapus"
                >
                  <Trash2 size={15} />
                </button>
              </span>
            </div>
          ))}
      </div>

      {modalMode && (
        <ProductFormModal
          product={modalMode === "create" ? null : modalMode}
          onClose={() => setModalMode(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

export default SellerProducts;
