import { useState, useEffect } from "react";

export default function LuxuryNotification() {
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    // Interceptar window.alert nativo del navegador para que nunca salga el popup del navegador
    const originalAlert = window.alert;
    window.alert = (message) => {
      const text = typeof message === "string" ? message : String(message || "");
      setNotice({
        message: text,
        type: "warning",
      });
    };

    // Escuchar eventos platino_notification
    const handleCustomNotice = (e) => {
      const detail = e.detail;
      if (!detail) return;
      setNotice({
        message: typeof detail === "string" ? detail : detail.message || "",
        type: detail.type || "warning",
      });
    };

    window.addEventListener("platino_notification", handleCustomNotice);

    return () => {
      window.alert = originalAlert;
      window.removeEventListener("platino_notification", handleCustomNotice);
    };
  }, []);

  if (!notice) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999999,
        background: "rgba(9, 28, 22, 0.72)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "badgePop 0.2s cubic-bezier(0.17, 0.89, 0.32, 1.28)",
      }}
      onClick={() => setNotice(null)}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          borderRadius: "18px",
          padding: "26px 24px 22px",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
          border: "1.5px solid #e2d7c5",
          textAlign: "center",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar X en la esquina */}
        <button
          type="button"
          onClick={() => setNotice(null)}
          aria-label="Cerrar notificación"
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            border: "1px solid #e7ded0",
            background: "#FAF7F2",
            color: "#113B3A",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <i className="bi bi-x-lg"></i>
        </button>

        {/* Ícono de Diamante Platino de Lujo */}
        <div
          style={{
            width: "48px",
            height: "48px",
            margin: "0 auto 14px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #09261c 0%, #113B3A 100%)",
            border: "1.5px solid #d4af37",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#dfba73",
            boxShadow: "0 4px 14px rgba(17, 59, 58, 0.2)",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3h12l4 7-10 11L2 10l4-7z" />
            <path d="M2 10h20" />
            <path d="M10 3l-2 7 4 11 4-11-2-7" />
          </svg>
        </div>

        {/* Título de Marca */}
        <h5
          style={{
            fontFamily: "Georgia, 'Playfair Display', serif",
            fontSize: "14px",
            letterSpacing: "0.14em",
            color: "#113B3A",
            margin: "0 0 8px 0",
            fontWeight: "600",
            textTransform: "uppercase",
          }}
        >
          PLATINO PERÚ
        </h5>

        {/* Mensaje */}
        <p
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: "13.5px",
            lineHeight: "1.55",
            color: "#33443c",
            margin: "0 0 20px 0",
            wordBreak: "break-word",
          }}
        >
          {notice.message}
        </p>

        {/* Botón de Aceptar Lujoso */}
        <button
          type="button"
          onClick={() => setNotice(null)}
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #0d3b2e 0%, #113B3A 100%)",
            color: "#FAF7F2",
            border: "1px solid #c5a059",
            borderRadius: "10px",
            padding: "11px 20px",
            fontSize: "13px",
            fontWeight: "700",
            letterSpacing: "0.06em",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(13, 59, 46, 0.25)",
            transition: "all 0.15s ease",
          }}
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
