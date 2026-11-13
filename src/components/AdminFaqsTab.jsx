import { useState, useEffect } from "react";
import {
  getGlobalFaqs,
  addFaq,
  updateFaq,
  deleteFaq,
  moveFaq,
  resetFaqsToDefault,
} from "../services/faqsService";

export default function AdminFaqsTab() {
  const [faqs, setFaqs] = useState(() => getGlobalFaqs());
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [previewOpenIdx, setPreviewOpenIdx] = useState(0);

  // Formulario temporal
  const [formQ, setFormQ] = useState("");
  const [formA, setFormA] = useState("");
  const [feedback, setFeedback] = useState("");

  const showFeedbackMsg = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 4000);
  };

  const reloadFaqs = () => {
    setFaqs(getGlobalFaqs());
  };

  useEffect(() => {
    const handleUpdate = () => reloadFaqs();
    window.addEventListener("platino_faqs_updated", handleUpdate);
    return () => window.removeEventListener("platino_faqs_updated", handleUpdate);
  }, []);

  const handleStartAdd = () => {
    setEditingId(null);
    setFormQ("");
    setFormA("");
    setIsAdding(true);
  };

  const handleStartEdit = (faq) => {
    setIsAdding(false);
    setEditingId(faq.id);
    setFormQ(faq.q);
    setFormA(faq.a);
  };

  const handleCancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormQ("");
    setFormA("");
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (!formQ.trim() || !formA.trim()) {
      alert("Por favor completa tanto la pregunta como la respuesta.");
      return;
    }

    if (isAdding) {
      addFaq({ q: formQ, a: formA });
      showFeedbackMsg("Nueva pregunta frecuente agregada con éxito.");
    } else if (editingId) {
      updateFaq(editingId, { q: formQ, a: formA });
      showFeedbackMsg("Pregunta frecuente actualizada correctamente.");
    }

    handleCancelForm();
    reloadFaqs();
  };

  const handleDelete = (faq) => {
    if (window.confirm(`¿Seguro que deseas eliminar la pregunta: "${faq.q}"?`)) {
      deleteFaq(faq.id);
      showFeedbackMsg("Pregunta eliminada.");
      reloadFaqs();
    }
  };

  const handleMove = (index, dir) => {
    moveFaq(index, dir);
    reloadFaqs();
  };

  const handleReset = () => {
    if (window.confirm("¿Deseas restablecer las 5 preguntas frecuentes originales de Platino Perú? Se perderán las modificaciones personalizadas.")) {
      resetFaqsToDefault();
      showFeedbackMsg("Preguntas frecuentes restablecidas a los valores de fábrica.");
      reloadFaqs();
    }
  };

  // Plantillas rápidas para la pregunta de entallado
  const applyEntalladoTemplate = (type) => {
    if (type === "flexible") {
      setFormA(
        "Sí, la gran mayoría de nuestros modelos cuentan con 1 primer entallado de cortesía. Sin embargo, para sortijas con pavé completo o diseños de tensión, te recomendamos consultar previamente con nuestro gemólogo para verificar la viabilidad de ajuste."
      );
    } else if (type === "limitado") {
      setFormA(
        "En Platino Perú ofrecemos primer entallado de cortesía en modelos seleccionados. En piezas de diseño continuo o sortijas tipo 'eternity' (con piedras en todo el contorno), no es posible entallar posteriormente, por lo que te ayudaremos a definir tu talla exacta antes de la fabricación."
      );
    } else if (type === "original") {
      setFormA(
        "Sí, todos nuestros anillos cuentan con servicio de entallado. En Platino Perú ofrecemos un primer entallado de cortesía para asegurar el ajuste perfecto en tu dedo o el de tu pareja."
      );
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "none", boxSizing: "border-box", margin: 0, padding: "10px 0" }}>
      {/* Toast Feedback */}
      {feedback && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#113B3A",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13.5px",
            fontWeight: "600",
            animation: "fadeIn 0.2s ease-in-out",
          }}
        >
          <i className="bi bi-check2-circle" style={{ color: "#86efac", fontSize: "18px" }}></i>
          <span>{feedback}</span>
        </div>
      )}

      {/* Encabezado Principal */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          padding: "24px 28px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span
              style={{
                background: "#e6f4ea",
                color: "#137333",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: "800",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Ficha de Producto
            </span>
            <span style={{ fontSize: "12.5px", color: "#64748b" }}>
              Sincronización en vivo con todas las joyas
            </span>
          </div>
          <h2 style={{ margin: "0 0 6px 0", fontSize: "22px", color: "#113B3A", fontWeight: "800" }}>
            Preguntas Frecuentes (FAQs)
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#475569", maxWidth: "680px", lineHeight: "1.5" }}>
            Administra aquí las preguntas y respuestas que se muestran en el acordeón de cada joya. Puedes editar la respuesta sobre el <strong>servicio de entallado</strong>, cambiar redacciones o agregar nuevas preguntas que tus clientes necesiten.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: "10px 16px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "600",
              color: "#64748b",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s ease",
            }}
            title="Restablece las 5 preguntas por defecto"
          >
            <i className="bi bi-arrow-counterclockwise"></i>
            <span>Restablecer</span>
          </button>

          <button
            type="button"
            onClick={handleStartAdd}
            style={{
              padding: "10px 18px",
              background: "#113B3A",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "700",
              color: "#ffffff",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 6px rgba(17,59,58,0.25)",
              transition: "all 0.15s ease",
            }}
          >
            <i className="bi bi-plus-lg"></i>
            <span>Nueva Pregunta</span>
          </button>
        </div>
      </div>

      {/* Formulario de Agregar / Editar Pregunta */}
      {(isAdding || editingId) && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            border: "2px solid #113B3A",
            padding: "24px",
            marginBottom: "24px",
            boxShadow: "0 6px 20px rgba(17,59,58,0.08)",
            animation: "fadeIn 0.2s ease-in-out",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "17px", color: "#113B3A", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
              <i className={isAdding ? "bi bi-plus-circle-fill" : "bi bi-pencil-square"}></i>
              <span>{isAdding ? "Agregar Nueva Pregunta Frecuente" : "Editar Pregunta Frecuente"}</span>
            </h3>
            <button
              type="button"
              onClick={handleCancelForm}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "18px",
                color: "#64748b",
                cursor: "pointer",
              }}
              title="Cerrar"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <form onSubmit={handleSave}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                Pregunta al cliente:
              </label>
              <input
                type="text"
                value={formQ}
                onChange={(e) => setFormQ(e.target.value)}
                placeholder="Ej: ¿Se puede cambiar el tamaño de este anillo de compromiso?"
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Ayuda rápida para respuestas de entallado */}
            {(formQ.toLowerCase().includes("tamaño") || formQ.toLowerCase().includes("entall") || formQ.toLowerCase().includes("ajust")) && (
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px dashed #94a3b8",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  marginBottom: "14px",
                }}
              >
                <div style={{ fontSize: "11.5px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  💡 Plantillas sugeridas para el servicio de entallado:
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => applyEntalladoTemplate("flexible")}
                    style={{
                      background: "#e0f2fe",
                      color: "#0369a1",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Flexible (Cortesía sujeto a modelo)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyEntalladoTemplate("limitado")}
                    style={{
                      background: "#fef3c7",
                      color: "#92400e",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Con excepciones (Eternity / Pavé continuo)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyEntalladoTemplate("original")}
                    style={{
                      background: "#f1f5f9",
                      color: "#475569",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Original (Todos tienen entallado)
                  </button>
                </div>
              </div>
            )}

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                Respuesta detallada:
              </label>
              <textarea
                value={formA}
                onChange={(e) => setFormA(e.target.value)}
                placeholder="Escribe la respuesta oficial que verán los clientes en la tienda..."
                rows={4}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13.5px",
                  lineHeight: "1.5",
                  color: "#334155",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={handleCancelForm}
                style={{
                  padding: "9px 16px",
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#475569",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{
                  padding: "9px 20px",
                  background: "#113B3A",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#ffffff",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <i className="bi bi-check-lg"></i>
                <span>{isAdding ? "Guardar Nueva Pregunta" : "Guardar Cambios"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Preguntas Frecuentes Activas */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          padding: "20px 24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", color: "#113B3A", fontWeight: "700" }}>
            Preguntas Publicadas ({faqs.length})
          </h3>
          <span style={{ fontSize: "12px", color: "#64748b" }}>
            Haz clic en una pregunta para desplegar la respuesta o usa los botones para editar / reordenar.
          </span>
        </div>

        {faqs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            <i className="bi bi-question-circle" style={{ fontSize: "36px", color: "#cbd5e1" }}></i>
            <p style={{ marginTop: "10px" }}>No hay preguntas frecuentes registradas.</p>
            <button
              type="button"
              onClick={handleReset}
              style={{
                marginTop: "10px",
                padding: "8px 16px",
                background: "#113B3A",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Cargar preguntas por defecto
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {faqs.map((faq, idx) => {
              const isFaqOpen = previewOpenIdx === idx;
              const isEntallado =
                faq.id === "faq-entallado" ||
                faq.q.toLowerCase().includes("entall") ||
                faq.q.toLowerCase().includes("tamaño");

              return (
                <div
                  key={faq.id || idx}
                  style={{
                    border: isEntallado ? "1.5px solid #bbf7d0" : "1px solid #e2e8f0",
                    borderRadius: "10px",
                    background: isEntallado ? "#f0fdf4" : "#ffffff",
                    overflow: "hidden",
                    transition: "all 0.15s ease",
                  }}
                >
                  {/* Barra de Título / Acciones */}
                  <div
                    style={{
                      padding: "12px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                      background: isFaqOpen
                        ? isEntallado
                          ? "#dcfce7"
                          : "#f8fafc"
                        : "transparent",
                    }}
                    onClick={() => setPreviewOpenIdx(isFaqOpen ? null : idx)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                      <span
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: isEntallado ? "#166534" : "#113B3A",
                          color: "#ffffff",
                          fontSize: "11px",
                          fontWeight: "800",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <strong
                        style={{
                          fontSize: "14px",
                          color: "#1e293b",
                          fontWeight: "700",
                        }}
                      >
                        {faq.q}
                      </strong>
                      {isEntallado && (
                        <span
                          style={{
                            background: "#166534",
                            color: "#ffffff",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            fontSize: "10px",
                            fontWeight: "800",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Entallado
                        </span>
                      )}
                    </div>

                    <div
                      style={{ display: "flex", alignItems: "center", gap: "6px" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Reordenar */}
                      <button
                        type="button"
                        onClick={() => handleMove(idx, "up")}
                        disabled={idx === 0}
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          color: idx === 0 ? "#cbd5e1" : "#475569",
                          cursor: idx === 0 ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                        }}
                        title="Mover arriba"
                      >
                        <i className="bi bi-chevron-up"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, "down")}
                        disabled={idx === faqs.length - 1}
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          color: idx === faqs.length - 1 ? "#cbd5e1" : "#475569",
                          cursor: idx === faqs.length - 1 ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                        }}
                        title="Mover abajo"
                      >
                        <i className="bi bi-chevron-down"></i>
                      </button>

                      {/* Editar */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(faq)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "6px",
                          border: "1px solid #113B3A",
                          background: "#ffffff",
                          color: "#113B3A",
                          fontWeight: "700",
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                        title="Editar esta pregunta y respuesta"
                      >
                        <i className="bi bi-pencil-fill" style={{ fontSize: "10px" }}></i>
                        <span>Editar</span>
                      </button>

                      {/* Eliminar */}
                      <button
                        type="button"
                        onClick={() => handleDelete(faq)}
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          border: "1px solid #fca5a5",
                          background: "#ffffff",
                          color: "#dc2626",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                        }}
                        title="Eliminar pregunta"
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </div>

                  {/* Respuesta Desplegada */}
                  {isFaqOpen && (
                    <div
                      style={{
                        padding: "14px 20px 16px 52px",
                        fontSize: "13.5px",
                        lineHeight: "1.6",
                        color: "#334155",
                        borderTop: isEntallado ? "1px solid #dcfce7" : "1px solid #f1f5f9",
                        background: "#ffffff",
                      }}
                    >
                      <p style={{ margin: 0 }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
