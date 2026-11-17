import React, { useState, useEffect, useMemo } from "react";
import {
  getStoredPromotions,
  addPromotion,
  deletePromotion,
  togglePromotionActive,
  CATALOG_TARGETS
} from "../services/promotionsService";
import { products, formatPrice } from "../data/products";

export default function AdminPromotionsTab() {
  const [promotions, setPromotions] = useState(getStoredPromotions);
  const [feedback, setFeedback] = useState(null);

  // Formulario de nueva promoción
  const [code, setCode] = useState("");
  const [target, setTarget] = useState("all"); // 'all' | 'envio' | 'anillos-compromiso' | 'aros-boda' | 'alianzas' | 'anillos-promesa' | 'joyeria' | 'gemas' | 'producto_especifico'
  const [selectedProductId, setSelectedProductId] = useState("");
  const [discountType, setDiscountType] = useState("percentage"); // 'percentage' | 'fixed'
  const [discountValue, setDiscountValue] = useState(10);
  const [minPurchase, setMinPurchase] = useState(0);
  const [description, setDescription] = useState("");

  const refreshList = () => setPromotions(getStoredPromotions());

  useEffect(() => {
    window.addEventListener("platino_promotions_updated", refreshList);
    return () => window.removeEventListener("platino_promotions_updated", refreshList);
  }, []);

  // Lista de productos ordenada para selector específico
  const catalogProducts = useMemo(() => {
    return (products || []).filter((p) => p && p.name).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const handleCreatePromo = (e) => {
    e.preventDefault();
    try {
      const targetObj = CATALOG_TARGETS.find((t) => t.id === target);
      let targetLabel = targetObj ? targetObj.label : "Toda la Tienda";
      let targetProductName = null;

      if (target === "producto_especifico") {
        if (!selectedProductId) {
          throw new Error("Por favor selecciona un producto específico del catálogo.");
        }
        const prod = catalogProducts.find((p) => String(p.id) === String(selectedProductId));
        targetProductName = prod ? prod.name : `Producto #${selectedProductId}`;
        targetLabel = `Producto: ${targetProductName}`;
      }

      addPromotion({
        code,
        type: target === "envio" ? "envio" : "producto",
        target,
        targetLabel,
        targetProductId: target === "producto_especifico" ? selectedProductId : null,
        targetProductName,
        discountType,
        discountValue,
        minPurchase,
        description,
        active: true,
      });

      setCode("");
      setDescription("");
      setDiscountValue(10);
      setMinPurchase(0);
      setSelectedProductId("");
      refreshList();
      setFeedback({ type: "success", message: `Código «${code.toUpperCase()}» creado y activado exitosamente.` });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleToggle = (id) => {
    togglePromotionActive(id);
    refreshList();
  };

  const handleDelete = (id, promoCode) => {
    if (window.confirm(`¿Estás seguro de eliminar el código promocional «${promoCode}»?`)) {
      deletePromotion(id);
      refreshList();
      setFeedback({ type: "success", message: `Código «${promoCode}» eliminado.` });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div style={{ width: "100%", padding: "10px 0 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#113b3a", margin: "0 0 4px" }}>
            <i className="bi bi-tag-fill" style={{ marginRight: "10px", color: "#c5a059" }}></i>
            Códigos de Promoción & Cupones de Descuento
          </h2>
          <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
            Configura cupones que apliquen a <strong>Toda la Tienda</strong>, a <strong>Catálogos Específicos</strong>, a un <strong>Producto Único</strong> o al <strong>Envío a Domicilio</strong>.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "14px",
            fontWeight: "600",
            backgroundColor: feedback.type === "success" ? "#f0fdf4" : "#fef2f2",
            color: feedback.type === "success" ? "#166534" : "#991b1b",
            border: `1px solid ${feedback.type === "success" ? "#bbf7d0" : "#fecaca"}`,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <i className={`bi ${feedback.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}></i>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Formulario de Creación de Cupón */}
      <div style={{ width: "100%", background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px", marginBottom: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", boxSizing: "border-box" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", margin: "0 0 16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
          Crear Nuevo Código Promocional
        </h3>

        <form onSubmit={handleCreatePromo}>
          {/* Fila 1: Código del cupón y Selección de Catálogo */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px", marginBottom: "18px" }}>
            {/* Código del Cupón */}
            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "6px", whiteSpace: "nowrap" }}>
                Código del Cupón *
              </label>
              <input
                required
                type="text"
                placeholder="Ej. ENVIOGRATIS, COMPROMISO15"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase", boxSizing: "border-box", fontSize: "13.5px" }}
              />
            </div>

            {/* Catálogo Objetivo donde aplica */}
            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "6px", whiteSpace: "nowrap" }}>
                Catálogo o Destino del Descuento *
              </label>
              <select
                value={target}
                onChange={(e) => {
                  const val = e.target.value;
                  setTarget(val);
                  if (val === "envio") {
                    setDiscountType("percentage");
                    setDiscountValue(100);
                  }
                }}
                style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontWeight: "600", color: "#0f172a", boxSizing: "border-box", fontSize: "13.5px", background: "#ffffff", cursor: "pointer", textOverflow: "ellipsis" }}
              >
                {CATALOG_TARGETS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fila 2: Modalidad, Valor del Descuento y Compra Mínima */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "18px", marginBottom: "18px" }}>
            {/* Modalidad de Descuento */}
            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "6px", whiteSpace: "nowrap" }}>
                Modalidad del Descuento *
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontWeight: "600", boxSizing: "border-box", fontSize: "13.5px", background: "#ffffff", cursor: "pointer" }}
              >
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto Fijo en Soles (S/.)</option>
              </select>
            </div>

            {/* Valor del Descuento */}
            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "6px", whiteSpace: "nowrap" }}>
                Valor del Descuento *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  required
                  type="number"
                  min="1"
                  max={discountType === "percentage" ? "100" : "10000"}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  style={{ width: "100%", padding: "11px 36px 11px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontWeight: "700", boxSizing: "border-box", fontSize: "13.5px" }}
                />
                <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b", fontWeight: "700", fontSize: "13px" }}>
                  {discountType === "percentage" ? "%" : "S/."}
                </span>
              </div>
            </div>

            {/* Compra Mínima */}
            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "6px", whiteSpace: "nowrap" }}>
                Compra Mínima Requerida (S/.)
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  min="0"
                  value={minPurchase}
                  onChange={(e) => setMinPurchase(Number(e.target.value))}
                  placeholder="0 = Sin mínimo"
                  style={{ width: "100%", padding: "11px 36px 11px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", boxSizing: "border-box", fontSize: "13.5px" }}
                />
                <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b", fontWeight: "600", fontSize: "12px" }}>
                  S/.
                </span>
              </div>
            </div>
          </div>

          {/* Selector condicional de Producto Específico */}
          {target === "producto_especifico" && (
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1.5px dashed #cbd5e1", marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#0f2a24", marginBottom: "6px" }}>
                <i className="bi bi-box-seam" style={{ color: "#c5a059", marginRight: "6px" }}></i>
                Selecciona la Joya o Modelo Específico del Catálogo:
              </label>
              <select
                required
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1.5px solid #0f2a24", fontSize: "13px", fontWeight: "600", boxSizing: "border-box" }}
              >
                <option value="">-- Elige un producto de la lista ({catalogProducts.length} piezas disponibles) --</option>
                {catalogProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.price ? `(${formatPrice(p.price)})` : ""} - {p.category || "Joyería"}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Descripción */}
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "5px" }}>
              Descripción / Motivo de la Promoción:
            </label>
            <input
              type="text"
              placeholder="Ej. 15% de descuento exclusivo en el catálogo de Anillos de Compromiso"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>

          <button
            type="submit"
            style={{
              background: "#113b3a",
              color: "#ffffff",
              border: "none",
              padding: "11px 24px",
              borderRadius: "8px",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "13.5px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <i className="bi bi-plus-circle-fill"></i> Crear y Activar Código
          </button>
        </form>
      </div>

      {/* Tabla de Códigos Existentes */}
      <div style={{ width: "100%", background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", boxSizing: "border-box" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", margin: "0 0 16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
          Códigos Promocionales Registrados ({promotions.length})
        </h3>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "12px 14px" }}>Código</th>
                <th style={{ padding: "12px 14px" }}>Alcance / Catálogo</th>
                <th style={{ padding: "12px 14px" }}>Descuento</th>
                <th style={{ padding: "12px 14px" }}>Compra Mín.</th>
                <th style={{ padding: "12px 14px" }}>Descripción</th>
                <th style={{ padding: "12px 14px" }}>Usos</th>
                <th style={{ padding: "12px 14px" }}>Estado</th>
                <th style={{ padding: "12px 14px", textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ fontWeight: "800", background: "#f1f5f9", padding: "5px 9px", borderRadius: "5px", color: "#0f172a", letterSpacing: "0.05em" }}>
                      {p.code}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    {p.type === "envio" || p.target === "envio" ? (
                      <span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "4px 9px", borderRadius: "4px", fontWeight: "700", fontSize: "12px" }}>
                        <i className="bi bi-truck" style={{ marginRight: "4px" }}></i> Envío a Domicilio
                      </span>
                    ) : p.target === "all" || !p.target ? (
                      <span style={{ background: "#f0fdf4", color: "#166534", padding: "4px 9px", borderRadius: "4px", fontWeight: "700", fontSize: "12px" }}>
                        <i className="bi bi-shop" style={{ marginRight: "4px" }}></i> Toda la Tienda
                      </span>
                    ) : (
                      <span style={{ background: "#fdf2f8", color: "#be185d", padding: "4px 9px", borderRadius: "4px", fontWeight: "700", fontSize: "12px" }}>
                        <i className="bi bi-gem" style={{ marginRight: "4px" }}></i> {p.targetLabel || p.target}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "12px 14px", fontWeight: "700", color: "#166534" }}>
                    {p.discountType === "percentage" ? `${p.discountValue}% OFF` : `S/. ${p.discountValue} OFF`}
                  </td>
                  <td style={{ padding: "12px 14px", color: "#475569" }}>
                    {p.minPurchase > 0 ? formatPrice(p.minPurchase) : "Sin mínimo"}
                  </td>
                  <td style={{ padding: "12px 14px", color: "#64748b", maxWidth: "240px" }}>
                    {p.description || "-"}
                  </td>
                  <td style={{ padding: "12px 14px", fontWeight: "600", color: "#334155" }}>
                    {p.usageCount || 0}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <button
                      type="button"
                      onClick={() => handleToggle(p.id)}
                      style={{
                        background: p.active ? "#dcfce7" : "#f1f5f9",
                        color: p.active ? "#166534" : "#64748b",
                        border: "none",
                        padding: "4px 10px",
                        borderRadius: "9999px",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      {p.active ? "● Activo" : "○ Inactivo"}
                    </button>
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "right" }}>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.code)}
                      style={{
                        background: "#fee2e2",
                        color: "#991b1b",
                        border: "none",
                        padding: "5px 9px",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "12.5px",
                      }}
                      title="Eliminar cupón"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
