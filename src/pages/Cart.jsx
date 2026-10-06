import { useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../data/products";
import { getAssetUrl } from "../utils/assetHelper";

function Cart({ cart, updateQuantity }) {
  const [isBagJumping, setIsBagJumping] = useState(false);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const triggerBagHop = () => {
    setIsBagJumping(true);
    setTimeout(() => setIsBagJumping(false), 900);
  };

  return (
    <div className="cart-page-wrapper" style={{ backgroundColor: "#faf9f6", minHeight: "85vh", padding: "40px 24px 90px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Cabecera dinámica con la bolsa oficial Platino */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
            borderBottom: "1px solid #eae5db",
            paddingBottom: "24px",
            marginBottom: "36px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            {/* Bolsa animada interactiva con el logo de la empresa */}
            <div
              onClick={triggerBagHop}
              title="¡Haz clic en la bolsa Platino!"
              style={{
                cursor: "pointer",
                padding: "8px 10px 6px",
                borderRadius: "16px",
                background: "#ffffff",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
                border: "1px solid #ebd9b8",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                className={isBagJumping ? "cart-user-jump" : "cart-subtle-hop"}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {/* Asa de la bolsa */}
                <div
                  style={{
                    width: "22px",
                    height: "12px",
                    border: "3px solid #C6AC7F",
                    borderBottom: "none",
                    borderRadius: "12px 12px 0 0",
                    marginBottom: "-1px",
                  }}
                />
                {/* Cuerpo de la bolsa de compras con el logo de Platino */}
                <div
                  style={{
                    width: "44px",
                    height: "36px",
                    background: "linear-gradient(135deg, #dfcaa7 0%, #C6AC7F 50%, #b39766 100%)",
                    border: "1.5px solid #ffffff",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(198, 172, 127, 0.45)",
                    position: "relative",
                  }}
                >
                  <img
                    src={getAssetUrl("/images/platino-logo-gold.jpg")}
                    alt="Logo Platino Perú"
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "4px",
                      objectFit: "cover",
                      border: "0.5px solid rgba(14, 41, 32, 0.35)",
                    }}
                  />
                  {totalItems > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-6px",
                        right: "-8px",
                        background: "linear-gradient(135deg, #c5a059 0%, #e2be79 100%)",
                        color: "#0d281f",
                        fontSize: "11px",
                        fontWeight: 800,
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid #ffffff",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                      }}
                    >
                      {totalItems}
                    </span>
                  )}
                </div>
              </div>
              {/* Sombra de suelo reactiva */}
              <div
                className="cart-subtle-shadow"
                style={{
                  width: "32px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 70%)",
                  marginTop: "4px",
                }}
              />
            </div>

            <div>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  color: "#997328",
                  textTransform: "uppercase",
                }}
              >
                TU SELECCIÓN EXCLUSIVA
              </span>
              <h1
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(26px, 3.5vw, 36px)",
                  color: "var(--platino-green-dark)",
                  margin: "4px 0 0",
                  fontWeight: 500,
                }}
              >
                Bolsa de Compras {totalItems > 0 && `(${totalItems} ${totalItems === 1 ? "pieza" : "piezas"})`}
              </h1>
            </div>
          </div>

          <Link
            to="/catalogo"
            style={{
              fontSize: "13.5px",
              color: "var(--platino-green-dark)",
              textDecoration: "none",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <i className="bi bi-arrow-left"></i> Seguir Explorando Catálogo
          </Link>
        </header>

        {/* Estado Vacío */}
        {cart.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "70px 30px",
              textAlign: "center",
              border: "1px solid #ebe5d8",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
            }}
          >
            {/* Bolsa oficial con logo en estado vacío con salto constante y sutil */}
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: "24px",
                cursor: "pointer",
              }}
              onClick={triggerBagHop}
              title="¡Bolsa Platino Perú!"
            >
              <div
                className={isBagJumping ? "cart-user-jump" : "cart-subtle-hop"}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "17px",
                    border: "3.5px solid #C6AC7F",
                    borderBottom: "none",
                    borderRadius: "15px 15px 0 0",
                    marginBottom: "-1px",
                  }}
                />
                <div
                  style={{
                    width: "62px",
                    height: "52px",
                    background: "linear-gradient(135deg, #dfcaa7 0%, #C6AC7F 50%, #b39766 100%)",
                    border: "2px solid #ffffff",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 24px rgba(198, 172, 127, 0.45)",
                  }}
                >
                  <img
                    src={getAssetUrl("/images/platino-logo-gold.jpg")}
                    alt="Platino Logo"
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "6px",
                      objectFit: "cover",
                      border: "0.5px solid rgba(14, 41, 32, 0.35)",
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
                    }}
                  />
                </div>
              </div>
              {/* Sombra de suelo sincronizada con el salto */}
              <div
                className="cart-subtle-shadow"
                style={{
                  width: "50px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse, rgba(184, 141, 56, 0.35) 0%, rgba(0,0,0,0) 70%)",
                  marginTop: "6px",
                }}
              />
            </div>

            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "26px",
                color: "var(--platino-green-dark)",
                margin: "0 0 10px 0",
              }}
            >
              Tu bolsa de compras está vacía
            </h2>
            <p style={{ color: "#697870", fontSize: "14px", maxWidth: "460px", margin: "0 auto 28px", lineHeight: "1.6" }}>
              Explora nuestros anillos de compromiso en Oro de 18 Quilates, aros de boda y piezas de alta joyería diseñadas para acompañarte toda la vida.
            </p>
            <Link
              to="/catalogo"
              className="showroom-btn filled"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--platino-green-dark)",
                color: "#ffffff",
                padding: "13px 32px",
                borderRadius: "9999px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "13.5px",
                boxShadow: "0 4px 12px rgba(18, 42, 33, 0.15)",
              }}
            >
              <i className="bi bi-gem"></i> Explorar Colección de Joyas
            </Link>
          </div>
        ) : (
          /* Cuadrícula del Carrito: Lista de Joyas + Resumen */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr",
              gap: "40px",
              alignItems: "flex-start",
            }}
          >
            {/* Columna Izquierda: Lista de Piezas */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {cart.map((item) => {
                const itemImg = item.image || (item.gallery && item.gallery[0]) || "/images/anillo-9-promesas.jpg";
                return (
                  <div
                    key={item.id}
                    style={{
                      background: "#ffffff",
                      borderRadius: "14px",
                      padding: "24px",
                      border: "1px solid #ebe5d8",
                      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)",
                      display: "grid",
                      gridTemplateColumns: "100px 1fr auto",
                      gap: "20px",
                      alignItems: "center",
                    }}
                  >
                    {/* Fotografía de la joya */}
                    <div
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        background: "#faf8f5",
                        border: "1px solid #ede7dc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={getAssetUrl(itemImg)}
                        alt={item.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.src = getAssetUrl("/images/platino-logo-gold.jpg");
                        }}
                      />
                    </div>

                    {/* Detalles de la joya */}
                    <div>
                      <h3
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: "19px",
                          color: "var(--platino-green-dark)",
                          margin: "0 0 6px 0",
                        }}
                      >
                        {item.name}
                      </h3>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                        {item.selectedMetal && (
                          <span
                            style={{
                              background: "#f4f1ea",
                              color: "#46544d",
                              fontSize: "11px",
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: "12px",
                            }}
                          >
                            {typeof item.selectedMetal === "object" ? item.selectedMetal.name : item.selectedMetal}
                          </span>
                        )}
                        {(item.selectedSizeDama || item.selectedSizeVaron || item.size) && (
                          <span
                            style={{
                              background: "#f4f1ea",
                              color: "#46544d",
                              fontSize: "11px",
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: "12px",
                            }}
                          >
                            Talla: {item.selectedSizeDama ? `Dama ${item.selectedSizeDama}` : ""}
                            {item.selectedSizeDama && item.selectedSizeVaron ? " / " : ""}
                            {item.selectedSizeVaron ? `Varón ${item.selectedSizeVaron}` : ""}
                            {!item.selectedSizeDama && !item.selectedSizeVaron && item.size ? item.size : ""}
                          </span>
                        )}
                        {item.hasEngraving && (
                          <span
                            style={{
                              background: "#fef3c7",
                              color: "#92400e",
                              fontSize: "11px",
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: "12px",
                            }}
                          >
                            Grabado Personalizado
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--platino-green-dark)" }}>
                        {formatPrice(item.price)}
                      </div>
                    </div>

                    {/* Controles de Cantidad & Subtotal */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          border: "1px solid #dcd5c7",
                          borderRadius: "9999px",
                          background: "#faf9f6",
                          padding: "2px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Disminuir cantidad"
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            border: "none",
                            background: "#ffffff",
                            color: "#283830",
                            cursor: "pointer",
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          -
                        </button>
                        <span style={{ minWidth: "30px", textAlign: "center", fontSize: "13px", fontWeight: 700 }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Aumentar cantidad"
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            border: "none",
                            background: "#ffffff",
                            color: "#283830",
                            cursor: "pointer",
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          +
                        </button>
                      </div>

                      <div style={{ fontSize: "15px", fontWeight: 800, color: "#143328" }}>
                        {formatPrice(item.price * item.quantity)}
                      </div>

                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 0)}
                        title="Eliminar de la bolsa"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#9ca3af",
                          cursor: "pointer",
                          fontSize: "13px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
                      >
                        <i className="bi bi-trash"></i> Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Columna Derecha: Resumen de Pedido */}
            <aside
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "32px",
                border: "1px solid #ebe5d8",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                position: "sticky",
                top: "100px",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "22px",
                  color: "var(--platino-green-dark)",
                  margin: "0 0 20px 0",
                  borderBottom: "1px solid #f0ebe2",
                  paddingBottom: "12px",
                }}
              >
                Resumen de tu Orden
              </h2>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px", color: "#506057" }}>
                <span>Subtotal ({totalItems} {totalItems === 1 ? "joya" : "joyas"})</span>
                <strong style={{ color: "#173729" }}>{formatPrice(total)}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px", color: "#506057" }}>
                <span>Envío asegurado a todo el Perú</span>
                <span style={{ color: "#15803d", fontWeight: 700 }}>Gratis</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", fontSize: "14px", color: "#506057" }}>
                <span>Estuche de lujo & Certificado</span>
                <span style={{ color: "#15803d", fontWeight: 700 }}>Incluido</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "2px solid #ede7dc",
                  paddingTop: "16px",
                  marginBottom: "24px",
                }}
              >
                <span style={{ fontSize: "16px", fontWeight: 700, color: "#173729" }}>Total Estimado</span>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: "24px", fontWeight: 700, color: "var(--platino-green-dark)" }}>
                  {formatPrice(total)}
                </span>
              </div>

              <Link
                to="/checkout"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  background: "var(--platino-green-dark)",
                  color: "#ffffff",
                  textDecoration: "none",
                  padding: "15px 24px",
                  borderRadius: "9999px",
                  fontWeight: 700,
                  fontSize: "14px",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  boxShadow: "0 4px 15px rgba(18, 42, 33, 0.25)",
                  transition: "all 0.2s ease",
                  marginBottom: "14px",
                }}
              >
                <span>Proceder al Checkout Seguro</span>
                <i className="bi bi-shield-lock-fill" style={{ color: "var(--platino-gold)" }}></i>
              </Link>

              {/* Sellos de Confianza Platino */}
              <div
                style={{
                  background: "#fbfaf7",
                  padding: "14px",
                  borderRadius: "10px",
                  border: "1px solid #ebd9b8",
                  fontSize: "12px",
                  color: "#5b6b63",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <i className="bi bi-shield-check" style={{ color: "var(--platino-gold)" }}></i>
                  <span>Garantía de Autenticidad de Oro 18k y Plata 950</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <i className="bi bi-box-seam" style={{ color: "var(--platino-gold)" }}></i>
                  <span>Empaque sellado con certificación gemológica</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <i className="bi bi-whatsapp" style={{ color: "#15803d" }}></i>
                  <span>Asesoría personalizada por WhatsApp 24/7</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
