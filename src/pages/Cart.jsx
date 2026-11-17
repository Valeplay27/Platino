import { useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../data/products";
import { getAssetUrl } from "../utils/assetHelper";
import { PERU_DEPARTMENTS, calculateShippingCost } from "../data/peruLocations";
import { isItemGemstone } from "../services/gemstonesService";

function Cart({ cart, updateQuantity }) {
  const [isBagJumping, setIsBagJumping] = useState(false);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const isGemOnly = cart.length > 0 && cart.every((item) => isItemGemstone(item));
  const [deliveryType, setDeliveryType] = useState("recojo_sede"); // 'recojo_sede' | 'envio_domicilio'
  const [sedeRecojo, setSedeRecojo] = useState("Sede Miraflores - Av. Larco 345 (Multicentro)");
  const [selectedDepartment, setSelectedDepartment] = useState("Lima");
  const [shippingDest, setShippingDest] = useState("");

  const shippingCost = calculateShippingCost({
    isGemOnly,
    deliveryType,
    department: selectedDepartment,
  });
  const cartFinalTotal = total + shippingCost;

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
                    src={getAssetUrl("/images/platino-logo-emerald.jpg")}
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
                    src={getAssetUrl("/images/platino-logo-emerald.jpg")}
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
                          e.currentTarget.src = getAssetUrl("/images/platino-logo-emerald.jpg");
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
                        {!isItemGemstone(item) && item.selectedMetal && (
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
                            {item.metalPrice ? ` (${formatPrice(item.metalPrice)})` : ""}
                          </span>
                        )}
                        {(item.selectedShape || item.selectedGemShape) && (
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
                            Corte {item.selectedShape || item.selectedGemShape}
                            {item.shapePrice > 0 ? ` (+${formatPrice(item.shapePrice)})` : ""}
                          </span>
                        )}
                        {(item.selectedGemstone || item.gemstone) && (
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
                            💎 {item.selectedGemstone || item.gemstone}
                            {item.gemPrice > 0 ? ` (+${formatPrice(item.gemPrice)})` : ""}
                          </span>
                        )}
                        {!isItemGemstone(item) && (item.selectedSizeDama || item.selectedSizeVaron || item.size) && (
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
                        {item.isGemstone && item.carat && (
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
                            💎 {item.carat} ct {item.shape ? `• ${item.shape}` : ""}
                          </span>
                        )}
                        {item.isGemstone && item.certNumber && (
                          <span
                            style={{
                              background: "#eaf2ec",
                              color: "#165935",
                              fontSize: "11px",
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: "12px",
                            }}
                          >
                            Cert: {item.certNumber}
                          </span>
                        )}
                        {item.wholesaleMinQty && item.quantity >= item.wholesaleMinQty && (
                          <span
                            style={{
                              background: "#edf5f0",
                              color: "#137748",
                              fontSize: "11px",
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: "12px",
                              border: "1px solid #b7d6c5",
                            }}
                          >
                            🏷️ Precio Mayorista
                          </span>
                        )}
                        {item.selectedPresentation && item.presentationPrice > 0 && (
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
                            Cofre (+{formatPrice(item.presentationPrice)})
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
                          disabled={item.isGemstone && item.quantity >= (Number(item.stockUnits) || 0)}
                          title={item.isGemstone ? `Stock disponible: ${item.stockUnits || 0}` : undefined}
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            border: "none",
                            background: "#ffffff",
                            color: "#283830",
                            cursor: item.isGemstone && item.quantity >= (Number(item.stockUnits) || 0) ? "not-allowed" : "pointer",
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

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px", fontSize: "14px", color: "#506057" }}>
                <span>Subtotal ({totalItems} {totalItems === 1 ? (isGemOnly ? "gema" : "joya") : (isGemOnly ? "gemas" : "joyas")})</span>
                <strong style={{ color: "#173729" }}>{formatPrice(total)}</strong>
              </div>

              {/* Selector de Modalidad de Entrega (Elegir envío o recojo en sede) */}
              <div
                style={{
                  background: "#fbfaf8",
                  border: "1px solid #ebd9b8",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  marginBottom: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", fontWeight: "700", color: "#0f2a24", marginBottom: "10px" }}>
                  <i className="bi bi-geo-alt-fill" style={{ color: "#c5a059" }}></i>
                  <span>Modalidad de Entrega:</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      border: `1.5px solid ${deliveryType === "recojo_sede" ? "#113B3A" : "#d8dfdb"}`,
                      background: deliveryType === "recojo_sede" ? "#edf5f0" : "#ffffff",
                      fontSize: "12px",
                      fontWeight: deliveryType === "recojo_sede" ? 700 : 500,
                      color: deliveryType === "recojo_sede" ? "#113B3A" : "#4b5563",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="cartDeliveryType"
                      value="recojo_sede"
                      checked={deliveryType === "recojo_sede"}
                      onChange={() => setDeliveryType("recojo_sede")}
                      style={{ accentColor: "#113B3A", cursor: "pointer" }}
                    />
                    <span>Recojo en Sede</span>
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      border: `1.5px solid ${deliveryType === "envio_domicilio" ? "#113B3A" : "#d8dfdb"}`,
                      background: deliveryType === "envio_domicilio" ? "#edf5f0" : "#ffffff",
                      fontSize: "12px",
                      fontWeight: deliveryType === "envio_domicilio" ? 700 : 500,
                      color: deliveryType === "envio_domicilio" ? "#113B3A" : "#4b5563",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="cartDeliveryType"
                      value="envio_domicilio"
                      checked={deliveryType === "envio_domicilio"}
                      onChange={() => setDeliveryType("envio_domicilio")}
                      style={{ accentColor: "#113B3A", cursor: "pointer" }}
                    />
                    <span>Envío a Domicilio</span>
                  </label>
                </div>

                {deliveryType === "recojo_sede" ? (
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                      Sede Oficial de Retiro:
                    </label>
                    <select
                      value={sedeRecojo}
                      onChange={(e) => setSedeRecojo(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        fontSize: "12.5px",
                        color: "#1e293b",
                        cursor: "pointer",
                      }}
                    >
                      <option value="Sede Miraflores - Av. Larco 345 (Multicentro)">Sede Miraflores - Av. Larco 345 (Multicentro)</option>
                      <option value="Sede Lima Centro - Jr. de la Unión 446">Sede Lima Centro - Jr. de la Unión 446</option>
                    </select>
                    <span style={{ display: "block", fontSize: "11px", color: "#166534", marginTop: "4px", fontWeight: "600" }}>
                      ✓ Retiro gratuito en vitrina
                    </span>
                  </div>
                ) : (
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                      Departamento de Entrega:
                    </label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        fontSize: "12.5px",
                        color: "#1e293b",
                        cursor: "pointer",
                        marginBottom: "6px",
                      }}
                    >
                      {PERU_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>

                    <span style={{ display: "block", fontSize: "11px", color: shippingCost === 0 ? "#166534" : "#1e293b", fontWeight: 600 }}>
                      {shippingCost === 0
                        ? "✓ Envío gratuito a " + selectedDepartment
                        : `Tarifa de envío a ${selectedDepartment}: ${formatPrice(shippingCost)}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Resumen de Envío */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px", color: "#506057" }}>
                <span>Costo de Envío</span>
                <span style={{ color: shippingCost === 0 ? "#15803d" : "#113B3A", fontWeight: 700 }}>
                  {deliveryType === "recojo_sede"
                    ? "Gratis (Retiro en Sede)"
                    : shippingCost === 0
                      ? `Gratis (${selectedDepartment})`
                      : `${formatPrice(shippingCost)} (${selectedDepartment})`}
                </span>
              </div>

              {/* Resumen de Estuche / Certificado (Para gema sola se elimina estuche de lujo) */}
              {!isGemOnly ? (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", fontSize: "14px", color: "#506057" }}>
                  <span>Estuche de lujo & Certificado</span>
                  <span style={{ color: "#15803d", fontWeight: 700 }}>Incluido</span>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", fontSize: "14px", color: "#506057" }}>
                  <span>Certificado Gemológico Oficial</span>
                  <span style={{ color: "#15803d", fontWeight: 700 }}>Incluido</span>
                </div>
              )}

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
                  {formatPrice(cartFinalTotal)}
                </span>
              </div>

              <Link
                to="/checkout"
                state={{
                  deliveryType,
                  sedeRecojo,
                  department: selectedDepartment,
                  shippingAddress: shippingDest,
                }}
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
