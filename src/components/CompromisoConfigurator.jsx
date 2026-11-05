import { useState, useEffect, useMemo } from "react";
import { formatPrice } from "../data/products";
import { DAMA_SIZES } from "../services/inventoryService";
import { DiamondCutIcon } from "./GemstoneIcons";
import { getAssetUrl } from "../utils/assetHelper";

export const COMPROMISO_GEM_TYPES = [
  {
    id: "zirconita",
    name: "Zirconita",
    subtitle: "Gema base clásica",
    certificateBadge: null,
    priceDelta: 0,
  },
  {
    id: "zirconita-swarovski",
    name: "Zirconita Swarovski",
    subtitle: "Brillo extra suizo",
    certificateBadge: null,
    priceDelta: 80,
  },
  {
    id: "moissanita",
    name: "Moissanita",
    subtitle: "Dureza 9.25 y fuego supremo",
    certificateBadge: "Certificado GRA",
    priceDelta: 350,
  },
  {
    id: "diamante-lab",
    name: "Diamante Lab Grown",
    subtitle: "100% Diamante Real Ecológico",
    certificateBadge: "Certificado IGI",
    priceDelta: 1200,
  },
  {
    id: "diamante-natural",
    name: "Diamante Natural",
    subtitle: "Gema Preciosa Eterna",
    certificateBadge: "Certificado GIA",
    priceDelta: 2800,
  },
];

export function getProductGemTypes(product) {
  const customPrices = product?.gemTypePrices || {};
  return COMPROMISO_GEM_TYPES.map((gem) => {
    // La zirconita es la gema base estándar incluida en el precio base de la joya (siempre delta 0)
    if (gem.id === "zirconita") {
      return {
        ...gem,
        priceDelta: 0,
        subtitle: "Gema base clásica",
      };
    }
    const custom = customPrices[gem.id];
    const priceDelta =
      custom !== undefined && custom !== "" && !isNaN(Number(custom))
        ? Number(custom)
        : gem.priceDelta;
    return {
      ...gem,
      priceDelta,
      subtitle: gem.subtitle || null,
    };
  });
}

