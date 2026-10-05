import { useState } from "react";
import { Link } from "react-router-dom";
import { sedesData } from "../data/sedes";
import "../../styles/sedes.css";

export default function Sedes() {
  const [activeMapSede, setActiveMapSede] = useState(sedesData[0]);

  return (
    <div className="sedes-page">
      {/* Hero Header */}
      <section className="sedes-hero">
        <div className="sedes-hero-container">
          <span className="sedes-eyebrow">Boutiques Exclusivas</span>
          <h1 className="sedes-hero-title">Nuestras Sedes en Lima</h1>
          <p className="sedes-hero-subtitle">
            Te invitamos a vivir la experiencia Platino Perú en persona.
            Encuentra tu sortija de compromiso o aros de matrimonio ideales
            con la guía de nuestros asesores expertos.
          </p>
        </div>
      </section>

      {/* Main Sedes Cards */}
      <div className="sedes-main-container">
        <div className="sedes-grid">
          {sedesData.map((sede) => (
            <div key={sede.id} className="sede-card">
              <div className="sede-card-img-box">
                <img
                  src={sede.image}
                  alt={`${sede.name} Platino Perú`}
                  className="sede-card-img"
                />
                <span className="sede-badge">{sede.district}</span>
              </div>

              <div className="sede-card-body">
                <div className="sede-header-row">
                  <h2 className="sede-title">{sede.name}</h2>
                  <p className="sede-subtitle">{sede.subtitle}</p>
                </div>

                <div className="sede-info-list">
                  <div className="sede-info-item">
                    <i className="bi bi-geo-alt-fill"></i>
                    <div>
                      <strong>Dirección:</strong>
                      <div>{sede.address}</div>
                      <small style={{ color: "#77807a" }}>{sede.reference}</small>
                    </div>
                  </div>

                  <div className="sede-info-item">
                    <i className="bi bi-clock-fill"></i>
                    <div>
                      <strong>Horario de Atención:</strong>
                      <div>{sede.hours}</div>
                      <small style={{ color: "#8a948e" }}>{sede.breakTime}</small>
                    </div>
                  </div>

                  <div className="sede-info-item">
                    <i className="bi bi-whatsapp"></i>
                    <div>
                      <strong>WhatsApp y Asesoría:</strong>
                      <div>
                        <a
                          href={`https://wa.me/${sede.whatsapp.replace("+", "")}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#166e37", textDecoration: "underline" }}
                        >
                          {sede.whatsappDisplay}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Servicios de la sede */}
                <div className="sede-services-box">
                  <h4 className="sede-services-title">Servicios en esta sede</h4>
                  <ul className="sede-services-list">
                    {sede.services.map((svc, sIdx) => (
                      <li key={sIdx}>{svc}</li>
                    ))}
                  </ul>
                </div>

                {/* Acciones de la sede */}
                <div className="sede-actions">
                  <a
                    href={sede.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-maps-primary"
                    title={`Abrir ${sede.name} en Google Maps`}
                  >
                    <i className="bi bi-map-fill"></i>
                    Ver Ubicación en Google Maps
                  </a>

                  <div className="sede-secondary-actions">
                    <a
                      href={`https://wa.me/${sede.whatsapp.replace("+", "")}?text=Hola,%20deseo%20información%20sobre%20la%20${encodeURIComponent(sede.name)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-whatsapp-outline"
                    >
                      <i className="bi bi-whatsapp"></i>
                      WhatsApp
                    </a>

                    <Link
                      to={`/agendar-cita?sede=${sede.id}`}
                      className="btn-cita-outline"
                    >
                      <i className="bi bi-calendar2-check"></i>
                      Agendar Cita
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Map Preview Section */}
      <section className="map-preview-section">
        <div className="map-card-container">
          <div className="map-card-header">
            <h3 className="map-card-title">
              Mapa de Ubicación: {activeMapSede.name}
            </h3>

            <div className="sede-tab-buttons">
              {sedesData.map((s) => (
                <button
                  key={s.id}
                  className={`sede-tab-btn ${activeMapSede.id === s.id ? "active" : ""}`}
                  onClick={() => setActiveMapSede(s)}
                >
                  <i className="bi bi-geo-alt"></i> {s.name}
                </button>
              ))}
            </div>
          </div>

          <iframe
            title={`Mapa de ${activeMapSede.name}`}
            src={activeMapSede.embedUrl}
            className="interactive-map-frame"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>

      {/* Bottom Cita CTA */}
      <section className="sedes-appointment-cta">
        <div className="sedes-appointment-container">
          <h2 className="sedes-cta-title">¿Deseas una atención personalizada?</h2>
          <p className="sedes-cta-desc">
            Reserva una cita con un asesor en cualquiera de nuestras sedes
            de Lima Centro o Miraflores para una asesoría exclusiva y sin compromiso.
          </p>
          <div className="sedes-cta-buttons">
            <Link to="/agendar-cita" className="showroom-btn filled">
              Agendar Cita en Joyería
            </Link>
            <a
              href="https://wa.me/51999000000?text=Hola,%20quisiera%20agendar%20una%20visita%20a%20sus%20sedes"
              target="_blank"
              rel="noreferrer"
              className="showroom-btn outline"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
