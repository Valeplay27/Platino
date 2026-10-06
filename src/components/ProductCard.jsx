import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { isUserFavorite, toggleUserFavorite } from "../services/favoritesService";
import { formatPrice, DEFAULT_METAL_IMAGES } from "../data/products";
import { getAssetUrl } from "../utils/assetHelper";

function ProductCard({ product, addToCart }) {
  const { user, openAuthModal } = useAuth();
  const [isFav, setIsFav] = useState(() => (user ? isUserFavorite(user.email, product.id) : false));

  useEffect(() => {
    if (user) {
      setIsFav(isUserFavorite(user.email, product.id));
    } else {
      setIsFav(false);
    }
    const handleFavUpdate = () => {
      if (user) setIsFav(isUserFavorite(user.email, product.id));
    };
    window.addEventListener("platino_favorites_updated", handleFavUpdate);
    return () => window.removeEventListener("platino_favorites_updated", handleFavUpdate);
  }, [user, product.id]);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openAuthModal("login");
      return;
    }
    const nextState = toggleUserFavorite(user.email, {
      id: product.id,
      name: product.name,
      price: product.price,
      image: customMetalImg || product.image,
      metal: activeMetal?.name,
      metalId: activeMetal?.id,
      category: product.category,
      type: product.type,
      subtitle: product.subtitle,
    });
    setIsFav(nextState);
  };

  // Metal activo en la tarjeta
  const availableMetals = product.availableMetals && product.availableMetals.length > 0
    ? product.availableMetals
    : [
        { id: "plata-925", name: "Plata 925", color: "#e4e7e7", border: "#cfd3d3" },
        { id: "oro-18k-amarillo", name: "Oro 18k Amarillo", color: "#f6db8d", border: "#d7b355" },
        { id: "oro-18k-rosa", name: "Oro 18k Rosa", color: "#f7c7b2", border: "#dca188" },
        { id: "oro-18k-blanco", name: "Oro 18k Blanco", color: "#e8eaeb", border: "#c2c7c8" },
      ];

  const [activeMetal, setActiveMetal] = useState(() => {
    if (product.selectedMetal) {
      const match = availableMetals.find(
        (m) => m.name === product.selectedMetal || m.id === product.selectedMetal
      );
      if (match) return match;
    }
    return availableMetals[0];
  });

  const rawMetalImg =
    (product.metalImages && product.metalImages[activeMetal?.id]) ||
    (product.imagesByMetal && product.imagesByMetal[activeMetal?.id]) ||
    (product.id === "aros-trial" && DEFAULT_METAL_IMAGES && DEFAULT_METAL_IMAGES[activeMetal?.id]) ||
    null;
  const customMetalImg = rawMetalImg ? getAssetUrl(rawMetalImg) : null;

  return (
    <article className="platino-product-card">
      <div className="card-image-wrapper">
        <Link to={`/producto/${product.id}`} aria-label={`Ver ${product.name}`}>
          <img
            src={customMetalImg || getAssetUrl(product.image)}
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
          onClick={handleFavoriteClick}
          title={!user ? "Inicia sesión o regístrate para guardar en favoritos" : (isFav ? "Quitar de favoritos" : "Guardar en favoritos")}
        >
          <i className={isFav ? "bi bi-heart-fill" : "bi bi-heart"}></i>
        </button>
      </div>

      {/* Fila de muestras de metales interactiva (Igual que en Blue Nile / Brilliant Earth) */}
      {availableMetals.length > 1 && (
        <div className="card-metal-swatches" onClick={(e) => e.stopPropagation()}>
          {availableMetals.slice(0, 7).map((m) => {
            const isSelected = activeMetal?.id === m.id;
            return (
              <button
                key={m.id}
                type="button"
                className={`card-swatch-dot ${isSelected ? "active" : ""}`}
                style={{
                  background: m.color,
                  borderColor: m.border || "#d5d0c5",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveMetal(m);
                }}
                title={m.name}
                aria-label={`Ver en ${m.name}`}
              />
            );
          })}
        </div>
      )}

      <div className="card-info">
        <p className="card-subtitle">
          {product.type === "aros"
            ? `Aros en ${activeMetal?.name}`
            : product.type === "anillo"
            ? `Anillo en ${activeMetal?.name}`
            : `${product.subtitle || product.category || "Joya"} • ${activeMetal?.name}`}
        </p>

        <Link to={`/producto/${product.id}`} style={{ textDecoration: "none" }}>
          <h3 className="card-title">{product.name}</h3>
        </Link>

        <div className="card-price">{formatPrice(product.price)}</div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "12px" }}>
          <Link
            to={`/producto/${product.id}`}
            className="card-action-btn"
            style={{ flex: 1, margin: 0 }}
          >
            <span>
              {product.type === "accesorio" ? "Elegir Joya" : "Personalizar Joya"}
            </span>
            <i className="bi bi-chevron-right"></i>
          </Link>
          {addToCart && (
            <button
              type="button"
              className="card-quick-cart-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart({
                  ...product,
                  selectedMetal: activeMetal?.name,
                  metal: activeMetal?.name,
                  image: customMetalImg || getAssetUrl(product.image),
                  price: product.price,
                });
              }}
              title="Añadir a la bolsa de compras"
              aria-label={`Añadir ${product.name} a la bolsa`}
            >
              <i className="bi bi-bag-plus"></i>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
