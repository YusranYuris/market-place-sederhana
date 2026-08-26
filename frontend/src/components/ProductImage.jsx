import { Image as ImageIcon } from "lucide-react";

import "./ProductImage.css";

// Kotak gambar produk dengan fallback ikon saat gambarProduct null
function ProductImage({ src, alt, className = "" }) {
  if (!src) {
    return (
      <div className={`product-image product-image-empty ${className}`}>
        <ImageIcon size={20} />
      </div>
    );
  }

  return (
    <div className={`product-image ${className}`}>
      <img src={src} alt={alt} loading="lazy" />
    </div>
  );
}

export default ProductImage;
