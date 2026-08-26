import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

import Modal from "./Modal.jsx";
import * as productService from "../services/productService.js";

import "./ProductFormModal.css";

// Dipakai untuk Tambah Produk (product = null) & Edit Produk (product terisi)
function ProductFormModal({ product, onClose, onSaved }) {
  const isEdit = Boolean(product);

  const [form, setForm] = useState({
    namaProduct: product?.namaProduct || "",
    deskripsi: product?.deskripsi || "",
    kategori: product?.kategori || "",
    harga: product?.harga || "",
    stok: product?.stok ?? "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(product?.gambarProduct || null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleFile = (event) => {
    const selected = event.target.files[0];

    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.namaProduct || !form.deskripsi || !form.kategori || !form.harga) {
      setError("Semua field wajib diisi");
      return;
    }

    if (Number(form.harga) <= 0) {
      setError("Harga harus lebih dari 0");
      return;
    }

    setError("");
    setSaving(true);

    const payload = { ...form, gambarProduct: file };

    try {
      if (isEdit) {
        await productService.updateProduct(product.idProduct, payload);
      } else {
        await productService.createProduct(payload);
      }

      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Edit Produk" : "Tambah Produk Baru"}
      onClose={onClose}
      width={620}
      footer={
        <>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={saving}
          >
            Batal
          </button>
          <button
            type="submit"
            form="product-form"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? <span className="spinner" /> : "Simpan Produk"}
          </button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field-label" htmlFor="namaProduct">
            Nama Produk
          </label>
          <div className="input-wrap">
            <input
              id="namaProduct"
              name="namaProduct"
              type="text"
              placeholder="Contoh: Headphones Wireless Pro"
              value={form.namaProduct}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="deskripsi">
            Deskripsi
          </label>
          <div className="input-wrap">
            <textarea
              id="deskripsi"
              name="deskripsi"
              placeholder="Jelaskan fitur dan keunggulan produk Anda..."
              value={form.deskripsi}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="field-grid">
          <div className="field">
            <label className="field-label" htmlFor="kategori">
              Kategori
            </label>
            <div className="input-wrap">
              <input
                id="kategori"
                name="kategori"
                type="text"
                placeholder="Contoh: Elektronik"
                value={form.kategori}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="stok">
              Stok
            </label>
            <div className="input-wrap">
              <input
                id="stok"
                name="stok"
                type="number"
                min="0"
                placeholder="0"
                value={form.stok}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="harga">
            Harga (Rp)
          </label>
          <div className="input-wrap">
            <span className="input-prefix">Rp</span>
            <input
              id="harga"
              name="harga"
              type="number"
              min="0"
              placeholder="0"
              value={form.harga}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="field">
          <label className="field-label">Gambar Produk</label>
          <label className="upload-box">
            {preview ? (
              <img src={preview} alt="Preview" className="upload-preview" />
            ) : (
              <>
                <ImageIcon size={22} />
                <p>Klik untuk unggah gambar</p>
                <span>PNG, JPG, WEBP up to 5MB</span>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleFile}
              hidden
            />
          </label>
        </div>

        {error && <p className="field-error">{error}</p>}
      </form>
    </Modal>
  );
}

export default ProductFormModal;
