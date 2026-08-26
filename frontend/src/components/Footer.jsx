import Logo from "./Logo.jsx";

import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <Logo />

        <p className="footer-copy">
          &copy; 2024 Marketplace. Hak Cipta Dilindungi.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
