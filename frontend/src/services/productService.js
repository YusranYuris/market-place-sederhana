import api from "./api.js";

// Field produk dikirim sebagai FormData karena ada upload gambar
const toFormData = (data) => {
  const formData = new FormData();

  const fields = [
    "namaProduct",
    "deskripsi",
    "harga",
    "stok",
    "kategori",
  ];

  fields.forEach((field) => {
    if (data[field] !== undefined && data[field] !== "") {
      formData.append(field, data[field]);
    }
  });

  if (data.gambarProduct) {
    formData.append("gambar_product", data.gambarProduct);
  }

  return formData;
};

// GET /products
export const getProducts = async (params = {}) => {
  const { data } = await api.get("/products", { params });

  return data.data;
};

// GET /products/:id
export const getProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);

  return data.data;
};

// POST /products
export const createProduct = async (payload) => {
  const { data } = await api.post("/products", toFormData(payload));

  return data.data;
};

// PUT /products/:id
export const updateProduct = async (id, payload) => {
  const { data } = await api.put(`/products/${id}`, toFormData(payload));

  return data.data;
};

// DELETE /products/:id
export const deleteProduct = async (id) => {
  await api.delete(`/products/${id}`);

  return true;
};
