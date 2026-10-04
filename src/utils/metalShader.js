// Platino Perú - Metal Visual Shader & Color Tint Configuration

export const getMetalVisualShader = (metalId) => {
  switch (metalId) {
    case "plata-925":
      return {
        id: "plata-925",
        filter: "grayscale(0.92) brightness(1.10) contrast(1.08)",
        overlayGradient: "linear-gradient(135deg, rgba(230, 235, 238, 0.22), rgba(200, 210, 215, 0.12))",
        blendMode: "color",
        dot: "#e4e7e7",
        border: "#cfd3d3",
        toneLabel: "Plata 925 Fina",
      };
    case "plata-950":
      return {
        id: "plata-950",
        filter: "grayscale(0.92) brightness(1.15) contrast(1.06)",
        overlayGradient: "linear-gradient(135deg, rgba(240, 245, 246, 0.25), rgba(215, 225, 228, 0.15))",
        blendMode: "color",
        dot: "#eff2f2",
        border: "#d8dddd",
        toneLabel: "Plata Ley 950",
      };
    case "oro-18k-blanco":
    case "oro-blanco-18k":
      return {
        id: "oro-18k-blanco",
        filter: "grayscale(0.85) brightness(1.08) contrast(1.10)",
        overlayGradient: "linear-gradient(135deg, rgba(235, 240, 242, 0.20), rgba(210, 218, 222, 0.14))",
        blendMode: "color",
        dot: "#e8eaeb",
        border: "#c2c7c8",
        toneLabel: "Oro 18k Blanco",
      };
    case "platino":
      return {
        id: "platino",
        filter: "grayscale(0.96) brightness(1.03) contrast(1.14)",
        overlayGradient: "linear-gradient(135deg, rgba(217, 221, 222, 0.22), rgba(180, 188, 192, 0.16))",
        blendMode: "color",
        dot: "#d9ddde",
        border: "#a8b1b4",
        toneLabel: "Platino Puro",
      };
    case "oro-18k-amarillo":
    case "oro-amarillo-18k":
      return {
        id: "oro-18k-amarillo",
        filter: "sepia(0.72) saturate(2.4) hue-rotate(12deg) brightness(1.05) contrast(1.04)",
        overlayGradient: "linear-gradient(135deg, rgba(246, 219, 141, 0.32), rgba(215, 179, 85, 0.22))",
        blendMode: "color",
        dot: "#f6db8d",
        border: "#d7b355",
        toneLabel: "Oro 18k Amarillo",
      };
    case "oro-18k-natural":
    case "oro-natural-18k":
      return {
        id: "oro-18k-natural",
        filter: "sepia(0.52) saturate(1.65) hue-rotate(358deg) brightness(1.03) contrast(1.03)",
        overlayGradient: "linear-gradient(135deg, rgba(226, 190, 130, 0.28), rgba(201, 161, 95, 0.18))",
        blendMode: "color",
        dot: "#e2be82",
        border: "#c9a15f",
        toneLabel: "Oro 18k Natural",
      };
    case "oro-18k-rosa":
    case "oro-rosa-18k":
      return {
        id: "oro-18k-rosa",
        filter: "sepia(0.54) saturate(1.8) hue-rotate(320deg) brightness(1.0) contrast(1.05)",
        overlayGradient: "linear-gradient(135deg, rgba(247, 199, 178, 0.30), rgba(220, 161, 136, 0.22))",
        blendMode: "color",
        dot: "#f7c7b2",
        border: "#dca188",
        toneLabel: "Oro 18k Rosa",
      };
    case "plata-950-oro-amarillo":
      return {
        id: "plata-950-oro-amarillo",
        filter: "sepia(0.40) saturate(1.45) hue-rotate(10deg) brightness(1.06) contrast(1.04)",
        overlayGradient: "linear-gradient(135deg, rgba(239, 242, 242, 0.28) 45%, rgba(246, 219, 141, 0.32) 55%)",
        blendMode: "color",
        dot: "linear-gradient(135deg, #eff2f2 50%, #f6db8d 50%)",
        border: "#cbb779",
        toneLabel: "Plata 950 con Oro 18k Amarillo",
      };
    case "plata-950-oro-rosa":
      return {
        id: "plata-950-oro-rosa",
        filter: "sepia(0.32) saturate(1.35) hue-rotate(325deg) brightness(1.04) contrast(1.04)",
        overlayGradient: "linear-gradient(135deg, rgba(239, 242, 242, 0.28) 45%, rgba(247, 199, 178, 0.30) 55%)",
        blendMode: "color",
        dot: "linear-gradient(135deg, #eff2f2 50%, #f7c7b2 50%)",
        border: "#cca897",
        toneLabel: "Plata 950 con Oro 18k Rosa",
      };
    case "plata-950-oro-natural":
      return {
        id: "plata-950-oro-natural",
        filter: "sepia(0.30) saturate(1.30) hue-rotate(0deg) brightness(1.05) contrast(1.03)",
        overlayGradient: "linear-gradient(135deg, rgba(239, 242, 242, 0.28) 45%, rgba(226, 190, 130, 0.28) 55%)",
        blendMode: "color",
        dot: "linear-gradient(135deg, #eff2f2 50%, #e2be82 50%)",
        border: "#c9ba9b",
        toneLabel: "Plata 950 con Oro 18k Natural",
      };
    default:
      return {
        id: metalId || "default",
        filter: "none",
        overlayGradient: null,
        blendMode: "normal",
        dot: "#e8eaeb",
        border: "#c2c7c8",
        toneLabel: "Metal Natural",
      };
  }
};
