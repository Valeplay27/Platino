import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getAnnouncementText, getAnnouncementActive } from "../services/homeImagesService";
import { getFavoriteCount } from "../services/favoritesService";
import { getAssetUrl } from "../utils/assetHelper";
import UserMenuDropdown from "./UserMenuDropdown";
import "../../styles/layout.css";

const Navbar = ({ cartCount = 0, onOpenCart }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [announcementText, setAnnouncementText] = useState(getAnnouncementText);
  const [announcementActive, setAnnouncementActive] = useState(getAnnouncementActive);
  const { user, openAuthModal } = useAuth();
  const [favCount, setFavCount] = useState(() => (user ? getFavoriteCount(user.email) : 0));
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Estado dinámico del carrito (salto cuando hay joyas o al agregar)
  const [isCartJumping, setIsCartJumping] = useState(false);
  const prevCartCountRef = useRef(cartCount);

  useEffect(() => {
    if (cartCount > 0 && cartCount !== prevCartCountRef.current) {
      setIsCartJumping(true);
      const timer = setTimeout(() => setIsCartJumping(false), 950);
      prevCartCountRef.current = cartCount;
      return () => clearTimeout(timer);
    }
    prevCartCountRef.current = cartCount;
  }, [cartCount]);

  // Salto periódico elegante cada 7 segundos si la bolsa contiene joyas
  useEffect(() => {
    if (cartCount === 0) return;
    const interval = setInterval(() => {
      setIsCartJumping(true);
      setTimeout(() => setIsCartJumping(false), 950);
    }, 7000);
    return () => clearInterval(interval);
  }, [cartCount]);

  const handleNavClick = () => {
    if (menuOpen) {
      setMenuOpen(false);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setSearchOpen(false);
      navigate(`/categoria/todas?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    if (user?.email) {
      setFavCount(getFavoriteCount(user.email));
    } else {
      setFavCount(0);
    }
    const handleFavUpdate = () => {
      if (user?.email) setFavCount(getFavoriteCount(user.email));
    };
    window.addEventListener("platino_favorites_updated", handleFavUpdate);
    return () => window.removeEventListener("platino_favorites_updated", handleFavUpdate);
  }, [user?.email]);

  useEffect(() => {
    const handleUpdate = () => {
      setAnnouncementText(getAnnouncementText());
      setAnnouncementActive(getAnnouncementActive());
    };
    window.addEventListener("announcement_updated", handleUpdate);
    return () => window.removeEventListener("announcement_updated", handleUpdate);
  }, []);

  return (
    <>
      {/* 1. Top Announcement Bar (Línea Verde Superior) */}
      {announcementActive && announcementText && (
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
            <div className="header-utility-group">
              <Link to="/sedes" className="top-utility-link">
                <i className="bi bi-geo-alt me-1"></i> Sedes
              </Link>
              <span className="divider-dot">•</span>
              <Link to="/agendar-cita" className="top-utility-link">
                <i className="bi bi-calendar2-check me-1"></i> Agendar Cita
              </Link>
            </div>
          </div>

          {/* Logo Center */}
          <Link to="/" className="brand-logo" aria-label="Platino Perú Inicio">
            <img
              src={getAssetUrl("/images/platino-logo-gold.jpg")}
              alt="Platino Perú Insignia"
              className="brand-logo-img"
            />
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
              className="action-icon-btn cart-btn"
              aria-label="Lista de Deseos"
              title={user ? `Favoritos (${favCount})` : "Favoritos (Inicia sesión)"}
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  openAuthModal("login");
                }
              }}
            >
              <i className="bi bi-heart"></i>
              {favCount > 0 && (
                <span className="cart-badge" style={{ background: "#e11d48", color: "#ffffff" }}>
                  {favCount}
                </span>
              )}
            </Link>

            <Link
              to="/carrito"
              className={`action-icon-btn cart-btn ${cartCount > 0 ? "has-items" : ""} ${isCartJumping ? "cart-jumping" : ""}`}
              aria-label={`Bolsa de compras Platino (${cartCount} ${cartCount === 1 ? "joya" : "joyas"})`}
              title={cartCount > 0 ? `Bolsa de compras Platino: ${cartCount} joya${cartCount > 1 ? "s" : ""}` : "Bolsa de compras vacía"}
              onClick={(e) => {
                if (onOpenCart) {
                  e.preventDefault();
                  onOpenCart();
                }
              }}
            >
              {cartCount > 0 ? (
                <div className="dynamic-cart-bag-wrapper">
                  <div className="platino-brand-bag">
                    <div className="bag-handles"></div>
                    <div className="bag-body">
                      <img
                        src={getAssetUrl("/images/platino-logo-gold.jpg")}
                        alt="Logo Platino Perú"
                        className="bag-center-logo"
                      />
                    </div>
                  </div>
                  <span className="cart-badge cart-badge-pulse">{cartCount}</span>
                </div>
              ) : (
                <i className="bi bi-bag"></i>
              )}
            </Link>

            {/* Mobile hamburger button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú principal"}
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
                onKeyDown={handleSearchSubmit}
                autoFocus
              />
              <button
                className="close-search-btn"
                onClick={() => setSearchOpen(false)}
                aria-label="Cerrar búsqueda"
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          </div>
        )}

        {/* Mobile Backdrop Overlay */}
        {menuOpen && (
          <div
            className="mobile-nav-backdrop"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Row 2: Centered Category Navigation Menu */}
        <nav className={`header-nav-menu ${menuOpen ? "open" : ""}`} aria-label="Navegación principal por categorías">
          <div className="mobile-nav-inner">
            <ul className="nav-list">
              <li className={`nav-item ${currentPath === "/" ? "active" : ""}`}>
                <Link to="/" onClick={handleNavClick}>
                  <span>INICIO</span>
                  <i className="bi bi-chevron-right mobile-nav-arrow"></i>
                </Link>
              </li>
              <li className={`nav-item ${currentPath.includes("aros-boda") ? "active" : ""}`}>
                <Link to="/categoria/aros-boda" onClick={handleNavClick}>
                  <span>AROS DE BODA</span>
                  <i className="bi bi-chevron-right mobile-nav-arrow"></i>
                </Link>
              </li>
              <li className={`nav-item ${currentPath.includes("anillo-compromiso") ? "active" : ""}`}>
                <Link
                  to="/categoria/anillo-compromiso"
                  onClick={handleNavClick}
                >
                  <span>ANILLO DE COMPROMISO</span>
                  <i className="bi bi-chevron-right mobile-nav-arrow"></i>
                </Link>
              </li>
              <li className={`nav-item ${currentPath.includes("anillo-promesa") ? "active" : ""}`}>
                <Link
                  to="/categoria/anillo-promesa"
                  onClick={handleNavClick}
                >
                  <span>ANILLO DE PROMESA</span>
                  <i className="bi bi-chevron-right mobile-nav-arrow"></i>
                </Link>
              </li>
              <li className={`nav-item ${currentPath.includes("aros-alianzas") ? "active" : ""}`}>
                <Link
                  to="/categoria/aros-alianzas"
                  onClick={handleNavClick}
                >
                  <span>AROS DE ALIANZAS</span>
                  <i className="bi bi-chevron-right mobile-nav-arrow"></i>
                </Link>
              </li>
              <li className={`nav-item ${currentPath.includes("joyeria") ? "active" : ""}`}>
                <Link to="/categoria/joyeria" onClick={handleNavClick}>
                  <span>JOYERÍA</span>
                  <i className="bi bi-chevron-right mobile-nav-arrow"></i>
                </Link>
              </li>
              <li className={`nav-item ${currentPath.includes("regalos") ? "active" : ""}`}>
                <Link to="/categoria/regalos" onClick={handleNavClick}>
                  <span>REGALOS</span>
                  <i className="bi bi-chevron-right mobile-nav-arrow"></i>
                </Link>
              </li>
              <li className={`nav-item ${currentPath.startsWith("/nosotros") ? "active" : ""}`}>
                <Link to="/nosotros" onClick={handleNavClick}>
                  <span>NOSOTROS</span>
                  <i className="bi bi-chevron-right mobile-nav-arrow"></i>
                </Link>
              </li>
            </ul>

            {/* Mobile Extras: Sedes, Citas & WhatsApp */}
            <div className="mobile-nav-extras">
              <div className="mobile-nav-section-title">
                <i className="bi bi-geo-alt-fill"></i> NUESTRAS SEDES & ASESORÍA
              </div>
              <div className="mobile-sedes-links">
                <div className="mobile-sede-row">
                  <span className="mobile-sede-name">Lima Centro:</span>
                  <a
                    href="https://wa.me/51927357217"
                    target="_blank"
                    rel="noreferrer"
                    className="mobile-wa-btn"
                    title="WhatsApp Lima Centro"
                  >
                    <i className="bi bi-whatsapp"></i> 927 357 217
                  </a>
                </div>
                <div className="mobile-sede-row">
                  <span className="mobile-sede-name">Miraflores:</span>
                  <a
                    href="https://wa.me/51984281116"
                    target="_blank"
                    rel="noreferrer"
                    className="mobile-wa-btn"
                    title="WhatsApp Miraflores"
                  >
                    <i className="bi bi-whatsapp"></i> 984 281 116
                  </a>
                </div>
              </div>

              <div className="mobile-nav-action-buttons">
                <Link
                  to="/sedes"
                  className="mobile-btn-sub"
                  onClick={handleNavClick}
                >
                  <i className="bi bi-shop"></i> Ver Sedes
                </Link>
                <Link
                  to="/agendar-cita"
                  className="mobile-btn-main"
                  onClick={handleNavClick}
                >
                  <i className="bi bi-calendar2-check"></i> Agendar Cita
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Navbar;