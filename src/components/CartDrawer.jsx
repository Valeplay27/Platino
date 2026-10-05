import { useEffect } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../data/products";
import { getAssetUrl } from "../utils/assetHelper";
import "../../styles/cartDrawer.css";

export default function CartDrawer({
  isOpen,
  onClose,
  cart = [],
  updateQuantity,
  removeFromCart,
  lastAddedItem = null,
}) {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Cerrar al presionar la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Bloquear scroll de fondo cuando el drawer lateral está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const getItemKey = (item) => item.cartItemId || item.id;

  if (!isOpen) return null;

  return (
    <>
      {/* Fondo oscuro traslúcido con desenfoque */}
      <div
        className={`cart-drawer-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Panel lateral que se desliza desde la derecha */}
      <aside
        className={`cart-drawer-panel ${isOpen ? "open" : ""}`}
        aria-label="Carrito de compras lateral"
        role="dialog"
        aria-modal="true"
      >
        {/* Cabecera del Drawer */}
        <header className="cart-drawer-header">
          <div className="cart-drawer-title-group">
            <div className="cart-drawer-bag-badge">
              {/* Mini bolsa Platino con salto sutil y logo */}
              <div className="cart-subtle-hop" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    width: "14px",
                    height: "8px",
                    border: "2px solid #b88d38",
                    borderBottom: "none",
                    borderRadius: "6px 6px 0 0",
                    marginBottom: "-1px",
                  }}
                />
                <div
                  style={{
                    width: "26px",
                    height: "22px",
                    background: "linear-gradient(135deg, #f5e4bc 0%, #d4af37 45%, #b3883b 100%)",
                    border: "1.2px solid #ffffff",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 3px 8px rgba(197, 160, 89, 0.4)",
                  }}
                >
                  <img
                    src={getAssetUrl("/images/platino-logo-gold.jpg")}
                    alt="Logo Platino"
                    style={{
                      width: "13px",
                      height: "13px",
                      borderRadius: "2.5px",
                      objectFit: "cover",
                      border: "0.5px solid rgba(14, 41, 32, 0.35)",
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3>
                Tu Bolsa de Compras
                {totalItems > 0 && (
                  <span className="cart-drawer-count-pill">
                    {totalItems} {totalItems === 1 ? "pieza" : "piezas"}
                  </span>
                )}
              </h3>
            </div>
          </div>

          <button
            type="button"
            className="cart-drawer-close-btn"
            onClick={onClose}
            aria-label="Cerrar bolsa de compras"
            title="Cerrar (Esc)"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </header>

        {/* Notificación cuando recién se añadió un producto */}
        {lastAddedItem && (
          <div className="cart-drawer-just-added-alert">
            <i className="bi bi-check-circle-fill"></i>
            <span>
              ¡<strong>{lastAddedItem.name}</strong> agregada a tu bolsa con éxito!
            </span>
          </div>
        )}

        {/* Lista de productos en el carrito */}
        {cart.length === 0 ? (
          <div className="cart-drawer-empty-state">
            {/* Bolsa con logo saltando suavemente */}
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              <div className="cart-subtle-hop" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    width: "24px",
                    height: "13px",
                    border: "3px solid #b88d38",
                    borderBottom: "none",
                    borderRadius: "12px 12px 0 0",
                    marginBottom: "-1px",
                  }}
                />
                <div
                  style={{
                    width: "50px",
                    height: "42px",
                    background: "linear-gradient(135deg, #f5e4bc 0%, #d4af37 45%, #b3883b 100%)",
                    border: "1.8px solid #ffffff",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 18px rgba(197, 160, 89, 0.45)",
                  }}
                >
                  <img
                    src={getAssetUrl("/images/platino-logo-gold.jpg")}
                    alt="Logo Platino Perú"
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "5px",
                      objectFit: "cover",
                      border: "0.5px solid rgba(14, 41, 32, 0.35)",
                    }}
                  />
                </div>
              </div>
              <div
                className="cart-subtle-shadow"
                style={{
                  width: "42px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse, rgba(184, 141, 56, 0.35) 0%, rgba(0,0,0,0) 70%)",
                  marginTop: "6px",
                }}
              />
            </div>

            <h4>Tu bolsa está vacía</h4>
            <p>
              Explora nuestros anillos de compromiso, aros de boda y piezas de alta joyería en Oro de 18k.
            </p>
            <Link
              to="/catalogo"
              className="cart-drawer-explore-btn"
              onClick={onClose}
            >
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="cart-drawer-items-list">
            {cart.map((item) => {
              const itemKey = getItemKey(item);
              const isRecent = lastAddedItem && getItemKey(lastAddedItem) === itemKey;

              return (
                <article
                  key={itemKey}
                  className={`cart-drawer-item-card ${isRecent ? "highlight-new" : ""}`}
                >
                  {/* Miniatura de la joya */}
                  <div className="cart-drawer-item-thumb">
                    <img
                      src={getAssetUrl(item.image || "/images/secret-garden-white.jpg")}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.src = getAssetUrl("/images/secret-garden-white.jpg");
                      }}
                    />
                  </div>

                  {/* Detalles y controles */}
                  <div className="cart-drawer-item-info">
                    <div className="cart-drawer-item-title-row">
                      <h4 className="cart-drawer-item-title" title={item.name}>
                        {item.name}
                      </h4>
                      <button
                        type="button"
                        className="cart-drawer-item-remove-btn"
                        onClick={() => {
                          if (removeFromCart) removeFromCart(itemKey);
                          else if (updateQuantity) updateQuantity(itemKey, 0);
                        }}
                        title="Quitar de la bolsa"
                        aria-label={`Eliminar ${item.name}`}
                      >
                        <i className="bi bi-trash3"></i>
                      </button>
                    </div>

                    {/* Tags de especificación de la joya */}
                    <div className="cart-drawer-item-tags">
                      {(item.selectedMetal || item.metal) && (
                        <span className="cart-drawer-tag-pill metal">
                          <i className="bi bi-gem"></i>
                          {item.selectedMetal || item.metal}
                        </span>
                      )}

                      {(item.selectedSize || item.size) && (
                        <span className="cart-drawer-tag-pill">
                          <i className="bi bi-rulers"></i>
                          {item.selectedSize || item.size}
                        </span>
                      )}

                      {(item.selectedGemstone || item.gemstone) && (
                        <span className="cart-drawer-tag-pill">
                          💎 {item.selectedGemstone || item.gemstone}
                        </span>
                      )}

                      {item.engraving && (
                        <span className="cart-drawer-tag-pill engraving">
                          <i className="bi bi-pen"></i> Grabado personalizado
                        </span>
                      )}
                    </div>

                    {/* Fila de stepper y precio */}
                    <div className="cart-drawer-item-bottom">
                      <div className="cart-drawer-qty-stepper">
                        <button
                          type="button"
                          className="cart-drawer-qty-btn"
                          onClick={() => {
                            if (updateQuantity) {
                              updateQuantity(itemKey, item.quantity - 1);
                            }
                          }}
                          aria-label="Disminuir cantidad"
                        >
                          −
                        </button>
                        <span className="cart-drawer-qty-num">{item.quantity}</span>
                        <button
                          type="button"
                          className="cart-drawer-qty-btn"
                          onClick={() => {
                            if (updateQuantity) {
                              updateQuantity(itemKey, item.quantity + 1);
                            }
                          }}
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-drawer-item-price">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Resumen inferior y Botones de Checkout */}
        {cart.length > 0 && (
          <footer className="cart-drawer-footer">
            <div className="cart-drawer-perks-row">
              <span className="cart-drawer-perk-item">
                <i className="bi bi-truck"></i> Envío asegurado a todo el Perú
              </span>
              <strong style={{ color: "#15803d" }}>Gratis</strong>
            </div>

            <div className="cart-drawer-total-row">
              <span className="cart-drawer-total-label">Subtotal estimado:</span>
              <span className="cart-drawer-total-price">{formatPrice(subtotal)}</span>
            </div>

            <div className="cart-drawer-actions-stack">
              <Link
                to="/checkout"
                className="cart-drawer-checkout-btn"
                onClick={onClose}
              >
                <span>Proceder al Checkout Seguro</span>
                <i className="bi bi-shield-lock-fill"></i>
              </Link>

              <Link
                to="/carrito"
                className="cart-drawer-view-bag-btn"
                onClick={onClose}
              >
                <span>Ver Bolsa Completa</span>
                <i className="bi bi-arrow-right"></i>
              </Link>
            </div>

            <div className="cart-drawer-guarantee-note">
              <i className="bi bi-patch-check-fill" style={{ color: "#c5a059" }}></i>
              <span>Oro de 18k certificado • Garantía de por vida Platino</span>
            </div>
          </footer>
        )}
      </aside>
    </>
  );
}
