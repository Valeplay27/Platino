import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function UserMenuDropdown() {
  const { user, isAdmin, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

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
            <p className="user-dropdown-name">{user.name}</p>
            <p className="user-dropdown-email">{user.email}</p>
            <span
              className={`user-role-badge ${
                isAdmin ? "admin" : "cliente"
              }`}
            >
              {isAdmin ? "Administrador Platino" : "Cliente Platino"}
            </span>
          </div>

          <ul className="user-dropdown-list">
            {isAdmin ? (
              <>
                <li>
                  <Link
                    to="/admin/citas"
                    className="user-dropdown-item admin-highlight"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <i className="bi bi-calendar2-check"></i>
                    <span>Citas & Horarios</span>
                  </Link>
                </li>
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
                <li>
                  <Link
                    to="/admin/pagos"
                    className="user-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                    style={{ background: "#f0fdf4", borderLeft: "3px solid #16a34a" }}
                  >
                    <i className="bi bi-wallet2" style={{ color: "#16a34a" }}></i>
                    <span>Control de Pagos & Pedidos</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/nosotros"
                    className="user-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <i className="bi bi-journal-richtext" style={{ color: "var(--platino-gold)" }}></i>
                    <span>Editar Historia (Nosotros)</span>
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/mis-pedidos"
                    className="user-dropdown-item"
                    style={{ fontWeight: 600, color: "var(--platino-green-dark)" }}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <i className="bi bi-box-seam" style={{ color: "var(--platino-gold)" }}></i>
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
