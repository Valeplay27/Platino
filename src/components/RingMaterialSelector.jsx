import { useState } from "react";
import { getAssetUrl } from "../utils/assetHelper";

// Lista de materiales con su imagen correspondiente y color de muestra
const RING_MATERIALS = [
  {
    id: "oro-blanco",
    name: "Oro 18k Blanco",
    color: "#e8eaeb",
    border: "#c2c7c8",
    imageUrl: getAssetUrl("/images/ring-render.png"),
  },
  {
    id: "oro-amarillo",
    name: "Oro 18k Amarillo",
    color: "#f6db8d",
    border: "#d7b355",
    imageUrl: getAssetUrl("/images/anillo-9-promesas.jpg"),
  },
  {
    id: "oro-rosa",
    name: "Oro 18k Rosa",
    color: "#f7c7b2",
    border: "#dca188",
    imageUrl: getAssetUrl("/images/aros-trial.jpg"),
  },
  {
    id: "plata-925",
    name: "Plata 925",
    color: "#e4e7e7",
    border: "#cfd3d3",
    imageUrl: getAssetUrl("/images/cat-compromiso.jpg"),
  },
];

export default function RingMaterialSelector() {
  // 1. Estado para almacenar la URL de la fotografía principal del anillo
  const [mainImage, setMainImage] = useState(RING_MATERIALS[0].imageUrl);
  
  // Estado opcional para identificar qué material está seleccionado actualmente
  const [selectedMaterial, setSelectedMaterial] = useState(RING_MATERIALS[0]);

  // Manejador para actualizar la imagen al hacer clic en un material
  const handleMaterialSelect = (material) => {
    setMainImage(material.imageUrl);
    setSelectedMaterial(material);
  };

  return (
    <div style={containerStyle}>
      {/* 2. Visualizador de la fotografía principal del anillo */}
      <div style={imageWrapperStyle}>
        <img
          src={mainImage}
          alt={`Anillo en ${selectedMaterial.name}`}
          style={imageStyle}
        />
        <div style={badgeStyle}>
          <span>Material actual: <strong>{selectedMaterial.name}</strong></span>
        </div>
      </div>

      {/* 3. Botones de selección de material */}
      <div style={selectorContainerStyle}>
        <p style={labelStyle}>Selecciona el Material:</p>
        
        <div style={buttonsRowStyle}>
          {RING_MATERIALS.map((material) => {
            const isSelected = selectedMaterial.id === material.id;
            return (
              <button
                key={material.id}
                type="button"
                onClick={() => handleMaterialSelect(material)}
                style={{
                  ...buttonStyle,
                  backgroundColor: isSelected ? "var(--platino-green-dark, #0a271f)" : "#ffffff",
                  color: isSelected ? "#ffffff" : "#17241e",
                  borderColor: isSelected ? "var(--platino-green-dark, #0a271f)" : "#d9d4c9",
                  transform: isSelected ? "translateY(-2px)" : "none",
                  boxShadow: isSelected
                    ? "0 4px 14px rgba(10, 39, 31, 0.25)"
                    : "0 2px 6px rgba(0, 0, 0, 0.04)",
                }}
                aria-label={`Seleccionar ${material.name}`}
              >
                {/* Muestra circular de color */}
                <span
                  style={{
                    ...swatchCircleStyle,
                    background: material.color,
                    borderColor: material.border,
                  }}
                />
                <span>{material.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Estilos visuales en línea para portabilidad directa y diseño moderno
const containerStyle = {
  maxWidth: "520px",
  margin: "24px auto",
  padding: "24px",
  backgroundColor: "#fcfbf9",
  borderRadius: "20px",
  border: "1px solid #ebe6dc",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const imageWrapperStyle = {
  position: "relative",
  width: "100%",
  aspectRatio: "1 / 1",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #f0ece3",
};

const imageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transition: "all 0.35s ease-in-out",
};

const badgeStyle = {
  position: "absolute",
  bottom: "12px",
  left: "12px",
  backgroundColor: "rgba(10, 39, 31, 0.88)",
  color: "#ffffff",
  padding: "6px 14px",
  borderRadius: "9999px",
  fontSize: "12px",
  backdropFilter: "blur(6px)",
};

const selectorContainerStyle = {
  marginTop: "20px",
  textAlign: "center",
};

const labelStyle = {
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#5b665f",
  margin: "0 0 12px 0",
};

const buttonsRowStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  justifyContent: "center",
};

const buttonStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 18px",
  borderRadius: "9999px",
  border: "1.5px solid #d9d4c9",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "600",
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  outline: "none",
};

const swatchCircleStyle = {
  width: "14px",
  height: "14px",
  borderRadius: "50%",
  border: "1.5px solid transparent",
  display: "inline-block",
  flexShrink: 0,
};
