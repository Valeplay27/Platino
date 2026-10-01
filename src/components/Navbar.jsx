import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getAnnouncementText } from "../services/homeImagesService";
import UserMenuDropdown from "./UserMenuDropdown";
import "../../styles/layout.css";

const Navbar = ({ cartCount = 0 }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [announcementText, setAnnouncementText] = useState(getAnnouncementText);
  const { user, openAuthModal } = useAuth();

  useEffect(() => {
    const handleUpdate = () => {
      setAnnouncementText(getAnnouncementText());
    };
    window.addEventListener("announcement_updated", handleUpdate);
    return () => window.removeEventListener("announcement_updated", handleUpdate);
  }, []);

  return (
    <>
      {/* 1. Top Announcement Bar (Línea Verde Superior) */}
      {announcementText && (
        <div className="announcement-bar">
          <div className="announcement-content">
            <span>{announcementText}</span>
          </div>
        </div>
      )}

      {/* 2. Main Header / Navigation */}
      <header className="platino-header">
        {/* Row 1: Contact/Sedes on Left, Logo Center, Actions Right */}
        <div className="header-top-row">
          <div className="header-contact-links">
            <a href="tel:011654435" className="top-phone">
              <i className="bi bi-telephone"></i> 011 654 435
            </a>
            <span className="divider-dot">•</span>
            <Link to="/sedes" className="top-utility-link">
              Sedes
            </Link>
            <span className="divider-dot">•</span>
            <Link to="/agendar-cita" className="top-utility-link">
              Agendar Cita
            </Link>
          </div>

          {/* Logo Center */}
          <Link to="/" className="brand-logo" aria-label="Platino Perú Inicio">
            <span className="brand-name">PLATINO</span>
            <span className="brand-gem">❖</span>
            <span className="brand-country">PERÚ</span>
          </Link>

          {/* User Actions & Currency Right */}
          <div className="header-actions">
            <button
              className="action-icon-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Buscar"
              title="Buscar"
            >
              <i className="bi bi-search"></i>
            </button>

            {user ? (
              <UserMenuDropdown />
            ) : (
              <button
                type="button"
                className="action-icon-btn"
                onClick={() => openAuthModal("login")}
                aria-label="Iniciar sesión o registrarse"
                title="Iniciar sesión"
              >
                <i className="bi bi-person"></i>
              </button>
            )}

            <Link
              to="/favoritos"
              className="action-icon-btn"
              aria-label="Lista de Deseos"
              title="Favoritos"
            >
              <i className="bi bi-heart"></i>
            </Link>

            <Link
              to="/carrito"
              className="action-icon-btn cart-btn"
              aria-label="Carrito de compras"
              title="Carrito"
            >
              <i className="bi bi-bag"></i>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            {/* Mobile hamburger button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menú principal"
            >
              <i className={menuOpen ? "bi bi-x-lg" : "bi bi-list"}></i>
            </button>
          </div>
        </div>

        {/* Collapsible search bar */}
        {searchOpen && (
          <div className="header-search-drawer">
            <div className="search-input-wrapper">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Buscar anillos de compromiso, aros de boda, diamantes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button
                className="close-search-btn"
                onClick={() => setSearchOpen(false)}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          </div>
        )}

        {/* Row 2: Centered Category Navigation Menu */}
        <nav className={`header-nav-menu ${menuOpen ? "open" : ""}`}>
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" onClick={() => setMenuOpen(false)}>
                INICIO
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/categoria/aros-boda" onClick={() => setMenuOpen(false)}>
                AROS DE BODA
              </Link>
            </li>
            <li className="nav-item has-dropdown">
              <Link
                to="/categoria/anillo-compromiso"
                onClick={() => setMenuOpen(false)}
              >
                ANILLO DE COMPROMISO
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/categoria/anillo-promesa"
                onClick={() => setMenuOpen(false)}
              >
                ANILLO DE PROMESA
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/categoria/aros-alianzas"
                onClick={() => setMenuOpen(false)}
              >
                AROS DE ALIANZAS
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/categoria/joyeria" onClick={() => setMenuOpen(false)}>
                JOYERÍA
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/categoria/regalos" onClick={() => setMenuOpen(false)}>
                REGALOS
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/nosotros" onClick={() => setMenuOpen(false)}>
                NOSOTROS
              </Link>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
};

export default Navbar;