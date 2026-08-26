import { Outlet } from "react-router-dom";

import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

import "./Layout.css";

// Kerangka halaman utama: navbar + isi + footer
function Layout() {
  return (
    <div className="layout">
      <Navbar />

      <main className="layout-main">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default Layout;
