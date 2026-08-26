import { Route, Routes } from "react-router-dom";

import Layout from "../components/Layout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import PublicRoute from "./PublicRoute.jsx";

import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import NotFound from "../pages/NotFound.jsx";
import Catalog from "../pages/Catalog.jsx";
import ProductDetail from "../pages/ProductDetail.jsx";
import Cart from "../pages/Cart.jsx";
import Checkout from "../pages/Checkout.jsx";
import MyOrders from "../pages/orders/MyOrders.jsx";
import OrderDetail from "../pages/orders/OrderDetail.jsx";
import SellerProducts from "../pages/seller/SellerProducts.jsx";
import SellerOrders from "../pages/seller/SellerOrders.jsx";

function AppRoutes() {
  return (
    <Routes>
      {/* ----- Publik (tanpa navbar) ------ */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* ----- Halaman dengan navbar + footer ------ */}
      <Route element={<Layout />}>
        {/* Publik */}
        <Route path="/" element={<Catalog />} />
        <Route path="/produk/:id" element={<ProductDetail />} />

        {/* Pembeli */}
        <Route
          path="/keranjang"
          element={
            <ProtectedRoute role="pembeli">
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute role="pembeli">
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pesanan"
          element={
            <ProtectedRoute role="pembeli">
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pesanan/:id"
          element={
            <ProtectedRoute role="pembeli">
              <OrderDetail />
            </ProtectedRoute>
          }
        />

        {/* Penjual */}
        <Route
          path="/seller/produk"
          element={
            <ProtectedRoute role="penjual">
              <SellerProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/pesanan"
          element={
            <ProtectedRoute role="penjual">
              <SellerOrders />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
