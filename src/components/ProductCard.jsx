import { useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../data/products";
import { getAssetUrl } from "../utils/assetHelper";

function ProductCard({ product }) {
  const [isFav, setIsFav] = useState(false);

  return (
    <article className="platino-product-card">
      <div className="card-image-wrapper">
        <Link to={`/producto/${product.id}`} aria-label={`Ver ${product.name}`}>
          <img
            src={getAssetUrl(product.image)}
            alt={product.name}
            className="card-img"
            loading="lazy"
          />
        </Link>

        {product.badge && (
          <span className="card-badge-pill">{product.badge}</span>
        )}

        <button
          type="button"
          className={`card-wishlist-btn ${isFav ? "active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFav(!isFav);
          }}
          title={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
        >
          <i className={isFav ? "bi bi-heart-fill" : "bi bi-heart"}></i>
        </button>
      </div>

      <div className="card-info">
        <p className="card-subtitle">{product.subtitle || product.category}</p>
        <Link to={`/producto/${product.id}`} style={{ textDecoration: "none" }}>
          <h3 className="card-title">{product.name}</h3>
        </Link>
        <div className="card-price">{formatPrice(product.price)}</div>

        <Link to={`/producto/${product.id}`} className="card-action-btn" style={{ textDecoration: "none" }}>
          <span>
            {product.type === "accesorio" ? "Elegir Joya" : "Personalizar Joya"}
          </span>
          <i className="bi bi-chevron-right"></i>
        </Link>
      </div>
    </article>
  );
}

export default ProductCard;
