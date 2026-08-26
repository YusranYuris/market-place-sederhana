import { create } from "zustand";

const CART_KEY = "marketplace_cart";

// Tidak ada tabel cart di backend, jadi keranjang murni disimpan di browser
const readStoredCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);

    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const persist = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

export const useCartStore = create((set, get) => ({
  items: readStoredCart(),

  totalItems: () => get().items.reduce((sum, item) => sum + item.qty, 0),

  totalHarga: () =>
    get().items.reduce(
      (sum, item) => sum + Number(item.harga) * item.qty,
      0
    ),

  addItem: (product, qty = 1) => {
    const items = get().items;
    const existing = items.find(
      (item) => item.idProduct === product.idProduct
    );

    let next;

    if (existing) {
      const newQty = Math.min(existing.qty + qty, product.stok);

      next = items.map((item) =>
        item.idProduct === product.idProduct
          ? { ...item, qty: newQty }
          : item
      );
    } else {
      next = [
        ...items,
        {
          idProduct: product.idProduct,
          namaProduct: product.namaProduct,
          harga: product.harga,
          gambarProduct: product.gambarProduct,
          kategori: product.kategori,
          stok: product.stok,
          qty: Math.min(qty, product.stok),
        },
      ];
    }

    persist(next);
    set({ items: next });
  },

  updateQty: (idProduct, qty) => {
    const items = get().items;

    const next =
      qty <= 0
        ? items.filter((item) => item.idProduct !== idProduct)
        : items.map((item) =>
            item.idProduct === idProduct
              ? { ...item, qty: Math.min(qty, item.stok) }
              : item
          );

    persist(next);
    set({ items: next });
  },

  removeItem: (idProduct) => {
    const next = get().items.filter(
      (item) => item.idProduct !== idProduct
    );

    persist(next);
    set({ items: next });
  },

  clear: () => {
    persist([]);
    set({ items: [] });
  },
}));
