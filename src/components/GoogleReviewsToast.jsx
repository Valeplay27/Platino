import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { googleReviewsData } from "../data/googleReviews";
import "../styles/googleReviewsToast.css";

const GoogleIcon = () => (
  <svg className="gr-toast-brand-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      fill="#4285F4"
    />
    <path
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      fill="#34A853"
    />
    <path
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      fill="#FBBC05"
    />
    <path
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      fill="#EA4335"
    />
  </svg>
);

const isDashboardRoute = (pathname) => {
  if (!pathname) return false;
  const path = pathname.toLowerCase();
  return (
    path.startsWith("/admin") ||
    path.startsWith("/dashboard") ||
    path.startsWith("/mis-pedidos") ||
    path.startsWith("/seguimiento") ||
    path.startsWith("/cliente") ||
    path.startsWith("/pedidos")
  );
};

export default function GoogleReviewsToast() {
  const location = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const checkIsMobileOrTouch = () => {
    if (typeof window === "undefined") return false;
    const isSmall = window.innerWidth <= 1024;
    const isTouch = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isSmall || isTouch || isMobileUA;
  };

  const [isMobile, setIsMobile] = useState(() => checkIsMobileOrTouch());

  const timerRef = useRef(null);
  const hideTimerRef = useRef(null);

  const isExcluded = isDashboardRoute(location.pathname) || isMobile;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(checkIsMobileOrTouch());
    };
    window.addEventListener("resize", checkMobile);
    window.addEventListener("orientationchange", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("orientationchange", checkMobile);
    };
  }, []);

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  };

  useEffect(() => {
    // Si es celular/móvil (<=768px) o dashboard, NUNCA mostrar
    if (isExcluded) {
      clearTimers();
      setIsVisible(false);
      setIsLeaving(false);
      return;
    }

    if (isDismissed) return;

    // Mostrar de vez en cuando de forma periódica
    const scheduleNextShow = (delayMs) => {
      clearTimers();
      timerRef.current = setTimeout(() => {
        setIsVisible(true);
        setIsLeaving(false);

        // Permanece en pantalla 8 segundos
        hideTimerRef.current = setTimeout(() => {
          setIsLeaving(true);
          setTimeout(() => {
            setIsVisible(false);
            setIsLeaving(false);
            // Rotar a la siguiente reseña y esperar 18 segundos para la siguiente notificación
            setCurrentIndex((prev) => (prev + 1) % googleReviewsData.length);
            scheduleNextShow(18000);
          }, 350);
        }, 8000);
      }, delayMs);
    };

    // Primera aparición a los 3.5 segundos tras entrar a la página
    scheduleNextShow(3500);

    return () => clearTimers();
  }, [location.pathname, isExcluded, isDismissed]);

  const handleClose = (e) => {
    e.stopPropagation();
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsLeaving(false);
      setIsDismissed(true);
      // Tras 45 segundos volver a permitir mostrar
      setTimeout(() => setIsDismissed(false), 45000);
    }, 300);
  };

  if (isExcluded || !isVisible) {
    return null;
  }

  const review = googleReviewsData[currentIndex] || googleReviewsData[0];

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={i <= rating ? "gr-star-filled" : "gr-star-empty"}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  if (isMobile) return null;

  return (
    <aside
      className="gr-toast-container"
      role="status"
      aria-live="polite"
      aria-label="Opinión de Google Maps"
    >
      <div className={`gr-toast-card ${isLeaving ? "gr-toast-leaving" : ""}`}>
        {/* Cabecera de usuario estilo Google Maps */}
        <div className="gr-toast-user-row">
          {review.avatar ? (
            <img
              src={review.avatar}
              alt={review.author}
              className="gr-toast-avatar"
            />
          ) : (
            <div className="gr-toast-avatar-fallback">
              {review.author ? review.author[0] : "G"}
            </div>
          )}

          <div className="gr-toast-user-info">
            <h4 className="gr-toast-user-name">{review.author}</h4>
            <p className="gr-toast-user-meta">{review.meta || "Opinión en Google Maps"}</p>
          </div>

          <button
            type="button"
            className="gr-toast-close"
            onClick={handleClose}
            aria-label="Cerrar notificación"
            title="Cerrar"
          >
            &times;
          </button>
        </div>

        {/* Estrellas y Fecha */}
        <div className="gr-toast-rating-row">
          <div className="gr-toast-stars" aria-label={`${review.rating} de 5 estrellas`}>
            {renderStars(review.rating)}
          </div>
          <span className="gr-toast-date">{review.date}</span>
        </div>

        {/* Texto de la reseña */}
        <p className="gr-toast-text">{review.text}</p>

        {/* Foto adjunta del cliente si existe (ej. estuche rojo con los anillos) */}
        {review.photo && (
          <div className="gr-toast-photo-wrap">
            <img
              src={review.photo}
              alt="Foto subida por el cliente en Google Maps"
              className="gr-toast-photo"
              loading="lazy"
            />
          </div>
        )}

        {/* Pie con Google Maps y sede */}
        <div className="gr-toast-footer">
          <a
            href={review.sedeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="gr-toast-brand"
            title="Ver en Google Maps"
          >
            <GoogleIcon />
            <span>{review.sede} en Google Maps</span>
          </a>
          <a
            href={review.sedeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="gr-toast-maps-btn"
          >
            Ver reseña <i className="bi bi-box-arrow-up-right"></i>
          </a>
        </div>
      </div>
    </aside>
  );
}
