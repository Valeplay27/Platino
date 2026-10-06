import React, { useState, useEffect } from "react";
import {
  getPlatinoCareConfig,
  savePlatinoCareConfig,
  resetPlatinoCareConfig,
} from "../services/platinoCareService";

export default function AdminPlatinoCareTab({ isMaster = true }) {
  const [config, setConfig] = useState(() => getPlatinoCareConfig());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewPlan, setPreviewPlan] = useState("plus");
  const [openPreviewAccordion, setOpenPreviewAccordion] = useState(1);

  // Sincronizar si cambia externamente
  useEffect(() => {
    const handleUpdate = () => {
      setConfig(getPlatinoCareConfig());
    };
    window.addEventListener("platino_care_updated", handleUpdate);
    return () => window.removeEventListener("platino_care_updated", handleUpdate);
  }, []);

  const handleSave = (e) => {
    e?.preventDefault();
    const updated = savePlatinoCareConfig(config);
    setConfig(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleReset = () => {
    if (
      window.confirm(
        "¿Deseas restablecer todos los textos y el precio de Platino Care a los valores originales de fábrica?"
      )
    ) {
      const reset = resetPlatinoCareConfig();
      setConfig(reset);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };

  const handleBenefitChange = (index, field, value) => {
    const newBenefits = [...config.benefits];
    newBenefits[index] = { ...newBenefits[index], [field]: value };
    setConfig({ ...config, benefits: newBenefits });
  };

  const handleAddBenefit = () => {
    const newId = Date.now();
    setConfig({
      ...config,
      benefits: [
        ...config.benefits,
        {
          id: newId,
          title: "Nuevo beneficio de garantía",
          content: "Detalle de cobertura técnica o mantenimiento especializado para la joya.",
          icon: "bi-patch-check-fill",
        },
      ],
    });
  };

  const handleRemoveBenefit = (index) => {
    if (config.benefits.length <= 1) {
      alert("Debe existir al menos un beneficio de garantía registrado.");
      return;
    }
    const newBenefits = config.benefits.filter((_, idx) => idx !== index);
    setConfig({ ...config, benefits: newBenefits });
  };

  return (
    <div className="admin-content-card" style={{ maxWidth: "1280px", margin: "0 auto" }}>
      {/* Encabezado Principal */}
      <div
        style={{
          background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
          color: "#ffffff",
          padding: "28px 32px",
          borderRadius: "12px",
          marginBottom: "28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          boxShadow: "0 10px 25px -5px rgba(17, 59, 58, 0.25)",
        }}
      >
        <div style={{ maxWidth: "720px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span
              style={{
                background: "rgba(198, 172, 127, 0.2)",
                color: "#C6AC7F",
                border: "1px solid rgba(198, 172, 127, 0.4)",
                padding: "3px 10px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              <i className="bi bi-shield-fill-check"></i> PROGRAMA DE GARANTÍA VITALICIA
            </span>
            <span
              style={{
                background: "#22c55e",
                color: "#ffffff",
                padding: "2px 8px",
                borderRadius: "10px",
                fontSize: "10.5px",
                fontWeight: "700",
              }}
            >
              EN VIVO EN TIENDA
            </span>
          </div>
          <h2 style={{ fontSize: "26px", margin: "0 0 6px 0", color: "#ffffff", fontWeight: "600" }}>
            Gestión y Tarifas de Platino Care
          </h2>
          <p style={{ margin: 0, fontSize: "14px", color: "rgba(255, 255, 255, 0.85)", lineHeight: "1.5" }}>
            Modifica las tarifas de Platino Care +, las descripciones de los planes y los beneficios
            del programa de cuidado que los clientes ven al configurar sus sortijas y joyas.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              background: "rgba(255, 255, 255, 0.12)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              padding: "10px 18px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
          >
            <i className="bi bi-arrow-counterclockwise"></i> Restablecer
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              background: "#C6AC7F",
              color: "#113B3A",
              border: "none",
              padding: "10px 22px",
              borderRadius: "8px",
              fontSize: "13.5px",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
              transition: "all 0.2s",
            }}
          >
            <i className="bi bi-floppy-fill"></i> Guardar Cambios
          </button>
        </div>
      </div>

      {/* Alerta de Éxito */}
      {saveSuccess && (
        <div
          style={{
            background: "#F2F9F2",
            border: "1.5px solid #113B3A",
            color: "#113B3A",
            padding: "14px 20px",
            borderRadius: "8px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontWeight: "600",
            fontSize: "14px",
            boxShadow: "0 4px 12px rgba(17, 59, 58, 0.08)",
          }}
        >
          <i className="bi bi-check-circle-fill" style={{ fontSize: "20px", color: "#113B3A" }}></i>
          <span>
            ¡Cambios guardados con éxito! La ficha del producto y el carrito ahora muestran las nuevas tarifas y coberturas de Platino Care.
          </span>
        </div>
      )}

      {/* Grid: Editor a la Izquierda + Live Preview a la Derecha */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "28px", alignItems: "start" }}>
        {/* COLUMNA 1: FORMULARIO DE EDICIÓN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Card 1: Tarifas y Planes */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <h3
              style={{
                fontSize: "17px",
                fontWeight: "700",
                color: "#113B3A",
                margin: "0 0 16px 0",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <i className="bi bi-tags-fill" style={{ color: "#C6AC7F" }}></i>
              Precios y Configuración de Planes
            </h3>

            {/* Plan Plus */}
            <div
              style={{
                background: "#FDF9F2",
                border: "1.5px solid #C6AC7F",
                borderRadius: "8px",
                padding: "18px",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontWeight: "700", color: "#113B3A", fontSize: "14.5px" }}>
                  PLAN PLATINO CARE + (COBERTURA TOTAL)
                </span>
                <span
                  style={{
                    background: "#113B3A",
                    color: "#C6AC7F",
                    fontSize: "10.5px",
                    fontWeight: "700",
                    padding: "2px 8px",
                    borderRadius: "4px",
                  }}
                >
                  UPGRADE DE PAGO
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                    Precio de Platino Care + (S/.)
                  </label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <span style={{ position: "absolute", left: "10px", fontWeight: "700", color: "#113B3A" }}>S/.</span>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={config.plus.price}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        setConfig({
                          ...config,
                          plus: {
                            ...config.plus,
                            price: val,
                            priceFormatted: `S/. ${val}`,
                            subtitle: `PAGO ÚNICO S/. ${val}`,
                          },
                        });
                      }}
                      style={{
                        width: "100%",
                        padding: "8px 12px 8px 38px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#113B3A",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                    Texto del Botón
                  </label>
                  <input
                    type="text"
                    value={config.plus.title}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        plus: { ...config.plus, title: e.target.value },
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                  Descripción / Beneficios Exclusivos de Platino Care +
                </label>
                <textarea
                  rows="3"
                  value={config.plus.description}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      plus: { ...config.plus, description: e.target.value },
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "12.5px",
                    lineHeight: "1.4",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>

            {/* Plan Cortesía */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "18px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontWeight: "700", color: "#334155", fontSize: "14px" }}>
                  PLAN PLATINO CARE CORTESÍA (INCLUIDO)
                </span>
                <span
                  style={{
                    background: "#e2e8f0",
                    color: "#475569",
                    fontSize: "10.5px",
                    fontWeight: "700",
                    padding: "2px 8px",
                    borderRadius: "4px",
                  }}
                >
                  GRATIS S/. 0
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                    Texto del Botón
                  </label>
                  <input
                    type="text"
                    value={config.cortesia.title}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        cortesia: { ...config.cortesia, title: e.target.value },
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                    Subtítulo / Etiqueta de Cortesía
                  </label>
                  <input
                    type="text"
                    value={config.cortesia.subtitle}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        cortesia: { ...config.cortesia, subtitle: e.target.value },
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "13px",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                  Descripción del Plan Cortesía
                </label>
                <textarea
                  rows="2"
                  value={config.cortesia.description}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      cortesia: { ...config.cortesia, description: e.target.value },
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "12.5px",
                    lineHeight: "1.4",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Beneficios y Acordeones del Producto */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "#113B3A",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <i className="bi bi-list-check" style={{ color: "#C6AC7F" }}></i>
                Coberturas y Acordeones en Ficha de Joya
              </h3>
              <button
                type="button"
                onClick={handleAddBenefit}
                style={{
                  background: "#F2F9F2",
                  color: "#113B3A",
                  border: "1px solid #113B3A",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <i className="bi bi-plus-circle-fill"></i> Añadir Cobertura
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {config.benefits.map((b, idx) => (
                <div
                  key={b.id || idx}
                  style={{
                    background: "#fbfcfb",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "16px",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#113B3A" }}>
                      Acordeón #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBenefit(idx)}
                      title="Eliminar este beneficio"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        fontSize: "14px",
                        padding: "2px 6px",
                      }}
                    >
                      <i className="bi bi-trash3"></i>
                    </button>
                  </div>

                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ display: "block", fontSize: "11.5px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
                      Título de la Cobertura
                    </label>
                    <input
                      type="text"
                      value={b.title}
                      onChange={(e) => handleBenefitChange(idx, "title", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "5px",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#113B3A",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
                      Explicación / Detalle de la Garantía
                    </label>
                    <textarea
                      rows="2"
                      value={b.content}
                      onChange={(e) => handleBenefitChange(idx, "content", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "5px",
                        fontSize: "12.5px",
                        lineHeight: "1.4",
                        resize: "vertical",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Términos y Cláusula */}
            <div style={{ marginTop: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                Nota Legal / Condiciones al Pie
              </label>
              <input
                type="text"
                value={config.termsNote}
                onChange={(e) => setConfig({ ...config, termsNote: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              />
            </div>
          </div>
        </div>

        {/* COLUMNA 2: LIVE PREVIEW (CÓMO LO VE EL CLIENTE) */}
        <div style={{ position: "sticky", top: "100px" }}>
          <div
            style={{
              background: "#ffffff",
              border: "1.5px solid #C6AC7F",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 10px 30px rgba(17, 59, 58, 0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "14px",
                borderBottom: "1px solid #f1f5f9",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="bi bi-eye-fill" style={{ color: "#C6AC7F", fontSize: "18px" }}></i>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#113B3A", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Vista Previa en Ficha de Joya
                </span>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  background: "#FDF9F2",
                  color: "#a08453",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontWeight: "700",
                }}
              >
                Paso 3 de Compra
              </span>
            </div>

            {/* Banner Platino Care Simulado */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "#FDF9F2",
                border: "1px solid rgba(198, 172, 127, 0.4)",
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "#113B3A",
                  color: "#C6AC7F",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                }}
              >
                <i className="bi bi-shield-check"></i>
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "#113B3A" }}>
                  {config.name}
                </h4>
                <span style={{ fontSize: "10.5px", color: "#a08453", fontWeight: "700", letterSpacing: "0.06em" }}>
                  {config.tagline}
                </span>
              </div>
            </div>

            {/* Acordeones Interactivos en Preview */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
              {config.benefits.map((item, idx) => {
                const isOpen = openPreviewAccordion === (idx + 1);
                return (
                  <div
                    key={item.id || idx}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      overflow: "hidden",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenPreviewAccordion(isOpen ? null : idx + 1)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: isOpen ? "#F2F9F2" : "#ffffff",
                        border: "none",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "12.5px",
                        fontWeight: "600",
                        color: "#113B3A",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <i className={`bi ${item.icon || "bi-check-circle"}`} style={{ color: "#C6AC7F" }}></i>
                        {item.title}
                      </span>
                      <i className={`bi ${isOpen ? "bi-chevron-up" : "bi-chevron-down"}`} style={{ fontSize: "11px", color: "#64748b" }}></i>
                    </button>
                    {isOpen && (
                      <div
                        style={{
                          padding: "10px 14px",
                          background: "#ffffff",
                          fontSize: "12px",
                          color: "#475569",
                          lineHeight: "1.45",
                          borderTop: "1px solid #f1f5f9",
                        }}
                      >
                        {item.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Botones de Selección de Plan en Preview */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
              {/* Botón Plus */}
              <button
                type="button"
                onClick={() => setPreviewPlan("plus")}
                style={{
                  border: previewPlan === "plus" ? "2px solid #113B3A" : "1px solid #cbd5e1",
                  background: previewPlan === "plus" ? "#F2F9F2" : "#ffffff",
                  borderRadius: "8px",
                  padding: "12px 10px",
                  cursor: "pointer",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: "11.5px", fontWeight: "800", color: "#113B3A" }}>
                  {config.plus.title}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    background: "#113B3A",
                    color: "#C6AC7F",
                    padding: "2px 8px",
                    borderRadius: "4px",
                  }}
                >
                  S/. {config.plus.price}
                </span>
              </button>

              {/* Botón Cortesía */}
              <button
                type="button"
                onClick={() => setPreviewPlan("cortesia")}
                style={{
                  border: previewPlan === "cortesia" ? "2px solid #113B3A" : "1px solid #cbd5e1",
                  background: previewPlan === "cortesia" ? "#F2F9F2" : "#ffffff",
                  borderRadius: "8px",
                  padding: "12px 10px",
                  cursor: "pointer",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: "11.5px", fontWeight: "800", color: "#113B3A" }}>
                  {config.cortesia.title}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#64748b",
                  }}
                >
                  {config.cortesia.subtitle}
                </span>
              </button>
            </div>

            {/* Impacto en el Total */}
            <div
              style={{
                background: "#f8fafc",
                padding: "12px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#475569" }}>
                Seleccionado:{" "}
                <strong>{previewPlan === "plus" ? "Platino Care +" : "Platino Care Cortesía"}</strong>
              </span>
              <span style={{ fontWeight: "800", color: "#113B3A", fontSize: "13px" }}>
                {previewPlan === "plus" ? `+ S/. ${config.plus.price}` : "+ S/. 0"}
              </span>
            </div>

            {config.termsNote && (
              <p style={{ margin: "10px 0 0 0", fontSize: "10.5px", color: "#94a3b8", fontStyle: "italic", textAlign: "center" }}>
                {config.termsNote}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