export default function CompromisoConfigurator({
  product = {},
  selectedMetal = { name: "Plata 950", id: "plata-950" },
  handleSelectMetal = () => {},
  currentMetalPrice = 0,
  selectedSizeDama = "asesor",
  setSelectedSizeDama = () => {},
  hasEngraving = false,
  setHasEngraving = () => {},
  engravingText = "",
  setEngravingText = () => {},
  selectedGemType = COMPROMISO_GEM_TYPES[0],
  setSelectedGemType = () => {},
  selectedPresentation = "caja-verde-lujo",
  setSelectedPresentation = () => {},
  selectedPresentationObj = { name: "Caja de Lujo Esmeralda Platino (Recomendado)", price: 0 },
  presentationOptionsList = [],
  setMainImage = () => {},
  handleGoBack = () => {},
  totalPrice = 0,
  onAddToCart = () => {},
  currentStep: propCurrentStep,
  setCurrentStep: propSetCurrentStep,
}) {
  const [localStep, setLocalStep] = useState(1);
  const currentStep = propCurrentStep !== undefined ? propCurrentStep : localStep;
  const setCurrentStep = propSetCurrentStep !== undefined ? propSetCurrentStep : setLocalStep;
  const [modalOpen, setModalOpen] = useState(false);

  // Al llegar al paso 3, mostrar la caja en el visor principal de la izquierda
  useEffect(() => {
    if (currentStep === 3) {
      if (selectedPresentationObj?.image) {
        setMainImage(getAssetUrl(selectedPresentationObj.image));
      }
    }
  }, [currentStep, selectedPresentationObj?.image, setMainImage]);

  const gemTypes = useMemo(() => getProductGemTypes(product), [product]);

  // Sincronizar el priceDelta del selectedGemType si cambia el producto
  useEffect(() => {
    if (selectedGemType?.id && gemTypes.length > 0) {
      const match = gemTypes.find((g) => g.id === selectedGemType.id);
      if (match && match.priceDelta !== selectedGemType.priceDelta) {
        setSelectedGemType(match);
      }
    }
  }, [gemTypes, selectedGemType?.id, selectedGemType?.priceDelta, setSelectedGemType]);

  const gemCutLabel = useMemo(() => {
    const cutName = (product?.gemShape || "REDONDO").toUpperCase();
    const dimensions = product?.gemDimensions || "6.0mm";
    return `CORTE ${cutName} | ${dimensions}`;
  }, [product?.gemShape, product?.gemDimensions]);

  const productName = product?.name || "Anillo de Compromiso";
  const metalName = selectedMetal?.name || product?.availableMetals?.[0]?.name || "Plata 950";
  const gemName = selectedGemType?.name || "Zirconita";

  const getWhatsAppOrderUrl = () => {
    const sizeStr = selectedSizeDama === "asesor" ? "Solicita Asesoramiento de Medida" : `${selectedSizeDama} Nacional`;
    const cofreStr = selectedPresentationObj?.name?.replace(/ \(Recomendado\)/i, "")?.replace(/ \(Incluido de Cortesía\)/i, "") || "Classic";
    const engravingStr = hasEngraving ? (engravingText ? `Si (${engravingText})` : "Si") : "No";

    const text = `¡Hola Platino Perú! Deseo realizar el pedido de este anillo de compromiso personalizado:%0A%0A` +
      `*Producto:* ${productName}%0A` +
      `*Metal:* ${metalName}%0A` +
      `*Pedrería:* ${gemName}%0A` +
      `*Talla:* ${sizeStr}%0A` +
      `*Cofre:* ${cofreStr}%0A` +
      `*Grabado interno:* ${engravingStr}%0A` +
      `*Total:* ${formatPrice(totalPrice)}%0A%0A` +
      `¿Podrían confirmarme la disponibilidad y cómo procedemos?`;

    return `https://wa.me/51927357217?text=${text}`;
  };

  const getSizeAdviceWhatsAppUrl = () => {
    const text = `¡Hola Platino Perú! Deseo recibir asesoramiento sobre la medida y talla exacta para el anillo *${productName}* en ${metalName}.`;
    return `https://wa.me/51927357217?text=${encodeURIComponent(text)}`;
  };

  const cofrePrice = Number(selectedPresentationObj?.price || 0);
  const ringPrice = totalPrice > cofrePrice ? (totalPrice - cofrePrice) : (currentMetalPrice + (selectedGemType?.priceDelta || 0));

  const handleFinalizePurchase = () => {
    if (onAddToCart) {
      onAddToCart();
    }
    setModalOpen(false);
  };

  return (
    <div className="compromiso-configurator-wrapper">
      {/* ========================================================
          PASO 1 DE 3: SELECCIÓN DE METAL, TALLA DAMA Y GRABADO
          ======================================================== */}
      {currentStep === 1 && (
        <div className="step-pane step-pane-1">
          <div className="step-progress-inline">
            <span className="step-progress-tag">PASO 1 DE 3</span>
            <div className="step-progress-line"></div>
          </div>

          {/* 1. SELECCIÓN DE METAL */}
          {(() => {
            const metalsList = (Array.isArray(product?.availableMetals) && product.availableMetals.length > 0)
              ? product.availableMetals
              : [
                  { id: "plata-950", name: "Plata 950", color: "#e4e7e7", border: "#cfd3d3" },
                  { id: "oro-18k-amarillo", name: "Oro Amarillo 18k", color: "#ecc435", border: "#d4aa18" },
                  { id: "oro-18k-rosa", name: "Oro Rosado 18k", color: "#e29438", border: "#c47a24" },
                  { id: "oro-18k-blanco", name: "Oro Blanco 18k", color: "#eb96c9", border: "#d475ad" },
                ];
            return (
              <div className="config-block-clean" style={{ marginBottom: "34px" }}>
                <div className="config-block-header-inline">
                  <span className="config-block-title-bold">SELECCIÓN DE METAL</span>
                  <span className="config-block-value-text">{metalName}</span>
                </div>

                <div className="metal-swatches-row">
                  {metalsList.map((metal) => {
                    const isSel = selectedMetal?.id === metal.id;
                    return (
                      <button
                        key={metal.id}
                        type="button"
                        className={`metal-swatch-circle ${isSel ? "selected" : ""}`}
                        style={{
                          background: metal.color,
                          borderColor: metal.border,
                        }}
                        onClick={() => handleSelectMetal(metal)}
                        title={metal.name}
                        aria-label={`Seleccionar material ${metal.name}`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* 2. TALLA DAMA (05 AL 27) */}
          <div className="config-block-clean">
            <div className="config-block-header-inline">
              <span className="config-block-title-bold">TALLA DAMA (05 AL 27)</span>
            </div>

            <select
              value={selectedSizeDama}
              onChange={(e) => setSelectedSizeDama(e.target.value)}
              className="select-talla-dropdown-clean"
            >
              <option value="asesor">¿No sabes tu talla? Solicitar asesoramiento de medida</option>
              {DAMA_SIZES.map((sz) => (
                <option key={sz.number} value={sz.number}>
                  {sz.label}
                </option>
              ))}
            </select>

            <div className="size-advice-whatsapp-box">
              <div className="size-advice-whatsapp-text">
                <i className="bi bi-question-circle"></i>
                <span>¿No estás seguro de la talla?</span>
              </div>
              <a
                href={getSizeAdviceWhatsAppUrl()}
                target="_blank"
                rel="noreferrer"
                className="btn-size-whatsapp"
              >
                <i className="bi bi-whatsapp"></i>
                <span>ASESORAMIENTO VÍA WHATSAPP</span>
              </a>
            </div>

            <p className="size-price-note">
              *Precio válido de la web: Tallas Americanas (4 al 8) o Tallas Nacionales (8 al 17). Otras medidas consulta para la cotización
            </p>
          </div>

          {/* 3. GRABADO PERSONALIZADO */}
          <div className="engraving-custom-card">
            <div className="engraving-custom-row">
              <span className="engraving-custom-label">
                <i className="bi bi-pencil-square" style={{ color: "#c5a059", fontSize: "16px" }}></i>
                <span>¿Deseas agregar grabado personalizado a tu joya?</span>
              </span>
              <div className="engraving-switch-pill">
                <button
                  type="button"
                  className={`switch-option ${hasEngraving ? "active" : ""}`}
                  onClick={() => setHasEngraving(true)}
                >
                  SÍ
                </button>
                <button
                  type="button"
                  className={`switch-option ${!hasEngraving ? "active" : ""}`}
                  onClick={() => setHasEngraving(false)}
                >
                  NO
                </button>
              </div>
            </div>

            {hasEngraving && (
              <div className="engraving-input-box">
                <input
                  type="text"
                  placeholder="Texto para el grabado (Ej: A & M 24.10.25)"
                  value={engravingText}
                  onChange={(e) => setEngravingText(e.target.value)}
                  maxLength={30}
                  className="engraving-text-input"
                />
                <div className="engraving-hint">
                  <i className="bi bi-info-circle"></i>
                  <span>El texto y la tipografía final se confirmarán directamente con tu asesor por WhatsApp.</span>
                </div>
              </div>
            )}
          </div>

          {/* BOTONES NAVEGACIÓN PASO 1 */}
          <div className="wizard-step-dual-actions-clean">
            <button
              type="button"
              className="btn-wizard-back-outline"
              onClick={handleGoBack}
              title="Volver atrás"
            >
              <i className="bi bi-chevron-left"></i>
              <span>Volver Atrás</span>
            </button>

            <button
              type="button"
              className="btn-wizard-forward-solid"
              onClick={() => {
                setCurrentStep(2);
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
            >
              <span>CONTINUAR A PASO 2: SELECCIÓN DE GEMA</span>
              <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          PASO 2 DE 3: SELECCIÓN DE GEMA (SILUETA Y TIPO DE GEMA)
          ======================================================== */}
      {currentStep === 2 && (
        <div className="step-pane step-pane-2">
          <div className="step-progress-inline">
            <span className="step-progress-tag">PASO 2 DE 3</span>
            <div className="step-progress-line"></div>
          </div>

          <div className="config-block-header-inline">
            <span className="config-block-title-bold">SELECCIÓN DE GEMA</span>
            <span className="config-block-value-text">{gemName}</span>
          </div>

          <div className="gem-types-grid">
            {gemTypes.map((gem) => {
              const isSel = selectedGemType?.id === gem.id;
              return (
                <div
                  key={gem.id}
                  className={`gem-type-card ${isSel ? "selected" : ""}`}
                  onClick={() => setSelectedGemType(gem)}
                >
                  <div className="gem-type-icon">
                    <DiamondCutIcon shape={product?.gemShape || "redondo"} size={30} />
                  </div>
                  <div className="gem-type-cut-strip">
                    {gemCutLabel}
                  </div>
                  <h4 className="gem-type-name">{gem.name}</h4>
                  {gem.subtitle && <span className="gem-type-subtitle">{gem.subtitle}</span>}
                  {gem.certificateBadge && (
                    <span className="gem-type-cert-badge">{gem.certificateBadge}</span>
                  )}
                  {/* Precio oculto en la tarjeta de gemas */}
                </div>
              );
            })}
          </div>

          {/* BOTONES NAVEGACIÓN PASO 2 */}
          <div className="wizard-step-dual-actions-clean">
            <button
              type="button"
              className="btn-wizard-back-outline"
              onClick={() => {
                setCurrentStep(1);
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
            >
              <i className="bi bi-chevron-left"></i>
              <span>Volver Atrás</span>
            </button>

            <button
              type="button"
              className="btn-wizard-forward-solid"
              onClick={() => {
                setCurrentStep(3);
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
            >
              <span>CONTINUAR A PASO 3: COMPLEMENTOS Y ESTUCHE</span>
              <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          PASO 3 DE 3: CORTESÍA PLATINO PERÚ Y PRESENTACIÓN
          ======================================================== */}
      {currentStep === 3 && (
        <div className="step-pane step-pane-3">
          <div className="step-progress-inline">
            <span className="step-progress-tag">PASO 3 DE 3</span>
            <div className="step-progress-line"></div>
          </div>

          {/* CORTESÍA PLATINO PERÚ */}
          <div className="cortesia-platino-section">
            <h4 className="cortesia-platino-title">CORTESÍA PLATINO PERÚ</h4>
            <ul className="cortesia-platino-list">
              <li><span className="bullet-gold">●</span> Mantenimiento profesional</li>
              <li><span className="bullet-gold">●</span> Certificado de Garantía</li>
              <li><span className="bullet-gold">●</span> Asesoría de toma de talla</li>
              <li><span className="bullet-gold">●</span> Paño de cuidado premium</li>
              <li><span className="bullet-gold">●</span> Presentación de regalo de la marca</li>
            </ul>
          </div>

          {/* ELIGE TU PRESENTACIÓN Y ESTUCHE */}
          <div className="presentation-select-section">
            <h4 className="presentation-section-title">ELIGE TU PRESENTACIÓN Y ESTUCHE</h4>
            <select
              value={selectedPresentation}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedPresentation(val);
                const found = presentationOptionsList.find((opt) => opt.id === val);
                if (found?.image) {
                  setMainImage(getAssetUrl(found.image));
                }
              }}
              className="select-presentation-dropdown-clean"
            >
              {presentationOptionsList.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name} {opt.price > 0 ? `(+S/. ${opt.price})` : "(Incluido de Cortesía)"}
                </option>
              ))}
            </select>

            <div className="presentation-preview-card">
              <div className="presentation-preview-thumb-wrap presentation-preview-img-box">
                <img
                  src={getAssetUrl(selectedPresentationObj?.image || "/images/detail-box-green.jpg")}
                  alt={selectedPresentationObj?.name || "Estuche Platino"}
                  className="presentation-preview-thumb presentation-preview-img"
                />
                <span className={`presentation-preview-tag ${(selectedPresentationObj?.price || 0) > 0 ? "extra" : "free"}`}>
                  {(selectedPresentationObj?.price || 0) > 0 ? `+S/. ${selectedPresentationObj.price}` : "Incluido de Cortesía"}
                </span>
              </div>
              <div className="presentation-preview-body presentation-preview-info">
                <div className="presentation-preview-title-row">
                  <i className="bi bi-box-seam" style={{ color: "#c5a059", fontSize: "15px" }}></i>
                  <strong className="presentation-preview-title">{selectedPresentationObj?.name || "Caja Platino"}</strong>
                </div>
                <p className="presentation-preview-desc">
                  {selectedPresentationObj?.description || "Estuche rígido icónico verde esmeralda Platino con interior de gamuza aterciopelada y detalles dorados."}
                </p>
                <button
                  type="button"
                  className="btn-view-preview-main btn-view-box-main"
                  onClick={() => {
                    if (selectedPresentationObj?.image) {
                      setMainImage(getAssetUrl(selectedPresentationObj.image));
                    }
                  }}
                  title="Ver fotografía de la caja en el visor principal"
                >
                  <i className="bi bi-eye"></i>
                  <span>Ver en visor principal</span>
                </button>
              </div>
            </div>
          </div>

          {/* BOTONES NAVEGACIÓN PASO 3 */}
          <div className="wizard-step-trio-actions-clean">
            <button
              type="button"
              className="btn-trio-back btn-wizard-back-outline"
              onClick={() => {
                setCurrentStep(2);
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
            >
              <i className="bi bi-arrow-left"></i>
              <span>Volver a Características</span>
            </button>

            <button
              type="button"
              className="btn-trio-summary btn-wizard-summary-pill"
              onClick={() => setModalOpen(true)}
            >
              <span>VER RESUMEN</span>
            </button>

            <button
              type="button"
              className="btn-trio-finalize btn-wizard-finalize-pill"
              onClick={() => {
                if (onAddToCart) {
                  onAddToCart();
                }
                setModalOpen(true);
              }}
            >
              <i className="bi bi-bag"></i>
              <span>FINALIZAR COMPRA</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: RESUMEN DE PERSONALIZACIÓN (EXACTO A FOTO 4)
          ======================================================== */}
      {modalOpen && (
        <div
          className="summary-modal-overlay"
          onClick={() => setModalOpen(false)}
        >
          <div className="summary-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="summary-modal-close"
              onClick={() => setModalOpen(false)}
              title="Cerrar resumen"
            >
              <i className="bi bi-x-lg"></i>
            </button>

            <span className="summary-modal-tag">RESUMEN DE PERSONALIZACIÓN</span>
            <h3 className="summary-modal-title">
              {productName.toLowerCase().includes("compromiso") || productName.toLowerCase().includes("promesa")
                ? productName
                : `Anillo de compromiso ${metalName.replace(/ Ley \d+/i, "")} | ${productName}`}
            </h3>

            <div className="summary-details-box">
              <div className="summary-detail-row">
                <span className="summary-lbl">Metal:</span>
                <span className="summary-val">{metalName}</span>
              </div>
              <div className="summary-detail-row">
                <span className="summary-lbl">Pedrería:</span>
                <span className="summary-val">{gemName}</span>
              </div>
              <div className="summary-detail-row">
                <span className="summary-lbl">Talla:</span>
                <span className="summary-val">
                  {selectedSizeDama === "asesor" ? "Asesoramiento de Medida" : `${selectedSizeDama} Nacional`}
                </span>
              </div>
              <div className="summary-detail-row">
                <span className="summary-lbl">Cofre:</span>
                <span className="summary-val">
                  {selectedPresentationObj?.name?.replace(/ \(Recomendado\)/i, "")?.replace(/ \(Incluido de Cortesía\)/i, "") || "Classic"}
                  {cofrePrice > 0 ? (
                    <span style={{ color: "#c5a059", fontWeight: "700", marginLeft: "6px" }}>
                      (+{formatPrice(cofrePrice)})
                    </span>
                  ) : (
                    <span style={{ color: "#166534", fontWeight: "600", marginLeft: "6px", fontSize: "11.5px" }}>
                      (Incluido)
                    </span>
                  )}
                </span>
              </div>
              <div className="summary-detail-row" style={{ marginTop: "4px" }}>
                <span className="summary-lbl">Grabado interno:</span>
                <span className="summary-val" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>{hasEngraving ? "Si" : "No"}</span>
                  {hasEngraving && engravingText && (
                    <span className="summary-engraving-pill">{engravingText}</span>
                  )}
                </span>
              </div>

              <div className="summary-divider"></div>

              {/* Desglose de los valores que paga la persona: Anillo y Cofre */}
              <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "10px", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#475467" }}>1. Anillo de compromiso ({metalName}):</span>
                  <span style={{ fontWeight: "700", color: "#113B3A" }}>{formatPrice(ringPrice)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#475467" }}>
                    2. Cofre ({selectedPresentationObj?.name?.replace(/ \(Recomendado\)/i, "")?.replace(/ \(Incluido de Cortesía\)/i, "")}):
                  </span>
                  <span style={{ fontWeight: "700", color: cofrePrice > 0 ? "#c5a059" : "#166534" }}>
                    {cofrePrice > 0 ? `+${formatPrice(cofrePrice)}` : "Incluido (S/. 0)"}
                  </span>
                </div>
              </div>

              <div className="summary-total-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed #e5ded2", paddingTop: "8px" }}>
                <span className="summary-total-lbl">Total:</span>
                <span className="summary-total-val">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <div className="summary-modal-actions">
              <a
                href={getWhatsAppOrderUrl()}
                target="_blank"
                rel="noreferrer"
                className="btn-modal-whatsapp"
              >
                <i className="bi bi-whatsapp" style={{ fontSize: "16px" }}></i>
                <span>REALIZAR PEDIDO VIA WHATSAPP</span>
              </a>

              <button
                type="button"
                className="btn-modal-finalize"
                onClick={handleFinalizePurchase}
              >
                FINALIZAR COMPRA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
