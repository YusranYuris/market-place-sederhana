import { Store } from "lucide-react";

import "./Logo.css";

function Logo({ size = "md" }) {
  return (
    <span className={`logo logo-${size}`}>
      <span className="logo-mark">
        <Store size={size === "lg" ? 22 : 16} strokeWidth={2.4} />
      </span>
      <span className="logo-text">Marketplace</span>
    </span>
  );
}

export default Logo;
