import { useState } from "react";
import { Link } from "react-router-dom";
import { sedesData } from "../data/sedes";

export default function AsesoriaOnlineModal({ isOpen, onClose }) {
  const [selectedSedeId, setSelectedSedeId] = useState(null);

  if (!isOpen) return null;

  const selectedSede = sedesData.find((s) => s.id === selectedSedeId);

  const getWaLink = (sede) => {
    const rawNumber = sede.whatsapp.replace(/\D/g, "");
    const msg = encodeURIComponent(
      `Hola Platino Perú (${sede.name}), me gustaría recibir asesoría online personalizada sobre joyas y modelos disponibles.`
    );
    return `https://wa.me/${rawNumber}?text=${msg}`;
  };

  return (
    <div
      className="asesoria-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="asesoria-modal-card">
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="asesoria-modal-close"
          aria-label="Cerrar modal"
        >
          <i className="bi bi-x-lg"></i>
        </button>

        {/* Cabecera */}
        <div className="asesoria-modal-header">
          <div className="asesoria-icon-badge">
            <i className="bi bi-headset"></i>
          </div>
          <span className="asesoria-eyebrow">Asesoría Online Personalizada</span>
          <h2 className="asesoria-title">
            ¿A cuál de nuestras oficinas te encuentras más cerca?
          </h2>
          <p className="asesoria-subtitle">
            Selecciona tu sede de preferencia para comunicarte directamente con el asesor y número de WhatsApp de esa tienda:
          </p>
        </div>

        {/* Tarjetas de Selección de Sede */}
        <div className="asesoria-sedes-grid">
          {sedesData.map((sede) => {
            const isSelected = selectedSedeId === sede.id;
            return (
              <div
                key={sede.id}
                className={`asesoria-sede-card ${isSelected ? "selected" : ""}`}
                onClick={() => setSelectedSedeId(sede.id)}
              >
                <div className="asesoria-sede-top">
                  <div className="asesoria-radio-circle">
                    {isSelected && <div className="asesoria-radio-inner" />}
                  </div>
                  <div>
                    <h3 className="asesoria-sede-name">{sede.name}</h3>
                    <span className="asesoria-sede-district">{sede.district}</span>
                  </div>
                </div>

                <div className="asesoria-sede-details">
                  <p className="asesoria-sede-address">
                    <i className="bi bi-geo-alt-fill"></i> {sede.address}
                  </p>
                  <p className="asesoria-sede-ref">{sede.reference}</p>
                </div>

                {/* Número de WhatsApp alineado a la tienda */}
                <div className="asesoria-wa-highlight">
                  <span className="asesoria-wa-label">
                    <i className="bi bi-whatsapp"></i> WhatsApp Directo Tienda:
                  </span>
                  <span className="asesoria-wa-number">{sede.whatsappDisplay}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Panel de Acción cuando se ha seleccionado una sede */}
        {selectedSede ? (
          <div className="asesoria-action-box">
            <div className="asesoria-action-info">
              <span className="asesoria-online-dot"></span>
              <span>
                Asesor oficial de <strong>{selectedSede.name}</strong> conectado.
              </span>
            </div>

            <a
              href={getWaLink(selectedSede)}
              target="_blank"
              rel="noreferrer"
              className="btn-asesoria-whatsapp"
            >
              <i className="bi bi-whatsapp"></i>
              <span>Abrir WhatsApp {selectedSede.name} ({selectedSede.whatsappDisplay})</span>
            </a>

            <div className="asesoria-alternative-row">
              <span>¿Prefieres agendar una cita formal en tienda o por videollamada?</span>
              <Link
                to={`/agendar-cita?tipo=asesoria&sede=${selectedSede.id}`}
                onClick={onClose}
                className="asesoria-cita-link"
              >
                Agendar Cita en Calendario <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        ) : (
          <div className="asesoria-prompt-box">
            <i className="bi bi-hand-index-thumb"></i>
            <span>Haz clic en la sede más cercana arriba para contactar a su WhatsApp oficial</span>
          </div>
        )}
      </div>
    </div>
  );
}
