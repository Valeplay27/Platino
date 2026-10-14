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
  const [compromisoMenuOpen, setCompromisoMenuOpen] = useState(false);
  const compromisoNavRef = useRef(null);
  const [announcementText, setAnnouncementText] = useState(getAnnouncementText);
  const [announcementActive, setAnnouncementActive] = useState(getAnnouncementActive);
  const { user, openAuthModal } = useAuth();
  const [favCount, setFavCount] = useState(() => (user ? getFavoriteCount(user.email) : 0));
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Cerrar menú y megamenú al cambiar de ruta
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setCompromisoMenuOpen(false);
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
    setCompromisoMenuOpen(false);
    if (menuOpen) {
      setMenuOpen(false);
    }
  };

  // Cerrar megamenú al hacer clic afuera en la ventana
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (compromisoNavRef.current && !compromisoNavRef.current.contains(e.target)) {
        setCompromisoMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
              <li
                ref={compromisoNavRef}
                className={`nav-item has-megamenu ${currentPath.includes("anillo-compromiso") ? "active" : ""} ${compromisoMenuOpen ? "megamenu-open" : ""}`}
                onMouseEnter={() => setCompromisoMenuOpen(true)}
                onMouseLeave={() => setCompromisoMenuOpen(false)}
              >
                <Link
                  to="/categoria/anillo-compromiso"
                  onClick={(e) => {
                    handleNavClick();
                  }}
                  className="nav-link-with-indicator"
                >
                  <span>ANILLO DE COMPROMISO</span>
                  <i className="bi bi-chevron-down nav-desktop-chevron"></i>
                  <i className="bi bi-chevron-right mobile-nav-arrow"></i>
                </Link>

                {/* MEGAMENÚ DESPLEGABLE EN DESKTOP */}
                <div
                  className={`compromiso-megamenu ${compromisoMenuOpen ? "is-visible" : ""}`}
                  onMouseEnter={() => setCompromisoMenuOpen(true)}
                  onMouseLeave={() => setCompromisoMenuOpen(false)}
                >
                  <div className="megamenu-inner-container">
                    {/* Columna 1: FORMA DE LA GEMA */}
                    <div className="megamenu-col megamenu-col-shapes">
                      <h4 className="megamenu-col-title">FORMA DE LA GEMA</h4>
                      <ul className="megamenu-links-list gem-shapes-list">
                        <li>
                          <Link to="/categoria/anillo-compromiso?forma=redondo" onClick={handleNavClick}>
                            <img src={getAssetUrl("/images/gem-shapes/redondo.webp")} alt="Redondo" className="gem-shape-icon-img" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            <span>REDONDO</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/categoria/anillo-compromiso?forma=oval" onClick={handleNavClick}>
                            <img src={getAssetUrl("/images/gem-shapes/oval.webp")} alt="Oval" className="gem-shape-icon-img" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            <span>OVAL</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/categoria/anillo-compromiso?forma=marquesa" onClick={handleNavClick}>
                            <img src={getAssetUrl("/images/gem-shapes/marquesa.webp")} alt="Marquesa" className="gem-shape-icon-img" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            <span>MARQUESA</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/categoria/anillo-compromiso?forma=esmeralda" onClick={handleNavClick}>
                            <img src={getAssetUrl("/images/gem-shapes/esmeralda.webp")} alt="Esmeralda" className="gem-shape-icon-img" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            <span>ESMERALDA</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/categoria/anillo-compromiso?forma=corazon" onClick={handleNavClick}>
                            <i className="bi bi-suit-heart gem-shape-vector-icon"></i>
                            <span>CORAZÓN</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/categoria/anillo-compromiso?forma=otros" onClick={handleNavClick}>
                            <img src={getAssetUrl("/images/gem-shapes/princesa.webp")} alt="Otros" className="gem-shape-icon-img" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            <span>OTROS</span>
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Columna 2: SEGÚN ESTILO */}
                    <div className="megamenu-col">
                      <h4 className="megamenu-col-title">SEGÚN ESTILO</h4>
                      <ul className="megamenu-links-list">
                        <li>
                          <Link to="/categoria/anillo-compromiso?estilo=solitario" onClick={handleNavClick}>
                            SOLITARIO
                          </Link>
                        </li>
                        <li>
                          <Link to="/categoria/anillo-compromiso?estilo=3-piedras" onClick={handleNavClick}>
                            3 PIEDRAS
                          </Link>
                        </li>
                        <li>
                          <Link to="/categoria/anillo-compromiso?estilo=con-pave" onClick={handleNavClick}>
                            CON PAVÉ
                          </Link>
                        </li>
                        <li>
                          <Link to="/categoria/anillo-compromiso?estilo=moderno" onClick={handleNavClick}>
                            MODERNO
                          </Link>
                        </li>
                        <li>
                          <Link to="/categoria/anillo-compromiso?estilo=vintage" onClick={handleNavClick}>
                            VINTAGE
                          </Link>
                        </li>
                        <li>
                          <Link to="/categoria/anillo-compromiso" onClick={handleNavClick} className="megamenu-ver-todos">
                            VER TODOS
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Columna 3: SEGÚN MATERIAL */}
                    <div className="megamenu-col">
                      <h4 className="megamenu-col-title">SEGÚN MATERIAL</h4>
                      <ul className="megamenu-links-list">
                        <li>
                          <Link to="/categoria/anillo-compromiso?metal=plata-950" onClick={handleNavClick}>
                            PLATA 950
                          </Link>
                        </li>
                        <li>
                          <Link to="/categoria/anillo-compromiso?metal=plata-oro-18k" onClick={handleNavClick}>
                            PLATA CON ORO 18K
                          </Link>
                        </li>
                        <li>
                          <Link to="/categoria/anillo-compromiso?metal=oro-natural-18k" onClick={handleNavClick}>
                            ORO NATURAL 18K
                          </Link>
                        </li>
                        <li>
                          <Link to="/categoria/anillo-compromiso?metal=oro-amarillo-18k" onClick={handleNavClick}>
                            ORO AMARILLO 18K
                          </Link>
                        </li>
                        <li>
                          <Link to="/categoria/anillo-compromiso?metal=oro-rosado-18k" onClick={handleNavClick}>
                            ORO ROSADO 18K
                          </Link>
                        </li>
                        <li>
                          <Link to="/categoria/anillo-compromiso?metal=oro-blanco-18k" onClick={handleNavClick}>
                            ORO BLANCO 18K
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Columna 4: COLECCIÓN GEMAS SELECTAS */}
                    <div className="megamenu-col megamenu-col-gemas">
                      <h4 className="megamenu-col-title text-center">COLECCIÓN GEMAS SELECTAS</h4>
                      <div className="gemas-selectas-grid">
                        <Link to="/categoria/anillo-compromiso?gema=diamante" className="gema-selecta-item" onClick={handleNavClick}>
                          <div className="gema-selecta-img-box">
                            <img src={getAssetUrl("/images/cat-compromiso.jpg")} alt="Diamante Solitario" />
                            <div className="gema-selecta-overlay">
                              <span className="gema-name-label">DIAMANTE</span>
                            </div>
                          </div>
                        </Link>
                        <Link to="/categoria/anillo-compromiso?gema=esmeralda" className="gema-selecta-item" onClick={handleNavClick}>
                          <div className="gema-selecta-img-box">
                            <img src={getAssetUrl("/images/mosaic-3.jpg")} alt="Esmeralda Colombiana" onError={(e) => { e.currentTarget.src = "/images/cat-compromiso.jpg"; }} />
                            <div className="gema-selecta-overlay">
                              <span className="gema-name-label">ESMERALDA</span>
                            </div>
                          </div>
                        </Link>
                        <Link to="/categoria/anillo-compromiso?gema=rubi" className="gema-selecta-item" onClick={handleNavClick}>
                          <div className="gema-selecta-img-box">
                            <img src={getAssetUrl("/images/mosaic-5.jpg")} alt="Rubí Real" onError={(e) => { e.currentTarget.src = "/images/cat-compromiso.jpg"; }} />
                            <div className="gema-selecta-overlay">
                              <span className="gema-name-label">RUBÍ</span>
                            </div>
                          </div>
                        </Link>
                        <Link to="/categoria/anillo-compromiso?gema=zafiro" className="gema-selecta-item" onClick={handleNavClick}>
                          <div className="gema-selecta-img-box">
                            <img src={getAssetUrl("/images/collar-cristal-blue.jpg")} alt="Zafiro Azul" onError={(e) => { e.currentTarget.src = "/images/cat-compromiso.jpg"; }} />
                            <div className="gema-selecta-overlay">
                              <span className="gema-name-label">ZAFIRO</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                      <Link to="/catalogo-gemas" className="megamenu-gemas-footer-link" onClick={handleNavClick}>
                        DIAMANTE NATURAL Y LAB GROWN
                      </Link>
                    </div>

                    {/* Columna 5: BLOG (Fondo Suave Gris/Blanco) */}
                    <div className="megamenu-col megamenu-col-blog">
                      <h4 className="megamenu-col-title">BLOG</h4>
                      <ul className="megamenu-links-list megamenu-blog-list">
                        <li>
                          <Link to="/categoria/todas?q=diamante" onClick={handleNavClick}>
                            DIAMANTE NATURAL VS LAB GROWN
                          </Link>
                        </li>
                        <li>
                          <Link to="/categoria/todas?q=moissanita" onClick={handleNavClick}>
                            ¿QUÉ ES LA MOISSANITA?
                          </Link>
                        </li>
                        <li>
                          <Link to="/nosotros" onClick={handleNavClick}>
                            CORRECTO CUIDADO DE GEMAS
                          </Link>
                        </li>
                        <li>
                          <Link to="/categoria/anillo-compromiso" onClick={handleNavClick}>
                            TENDENCIAS EN A. COMPROMISO
                          </Link>
                        </li>
                        <li>
                          <Link to="/agendar-cita" onClick={handleNavClick}>
                            ¿CÓMO TOMARME LA MEDIDA?
                          </Link>
                        </li>
                        <li>
                          <Link to="/nosotros" onClick={handleNavClick} className="megamenu-ver-mas-blog">
                            VER MÁS
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </li>
              <li className={`nav-item ${currentPath.includes("amor-promesa") || currentPath.includes("anillo-promesa") || currentPath.includes("aros-alianzas") ? "active" : ""}`}>
                <Link
                  to="/categoria/amor-promesa"
                  onClick={handleNavClick}
                >
                  <span>AMOR Y PROMESA</span>
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