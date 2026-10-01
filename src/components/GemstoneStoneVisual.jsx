import { DiamondCutIcon } from "./GemstoneIcons";

// Componente visual ultra elegante para previsualizar la gema suelta con brillo y facetas
export default function GemstoneStoneVisual({
  shape = "oval",
  size = 180,
  color = "incoloro", // incoloro | azul | verde | rojo | amarillo | rosa
  carat = "1.25 ct",
  showSparkle = true,
  className = "",
}) {
  const colorPalettes = {
    incoloro: {
      bgGrad: "radial-gradient(circle at 45% 40%, rgba(255,255,255,0.98) 0%, rgba(230,242,250,0.85) 45%, rgba(195,215,232,0.7) 80%, rgba(165,190,212,0.6) 100%)",
      stroke: "#5d7c99",
      glow: "0 10px 30px rgba(185, 215, 240, 0.45)",
      facetHighlight: "rgba(255, 255, 255, 0.95)",
    },
    azul: {
      bgGrad: "radial-gradient(circle at 45% 40%, #5b8df5 0%, #1a47b8 45%, #0b2575 80%, #061548 100%)",
      stroke: "#d0e0ff",
      glow: "0 10px 30px rgba(22, 58, 138, 0.55)",
      facetHighlight: "rgba(180, 210, 255, 0.8)",
    },
    verde: {
      bgGrad: "radial-gradient(circle at 45% 40%, #34d399 0%, #059669 45%, #065f46 80%, #022c22 100%)",
      stroke: "#d1fae5",
      glow: "0 10px 30px rgba(11, 102, 59, 0.55)",
      facetHighlight: "rgba(209, 250, 229, 0.8)",
    },
    rojo: {
      bgGrad: "radial-gradient(circle at 45% 40%, #fb7185 0%, #e11d48 45%, #9f1239 80%, #4c0519 100%)",
      stroke: "#ffe4e6",
      glow: "0 10px 30px rgba(155, 17, 30, 0.55)",
      facetHighlight: "rgba(255, 228, 230, 0.8)",
    },
    amarillo: {
      bgGrad: "radial-gradient(circle at 45% 40%, #fef08a 0%, #eab308 45%, #a16207 80%, #713f12 100%)",
      stroke: "#fef9c3",
      glow: "0 10px 30px rgba(217, 167, 38, 0.55)",
      facetHighlight: "rgba(254, 249, 195, 0.8)",
    },
    rosa: {
      bgGrad: "radial-gradient(circle at 45% 40%, #fbcfe8 0%, #f472b6 45%, #db2777 80%, #831843 100%)",
      stroke: "#fdf2f8",
      glow: "0 10px 30px rgba(228, 153, 168, 0.55)",
      facetHighlight: "rgba(253, 242, 248, 0.8)",
    },
  };

  const palette = colorPalettes[color?.toLowerCase()] || colorPalettes.incoloro;

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
      {/* Fondo de brillo suave */}
      <div
        style={{
          position: "absolute",
          width: `${size * 0.82}px`,
          height: `${size * 0.82}px`,
          borderRadius: "50%",
          background: palette.bgGrad,
          boxShadow: palette.glow,
          filter: "blur(4px)",
          opacity: 0.9,
          zIndex: 1,
        }}
      />

      {/* Ilustración de facetas vectoriales */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          color: palette.stroke,
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
          transition: "transform 0.3s ease",
        }}
      >
        <DiamondCutIcon shape={shape} size={size * 0.78} />
      </div>

      {/* Destellos de luz brillantes (Sparkles) */}
      {showSparkle && (
        <>
          <span
            style={{
              position: "absolute",
              top: "16%",
              right: "22%",
              color: "#ffffff",
              fontSize: `${size * 0.12}px`,
              zIndex: 3,
              filter: "drop-shadow(0 0 6px rgba(255,255,255,0.9))",
              animation: "sparkle-pulse 2.2s infinite ease-in-out",
            }}
          >
            ✦
          </span>
          <span
            style={{
              position: "absolute",
              bottom: "20%",
              left: "22%",
              color: "#ffffff",
              fontSize: `${size * 0.09}px`,
              zIndex: 3,
              filter: "drop-shadow(0 0 5px rgba(255,255,255,0.85))",
              animation: "sparkle-pulse 2.6s infinite ease-in-out 0.8s",
            }}
          >
            ✧
          </span>
        </>
      )}

      {/* Badge de peso si se provee */}
      {carat && (
        <div
          style={{
            position: "absolute",
            bottom: "4px",
            background: "rgba(10, 39, 31, 0.85)",
            backdropFilter: "blur(6px)",
            color: "white",
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "0.08em",
            padding: "2px 8px",
            borderRadius: "12px",
            zIndex: 4,
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          {carat}
        </div>
      )}
    </div>
  );
}
