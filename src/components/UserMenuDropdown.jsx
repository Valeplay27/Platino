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
                    <i className="bi bi-speedometer2"></i>
                    <span>Dashboard de Administración</span>
                  </Link>
                </li>
              </>
            ) : (
              <>
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
