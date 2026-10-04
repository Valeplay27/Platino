import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  getNosotrosContent,
  saveNosotrosContent,
  resetNosotrosContent,
} from "../services/nosotrosService";
import { getAssetUrl } from "../utils/assetHelper";

export default function Nosotros() {
  const { user, openAuthModal } = useAuth();
  const isAdmin =
    user?.role === "admin" ||
    user?.email?.toLowerCase() === "vladimiryt18@gmail.com";

  // Estado del contenido
  const [content, setContent] = useState(getNosotrosContent);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("historia");
  const [formData, setFormData] = useState(getNosotrosContent);
  const [toastMessage, setToastMessage] = useState(null);

  // Escuchar actualizaciones de contenido en tiempo real
  useEffect(() => {
    const handleUpdate = () => {
      const updated = getNosotrosContent();
      setContent(updated);
      setFormData(updated);
    };
    window.addEventListener("platino_nosotros_updated", handleUpdate);
    return () => window.removeEventListener("platino_nosotros_updated", handleUpdate);
  }, []);

  // Ocultar toast automáticamente
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg) => {
    setToastMessage(msg);
  };

  const handleFieldChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    const success = saveNosotrosContent(formData);
    if (success) {
      setContent(formData);
      showToast("¡Información institucional de Platino Perú guardada con éxito!");
      setIsEditing(false);
    } else {
      showToast("Error al guardar los cambios en el almacenamiento local.");
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        "¿Deseas restablecer todos los textos de la historia a los valores originales de fábrica?"
      )
    ) {
      const reset = resetNosotrosContent();
      setContent(reset);
      setFormData(reset);
      showToast("Se han restablecido los textos originales.");
      setIsEditing(false);
    }
  };

  return (
    <div
      className="nosotros-page"
      style={{
        backgroundColor: "#faf9f6",
        minHeight: "85vh",
        paddingBottom: "90px",
      }}
    >
      {/* Toast de notificación administrativa */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            zIndex: 100020,
            background: "#0f2d22",
            color: "#ffffff",
            padding: "16px 24px",
            borderRadius: "12px",
            boxShadow: "0 15px 35px rgba(0, 0, 0, 0.25)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "14px",
            fontFamily: "var(--font-sans)",
            border: "1px solid #c5a059",
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <i className="bi bi-check-circle-fill" style={{ color: "#c5a059", fontSize: "18px" }}></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================
          BARRA DE HERRAMIENTAS EXCLUSIVA PARA EL ADMINISTRADOR (VLADIMIR)
          ======================================================== */}
      {isAdmin && (
        <section
          style={{
            background: "#122a21",
            color: "#ffffff",
            padding: "14px 28px",
            borderBottom: "2px solid #c5a059",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
          }}
        >
          <div
            style={{
              maxWidth: "1320px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  background: "#c5a059",
                  color: "#122a21",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <i className="bi bi-shield-lock-fill"></i> Panel de Administrador
              </span>
              <span style={{ fontSize: "13.5px", color: "#e3ded3" }}>
                Conectado como <strong>Vladimir</strong> (<code>{user?.email || "vladimiryt18@gmail.com"}</code>)
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false);
                  } else {
                    setFormData(content);
                    setIsEditing(true);
                  }
                }}
                style={{
                  background: isEditing ? "#ffffff" : "#c5a059",
                  color: isEditing ? "#122a21" : "#0e231b",
                  border: "none",
                  padding: "8px 18px",
                  borderRadius: "9999px",
                  fontWeight: 700,
                  fontSize: "12.5px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                <i className={`bi ${isEditing ? "bi-eye" : "bi-pencil-square"}`}></i>
                {isEditing ? "Ver Vista Previa (Pública)" : "Editar Historia y Contenido"}
              </button>

              <button
                type="button"
                onClick={handleReset}
                title="Restablecer textos por defecto de la joyería"
                style={{
                  background: "transparent",
                  color: "#e2d7c5",
                  border: "1px solid rgba(226, 215, 197, 0.4)",
                  padding: "8px 14px",
                  borderRadius: "9999px",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <i className="bi bi-arrow-counterclockwise"></i>
                Restablecer
              </button>

              <Link
                to="/admin/citas"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                  textDecoration: "none",
                  padding: "8px 14px",
                  borderRadius: "9999px",
                  fontSize: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <i className="bi bi-speedometer2"></i>
                Dashboard Principal
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          PANEL DE EDICIÓN FLOTANTE / FORMULARIO ADMINISTRATIVO
          ======================================================== */}
      {isAdmin && isEditing && (
        <section
          style={{
            maxWidth: "1240px",
            margin: "30px auto 40px",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "32px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
              border: "1px solid #e5dfd2",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #ebe5d8",
                paddingBottom: "16px",
                marginBottom: "24px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "26px",
                    color: "var(--platino-green-dark)",
                    margin: 0,
                  }}
                >
                  Editor de Información Institucional (Nosotros)
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#617168" }}>
                  Modifica los textos, párrafos, visión, pilares y contactos que ven los clientes en esta sección.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={handleSave}
                  style={{
                    background: "var(--platino-green-dark)",
                    color: "#ffffff",
                    border: "none",
                    padding: "10px 24px",
                    borderRadius: "9999px",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(18, 42, 33, 0.2)",
                  }}
                >
                  <i className="bi bi-check2-circle" style={{ fontSize: "16px" }}></i>
                  Guardar Cambios
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{
                    background: "#f3efe6",
                    color: "#4a5750",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: "9999px",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Cerrar Editor
                </button>
              </div>
            </div>

            {/* Pestañas del Editor */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                borderBottom: "1px solid #eae5db",
                marginBottom: "28px",
                overflowX: "auto",
                paddingBottom: "4px",
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab("historia")}
                style={{
                  background: activeTab === "historia" ? "#0e2920" : "transparent",
                  color: activeTab === "historia" ? "#ffffff" : "#4f5f56",
                  border: "none",
                  padding: "9px 18px",
                  borderRadius: "9999px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                📜 1. Historia & Orígenes
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("hero")}
                style={{
                  background: activeTab === "hero" ? "#0e2920" : "transparent",
                  color: activeTab === "hero" ? "#ffffff" : "#4f5f56",
                  border: "none",
                  padding: "9px 18px",
                  borderRadius: "9999px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                🏛️ 2. Portada (Banner Principal)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("mision")}
                style={{
                  background: activeTab === "mision" ? "#0e2920" : "transparent",
                  color: activeTab === "mision" ? "#ffffff" : "#4f5f56",
                  border: "none",
                  padding: "9px 18px",
                  borderRadius: "9999px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                🎯 3. Misión & Visión
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("pilares")}
                style={{
                  background: activeTab === "pilares" ? "#0e2920" : "transparent",
                  color: activeTab === "pilares" ? "#ffffff" : "#4f5f56",
                  border: "none",
                  padding: "9px 18px",
                  borderRadius: "9999px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                💎 4. Pilares de Excelencia
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("contacto")}
                style={{
                  background: activeTab === "contacto" ? "#0e2920" : "transparent",
                  color: activeTab === "contacto" ? "#ffffff" : "#4f5f56",
                  border: "none",
                  padding: "9px 18px",
                  borderRadius: "9999px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                📍 5. Boutiques & Contacto
              </button>
            </div>

            {/* TAB 1: HISTORIA */}
            {activeTab === "historia" && (
              <div style={{ display: "grid", gap: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2d3c34", marginBottom: "6px" }}>
                      Rótulo Superior (Tag)
                    </label>
                    <input
                      type="text"
                      value={formData.historia.tag}
                      onChange={(e) => handleFieldChange("historia", "tag", e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2d3c34", marginBottom: "6px" }}>
                      Título de la Historia
                    </label>
                    <input
                      type="text"
                      value={formData.historia.title}
                      onChange={(e) => handleFieldChange("historia", "title", e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2d3c34", marginBottom: "6px" }}>
                    Año de Fundación / Inicio de Actividades
                  </label>
                  <input
                    type="text"
                    value={formData.historia.yearFounded}
                    onChange={(e) => handleFieldChange("historia", "yearFounded", e.target.value)}
                    style={{ width: "200px", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2d3c34", marginBottom: "6px" }}>
                    Primer Párrafo (Introducción y orígenes)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.historia.paragraph1}
                    onChange={(e) => handleFieldChange("historia", "paragraph1", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px", fontFamily: "inherit" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2d3c34", marginBottom: "6px" }}>
                    Segundo Párrafo (Proceso artesanal, orfebrería y técnica)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.historia.paragraph2}
                    onChange={(e) => handleFieldChange("historia", "paragraph2", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px", fontFamily: "inherit" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2d3c34", marginBottom: "6px" }}>
                    Tercer Párrafo (Compromiso con el cliente y tecnología 3D)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.historia.paragraph3}
                    onChange={(e) => handleFieldChange("historia", "paragraph3", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px", fontFamily: "inherit" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2d3c34", marginBottom: "6px" }}>
                      Ruta o URL de Imagen Institucional
                    </label>
                    <input
                      type="text"
                      value={formData.historia.image}
                      onChange={(e) => handleFieldChange("historia", "image", e.target.value)}
                      placeholder="/images/platino-logo-gold.jpg"
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px" }}
                    />
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                      <button
                        type="button"
                        onClick={() => handleFieldChange("historia", "image", "/images/platino-logo-gold.jpg")}
                        style={{ fontSize: "11px", padding: "4px 8px", background: "#f0ece1", border: "1px solid #dcd4c3", borderRadius: "4px", cursor: "pointer" }}
                      >
                        Logo Dorado
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFieldChange("historia", "image", "/images/platino-logo-emerald.jpg")}
                        style={{ fontSize: "11px", padding: "4px 8px", background: "#f0ece1", border: "1px solid #dcd4c3", borderRadius: "4px", cursor: "pointer" }}
                      >
                        Logo Esmeralda
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFieldChange("historia", "image", "/images/showroom.jpg")}
                        style={{ fontSize: "11px", padding: "4px 8px", background: "#f0ece1", border: "1px solid #dcd4c3", borderRadius: "4px", cursor: "pointer" }}
                      >
                        Showroom
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2d3c34", marginBottom: "6px" }}>
                      Leyenda de la Imagen
                    </label>
                    <input
                      type="text"
                      value={formData.historia.imageCaption}
                      onChange={(e) => handleFieldChange("historia", "imageCaption", e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: HERO */}
            {activeTab === "hero" && (
              <div style={{ display: "grid", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2d3c34", marginBottom: "6px" }}>
                    Rótulo Superior (Eyebrow)
                  </label>
                  <input
                    type="text"
                    value={formData.hero.eyebrow}
                    onChange={(e) => handleFieldChange("hero", "eyebrow", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2d3c34", marginBottom: "6px" }}>
                    Título Principal de la Portada
                  </label>
                  <input
                    type="text"
                    value={formData.hero.title}
                    onChange={(e) => handleFieldChange("hero", "title", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2d3c34", marginBottom: "6px" }}>
                    Subtítulo / Bajada Descriptiva
                  </label>
                  <textarea
                    rows={3}
                    value={formData.hero.subtitle}
                    onChange={(e) => handleFieldChange("hero", "subtitle", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px", fontFamily: "inherit" }}
                  />
                </div>
              </div>
            )}

            {/* TAB 3: MISIÓN & VISIÓN */}
            {activeTab === "mision" && (
              <div style={{ display: "grid", gap: "20px" }}>
                <div style={{ background: "#fbfaf7", padding: "18px", borderRadius: "10px", border: "1px solid #eee8db" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#2d3c34", marginBottom: "6px" }}>
                    Título de Misión
                  </label>
                  <input
                    type="text"
                    value={formData.misionVision.misionTitle}
                    onChange={(e) => handleFieldChange("misionVision", "misionTitle", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px", marginBottom: "12px" }}
                  />
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#2d3c34", marginBottom: "6px" }}>
                    Declaración de Misión
                  </label>
                  <textarea
                    rows={3}
                    value={formData.misionVision.misionText}
                    onChange={(e) => handleFieldChange("misionVision", "misionText", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px", fontFamily: "inherit" }}
                  />
                </div>

                <div style={{ background: "#fbfaf7", padding: "18px", borderRadius: "10px", border: "1px solid #eee8db" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#2d3c34", marginBottom: "6px" }}>
                    Título de Visión
                  </label>
                  <input
                    type="text"
                    value={formData.misionVision.visionTitle}
                    onChange={(e) => handleFieldChange("misionVision", "visionTitle", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px", marginBottom: "12px" }}
                  />
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#2d3c34", marginBottom: "6px" }}>
                    Declaración de Visión
                  </label>
                  <textarea
                    rows={3}
                    value={formData.misionVision.visionText}
                    onChange={(e) => handleFieldChange("misionVision", "visionText", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px", fontFamily: "inherit" }}
                  />
                </div>
              </div>
            )}

            {/* TAB 4: PILARES */}
            {activeTab === "pilares" && (
              <div style={{ display: "grid", gap: "20px" }}>
                {/* Pilar 1 */}
                <div style={{ background: "#fbfaf7", padding: "18px", borderRadius: "10px", border: "1px solid #eee8db" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#173729", fontSize: "14px" }}>Pilar 1 (Metales Nobles)</h4>
                  <input
                    type="text"
                    value={formData.pilares.pilar1Title}
                    onChange={(e) => handleFieldChange("pilares", "pilar1Title", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px", marginBottom: "10px" }}
                  />
                  <textarea
                    rows={2}
                    value={formData.pilares.pilar1Desc}
                    onChange={(e) => handleFieldChange("pilares", "pilar1Desc", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px", fontFamily: "inherit" }}
                  />
                </div>

                {/* Pilar 2 */}
                <div style={{ background: "#fbfaf7", padding: "18px", borderRadius: "10px", border: "1px solid #eee8db" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#173729", fontSize: "14px" }}>Pilar 2 (Gemología)</h4>
                  <input
                    type="text"
                    value={formData.pilares.pilar2Title}
                    onChange={(e) => handleFieldChange("pilares", "pilar2Title", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px", marginBottom: "10px" }}
                  />
                  <textarea
                    rows={2}
                    value={formData.pilares.pilar2Desc}
                    onChange={(e) => handleFieldChange("pilares", "pilar2Desc", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px", fontFamily: "inherit" }}
                  />
                </div>

                {/* Pilar 3 */}
                <div style={{ background: "#fbfaf7", padding: "18px", borderRadius: "10px", border: "1px solid #eee8db" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#173729", fontSize: "14px" }}>Pilar 3 (Garantía)</h4>
                  <input
                    type="text"
                    value={formData.pilares.pilar3Title}
                    onChange={(e) => handleFieldChange("pilares", "pilar3Title", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px", marginBottom: "10px" }}
                  />
                  <textarea
                    rows={2}
                    value={formData.pilares.pilar3Desc}
                    onChange={(e) => handleFieldChange("pilares", "pilar3Desc", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px", fontFamily: "inherit" }}
                  />
                </div>
              </div>
            )}

            {/* TAB 5: BOUTIQUES & CONTACTO */}
            {activeTab === "contacto" && (
              <div style={{ display: "grid", gap: "18px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2d3c34", marginBottom: "6px" }}>
                    Título del Banner de Atención
                  </label>
                  <input
                    type="text"
                    value={formData.talleresBoutiques.title}
                    onChange={(e) => handleFieldChange("talleresBoutiques", "title", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2d3c34", marginBottom: "6px" }}>
                    Descripción
                  </label>
                  <textarea
                    rows={2}
                    value={formData.talleresBoutiques.desc}
                    onChange={(e) => handleFieldChange("talleresBoutiques", "desc", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px", fontFamily: "inherit" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2d3c34", marginBottom: "6px" }}>
                      Sede Lima Centro
                    </label>
                    <input
                      type="text"
                      value={formData.talleresBoutiques.sedeLima}
                      onChange={(e) => handleFieldChange("talleresBoutiques", "sedeLima", e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2d3c34", marginBottom: "6px" }}>
                      Sede Miraflores
                    </label>
                    <input
                      type="text"
                      value={formData.talleresBoutiques.sedeMiraflores}
                      onChange={(e) => handleFieldChange("talleresBoutiques", "sedeMiraflores", e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2d3c34", marginBottom: "6px" }}>
                      WhatsApp de Atención
                    </label>
                    <input
                      type="text"
                      value={formData.talleresBoutiques.whatsapp}
                      onChange={(e) => handleFieldChange("talleresBoutiques", "whatsapp", e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2d3c34", marginBottom: "6px" }}>
                      Teléfono Fijo
                    </label>
                    <input
                      type="text"
                      value={formData.talleresBoutiques.telefono}
                      onChange={(e) => handleFieldChange("talleresBoutiques", "telefono", e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2d3c34", marginBottom: "6px" }}>
                      Horarios de Atención
                    </label>
                    <input
                      type="text"
                      value={formData.talleresBoutiques.horario}
                      onChange={(e) => handleFieldChange("talleresBoutiques", "horario", e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d2cbbe", fontSize: "13.5px" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================
          VISTA PÚBLICA / PRESENTACIÓN DE ALTA JOYERÍA
          ======================================================== */}
      {/* 1. Banner Principal (Hero) */}
      <header
        style={{
          background: content.hero.bannerGradient || "linear-gradient(135deg, #0e2920 0%, #15392d 100%)",
          color: "#ffffff",
          padding: "70px 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: "820px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <span
            style={{
              display: "inline-block",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#c5a059",
              marginBottom: "14px",
            }}
          >
            {content.hero.eyebrow}
          </span>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(34px, 4.5vw, 54px)",
              margin: "0 0 16px 0",
              fontWeight: 500,
              lineHeight: 1.15,
            }}
          >
            {content.hero.title}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "15px",
              color: "rgba(255, 255, 255, 0.85)",
              lineHeight: 1.7,
              maxWidth: "680px",
              margin: "0 auto",
            }}
          >
            {content.hero.subtitle}
          </p>
        </div>
      </header>

      {/* 2. Contenido Central */}
      <main style={{ maxWidth: "1200px", margin: "60px auto 0", padding: "0 24px" }}>
        {/* Sección: Nuestra Historia & Legado */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "50px",
            alignItems: "center",
            marginBottom: "70px",
            background: "#ffffff",
            padding: "50px 44px",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
            border: "1px solid #eee8dc",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  color: "#1e3d30",
                  textTransform: "uppercase",
                }}
              >
                {content.historia.tag}
              </span>
              {content.historia.yearFounded && (
                <span
                  style={{
                    background: "#f4eee2",
                    color: "#997328",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "20px",
                  }}
                >
                  DESDE {content.historia.yearFounded}
                </span>
              )}
            </div>

            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "34px",
                color: "var(--platino-green-dark)",
                margin: "0 0 20px 0",
              }}
            >
              {content.historia.title}
            </h2>

            {content.historia.paragraph1 && (
              <p style={{ fontSize: "14.5px", lineHeight: "1.8", color: "#506057", marginBottom: "16px" }}>
                {content.historia.paragraph1}
              </p>
            )}

            {content.historia.paragraph2 && (
              <p style={{ fontSize: "14.5px", lineHeight: "1.8", color: "#506057", marginBottom: "16px" }}>
                {content.historia.paragraph2}
              </p>
            )}

            {content.historia.paragraph3 && (
              <p style={{ fontSize: "14.5px", lineHeight: "1.8", color: "#506057", margin: 0 }}>
                {content.historia.paragraph3}
              </p>
            )}
          </div>

          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "inline-block",
                padding: "14px",
                background: "#faf8f5",
                borderRadius: "20px",
                border: "1px solid #e7ded0",
                boxShadow: "0 12px 30px rgba(0, 0, 0, 0.05)",
              }}
            >
              <img
                src={getAssetUrl(content.historia.image || "/images/platino-logo-gold.jpg")}
                alt={content.historia.imageCaption || "Platino Perú Insignia"}
                style={{
                  maxWidth: "280px",
                  width: "100%",
                  height: "auto",
                  borderRadius: "14px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              {content.historia.imageCaption && (
                <span
                  style={{
                    display: "block",
                    marginTop: "10px",
                    fontSize: "12px",
                    color: "#74827a",
                    fontStyle: "italic",
                  }}
                >
                  {content.historia.imageCaption}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Sección: Misión y Visión */}
        {(content.misionVision.misionText || content.misionVision.visionText) && (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "28px",
              marginBottom: "70px",
            }}
          >
            {content.misionVision.misionText && (
              <div
                style={{
                  background: "linear-gradient(145deg, #ffffff 0%, #fbf9f4 100%)",
                  padding: "36px 32px",
                  borderRadius: "16px",
                  border: "1px solid #ebd9b8",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.02)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-15px",
                    right: "-15px",
                    fontSize: "80px",
                    color: "rgba(197, 160, 89, 0.08)",
                    fontFamily: "var(--font-serif)",
                    lineHeight: 1,
                  }}
                >
                  M
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <i className="bi bi-compass" style={{ fontSize: "24px", color: "var(--platino-gold)" }}></i>
                  <h3
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "22px",
                      color: "var(--platino-green-dark)",
                      margin: 0,
                    }}
                  >
                    {content.misionVision.misionTitle}
                  </h3>
                </div>
                <p style={{ fontSize: "14px", lineHeight: "1.8", color: "#55645c", margin: 0 }}>
                  {content.misionVision.misionText}
                </p>
              </div>
            )}

            {content.misionVision.visionText && (
              <div
                style={{
                  background: "linear-gradient(145deg, #ffffff 0%, #fbf9f4 100%)",
                  padding: "36px 32px",
                  borderRadius: "16px",
                  border: "1px solid #ebd9b8",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.02)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-15px",
                    right: "-15px",
                    fontSize: "80px",
                    color: "rgba(197, 160, 89, 0.08)",
                    fontFamily: "var(--font-serif)",
                    lineHeight: 1,
                  }}
                >
                  V
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <i className="bi bi-eye" style={{ fontSize: "24px", color: "var(--platino-gold)" }}></i>
                  <h3
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "22px",
                      color: "var(--platino-green-dark)",
                      margin: 0,
                    }}
                  >
                    {content.misionVision.visionTitle}
                  </h3>
                </div>
                <p style={{ fontSize: "14px", lineHeight: "1.8", color: "#55645c", margin: 0 }}>
                  {content.misionVision.visionText}
                </p>
              </div>
            )}
          </section>
        )}

        {/* 3. Pilares de Confianza */}
        <section style={{ marginBottom: "70px" }}>
          <h2
            style={{
              textAlign: "center",
              fontFamily: "var(--font-serif)",
              fontSize: "30px",
              color: "var(--platino-green-dark)",
              marginBottom: "36px",
            }}
          >
            Nuestros Pilares de Confianza
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                padding: "32px 26px",
                borderRadius: "12px",
                border: "1px solid #ebe5d8",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)",
              }}
            >
              <i
                className={`bi ${content.pilares.pilar1Icon || "bi-shield-check"}`}
                style={{ fontSize: "32px", color: "#c5a059", display: "block", marginBottom: "14px" }}
              ></i>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "19px", margin: "0 0 10px 0", color: "#193529" }}>
                {content.pilares.pilar1Title}
              </h3>
              <p style={{ fontSize: "13px", lineHeight: "1.7", color: "#607067", margin: 0 }}>
                {content.pilares.pilar1Desc}
              </p>
            </div>

            <div
              style={{
                background: "#ffffff",
                padding: "32px 26px",
                borderRadius: "12px",
                border: "1px solid #ebe5d8",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)",
              }}
            >
              <i
                className={`bi ${content.pilares.pilar2Icon || "bi-gem"}`}
                style={{ fontSize: "32px", color: "#c5a059", display: "block", marginBottom: "14px" }}
              ></i>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "19px", margin: "0 0 10px 0", color: "#193529" }}>
                {content.pilares.pilar2Title}
              </h3>
              <p style={{ fontSize: "13px", lineHeight: "1.7", color: "#607067", margin: 0 }}>
                {content.pilares.pilar2Desc}
              </p>
            </div>

            <div
              style={{
                background: "#ffffff",
                padding: "32px 26px",
                borderRadius: "12px",
                border: "1px solid #ebe5d8",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)",
              }}
            >
              <i
                className={`bi ${content.pilares.pilar3Icon || "bi-award"}`}
                style={{ fontSize: "32px", color: "#c5a059", display: "block", marginBottom: "14px" }}
              ></i>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "19px", margin: "0 0 10px 0", color: "#193529" }}>
                {content.pilares.pilar3Title}
              </h3>
              <p style={{ fontSize: "13px", lineHeight: "1.7", color: "#607067", margin: 0 }}>
                {content.pilares.pilar3Desc}
              </p>
            </div>
          </div>
        </section>

        {/* 4. Banner de Boutiques, Talleres y Contacto */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #ebe7df",
            padding: "44px 38px",
            borderRadius: "16px",
            boxShadow: "0 4px 18px rgba(0, 0, 0, 0.03)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "24px",
              marginBottom: "28px",
              borderBottom: "1px solid #f1ece4",
              paddingBottom: "24px",
            }}
          >
            <div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "26px", color: "var(--platino-green-dark)", margin: "0 0 8px 0" }}>
                {content.talleresBoutiques.title}
              </h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#66726c", maxWidth: "680px" }}>
                {content.talleresBoutiques.desc}
              </p>
            </div>

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <Link
                to="/agendar-cita"
                className="showroom-btn filled"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  borderRadius: "9999px",
                  background: "var(--platino-green-dark)",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
              >
                <i className="bi bi-calendar-check"></i>
                Agendar Cita en Boutique
              </Link>

              <Link
                to="/sedes"
                className="showroom-btn outline"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  borderRadius: "9999px",
                  border: "1.5px solid var(--platino-green-dark)",
                  color: "var(--platino-green-dark)",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
              >
                <i className="bi bi-geo-alt"></i>
                Ver Nuestras Sedes
              </Link>
            </div>
          </div>

          {/* Información de contacto rápida */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              fontSize: "13px",
              color: "#57665e",
            }}
          >
            <div>
              <strong style={{ color: "#1a362b", display: "block", marginBottom: "4px" }}>
                <i className="bi bi-geo-fill" style={{ color: "#c5a059", marginRight: "6px" }}></i>
                Sedes de Atención:
              </strong>
              <div>{content.talleresBoutiques.sedeLima}</div>
              <div>{content.talleresBoutiques.sedeMiraflores}</div>
            </div>

            <div>
              <strong style={{ color: "#1a362b", display: "block", marginBottom: "4px" }}>
                <i className="bi bi-telephone-fill" style={{ color: "#c5a059", marginRight: "6px" }}></i>
                Teléfonos de Contacto:
              </strong>
              <div>Fijo: {content.talleresBoutiques.telefono}</div>
              <div>
                WhatsApp:{" "}
                <a
                  href={`https://wa.me/${(content.talleresBoutiques.whatsapp || "").replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#15803d", fontWeight: 600, textDecoration: "none" }}
                >
                  {content.talleresBoutiques.whatsapp}
                </a>
              </div>
            </div>

            <div>
              <strong style={{ color: "#1a362b", display: "block", marginBottom: "4px" }}>
                <i className="bi bi-clock-fill" style={{ color: "#c5a059", marginRight: "6px" }}></i>
                Horario de Showroom:
              </strong>
              <div>{content.talleresBoutiques.horario}</div>
            </div>
          </div>
        </div>

        {/* Acceso para el administrador si aún no ha iniciado sesión */}
        {!isAdmin && (
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              style={{
                background: "transparent",
                border: "none",
                color: "#9aa39d",
                fontSize: "12px",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              ¿Eres Vladimir? Inicia sesión aquí como administrador para editar la historia.
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
