import React from "react";
import { DiamondCutIcon } from "./GemstoneIcons";

// Configuración de siluetas y proporciones según el corte
const SHAPE_STYLES = {
  redondo: {
    borderRadius: "50%",
    aspectRatio: "1/1",
    scaleWidth: 0.84,
    scaleHeight: 0.84,
  },
  oval: {
    borderRadius: "50% / 60%",
    scaleWidth: 0.70,
    scaleHeight: 0.88,
  },
  esmeralda: {
    borderRadius: "8px",
    clipPath: "polygon(14% 0%, 86% 0%, 100% 14%, 100% 86%, 86% 100%, 14% 100%, 0% 86%, 0% 14%)",
    scaleWidth: 0.72,
    scaleHeight: 0.88,
  },
  marquesa: {
    borderRadius: "50% / 20%",
    transform: "scale(0.9, 1.1)",
    scaleWidth: 0.62,
    scaleHeight: 0.92,
  },
  pera: {
    borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
    scaleWidth: 0.72,
    scaleHeight: 0.88,
  },
  corazon: {
    borderRadius: "50%",
    scaleWidth: 0.82,
    scaleHeight: 0.82,
  },
  cojin: {
    borderRadius: "28%",
    scaleWidth: 0.82,
    scaleHeight: 0.82,
  },
  princesa: {
    borderRadius: "6px",
    scaleWidth: 0.80,
    scaleHeight: 0.80,
  },
};

