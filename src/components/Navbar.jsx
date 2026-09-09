import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/layout.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Barra superior verde */}
      <div className="top-bar">
        <div className="top-bar-content">
          <span>Envíos seguros a todo el país</span>
          <span>Compra segura</span>
          <span>Atención personalizada</span>
        </div>
      </div>

      {/* Navbar */}
      <header className="navbar">
        <div className="navbar-container">

          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="logo-name">Platino</span>
            <span className="logo-subtitle">PERÚ</span>
          </Link>

          {/* Botón móvil */}
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menú"
          >
            <i className="bi bi-list"></i>
          </button>

          {/* Navegación */}
          <nav className={`navbar-menu ${menuOpen ? "active" : ""}`}>

            <Link to="/" onClick={() => setMenuOpen(false)}>
              Inicio
            </Link>

            <div className="nav-dropdown">
              <Link to="/categoria/novios">
                Joyas
                <i className="bi bi-chevron-down"></i>
              </Link>

              <div className="dropdown-menu">

                <div className="dropdown-column">
                  <h4>Novios</h4>

                  <Link to="/categoria/anillos-compromiso">
                    Anillos de compromiso
                  </Link>

                  <Link to="/categoria/anillos-promesa">
                    Anillos de promesa
                  </Link>

                  <Link to="/categoria/alianzas">
                    Alianzas de amor
                  </Link>
                </div>

                <div className="dropdown-column">
                  <h4>Matrimonio</h4>

                  <Link to="/categoria/aros-matrimonio">
                    Aros de matrimonio
                  </Link>

                  <Link to="/categoria/plata">
                    Plata 950
                  </Link>

                  <Link to="/categoria/oro">
                    Oro 18K
                  </Link>
                </div>

                <div className="dropdown-column">
                  <h4>Accesorios</h4>

                  <Link to="/categoria/aretes">
                    Aretes
                  </Link>

                  <Link to="/categoria/collares">
                    Collares
                  </Link>

                  <Link to="/categoria/pulseras">
                    Pulseras
                  </Link>

                  <Link to="/categoria/cadenas">
                    Cadenas
                  </Link>
                </div>

                <div className="dropdown-column">
                  <h4>Piedras</h4>

                  <Link to="/categoria/esmeralda">
                    Esmeralda
                  </Link>

                  <Link to="/categoria/rubi">
                    Rubí
                  </Link>

                  <Link to="/categoria/zafiro">
                    Zafiro
                  </Link>

                  <Link to="/categoria/amatista">
                    Amatista
                  </Link>
                </div>

              </div>
            </div>

            <Link to="/colecciones" onClick={() => setMenuOpen(false)}>
              Colecciones
            </Link>

            <Link to="/nosotros" onClick={() => setMenuOpen(false)}>
              Nosotros
            </Link>

            <Link to="/contacto" onClick={() => setMenuOpen(false)}>
              Contacto
            </Link>

          </nav>

          {/* Acciones */}
          <div className="navbar-actions">

            <button className="nav-icon" aria-label="Buscar">
              <i className="bi bi-search"></i>
            </button>

            <Link
              to="/favoritos"
              className="nav-icon"
              aria-label="Favoritos"
            >
              <i className="bi bi-heart"></i>
            </Link>

            <Link
              to="/carrito"
              className="nav-icon cart-icon"
              aria-label="Carrito"
            >
              <i className="bi bi-bag"></i>
              <span className="cart-count">0</span>
            </Link>

          </div>

        </div>
      </header>
    </>
  );
};

export default Navbar;