import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getUserFavorites, removeFromFavorites } from "../services/favoritesService";
import { formatPrice } from "../data/products";
import { getAssetUrl } from "../utils/assetHelper";

export default function Favorites({ addToCart }) {
  const { user, openAuthModal } = useAuth();
  const [favorites, setFavorites] = useState(() => (user ? getUserFavorites(user.email) : []));
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    if (user) {
      setFavorites(getUserFavorites(user.email));
    } else {
      setFavorites([]);
    }

    const handleUpdate = () => {
      if (user) setFavorites(getUserFavorites(user.email));
    };

    window.addEventListener("platino_favorites_updated", handleUpdate);
    return () => window.removeEventListener("platino_favorites_updated", handleUpdate);
  }, [user]);

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

      {/* Header */}
      <header className="page-heading" style={{ marginBottom: "32px", textAlign: "left" }}>
        <span className="eyebrow" style={{ color: "var(--platino-gold)", letterSpacing: "0.15em", textTransform: "uppercase", fontSize: "12px", fontWeight: "700" }}>
          Tu Selección Exclusiva
        </span>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "36px", color: "var(--platino-green-dark)", margin: "6px 0 10px" }}>
          Joyas Favoritas
        </h1>
        <p style={{ color: "#607067", fontSize: "15px", maxWidth: "680px" }}>
          Guarda las piezas de alta orfebrería que más te cautivan para compararlas, personalizarlas o agendar tu cita de prueba.
        </p>
      </header>

      {/* SI NO HA INICIADO SESIÓN */}
      {!user ? (
        <div
          style={{
            background: "#faf8f5",
            border: "1.5px solid #ebe5da",
            borderRadius: "20px",
            padding: "48px 32px",
            textAlign: "center",
            maxWidth: "640px",
            margin: "0 auto",
            boxShadow: "0 15px 40px rgba(15, 42, 36, 0.05)",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "#f0ebe1",
              color: "#c5a059",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              margin: "0 auto 20px",
            }}
          >
            <i className="bi bi-person-lock"></i>
          </div>

          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "26px", color: "#0f2a24", margin: "0 0 12px" }}>
            Inicia sesión para ver tus Favoritos
          </h2>
          <p style={{ fontSize: "14px", color: "#5d6d65", lineHeight: "1.6", margin: "0 0 28px" }}>
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
      ) : favorites.length === 0 ? (
        /* SI TIENE SESIÓN PERO NO TIENE FAVORITOS AÚN */
        <div
          style={{
            background: "#faf8f5",
            border: "1.5px solid #ebe5da",
            borderRadius: "20px",
            padding: "50px 30px",
            textAlign: "center",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              background: "#fee2e2",
              color: "#e11d48",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              margin: "0 auto 18px",
            }}
          >
            <i className="bi bi-heart"></i>
          </div>

          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "24px", color: "#0f2a24", margin: "0 0 10px" }}>
            Aún no has guardado ninguna joya
          </h2>
          <p style={{ fontSize: "14px", color: "#5d6d65", lineHeight: "1.6", margin: "0 0 24px" }}>
            Explora nuestra colección de anillos de compromiso, aros de matrimonio y alta orfebrería, y haz clic en el icono de corazón o estrella para guardarlos en tu perfil.
          </p>

          <Link
            to="/catalogo"
            className="showroom-btn filled"
            style={{ borderRadius: "9999px", padding: "13px 30px", textDecoration: "none", display: "inline-block" }}
          >
            Explorar Colección
          </Link>
        </div>
      ) : (
        /* LISTADO DE FAVORITOS DEL CLIENTE */
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <span style={{ fontSize: "14px", color: "#48564f", fontWeight: "600" }}>
              {favorites.length} {favorites.length === 1 ? "joya guardada" : "joyas guardadas"} en tu perfil de ({user.name || user.email})
            </span>

            <Link to="/catalogo" style={{ fontSize: "13px", color: "var(--platino-green-dark)", fontWeight: "600", textDecoration: "underline" }}>
              + Seguir explorando catálogo
            </Link>
          </div>

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