// Paletas cromáticas y de refracción según el mineral / color
const COLOR_PALETTES = {
  incoloro: {
    // Diamante Blanco D-F / Lab-Grown Puro
    primary: "#ffffff",
    secondary: "#e0f2fe",
    accent: "#bae6fd",
    stroke: "#ffffff",
    strokeOpacity: 0.95,
    strokeFilter: "drop-shadow(0 0 2px rgba(186, 230, 253, 0.8)) drop-shadow(0 2px 5px rgba(15, 23, 42, 0.45))",
    bodyGrad: "radial-gradient(circle at 40% 35%, #ffffff 0%, #f0f9ff 28%, #dbeafe 58%, #93c5fd 85%, #60a5fa 100%)",
    innerGlow: "radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.95) 0%, rgba(240, 249, 255, 0.4) 50%, rgba(147, 197, 253, 0.2) 100%)",
    outerGlow: "0 14px 34px -4px rgba(96, 165, 250, 0.35), 0 0 20px rgba(255, 255, 255, 0.6)",
    pedestalShadow: "rgba(15, 23, 42, 0.22)",
    facetHighlight: "rgba(255, 255, 255, 0.85)",
  },
  azul: {
    // Zafiro Azul Real Ceilán
    primary: "#1d4ed8",
    secondary: "#1e40af",
    accent: "#60a5fa",
    stroke: "#dbeafe",
    strokeOpacity: 0.92,
    strokeFilter: "drop-shadow(0 0 3px rgba(191, 219, 254, 0.75)) drop-shadow(0 2px 6px rgba(2, 6, 23, 0.7))",
    bodyGrad: "radial-gradient(circle at 40% 35%, #3b82f6 0%, #2563eb 25%, #1d4ed8 50%, #1e3a8a 80%, #0f172a 100%)",
    innerGlow: "radial-gradient(circle at 50% 40%, rgba(147, 197, 253, 0.6) 0%, rgba(37, 99, 235, 0.3) 60%, rgba(15, 23, 42, 0.8) 100%)",
    outerGlow: "0 16px 36px -4px rgba(29, 78, 216, 0.5), 0 0 16px rgba(96, 165, 250, 0.4)",
    pedestalShadow: "rgba(15, 23, 42, 0.35)",
    facetHighlight: "rgba(219, 234, 254, 0.7)",
  },
  verde: {
    // Esmeralda Colombiana Muzo
    primary: "#059669",
    secondary: "#047857",
    accent: "#34d399",
    stroke: "#d1fae5",
    strokeOpacity: 0.92,
    strokeFilter: "drop-shadow(0 0 3px rgba(167, 243, 208, 0.7)) drop-shadow(0 2px 6px rgba(2, 44, 34, 0.7))",
    bodyGrad: "radial-gradient(circle at 40% 35%, #10b981 0%, #059669 30%, #047857 60%, #064e3b 85%, #022c22 100%)",
    innerGlow: "radial-gradient(circle at 50% 40%, rgba(167, 243, 208, 0.5) 0%, rgba(5, 150, 105, 0.25) 60%, rgba(2, 44, 34, 0.8) 100%)",
    outerGlow: "0 16px 36px -4px rgba(5, 150, 105, 0.45), 0 0 16px rgba(52, 211, 153, 0.35)",
    pedestalShadow: "rgba(2, 44, 34, 0.35)",
    facetHighlight: "rgba(209, 250, 229, 0.7)",
  },
  rojo: {
    // Rubí Sangre de Pichón
    primary: "#e11d48",
    secondary: "#be123c",
    accent: "#fb7185",
    stroke: "#ffe4e6",
    strokeOpacity: 0.92,
    strokeFilter: "drop-shadow(0 0 3px rgba(254, 205, 211, 0.7)) drop-shadow(0 2px 6px rgba(76, 5, 25, 0.7))",
    bodyGrad: "radial-gradient(circle at 40% 35%, #f43f5e 0%, #e11d48 30%, #be123c 60%, #881337 85%, #4c0519 100%)",
    innerGlow: "radial-gradient(circle at 50% 40%, rgba(254, 205, 211, 0.5) 0%, rgba(225, 29, 72, 0.25) 60%, rgba(76, 5, 25, 0.8) 100%)",
    outerGlow: "0 16px 36px -4px rgba(225, 29, 72, 0.5), 0 0 16px rgba(251, 113, 133, 0.35)",
    pedestalShadow: "rgba(76, 5, 25, 0.35)",
    facetHighlight: "rgba(255, 228, 230, 0.7)",
  },
  amarillo: {
    // Diamante Canario Fancy Yellow
    primary: "#eab308",
    secondary: "#ca8a04",
    accent: "#fef08a",
    stroke: "#fef9c3",
    strokeOpacity: 0.94,
    strokeFilter: "drop-shadow(0 0 3px rgba(254, 240, 138, 0.8)) drop-shadow(0 2px 5px rgba(113, 63, 18, 0.5))",
    bodyGrad: "radial-gradient(circle at 40% 35%, #fef08a 0%, #facc15 30%, #eab308 60%, #a16207 85%, #713f12 100%)",
    innerGlow: "radial-gradient(circle at 50% 40%, rgba(254, 249, 195, 0.6) 0%, rgba(234, 179, 8, 0.3) 60%, rgba(113, 63, 18, 0.7) 100%)",
    outerGlow: "0 16px 36px -4px rgba(234, 179, 8, 0.45), 0 0 16px rgba(254, 240, 138, 0.5)",
    pedestalShadow: "rgba(113, 63, 18, 0.28)",
    facetHighlight: "rgba(254, 249, 195, 0.8)",
  },
  rosa: {
    // Diamante Rosa Argyle / Zafiro Rosa
    primary: "#ec4899",
    secondary: "#db2777",
    accent: "#fbcfe8",
    stroke: "#fdf2f8",
    strokeOpacity: 0.94,
    strokeFilter: "drop-shadow(0 0 3px rgba(251, 207, 232, 0.8)) drop-shadow(0 2px 5px rgba(131, 24, 67, 0.5))",
    bodyGrad: "radial-gradient(circle at 40% 35%, #fdf2f8 0%, #f472b6 30%, #ec4899 60%, #be185d 85%, #831843 100%)",
    innerGlow: "radial-gradient(circle at 50% 40%, rgba(253, 242, 248, 0.6) 0%, rgba(236, 72, 153, 0.3) 60%, rgba(131, 24, 67, 0.7) 100%)",
    outerGlow: "0 16px 36px -4px rgba(236, 72, 153, 0.45), 0 0 16px rgba(251, 207, 232, 0.5)",
    pedestalShadow: "rgba(131, 24, 67, 0.28)",
    facetHighlight: "rgba(253, 242, 248, 0.8)",
  },
};

