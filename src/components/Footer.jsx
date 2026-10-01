import { Link } from "react-router-dom";
import "../../styles/layout.css";

const Footer = () => {
  return (
    <footer className="platino-footer">
      <div className="footer-container">
        {/* 4 Main Columns */}
        <div className="footer-columns-grid">
          {/* Column 1: NOSOTROS */}
          <div className="footer-col">
            <h4 className="footer-col-title">NOSOTROS</h4>
            <ul className="footer-links-list">
              <li>
                <Link to="/nosotros">Nuestra Historia</Link>
              </li>
              <li>
                <Link to="/nosotros/mision">Nuestra Misión</Link>
              </li>
              <li>
                <Link to="/nosotros/responsabilidad-social">
                  Responsabilidad Social
                </Link>
              </li>
              <li>
                <Link to="/nosotros/retribucion-comunidad">
                  Retribución a la Comunidad
                </Link>
              </li>
              <li>
                <Link to="/testimonios">Nuestros Clientes Dicen</Link>
              </li>
            </ul>
          </div>

          {/* Column 2: SERVICIO AL CLIENTE */}
          <div className="footer-col">
            <h4 className="footer-col-title">SERVICIO AL CLIENTE</h4>
            <ul className="footer-links-list">
              <li>
                <Link to="/agendar-cita">Agendar Cita en Joyería</Link>
              </li>
              <li>
                <Link to="/sedes">Nuestras Sedes (Lima y Miraflores)</Link>
              </li>
              <li>
                <Link to="/preguntas-frecuentes">Preguntas Frecuentes</Link>
              </li>
              <li>
                <Link to="/fondo-de-bodas">Fondo de Bodas</Link>
              </li>
              <li>
                <Link to="/gift-cards">Gift Cards</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: MI ORDEN */}
          <div className="footer-col">
            <h4 className="footer-col-title">MI ORDEN</h4>
            <ul className="footer-links-list">
              <li>
                <Link to="/seguimiento">Seguimiento de Pedido</Link>
              </li>
              <li>
                <Link to="/carrito">Mi Carrito</Link>
              </li>
              <li>
                <Link to="/mis-joyas">Mis Joyas</Link>
              </li>
              <li>
                <Link to="/certificados">Certificados</Link>
              </li>
              <li>
                <Link to="/mantenimientos">Mantenimientos</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: CONTÁCTANOS */}
          <div className="footer-col footer-col-contact">
            <h4 className="footer-col-title">CONTÁCTANOS</h4>
            <ul className="footer-contact-list">
              <li>
                <span>WhatsApp Lima:</span>{" "}
                <a href="https://wa.me/51927357217" target="_blank" rel="noreferrer">
                  927 357 217
                </a>
              </li>
              <li>
                <span>WhatsApp Miraflores:</span>{" "}
                <a href="https://wa.me/51984281116" target="_blank" rel="noreferrer">
                  984 281 116
                </a>
              </li>
              <li>
                <a href="mailto:contacto@platinoperu.com">
                  contacto@platinoperu.com
                </a>
              </li>
              <li style={{ marginTop: "6px" }}>
                <a
                  href="https://maps.app.goo.gl/fbS5VVr2qUGXLkGk7"
                  target="_blank"
                  rel="noreferrer"
                  title="Ver Sede Lima Centro en Google Maps"
                >
                  <i className="bi bi-geo-alt" style={{ marginRight: "4px" }}></i>
                  <strong>Sede Lima:</strong> Jr. de la Unión 446
                </a>
              </li>
              <li>
                <a
                  href="https://maps.app.goo.gl/r29fPJUH3UavUsWQ7"
                  target="_blank"
                  rel="noreferrer"
                  title="Ver Sede Miraflores en Google Maps"
                >
                  <i className="bi bi-geo-alt" style={{ marginRight: "4px" }}></i>
                  <strong>Sede Miraflores:</strong> Av. José Larco 345
                </a>
              </li>
              <li className="hours-item">
                <span>Lunes a Sábado de 10am a 7pm</span>
              </li>
              <li className="hours-item muted">
                <span>Refrigerio: 1:00pm a 2:00pm</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Social | Logo | Libro de Reclamaciones */}
        <div className="footer-bottom-bar">
          {/* Social Links on the left */}
          <div className="footer-social-group">
            <a
              href="https://www.tiktok.com/@platinoperu?_r=1&_t=ZS-9ABLUyhWnPG"
              target="_blank"
              rel="noreferrer"
              className="social-text-link"
              title="TikTok Platino Perú"
            >
              TIKTOK
            </a>
            <a
              href="https://www.instagram.com/platinoperu?stkn=ajRldHlmOWhhMXdo"
              target="_blank"
              rel="noreferrer"
              className="social-icon-badge"
              aria-label="Instagram Platino Perú"
              title="Instagram @platinoperu"
            >
              <i className="bi bi-instagram"></i>
            </a>
            <a
              href="https://www.facebook.com/share/1F3P6htAJB/?mibextid=wwXIfr"
              target="_blank"
              rel="noreferrer"
              className="social-icon-badge"
              aria-label="Facebook Platino Perú"
              title="Facebook Platino Perú"
            >
              <i className="bi bi-facebook"></i>
            </a>
            <span className="social-handle">@platinoperu</span>
          </div>

          {/* Center Brand Logo */}
          <div className="footer-center-brand">
            <Link to="/" className="brand-logo" aria-label="Platino Perú Inicio">
              <span className="brand-name">PLATINO</span>
              <span className="brand-gem">❖</span>
              <span className="brand-country">PERÚ</span>
            </Link>
          </div>

          {/* Right Libro de Reclamaciones */}
          <div className="footer-reclamaciones">
            <Link to="/libro-de-reclamaciones" className="reclamaciones-box">
              <i className="bi bi-book"></i>
              <span>LIBRO DE RECLAMACIONES</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;