import { Link } from "react-router-dom";
import "../../styles/layout.css";

const Footer = () => {
  return (
    <footer className="footer">

      <div className="footer-main">

        {/* Marca */}
        <div className="footer-brand">

          <div className="footer-logo">
            <span className="logo-name">Platino</span>
            <span className="logo-subtitle">PERÚ</span>
          </div>

          <p>
            Joyas creadas para acompañar los momentos
            más importantes de tu historia.
          </p>

          <div className="footer-social">

            <a href="#" aria-label="Instagram">
              <i className="bi bi-instagram"></i>
            </a>

            <a href="#" aria-label="Facebook">
              <i className="bi bi-facebook"></i>
            </a>

            <a href="#" aria-label="TikTok">
              <i className="bi bi-tiktok"></i>
            </a>

          </div>

        </div>

        {/* Comprar */}
        <div className="footer-column">

          <h3>Comprar</h3>

          <Link to="/catalogo">
            Todas las joyas
          </Link>

          <Link to="/categoria/anillos">
            Anillos
          </Link>

          <Link to="/categoria/collares">
            Collares
          </Link>

          <Link to="/categoria/aretes">
            Aretes
          </Link>

          <Link to="/categoria/pulseras">
            Pulseras
          </Link>

        </div>

        {/* Información */}
        <div className="footer-column">

          <h3>Información</h3>

          <Link to="/nosotros">
            Nosotros
          </Link>

          <Link to="/colecciones">
            Colecciones
          </Link>

          <Link to="/contacto">
            Contacto
          </Link>

          <Link to="/preguntas-frecuentes">
            Preguntas frecuentes
          </Link>

          <Link to="/politicas">
            Políticas de compra
          </Link>

        </div>

        {/* Contacto */}
        <div className="footer-column footer-contact">

          <h3>Contáctanos</h3>

          <p>
            <i className="bi bi-whatsapp"></i>
            +51 999 999 999
          </p>

          <p>
            <i className="bi bi-envelope"></i>
            contacto@platinojoyas.com
          </p>

          <p>
            <i className="bi bi-clock"></i>
            Lun - Sáb: 10:00 - 19:00
          </p>

        </div>

      </div>

      {/* Newsletter */}
      <div className="footer-newsletter">

        <div>
          <span>ÚNETE A NUESTRA COMUNIDAD</span>

          <h2>
            Recibe novedades y nuevas colecciones
          </h2>
        </div>

        <form className="newsletter-form">

          <input
            type="email"
            placeholder="Tu correo electrónico"
          />

          <button type="submit">
            Suscribirme
            <i className="bi bi-arrow-right"></i>
          </button>

        </form>

      </div>

      {/* Bottom */}
      <div className="footer-bottom">

        <span>
          © 2026 Platino Perú. Todos los derechos reservados.
        </span>

        <div>
          <Link to="/terminos">
            Términos y condiciones
          </Link>

          <Link to="/privacidad">
            Política de privacidad
          </Link>
        </div>

      </div>

    </footer>
  );
};

export default Footer;