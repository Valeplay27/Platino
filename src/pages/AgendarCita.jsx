import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { sedesData } from "../data/sedes";
import { TIME_SLOTS, isSlotBlocked, saveCita } from "../services/citasService";
import "../../styles/citas.css";

// Función para obtener la fecha mínima permitida según el tipo de servicio:
// - Cita con Gemólogo: 3 días de anticipación
// - Cita de Asesoría General: 1 día de anticipación (a partir de mañana)
const getMinBookingDateString = (type = "asesoria") => {
  const daysAdvance = type === "gemologo" ? 3 : 1;
  const d = new Date();
  d.setDate(d.getDate() + daysAdvance);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function AgendarCita() {
  const [searchParams] = useSearchParams();

  // Pre-selección desde query params si existen
  const initialSedeParam = searchParams.get("sede");
  const initialTipoParam = searchParams.get("tipo");

  const [selectedSedeId, setSelectedSedeId] = useState(
    initialSedeParam && sedesData.some((s) => s.id === initialSedeParam)
      ? initialSedeParam
      : sedesData[0].id
  );

  const [serviceType, setServiceType] = useState(
    initialTipoParam === "gemologo" ? "gemologo" : "asesoria"
  );

  // Fecha mínima permitida (3 días para gemólogo, 1 día para asesoría general)
  const minBookingDate = getMinBookingDateString(serviceType);
  const [selectedDate, setSelectedDate] = useState(() =>
    getMinBookingDateString(initialTipoParam === "gemologo" ? "gemologo" : "asesoria")
  );
  const [selectedTime, setSelectedTime] = useState("");

  const handleServiceTypeChange = (newType) => {
    setServiceType(newType);
    const newMin = getMinBookingDateString(newType);
    if (selectedDate < newMin) {
      setSelectedDate(newMin);
      setSelectedTime("");
    }
  };

  // Verificar si la fecha seleccionada cae domingo
  const isSunday = new Date(selectedDate + "T00:00:00").getDay() === 0;

  // Datos del cliente
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [observation, setObservation] = useState("");

  // Estado de éxito
  const [confirmedCita, setConfirmedCita] = useState(null);
  const [, setRefreshKey] = useState(0);

  // Actualizar si el admin cambia bloqueos
  useEffect(() => {
    const handleUpdate = () => setRefreshKey((k) => k + 1);
    window.addEventListener("citas_updated", handleUpdate);
    return () => window.removeEventListener("citas_updated", handleUpdate);
  }, []);

  const selectedSede = sedesData.find((s) => s.id === selectedSedeId) || sedesData[0];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedDate < minBookingDate) {
      alert(
        serviceType === "gemologo"
          ? "Por favor selecciona una fecha válida. Las citas con Gemólogo requieren al menos 3 días de anticipación para la preparación de instrumental y muestras."
          : "Por favor selecciona una fecha válida a partir de mañana. Las citas de Asesoría General requieren al menos 1 día de anticipación."
      );
      setSelectedDate(minBookingDate);
      setSelectedTime("");
      return;
    }

    if (isSunday) {
      alert("Nuestras sedes permanecen cerradas los domingos. Por favor selecciona una fecha de Lunes a Sábado.");
      return;
    }

    if (!selectedTime) {
      alert("Por favor selecciona una hora de atención disponible.");
      return;
    }
    if (!clientName.trim() || !clientPhone.trim() || !clientEmail.trim()) {
      alert("Por favor completa tus datos de contacto.");
      return;
    }

    // Verificar si sigue libre en ese instante para este tipo de servicio
    const check = isSlotBlocked(selectedSedeId, selectedDate, selectedTime, serviceType);
    if (check.blocked) {
      alert(`Lo sentimos, este horario acaba de ser reservado o bloqueado (${check.reason}). Por favor elige otra hora.`);
      setSelectedTime("");
      return;
    }

    const newCita = saveCita({
      sedeId: selectedSede.id,
      sedeName: selectedSede.name,
      serviceType,
      serviceTitle:
        serviceType === "gemologo"
          ? "Cita con Gemólogo (Análisis de Gemas y Diamantes)"
          : "Cita de Asesoría General (Aros y Joyería Fina)",
      date: selectedDate,
      time: selectedTime,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim(),
      observation: observation.trim() || "Asesoría general en joyería fina.",
    });

    setConfirmedCita(newCita);
  };

  const getWhatsAppMessageUrl = () => {
    if (!confirmedCita) return "#";
    const msg = `¡Hola Platino Perú! Acabo de agendar una cita.%0A%0A*Código de Cita:* ${confirmedCita.id}%0A*Sede:* ${confirmedCita.sedeName}%0A*Servicio:* ${confirmedCita.serviceTitle}%0A*Fecha:* ${confirmedCita.date}%0A*Hora:* ${confirmedCita.time}%0A*Cliente:* ${confirmedCita.clientName}%0A*Teléfono:* ${confirmedCita.clientPhone}%0A*Observación:* ${encodeURIComponent(confirmedCita.observation)}`;
    return `https://wa.me/${selectedSede.whatsapp.replace("+", "")}?text=${msg}`;
  };

  // Pantalla de Confirmación
  if (confirmedCita) {
    return (
      <div className="booking-page">
        <div className="booking-container">
          <div className="booking-success-card">
            <div className="success-icon-box">
              <i className="bi bi-check-lg"></i>
            </div>
            <h1 className="success-title">¡Cita Agendada con Éxito!</h1>
            <span className="success-code-badge">
              Código de Reserva: {confirmedCita.id}
            </span>
            <p style={{ color: "#5d6761", fontSize: "14px", marginBottom: "24px" }}>
              Hemos registrado tu cita en <strong>{confirmedCita.sedeName}</strong>. Te esperamos para brindarte una atención exclusiva.
            </p>

            <div className="success-details-box">
              <div className="success-line">
                <span className="success-label">Sede:</span>
                <span className="success-val">{confirmedCita.sedeName} ({selectedSede.address})</span>
              </div>
              <div className="success-line">
                <span className="success-label">Servicio:</span>
                <span className="success-val">{confirmedCita.serviceTitle}</span>
              </div>
              <div className="success-line">
                <span className="success-label">Fecha y Hora:</span>
                <span className="success-val">{confirmedCita.date} a las {confirmedCita.time}</span>
              </div>
              <div className="success-line">
                <span className="success-label">Cliente:</span>
                <span className="success-val">{confirmedCita.clientName}</span>
              </div>
              <div className="success-line">
                <span className="success-label">Teléfono:</span>
                <span className="success-val">{confirmedCita.clientPhone}</span>
              </div>
              <div className="success-line">
                <span className="success-label">Observación:</span>
                <span className="success-val">{confirmedCita.observation}</span>
              </div>
            </div>

            <div className="success-actions">
              <a
                href={getWhatsAppMessageUrl()}
                target="_blank"
                rel="noreferrer"
                className="btn-book-submit"
                style={{ backgroundColor: "#25d366", display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <i className="bi bi-whatsapp"></i> Confirmar por WhatsApp
              </a>

              <a
                href={selectedSede.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="showroom-btn outline"
              >
                <i className="bi bi-geo-alt"></i> Ver cómo llegar en Google Maps
              </a>

              <button
                onClick={() => {
                  setConfirmedCita(null);
                  setSelectedTime("");
                  setObservation("");
                }}
                className="showroom-btn outline"
              >
                Agendar otra cita
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-container">
        {/* Encabezado */}
        <div className="booking-header">
          <span className="booking-eyebrow">Atención Exclusiva</span>
          <h1 className="booking-title">Agenda tu Cita en Joyería</h1>
          <p className="booking-subtitle">
            Selecciona tu sede favorita en Lima, el tipo de asesoría personalizada y el horario que más te convenga.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="booking-card">
          {/* PASO 1: SELECCIONAR SEDE */}
          <div className="booking-section-block">
            <h3 className="booking-section-title">
              <span className="step-number">1</span> Selecciona la Sede
            </h3>
            <p className="booking-section-desc">
              ¿En cuál de nuestras dos boutiques deseas ser atendido?
            </p>

            <div className="sedes-select-grid">
              {sedesData.map((sede) => {
                const isSelected = selectedSedeId === sede.id;
                return (
                  <div
                    key={sede.id}
                    className={`sede-select-option ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedSedeId(sede.id);
                      setSelectedTime(""); // Limpiar hora al cambiar sede
                    }}
                  >
                    {isSelected && (
                      <span className="selected-check">
                        <i className="bi bi-check-circle-fill"></i>
                      </span>
                    )}
                    <h4 className="sede-opt-title">{sede.name}</h4>
                    <p className="sede-opt-address">{sede.address}</p>
                    <p className="sede-opt-ref">{sede.reference}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PASO 2: TIPO DE SERVICIO (GEMOLOGÍA VS ASESORÍA) */}
          <div className="booking-section-block">
            <h3 className="booking-section-title">
              <span className="step-number">2</span> Tipo de Cita
            </h3>
            <p className="booking-section-desc">
              Elige el enfoque principal de tu visita:
            </p>

            <div className="service-type-grid">
              {/* Opción 1: Gemología (3 días de anticipación) */}
              <button
                type="button"
                className={`service-type-btn ${serviceType === "gemologo" ? "selected" : ""}`}
                onClick={() => handleServiceTypeChange("gemologo")}
              >
                <div className="service-icon-circle">
                  <i className="bi bi-gem"></i>
                </div>
                <div>
                  <span className="service-anticipacion-tag gemologo">
                    <i className="bi bi-clock-history"></i> Mínimo 3 días de anticipación
                  </span>
                  <h4 className="service-info-title">Cita con Gemólogo</h4>
                  <p className="service-info-desc">
                    Asesoría técnica y gemológica especializada: certificación GIA, análisis de diamantes, quilates, pureza y selección de cortes y gemas naturales.
                  </p>
                </div>
              </button>

              {/* Opción 2: Asesoría General (1 día de anticipación) */}
              <button
                type="button"
                className={`service-type-btn ${serviceType === "asesoria" ? "selected" : ""}`}
                onClick={() => handleServiceTypeChange("asesoria")}
              >
                <div className="service-icon-circle">
                  <i className="bi bi-heart"></i>
                </div>
                <div>
                  <span className="service-anticipacion-tag general">
                    <i className="bi bi-clock-history"></i> 1 día de anticipación (desde mañana)
                  </span>
                  <h4 className="service-info-title">Cita de Asesoría General</h4>
                  <p className="service-info-desc">
                    Orientación para aros de matrimonio, anillos de promesa, regalos de aniversario, catálogo exclusivo y prueba de medidas y entallado en tienda.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* PASO 3: FECHA Y HORA */}
          <div className="booking-section-block">
            <h3 className="booking-section-title">
              <span className="step-number">3</span> Fecha y Hora de Atención
            </h3>
            <p className="booking-section-desc">
              Atención de Lunes a Sábado de 10:00 am a 7:00 pm (Refrigerio de 1:00 pm a 2:00 pm). Los horarios bloqueados no están disponibles.
            </p>

            <div className="datetime-container">
              {/* Selector de Fecha */}
              <div className="date-picker-box">
                <label htmlFor="cita-date">
                  <i className="bi bi-calendar3"></i> Fecha de la cita (
                  {serviceType === "gemologo"
                    ? "mínimo 3 días de anticipación"
                    : "mínimo 1 día de anticipación, a partir de mañana"}
                  ):
                </label>
                <input
                  id="cita-date"
                  type="date"
                  min={minBookingDate}
                  value={selectedDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val < minBookingDate) {
                      alert(
                        serviceType === "gemologo"
                          ? "Las citas con Gemólogo requieren al menos 3 días de anticipación para la preparación de instrumental y muestras."
                          : "Las citas de Asesoría General deben reservarse con al menos 1 día de anticipación (a partir de mañana)."
                      );
                      setSelectedDate(minBookingDate);
                      setSelectedTime("");
                      return;
                    }
                    const checkSunday = new Date(val + "T00:00:00").getDay() === 0;
                    if (checkSunday) {
                      alert("Nuestras sedes permanecen cerradas los domingos. Por favor selecciona una fecha de Lunes a Sábado.");
                    }
                    setSelectedDate(val);
                    setSelectedTime("");
                  }}
                  className="date-picker-input"
                  required
                />
                <span className="form-field-hint">
                  {serviceType === "gemologo"
                    ? `⏳ Citas con Gemólogo disponibles a partir del ${minBookingDate} (3 días de anticipación requeridos).`
                    : `⏳ Citas de Asesoría General disponibles a partir de mañana (${minBookingDate}).`}
                </span>
              </div>

              {/* Grilla de Horarios o Mensaje de Domingo */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#2b3530", display: "block", marginBottom: "8px" }}>
                  <i className="bi bi-clock"></i> Horas Disponibles para {selectedDate}:
                </label>

                {isSunday ? (
                  <div
                    style={{
                      background: "#fdf2f2",
                      border: "1px solid #f3c2c2",
                      padding: "16px 18px",
                      borderRadius: "4px",
                      color: "#b9423c",
                      fontSize: "12.5px",
                      lineHeight: "1.5",
                    }}
                  >
                    <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: "6px" }}></i>
                    Nuestras boutiques no atienden los domingos. Por favor selecciona una fecha de <strong>Lunes a Sábado</strong> para ver los horarios disponibles.
                  </div>
                ) : (
                  <>
                    <div className="slots-grid">
                      {TIME_SLOTS.map((slot) => {
                        const blockCheck = isSlotBlocked(selectedSedeId, selectedDate, slot, serviceType);
                        const isSelected = selectedTime === slot;

                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={blockCheck.blocked}
                            onClick={() => setSelectedTime(slot)}
                            className={`time-slot-btn ${isSelected ? "selected" : ""} ${
                              blockCheck.blocked ? "blocked" : ""
                            }`}
                            title={blockCheck.blocked ? blockCheck.reason : `Reservar a las ${slot}`}
                          >
                            {slot}
                            {blockCheck.blocked && (
                              <span className="slot-status-hint">
                                {serviceType === "gemologo" ? "No disponible" : "Bloqueado"}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {!selectedTime && (
                      <p style={{ color: "#b9423c", fontSize: "11px", marginTop: "8px" }}>
                        * Por favor haz click en una hora libre para seleccionarla.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* PASO 4: DATOS DEL CLIENTE Y OBSERVACIÓN */}
          <div className="booking-section-block">
            <h3 className="booking-section-title">
              <span className="step-number">4</span> Tus Datos y Observación
            </h3>
            <p className="booking-section-desc">
              Ingresa tus datos para confirmar tu cita y cuéntanos qué deseas consultar.
            </p>

            <div className="customer-form-grid">
              <div className="form-field">
                <label htmlFor="client-name">Nombres y Apellidos *</label>
                <input
                  id="client-name"
                  type="text"
                  placeholder="Ej. María Elena Paredes"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="client-phone">Teléfono / WhatsApp *</label>
                <input
                  id="client-phone"
                  type="tel"
                  placeholder="Ej. 987 654 321"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-field form-group-full">
                <label htmlFor="client-email">Correo Electrónico *</label>
                <input
                  id="client-email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  required
                />
              </div>

              {/* OBSERVACIÓN / MOTIVO */}
              <div className="form-field form-group-full">
                <label htmlFor="client-obs">
                  <i className="bi bi-chat-text"></i> Observación o Motivo de la Cita:
                </label>
                <textarea
                  id="client-obs"
                  placeholder="Escribe aquí para qué es tu cita (ej. Me gustaría ver opciones de sortijas de compromiso en corte redondo, cotizar aros de boda en oro blanco, ver diamantes certificados, etc.)"
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  rows={3}
                ></textarea>
                <span className="form-field-hint">
                  Esta observación le permitirá al gemólogo o asesor preparar las piezas ideales para tu visita.
                </span>
              </div>
            </div>
          </div>

          {/* BOTÓN ENVIAR */}
          <div className="booking-submit-row">
            <Link to="/sedes" className="showroom-btn outline">
              Ver Sedes en Mapa
            </Link>

            <button
              type="submit"
              disabled={!selectedTime}
              className="btn-book-submit"
            >
              Confirmar y Agendar Cita
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
