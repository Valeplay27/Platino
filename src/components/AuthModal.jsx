import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { getAdminAccounts } from "../services/permissionsService";
import "../../styles/auth.css";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    modalInitialView,
    setModalInitialView,
    closeAuthModal,
    login,
    register,
  } = useAuth();

  const view = modalInitialView || "login";
  const setView = (v) => {
    setErrorMessage("");
    setSuccessMessage("");
    setModalInitialView(v);
  };

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Campos Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Campos Register
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regIsAdmin, setRegIsAdmin] = useState(false);

  // Campos Forgot
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // Mensajes de error / éxito
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isAuthModalOpen) return null;

  // Rellenar credenciales demo para pruebas rápidas
  const fillDemoCredentials = (role) => {
    setErrorMessage("");
    const adminList = getAdminAccounts();
    const getPwd = (email, fallback) => {
      const found = adminList.find((a) => a.email.toLowerCase() === email.toLowerCase());
      return found?.password || fallback;
    };

    if (role === "admin" || role === "vladimir") {
      setLoginEmail("vladimiryt18@gmail.com");
      setLoginPassword(getPwd("vladimiryt18@gmail.com", "Pumita30****"));
    } else if (role === "admin_lima" || role === "lima") {
      setLoginEmail("admin.lima@platino.pe");
      setLoginPassword(getPwd("admin.lima@platino.pe", "LimaPlatino2026*"));
    } else if (role === "admin_miraflores" || role === "miraflores") {
      setLoginEmail("admin.miraflores@platino.pe");
      setLoginPassword(getPwd("admin.miraflores@platino.pe", "Miraflores2026*"));
    } else {
      setLoginEmail("cliente@platino.pe");
      setLoginPassword("platino2026");
    }
  };

  // Manejar Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMessage("Por favor, completa tu correo y contraseña.");
      return;
    }

    const result = login(loginEmail, loginPassword);
    if (!result.success) {
      setErrorMessage(result.error);
    }
  };

  // Manejar Registro
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMessage("Por favor, completa todos los campos requeridos.");
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const result = register({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      role: regIsAdmin ? "admin" : "cliente",
    });

    if (!result.success) {
      setErrorMessage(result.error);
    }
  };

  // Manejar Recuperación de contraseña
  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrorMessage("Ingresa el correo electrónico asociado a tu cuenta.");
      return;
    }
    setErrorMessage("");
    setForgotSent(true);
    setTimeout(() => {
      setSuccessMessage(
        "Se ha enviado un correo con instrucciones para restablecer tu contraseña."
      );
    }, 400);
  };

  return (
    <div
      className="auth-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div className="auth-modal-card" role="dialog" aria-modal="true">
        {/* Botón cerrar X */}
        <button
          className="auth-modal-close"
          onClick={closeAuthModal}
          aria-label="Cerrar modal"
        >
          <i className="bi bi-x-lg"></i>
        </button>

        {/* Logo superior oficial Platino Perú */}
        <div className="auth-brand-badge">
          <div className="auth-brand-inner">
            <span>PLATINO</span>
            <span className="auth-brand-gem">✦</span>
            <span>PERÚ</span>
          </div>
          <span className="auth-tagline">JOYERÍA QUE CUENTA TU HISTORIA</span>
        </div>

        {/* ==============================================================
            VISTA 1: INICIO DE SESIÓN (IDÉNTICO A LA CAPTURA)
            ============================================================== */}
        {view === "login" && (
          <div>
            <h2 className="auth-title">Inicia sesión</h2>
            <p className="auth-subtitle">
              Accede a tu cuenta para disfrutar de una experiencia personalizada.
            </p>

            {/* Selector de credenciales de prueba para el evaluador */}
            <div className="auth-demo-banner">
              <strong style={{ display: "block", marginBottom: "6px" }}>
                Acceso rápido de prueba (3 Administradores + Cliente):
              </strong>
              <div className="demo-buttons-row" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials("vladimir")}
                  className="btn-demo-fill"
                  title="Super Admin Principal - Control Total y Aprobación de Permisos"
                  style={{ fontWeight: "700", border: "1px solid #b8860b" }}
                >
                  <i className="bi bi-shield-shaded" style={{ color: "#b8860b" }}></i> 👑 Vladimir (Principal)
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials("lima")}
                  className="btn-demo-fill"
                  title="Administrador Sede Lima Centro - Requiere permisos para Finanzas y Catálogo"
                >
                  <i className="bi bi-geo-alt"></i> 🏛️ Admin Lima Centro
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials("miraflores")}
                  className="btn-demo-fill"
                  title="Administrador Sede Miraflores - Requiere permisos para Finanzas y Catálogo"
                >
                  <i className="bi bi-geo-alt"></i> 🌊 Admin Miraflores
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials("cliente")}
                  className="btn-demo-fill"
                >
                  <i className="bi bi-person"></i> 👤 Cliente Demo
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="auth-error-banner">
                <i className="bi bi-exclamation-circle"></i> {errorMessage}
              </div>
            )}

            <form onSubmit={handleLoginSubmit}>
              {/* Campo Correo */}
              <div className="auth-field-group">
                <label className="auth-field-label">Correo electrónico</label>
                <div className="auth-input-wrapper">
                  <i className="bi bi-envelope auth-input-icon"></i>
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="tu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="auth-field-group">
                <label className="auth-field-label">Contraseña</label>
                <div className="auth-input-wrapper">
                  <i className="bi bi-lock auth-input-icon"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="auth-input"
                    placeholder="Ingresa tu contraseña"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-toggle-pwd"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Ver u ocultar contraseña"
                  >
                    <i
                      className={
                        showPassword ? "bi bi-eye-slash" : "bi bi-eye"
                      }
                    ></i>
                  </button>
                </div>
              </div>

              {/* Recordarme y Olvidaste tu contraseña */}
              <div className="auth-options-row">
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Recordarme
                </label>

                <button
                  type="button"
                  className="auth-link-forgot"
                  onClick={() => {
                    setErrorMessage("");
                    setView("forgot");
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Botón Principal: Iniciar sesión */}
              <button type="submit" className="auth-btn-primary">
                Iniciar sesión <i className="bi bi-arrow-right"></i>
              </button>
            </form>

            {/* Separador con rombo */}
            <div className="auth-divider">
              <span className="auth-divider-line"></span>
              <span className="auth-divider-dot">⋄</span>
              <span className="auth-divider-line"></span>
            </div>

            {/* Botón Secundario: Crear una cuenta */}
            <button
              type="button"
              className="auth-btn-secondary"
              onClick={() => {
                setErrorMessage("");
                setView("register");
              }}
            >
              <i className="bi bi-person"></i> Crear una cuenta
            </button>

            {/* Pie de ayuda */}
            <div className="auth-footer-help">
              ¿Necesitas ayuda?{" "}
              <a
                href="https://wa.me/51912345678?text=Hola%20Platino%20Perú,%20necesito%20ayuda%20con%20mi%20cuenta"
                target="_blank"
                rel="noreferrer"
                className="auth-footer-link"
              >
                Contáctanos
              </a>
            </div>
          </div>
        )}

        {/* ==============================================================
            VISTA 2: CREAR UNA CUENTA
            ============================================================== */}
        {view === "register" && (
          <div>
            <h2 className="auth-title">Crear una cuenta</h2>
            <p className="auth-subtitle">
              Únete a Platino Perú para acceder a cotizaciones exclusivas y
              gestionar tus citas.
            </p>

            {errorMessage && (
              <div className="auth-error-banner">
                <i className="bi bi-exclamation-circle"></i> {errorMessage}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit}>
              <div className="auth-field-group">
                <label className="auth-field-label">Nombre completo</label>
                <div className="auth-input-wrapper">
                  <i className="bi bi-person auth-input-icon"></i>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Ej. Jorge Ramírez"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <label className="auth-field-label">Correo electrónico</label>
                <div className="auth-input-wrapper">
                  <i className="bi bi-envelope auth-input-icon"></i>
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="tu@email.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <label className="auth-field-label">
                  Teléfono / WhatsApp (Opcional)
                </label>
                <div className="auth-input-wrapper">
                  <i className="bi bi-whatsapp auth-input-icon"></i>
                  <input
                    type="tel"
                    className="auth-input"
                    placeholder="+51 987 654 321"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <label className="auth-field-label">Contraseña</label>
                <div className="auth-input-wrapper">
                  <i className="bi bi-lock auth-input-icon"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="auth-input"
                    placeholder="Mínimo 6 caracteres"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-toggle-pwd"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={
                        showPassword ? "bi bi-eye-slash" : "bi bi-eye"
                      }
                    ></i>
                  </button>
                </div>
              </div>

              {/* Casilla opcional para registrar como Administrador */}
              <div
                className="auth-options-row"
                style={{ justifyContent: "flex-start" }}
              >
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={regIsAdmin}
                    onChange={(e) => setRegIsAdmin(e.target.checked)}
                  />
                  <span>
                    Registrar con rol de <strong>Administrador de Citas</strong>
                  </span>
                </label>
              </div>

              <button type="submit" className="auth-btn-primary">
                Crear cuenta <i className="bi bi-arrow-right"></i>
              </button>
            </form>

            <div className="auth-divider">
              <span className="auth-divider-line"></span>
              <span className="auth-divider-dot">⋄</span>
              <span className="auth-divider-line"></span>
            </div>

            <button
              type="button"
              className="auth-btn-secondary"
              onClick={() => {
                setErrorMessage("");
                setView("login");
              }}
            >
              <i className="bi bi-arrow-left"></i> ¿Ya tienes cuenta? Iniciar
              sesión
            </button>
          </div>
        )}

        {/* ==============================================================
            VISTA 3: RECUPERAR CONTRASEÑA
            ============================================================== */}
        {view === "forgot" && (
          <div>
            <h2 className="auth-title">Recuperar contraseña</h2>
            <p className="auth-subtitle">
              Ingresa el correo electrónico asociado a tu cuenta para enviarte
              un enlace de restablecimiento.
            </p>

            {errorMessage && (
              <div className="auth-error-banner">
                <i className="bi bi-exclamation-circle"></i> {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="auth-success-banner">
                <i className="bi bi-check-circle"></i> {successMessage}
              </div>
            )}

            {!forgotSent ? (
              <form onSubmit={handleForgotSubmit}>
                <div className="auth-field-group">
                  <label className="auth-field-label">Correo electrónico</label>
                  <div className="auth-input-wrapper">
                    <i className="bi bi-envelope auth-input-icon"></i>
                    <input
                      type="email"
                      className="auth-input"
                      placeholder="tu@email.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-btn-primary"
                  style={{ marginTop: "10px" }}
                >
                  Enviar enlace de recuperación{" "}
                  <i className="bi bi-arrow-right"></i>
                </button>
              </form>
            ) : null}

            <div className="auth-divider">
              <span className="auth-divider-line"></span>
              <span className="auth-divider-dot">⋄</span>
              <span className="auth-divider-line"></span>
            </div>

            <button
              type="button"
              className="auth-btn-secondary"
              onClick={() => {
                setErrorMessage("");
                setSuccessMessage("");
                setForgotSent(false);
                setView("login");
              }}
            >
              <i className="bi bi-arrow-left"></i> Volver a Iniciar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
