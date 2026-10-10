import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  getOrders,
  getOrdersByClientEmail,
  updateOrderStatus,
  advanceOrderStep,
  stepBackOrderStep,
  createOrder,
  ORDER_STAGES,
  getOrderStageInfo,
  CLIENT_ORDER_STAGES,
  getClientStageInfo,
  getClientProgressPercentage,
} from "../services/ordersService";
import {
  getPlatinoCareClients,
  getPlatinoCareClientByDni,
  validateFreePlatinoCareByDni,
} from "../services/platinoCareService";
import { getUserFavorites, removeFromFavorites } from "../services/favoritesService";
import { formatPrice } from "../data/products";
import "../../styles/orders.css";

export default function ClientOrders({ addToCart }) {
  const { user, login, openAuthModal } = useAuth();
  const [searchParams] = useSearchParams();
  const isNewlyCreated = searchParams.get("nuevo") === "1";
  const tabParam = searchParams.get("tab");

  // Modal de Detallado Completo
  const [detailModalOrder, setDetailModalOrder] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const getInitialOrders = useCallback(() => {
    if (user && user.email) {
      return getOrdersByClientEmail(user.email);
    }
    return getOrders();
  }, [user]);

  const [orders, setOrders] = useState(getInitialOrders);
  const [activeTab, setActiveTab] = useState(() => (tabParam === "favoritos" ? "favoritos" : (tabParam === "care" ? "care" : "activos"))); // 'activos' | 'historial' | 'favoritos' | 'care' | 'todos'
  const [searchCode, setSearchCode] = useState("");

  // Estado de Joyas Favoritas del Cliente
  const [favorites, setFavorites] = useState(() => (user ? getUserFavorites(user.email) : []));

  // Estado de Consulta / Validación Platino Care por DNI
  const [careSearchDni, setCareSearchDni] = useState(user?.dni || "47829103");
  const [searchedClientRecord, setSearchedClientRecord] = useState(() => getPlatinoCareClientByDni(user?.dni || "47829103"));
  const [careRegisterName, setCareRegisterName] = useState(user?.name || "");
  const [careRegisterPhone, setCareRegisterPhone] = useState(user?.phone || "+51 912 345 678");

  useEffect(() => {
    if (user?.email) {
      setFavorites(getUserFavorites(user.email));
    } else {
      setFavorites([]);
    }
    const handleFavUpdate = () => {
      if (user?.email) setFavorites(getUserFavorites(user.email));
    };
    window.addEventListener("platino_favorites_updated", handleFavUpdate);
    return () => window.removeEventListener("platino_favorites_updated", handleFavUpdate);
  }, [user?.email]);

  const handleRemoveFavorite = (productId, productName) => {
    if (!user) return;
    removeFromFavorites(user.email, productId);
    setToastMessage(`✓ «${productName}» se retiró de tus favoritos.`);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleAddToCartFavorite = (item) => {
    if (typeof addToCart === "function") {
      addToCart(item);
      setToastMessage(`✓ «${item.name}» se agregó a tu bolsa de compras.`);
      setTimeout(() => setToastMessage(""), 4000);
    }
  };

  useEffect(() => {
    setOrders(getInitialOrders());
    const handleUpdate = () => setOrders(getInitialOrders());
    window.addEventListener("orders_updated", handleUpdate);
    return () => window.removeEventListener("orders_updated", handleUpdate);
  }, [getInitialOrders]);

  // Manejar acceso rápido como cliente prueba
  const handleQuickLoginCliente = () => {
    login("cliente@platino.pe", "platino2026");
  };

  // Crear una nueva orden de demostración con 1 clic para el usuario actual
  const handleCreateSampleOrder = () => {
    const newOrd = createOrder({
      clientName: user?.name || "Vladimir",
      clientEmail: user?.email || "vladimiryt18@gmail.com",
      clientPhone: user?.phone || "+51 927 357 217",
      deliveryType: "recojo_sede",
      sedeRecojo: "Sede Miraflores - Av. José Larco 880",
      total: 4850,
      paymentMethod: "BCP",
      items: [
        {
          id: "prod-secret-garden",
          name: "Anillo Solitario Secret Garden",
          metal: "Oro 18K Rosa",
          metalId: "oro-18k-rosa",
          tone: "rose",
          size: "12 (Dama)",
          gemstone: "Diamante Natural 1.00 ct - Corte Redondo Brillante (GIA)",
          price: 4850,
          quantity: 1,
          image: "/images/secret-garden-rose.jpg",
          sku: "SG-OR-12",
        },
      ],
    });
    setToastMessage(`✓ Nueva orden de prueba #${newOrd.id} generada con éxito.`);
    setTimeout(() => setToastMessage(""), 5000);
  };

  // Dar el siguiente paso en el proceso (4 fases cliente: Recibido -> En Proceso -> Listo para Entrega -> Entregado)
  const handleAdvanceStep = (orderId) => {
    const currentOrder = orders.find((o) => o.id === orderId);
    if (!currentOrder) return;
    let nextStageId = "diseno_taller";
    if (currentOrder.stage === "recibido") {
      nextStageId = "diseno_taller";
    } else if (["diseno_taller", "engaste_pulido", "control_calidad"].includes(currentOrder.stage)) {
      nextStageId = "listo_envio";
    } else if (currentOrder.stage === "listo_envio") {
      nextStageId = "entregado";
    }
    updateOrderStatus(orderId, nextStageId);
    const clientInfo = getClientStageInfo(nextStageId);
    setToastMessage(`✓ ¡Paso avanzado! Ahora el pedido está en: "${clientInfo.label}".`);
    setTimeout(() => setToastMessage(""), 5000);
  };

  // Retroceder un paso en el proceso
  const handleStepBack = (orderId) => {
    const currentOrder = orders.find((o) => o.id === orderId);
    if (!currentOrder) return;
    let prevStageId = "recibido";
    if (currentOrder.stage === "entregado") {
      prevStageId = "listo_envio";
    } else if (currentOrder.stage === "listo_envio") {
      prevStageId = "diseno_taller";
    } else if (["diseno_taller", "engaste_pulido", "control_calidad"].includes(currentOrder.stage)) {
      prevStageId = "recibido";
    }
    updateOrderStatus(orderId, prevStageId);
    const clientInfo = getClientStageInfo(prevStageId);
    setToastMessage(`✓ Se regresó a la fase de: "${clientInfo.label}".`);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Saltar directamente a una fase haciendo clic en el stepper
  const handleJumpToStep = (orderId, targetStageId) => {
    updateOrderStatus(orderId, targetStageId);
    const clientInfo = getClientStageInfo(targetStageId);
    setToastMessage(`✓ Fase actualizada a: "${clientInfo.label}".`);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Obtener texto descriptivo del botón de siguiente paso según la etapa actual
  const getNextActionLabel = (stageId) => {
    switch (stageId) {
      case "recibido":
        return "Avanzar a En Proceso de Fabricación";
      case "diseno_taller":
      case "engaste_pulido":
      case "control_calidad":
        return "Completar Fabricación & Pasar a Listo para Entrega";
      case "listo_envio":
        return "Confirmar Recepción / Marcar Pedido Entregado";
      case "entregado":
        return "Joya Entregada (Garantía Platino Care Activa)";
      default:
        return "Avanzar al Siguiente Paso";
    }
  };

  // Funciones de consulta y validación Platino Care por DNI
  const handleSearchCare = (e) => {
    e?.preventDefault();
    if (!careSearchDni.trim()) return;
    const found = getPlatinoCareClientByDni(careSearchDni.trim());
    setSearchedClientRecord(found);
  };

  const handleRegisterFreeCare = (e) => {
    e?.preventDefault();
    if (!careSearchDni.trim()) return;
    const newReg = validateFreePlatinoCareByDni(careSearchDni.trim(), {
      clientName: careRegisterName.trim() || user?.name || "Cliente Platino",
      clientPhone: careRegisterPhone.trim() || user?.phone || "+51 912 345 678",
      clientEmail: user?.email || "",
      productName: "Joya Fina Platino",
      productMetal: "Oro 18K / Plata 950",
    });
    setSearchedClientRecord(newReg);
    setToastMessage("✓ ¡Plan Gratuito Platino Care validado exitosamente con tu DNI!");
    setTimeout(() => setToastMessage(""), 5000);
  };

  // Filtrar pedidos
  const activeOrders = orders.filter((o) => o.stage !== "entregado");
  const pastOrders = orders.filter((o) => o.stage === "entregado");

  let displayedOrders = orders;
  if (activeTab === "activos") {
    displayedOrders = activeOrders;
  } else if (activeTab === "historial") {
    displayedOrders = pastOrders;
  }

  if (searchCode.trim()) {
    const q = searchCode.trim().toLowerCase();
    displayedOrders = displayedOrders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.clientName?.toLowerCase().includes(q) ||
        o.items.some((i) => i.name.toLowerCase().includes(q))
    );
  }

  // Calcular porcentaje de llenado de la barra según las 4 fases visibles del cliente
  const getProgressPercentage = (stageId) => {
    return getClientProgressPercentage(stageId);
  };

  return (
    <div className="orders-page">
      <div className="orders-container">
        {/* Toast Notificación flotante de avance */}
        {toastMessage && (
          <div
            style={{
              position: "fixed",
              bottom: "30px",
              right: "30px",
              background: "#0f2a24",
              color: "#ffffff",
              padding: "14px 22px",
              borderRadius: "10px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              zIndex: 10000,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "14px",
              fontWeight: "600",
              border: "1px solid #c5a059",
              animation: "fadeIn 0.3s ease",
            }}
          >
            <i className="bi bi-patch-check-fill" style={{ color: "#c5a059", fontSize: "18px" }}></i>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Banner de recién creado desde Checkout */}
        {isNewlyCreated && (
          <div
            style={{
              background: "#dcfce7",
              border: "1px solid #86efac",
              color: "#166534",
              padding: "16px 20px",
              borderRadius: "12px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <i className="bi bi-check-circle-fill" style={{ fontSize: "22px" }}></i>
            <div>
              <strong style={{ display: "block", fontSize: "15px" }}>
                ¡Felicitaciones! Tu orden ha sido ingresada al taller de Platino Perú
              </strong>
              <span style={{ fontSize: "13px" }}>
                Nuestros maestros orfebres han recibido tu solicitud. Puedes revisar el detallado y seguir o simular cada avance a continuación.
              </span>
            </div>
          </div>
        )}

        {/* Encabezado Principal */}
        <section className="orders-hero">
          <div className="orders-hero-eyebrow">
            <i className="bi bi-gem"></i> Portal Exclusivo de Clientes Platino
          </div>
          <h1 className="orders-hero-title">
            {user ? `Hola, ${user.name}` : "Seguimiento de Pedidos y Fabricación"}
          </h1>
          <p className="orders-hero-subtitle">
            Visualiza el detallado completo de tu pedido y supervisa o avanza cada fase del proceso artesanal: desde el modelado CAD 3D y la fundición, hasta el engaste y la certificación gemológica.
          </p>

          <div className="orders-hero-badges">
            <span className="orders-hero-badge">
              <i className="bi bi-shield-check"></i> Garantía Platino Care Activa
            </span>
            <span className="orders-hero-badge">
              <i className="bi bi-clock-history"></i> Actualizaciones en Vivo desde el Taller
            </span>
            {user && (
              <span className="orders-hero-badge">
                <i className="bi bi-person-check"></i> {user.email}
              </span>
            )}
          </div>
        </section>

        {/* Barra de Acceso Rápido y Generador de Prueba */}
        <div className="orders-demo-banner">
          <div className="orders-demo-text">
            <i className="bi bi-magic" style={{ fontSize: "20px", color: "#b45309" }}></i>
            <div>
              <strong>Acceso y Pruebas del Portal:</strong> Puedes visualizar el detallado de los pedidos existentes o generar un nuevo pedido de demostración con 1 clic para interactuar con el flujo.
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="orders-demo-btn"
              onClick={handleCreateSampleOrder}
              style={{ background: "#c5a059", color: "#1a221f" }}
              title="Generar un nuevo pedido en taller para probar el flujo de avance"
            >
              <i className="bi bi-plus-circle-fill"></i> Crear Pedido de Prueba
            </button>

            {(!user || user.email !== "cliente@platino.pe") && (
              <button
                type="button"
                className="orders-demo-btn"
                onClick={handleQuickLoginCliente}
              >
                <i className="bi bi-person-badge"></i> Cambiar a Camila Mendoza
              </button>
            )}
          </div>
        </div>

        {/* Pestañas de Navegación y Búsqueda */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
          <div className="orders-tabs-nav" style={{ marginBottom: 0 }}>
            <button
              className={`orders-tab-item ${activeTab === "activos" ? "active" : ""}`}
              onClick={() => setActiveTab("activos")}
            >
              <i className="bi bi-hammer"></i> En Fabricación
              <span className="orders-tab-count">{activeOrders.length}</span>
            </button>

            <button
              className={`orders-tab-item ${activeTab === "historial" ? "active" : ""}`}
              onClick={() => setActiveTab("historial")}
            >
              <i className="bi bi-check2-circle"></i> Pedidos Anteriores
              <span className="orders-tab-count">{pastOrders.length}</span>
            </button>

            <button
              className={`orders-tab-item ${activeTab === "favoritos" ? "active" : ""}`}
              onClick={() => setActiveTab("favoritos")}
            >
              <i className="bi bi-heart-fill" style={{ color: activeTab === "favoritos" ? "white" : "#e11d48" }}></i> Mis Favoritos
              <span
                className="orders-tab-count"
                style={{
                  background: activeTab === "favoritos" ? "#ffffff" : "#fee2e2",
                  color: activeTab === "favoritos" ? "#0f2a24" : "#e11d48",
                  fontWeight: "700",
                }}
              >
                {favorites.length}
              </span>
            </button>

            <button
              className={`orders-tab-item ${activeTab === "todos" ? "active" : ""}`}
              onClick={() => setActiveTab("todos")}
            >
              <i className="bi bi-collection"></i> Todos ({orders.length})
            </button>

            <button
              className={`orders-tab-item ${activeTab === "care" ? "active" : ""}`}
              onClick={() => setActiveTab("care")}
            >
              <i className="bi bi-shield-check" style={{ color: activeTab === "care" ? "white" : "#15803d" }}></i> Garantía Platino Care (DNI)
            </button>
          </div>

          <div style={{ position: "relative", minWidth: "260px" }}>
            <input
              type="text"
              placeholder="Buscar por código (ej. PLT-2026)..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              style={{
                padding: "8px 12px 8px 34px",
                borderRadius: "8px",
                border: "1px solid #dcd7ce",
                fontSize: "13px",
                width: "100%",
                background: "#ffffff",
                boxSizing: "border-box",
              }}
            />
            <i
              className="bi bi-search"
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#8c9791",
                fontSize: "12px",
              }}
            ></i>
          </div>
        </div>

        {/* Sección de Favoritos del Perfil o Listado de Pedidos */}
        {activeTab === "favoritos" ? (
          <div>
            {!user ? (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e7e3dc",
                  borderRadius: "14px",
                  padding: "50px 24px",
                  textAlign: "center",
                }}
              >
                <i className="bi bi-person-lock" style={{ fontSize: "42px", color: "var(--platino-gold)", marginBottom: "14px", display: "block" }}></i>
                <h3 style={{ fontFamily: "var(--font-serif)", color: "#0f2a24", margin: "0 0 8px" }}>
                  Inicia sesión para ver tus Favoritos
                </h3>
                <p style={{ color: "#68776f", fontSize: "14px", maxWidth: "480px", margin: "0 auto 20px" }}>
                  Para guardar y acceder a tus joyas favoritas desde cualquier dispositivo, inicia sesión o regístrate con tu correo.
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                  <button
                    type="button"
                    className="btn-order-action"
                    onClick={() => openAuthModal("login")}
                    style={{ background: "#0f2a24", color: "#ffffff", padding: "10px 22px" }}
                  >
                    <i className="bi bi-box-arrow-in-right"></i> Iniciar Sesión
                  </button>
                  <button
                    type="button"
                    className="btn-order-action"
                    onClick={() => openAuthModal("register")}
                    style={{ background: "#c5a059", color: "#1a221f", padding: "10px 22px", fontWeight: "700" }}
                  >
                    <i className="bi bi-person-plus"></i> Crear Cuenta
                  </button>
                </div>
              </div>
            ) : favorites.length === 0 ? (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e7e3dc",
                  borderRadius: "14px",
                  padding: "60px 24px",
                  textAlign: "center",
                }}
              >
                <i className="bi bi-heart" style={{ fontSize: "42px", color: "#e11d48", marginBottom: "14px", display: "block" }}></i>
                <h3 style={{ fontFamily: "var(--font-serif)", color: "#0f2a24", margin: "0 0 8px" }}>
                  Aún no tienes joyas guardadas como favoritas
                </h3>
                <p style={{ color: "#68776f", fontSize: "14px", maxWidth: "480px", margin: "0 auto 20px" }}>
                  Explora nuestro catálogo y haz clic en el botón de estrella o corazón para guardar tus piezas predilectas en tu perfil.
                </p>
                <Link
                  to="/catalogo"
                  className="btn-order-action"
                  style={{ background: "#0f2a24", color: "#ffffff", padding: "10px 24px" }}
                >
                  <i className="bi bi-gem"></i> Explorar Catálogo de Joyas
                </Link>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                  <span style={{ fontSize: "13.5px", color: "#506057", fontWeight: "600" }}>
                    Tienes {favorites.length} {favorites.length === 1 ? "joya guardada" : "joyas guardadas"} en tu lista de deseos
                  </span>
                  <Link to="/catalogo" style={{ fontSize: "13px", color: "var(--platino-green-dark)", fontWeight: "600", textDecoration: "underline" }}>
                    + Seguir explorando catálogo
                  </Link>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {favorites.map((fav) => (
                    <div
                      key={fav.id}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #ebe5da",
                        borderRadius: "14px",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                        position: "relative",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveFavorite(fav.id, fav.name)}
                        title="Quitar de favoritos"
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.9)",
                          border: "1px solid #ebe5da",
                          color: "#e11d48",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 2,
                        }}
                      >
                        <i className="bi bi-heart-fill"></i>
                      </button>

                      <Link to={`/producto/${fav.id}`} style={{ display: "block", aspectRatio: "1/1", background: "#fbfaf8", padding: "14px" }}>
                        <img
                          src={fav.image || "/images/secret-garden-white.jpg"}
                          alt={fav.name}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          onError={(e) => {
                            e.currentTarget.src = "/images/secret-garden-white.jpg";
                          }}
                        />
                      </Link>

                      <div style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1 }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--platino-gold)", letterSpacing: "0.08em" }}>
                          {fav.metal || fav.category || "Joyería Fina"}
                        </span>
                        <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "17px", color: "#0f2a24", margin: "4px 0 6px" }}>
                          <Link to={`/producto/${fav.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                            {fav.name}
                          </Link>
                        </h4>
                        <div style={{ marginTop: "auto", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong style={{ fontSize: "16px", color: "#0f2a24" }}>{formatPrice(fav.price)}</strong>
                        </div>
                        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                          <Link
                            to={`/producto/${fav.id}`}
                            className="btn-order-action"
                            style={{ flex: 1, textAlign: "center", background: "#0f2a24", color: "#ffffff", padding: "8px 10px", fontSize: "12px", textDecoration: "none" }}
                          >
                            Ver Joya
                          </Link>
                          {addToCart && (
                            <button
                              type="button"
                              className="btn-order-action"
                              onClick={() => handleAddToCartFavorite(fav)}
                              style={{ background: "#f4f1eb", color: "#0f2a24", borderColor: "#ddd", padding: "8px 12px", fontSize: "12px" }}
                              title="Añadir a la bolsa"
                            >
                              <i className="bi bi-bag-plus"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : activeTab === "care" ? (
          <div className="orders-care-tab-content">
            {/* Header Platino Care */}
            <div style={{
              background: "linear-gradient(135deg, #0f2a24 0%, #174238 100%)",
              borderRadius: "14px",
              padding: "32px 28px",
              color: "#ffffff",
              marginBottom: "24px",
              boxShadow: "0 10px 25px rgba(15, 42, 36, 0.15)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "20px"
            }}>
              <div style={{ maxWidth: "680px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ background: "rgba(197, 160, 89, 0.2)", color: "#c5a059", border: "1px solid rgba(197, 160, 89, 0.4)", padding: "2px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em" }}>
                    RESPALDO OFICIAL PLATINO PERÚ
                  </span>
                </div>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "24px", margin: "0 0 8px", color: "#ffffff" }}>
                  Consulta y Validación de Cobertura Platino Care
                </h2>
                <p style={{ margin: 0, fontSize: "13.5px", color: "#cfded6", lineHeight: "1.5" }}>
                  Ingresa tu número de DNI para validar tu Plan Gratuito de Cortesía o comprobar la activación y confirmación de pago de tu Plan Premium Platino Care +.
                </p>
              </div>

              {/* Buscador de DNI */}
              <form onSubmit={handleSearchCare} style={{ display: "flex", gap: "8px", background: "rgba(255, 255, 255, 0.1)", padding: "8px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.2)" }}>
                <input
                  type="text"
                  placeholder="Número de DNI (8 dígitos)..."
                  value={careSearchDni}
                  onChange={(e) => setCareSearchDni(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "6px",
                    border: "none",
                    outline: "none",
                    fontSize: "13px",
                    minWidth: "210px"
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: "#c5a059",
                    color: "#0f2a24",
                    border: "none",
                    borderRadius: "6px",
                    padding: "10px 18px",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  <i className="bi bi-search"></i> Consultar
                </button>
              </form>
            </div>

            {/* Resultado de la búsqueda */}
            {searchedClientRecord ? (
              <div style={{
                background: "#ffffff",
                border: "1.5px solid #dcd7ce",
                borderRadius: "14px",
                padding: "28px",
                marginBottom: "24px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.04)"
              }}>
                {/* Cabecera del plan */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid #eeebe3", paddingBottom: "16px", marginBottom: "20px" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "#7a8781" }}>
                      Plan Asignado a tu Documento
                    </span>
                    <h3 style={{ margin: "4px 0 0", color: "#0f2a24", fontFamily: "var(--font-serif)", fontSize: "22px" }}>
                      {searchedClientRecord.planType === "plus" ? "Platino Care + (Plan Premium)" : "Platino Care Cortesía (Plan Gratuito)"}
                    </h3>
                  </div>

                  <div>
                    {searchedClientRecord.planType === "plus" ? (
                      searchedClientRecord.status === "aprobado" ? (
                        <span style={{ background: "#ecfdf5", color: "#15803d", border: "1.5px solid #86efac", padding: "6px 14px", borderRadius: "20px", fontSize: "12.5px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <i className="bi bi-patch-check-fill"></i> Pago Confirmado por Admin — Beneficios Activos
                        </span>
                      ) : (
                        <span style={{ background: "#fffbeb", color: "#b45309", border: "1.5px solid #fde68a", padding: "6px 14px", borderRadius: "20px", fontSize: "12.5px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <i className="bi bi-clock-history"></i> Pendiente de Aceptación por el Administrador
                        </span>
                      )
                    ) : (
                      <span style={{ background: "#ecfdf5", color: "#15803d", border: "1.5px solid #86efac", padding: "6px 14px", borderRadius: "20px", fontSize: "12.5px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <i className="bi bi-check-circle-fill"></i> Plan Gratuito Validado & Activo
                      </span>
                    )}
                  </div>
                </div>

                {/* Banner de Estado para el Cliente */}
                {searchedClientRecord.planType === "plus" && searchedClientRecord.status === "pendiente_pago" && (
                  <div style={{ background: "#fefce8", border: "1.5px solid #fde047", borderRadius: "10px", padding: "16px 20px", marginBottom: "22px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <i className="bi bi-hourglass-split" style={{ fontSize: "22px", color: "#ca8a04", marginTop: "2px" }}></i>
                      <div>
                        <strong style={{ fontSize: "14px", color: "#854d0e" }}>
                          Validación de Pago en Curso por Administración
                        </strong>
                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#713f12", lineHeight: "1.5" }}>
                          Para acceder a los beneficios del <strong>Plan Platino Care +</strong>, nuestro equipo administrativo debe confirmar el comprobante de pago de S/. 90 ({searchedClientRecord.paymentMethod || "Medio de pago"}). Una vez aceptado el pago en el sistema, tus beneficios premium se activarán automáticamente.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {searchedClientRecord.planType === "plus" && searchedClientRecord.status === "aprobado" && (
                  <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "10px", padding: "16px 20px", marginBottom: "22px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <i className="bi bi-shield-fill-check" style={{ fontSize: "22px", color: "#16a34a", marginTop: "2px" }}></i>
                      <div>
                        <strong style={{ fontSize: "14px", color: "#166534" }}>
                          ¡Pago Confirmado! Beneficios Platino Care + Disponibles
                        </strong>
                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#14532d", lineHeight: "1.5" }}>
                          Tu pago fue aceptado y verificado por <strong>{searchedClientRecord.approvedBy || "Administración Central"}</strong> el {searchedClientRecord.paymentConfirmedAt || searchedClientRecord.fechaRegistro}. Tu joya cuenta con cobertura vitalicia integral.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ficha de datos del cliente */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", background: "#fbf9f6", padding: "18px 20px", borderRadius: "10px", border: "1px solid #eae5db", marginBottom: "22px" }}>
                  <div>
                    <label style={{ fontSize: "11px", textTransform: "uppercase", color: "#7a8781", fontWeight: "700" }}>Titular de la Garantía</label>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f2a24", marginTop: "2px" }}>{searchedClientRecord.clientName}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", textTransform: "uppercase", color: "#7a8781", fontWeight: "700" }}>DNI Validado</label>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f2a24", marginTop: "2px" }}>{searchedClientRecord.dni}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", textTransform: "uppercase", color: "#7a8781", fontWeight: "700" }}>
                      {searchedClientRecord.planType === "plus" ? "Fecha de Solicitud" : "Fecha de Validación de Gratuidad"}
                    </label>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f2a24", marginTop: "2px" }}>
                      {searchedClientRecord.fechaValidacionGratuidad || searchedClientRecord.fechaRegistro}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", textTransform: "uppercase", color: "#7a8781", fontWeight: "700" }}>Joya Amparada</label>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f2a24", marginTop: "2px" }}>
                      {searchedClientRecord.productName} ({searchedClientRecord.productMetal})
                    </div>
                  </div>
                </div>

                {/* Lista de beneficios amparados */}
                <div>
                  <h4 style={{ margin: "0 0 12px", color: "#0f2a24", fontSize: "15px", fontWeight: "700" }}>
                    Beneficios y Coberturas Oficiales:
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "10px" }}>
                    {searchedClientRecord.planType === "plus" ? (
                      <>
                        <div style={{ display: "flex", gap: "10px", padding: "10px 14px", background: "#fcfbf9", borderRadius: "8px", border: "1px solid #e7e3dc" }}>
                          <i className="bi bi-gem" style={{ color: "#c5a059", fontSize: "16px" }}></i>
                          <span style={{ fontSize: "13px", color: "#32433c" }}>Reposición gratuita de micro-gemas caídas por uso normal (hasta 0.10 ct)</span>
                        </div>
                        <div style={{ display: "flex", gap: "10px", padding: "10px 14px", background: "#fcfbf9", borderRadius: "8px", border: "1px solid #e7e3dc" }}>
                          <i className="bi bi-stars" style={{ color: "#c5a059", fontSize: "16px" }}></i>
                          <span style={{ fontSize: "13px", color: "#32433c" }}>Pulido ultrasónico y abrillantado profesional ilimitado al año</span>
                        </div>
                        <div style={{ display: "flex", gap: "10px", padding: "10px 14px", background: "#fcfbf9", borderRadius: "8px", border: "1px solid #e7e3dc" }}>
                          <i className="bi bi-droplet-half" style={{ color: "#c5a059", fontSize: "16px" }}></i>
                          <span style={{ fontSize: "13px", color: "#32433c" }}>1 Baño de Rodio o re-acabado de oro blanco al año</span>
                        </div>
                        <div style={{ display: "flex", gap: "10px", padding: "10px 14px", background: "#fcfbf9", borderRadius: "8px", border: "1px solid #e7e3dc" }}>
                          <i className="bi bi-lightning-charge" style={{ color: "#c5a059", fontSize: "16px" }}></i>
                          <span style={{ fontSize: "13px", color: "#32433c" }}>Ajuste prioritario de garras y engaste express en 24h</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ display: "flex", gap: "10px", padding: "10px 14px", background: "#fcfbf9", borderRadius: "8px", border: "1px solid #e7e3dc" }}>
                          <i className="bi bi-shield-check" style={{ color: "#15803d", fontSize: "16px" }}></i>
                          <span style={{ fontSize: "13px", color: "#32433c" }}>Garantía de por vida de pureza y ley del Oro 18K y Plata 950</span>
                        </div>
                        <div style={{ display: "flex", gap: "10px", padding: "10px 14px", background: "#fcfbf9", borderRadius: "8px", border: "1px solid #e7e3dc" }}>
                          <i className="bi bi-arrows-angle-expand" style={{ color: "#15803d", fontSize: "16px" }}></i>
                          <span style={{ fontSize: "13px", color: "#32433c" }}>1 Entallado gratuito de cortesía (hasta 2 tallas dentro de los primeros 90 días)</span>
                        </div>
                        <div style={{ display: "flex", gap: "10px", padding: "10px 14px", background: "#fcfbf9", borderRadius: "8px", border: "1px solid #e7e3dc" }}>
                          <i className="bi bi-gem" style={{ color: "#15803d", fontSize: "16px" }}></i>
                          <span style={{ fontSize: "13px", color: "#32433c" }}>Limpieza por ultrasonido y ajuste periódico de garras en taller</span>
                        </div>
                        <div style={{ display: "flex", gap: "10px", padding: "10px 14px", background: "#fcfbf9", borderRadius: "8px", border: "1px solid #e7e3dc" }}>
                          <i className="bi bi-journal-check" style={{ color: "#15803d", fontSize: "16px" }}></i>
                          <span style={{ fontSize: "13px", color: "#32433c" }}>Certificado físico gemológico y registro serializado de orfebrería</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Si no se encuentra registro previo, formulario para validar gratuidad */
              <div style={{
                background: "#ffffff",
                border: "1.5px solid #dcd7ce",
                borderRadius: "14px",
                padding: "36px 32px",
                textAlign: "center",
                maxWidth: "600px",
                margin: "0 auto 24px"
              }}>
                <i className="bi bi-shield-plus" style={{ fontSize: "48px", color: "#c5a059", display: "block", marginBottom: "12px" }}></i>
                <h3 style={{ fontFamily: "var(--font-serif)", color: "#0f2a24", margin: "0 0 8px" }}>
                  Validar Plan Gratuito Platino Care
                </h3>
                <p style={{ color: "#5d6d65", fontSize: "13.5px", margin: "0 0 20px" }}>
                  No se encontró una cobertura registrada para el DNI <strong>{careSearchDni}</strong>. Si adquiriste una joya en Platino Perú, puedes validar y activar tu garantía gratuita de cortesía ahora mismo:
                </p>

                <form onSubmit={handleRegisterFreeCare} style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#0f2a24", display: "block", marginBottom: "4px" }}>
                      Número de DNI *
                    </label>
                    <input
                      required
                      type="text"
                      className="catalog-form-input"
                      value={careSearchDni}
                      onChange={(e) => setCareSearchDni(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #dcd7ce" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#0f2a24", display: "block", marginBottom: "4px" }}>
                      Nombre Completo *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Ej. Camila Mendoza"
                      value={careRegisterName}
                      onChange={(e) => setCareRegisterName(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #dcd7ce" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#0f2a24", display: "block", marginBottom: "4px" }}>
                      Teléfono de Contacto / WhatsApp *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="+51 987 654 321"
                      value={careRegisterPhone}
                      onChange={(e) => setCareRegisterPhone(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #dcd7ce" }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      background: "#0f2a24",
                      color: "#ffffff",
                      border: "none",
                      padding: "12px 20px",
                      borderRadius: "8px",
                      fontWeight: "700",
                      fontSize: "14px",
                      cursor: "pointer",
                      marginTop: "8px"
                    }}
                  >
                    <i className="bi bi-shield-check"></i> Validar Plan Gratuito Ahora
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : displayedOrders.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e7e3dc",
              borderRadius: "14px",
              padding: "60px 24px",
              textAlign: "center",
            }}
          >
            <i className="bi bi-bag-x" style={{ fontSize: "42px", color: "#a0aba5", marginBottom: "14px", display: "block" }}></i>
            <h3 style={{ fontFamily: "var(--font-serif)", color: "#0f2a24", margin: "0 0 8px" }}>
              No se encontraron pedidos en esta sección
            </h3>
            <p style={{ color: "#68776f", fontSize: "14px", maxWidth: "450px", margin: "0 auto 20px" }}>
              {searchCode
                ? `No hay órdenes que coincidan con "${searchCode}".`
                : "Puedes generar un pedido de demostración o explorar nuestro catálogo."}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                type="button"
                className="btn-order-action"
                onClick={handleCreateSampleOrder}
                style={{ background: "#c5a059", color: "#1a221f", fontWeight: "700" }}
              >
                <i className="bi bi-plus-circle"></i> Generar Pedido de Demostración
              </button>
              <Link to="/catalogo" className="btn-order-action" style={{ background: "#0f2a24", color: "#ffffff", padding: "10px 22px" }}>
                <i className="bi bi-gem"></i> Explorar Catálogo de Joyas
              </Link>
            </div>
          </div>
        ) : (
          displayedOrders.map((order) => {
            const clientStageInfo = getClientStageInfo(order.stage);
            const clientStepNum = clientStageInfo.stepNumber || 1;
            const progressPct = getProgressPercentage(order.stage);
            const isCompleted = order.stage === "entregado";

            return (
              <article key={order.id} className="order-card">
                {/* Cabecera del Pedido */}
                <div className="order-card-header">
                  <div className="order-id-group">
                    <span className="order-code-title">
                      <i className="bi bi-upc-scan" style={{ marginRight: "6px", color: "#c5a059" }}></i>
                      {order.id}
                    </span>
                    <span className="order-date-text">
                      Realizado el {order.date}
                    </span>
                    <span style={{ fontSize: "12px", color: "#8c9791" }}>
                      • Cliente: <strong>{order.clientName}</strong>
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className={`order-status-badge ${clientStageInfo.badgeClass}`}>
                      <i className={`bi ${clientStageInfo.icon}`}></i>
                      Paso {clientStepNum} de 4: {clientStageInfo.label}
                    </span>

                    <button
                      type="button"
                      onClick={() => setDetailModalOrder(order)}
                      className="btn-order-action"
                      style={{ background: "#0f2a24", color: "#ffffff", fontWeight: "600", borderColor: "#0f2a24" }}
                      title="Ver el detallado completo con fotos en alta resolución, metal y gemas"
                    >
                      <i className="bi bi-search"></i> Ver Detallado
                    </button>
                  </div>
                </div>

                {/* Línea de Tiempo / Stepper de Fabricación Artesanal (4 Fases Unificadas) */}
                <div className="order-stepper-box">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div className="order-stepper-title" style={{ margin: 0 }}>
                      <i className="bi bi-bezier2"></i> Proceso de Fabricación (Haz clic en cualquier fase para avanzar o retroceder)
                    </div>
                    <span style={{ fontSize: "12px", color: "#8c9791" }}>
                      Avance: <strong>{progressPct}%</strong>
                    </span>
                  </div>

                  <div className="order-stepper">
                    <div className="order-stepper-line-bg"></div>
                    <div
                      className="order-stepper-line-fill"
                      style={{ width: `${progressPct}%` }}
                    ></div>

                    {CLIENT_ORDER_STAGES.map((s) => {
                      const isStepDone = s.stepNumber < clientStepNum;
                      const isCurrent = s.stepNumber === clientStepNum;

                      return (
                        <div
                          key={s.id}
                          className={`stepper-node clickable ${
                            isStepDone ? "completed" : ""
                          } ${isCurrent ? "current" : ""}`}
                          onClick={() => handleJumpToStep(order.id, s.internalStages[0])}
                          title={`Paso ${s.stepNumber} de 4: ${s.label}\nHaz clic para situar el pedido en esta fase.`}
                        >
                          <div className="stepper-circle">
                            {isStepDone ? (
                              <i className="bi bi-check-lg"></i>
                            ) : (
                              <span>{s.stepNumber}</span>
                            )}
                          </div>
                          <span className="stepper-label">{s.shortLabel}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* CONTROL DE AVANCE DEL PASO (4 Fases) */}
                  <div className="order-step-advance-box">
                    <div className="order-step-advance-info">
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: "#0f2a24",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "16px",
                        }}
                      >
                        <i className={`bi ${clientStageInfo.icon}`}></i>
                      </div>
                      <div>
                        <h5>
                          Fase Actual: Paso {clientStepNum} de 4 — {clientStageInfo.label}
                        </h5>
                        <p>{clientStageInfo.description}</p>
                        {["diseno_taller", "engaste_pulido", "control_calidad"].includes(order.stage) && (
                          <div style={{ marginTop: "4px", fontSize: "12px", color: "#8c6b2d", fontWeight: "600" }}>
                            <i className="bi bi-tools" style={{ marginRight: "4px" }}></i>
                            Sub-etapa en taller: {getOrderStageInfo(order.stage).label}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="order-step-advance-actions">
                      {clientStepNum > 1 && (
                        <button
                          type="button"
                          className="btn-step-back"
                          onClick={() => handleStepBack(order.id)}
                          title="Retroceder a la fase anterior"
                        >
                          <i className="bi bi-arrow-left"></i> Paso Anterior
                        </button>
                      )}

                      {!isCompleted ? (
                        <button
                          type="button"
                          className="btn-advance-step"
                          onClick={() => handleAdvanceStep(order.id)}
                          title="Aprobar y dar el siguiente paso en la fabricación"
                        >
                          <i className="bi bi-play-fill" style={{ fontSize: "16px" }}></i>
                          <span>{getNextActionLabel(order.stage)}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-advance-step"
                          onClick={() => handleJumpToStep(order.id, "recibido")}
                          style={{ background: "#15803d" }}
                          title="Reiniciar a Paso 1 para seguir probando la secuencia"
                        >
                          <i className="bi bi-arrow-repeat"></i>
                          <span>Probar ciclo nuevamente desde Paso 1</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Nota oficial del Taller / Administrador */}
                  {order.adminNotes && (
                    <div className="order-workshop-note">
                      <i className="bi bi-shield-fill-check order-workshop-note-icon"></i>
                      <div className="order-workshop-note-content">
                        <h5>Actualización del Maestro Joyero & Taller</h5>
                        <p>{order.adminNotes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Productos incluidos en la orden */}
                <div className="order-card-body">
                  <div className="order-items-grid">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-item-row">
                        <div
                          className="order-item-img-wrapper"
                          style={{ cursor: "pointer" }}
                          onClick={() => setDetailModalOrder(order)}
                          title="Clic para ver detallado en alta resolución"
                        >
                          <img
                            src={item.image || "/images/secret-garden-white.jpg"}
                            alt={item.name}
                            onError={(e) => {
                              e.currentTarget.src = "/images/secret-garden-white.jpg";
                            }}
                          />
                        </div>

                        <div className="order-item-info">
                          <h4
                            className="order-item-name"
                            style={{ cursor: "pointer" }}
                            onClick={() => setDetailModalOrder(order)}
                          >
                            {item.name}
                          </h4>
                          <div className="order-item-tags">
                            {item.metal && (
                              <span className="order-item-tag" style={{ background: "#fef3c7", color: "#92400e" }}>
                                <i className="bi bi-palette2" style={{ marginRight: "4px" }}></i>
                                {item.metal}
                              </span>
                            )}
                            {item.size && (
                              <span className="order-item-tag">
                                <i className="bi bi-rulers" style={{ marginRight: "4px" }}></i>
                                Talla: {item.size}
                              </span>
                            )}
                            {item.engraving && (
                              <span className="order-item-tag" style={{ background: "#fef3c7", color: "#92400e", fontWeight: "600" }}>
                                <i className="bi bi-pen-fill" style={{ marginRight: "4px" }}></i>
                                Grabado: «{item.engraving}»
                              </span>
                            )}
                            {(item.needsSizeAdvice || (typeof item.size === "string" && item.size.toLowerCase().includes("asesor"))) && (
                              <span className="order-item-tag" style={{ background: "#eff6ff", color: "#1d4ed8", fontWeight: "600" }}>
                                <i className="bi bi-info-circle-fill" style={{ marginRight: "4px" }}></i>
                                Asesoría de Medida Solicitada
                              </span>
                            )}
                            <span className="order-item-tag">
                              Cantidad: {item.quantity || 1}
                            </span>
                          </div>
                          {item.gemstone && (
                            <p className="order-item-gem">
                              <i className="bi bi-gem" style={{ color: "#c5a059", marginRight: "5px" }}></i>
                              {item.gemstone}
                            </p>
                          )}
                        </div>

                        <div className="order-item-price-col">
                          <p className="order-item-price">
                            {formatPrice(item.price * (item.quantity || 1))}
                          </p>
                          <span className="order-item-qty">{order.paymentStatus}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pie del Pedido con Botón de Ver Detallado y Contacto */}
                <div className="order-card-footer">
                  <div className="order-footer-details">
                    <div className="order-footer-item">
                      <i className="bi bi-truck" style={{ color: "#0f2a24" }}></i>
                      <span>
                        {order.deliveryType === "recojo_sede"
                          ? `Retiro: ${order.sedeRecojo}`
                          : `Envío: ${order.shippingAddress || "Dirección de domicilio registrada"}`}
                      </span>
                    </div>

                    <div className="order-footer-item">
                      <i className="bi bi-calendar-event" style={{ color: "#0f2a24" }}></i>
                      <span>
                        Entrega estimada: <strong>{order.estimatedCompletion}</strong>
                        {order.deliveryDays && (
                          <span style={{ marginLeft: "6px", fontSize: "11px", fontWeight: "700", color: order.deliveryDays === 7 ? "#b45309" : "#15803d" }}>
                            ({order.deliveryDays === 7 ? "7 días - Taller" : "2 días - Exprés"})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="order-footer-actions">
                    <button
                      type="button"
                      onClick={() => setDetailModalOrder(order)}
                      className="btn-order-action"
                      style={{ background: "#ffffff", borderColor: "#0f2a24", color: "#0f2a24", fontWeight: "600" }}
                    >
                      <i className="bi bi-card-checklist"></i> Ver Detallado Completo
                    </button>

                    <a
                      href={`https://wa.me/51927357217?text=Hola%20Platino%20Perú,%20quisiera%20consultar%20sobre%20mi%20pedido%20${order.id}%20en%20fase%20de%20${encodeURIComponent(clientStageInfo.label)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-order-action whatsapp"
                    >
                      <i className="bi bi-whatsapp"></i> WhatsApp Taller
                    </a>
                  </div>
                </div>
              </article>
            );
          })
        )}

        {/* ========================================================
            MODAL DE DETALLADO COMPLETO DE LA JOYA Y PEDIDO
            ======================================================== */}
        {detailModalOrder && (
          <div
            className="order-detail-modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setDetailModalOrder(null);
            }}
          >
            <div className="order-detail-modal" role="dialog" aria-modal="true">
              <div className="order-detail-modal-header">
                <button
                  type="button"
                  className="order-detail-modal-close"
                  onClick={() => setDetailModalOrder(null)}
                  aria-label="Cerrar ventana"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
                <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", color: "#d4af37", fontWeight: "700" }}>
                  Ficha Técnica & Certificación
                </span>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "24px", margin: "6px 0 4px" }}>
                  Detallado de Orden #{detailModalOrder.id}
                </h2>
                <p style={{ margin: 0, fontSize: "13px", color: "#c8dfd7" }}>
                  Registrada el {detailModalOrder.date} para {detailModalOrder.clientName}
                </p>
              </div>

              <div style={{ padding: "26px" }}>
                {/* Visualización de la Joya y Fotografía en Alta Resolución */}
                {detailModalOrder.items.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: "26px" }}>
                    <div style={{ display: "flex", gap: "22px", flexWrap: "wrap", alignItems: "flex-start", marginBottom: "20px" }}>
                      <div
                        style={{
                          width: "160px",
                          height: "160px",
                          borderRadius: "12px",
                          overflow: "hidden",
                          border: "1px solid #e5dfd4",
                          background: "#faf8f5",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={item.image || "/images/secret-garden-white.jpg"}
                          alt={item.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            e.currentTarget.src = "/images/secret-garden-white.jpg";
                          }}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: "240px" }}>
                        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "22px", color: "#0f2a24", margin: "0 0 6px" }}>
                          {item.name}
                        </h3>
                        <p style={{ fontSize: "13.5px", color: "#68776f", margin: "0 0 12px" }}>
                          Pieza de alta orfebrería realizada bajo pedido en taller de maestros joyeros.
                        </p>

                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
                          <span style={{ background: "#e8f3ee", color: "#0f2a24", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" }}>
                            {item.metal || "Metal Fino"}
                          </span>
                          <span style={{ background: "#f5f2eb", color: "#4d5953", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>
                            Talla: {item.size || "12"}
                          </span>
                          {item.engraving && (
                            <span style={{ background: "#fef3c7", color: "#92400e", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" }}>
                              <i className="bi bi-pen-fill" style={{ marginRight: "4px" }}></i> Grabado: «{item.engraving}»
                            </span>
                          )}
                          {(item.needsSizeAdvice || (typeof item.size === "string" && item.size.toLowerCase().includes("asesor"))) && (
                            <span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" }}>
                              <i className="bi bi-info-circle-fill" style={{ marginRight: "4px" }}></i> Asesoría de Medida
                            </span>
                          )}
                          <span style={{ background: "#fdf8ee", color: "#b45309", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>
                            Certificado GIA Incluido
                          </span>
                        </div>

                        <div style={{ fontSize: "20px", fontWeight: "700", color: "#0f2a24" }}>
                          {formatPrice(item.price * (item.quantity || 1))}
                        </div>
                      </div>
                    </div>

                    {/* Especificaciones Técnicas */}
                    <div className="order-detail-spec-grid">
                      <div className="order-detail-spec-item">
                        <label>Aleación / Metal</label>
                        <span>{item.metal || "Oro 18K / Platino 950"}</span>
                      </div>
                      <div className="order-detail-spec-item">
                        <label>Medida Exacta</label>
                        <span>{item.size || "Talla Estándar"}</span>
                      </div>
                      <div className="order-detail-spec-item">
                        <label>Gema Central / Diamante</label>
                        <span>{item.gemstone || "Diamante Natural GIA"}</span>
                      </div>
                      <div className="order-detail-spec-item">
                        <label>Grabado Personalizado</label>
                        <span style={{ color: item.engraving ? "#b45309" : "inherit", fontWeight: item.engraving ? "700" : "normal" }}>
                          {item.engraving ? `«${item.engraving}»` : "No solicitado"}
                        </span>
                      </div>
                      <div className="order-detail-spec-item">
                        <label>Asesoría de Medida</label>
                        <span>
                          {item.needsSizeAdvice || (typeof item.size === "string" && item.size.toLowerCase().includes("asesor"))
                            ? "Sí (Kit anillero / WhatsApp / Boutique)"
                            : "Medida confirmada"}
                        </span>
                      </div>
                      <div className="order-detail-spec-item">
                        <label>Tiempo Estimado Taller</label>
                        <span style={{ fontWeight: "700", color: (detailModalOrder.deliveryDays === 7 || item.deliveryDays === 7) ? "#b45309" : "#15803d" }}>
                          {(detailModalOrder.deliveryDays === 7 || item.deliveryDays === 7) ? "7 días hábiles (Ajuste Taller)" : "2 días hábiles (Exprés)"}
                        </span>
                      </div>
                      <div className="order-detail-spec-item">
                        <label>Acabado Superficial</label>
                        <span>Pulido Artesanal Espejo</span>
                      </div>
                      <div className="order-detail-spec-item">
                        <label>Garantía de Por Vida</label>
                        <span>Platino Care Incluida</span>
                      </div>
                      <div className="order-detail-spec-item">
                        <label>Estado de Pago</label>
                        <span style={{ color: "#15803d" }}>{detailModalOrder.paymentStatus}</span>
                      </div>
                      <div className="order-detail-spec-item">
                        <label>Medio de Pago</label>
                        <span style={{ fontWeight: 600, color: "#0f2a24" }}>{detailModalOrder.paymentMethod || "BCP"}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Control de Avance directo dentro del Modal */}
                <div
                  style={{
                    background: "#fdfbf7",
                    border: "1.5px solid #d8cdba",
                    borderRadius: "12px",
                    padding: "18px 20px",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "#7a8781" }}>
                        Control de Avance del Pedido
                      </span>
                      <h4 style={{ margin: "2px 0 0", color: "#0f2a24", fontSize: "16px" }}>
                        Fase: {getClientStageInfo(detailModalOrder.stage).label} (Paso {getClientStageInfo(detailModalOrder.stage).stepNumber} de 4)
                      </h4>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        className="btn-step-back"
                        onClick={() => {
                          handleStepBack(detailModalOrder.id);
                          setDetailModalOrder({
                            ...detailModalOrder,
                            stage: stepBackOrderStep(detailModalOrder.id).id,
                          });
                        }}
                      >
                        <i className="bi bi-arrow-left"></i> Paso Anterior
                      </button>

                      <button
                        type="button"
                        className="btn-advance-step"
                        onClick={() => {
                          const next = advanceOrderStep(detailModalOrder.id);
                          setDetailModalOrder({
                            ...detailModalOrder,
                            stage: next.id,
                          });
                        }}
                      >
                        <i className="bi bi-play-fill"></i> Siguiente Paso
                      </button>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: "13px", color: "#54635d" }}>
                    <strong>Nota actual del taller:</strong> {detailModalOrder.adminNotes || "En proceso según calendario."}
                  </p>
                </div>

                {/* Historial de Hitos (Timeline) */}
                {Array.isArray(detailModalOrder.timeline) && detailModalOrder.timeline.length > 0 && (
                  <div style={{ marginTop: "20px" }}>
                    <h5 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#7a8781", marginBottom: "12px" }}>
                      <i className="bi bi-clock-history"></i> Historial de Avance de Fabricación
                    </h5>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {detailModalOrder.timeline.map((t, tIdx) => (
                        <div
                          key={tIdx}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "12px",
                            padding: "8px 12px",
                            background: "#faf8f5",
                            borderRadius: "6px",
                            fontSize: "12.5px",
                          }}
                        >
                          <span style={{ fontWeight: "700", color: "#0f2a24", minWidth: "120px" }}>
                            {t.date}
                          </span>
                          <span style={{ color: "#3e4d46" }}>{t.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botones de acción del Modal */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px", paddingTop: "18px", borderTop: "1px solid #eee8df" }}>
                  <button
                    type="button"
                    className="btn-order-action"
                    onClick={() => setDetailModalOrder(null)}
                  >
                    Cerrar Detallado
                  </button>

                  <a
                    href={`https://wa.me/51927357217?text=Hola%20Platino%20Perú,%20estoy%20viendo%20el%20detallado%20de%20mi%20pedido%20${detailModalOrder.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-order-action whatsapp"
                  >
                    <i className="bi bi-whatsapp"></i> Hablar con Asesor
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
