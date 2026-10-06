import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { hasPermission, isMasterAdmin } from "../services/permissionsService";

export default function UserMenuDropdown() {
  const { user, isAdmin, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [permVersion, setPermVersion] = useState(0);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Escuchar cambios de permisos en tiempo real (cuando Vladimir aprueba o modifica)
  useEffect(() => {
    const handlePermChange = () => {
      setPermVersion((v) => v + 1);
    };
    window.addEventListener("platino_permissions_updated", handlePermChange);
    return () => {
      window.removeEventListener("platino_permissions_updated", handlePermChange);
    };
  }, []);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) return null;

  // Obtener iniciales
  const getInitials = (name) => {
    if (!name) return "P";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  // Permisos dinámicos según autorización otorgada por Vladimir
  const isMaster = isMasterAdmin(user);
  const canSeeCitas = isMaster || hasPermission(user, "citas");
  const canSeeCatalogo = isMaster || hasPermission(user, "catalogo");
  const canSeeInventario = isMaster || hasPermission(user, "inventario");
  const canSeePedidos = isMaster || hasPermission(user, "pedidos") || hasPermission(user, "pedidos_global");
  const canSeeImagenes = isMaster || hasPermission(user, "home_images");
  const canSeePagos = isMaster || hasPermission(user, "finanzas");
  const canSeeNosotros = isMaster || hasPermission(user, "nosotros");

  return (
    <div className="user-menu-container" ref={containerRef}>
      <button
        type="button"
        className="user-avatar-btn"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-label="Menú de usuario"
        title={user.name}
      >
        <div className="user-avatar-circle">{getInitials(user.name)}</div>
        <i
          className="bi bi-chevron-down"
          style={{ fontSize: "10px", color: "#666" }}
        ></i>
      </button>

      {dropdownOpen && (
        <div className="user-dropdown-menu">
          <div className="user-dropdown-header">
            <p className="user-dropdown-name">
              {user.avatarBadge ? `${user.avatarBadge} ` : ""}{user.name}
            </p>
            <p className="user-dropdown-email">{user.email}</p>
            <span
              className={`user-role-badge ${
                isAdmin ? "admin" : "cliente"
              }`}
            >
              {user.title || (isAdmin ? "Administrador Platino" : "Cliente Platino")}
            </span>
            {user.sedeLabel && (
              <span style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px", display: "block" }}>
                <i className="bi bi-geo-alt-fill" style={{ color: "#b8860b" }}></i> {user.sedeLabel}
              </span>
            )}
          </div>

          <ul className="user-dropdown-list">
            {isAdmin ? (
              <>
                {/* 1. OPERACIONES & TALLER */}
                {(canSeePagos || canSeePedidos || canSeeCitas) && (
                  <>
                    <li className="user-dropdown-section-title">
                      Operaciones & Taller
                    </li>
                    {canSeePagos && (
                      <li>
                        <Link
                          to="/admin/pagos"
                          className="user-dropdown-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="bi bi-wallet2"></i>
                          <span>Control de Pagos & Pedidos</span>
                        </Link>
                      </li>
                    )}
                    {canSeePedidos && (
                      <li>
                        <Link
                          to="/admin/pedidos"
                          className="user-dropdown-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="bi bi-box-seam"></i>
                          <span>Pedidos en Taller</span>
                        </Link>
                      </li>
                    )}
                    {canSeeCitas && (
                      <li>
                        <Link
                          to="/admin/citas"
                          className="user-dropdown-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="bi bi-calendar2-check"></i>
                          <span>Citas & Horarios</span>
                        </Link>
                      </li>
                    )}
                  </>
                )}

                {/* 2. CATÁLOGO & INVENTARIO */}
                {(canSeeCatalogo || canSeeInventario) && (
                  <>
                    <li className="user-dropdown-divider"></li>
                    <li className="user-dropdown-section-title">
                      Catálogo & Stock
                    </li>
                    {canSeeCatalogo && (
                      <li>
                        <Link
                          to="/admin/catalogo"
                          className="user-dropdown-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="bi bi-gem"></i>
                          <span>Crear Portafolio / Catálogo</span>
                        </Link>
                      </li>
                    )}
                    {canSeeInventario && (
                      <li>
                        <Link
                          to="/admin/inventario"
                          className="user-dropdown-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="bi bi-boxes"></i>
                          <span>Inventario & Stock</span>
                        </Link>
                      </li>
                    )}
                    {canSeeCatalogo && (
                      <li>
                        <Link
                          to="/admin/gemas"
                          className="user-dropdown-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="bi bi-gem"></i>
                          <span>Gemas & Diamantes Certificados</span>
                        </Link>
                      </li>
                    )}
                  </>
                )}

                {/* 3. TIENDA & CONTENIDO WEB */}
                {(canSeeImagenes || canSeeNosotros) && (
                  <>
                    <li className="user-dropdown-divider"></li>
                    <li className="user-dropdown-section-title">
                      Tienda & Contenido Web
                    </li>
                    {canSeeImagenes && (
                      <li>
                        <Link
                          to="/admin/imagenes"
                          className="user-dropdown-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="bi bi-images"></i>
                          <span>Imágenes del Inicio</span>
                        </Link>
                      </li>
                    )}
                    {canSeeNosotros && (
                      <li>
                        <Link
                          to="/nosotros"
                          className="user-dropdown-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="bi bi-journal-richtext"></i>
                          <span>Editar Historia (Nosotros)</span>
                        </Link>
                      </li>
                    )}
                  </>
                )}

                {/* 4. ADMINISTRACIÓN CENTRAL */}
                {isMaster && (
                  <>
                    <li className="user-dropdown-divider"></li>
                    <li className="user-dropdown-section-title master-title">
                      <i className="bi bi-shield-check" style={{ width: "auto", fontSize: "11px", color: "var(--platino-gold)" }}></i>
                      <span>Administración Central</span>
                    </li>
                    <li>
                      <Link
                        to="/admin?tab=permisos"
                        className="user-dropdown-item master-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <i className="bi bi-shield-shaded"></i>
                        <span>Gestión de Permisos & Sedes</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin?tab=reclamaciones"
                        className="user-dropdown-item master-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <i className="bi bi-book-half"></i>
                        <span>Libro de Reclamaciones</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin?tab=platino_care"
                        className="user-dropdown-item master-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <i className="bi bi-shield-fill-check"></i>
                        <span>Platino Care & Garantías</span>
                      </Link>
                    </li>
                  </>
                )}
              </>
            ) : (
              <>
                <li className="user-dropdown-section-title">
                  Mi Cuenta Platino
                </li>
                <li>
                  <Link
                    to="/mis-pedidos"
                    className="user-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <i className="bi bi-box-seam"></i>
                    <span>Mis Pedidos y Seguimiento</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/favoritos"
                    className="user-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <i className="bi bi-heart-fill" style={{ color: "#e11d48" }}></i>
                    <span>Mis Joyas Favoritas</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/agendar-cita"
                    className="user-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <i className="bi bi-calendar2-heart"></i>
                    <span>Agendar o Consultar Cita</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/catalogo"
                    className="user-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <i className="bi bi-gem"></i>
                    <span>Explorar Colección</span>
                  </Link>
                </li>
              </>
            )}

            <li className="user-dropdown-divider"></li>

            <li>
              <button
                type="button"
                className="user-dropdown-item logout"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right"></i>
                <span>Cerrar sesión</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
