import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getUserFavorites, removeFromFavorites } from "../services/favoritesService";
import { formatPrice } from "../data/products";
import { getAssetUrl } from "../utils/assetHelper";
import ringArtImg from "../assets/favorites-ring-art.png";

export default function Favorites({ addToCart }) {
  const { user, openAuthModal } = useAuth();
  const [favorites, setFavorites] = useState(() => (user?.email ? getUserFavorites(user.email) : []));
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    const syncFavs = () => {
      if (user?.email) {
        setFavorites(getUserFavorites(user.email));
      } else {
        setFavorites([]);
      }
    };

    syncFavs();

    window.addEventListener("platino_favorites_updated", syncFavs);
    window.addEventListener("platino_data_loaded", syncFavs);
    window.addEventListener("storage", syncFavs);
    return () => {
      window.removeEventListener("platino_favorites_updated", syncFavs);
      window.removeEventListener("platino_data_loaded", syncFavs);
      window.removeEventListener("storage", syncFavs);
    };
  }, [user?.email]);

  const handleRemove = (productId, productName) => {
    if (!user) return;
    removeFromFavorites(user.email, productId);
    setToastMsg(`«${productName}» se retiró de tus favoritos.`);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleAddToCart = (item) => {
    if (typeof addToCart === "function") {
      addToCart(item);
      setToastMsg(`¡${item.name} se agregó a tu bolsa de compras!`);
      setTimeout(() => setToastMsg(""), 3500);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "1160px", margin: "40px auto 90px", padding: "0 20px" }}>
      {/* Toast Notificación */}
      {toastMsg && (
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
          <i className="bi bi-heart-fill" style={{ color: "#e11d48", fontSize: "16px" }}></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Luxury cuando hay joyas favoritas guardadas */}
      {favorites.length > 0 && (
        <div style={{ maxWidth: "1060px", margin: "10px auto 32px" }}>
          <div className="favorites-hero-banner" style={{ minHeight: "290px" }}>
            <div className="favorites-hero-content" style={{ padding: "38px 42px", maxWidth: "620px" }}>
              <span
                style={{
                  display: "inline-block",
                  color: "#d1b47c",
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Tu Selección Exclusiva
              </span>

              <h1
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "clamp(28px, 3.5vw, 38px)",
                  color: "#ffffff",
                  fontWeight: "400",
                  lineHeight: "1.18",
                  margin: "0 0 10px",
                  letterSpacing: "-0.01em",
                }}
              >
                Joyas Favoritas
              </h1>

              <p
                style={{
                  fontSize: "14px",
                  color: "#d4ded9",
                  lineHeight: "1.55",
                  maxWidth: "480px",
                  margin: "0 0 20px",
                }}
              >
                Guarda las piezas de alta orfebrería que más te cautivan para compararlas, personalizarlas o agendar tu cita de prueba.
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(209, 180, 124, 0.4)",
                    padding: "7px 18px",
                    borderRadius: "9999px",
                    color: "#ffffff",
                    fontSize: "13.5px",
                    fontWeight: "600",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  <i className="bi bi-suit-heart-fill" style={{ color: "#d1b47c", fontSize: "14px" }}></i>
                  <span>
                    {favorites.length} {favorites.length === 1 ? "joya guardada" : "joyas guardadas"}
                    {user?.name ? ` en tu perfil de (${user.name})` : ""}
                  </span>
                </div>

                <Link
                  to="/catalogo"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#d1b47c",
                    fontSize: "13px",
                    fontWeight: "700",
                    textDecoration: "none",
                    padding: "7px 12px",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.transform = "translateX(2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#d1b47c";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <span>+ Seguir explorando catálogo</span>
                  <i className="bi bi-arrow-right" style={{ fontSize: "13px" }}></i>
                </Link>
              </div>
            </div>

            <div className="favorites-hero-image-wrap">
              <img
                src={ringArtImg || getAssetUrl("/images/favorites-ring-art.png")}
                alt="Anillo de diamantes Platino Perú"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getAssetUrl("/images/favorites-ring-art.png");
                }}
              />
              <div className="gradient-overlay" />
            </div>
          </div>
        </div>
      )}

      {/* SI NO HA INICIADO SESIÓN */}
      {!user ? (
        <div style={{ maxWidth: "1060px", margin: "10px auto 40px" }}>
          {/* Banner Hero Replicado en HTML/CSS */}
          <div className="favorites-hero-banner">
            <div className="favorites-hero-content">
              <span style={{ display: "inline-block", color: "#d1b47c", fontSize: "11.5px", fontWeight: "700", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "10px" }}>
                Tu Selección Exclusiva
              </span>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(30px, 3.8vw, 42px)", color: "#ffffff", fontWeight: "400", lineHeight: "1.18", margin: "0 0 14px", letterSpacing: "-0.01em" }}>
                Joyas Favoritas
              </h1>
              <p style={{ fontSize: "14.5px", color: "#d4ded9", lineHeight: "1.6", maxWidth: "460px", margin: "0 0 24px" }}>
                Guarda las piezas de alta orfebrería que más te cautivan para comprarlas, personalizarlas o agendar tu cita de prueba.
              </p>
              <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(6, 25, 20, 0.8)", border: "1.5px solid #d1b47c", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)" }}>
                <i className="bi bi-suit-heart-fill" style={{ color: "#d1b47c", fontSize: "16px" }}></i>
              </div>
              <p style={{ fontSize: "14.5px", color: "#ffffff", fontWeight: "600", letterSpacing: "0.01em", margin: "0 0 20px" }}>
                Aún no has guardado ninguna joya
              </p>
              <Link
                to="/catalogo"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "linear-gradient(135deg, #e4c588 0%, #caa159 100%)",
                  color: "#0f2a24",
                  padding: "12px 28px",
                  borderRadius: "9999px",
                  fontSize: "14px",
                  fontWeight: "700",
                  textDecoration: "none",
                  boxShadow: "0 6px 20px rgba(202, 161, 89, 0.35)",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(202, 161, 89, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(202, 161, 89, 0.35)";
                }}
              >
                <span>Explorar colección</span>
                <i className="bi bi-arrow-right" style={{ fontSize: "14px" }}></i>
              </Link>
            </div>
            <div className="favorites-hero-image-wrap">
              <img
                src={ringArtImg || getAssetUrl("/images/favorites-ring-art.png")}
                alt="Anillo de diamantes Platino Perú"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getAssetUrl("/images/favorites-ring-art.png");
                }}
              />
              <div className="gradient-overlay" />
            </div>
          </div>

          <div
            style={{
              background: "#faf8f5",
              border: "1.5px solid #ebe5da",
              borderRadius: "20px",
              padding: "42px 32px",
              textAlign: "center",
              maxWidth: "640px",
              margin: "0 auto",
              boxShadow: "0 15px 40px rgba(15, 42, 36, 0.05)",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "#f0ebe1",
                color: "#c5a059",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                margin: "0 auto 16px",
              }}
            >
              <i className="bi bi-person-lock"></i>
            </div>

            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "24px", color: "#0f2a24", margin: "0 0 10px" }}>
              Inicia sesión para ver tus Favoritos
            </h2>
            <p style={{ fontSize: "14px", color: "#5d6d65", lineHeight: "1.6", margin: "0 0 24px" }}>
              Para guardar tus piezas predilectas de forma permanente en tu perfil y acceder a ellas desde cualquier dispositivo, inicia sesión o regístrate en Platino Perú.
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="showroom-btn filled"
                onClick={() => openAuthModal("login")}
                style={{ borderRadius: "9999px", padding: "13px 28px", fontSize: "14px" }}
              >
                <i className="bi bi-box-arrow-in-right" style={{ marginRight: "6px" }}></i>
                Iniciar Sesión
              </button>

              <button
                type="button"
                className="showroom-btn outline"
                onClick={() => openAuthModal("register")}
                style={{ borderRadius: "9999px", padding: "13px 28px", fontSize: "14px" }}
              >
                <i className="bi bi-person-plus" style={{ marginRight: "6px" }}></i>
                Crear Cuenta
              </button>
            </div>
          </div>
        </div>
      ) : favorites.length === 0 ? (
        /* SI TIENE SESIÓN PERO NO TIENE FAVORITOS AÚN */
        <div style={{ maxWidth: "1060px", margin: "16px auto 50px" }}>
          <div className="favorites-hero-banner">
            <div className="favorites-hero-content">
              <span style={{ display: "inline-block", color: "#d1b47c", fontSize: "11.5px", fontWeight: "700", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "10px" }}>
                Tu Selección Exclusiva
              </span>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(30px, 3.8vw, 42px)", color: "#ffffff", fontWeight: "400", lineHeight: "1.18", margin: "0 0 14px", letterSpacing: "-0.01em" }}>
                Joyas Favoritas
              </h1>
              <p style={{ fontSize: "14.5px", color: "#d4ded9", lineHeight: "1.6", maxWidth: "460px", margin: "0 0 24px" }}>
                Guarda las piezas de alta orfebrería que más te cautivan para comprarlas, personalizarlas o agendar tu cita de prueba.
              </p>
              <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(6, 25, 20, 0.8)", border: "1.5px solid #d1b47c", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)" }}>
                <i className="bi bi-suit-heart-fill" style={{ color: "#d1b47c", fontSize: "16px" }}></i>
              </div>
              <p style={{ fontSize: "14.5px", color: "#ffffff", fontWeight: "600", letterSpacing: "0.01em", margin: "0 0 20px" }}>
                Aún no has guardado ninguna joya
              </p>
              <Link
                to="/catalogo"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "linear-gradient(135deg, #e4c588 0%, #caa159 100%)",
                  color: "#0f2a24",
                  padding: "12px 28px",
                  borderRadius: "9999px",
                  fontSize: "14px",
                  fontWeight: "700",
                  textDecoration: "none",
                  boxShadow: "0 6px 20px rgba(202, 161, 89, 0.35)",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(202, 161, 89, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(202, 161, 89, 0.35)";
                }}
              >
                <span>Explorar colección</span>
                <i className="bi bi-arrow-right" style={{ fontSize: "14px" }}></i>
              </Link>
            </div>
            <div className="favorites-hero-image-wrap">
              <img
                src={ringArtImg || getAssetUrl("/images/favorites-ring-art.png")}
                alt="Anillo de diamantes Platino Perú"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getAssetUrl("/images/favorites-ring-art.png");
                }}
              />
              <div className="gradient-overlay" />
            </div>
          </div>
        </div>
      ) : (
        /* LISTADO DE FAVORITOS DEL CLIENTE */
        <div style={{ maxWidth: "1060px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {favorites.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "#ffffff",
                  border: "1px solid #ebe5da",
                  borderRadius: "16px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.25s ease",
                  boxShadow: "0 6px 18px rgba(15, 42, 36, 0.04)",
                  position: "relative",
                }}
              >
                {/* Botón Quitar de Favoritos */}
                <button
                  type="button"
                  onClick={() => handleRemove(item.id, item.name)}
                  title="Quitar de favoritos"
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.9)",
                    border: "1px solid #eee8df",
                    color: "#e11d48",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 2,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  <i className="bi bi-heart-fill"></i>
                </button>

                {/* Imagen */}
                <Link to={`/producto/${item.id}`} style={{ display: "block", aspectRatio: "1 / 1", background: "#fbf9f6", overflow: "hidden" }}>
                  <img
                    src={getAssetUrl(item.image || "/images/secret-garden-white.jpg")}
                    alt={item.name}
                    style={{ width: "100%", height: "100%", objectFit: "contain", padding: "16px", transition: "transform 0.3s" }}
                    onError={(e) => {
                      e.currentTarget.src = "/images/secret-garden-white.jpg";
                    }}
                  />
                </Link>

                {/* Datos */}
                <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--platino-gold)", marginBottom: "4px" }}>
                    {item.metal || item.category || "Joyería Fina"}
                  </span>

                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "19px", color: "var(--platino-green-dark)", margin: "0 0 6px", lineHeight: "1.3" }}>
                    <Link to={`/producto/${item.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {item.name}
                    </Link>
                  </h3>

                  {item.subtitle && (
                    <p style={{ fontSize: "12px", color: "#6a7b73", margin: "0 0 12px" }}>
                      {item.subtitle}
                    </p>
                  )}

                  <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px solid #f2eee8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "18px", fontWeight: "700", color: "#0f2a24" }}>
                      {formatPrice(item.price)}
                    </span>
                  </div>

                  {/* Acciones */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "14px" }}>
                    <Link
                      to={`/producto/${item.id}`}
                      className="showroom-btn filled"
                      style={{ borderRadius: "9999px", padding: "10px 16px", textAlign: "center", textDecoration: "none", fontSize: "13px", fontWeight: "600" }}
                    >
                      Personalizar / Ver Joya
                    </Link>

                    {addToCart && (
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className="showroom-btn outline"
                        style={{ borderRadius: "9999px", padding: "9px 16px", fontSize: "12.5px" }}
                      >
                        <i className="bi bi-bag-plus" style={{ marginRight: "6px" }}></i>
                        Añadir a la Bolsa
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
  );
}
