import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import ProductCard from "../components/ProductCard.jsx";
import * as productService from "../services/productService.js";

import "./Catalog.css";

function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("");

  useEffect(() => {
    let cancelled = false;

    productService
      .getProducts()
      .then((data) => {
        if (cancelled) return;
        setProducts(data);
        setError("");
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
  }, []);

  const kategoriList = useMemo(
    () => [...new Set(products.map((p) => p.kategori))].sort(),
    [products]
  );

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchSearch = product.namaProduct
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchKategori = !kategori || product.kategori === kategori;

      return matchSearch && matchKategori;
    });
  }, [products, search, kategori]);

  return (
    <div className="container page">
      <div className="catalog-head">
        <div>
          <h1 className="page-title">Katalog Produk</h1>
          <p className="page-subtitle">
            Temukan produk terbaik dengan harga terjangkau.
          </p>
        </div>

        <div className="catalog-tools">
          <div className="input-wrap catalog-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="input-wrap catalog-filter">
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
      </div>

      {loading && <p className="state-box">Memuat produk...</p>}

      {!loading && error && <p className="state-box">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p className="state-box">Tidak ada produk yang cocok.</p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="catalog-grid">
          {filtered.map((product) => (
            <ProductCard key={product.idProduct} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Catalog;
