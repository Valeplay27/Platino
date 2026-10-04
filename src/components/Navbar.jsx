import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
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
  const currentPath = location.pathname;

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
            <img
              src={getAssetUrl("/images/platino-logo-gold.jpg")}
              alt="Platino Perú Insignia"
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "7px",
                objectFit: "cover",
                boxShadow: "0 2px 8px rgba(197, 160, 89, 0.3)",
              }}
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
        <nav className={`header-nav-menu ${menuOpen ? "open" : ""}`} aria-label="Navegación principal por categorías">
          <ul className="nav-list">
            <li className={`nav-item ${currentPath === "/" ? "active" : ""}`}>
              <Link to="/" onClick={handleNavClick}>
                INICIO
              </Link>
            </li>
            <li className={`nav-item ${currentPath.includes("aros-boda") ? "active" : ""}`}>
              <Link to="/categoria/aros-boda" onClick={handleNavClick}>
                AROS DE BODA
              </Link>
            </li>
            <li className={`nav-item ${currentPath.includes("anillo-compromiso") ? "active" : ""}`}>
              <Link
                to="/categoria/anillo-compromiso"
                onClick={handleNavClick}
              >
                ANILLO DE COMPROMISO
              </Link>
            </li>
            <li className={`nav-item ${currentPath.includes("anillo-promesa") ? "active" : ""}`}>
              <Link
                to="/categoria/anillo-promesa"
                onClick={handleNavClick}
              >
                ANILLO DE PROMESA
              </Link>
            </li>
            <li className={`nav-item ${currentPath.includes("aros-alianzas") ? "active" : ""}`}>
              <Link
                to="/categoria/aros-alianzas"
                onClick={handleNavClick}
              >
                AROS DE ALIANZAS
              </Link>
            </li>
            <li className={`nav-item ${currentPath.includes("joyeria") ? "active" : ""}`}>
              <Link to="/categoria/joyeria" onClick={handleNavClick}>
                JOYERÍA
              </Link>
            </li>
            <li className={`nav-item ${currentPath.includes("regalos") ? "active" : ""}`}>
              <Link to="/categoria/regalos" onClick={handleNavClick}>
                REGALOS
              </Link>
            </li>
            <li className={`nav-item ${currentPath.startsWith("/nosotros") ? "active" : ""}`}>
              <Link to="/nosotros" onClick={handleNavClick}>
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