import React, { useState, useEffect } from "react";
import { getShippingConfig, saveShippingConfig } from "../services/shippingService";
import { PERU_DEPARTMENTS } from "../data/peruLocations";
import { formatPrice } from "../data/products";

export default function AdminShippingTab() {
  const [config, setConfig] = useState(getShippingConfig);
  const [feedback, setFeedback] = useState(null);
  const [newCustomDept, setNewCustomDept] = useState("Arequipa");
  const [newCustomJewelry, setNewCustomJewelry] = useState(20);
  const [newCustomGems, setNewCustomGems] = useState(25);

  useEffect(() => {
    const handleUpdate = () => setConfig(getShippingConfig());
    window.addEventListener("platino_shipping_updated", handleUpdate);
    return () => window.removeEventListener("platino_shipping_updated", handleUpdate);
  }, []);

  const handleSaveBaseRates = (e) => {
    e.preventDefault();
    saveShippingConfig(config);
    setFeedback({ type: "success", message: "Tarifas de envío actualizadas exitosamente." });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleAddCustomRate = (e) => {
    e.preventDefault();
    const updated = {
      ...config,
      customDepartmentRates: {
        ...(config.customDepartmentRates || {}),
        [newCustomDept]: {
          jewelry: Number(newCustomJewelry) || 0,
          gems: Number(newCustomGems) || 0,
        },
      },
    };
    setConfig(updated);
    saveShippingConfig(updated);
    setFeedback({ type: "success", message: `Tarifa personalizada agregada para ${newCustomDept}.` });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleRemoveCustomRate = (dept) => {
    const updatedRates = { ...(config.customDepartmentRates || {}) };
    delete updatedRates[dept];
    const updated = { ...config, customDepartmentRates: updatedRates };
    setConfig(updated);
    saveShippingConfig(updated);
    setFeedback({ type: "success", message: `Tarifa personalizada eliminada para ${dept}.` });
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div style={{ width: "100%", padding: "10px 0 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#113b3a", margin: "0 0 4px" }}>
            <i className="bi bi-truck" style={{ marginRight: "10px", color: "#c5a059" }}></i>
            Relación de Precios & Tarifas de Envíos a Domicilio
          </h2>
          <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
            Configura los precios que se aplicarán automáticamente a los clientes al momento de finalizar su compra.
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

      {/* Tarifas Base Generales */}
      <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px", marginBottom: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", margin: "0 0 16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
          Tarifas Generales (Lima Metropolitana / Callao vs Provincias)
        </h3>

        <form onSubmit={handleSaveBaseRates}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "20px" }}>
            {/* Lima y Callao */}
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", color: "#0f2a24", marginBottom: "12px", fontSize: "14.5px" }}>
                <i className="bi bi-geo-alt-fill" style={{ color: "#15803d" }}></i>
                <span>Lima Metropolitana & Callao</span>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                  Tarifa para Joyas / Aros / Anillos (S/.):
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>S/.</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={config.limaCallaoJewelry}
                    onChange={(e) => setConfig({ ...config, limaCallaoJewelry: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <span style={{ fontSize: "11px", color: config.limaCallaoJewelry === 0 ? "#15803d" : "#64748b", marginTop: "3px", display: "block" }}>
                  {config.limaCallaoJewelry === 0 ? "✓ Envío gratuito para clientes de Lima y Callao" : "Cobro fijo"}
                </span>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                  Tarifa para Gemas Solas (S/.):
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>S/.</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={config.limaCallaoGems}
                    onChange={(e) => setConfig({ ...config, limaCallaoGems: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>
            </div>

            {/* Provincias / Nacional */}
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", color: "#0f2a24", marginBottom: "12px", fontSize: "14.5px" }}>
                <i className="bi bi-airplane-engines-fill" style={{ color: "#c5a059" }}></i>
                <span>Provincias (Resto de Departamentos)</span>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                  Tarifa para Joyas / Aros / Anillos (S/.):
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>S/.</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={config.provincesJewelry}
                    onChange={(e) => setConfig({ ...config, provincesJewelry: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                  Tarifa para Gemas Solas (S/.):
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>S/.</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={config.provincesGems}
                    onChange={(e) => setConfig({ ...config, provincesGems: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            style={{
              background: "#113b3a",
              color: "#ffffff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "13.5px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <i className="bi bi-save"></i> Guardar Tarifas Base
          </button>
        </form>
      </div>

      {/* Tarifas Personalizadas por Departamento Específico */}
      <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", margin: "0 0 16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
          Tarifas Especiales por Departamento (Opcional)
        </h3>
        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
          Si deseas asignar un precio diferenciado para departamentos particulares (por ejemplo, zonas de difícil acceso o con recargo especial de courier):
        </p>

        <form onSubmit={handleAddCustomRate} style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "flex-end", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
              Departamento:
            </label>
            <select
              value={newCustomDept}
              onChange={(e) => setNewCustomDept(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            >
              {PERU_DEPARTMENTS.filter((d) => d !== "Lima" && d !== "Callao").map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
              Tarifa Joyas (S/.):
            </label>
            <input
              type="number"
              min="0"
              value={newCustomJewelry}
              onChange={(e) => setNewCustomJewelry(e.target.value)}
              style={{ width: "110px", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
              Tarifa Gemas (S/.):
            </label>
            <input
              type="number"
              min="0"
              value={newCustomGems}
              onChange={(e) => setNewCustomGems(e.target.value)}
              style={{ width: "110px", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            />
          </div>

          <button
            type="submit"
            style={{
              background: "#c5a059",
              color: "#ffffff",
              border: "none",
              padding: "9px 16px",
              borderRadius: "6px",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            + Asignar Tarifa Especial
          </button>
        </form>

        {Object.keys(config.customDepartmentRates || {}).length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginTop: "10px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "10px 12px" }}>Departamento</th>
                <th style={{ padding: "10px 12px" }}>Tarifa Joyas</th>
                <th style={{ padding: "10px 12px" }}>Tarifa Gemas</th>
                <th style={{ padding: "10px 12px", textAlign: "right" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(config.customDepartmentRates || {}).map(([dept, rates]) => (
                <tr key={dept} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "10px 12px", fontWeight: "600", color: "#1e293b" }}>{dept}</td>
                  <td style={{ padding: "10px 12px", color: "#166534", fontWeight: "600" }}>{formatPrice(rates.jewelry)}</td>
                  <td style={{ padding: "10px 12px", color: "#0284c7", fontWeight: "600" }}>{formatPrice(rates.gems)}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right" }}>
                    <button
                      onClick={() => handleRemoveCustomRate(dept)}
                      style={{
                        background: "#fee2e2",
                        color: "#991b1b",
                        border: "none",
                        padding: "4px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      <i className="bi bi-trash"></i> Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic", margin: 0 }}>
            No hay excepciones por departamento. Se aplican las tarifas generales de Provincias a todos los departamentos fuera de Lima/Callao.
          </p>
        )}
      </div>
    </div>
  );
}
