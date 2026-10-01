import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  formatPrice,
  RING_SIZES,
  GEM_SHAPES_PRODUCT,
  FAQS,
} from "../data/products";
import { getProductById, getCatalogProducts } from "../services/catalogService";
import { getAssetUrl } from "../utils/assetHelper";
import "../../styles/product.css";

export default function Product({ addToCart }) {
  const { productId } = useParams();
  const product = getProductById(productId) || getCatalogProducts()[0];

  // Estado del flujo de pasos
  const [currentStep, setCurrentStep] = useState(1);

  // Galería de imágenes
  const galleryImages = product.gallery && product.gallery.length > 0
    ? product.gallery
    : [product.image];
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  // Configuración de la joya
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedMetal, setSelectedMetal] = useState(
    product.availableMetals?.[0] || { name: product.selectedMetal || "Oro Amarillo 18k", id: "oro" }
  );

  // Tallas
  const [selectedSizeDama, setSelectedSizeDama] = useState(RING_SIZES[1].id);
  const [selectedSizeVaron, setSelectedSizeVaron] = useState(RING_SIZES[1].id);
  const [selectedSizeRing, setSelectedSizeRing] = useState(RING_SIZES[2].id);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Gemas
  const [selectedGemShape, setSelectedGemShape] = useState(
    GEM_SHAPES_PRODUCT[0]
  );

  // Presentación / Platino Care
  const [selectedPresentation, setSelectedPresentation] = useState(
    product.presentationOptions?.[0]?.id || "caja-verde-lujo"
  );
  const [platinoCarePlan, setPlatinoCarePlan] = useState("cortesia"); // 'cortesia' o 'plus'
  const [openCareAccordion, setOpenCareAccordion] = useState(null);

  // Acordeón de FAQs
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Modal de resumen / confirmación
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);

  const isAccesorio = product.type === "accesorio";
  const isAros = product.type === "aros";
  const isAnillo = product.type === "anillo";

  // Navegación de slider
  const handlePrevImg = () => {
    setActiveImageIdx((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };
  const handleNextImg = () => {
    setActiveImageIdx((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const toggleCareAccordion = (idx) => {
    setOpenCareAccordion(openCareAccordion === idx ? null : idx);
  };

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const handleChooseFeatures = () => {
    setSummaryModalOpen(true);
  };

  const getWhatsAppMessageUrl = () => {
    const text = `¡Hola Platino Perú! Estoy interesado en cotizar esta joya:%0A%0A*Producto:* ${product.name}%0A*Metal seleccionado:* ${selectedMetal.name}%0A${
      isAros
        ? `*Talla Dama:* ${RING_SIZES.find((s) => s.id === selectedSizeDama)?.label}%0A*Talla Varón:* ${RING_SIZES.find((s) => s.id === selectedSizeVaron)?.label}%0A`
        : !isAccesorio
        ? `*Talla:* ${RING_SIZES.find((s) => s.id === selectedSizeRing)?.label}%0A`
        : ""
    }${
      product.hasGemSelection
        ? `*Forma de Gema:* ${selectedGemShape.name}%0A`
        : ""
    }*Precio:* ${formatPrice(product.price)}%0A%0A¿Podrían brindarme mayor información o agendar una cita para verla?`;

    return `https://wa.me/51999000000?text=${text}`;
  };

  return (
    <div className="product-detail-page">
      {/* ========================================================
          1. BARRA DE PASOS SUPERIOR (CONFIGURATOR HEADER)
          ======================================================== */}
      <nav className="configurator-steps-header" aria-label="Progreso de configuración">
        <div className="configurator-steps-container">
          <div className="configurator-brand-tag">
            <i className="bi bi-gem"></i>
            <span>{isAccesorio ? "Elige tu modelo" : "Diseña tu anillo"}</span>
          </div>

          <div className="configurator-steps-list">
            {isAccesorio ? (
              <>
                <div
                  className={`config-step-item ${currentStep === 1 ? "active" : ""}`}
                  onClick={() => setCurrentStep(1)}
                >
                  <span className="config-step-number">1</span>
                  <div className="config-step-info">
                    <span className="config-step-title">SELECCIÓN DE DISEÑO</span>
                    <span className="config-step-sub">{product.name}</span>
                  </div>
                </div>

                <div
                  className={`config-step-item ${currentStep === 2 ? "active" : ""}`}
                  onClick={() => setCurrentStep(2)}
                >
                  <span className="config-step-number">2</span>
                  <div className="config-step-info">
                    <span className="config-step-title">ELIGE LA PRESENTACIÓN</span>
                    <span className="config-step-sub">Estuche y Empaque</span>
                  </div>
                </div>
              </>
            ) : isAros && !product.hasGemSelection ? (
              <>
                <div
                  className={`config-step-item ${currentStep === 1 ? "active" : ""}`}
                  onClick={() => setCurrentStep(1)}
                >
                  <span className="config-step-number">1</span>
                  <div className="config-step-info">
                    <span className="config-step-title">Características</span>
                    <span className="config-step-sub">{product.name}</span>
                  </div>
                  <i className="bi bi-circle config-step-icon"></i>
                </div>

                <div
                  className={`config-step-item ${currentStep === 2 ? "active" : ""}`}
                  onClick={() => setCurrentStep(2)}
                >
                  <span className="config-step-number">2</span>
                  <div className="config-step-info">
                    <span className="config-step-title">Complementos</span>
                    <span className="config-step-sub">Platino Care</span>
                  </div>
                  <i className="bi bi-shield-check config-step-icon"></i>
                </div>
              </>
            ) : (
              <>
                <div
                  className={`config-step-item ${currentStep === 1 ? "active" : ""}`}
                  onClick={() => setCurrentStep(1)}
                >
                  <span className="config-step-number">1</span>
                  <div className="config-step-info">
                    <span className="config-step-title">Características</span>
                    <span className="config-step-sub">{product.name}</span>
                  </div>
                  <i className="bi bi-circle config-step-icon"></i>
                </div>

                <div
                  className={`config-step-item ${currentStep === 2 ? "active" : ""}`}
                  onClick={() => setCurrentStep(2)}
                >
                  <span className="config-step-number">2</span>
                  <div className="config-step-info">
                    <span className="config-step-title">Elige tu Gema</span>
                    <span className="config-step-sub">{selectedGemShape.name}</span>
                  </div>
                  <i className="bi bi-gem config-step-icon"></i>
                </div>

                <div
                  className={`config-step-item ${currentStep === 3 ? "active" : ""}`}
                  onClick={() => setCurrentStep(3)}
                >
                  <span className="config-step-number">3</span>
                  <div className="config-step-info">
                    <span className="config-step-title">Complementos</span>
                    <span className="config-step-sub">Platino Care & Estuche</span>
                  </div>
                  <i className="bi bi-box-seam config-step-icon"></i>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ========================================================
          2. DETALLE PRINCIPAL DEL PRODUCTO (2 COLUMNAS)
          ======================================================== */}
      <section className="product-main-container">
        {/* Columna Izquierda: Galería */}
        <div className="product-gallery-side">
          {/* Miniaturas verticales */}
          <div className="product-thumbnails-col">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                className={`thumb-btn ${activeImageIdx === idx ? "active" : ""}`}
                onClick={() => setActiveImageIdx(idx)}
                aria-label={`Ver vista ${idx + 1}`}
              >
                <img src={img} alt={`Miniatura ${idx + 1}`} />
              </button>
            ))}
          </div>

          {/* Imagen Grande Central */}
          <div className="product-main-img-box">
            <img
              src={galleryImages[activeImageIdx]}
              alt={product.name}
              className="product-main-img"
            />

            {/* Botón Zoom */}
            <button
              type="button"
              className="gallery-zoom-btn"
              onClick={() => setZoomOpen(true)}
              title="Ampliar imagen"
            >
              <i className="bi bi-arrows-angle-expand"></i>
            </button>

            {/* Sello Platino Perú */}
            <div className="gallery-brand-stamp">
              <span>Platino Perú</span>
            </div>

            {/* Flechas de navegación */}
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="gallery-nav-arrow prev"
                  onClick={handlePrevImg}
                  aria-label="Imagen anterior"
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                <button
                  type="button"
                  className="gallery-nav-arrow next"
                  onClick={handleNextImg}
                  aria-label="Imagen siguiente"
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </>
            )}

            {/* Badge de la foto */}
            {product.badge && (
              <div className="gallery-badge-overlay">{product.badge}</div>
            )}

            {/* Sello Dorado P */}
            <div className="gallery-gold-p-stamp">P</div>
          </div>
        </div>

        {/* Columna Derecha: Configurador */}
        <div className="product-config-side">
          <div className="config-header-row">
            <p className="config-product-subtitle">{product.subtitle}</p>
            <h1 className="config-product-title">{product.name}</h1>

            <div className="config-price-row">
              <span className="config-product-price">
                {formatPrice(product.price)}
              </span>

              <button
                type="button"
                className={`btn-favoritos ${isFavorite ? "active" : ""}`}
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <i className={isFavorite ? "bi bi-star-fill" : "bi bi-star"}></i>
                {isFavorite ? "GUARDADO" : "FAVORITOS ★"}
              </button>
            </div>
          </div>

          {/* 1. SELECCIÓN DE METAL */}
          {product.availableMetals && (
            <div className="config-block">
              <div className="config-block-header">
                <span className="config-block-title">Selección de Metal</span>
                <i className="bi bi-chevron-down" style={{ fontSize: "11px" }}></i>
              </div>

              <div className="metal-swatches-row">
                {product.availableMetals.map((metal) => {
                  const isSel = selectedMetal.id === metal.id;
                  return (
                    <div
                      key={metal.id}
                      className={`metal-swatch-circle ${isSel ? "selected" : ""}`}
                      style={{
                        backgroundColor: metal.color,
                        borderColor: metal.border,
                      }}
                      onClick={() => setSelectedMetal(metal)}
                      title={metal.name}
                    />
                  );
                })}
              </div>
              <span className="metal-selected-name">{selectedMetal.name}</span>
            </div>
          )}

          {/* 2. SELECCIÓN DE TALLA */}
          {/* Si es Aros: Doble selector (Talla Dama y Talla Varón) */}
          {isAros ? (
            <div className="config-block">
              <div className="double-sizes-grid">
                <div>
                  <div className="config-block-header">
                    <span className="config-block-title">Seleccionar Talla Dama</span>
                    <button
                      type="button"
                      className="link-guia-tallas"
                      onClick={() => setSizeGuideOpen(true)}
                    >
                      Guía de Tallas
                    </button>
                  </div>
                  <select
                    value={selectedSizeDama}
                    onChange={(e) => setSelectedSizeDama(e.target.value)}
                    className="select-talla-dropdown"
                  >
                    {RING_SIZES.map((sz) => (
                      <option key={sz.id} value={sz.id}>
                        {sz.label} {sz.stock !== "DISPONIBLE" ? `(${sz.stock})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="config-block-header">
                    <span className="config-block-title">Seleccionar Talla Varón</span>
                    <button
                      type="button"
                      className="link-guia-tallas"
                      onClick={() => setSizeGuideOpen(true)}
                    >
                      Guía de Tallas
                    </button>
                  </div>
                  <select
                    value={selectedSizeVaron}
                    onChange={(e) => setSelectedSizeVaron(e.target.value)}
                    className="select-talla-dropdown"
                  >
                    {RING_SIZES.map((sz) => (
                      <option key={sz.id} value={sz.id}>
                        {sz.label} {sz.stock !== "DISPONIBLE" ? `(${sz.stock})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : isAnillo ? (
            /* Si es Anillo: Selector simple con link a guía */
            <div className="config-block">
              <div className="config-block-header">
                <span className="config-block-title">Seleccionar Talla</span>
                <button
                  type="button"
                  className="link-guia-tallas"
                  onClick={() => setSizeGuideOpen(true)}
                >
                  VER GUÍA DE TALLAS
                </button>
              </div>

              <select
                value={selectedSizeRing}
                onChange={(e) => setSelectedSizeRing(e.target.value)}
                className="select-talla-dropdown"
              >
                {RING_SIZES.map((sz) => (
                  <option key={sz.id} value={sz.id}>
                    {sz.label} {sz.stock !== "DISPONIBLE" ? `(${sz.stock})` : ""}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {/* 3. ELIGE LA FORMA DE TU GEMA */}
          {product.hasGemSelection && (
            <div className="config-block">
              <div className="config-block-header">
                <span className="config-block-title">Elige la Forma de tu Gema</span>
                <i className="bi bi-chevron-down" style={{ fontSize: "11px" }}></i>
              </div>

              <div className="gem-shapes-swatches">
                {GEM_SHAPES_PRODUCT.map((shape) => {
                  const isSel = selectedGemShape.id === shape.id;
                  return (
                    <button
                      key={shape.id}
                      type="button"
                      className={`gem-shape-btn ${isSel ? "selected" : ""}`}
                      onClick={() => setSelectedGemShape(shape)}
                      title={shape.name}
                    >
                      <i className={shape.icon}></i>
                    </button>
                  );
                })}
                <button
                  type="button"
                  className="gem-shape-btn more-btn"
                  onClick={() => alert("Mostrando catálogo completo de gemas certificados")}
                  title="Más formas de gemas"
                >
                  +
                </button>
              </div>
              <span className="gem-selected-label">
                {selectedGemShape.name}
                {isAros ? " - Zirconita Incolora 2.0mm / Diamante" : ""}
              </span>
            </div>
          )}

          {/* BOTÓN PRINCIPAL */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              type="button"
              className="btn-elegir-caracteristicas"
              onClick={handleChooseFeatures}
            >
              {isAccesorio ? "ELEGIR JOYA" : "ELEGIR ESTAS CARACTERÍSTICAS"}
            </button>

            <p className="config-delivery-notice">
              Realiza tu pedido hoy, estará listo antes del <strong>Viernes 18 de diciembre</strong>.
              Fecha puede variar dependiendo de la gema elegida.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. SECCIÓN 2: PRESENTACIÓN (ACCESORIO) O PLATINO CARE (ANILLO/AROS)
          ======================================================== */}
      {isAccesorio ? (
        /* Tarjeta ELIGE TU ESTILO (Screenshot 1) */
        <section className="presentacion-section-card">
          <div className="presentacion-card-inner">
            <div className="presentacion-img-box">
              <img
                src={getAssetUrl("/images/box-presentation.jpg")}
                alt="Estuche y Presentación de Lujo Platino Perú"
                className="presentacion-img"
              />
            </div>

            <div className="presentacion-info-box">
              <h2 className="presentacion-title">ELIGE TU ESTILO</h2>
              <p className="presentacion-desc">
                Continúa con tu compra, para poder elegir la caja de regalo que más se acomode a tu momento especial.
              </p>

              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Selecciona tu Presentación ⌄
                </label>
                <select
                  value={selectedPresentation}
                  onChange={(e) => setSelectedPresentation(e.target.value)}
                  className="presentacion-select"
                >
                  {product.presentationOptions?.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name} {opt.price > 0 ? `(+S/. ${opt.price})` : "(Incluido)"}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="btn-continuar-compra"
                onClick={handleChooseFeatures}
              >
                CONTINUAR COMPRA
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* Tarjeta PLATINO CARE (Screenshots 2 y 3) */
        <section className="platino-care-section">
          <div className="platino-care-card">
            <div className="platino-care-img-box">
              <img
                src={getAssetUrl("/images/platino-care-emerald.jpg")}
                alt="Platino Care Joyería Fina"
                className="platino-care-img"
              />
            </div>

            <div className="platino-care-info">
              <h2 className="platino-care-heading">PLATINO CARE</h2>

              <div className="platino-care-accordions">
                {/* 1. Garantía */}
                <div className="care-accordion-item">
                  <button
                    type="button"
                    className="care-accordion-trigger"
                    onClick={() => toggleCareAccordion(1)}
                  >
                    <span>Garantía del material de por vida</span>
                    <i className={openCareAccordion === 1 ? "bi bi-chevron-up" : "bi bi-chevron-down"}></i>
                  </button>
                  {openCareAccordion === 1 && (
                    <div className="care-accordion-content">
                      Certificamos la ley y pureza del Oro 18K y Plata 950 de por vida ante cualquier auditoría gemológica.
                    </div>
                  )}
                </div>

                {/* 2. Mantenimiento */}
                <div className="care-accordion-item">
                  <button
                    type="button"
                    className="care-accordion-trigger"
                    onClick={() => toggleCareAccordion(2)}
                  >
                    <span>Mantenimiento de tu joya</span>
                    <i className={openCareAccordion === 2 ? "bi bi-chevron-up" : "bi bi-chevron-down"}></i>
                  </button>
                  {openCareAccordion === 2 && (
                    <div className="care-accordion-content">
                      Incluye pulido ultrasónico profesional y ajuste periódico de garras para que tus diamantes brillen siempre como el primer día.
                    </div>
                  )}
                </div>

                {/* 3. Entallado gratuito */}
                <div className="care-accordion-item">
                  <button
                    type="button"
                    className="care-accordion-trigger"
                    onClick={() => toggleCareAccordion(3)}
                  >
                    <span>Entallado gratuito (1 sola vez)*</span>
                    <i className={openCareAccordion === 3 ? "bi bi-chevron-up" : "bi bi-chevron-down"}></i>
                  </button>
                  {openCareAccordion === 3 && (
                    <div className="care-accordion-content">
                      Si la medida no es exacta al momento de la entrega, realizamos el ajuste de hasta 2 tallas sin costo adicional.
                    </div>
                  )}
                </div>

                {/* 4. Kit de Limpieza */}
                <div className="care-accordion-item">
                  <button
                    type="button"
                    className="care-accordion-trigger"
                    onClick={() => toggleCareAccordion(4)}
                  >
                    <span>Kit de Limpieza</span>
                    <i className={openCareAccordion === 4 ? "bi bi-chevron-up" : "bi bi-chevron-down"}></i>
                  </button>
                  {openCareAccordion === 4 && (
                    <div className="care-accordion-content">
                      Paño de microfibra especializado y solución no abrasiva para el cuidado óptimo de tus gemas en casa.
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de Selección Platino Care */}
              <div className="care-buttons-row">
                <button
                  type="button"
                  className={`btn-care-plus ${platinoCarePlan === "plus" ? "active" : ""}`}
                  onClick={() => setPlatinoCarePlan("plus")}
                >
                  <span>AÑADIR PLATINO CARE +</span>
                  <span className="care-price-sub">PAGO ÚNICO S/. 90</span>
                </button>

                <button
                  type="button"
                  className={`btn-care-courtesy ${platinoCarePlan === "cortesia" ? "active" : ""}`}
                  onClick={() => setPlatinoCarePlan("cortesia")}
                >
                  <span>AÑADIR PLATINO CARE</span>
                  <span className="care-price-sub">CORTESÍA CON TU COMPRA S/. 0</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          4. SECCIÓN 3: PREGUNTAS FRECUENTES (FAQS)
          ======================================================== */}
      <section className="faqs-section-card">
        <h2 className="faqs-heading">Preguntas Frecuentes</h2>

        <div className="faqs-accordion-list">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="faq-accordion-item">
                <button
                  type="button"
                  className={`faq-trigger ${isOpen ? "open" : ""}`}
                  onClick={() => toggleFaq(idx)}
                >
                  <span>{faq.q}</span>
                  <i className="bi bi-chevron-down"></i>
                </button>
                {isOpen && <div className="faq-content">{faq.a}</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          MODAL: RESUMEN DE ELECCIÓN / CONSULTA
          ======================================================== */}
      {summaryModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "20px",
          }}
          onClick={() => setSummaryModalOpen(false)}
        >
          <div
            style={{
              background: "white",
              maxWidth: "540px",
              width: "100%",
              borderRadius: "4px",
              padding: "32px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSummaryModalOpen(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                border: "none",
                background: "transparent",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              <i className="bi bi-x-lg"></i>
            </button>

            <span style={{ fontSize: "10.5px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--platino-gold)" }}>
              Resumen de Personalización
            </span>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "26px", color: "var(--platino-green-dark)", margin: "4px 0 16px" }}>
              {product.name}
            </h3>

            <div style={{ background: "#fbfaf7", padding: "16px", borderRadius: "3px", fontSize: "13px", lineHeight: "1.8", marginBottom: "24px" }}>
              <div><strong>Metal:</strong> {selectedMetal.name}</div>
              {isAros ? (
                <>
                  <div><strong>Talla Dama:</strong> {RING_SIZES.find((s) => s.id === selectedSizeDama)?.label}</div>
                  <div><strong>Talla Varón:</strong> {RING_SIZES.find((s) => s.id === selectedSizeVaron)?.label}</div>
                </>
              ) : !isAccesorio ? (
                <div><strong>Talla:</strong> {RING_SIZES.find((s) => s.id === selectedSizeRing)?.label}</div>
              ) : null}
              {product.hasGemSelection && (
                <div><strong>Gema:</strong> {selectedGemShape.name}</div>
              )}
              {isAccesorio ? (
                <div><strong>Presentación:</strong> {product.presentationOptions?.find((o) => o.id === selectedPresentation)?.name}</div>
              ) : (
                <div><strong>Garantía:</strong> Platino Care {platinoCarePlan === "plus" ? "+ (S/. 90)" : "Cortesía (S/. 0)"}</div>
              )}
              <div style={{ borderTop: "1px solid #e8e4db", paddingTop: "8px", marginTop: "8px", fontSize: "16px", fontWeight: "700", color: "#17241e" }}>
                Total: {formatPrice(product.price + (platinoCarePlan === "plus" && !isAccesorio ? 90 : 0))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <a
                href={getWhatsAppMessageUrl()}
                target="_blank"
                rel="noreferrer"
                className="btn-book-submit"
                style={{ backgroundColor: "#25d366", textAlign: "center", textDecoration: "none" }}
              >
                <i className="bi bi-whatsapp" style={{ marginRight: "6px" }}></i>
                Consultar / Cotizar por WhatsApp
              </a>

              <Link
                to={`/agendar-cita`}
                className="showroom-btn outline"
                style={{ textAlign: "center" }}
              >
                Agendar Cita en Boutique para Probar Modelo
              </Link>

              {addToCart && (
                <button
                  type="button"
                  onClick={() => {
                    addToCart(product);
                    setSummaryModalOpen(false);
                    alert("¡Joya agregada a tu carrito!");
                  }}
                  className="showroom-btn filled"
                >
                  Añadir al Carrito
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: GUÍA DE TALLAS
          ======================================================== */}
      {sizeGuideOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "20px",
          }}
          onClick={() => setSizeGuideOpen(false)}
        >
          <div
            style={{
              background: "white",
              maxWidth: "520px",
              width: "100%",
              borderRadius: "4px",
              padding: "30px",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSizeGuideOpen(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                border: "none",
                background: "transparent",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              <i className="bi bi-x-lg"></i>
            </button>

            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "24px", color: "var(--platino-green-dark)", margin: "0 0 12px" }}>
              Guía de Tallas Nupciales
            </h3>
            <p style={{ fontSize: "12.5px", color: "#66726c", lineHeight: "1.6" }}>
              Si no conoces tu talla exacta, puedes seleccionar <em>«Necesito ayuda de un asesor»</em> o visitarnos en nuestras boutiques de Lima Centro y Miraflores para una medición profesional con anillero de cortesía.
            </p>

            <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse", marginTop: "16px" }}>
              <thead>
                <tr style={{ background: "#f5f3ec", textAlign: "left" }}>
                  <th style={{ padding: "8px" }}>Talla US</th>
                  <th style={{ padding: "8px" }}>Talla Nacional</th>
                  <th style={{ padding: "8px" }}>Diámetro Interior</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "8px" }}>5 US</td><td style={{ padding: "8px" }}>10 Nacional</td><td style={{ padding: "8px" }}>15.7 mm</td></tr>
                <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "8px" }}>6 US</td><td style={{ padding: "8px" }}>12 Nacional</td><td style={{ padding: "8px" }}>16.5 mm</td></tr>
                <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "8px" }}>7 US</td><td style={{ padding: "8px" }}>14 Nacional</td><td style={{ padding: "8px" }}>17.3 mm</td></tr>
                <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "8px" }}>8 US</td><td style={{ padding: "8px" }}>16 Nacional</td><td style={{ padding: "8px" }}>18.1 mm</td></tr>
                <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "8px" }}>9 US</td><td style={{ padding: "8px" }}>18 Nacional</td><td style={{ padding: "8px" }}>18.9 mm</td></tr>
                <tr><td style={{ padding: "8px" }}>10 US</td><td style={{ padding: "8px" }}>20 Nacional</td><td style={{ padding: "8px" }}>19.8 mm</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ZOOM IMAGEN
          ======================================================== */}
      {zoomOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "20px",
          }}
          onClick={() => setZoomOpen(false)}
        >
          <img
            src={galleryImages[activeImageIdx]}
            alt={product.name}
            style={{ maxHeight: "90vh", maxWidth: "90vw", objectFit: "contain", borderRadius: "4px" }}
          />
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              border: "none",
              background: "white",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      )}
    </div>
  );
}
