import React, { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import {
  getClientProfile,
  updateClientPersonalData,
  addClientAddress,
  updateClientAddress,
  deleteClientAddress,
  setDefaultClientAddress,
} from "../services/clientProfileService";
import {
  PERU_DEPARTMENTS,
  PERU_DEPARTMENTS_AND_PROVINCES,
  calculateShippingCost,
} from "../data/peruLocations";
import { formatPrice } from "../data/products";

const ADDRESS_LABELS = ["Casa", "Oficina", "Departamento", "Familiar", "Otro"];

export default function ClientProfileTab() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(() => getClientProfile(user));
  const [feedback, setFeedback] = useState(null);

  // Datos personales
  const [name, setName] = useState(profile.name || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [dni, setDni] = useState(profile.dni || "");

  // Formulario de dirección
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addrLabel, setAddrLabel] = useState("Casa");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrDepartment, setAddrDepartment] = useState("Lima");
  const [addrProvince, setAddrProvince] = useState("Lima");
  const [addrDistrict, setAddrDistrict] = useState("");
  const [addrReference, setAddrReference] = useState("");
  const [addrIsDefault, setAddrIsDefault] = useState(true);

  useEffect(() => {
    const sync = () => {
      const next = getClientProfile(user);
      setProfile(next);
      setName(next.name || "");
      setPhone(next.phone || "");
      setDni(next.dni || "");
    };
    sync();
    window.addEventListener("platino_profile_updated", sync);
    return () => window.removeEventListener("platino_profile_updated", sync);
  }, [user]);

  const showNotice = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSavePersonalData = (e) => {
    e.preventDefault();
    try {
      const updated = updateClientPersonalData(user, { name, phone, dni });
      setProfile(updated);
      showNotice("success", "✓ Tus datos personales se actualizaron correctamente.");
    } catch (err) {
      showNotice("error", err.message);
    }
  };

  const handleDepartmentChange = (dept) => {
    setAddrDepartment(dept);
    const provs = PERU_DEPARTMENTS_AND_PROVINCES[dept] || [];
    setAddrProvince(provs[0] || "");
  };

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddrLabel("Casa");
    setAddrStreet("");
    setAddrDepartment("Lima");
    setAddrProvince("Lima");
    setAddrDistrict("");
    setAddrReference("");
    setAddrIsDefault((profile.addresses || []).length === 0);
  };

  const handleEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddrLabel(addr.label || "Casa");
    setAddrStreet(addr.address || "");
    const dept = addr.department || "Lima";
    setAddrDepartment(dept);
    const provs = PERU_DEPARTMENTS_AND_PROVINCES[dept] || [];
    setAddrProvince(addr.province || provs[0] || "");
    setAddrDistrict(addr.district || "");
    setAddrReference(addr.reference || "");
    setAddrIsDefault(Boolean(addr.isDefault));
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        updateClientAddress(user, editingAddressId, {
          label: addrLabel,
          address: addrStreet,
          department: addrDepartment,
          province: addrProvince,
          district: addrDistrict,
          reference: addrReference,
          isDefault: addrIsDefault,
        });
        showNotice("success", "✓ Dirección actualizada en tu libreta de envíos.");
      } else {
        addClientAddress(user, {
          label: addrLabel,
          address: addrStreet,
          department: addrDepartment,
          province: addrProvince,
          district: addrDistrict,
          reference: addrReference,
          isDefault: addrIsDefault,
        });
        showNotice("success", "✓ Nueva dirección guardada para tus compras a domicilio.");
      }
      resetAddressForm();
    } catch (err) {
      showNotice("error", err.message);
    }
  };

  const handleDeleteAddress = (addrId) => {
    if (window.confirm("¿Deseas eliminar esta dirección guardada?")) {
      deleteClientAddress(user, addrId);
      if (editingAddressId === addrId) {
        resetAddressForm();
      }
      showNotice("success", "✓ Dirección eliminada.");
    }
  };

  const handleMakeDefault = (addrId) => {
    setDefaultClientAddress(user, addrId);
    showNotice("success", "✓ Dirección marcada como predeterminada para tus envíos.");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "32px" }}>
      {feedback && (
        <div
          style={{
            padding: "13px 18px",
            borderRadius: "10px",
            background: feedback.type === "success" ? "#ecfdf5" : "#fef2f2",
            border: `1.5px solid ${feedback.type === "success" ? "#86efac" : "#fecaca"}`,
            color: feedback.type === "success" ? "#065f46" : "#991b1b",
            fontWeight: "700",
            fontSize: "13.5px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <i className={`bi ${feedback.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}></i>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 1. DATOS PERSONALES DEL CLIENTE */}
      <section
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e7e2d8",
          padding: "26px",
          boxShadow: "0 4px 16px rgba(15, 42, 36, 0.04)",
        }}
      >
        <div style={{ marginBottom: "18px", borderBottom: "1px solid #f1ede4", paddingBottom: "12px" }}>
          <h3 style={{ margin: "0 0 4px", fontFamily: "var(--font-serif)", fontSize: "21px", color: "#0f2a24", display: "flex", alignItems: "center", gap: "8px" }}>
            <i className="bi bi-person-vcard-fill" style={{ color: "#c5a059" }}></i>
            Mis Datos Personales
          </h3>
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
            Mantén actualizados tu nombre, teléfono de WhatsApp y DNI para agilizar tus compras y tu garantía Platino Care.
          </p>
        </div>

        <form onSubmit={handleSavePersonalData}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px", marginBottom: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                Nombre Completo y Apellidos *
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Valeria Gutiérrez"
                style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13.5px", fontWeight: "600" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                Teléfono / WhatsApp *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. +51 987 654 321"
                style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13.5px", fontWeight: "600" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                DNI / Documento de Identidad
              </label>
              <input
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="Ej. 71234567"
                style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13.5px", fontWeight: "600" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#64748b", marginBottom: "6px" }}>
                Correo Electrónico (Cuenta)
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontSize: "13.5px" }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              background: "#0f2a24",
              color: "#ffffff",
              border: "none",
              padding: "11px 22px",
              borderRadius: "8px",
              fontSize: "13.5px",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <i className="bi bi-check2-circle" style={{ color: "#c5a059" }}></i>
            Guardar Datos Personales
          </button>
        </form>
      </section>

      {/* 2. LIBRETA DE DIRECCIONES DE ENVÍO */}
      <section
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e7e2d8",
          padding: "26px",
          boxShadow: "0 4px 16px rgba(15, 42, 36, 0.04)",
        }}
      >
        <div style={{ marginBottom: "18px", borderBottom: "1px solid #f1ede4", paddingBottom: "12px" }}>
          <h3 style={{ margin: "0 0 4px", fontFamily: "var(--font-serif)", fontSize: "21px", color: "#0f2a24", display: "flex", alignItems: "center", gap: "8px" }}>
            <i className="bi bi-geo-alt-fill" style={{ color: "#c5a059" }}></i>
            Mis Direcciones de Envío a Domicilio ({(profile.addresses || []).length})
          </h3>
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
            Guarda tus direcciones frecuentes con su Departamento, Provincia y Distrito para seleccionarlas con un solo clic al finalizar tu compra.
          </p>
        </div>

        {/* Lista de Direcciones Guardadas */}
        {(profile.addresses || []).length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", marginBottom: "24px" }}>
            {profile.addresses.map((addr) => {
              const shippingFee = calculateShippingCost({
                isGemOnly: false,
                deliveryType: "envio_domicilio",
                department: addr.department || "Lima",
              });
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${addr.address} ${addr.district} ${addr.province} ${addr.department} Peru`
              )}`;

              return (
                <div
                  key={addr.id}
                  style={{
                    borderRadius: "12px",
                    border: addr.isDefault ? "2px solid #0f2a24" : "1px solid #dce3df",
                    background: addr.isDefault ? "#f7fbf9" : "#ffffff",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", gap: "8px" }}>
                      <span
                        style={{
                          background: "#0f2a24",
                          color: "#ffffff",
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "11.5px",
                          fontWeight: "700",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <i className="bi bi-house-heart-fill" style={{ color: "#c5a059" }}></i>
                        {addr.label || "Casa"}
                      </span>

                      {addr.isDefault && (
                        <span
                          style={{
                            background: "#dcfce7",
                            color: "#166534",
                            border: "1px solid #86efac",
                            padding: "2px 9px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: "800",
                          }}
                        >
                          ★ Dirección Principal
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f2a24", marginBottom: "4px" }}>
                      {addr.address}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#475569", marginBottom: "4px" }}>
                      {addr.district}, {addr.province} — <strong>{addr.department}</strong>
                    </div>
                    {addr.reference && (
                      <div style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic", marginBottom: "6px" }}>
                        Ref: {addr.reference}
                      </div>
                    )}
                    <div style={{ fontSize: "11.5px", color: "#166534", fontWeight: "700" }}>
                      Tarifa de envío a {addr.department}: {shippingFee === 0 ? "Gratis" : formatPrice(shippingFee)}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", borderTop: "1px solid #e2e8f0", paddingTop: "10px" }}>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "12px", color: "#0f2a24", fontWeight: "700", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      <i className="bi bi-geo-alt-fill" style={{ color: "#ea4335" }}></i> Ver en Maps
                    </a>

                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {!addr.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleMakeDefault(addr.id)}
                          style={{
                            background: "#f1f5f9",
                            color: "#0f2a24",
                            border: "1px solid #cbd5e1",
                            padding: "5px 10px",
                            borderRadius: "6px",
                            fontSize: "11.5px",
                            fontWeight: "700",
                            cursor: "pointer",
                          }}
                        >
                          Predeterminar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleEditAddress(addr)}
                        style={{
                          background: "#fef9c3",
                          color: "#854d0e",
                          border: "1px solid #fde047",
                          padding: "5px 10px",
                          borderRadius: "6px",
                          fontSize: "11.5px",
                          fontWeight: "700",
                          cursor: "pointer",
                        }}
                      >
                        <i className="bi bi-pencil"></i> Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        style={{
                          background: "#fef2f2",
                          color: "#b91c1c",
                          border: "1px solid #fecaca",
                          padding: "5px 10px",
                          borderRadius: "6px",
                          fontSize: "11.5px",
                          fontWeight: "700",
                          cursor: "pointer",
                        }}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Formulario para Agregar o Editar Dirección */}
        <div
          style={{
            background: "#fbfaf7",
            borderRadius: "12px",
            border: "1px solid #e5dec9",
            padding: "20px",
          }}
        >
          <h4 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800", color: "#0f2a24", display: "flex", alignItems: "center", gap: "8px" }}>
            <i className={`bi ${editingAddressId ? "bi-pencil-square" : "bi-plus-circle-fill"}`} style={{ color: "#c5a059" }}></i>
            {editingAddressId ? "Editar Dirección Guardada" : "Agregar Nueva Dirección de Domicilio"}
          </h4>

          <form onSubmit={handleSaveAddress}>
            {/* Etiqueta rápida */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                Etiqueta de la Dirección:
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {ADDRESS_LABELS.map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setAddrLabel(lbl)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      border: addrLabel === lbl ? "1.5px solid #0f2a24" : "1px solid #cbd5e1",
                      background: addrLabel === lbl ? "#0f2a24" : "#ffffff",
                      color: addrLabel === lbl ? "#ffffff" : "#334155",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* 1. Dirección exacta */}
            <div style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "6px" }}>
                <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#1e293b" }}>
                  Dirección de envío completa (Av. / Calle, número, dpto y urbanización) *
                </label>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${addrStreet || ""} ${addrDistrict} ${addrProvince} ${addrDepartment} Peru`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "12px", color: "#166534", fontWeight: "700", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                >
                  <i className="bi bi-geo-alt-fill" style={{ color: "#ea4335" }}></i>
                  <span>Buscar en Google Maps</span>
                </a>
              </div>
              <input
                required
                type="text"
                placeholder="Ej. Av. Larco 345 Dpto 402, Urb. Miraflores"
                value={addrStreet}
                onChange={(e) => setAddrStreet(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13.5px" }}
              />
            </div>

            {/* 2. Debajo de la dirección: Departamento, Provincia y Distrito */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "14px", marginBottom: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                  Departamento *
                </label>
                <select
                  required
                  value={addrDepartment}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13.5px", background: "#ffffff", fontWeight: "600" }}
                >
                  {PERU_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                  Provincia *
                </label>
                <select
                  required
                  value={addrProvince}
                  onChange={(e) => setAddrProvince(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13.5px", background: "#ffffff", fontWeight: "600" }}
                >
                  {(PERU_DEPARTMENTS_AND_PROVINCES[addrDepartment] || []).map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                  Distrito *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Escribe tu distrito (ej. Miraflores)"
                  value={addrDistrict}
                  onChange={(e) => setAddrDistrict(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13.5px" }}
                />
              </div>
            </div>

            {/* Referencia adicional */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                Referencia adicional (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. Frente al parque Kennedy, edificio esquinero"
                value={addrReference}
                onChange={(e) => setAddrReference(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13px" }}
              />
            </div>

            <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "600", color: "#0f2a24", cursor: "pointer", marginBottom: "16px" }}>
              <input
                type="checkbox"
                checked={addrIsDefault}
                onChange={(e) => setAddrIsDefault(e.target.checked)}
                style={{ accentColor: "#0f2a24", width: "16px", height: "16px" }}
              />
              <span>Usar como mi dirección principal al comprar con Envío a Domicilio</span>
            </label>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="submit"
                style={{
                  background: "#0f2a24",
                  color: "#ffffff",
                  border: "none",
                  padding: "11px 20px",
                  borderRadius: "8px",
                  fontSize: "13.5px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <i className="bi bi-save2-fill" style={{ color: "#c5a059" }}></i>
                {editingAddressId ? "Actualizar Dirección" : "Guardar Dirección"}
              </button>

              {editingAddressId && (
                <button
                  type="button"
                  onClick={resetAddressForm}
                  style={{
                    background: "#f1f5f9",
                    color: "#334155",
                    border: "1px solid #cbd5e1",
                    padding: "11px 18px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Cancelar Edición
                </button>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
