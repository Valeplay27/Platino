import { useState } from "react";
import { useAuth } from "../context/useAuth";
import platinoLogoWordmark from "../assets/platino-peru-logo.png?inline";

export default function MaintenanceNoticeModal() {
  const { isAdmin, openAuthModal } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // Si es administrador o ya cerró el aviso, no bloquear su trabajo
  if (isAdmin || dismissed) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="maintenance-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(9, 28, 22, 0.78)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "510px",
          background: "#ffffff",
          borderRadius: "18px",
          padding: "36px 32px 30px",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.35)",
          border: "1px solid #e4dccb",
          textAlign: "center",
        }}
      >
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Cerrar aviso"
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            border: "1px solid #e4e9e6",
            background: "#f8faf9",
            color: "#113B3A",
            cursor: "pointer",
            fontSize: "15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i className="bi bi-x-lg"></i>
        </button>

        {/* Logo Oficial */}
        <div style={{ marginBottom: "18px" }}>
          <img
            src={platinoLogoWordmark}
            alt="Platino Perú"
            style={{ height: "28px", width: "auto", objectFit: "contain", marginBottom: "6px" }}
          />
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "2.2px",
              color: "#7a8881",
              textTransform: "uppercase",
              fontWeight: "600",
            }}
          >
            JOYERÍA QUE CUENTA TU HISTORIA
          </div>
        </div>

        {/* Badge de mantenimiento */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            background: "#fdf5df",
            color: "#8a6814",
            border: "1px solid #ead49b",
            borderRadius: "999px",
            padding: "5px 14px",
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            marginBottom: "14px",
          }}
        >
          <i className="bi bi-tools"></i> Sitio Web en Mantenimiento
        </div>

        <h2
          id="maintenance-modal-title"
          style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
            fontSize: "28px",
            fontWeight: "600",
            color: "#0e2d24",
            margin: "0 0 12px",
            lineHeight: 1.2,
          }}
        >
          Estamos renovando nuestro catálogo exclusivo
        </h2>

        <p
          style={{
            fontSize: "13.5px",
            color: "#4d5e56",
            lineHeight: 1.6,
            margin: "0 0 22px",
          }}
        >
          Actualmente nuestra página se encuentra en proceso de <strong>mantenimiento y actualización de colecciones</strong> para brindarte una experiencia superior. Nuestras boutiques en <strong>Miraflores</strong> y <strong>Lima Centro</strong> atienden con total normalidad.
        </p>

        {/* Acciones principales */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <a
            href="https://wa.me/51999999999?text=Hola%20Platino%20Per%C3%BA%2C%20deseo%20recibir%20asesor%C3%ADa%20personalizada."
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: "#0d3b2e",
              color: "#ffffff",
              textDecoration: "none",
              padding: "12px 20px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "600",
              letterSpacing: "0.4px",
            }}
          >
            <i className="bi bi-whatsapp"></i> Atención inmediata por WhatsApp
          </a>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            style={{
              background: "#f4f7f5",
              color: "#113B3A",
              border: "1px solid #cfdcd5",
              padding: "11px 20px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Entendido, continuar a la página
          </button>
        </div>

        {/* Enlace discreto para acceso de administrador */}
        <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #eef2f0" }}>
          <button
            type="button"
            onClick={() => {
              setDismissed(true);
              openAuthModal("login");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#6b7c73",
              fontSize: "11.5px",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Acceso para administración
          </button>
        </div>
      </div>
    </div>
  );
}