export default function GemstoneStoneVisual({
  shape = "oval",
  size = 180,
  color = "incoloro",
  carat = "1.25 ct",
  showSparkle = true,
  className = "",
}) {
  const normShape = shape?.toLowerCase() || "oval";
  const normColor = color?.toLowerCase() || "incoloro";

  const shapeConfig = SHAPE_STYLES[normShape] || SHAPE_STYLES.oval;
  const palette = COLOR_PALETTES[normColor] || COLOR_PALETTES.incoloro;

  const widthPx = Math.round(size * shapeConfig.scaleWidth);
  const heightPx = Math.round(size * shapeConfig.scaleHeight);

  return (
    <div
      className={`gemstone-visual-container ${className}`}
      style={{
        position: "relative",
        width: `${size}px`,
        height: `${size}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Sombra de apoyo en pedestal de terciopelo boutique (efecto vitrina showroom) */}
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          width: `${widthPx * 0.9}px`,
          height: `${heightPx * 0.26}px`,
          borderRadius: "50%",
          background: `radial-gradient(ellipse at center, ${palette.pedestalShadow} 0%, rgba(198, 172, 127, 0.15) 45%, rgba(0,0,0,0) 75%)`,
          filter: "blur(6px)",
          zIndex: 1,
        }}
      />

      {/* Halo de brillo y refracción ambiental (Vitrina de Alta Joyería) */}
      <div
        style={{
          position: "absolute",
          width: `${widthPx * 1.15}px`,
          height: `${heightPx * 1.15}px`,
          borderRadius: "50%",
          background: `radial-gradient(circle at center, rgba(198, 172, 127, 0.12) 0%, rgba(242, 249, 242, 0.08) 50%, rgba(255,255,255,0) 70%)`,
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Silueta y cuerpo de la gema con gradiente de refracción que coincide EXACTAMENTE con el corte */}
      <div
        className="gem-stone-body"
        style={{
          position: "absolute",
          width: `${widthPx}px`,
          height: `${heightPx}px`,
          borderRadius: shapeConfig.borderRadius || "0",
          clipPath: shapeConfig.clipPath || "none",
          background: palette.bodyGrad,
          boxShadow: palette.outerGlow,
          zIndex: 2,
          overflow: "hidden",
          transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease",
        }}
      >
        {/* Capa de destello interno (luz especular que ilumina el núcleo) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: palette.innerGlow,
            mixBlendMode: "overlay",
          }}
        />

        {/* Reflejo especular superior (Mesa / Faceta Crown) */}
        <div
          style={{
            position: "absolute",
            top: "12%",
            left: "16%",
            width: "52%",
            height: "38%",
            borderRadius: "50%",
            background: "radial-gradient(ellipse at center, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 70%)",
            transform: "rotate(-25deg)",
            pointerEvents: "none",
          }}
        />

        {/* Haz de luz de fuego diamantino en ángulo */}
        <div
          className="gem-shimmer-sweep"
          style={{
            position: "absolute",
            top: "-50%",
            left: "-60%",
            width: "60%",
            height: "200%",
            background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)",
            transform: "rotate(25deg)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Trazado Vectorial de Facetas Poligonales de Alta Precisión */}
      <div
        className="gem-facets-overlay"
        style={{
          position: "relative",
          zIndex: 3,
          color: palette.stroke,
          opacity: palette.strokeOpacity,
          filter: palette.strokeFilter,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <DiamondCutIcon shape={normShape} size={size * 0.84} />
      </div>

      {/* Destellos de luz brillante / Fuego de la gema (Sparkles) */}
      {showSparkle && (
        <>
          <span
            style={{
              position: "absolute",
              top: "12%",
              right: "18%",
              color: "#ffffff",
              fontSize: `${Math.max(16, size * 0.12)}px`,
              zIndex: 4,
              filter: "drop-shadow(0 0 6px rgba(255,255,255,0.95)) drop-shadow(0 0 10px rgba(198, 172, 127, 0.8))",
              animation: "sparkle-pulse 2.2s infinite ease-in-out",
              userSelect: "none",
            }}
          >
            ✦
          </span>
          <span
            style={{
              position: "absolute",
              bottom: "16%",
              left: "16%",
              color: "#ffffff",
              fontSize: `${Math.max(12, size * 0.09)}px`,
              zIndex: 4,
              filter: "drop-shadow(0 0 5px rgba(255,255,255,0.9))",
              animation: "sparkle-pulse 2.8s infinite ease-in-out 0.9s",
              userSelect: "none",
            }}
          >
            ✧
          </span>
        </>
      )}

      {/* Placa / Badge de Quilates (Carat) estilo Joyería de Lujo Platino */}
      {carat && (
        <div
          style={{
            position: "absolute",
            bottom: "-6px",
            background: "#FDF9F2",
            border: "1.2px solid #C6AC7F",
            color: "#113B3A",
            fontSize: "11px",
            fontWeight: "800",
            letterSpacing: "0.06em",
            padding: "2.5px 10px",
            borderRadius: "20px",
            zIndex: 5,
            boxShadow: "0 4px 12px rgba(17, 59, 58, 0.12)",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            userSelect: "none",
          }}
        >
          <span style={{ color: "#C6AC7F", fontSize: "10px" }}>✦</span>
          <span>{carat.toUpperCase()}</span>
        </div>
      )}
    </div>
  );
}
