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
    findUserByDniOrEmail,
    validateRecoveryCode,
    resetPasswordWithAdminCode,
    usersDb,
  } = useAuth();

  const view = modalInitialView || "login";
  const setView = (v) => {
    setErrorMessage("");
    setSuccessMessage("");
    setModalInitialView(v);
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Campos Login (acepta Correo o DNI)
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Campos Register (DNI obligatorio y único)
  const [regName, setRegName] = useState("");
  const [regDni, setRegDni] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Campos Recuperación de Contraseña con Código Diario del Administrador
  const [forgotStep, setForgotStep] = useState(1); // 1 = Validar DNI/Correo + Código del Admin | 2 = Nueva contraseña + Repetir contraseña
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotAdminCode, setForgotAdminCode] = useState("");
  const [validatedRecoveryUser, setValidatedRecoveryUser] = useState(null);
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");

  // Mensajes de error / éxito
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isAuthModalOpen) return null;

  // Detectar en vivo si el DNI ingresado en el registro (8 dígitos) ya existe en la página
  const cleanRegDni = regDni.replace(/\D/g, "").trim();
  const duplicateDniUser =
    cleanRegDni.length === 8 && findUserByDniOrEmail
      ? findUserByDniOrEmail(cleanRegDni)
      : null;

  // Rellenar credenciales demo para pruebas rápidas
  const fillDemoCredentials = (role) => {
    setErrorMessage("");
    setSuccessMessage("");
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
      const demoClient = (usersDb || []).find(
        (u) => u.email?.toLowerCase() === "cliente@platino.pe"
      );
      setLoginEmail("cliente@platino.pe");
      setLoginPassword(demoClient?.password || "platino2026");
    }
  };

  // Ir a Iniciar Sesión pre-cargando el DNI o Correo cuando el DNI ya existe
  const handleGoToLoginWithExistingUser = (identifierToFill) => {
    setLoginEmail(identifierToFill || cleanRegDni || regEmail);
    setLoginPassword("");
    setModalInitialView("login");
    setErrorMessage("");
    setSuccessMessage(
      `El DNI ${cleanRegDni || identifierToFill} ya está registrado en Platino Perú. Ingresa tu contraseña para acceder.`
    );
  };

  // Ir a Recuperar Contraseña con el Código del Admin
  const handleGoToForgotWithExistingUser = (identifierToFill) => {
    setForgotIdentifier(identifierToFill || cleanRegDni || regEmail || loginEmail);
    setForgotAdminCode("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setValidatedRecoveryUser(null);
    setForgotStep(1);
    setModalInitialView("forgot");
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Manejar Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMessage("Por favor, completa tu DNI / correo y tu contraseña.");
      return;
    }

    const result = login(loginEmail, loginPassword);
    if (!result.success) {
      setErrorMessage(result.error);
    }
  };

  // Manejar Registro (con validación obligatoria de DNI único)
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!cleanRegDni || cleanRegDni.length !== 8) {
      setErrorMessage("El DNI es obligatorio para registrarse y debe contener exactamente 8 dígitos numéricos.");
      return;
    }

    if (duplicateDniUser) {
      handleGoToLoginWithExistingUser(duplicateDniUser.dni || duplicateDniUser.email);
      return;
    }

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMessage("Por favor, completa todos los campos requeridos (incluyendo tu DNI).");
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const result = register({
      name: regName,
      dni: cleanRegDni,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      role: "cliente",
    });

    if (!result.success) {
      if (result.code === "DNI_ALREADY_EXISTS" || result.code === "EMAIL_ALREADY_EXISTS") {
        const prefill = result.existingUser?.dni || result.existingUser?.email || cleanRegDni;
        setLoginEmail(prefill);
        setLoginPassword("");
        setModalInitialView("login");
        setErrorMessage("");
        setSuccessMessage(result.error);
        return;
      }
      setErrorMessage(result.error);
    }
  };

  // Paso 1 de Recuperación: Validar DNI/Correo + Código Diario del Admin
  const handleValidateAdminCodeSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!forgotIdentifier.trim()) {
      setErrorMessage("Ingresa tu número de DNI (8 dígitos) o correo electrónico registrado.");
      return;
    }
    if (!forgotAdminCode.trim()) {
      setErrorMessage("Ingresa el código de seguridad del día facilitado por el Administrador.");
      return;
    }

    const res = validateRecoveryCode(forgotIdentifier, forgotAdminCode);
    if (!res.success) {
      setErrorMessage(res.error);
      return;
    }

    setValidatedRecoveryUser(res.targetUser);
    setForgotStep(2);
    setSuccessMessage(
      `✓ ¡Validación exitosa! Código verificado para ${res.targetUser.name}. Ahora crea y confirma tu nueva contraseña.`
    );
  };

  // Paso 2 de Recuperación: Guardar Nueva Contraseña y Confirmación
  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setErrorMessage("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMessage("Las contraseñas no coinciden. Asegúrate de escribir exactamente la misma clave en ambos campos.");
      return;
    }

    const res = resetPasswordWithAdminCode({
      identifier: forgotIdentifier,
      inputCode: forgotAdminCode,
      newPassword: forgotNewPassword,
      confirmPassword: forgotConfirmPassword,
    });

    if (!res.success) {
      setErrorMessage(res.error);
      return;
    }

    // Llevar al login con el DNI/correo listo y mensaje de éxito
    setLoginEmail(res.user?.dni || res.user?.email || forgotIdentifier);
    setLoginPassword("");
    setForgotStep(1);
    setForgotAdminCode("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setValidatedRecoveryUser(null);
    setModalInitialView("login");
    setErrorMessage("");
    setSuccessMessage(
      "✓ ¡Tu contraseña ha sido actualizada exitosamente! Ingresa ahora con tu nueva clave."
    );
  };

  const passwordsMatch =
    forgotNewPassword.length > 0 &&
    forgotConfirmPassword.length > 0 &&
    forgotNewPassword === forgotConfirmPassword;

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
            VISTA 1: INICIO DE SESIÓN (CORREO O DNI + CONTRASEÑA)
            ============================================================== */}
        {view === "login" && (
          <div>
            <h2 className="auth-title">Inicia sesión</h2>
            <p className="auth-subtitle">
              Accede con tu correo electrónico o número de DNI y tu contraseña.
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
                  title="Super Admin Principal - Control Total, Aprobación de Permisos y Clave Diaria"
                  style={{ fontWeight: "700", border: "1px solid #b8860b" }}
                >
                  <i className="bi bi-shield-shaded" style={{ color: "#b8860b" }}></i> 👑 Vladimir (Principal)
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials("lima")}
                  className="btn-demo-fill"
                  title="Administrador Sede Lima Centro"
                >
                  <i className="bi bi-geo-alt"></i> 🏛️ Admin Lima Centro
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials("miraflores")}
                  className="btn-demo-fill"
                  title="Administrador Sede Miraflores"
                >
                  <i className="bi bi-geo-alt"></i> 🌊 Admin Miraflores
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials("cliente")}
                  className="btn-demo-fill"
                  title="Cliente Demo (DNI: 74829103)"
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

            {successMessage && (
              <div className="auth-success-banner" style={{ marginBottom: "14px" }}>
                <i className="bi bi-check-circle-fill"></i> {successMessage}
              </div>
            )}

            <form onSubmit={handleLoginSubmit}>
              {/* Campo Correo o DNI */}
              <div className="auth-field-group">
                <label className="auth-field-label">Correo electrónico o DNI (8 dígitos)</label>
                <div className="auth-input-wrapper">
                  <i className="bi bi-person-vcard auth-input-icon"></i>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="tu@email.com o tu N° de DNI"
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
                  onClick={() => handleGoToForgotWithExistingUser(loginEmail)}
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
                setSuccessMessage("");
                setView("register");
              }}
            >
              <i className="bi bi-person"></i> Crear una cuenta
            </button>

            {/* Pie de ayuda */}
            <div className="auth-footer-help">
              ¿Necesitas ayuda?{" "}
              <a
                href="https://wa.me/51927357217?text=Hola%20Platino%20Perú,%20necesito%20ayuda%20con%20mi%20cuenta"
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
            VISTA 2: CREAR UNA CUENTA (DNI OBLIGATORIO Y ÚNICO)
            ============================================================== */}
        {view === "register" && (
          <div>
            <h2 className="auth-title">Crear una cuenta</h2>
            <p className="auth-subtitle">
              El registro con DNI es obligatorio y único por cliente en Platino Perú.
            </p>

            {errorMessage && (
              <div className="auth-error-banner">
                <i className="bi bi-exclamation-circle"></i> {errorMessage}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit}>
              {/* Campo Obligatorio: DNI con validación de duplicado en tiempo real */}
              <div className="auth-field-group">
                <label className="auth-field-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>DNI (Documento de Identidad) *</span>
                  <span style={{ fontSize: "11px", color: cleanRegDni.length === 8 ? (duplicateDniUser ? "#dc2626" : "#15803d") : "#64748b", fontWeight: "700" }}>
                    {cleanRegDni.length}/8 dígitos
                  </span>
                </label>
                <div className="auth-input-wrapper">
                  <i className="bi bi-person-vcard auth-input-icon"></i>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    className="auth-input"
                    placeholder="Ej. 45892104 (8 dígitos obligatorios)"
                    value={regDni}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                      setRegDni(val);
                      if (errorMessage) setErrorMessage("");
                    }}
                    required
                    style={{
                      borderColor: duplicateDniUser
                        ? "#dc2626"
                        : cleanRegDni.length === 8
                        ? "#16a34a"
                        : undefined,
                    }}
                  />
                </div>

                {/* Alerta interactiva si el DNI ya se encuentra registrado en la página */}
                {duplicateDniUser && (
                  <div
                    style={{
                      marginTop: "10px",
                      background: "#fef2f2",
                      border: "1.5px solid #fca5a5",
                      borderRadius: "10px",
                      padding: "12px 14px",
                      fontSize: "12.5px",
                      color: "#991b1b",
                    }}
                  >
                    <div style={{ fontWeight: "800", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <i className="bi bi-shield-exclamation" style={{ fontSize: "15px" }}></i>
                      Este DNI ({cleanRegDni}) ya está registrado en la página
                    </div>
                    <p style={{ margin: "0 0 10px 0", lineHeight: "1.45", color: "#7f1d1d" }}>
                      Un mismo DNI no puede registrarse dos veces. Por favor <strong>ingresa tu contraseña</strong> para iniciar sesión o solicita el código diario al Administrador si la olvidaste:
                    </p>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => handleGoToLoginWithExistingUser(cleanRegDni)}
                        style={{
                          flex: 1,
                          background: "#113B3A",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          fontSize: "12px",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <i className="bi bi-key-fill" style={{ color: "#C6AC7F" }}></i>
                        Poner mi Contraseña
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGoToForgotWithExistingUser(cleanRegDni)}
                        style={{
                          flex: 1,
                          background: "#ffffff",
                          color: "#991b1b",
                          border: "1px solid #fca5a5",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          fontSize: "12px",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <i className="bi bi-shield-lock"></i>
                        Olvidé mi Clave (Código Admin)
                      </button>
                    </div>
                  </div>
                )}

                {!duplicateDniUser && cleanRegDni.length === 8 && (
                  <div style={{ marginTop: "5px", fontSize: "11.5px", color: "#15803d", fontWeight: "700" }}>
                    <i className="bi bi-check-circle-fill"></i> DNI válido y disponible para registro.
                  </div>
                )}
              </div>

              <div className="auth-field-group">
                <label className="auth-field-label">Nombre completo *</label>
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
                <label className="auth-field-label">Correo electrónico *</label>
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
                <label className="auth-field-label">Contraseña *</label>
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

              <button
                type="submit"
                className="auth-btn-primary"
                disabled={Boolean(duplicateDniUser)}
                style={{
                  opacity: duplicateDniUser ? 0.55 : 1,
                  cursor: duplicateDniUser ? "not-allowed" : "pointer",
                }}
              >
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
                setSuccessMessage("");
                setView("login");
              }}
            >
              <i className="bi bi-arrow-left"></i> ¿Ya tienes cuenta? Iniciar
              sesión
            </button>
          </div>
        )}

        {/* ==============================================================
            VISTA 3: RECUPERAR CONTRASEÑA CON CÓDIGO DIARIO DEL ADMIN
            ============================================================== */}
        {view === "forgot" && (
          <div>
            <h2 className="auth-title">Recuperar contraseña</h2>
            <p className="auth-subtitle">
              {forgotStep === 1
                ? "Solicita el Código Diario de Seguridad al Administrador Principal (Vladimir) para validar tu identidad."
                : "Validación exitosa. Ingresa tu nueva contraseña y repítela para confirmar el cambio."}
            </p>

            {/* Indicador de Pasos (Paso 1: Código Admin -> Paso 2: Nueva Clave) */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "16px",
                background: "#f8fafc",
                padding: "8px 10px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11.5px",
                  fontWeight: "700",
                  color: forgotStep === 1 ? "#113B3A" : "#15803d",
                }}
              >
                <span
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: forgotStep === 1 ? "#113B3A" : "#dcfce7",
                    color: forgotStep === 1 ? "#C6AC7F" : "#15803d",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: "800",
                  }}
                >
                  {forgotStep > 1 ? "✓" : "1"}
                </span>
                <span>1. Validar Código Admin</span>
              </div>

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11.5px",
                  fontWeight: "700",
                  color: forgotStep === 2 ? "#113B3A" : "#94a3b8",
                }}
              >
                <span
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: forgotStep === 2 ? "#113B3A" : "#e2e8f0",
                    color: forgotStep === 2 ? "#C6AC7F" : "#64748b",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: "800",
                  }}
                >
                  2
                </span>
                <span>2. Nueva Contraseña</span>
              </div>
            </div>

            {errorMessage && (
              <div className="auth-error-banner">
                <i className="bi bi-exclamation-circle"></i> {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="auth-success-banner" style={{ marginBottom: "14px" }}>
                <i className="bi bi-check-circle-fill"></i> {successMessage}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleValidateAdminCodeSubmit}>
                <div className="auth-field-group">
                  <label className="auth-field-label">
                    Tu DNI (8 dígitos) o Correo electrónico *
                  </label>
                  <div className="auth-input-wrapper">
                    <i className="bi bi-person-vcard auth-input-icon"></i>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="Ej. 74829103 o tu@email.com"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field-group">
                  <label className="auth-field-label">
                    Código Diario facilitado por el Administrador *
                  </label>
                  <div className="auth-input-wrapper">
                    <i className="bi bi-shield-key auth-input-icon"></i>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="Ingresa el código de 6 dígitos (Ej. 482916)"
                      value={forgotAdminCode}
                      onChange={(e) => setForgotAdminCode(e.target.value.toUpperCase())}
                      required
                      style={{
                        fontFamily: "monospace",
                        fontWeight: "700",
                        letterSpacing: "1.5px",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      marginTop: "8px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      fontSize: "11.5px",
                      color: "#475569",
                      lineHeight: "1.45",
                    }}
                  >
                    <div style={{ marginBottom: "6px" }}>
                      <i className="bi bi-info-circle-fill" style={{ color: "#113B3A", marginRight: "5px" }}></i>
                      El <strong>Administrador Principal (Vladimir)</strong> cuenta con un validador de clave que cambia a diario. Solicítale el código vigente para desbloquear tu cambio de contraseña.
                    </div>
                    <a
                      href={`https://wa.me/51927357217?text=${encodeURIComponent(
                        `Hola Administrador Platino Perú, olvidé mi contraseña. Mi DNI/Correo es: ${
                          forgotIdentifier || "(indicar DNI)"
                        }. ¿Podría facilitarme el código diario de validación?`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: "#113B3A",
                        fontWeight: "700",
                        textDecoration: "underline",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <i className="bi bi-whatsapp" style={{ color: "#16a34a" }}></i> Solicitar código al Administrador por WhatsApp
                    </a>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-btn-primary"
                  style={{ marginTop: "8px" }}
                >
                  Validar Código de Administrador{" "}
                  <i className="bi bi-shield-check"></i>
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit}>
                {validatedRecoveryUser && (
                  <div
                    style={{
                      background: "#ecfdf5",
                      border: "1px solid #86efac",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      marginBottom: "14px",
                      fontSize: "12.5px",
                      color: "#065f46",
                    }}
                  >
                    <div style={{ fontWeight: "800" }}>
                      <i className="bi bi-patch-check-fill"></i> Cuenta Verificada: {validatedRecoveryUser.name}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#047857", marginTop: "2px" }}>
                      {validatedRecoveryUser.dni ? `DNI: ${validatedRecoveryUser.dni} • ` : ""}
                      {validatedRecoveryUser.email}
                    </div>
                  </div>
                )}

                <div className="auth-field-group">
                  <label className="auth-field-label">Nueva Contraseña *</label>
                  <div className="auth-input-wrapper">
                    <i className="bi bi-lock auth-input-icon"></i>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="auth-input"
                      placeholder="Mínimo 6 caracteres"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      className="auth-toggle-pwd"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      <i className={showNewPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                    </button>
                  </div>
                </div>

                <div className="auth-field-group">
                  <label className="auth-field-label">Repetir Nueva Contraseña *</label>
                  <div className="auth-input-wrapper">
                    <i className="bi bi-lock-fill auth-input-icon"></i>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="auth-input"
                      placeholder="Repite exactamente tu nueva contraseña"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="auth-toggle-pwd"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <i className={showConfirmPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                    </button>
                  </div>

                  {/* Validación en tiempo real de coincidencia de ambas contraseñas */}
                  {forgotNewPassword && forgotConfirmPassword && (
                    <div
                      style={{
                        marginTop: "6px",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: passwordsMatch ? "#15803d" : "#dc2626",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <i
                        className={`bi ${
                          passwordsMatch ? "bi-check-circle-fill" : "bi-x-circle-fill"
                        }`}
                      ></i>
                      {passwordsMatch
                        ? "Las contraseñas coinciden correctamente"
                        : "Las contraseñas no coinciden (deben ser iguales)"}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="auth-btn-primary"
                  disabled={!passwordsMatch || forgotNewPassword.length < 6}
                  style={{
                    marginTop: "8px",
                    opacity: !passwordsMatch || forgotNewPassword.length < 6 ? 0.55 : 1,
                    cursor: !passwordsMatch || forgotNewPassword.length < 6 ? "not-allowed" : "pointer",
                  }}
                >
                  Guardar Nueva Contraseña <i className="bi bi-check2-circle"></i>
                </button>
              </form>
            )}

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
                setForgotStep(1);
                setValidatedRecoveryUser(null);
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

