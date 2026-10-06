import { useState, useEffect, useMemo } from "react";
import {
  getReclamaciones,
  updateReclamacionStatus,
  PROVEEDOR_INFO,
} from "../services/reclamacionesService";

export default function AdminReclamacionesTab({ isMaster }) {
  const [reclamacionesList, setReclamacionesList] = useState(() => getReclamaciones());
  const [filterEstado, setFilterEstado] = useState("todos"); // 'todos' | 'pendiente' | 'en_proceso' | 'atendido'
  const [filterTipo, setFilterTipo] = useState("todos"); // 'todos' | 'reclamo' | 'queja'
  const [filterSede, setFilterSede] = useState("todas");
  const [searchQuery, setSearchQuery] = useState("");

  // Modales
  const [replyModalClaim, setReplyModalClaim] = useState(null);
  const [replyStatus, setReplyStatus] = useState("atendido");
  const [replyText, setReplyText] = useState("");
  const [replyResponsable, setReplyResponsable] = useState("Vladimir - Super Administrador Principal");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const [printModalClaim, setPrintModalClaim] = useState(null);

  // Escuchar actualizaciones de reclamaciones en tiempo real
  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setReclamacionesList(e.detail);
      } else {
        setReclamacionesList(getReclamaciones());
      }
    };
    window.addEventListener("platino_reclamaciones_updated", handleUpdate);
    return () => window.removeEventListener("platino_reclamaciones_updated", handleUpdate);
  }, []);

  // Abrir modal de respuesta
  const handleOpenReply = (claim) => {
    setReplyModalClaim(claim);
    setReplyStatus(claim.estado === "pendiente" ? "atendido" : claim.estado);
    setReplyText(claim.respuestaProveedor?.detalle || "");
    setReplyResponsable(
      claim.respuestaProveedor?.responsable || "Vladimir - Super Administrador Principal"
    );
  };

  // Guardar respuesta formal
  const handleSaveReply = (e) => {
    e.preventDefault();
    if (!replyModalClaim) return;
    if (!replyText.trim()) {
      alert("Por favor ingresa el texto de la respuesta formal al consumidor.");
      return;
    }

    const ok = updateReclamacionStatus(
      replyModalClaim.id,
      replyStatus,
      replyText.trim(),
      replyResponsable.trim() || "Vladimir - Super Administrador Principal"
    );

    if (ok) {
      setReclamacionesList(getReclamaciones());
      setFeedbackMsg(`Respuesta registrada exitosamente para la hoja ${replyModalClaim.id}.`);
      setTimeout(() => setFeedbackMsg(""), 4500);
      setReplyModalClaim(null);
    }
  };

  // Cálculo de plazo legal (15 días hábiles aprox. 21 días calendario)
  const getDaysElapsed = (fechaStr) => {
    try {
      const fecha = new Date(fechaStr + "T00:00:00");
      const hoy = new Date();
      const diffMs = hoy - fecha;
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return Math.max(0, days);
    } catch {
      return 0;
    }
  };

  // Filtrado reactivo
  const filteredList = useMemo(() => {
    return reclamacionesList.filter((r) => {
      if (filterEstado !== "todos" && r.estado !== filterEstado) return false;
      if (filterTipo !== "todos" && r.tipo !== filterTipo) return false;
      if (filterSede !== "todas" && r.bienContratado?.sede !== filterSede) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = (r.id || "").toLowerCase().includes(q);
        const matchName = (r.consumidor?.nombres || "").toLowerCase().includes(q);
        const matchDoc = (r.consumidor?.numeroDocumento || "").includes(q);
        const matchPhone = (r.consumidor?.telefono || "").includes(q);
        const matchEmail = (r.consumidor?.email || "").toLowerCase().includes(q);
        const matchDesc = (r.bienContratado?.descripcion || "").toLowerCase().includes(q);
        return matchId || matchName || matchDoc || matchPhone || matchEmail || matchDesc;
      }
      return true;
    });
  }, [reclamacionesList, filterEstado, filterTipo, filterSede, searchQuery]);

  // Si no es el administrador principal (Vladimir)
  if (!isMaster) {
    return (
      <div
        className="admin-content-card"
        style={{
          textAlign: "center",
          padding: "60px 24px",
          borderRadius: "12px",
          background: "#ffffff",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ fontSize: "52px", color: "#0a271f", marginBottom: "16px" }}>
          <i className="bi bi-shield-lock-fill"></i>
        </div>
        <h2 style={{ fontSize: "24px", color: "#0a271f", marginBottom: "10px", fontWeight: "700" }}>
          Módulo Exclusivo del Administrador Principal
        </h2>
        <p
          style={{
            maxWidth: "600px",
            margin: "0 auto 24px",
            color: "#64748b",
            fontSize: "15px",
            lineHeight: "1.6",
          }}
        >
          La auditoría y resolución legal del Libro de Reclamaciones conforme al Código de Protección
          y Defensa del Consumidor (Ley N° 29571 / INDECOPI) es una facultad reservada exclusivamente
          para <strong>Vladimir (Super Administrador Principal)</strong>.
        </p>
        <span
          style={{
            display: "inline-block",
            padding: "8px 18px",
            background: "#f1f5f9",
            color: "#475569",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          <i className="bi bi-info-circle me-1"></i> Tu usuario actual no tiene facultades legales sobre este registro.
        </span>
      </div>
    );
  }

  return (
    <div className="reclamaciones-admin-wrapper">
      {/* Mensaje de feedback si se guardó respuesta */}
      {feedbackMsg && (
        <div
          style={{
            backgroundColor: "#ecfdf5",
            border: "1.5px solid #10b981",
            color: "#065f46",
            padding: "14px 20px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <i className="bi bi-check-circle-fill" style={{ fontSize: "18px" }}></i>
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Tarjeta de Información Legal INDECOPI - Con los colores oficiales de Platino Perú (#113B3A y #C6AC7F) */}
      <div
        className="admin-content-card"
        style={{
          padding: "22px 26px",
          borderRadius: "10px",
          marginBottom: "24px",
          border: "1.5px solid #C6AC7F",
          background: "linear-gradient(135deg, #113B3A 0%, #1a4f4e 100%)",
          color: "#ffffff",
          boxShadow: "0 4px 18px rgba(17, 59, 58, 0.18)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "18px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span
                style={{
                  background: "#C6AC7F",
                  color: "#113B3A",
                  fontWeight: "800",
                  fontSize: "11px",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  letterSpacing: "0.06em",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                }}
              >
                INDECOPI OFICIAL
              </span>
              <h2
                style={{
                  fontSize: "21px",
                  margin: 0,
                  fontWeight: "700",
                  color: "#ffffff",
                  fontFamily: "'Playfair Display', Georgia, serif",
                  letterSpacing: "0.03em",
                }}
              >
                {PROVEEDOR_INFO.razonSocial}
              </h2>
            </div>
            <p style={{ margin: "4px 0 0", color: "#F2F9F2", fontSize: "13.5px" }}>
              <strong style={{ color: "#C6AC7F" }}>RUC:</strong> {PROVEEDOR_INFO.ruc} &nbsp;|&nbsp;{" "}
              <strong style={{ color: "#C6AC7F" }}>Domicilio Fiscal:</strong>{" "}
              {PROVEEDOR_INFO.domicilioFiscal}
            </p>
          </div>

          <div
            style={{
              background: "rgba(198, 172, 127, 0.16)",
              border: "1.5px solid #C6AC7F",
              padding: "12px 18px",
              borderRadius: "8px",
              textAlign: "right",
            }}
          >
            <div style={{ fontSize: "12px", color: "#F2F9F2", letterSpacing: "0.02em" }}>
              Plazo Legal Máximo de Respuesta
            </div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#C6AC7F", marginTop: "2px" }}>
              <i className="bi bi-clock-history me-1"></i> 15 Días Hábiles (Ley N° 29571)
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div
        className="admin-content-card"
        style={{
          padding: "18px 20px",
          borderRadius: "10px",
          marginBottom: "24px",
          border: "1px solid #e2e8f0",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "14px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Input de Búsqueda */}
          <div style={{ flex: "1 1 280px", position: "relative" }}>
            <i
              className="bi bi-search"
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                fontSize: "14px",
              }}
            ></i>
            <input
              type="text"
              placeholder="Buscar por N° Hoja (HR-...), Nombre, DNI, Teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px 9px 38px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "13.5px",
                outline: "none",
              }}
            />
          </div>

          {/* Filtro por Estado */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <label style={{ fontSize: "12.5px", fontWeight: "600", color: "#475569", margin: 0 }}>
              Estado:
            </label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                color: "#1e293b",
                background: "#f8fafc",
                fontWeight: "500",
              }}
            >
              <option value="todos">Todos los Estados ({reclamacionesList.length})</option>
              <option value="pendiente">
                ⏳ Pendientes ({reclamacionesList.filter((r) => r.estado === "pendiente").length})
              </option>
              <option value="en_proceso">
                🔄 En Trámite ({reclamacionesList.filter((r) => r.estado === "en_proceso").length})
              </option>
              <option value="atendido">
                ✅ Atendidos ({reclamacionesList.filter((r) => r.estado === "atendido").length})
              </option>
            </select>
          </div>

          {/* Filtro por Tipo */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <label style={{ fontSize: "12.5px", fontWeight: "600", color: "#475569", margin: 0 }}>
              Tipo:
            </label>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                color: "#1e293b",
                background: "#f8fafc",
                fontWeight: "500",
              }}
            >
              <option value="todos">Reclamos & Quejas</option>
              <option value="reclamo">Reclamos (Bienes / Servicios)</option>
              <option value="queja">Quejas (Atención al Cliente)</option>
            </select>
          </div>

          {/* Filtro por Sede */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <label style={{ fontSize: "12.5px", fontWeight: "600", color: "#475569", margin: 0 }}>
              Sede:
            </label>
            <select
              value={filterSede}
              onChange={(e) => setFilterSede(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                color: "#1e293b",
                background: "#f8fafc",
                fontWeight: "500",
              }}
            >
              <option value="todas">Todas las Sedes</option>
              <option value="miraflores">Sede Miraflores</option>
              <option value="lima-centro">Sede Lima Centro</option>
              <option value="virtual">Tienda Virtual</option>
            </select>
          </div>

          {/* Botón de limpiar filtros */}
          {(filterEstado !== "todos" || filterTipo !== "todos" || filterSede !== "todas" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setFilterEstado("todos");
                setFilterTipo("todos");
                setFilterSede("todas");
                setSearchQuery("");
              }}
              style={{
                padding: "8px 14px",
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "12.5px",
                color: "#475569",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              <i className="bi bi-x-circle me-1"></i> Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Lista de Reclamaciones */}
      {filteredList.length === 0 ? (
        <div
          className="admin-content-card"
          style={{
            textAlign: "center",
            padding: "48px 20px",
            borderRadius: "10px",
            background: "#ffffff",
          }}
        >
          <i className="bi bi-inbox" style={{ fontSize: "42px", color: "#94a3b8" }}></i>
          <h3 style={{ fontSize: "18px", color: "#334155", marginTop: "12px", fontWeight: "600" }}>
            No se encontraron hojas de reclamación con los filtros seleccionados
          </h3>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            Intenta cambiar los filtros o el término de búsqueda.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {filteredList.map((claim) => {
            const elapsedDays = getDaysElapsed(claim.fecha);
            const isPending = claim.estado === "pendiente";
            const isInProcess = claim.estado === "en_proceso";
            const isAttended = claim.estado === "atendido";

            return (
              <div
                key={claim.id}
                className="admin-content-card"
                style={{
                  padding: "24px",
                  borderRadius: "10px",
                  border: isPending ? "1.5px solid #fca5a5" : "1px solid #e2e8f0",
                  background: "#ffffff",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                }}
              >
                {/* Cabecera de la Tarjeta */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "12px",
                    paddingBottom: "16px",
                    borderBottom: "1px solid #f1f5f9",
                    marginBottom: "18px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "15px",
                        fontWeight: "800",
                        fontFamily: "monospace",
                        color: "#0a271f",
                        background: "#f0f5f2",
                        border: "1px solid #c9dcd0",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {claim.id}
                    </span>

                    {/* Badge Tipo: Reclamo o Queja */}
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        background: claim.tipo === "reclamo" ? "#fef3c7" : "#ede9fe",
                        color: claim.tipo === "reclamo" ? "#92400e" : "#5b21b6",
                        border: claim.tipo === "reclamo" ? "1px solid #fde68a" : "1px solid #ddd6fe",
                      }}
                    >
                      <i
                        className={
                          claim.tipo === "reclamo"
                            ? "bi bi-exclamation-triangle-fill me-1"
                            : "bi bi-chat-left-dots-fill me-1"
                        }
                      ></i>
                      {claim.tipo === "reclamo" ? "Reclamo (Bien)" : "Queja (Atención)"}
                    </span>

                    {/* Badge Sede */}
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        background: "#f8fafc",
                        color: "#475569",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <i className="bi bi-geo-alt-fill me-1" style={{ color: "#d97706" }}></i>
                      {claim.bienContratado?.sedeNombre || claim.bienContratado?.sede}
                    </span>

                    {/* Badge Estado */}
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        background: isAttended ? "#dcfce7" : isInProcess ? "#fef9c3" : "#fee2e2",
                        color: isAttended ? "#15803d" : isInProcess ? "#854d0e" : "#b91c1c",
                        border: isAttended ? "1px solid #bbf7d0" : isInProcess ? "1px solid #fef08a" : "1px solid #fecaca",
                      }}
                    >
                      {isAttended ? (
                        <>
                          <i className="bi bi-check-circle-fill me-1"></i> Atendido Formalmente
                        </>
                      ) : isInProcess ? (
                        <>
                          <i className="bi bi-arrow-repeat me-1"></i> En Trámite
                        </>
                      ) : (
                        <>
                          <i className="bi bi-hourglass-split me-1"></i> Pendiente de Atención
                        </>
                      )}
                    </span>
                  </div>

                  {/* Fecha de Registro y Semáforo de Plazo */}
                  <div style={{ textAlign: "right", fontSize: "12.5px", color: "#64748b" }}>
                    <div>
                      <i className="bi bi-calendar3 me-1"></i>
                      <strong>Fecha:</strong> {claim.fecha} &nbsp;·&nbsp;
                      <i className="bi bi-clock me-1"></i> {claim.hora}
                    </div>
                    <div style={{ marginTop: "4px" }}>
                      {isAttended ? (
                        <span style={{ color: "#16a34a", fontWeight: "600" }}>
                          <i className="bi bi-patch-check-fill me-1"></i> Respondido dentro del plazo de ley
                        </span>
                      ) : elapsedDays >= 15 ? (
                        <span style={{ color: "#dc2626", fontWeight: "700" }}>
                          <i className="bi bi-exclamation-octagon-fill me-1"></i> Plazo legal de 15 días superado
                        </span>
                      ) : elapsedDays >= 10 ? (
                        <span style={{ color: "#d97706", fontWeight: "700" }}>
                          <i className="bi bi-exclamation-circle-fill me-1"></i> Día {elapsedDays} / 15 hábiles (Atención prioritaria)
                        </span>
                      ) : (
                        <span style={{ color: "#2563eb", fontWeight: "600" }}>
                          <i className="bi bi-hourglass me-1"></i> Día {elapsedDays} de 15 días hábiles
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cuerpo de la Tarjeta en 3 Secciones */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
                    gap: "20px",
                    marginBottom: "18px",
                  }}
                >
                  {/* 1. Datos del Consumidor - Fondo Menta Suave Oficial #F2F9F2 */}
                  <div
                    style={{
                      background: "#F2F9F2",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid #d5e5d5",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#113B3A",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <i className="bi bi-person-fill" style={{ color: "#C6AC7F", fontSize: "14px" }}></i>
                      1. Identificación del Consumidor
                    </div>

                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#113B3A", marginBottom: "4px" }}>
                      {claim.consumidor?.nombres}
                    </div>

                    <div style={{ fontSize: "13px", color: "#475569", marginBottom: "4px" }}>
                      <strong>{claim.consumidor?.tipoDocumento}:</strong> {claim.consumidor?.numeroDocumento}
                    </div>

                    <div style={{ fontSize: "13px", color: "#475569", marginBottom: "4px" }}>
                      <i className="bi bi-telephone me-1" style={{ color: "#113B3A" }}></i>
                      <a
                        href={`https://wa.me/51${(claim.consumidor?.telefono || "").replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#113B3A", fontWeight: "600", textDecoration: "none" }}
                      >
                        {claim.consumidor?.telefono}
                      </a>
                    </div>

                    <div style={{ fontSize: "13px", color: "#475569", marginBottom: "4px" }}>
                      <i className="bi bi-envelope me-1" style={{ color: "#C6AC7F" }}></i>
                      <a
                        href={`mailto:${claim.consumidor?.email}?subject=Respuesta a Hoja de Reclamación ${claim.id} - Platino Perú`}
                        style={{ color: "#113B3A", textDecoration: "none" }}
                      >
                        {claim.consumidor?.email}
                      </a>
                    </div>

                    <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "6px" }}>
                      <i className="bi bi-geo-alt me-1"></i>
                      {claim.consumidor?.direccion},{" "}
                      {claim.consumidor?.distrito && `${claim.consumidor.distrito}, `}
                      {claim.consumidor?.provincia || "Lima"}
                    </div>

                    {claim.consumidor?.esMenorDeEdad && claim.consumidor?.apoderado && (
                      <div
                        style={{
                          marginTop: "10px",
                          padding: "8px 10px",
                          background: "#fff",
                          borderRadius: "6px",
                          border: "1px dashed #C6AC7F",
                          fontSize: "12px",
                        }}
                      >
                        <span style={{ fontWeight: "700", color: "#C6AC7F" }}>
                          <i className="bi bi-shield-check me-1"></i> Menor de edad · Apoderado:
                        </span>
                        <div style={{ color: "#113B3A", marginTop: "2px" }}>
                          {claim.consumidor.apoderado.nombres} ({claim.consumidor.apoderado.tipoDocumento}:{" "}
                          {claim.consumidor.apoderado.numeroDocumento})
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Bien Contratado - Fondo Crema / Marfil Oficial #FDF9F2 */}
                  <div
                    style={{
                      background: "#FDF9F2",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid #ebdec8",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#113B3A",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <i className="bi bi-gem" style={{ color: "#C6AC7F", fontSize: "14px" }}></i>
                      2. Identificación del Bien
                    </div>

                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          background: "#F2F9F2",
                          color: "#113B3A",
                          border: "1px solid #d5e5d5",
                        }}
                      >
                        {claim.bienContratado?.tipoBien || "Producto"}
                      </span>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "#113B3A" }}>
                        Monto: S/.{" "}
                        {Number(claim.bienContratado?.montoReclamado || 0).toLocaleString("es-PE", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: "13.5px",
                        color: "#113B3A",
                        lineHeight: "1.45",
                        marginBottom: "8px",
                      }}
                    >
                      {claim.bienContratado?.descripcion || "Sin descripción específica"}
                    </div>

                    {claim.bienContratado?.numeroPedido && (
                      <div style={{ fontSize: "12.5px", color: "#64748b" }}>
                        <strong>N° Pedido / Boleta:</strong> {claim.bienContratado.numeroPedido}
                      </div>
                    )}
                  </div>

                  {/* 3. Detalle de Reclamación & Solución - Fondo Menta Suave Oficial #F2F9F2 */}
                  <div
                    style={{
                      background: "#F2F9F2",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid #d5e5d5",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#113B3A",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <i className="bi bi-chat-square-text" style={{ color: "#C6AC7F", fontSize: "14px" }}></i>
                      3. Disconformidad del Cliente
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                      <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#113B3A" }}>
                        Motivo / Hechos:
                      </span>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: "13px",
                          color: "#113B3A",
                          lineHeight: "1.45",
                          background: "#ffffff",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          border: "1px solid #d5e5d5",
                        }}
                      >
                        {claim.detalle?.motivo}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#113B3A" }}>
                        Pedido Concreto del Consumidor:
                      </span>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: "13px",
                          color: "#113B3A",
                          lineHeight: "1.45",
                          background: "#ffffff",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          border: "1px solid #d5e5d5",
                        }}
                      >
                        {claim.detalle?.pedido}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sección de Respuesta del Proveedor - Fondo Crema / Marfil con ribete Dorado Oficial #C6AC7F */}
                {claim.respuestaProveedor?.detalle && (
                  <div
                    style={{
                      background: "#FDF9F2",
                      border: "1.5px solid #C6AC7F",
                      borderRadius: "8px",
                      padding: "16px",
                      marginBottom: "18px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "10px",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "13.5px",
                          fontWeight: "700",
                          color: "#113B3A",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <i className="bi bi-shield-check" style={{ fontSize: "16px", color: "#C6AC7F" }}></i>
                        Respuesta Formal de Platino Joyería Perú
                      </div>
                      <div style={{ fontSize: "12px", color: "#7a633a" }}>
                        <strong>Fecha de Notificación:</strong> {claim.respuestaProveedor.fechaRespuesta} &nbsp;·&nbsp;
                        <strong>Responsable:</strong> {claim.respuestaProveedor.responsable}
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: "13.5px", color: "#113B3A", lineHeight: "1.5" }}>
                      {claim.respuestaProveedor.detalle}
                    </p>
                  </div>
                )}

                {/* Barra de Acciones para Vladimir */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                    paddingTop: "14px",
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => handleOpenReply(claim)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 16px",
                        background: "#0a271f",
                        color: "#ffffff",
                        border: "1px solid #0a271f",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      <i className="bi bi-pencil-square"></i>
                      {claim.respuestaProveedor ? "Editar Respuesta Formal" : "Emitir Respuesta Formal"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPrintModalClaim(claim)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 16px",
                        background: "#f8fafc",
                        color: "#334155",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      <i className="bi bi-printer"></i>
                      Imprimir Hoja Oficial
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {claim.consumidor?.telefono && (
                      <a
                        href={`https://wa.me/51${(claim.consumidor.telefono || "").replace(/\D/g, "")}?text=${encodeURIComponent(
                          `Estimado(a) ${claim.consumidor.nombres}, le saluda Vladimir de Platino Joyería Perú respecto a su Hoja de Reclamación ${claim.id}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 14px",
                          background: "#25d366",
                          color: "#ffffff",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "600",
                          textDecoration: "none",
                        }}
                      >
                        <i className="bi bi-whatsapp"></i> WhatsApp
                      </a>
                    )}

                    {claim.consumidor?.email && (
                      <a
                        href={`mailto:${claim.consumidor.email}?subject=Respuesta a Hoja de Reclamación ${claim.id} - Platino Joyería Perú&body=${encodeURIComponent(
                          `Estimado(a) ${claim.consumidor.nombres},\n\nNos dirigimos a usted en atención a su Hoja de Reclamación ${claim.id} presentada el ${claim.fecha}.\n\nAtentamente,\nVladimir\nSuper Administrador Principal\nPlatino Joyería Perú S.A.C.`
                        )}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 14px",
                          background: "#e2e8f0",
                          color: "#1e293b",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "600",
                          textDecoration: "none",
                        }}
                      >
                        <i className="bi bi-envelope"></i> Email
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          MODAL 1: EMITIR / EDITAR RESPUESTA FORMAL DEL PROVEEDOR
          ======================================================== */}
      {replyModalClaim && (
        <div
          className="catalog-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setReplyModalClaim(null);
          }}
        >
          <div
            className="catalog-modal-card"
            style={{ maxWidth: "620px", padding: "26px", borderRadius: "12px" }}
            role="dialog"
            aria-modal="true"
          >
            <button
              className="auth-modal-close"
              onClick={() => setReplyModalClaim(null)}
              aria-label="Cerrar modal"
            >
              <i className="bi bi-x-lg"></i>
            </button>

            <div style={{ marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span
                  style={{
                    background: "#0a271f",
                    color: "#e5cb9b",
                    fontWeight: "800",
                    fontSize: "12px",
                    padding: "3px 9px",
                    borderRadius: "4px",
                    fontFamily: "monospace",
                    border: "1px solid rgba(197, 160, 89, 0.4)",
                  }}
                >
                  {replyModalClaim.id}
                </span>
                <h2 style={{ fontSize: "20px", margin: 0, color: "#0a271f", fontWeight: "700" }}>
                  Respuesta Legal al Consumidor
                </h2>
              </div>
              <p style={{ margin: 0, fontSize: "13.5px", color: "#64748b" }}>
                Consumidor: <strong>{replyModalClaim.consumidor?.nombres}</strong> &nbsp;·&nbsp;
                Tipo: <strong>{replyModalClaim.tipo === "reclamo" ? "Reclamo" : "Queja"}</strong>
              </p>
            </div>

            <form onSubmit={handleSaveReply}>
              {/* Selector de Estado */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Estado de la Hoja de Reclamación:
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <label
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 14px",
                      borderRadius: "6px",
                      border: replyStatus === "atendido" ? "2px solid #16a34a" : "1px solid #cbd5e1",
                      background: replyStatus === "atendido" ? "#f0fdf4" : "#ffffff",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    <input
                      type="radio"
                      name="replyStatus"
                      value="atendido"
                      checked={replyStatus === "atendido"}
                      onChange={(e) => setReplyStatus(e.target.value)}
                    />
                    <span>✅ Atendido Formalmente</span>
                  </label>

                  <label
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 14px",
                      borderRadius: "6px",
                      border: replyStatus === "en_proceso" ? "2px solid #d97706" : "1px solid #cbd5e1",
                      background: replyStatus === "en_proceso" ? "#fefce8" : "#ffffff",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    <input
                      type="radio"
                      name="replyStatus"
                      value="en_proceso"
                      checked={replyStatus === "en_proceso"}
                      onChange={(e) => setReplyStatus(e.target.value)}
                    />
                    <span>🔄 En Trámite / Proceso</span>
                  </label>
                </div>
              </div>

              {/* Responsable de la Respuesta */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Funcionario / Responsable Legal:
                </label>
                <input
                  type="text"
                  value={replyResponsable}
                  onChange={(e) => setReplyResponsable(e.target.value)}
                  placeholder="Ej. Vladimir - Super Administrador Principal"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13.5px",
                  }}
                />
              </div>

              {/* Texto de la Respuesta Formal */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Detalle de la Respuesta / Acciones Adoptadas (INDECOPI):
                </label>
                <textarea
                  rows={6}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Describe la solución ofrecida, propuesta de acuerdo o descargo formal que se remite al consumidor conforme a ley..."
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13.5px",
                    lineHeight: "1.5",
                  }}
                />
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Esta respuesta quedará asentada formalmente en la Hoja de Reclamación Digital.
                </span>
              </div>

              {/* Botones de acción */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setReplyModalClaim(null)}
                  style={{
                    padding: "10px 18px",
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "13.5px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 22px",
                    background: "#0a271f",
                    color: "#ffffff",
                    border: "1px solid #0a271f",
                    borderRadius: "6px",
                    fontSize: "13.5px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  <i className="bi bi-check2-circle me-1"></i> Guardar Respuesta Formal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: VISTA E IMPRESIÓN OFICIAL INDECOPI
          ======================================================== */}
      {printModalClaim && (
        <div
          className="catalog-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPrintModalClaim(null);
          }}
        >
          <div
            className="catalog-modal-card"
            style={{
              maxWidth: "800px",
              padding: "30px",
              borderRadius: "10px",
              background: "#ffffff",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            role="dialog"
            aria-modal="true"
          >
            <button
              className="auth-modal-close"
              onClick={() => setPrintModalClaim(null)}
              aria-label="Cerrar modal"
            >
              <i className="bi bi-x-lg"></i>
            </button>

            {/* Cabecera Oficial Imprimible */}
            <div
              style={{
                border: "2px solid #000",
                padding: "16px",
                textAlign: "center",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ fontSize: "18px", fontWeight: "800", textTransform: "uppercase", margin: 0 }}>
                LIBRO DE RECLAMACIONES VIRTUAL
              </h2>
              <div style={{ fontSize: "14px", fontWeight: "700", marginTop: "4px" }}>
                HOJA DE RECLAMACIÓN OFICIAL: {printModalClaim.id}
              </div>
              <div style={{ fontSize: "12px", color: "#333", marginTop: "4px" }}>
                Conforme al Código de Protección y Defensa del Consumidor (Ley N° 29571 / D.S. N° 011-2011-PCM)
              </div>
            </div>

            {/* Datos del Proveedor */}
            <div style={{ border: "1px solid #000", padding: "10px", marginBottom: "12px", fontSize: "12px" }}>
              <strong>PROVEEDOR:</strong> {PROVEEDOR_INFO.razonSocial} &nbsp;|&nbsp; <strong>RUC:</strong>{" "}
              {PROVEEDOR_INFO.ruc}
              <br />
              <strong>DOMICILIO:</strong> {PROVEEDOR_INFO.domicilioFiscal} &nbsp;|&nbsp; <strong>SEDE:</strong>{" "}
              {printModalClaim.bienContratado?.sedeNombre}
              <br />
              <strong>FECHA Y HORA DE REGISTRO:</strong> {printModalClaim.fecha} a las {printModalClaim.hora}
            </div>

            {/* 1. Consumidor */}
            <div style={{ border: "1px solid #000", padding: "10px", marginBottom: "12px", fontSize: "12px" }}>
              <div style={{ fontWeight: "700", textDecoration: "underline", marginBottom: "4px" }}>
                1. IDENTIFICACIÓN DEL CONSUMIDOR RECLAMANTE
              </div>
              <strong>Nombres y Apellidos:</strong> {printModalClaim.consumidor?.nombres}
              <br />
              <strong>Documento:</strong> {printModalClaim.consumidor?.tipoDocumento}{" "}
              {printModalClaim.consumidor?.numeroDocumento} &nbsp;|&nbsp; <strong>Teléfono:</strong>{" "}
              {printModalClaim.consumidor?.telefono} &nbsp;|&nbsp; <strong>Email:</strong>{" "}
              {printModalClaim.consumidor?.email}
              <br />
              <strong>Domicilio:</strong> {printModalClaim.consumidor?.direccion},{" "}
              {printModalClaim.consumidor?.distrito}, {printModalClaim.consumidor?.provincia || "Lima"}
              {printModalClaim.consumidor?.esMenorDeEdad && printModalClaim.consumidor?.apoderado && (
                <div style={{ marginTop: "4px", padding: "4px", background: "#f8f8f8" }}>
                  <strong>Padre / Madre / Tutor Legal:</strong> {printModalClaim.consumidor.apoderado.nombres} (
                  {printModalClaim.consumidor.apoderado.tipoDocumento}:{" "}
                  {printModalClaim.consumidor.apoderado.numeroDocumento})
                </div>
              )}
            </div>

            {/* 2. Bien Contratado */}
            <div style={{ border: "1px solid #000", padding: "10px", marginBottom: "12px", fontSize: "12px" }}>
              <div style={{ fontWeight: "700", textDecoration: "underline", marginBottom: "4px" }}>
                2. IDENTIFICACIÓN DEL BIEN CONTRATADO
              </div>
              <strong>Tipo de Bien:</strong> {printModalClaim.bienContratado?.tipoBien?.toUpperCase()} &nbsp;|&nbsp;
              <strong>Monto Reclamado:</strong> S/.{" "}
              {Number(printModalClaim.bienContratado?.montoReclamado || 0).toFixed(2)} &nbsp;|&nbsp;
              <strong>N° Pedido:</strong> {printModalClaim.bienContratado?.numeroPedido || "N/A"}
              <br />
              <strong>Descripción:</strong> {printModalClaim.bienContratado?.descripcion}
            </div>

            {/* 3. Detalle de Reclamación */}
            <div style={{ border: "1px solid #000", padding: "10px", marginBottom: "12px", fontSize: "12px" }}>
              <div style={{ fontWeight: "700", textDecoration: "underline", marginBottom: "4px" }}>
                3. DETALLE DE LA RECLAMACIÓN ({printModalClaim.tipo?.toUpperCase()})
              </div>
              <div style={{ marginBottom: "6px" }}>
                <strong>Motivo / Fundamentos:</strong>
                <p style={{ margin: "2px 0 0", fontStyle: "italic" }}>{printModalClaim.detalle?.motivo}</p>
              </div>
              <div>
                <strong>Pedido Concreto:</strong>
                <p style={{ margin: "2px 0 0", fontStyle: "italic" }}>{printModalClaim.detalle?.pedido}</p>
              </div>
            </div>

            {/* 4. Acciones del Proveedor */}
            <div style={{ border: "1px solid #000", padding: "10px", marginBottom: "16px", fontSize: "12px" }}>
              <div style={{ fontWeight: "700", textDecoration: "underline", marginBottom: "4px" }}>
                4. ACCIONES ADOPTADAS POR EL PROVEEDOR
              </div>
              <strong>Estado Actual:</strong> {printModalClaim.estado?.toUpperCase()} &nbsp;|&nbsp;
              <strong>Fecha de Respuesta:</strong> {printModalClaim.respuestaProveedor?.fechaRespuesta || "Pendiente"} &nbsp;|&nbsp;
              <strong>Responsable:</strong> {printModalClaim.respuestaProveedor?.responsable || "Vladimir (Administrador Principal)"}
              <br />
              <strong>Detalle de la Respuesta:</strong>
              <p style={{ margin: "4px 0 0", fontWeight: "600" }}>
                {printModalClaim.respuestaProveedor?.detalle || "En proceso de resolución dentro del plazo legal de 15 días hábiles."}
              </p>
            </div>

            {/* Botones de Acción */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setPrintModalClaim(null)}
                style={{
                  padding: "9px 16px",
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  padding: "9px 20px",
                  background: "#0a271f",
                  color: "#ffffff",
                  border: "1px solid #0a271f",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                <i className="bi bi-printer me-1" style={{ color: "#c5a059" }}></i> Imprimir / Guardar en PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
