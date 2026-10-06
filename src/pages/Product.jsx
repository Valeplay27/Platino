import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  formatPrice,
  GEM_SHAPES_PRODUCT,
  FAQS,
  DEFAULT_METAL_IMAGES,
} from "../data/products";
import {
  DAMA_SIZES,
  VARON_SIZES,
  getProductStock,
  getSizeAvailability,
} from "../services/inventoryService";
import { getProductById, getCatalogProducts } from "../services/catalogService";
import { useAuth } from "../context/useAuth";
import { isUserFavorite, toggleUserFavorite } from "../services/favoritesService";
import { getPlatinoCareConfig } from "../services/platinoCareService";
import { DiamondCutIcon } from "../components/GemstoneIcons";
import { getAssetUrl } from "../utils/assetHelper";
import "../../styles/product.css";

export default function Product({ addToCart }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const product = useMemo(() => {
    return getProductById(productId) || getCatalogProducts()[0];
  }, [productId]);
  const { user, openAuthModal } = useAuth();

  const handleGoBack = () => {
    try {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate(product.category ? `/categoria/${product.category}` : "/");
      }
    } catch {
      navigate("/");
    }
  };

  // Estado del flujo de pasos
  const [currentStep, setCurrentStep] = useState(1);

  // Reiniciar paso al cambiar de producto
  useEffect(() => {
    setCurrentStep(1);
    setActiveImageIdx(0);
  }, [product.id]);

  // Galería de imágenes
  const galleryImages = useMemo(() => {
    return product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.image];
  }, [product.gallery, product.image]);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  // Configuración de la joya
  const [isFavorite, setIsFavorite] = useState(() => (user?.email ? isUserFavorite(user.email, product.id) : false));

  useEffect(() => {
    if (user?.email) {
      setIsFavorite(isUserFavorite(user.email, product.id));
    } else {
      setIsFavorite(false);
    }
    const handleFavUpdate = () => {
      if (user?.email) setIsFavorite(isUserFavorite(user.email, product.id));
    };
    window.addEventListener("platino_favorites_updated", handleFavUpdate);
    return () => window.removeEventListener("platino_favorites_updated", handleFavUpdate);
  }, [user?.email, product.id]);

  const handleToggleFavorite = () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    const nextState = toggleUserFavorite(user.email, {
      id: product.id,
      name: product.name,
      price: product.price,
      image: mainImage || product.image,
      metal: selectedMetal?.name,
      metalId: selectedMetal?.id,
      category: product.category,
      type: product.type,
      subtitle: product.subtitle,
    });
    setIsFavorite(nextState);
  };

  const [selectedMetal, setSelectedMetal] = useState(() => {
    if (product.availableMetals && product.availableMetals.length > 0) {
      const match = product.availableMetals.find(
        (m) => m.name === product.selectedMetal || m.id === product.selectedMetal
      );
      return match || product.availableMetals[0];
    }
    return { name: product.selectedMetal || "Oro 18k Blanco", id: "oro-18k-blanco", color: "#e8eaeb", border: "#c2c7c8" };
  });

  useEffect(() => {
    if (product.availableMetals && product.availableMetals.length > 0) {
      const match = product.availableMetals.find(
        (m) => m.name === product.selectedMetal || m.id === product.selectedMetal
      );
      setSelectedMetal(match || product.availableMetals[0]);
    }
  }, [product.id]);

  // Guardar última joya vista para sincronización automática con el panel de administración
  useEffect(() => {
    if (product?.id) {
      localStorage.setItem("platino_last_viewed_product_id", product.id);
    }
  }, [product?.id]);

  // Inventario y Stock con reactividad en tiempo real (mismo tab, pestañas alternas, y foco)
  const [productStock, setProductStock] = useState(() =>
    getProductStock(product?.id, product?.hasDoubleSizes)
  );

  useEffect(() => {
    const refreshStock = () => {
      setProductStock(getProductStock(product?.id, product?.hasDoubleSizes));
    };

    // Actualizar inmediatamente al montar o cambiar joya
    refreshStock();

    const handleStorageChange = (e) => {
      if (!e.key || e.key === "platino_inventory_stock_v1" || e.key.includes("inventory")) {
        refreshStock();
      }
    };

    window.addEventListener("platino_inventory_updated", refreshStock);
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", refreshStock);
    document.addEventListener("visibilitychange", refreshStock);

    return () => {
      window.removeEventListener("platino_inventory_updated", refreshStock);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", refreshStock);
      document.removeEventListener("visibilitychange", refreshStock);
    };
  }, [product?.id, product?.hasDoubleSizes]);

  // Tallas (Dama: 05 al 27 | Varón: 10 al 37)
  const [targetGender, setTargetGender] = useState("dama"); // 'dama' | 'varon' | 'ambos'
  const [selectedSizeDama, setSelectedSizeDama] = useState("12");
  const [selectedSizeVaron, setSelectedSizeVaron] = useState("20");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [sizeGuideTab, setSizeGuideTab] = useState("dama"); // 'dama' | 'varon'

  // Gemas
  const [selectedGemShape, setSelectedGemShape] = useState(
    GEM_SHAPES_PRODUCT[0]
  );

  // Presentación / Platino Care
  const [selectedPresentation, setSelectedPresentation] = useState(
    product.presentationOptions?.[0]?.id || "caja-verde-lujo"
  );
  const [platinoCarePlan, setPlatinoCarePlan] = useState("cortesia"); // 'cortesia' o 'plus'
  const [platinoCareConfig, setPlatinoCareConfig] = useState(() => getPlatinoCareConfig());
  const [openCareAccordion, setOpenCareAccordion] = useState(null);

  useEffect(() => {
    const handleCareUpdate = () => {
      setPlatinoCareConfig(getPlatinoCareConfig());
    };
    window.addEventListener("platino_care_updated", handleCareUpdate);
    return () => window.removeEventListener("platino_care_updated", handleCareUpdate);
  }, []);

  const carePlusPrice = platinoCareConfig?.plus?.price ?? 90;

  // Acordeón de FAQs
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Modal de resumen / confirmación
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);

  const isAccesorio = product.type === "accesorio";
  const isAros = product.type === "aros";
  const isAnillo = product.type === "anillo";

  // Grabado Personalizado en la Joya (SÍ / NO)
  const [hasEngraving, setHasEngraving] = useState(false);

  // Modal de Asesoramiento de Medida de Talla
  const [sizeAdviceModalOpen, setSizeAdviceModalOpen] = useState(false);



  // Stock Total Disponible según la combinación elegida
  const currentTotalStock = useMemo(() => {
    if (isAccesorio) return 4;
    if (isAros && targetGender === "ambos") {
      const avDama = selectedSizeDama !== "asesor" ? getSizeAvailability(productStock, "dama", selectedSizeDama).total : 0;
      const avVaron = selectedSizeVaron !== "asesor" ? getSizeAvailability(productStock, "varon", selectedSizeVaron).total : 0;
      return Math.min(avDama, avVaron);
    }
    if (targetGender === "varon") {
      if (selectedSizeVaron === "asesor") return 0;
      return getSizeAvailability(productStock, "varon", selectedSizeVaron).total;
    }
    // Dama
    if (selectedSizeDama === "asesor") return 0;
    return getSizeAvailability(productStock, "dama", selectedSizeDama).total;
  }, [isAros, isAccesorio, productStock, targetGender, selectedSizeDama, selectedSizeVaron]);

  // Regla del usuario: Si en el stock hay 2 unidades disponibles (o <= 2), esperar 7 días para entrega; de lo contrario, solo 2 días.
  const deliveryDays = currentTotalStock === 2 || currentTotalStock <= 2 ? 7 : 2;

  const deliveryDateFormatted = useMemo(() => {
    const d = new Date();
    let added = 0;
    while (added < deliveryDays) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0) added++; // Excluir domingos
    }
    const formatted = d.toLocaleDateString("es-PE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, [deliveryDays]);

  // Función para resolver la URL de la imagen según el material seleccionado
  const getImageUrlForMetal = (metalId) => {
    if (product.metalImages && product.metalImages[metalId]) {
      return getAssetUrl(product.metalImages[metalId]);
    }
    if (product.imagesByMetal && product.imagesByMetal[metalId]) {
      return getAssetUrl(product.imagesByMetal[metalId]);
    }
    if (product.id === "aros-trial" && DEFAULT_METAL_IMAGES && DEFAULT_METAL_IMAGES[metalId]) {
      return getAssetUrl(DEFAULT_METAL_IMAGES[metalId]);
    }
    return getAssetUrl(product.image || galleryImages[0]);
  };

  // 1. Estado en React usando useState para almacenar y mostrar la fotografía principal del anillo
  const [mainImage, setMainImage] = useState(() => {
    return getImageUrlForMetal(selectedMetal?.id);
  });

  // Sincronizar la imagen principal cuando cambie el producto o el metal por defecto
  useEffect(() => {
    setMainImage(getImageUrlForMetal(selectedMetal?.id));
  }, [product.id, selectedMetal?.id]);

  // 2. Función que actualiza el estado con la URL de la imagen correspondiente al presionar un botón de material
  const handleSelectMetal = (metal) => {
    setSelectedMetal(metal);
    const newImageUrl = getImageUrlForMetal(metal.id);
    setMainImage(newImageUrl);
  };

  // Selección de miniaturas
  const handleSelectThumbnail = (imgUrl, idx) => {
    setActiveImageIdx(idx);
    setMainImage(getAssetUrl(imgUrl));
  };

  // Navegación del slider
  const handlePrevImg = () => {
    const newIdx = activeImageIdx === 0 ? galleryImages.length - 1 : activeImageIdx - 1;
    setActiveImageIdx(newIdx);
    setMainImage(getAssetUrl(galleryImages[newIdx]));
  };
  const handleNextImg = () => {
    const newIdx = activeImageIdx === galleryImages.length - 1 ? 0 : activeImageIdx + 1;
    setActiveImageIdx(newIdx);
    setMainImage(getAssetUrl(galleryImages[newIdx]));
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

  const handleAddToCartDirect = () => {
    if (!addToCart) return;
    const customProduct = {
      ...product,
      selectedMetal: selectedMetal.name,
      metal: selectedMetal.name,
      selectedSize:
        isAros && targetGender === "ambos"
          ? `Dama: ${selectedSizeDama === "asesor" ? "Asesoría" : selectedSizeDama} / Varón: ${selectedSizeVaron === "asesor" ? "Asesoría" : selectedSizeVaron}`
          : targetGender === "varon"
          ? `Varón: ${selectedSizeVaron === "asesor" ? "Asesoría de medida" : selectedSizeVaron}`
          : `Mujer: ${selectedSizeDama === "asesor" ? "Asesoría de medida" : selectedSizeDama}`,
      size:
        isAros && targetGender === "ambos"
          ? `Dama: ${selectedSizeDama === "asesor" ? "Asesoría" : selectedSizeDama} / Varón: ${selectedSizeVaron === "asesor" ? "Asesoría" : selectedSizeVaron}`
          : targetGender === "varon"
          ? `Varón: ${selectedSizeVaron === "asesor" ? "Asesoría de medida" : selectedSizeVaron}`
          : `Mujer: ${selectedSizeDama === "asesor" ? "Asesoría de medida" : selectedSizeDama}`,
      selectedGemstone: product.hasGemSelection ? selectedGemShape.name : undefined,
      gemstone: product.hasGemSelection ? selectedGemShape.name : undefined,
      hasEngraving,
      engraving: hasEngraving ? "Sí solicita (Personalización por WhatsApp)" : null,
      needsSizeAdvice:
        (isAros && targetGender === "ambos" && (selectedSizeDama === "asesor" || selectedSizeVaron === "asesor")) ||
        (targetGender === "varon" ? selectedSizeVaron === "asesor" : selectedSizeDama === "asesor"),
      stockUnits: currentTotalStock,
      deliveryDays,
      estimatedDeliveryDate: deliveryDateFormatted,
      price: product.price + (platinoCarePlan === "plus" && !isAccesorio ? carePlusPrice : 0),
      image: mainImage || product.image,
    };
    addToCart(customProduct);
  };

  const getWhatsAppMessageUrl = () => {
    let sizeDetails = "";
    if (isAros && targetGender === "ambos") {
      const needsAdvice = selectedSizeDama === "asesor" || selectedSizeVaron === "asesor";
      if (needsAdvice) {
        sizeDetails = `*Tallas (Par de Aros):* SOLICITA ASESORAMIENTO DE MEDIDA (Dama: ${selectedSizeDama === "asesor" ? "Asesoría" : selectedSizeDama}, Varón: ${selectedSizeVaron === "asesor" ? "Asesoría" : selectedSizeVaron})%0A`;
      } else {
        const damaAvail = getSizeAvailability(productStock, "dama", selectedSizeDama);
        const varonAvail = getSizeAvailability(productStock, "varon", selectedSizeVaron);
        sizeDetails = `*Tallas (Par de Aros):*%0A- Talla Dama: ${selectedSizeDama} (${damaAvail.total} unids en stock)%0A- Talla Varón: ${selectedSizeVaron} (${varonAvail.total} unids en stock)%0A`;
      }
    } else if (targetGender === "varon") {
      if (selectedSizeVaron === "asesor") {
        sizeDetails = `*Talla Varón:* EL CLIENTE SOLICITA ASESORAMIENTO DE MEDIDA%0A`;
      } else {
        const varonAvail = getSizeAvailability(productStock, "varon", selectedSizeVaron);
        sizeDetails = `*Para:* Varón / Caballero%0A*Talla:* Talla ${selectedSizeVaron} (${varonAvail.total} unids en stock)%0A`;
      }
    } else if (!isAccesorio) {
      if (selectedSizeDama === "asesor") {
        sizeDetails = `*Talla Dama:* EL CLIENTE SOLICITA ASESORAMIENTO DE MEDIDA%0A`;
      } else {
        const damaAvail = getSizeAvailability(productStock, "dama", selectedSizeDama);
        sizeDetails = `*Para:* Mujer / Dama%0A*Talla:* Talla ${selectedSizeDama} (${damaAvail.total} unids en stock)%0A`;
      }
    }

    // Información de Grabado
    const engravingDetails = hasEngraving
      ? `*Grabado personalizado:* SÍ SOLICITA (Personalización a coordinar por WhatsApp)%0A`
      : `*Grabado personalizado:* No solicitado%0A`;

    // Stock y Tiempo de Entrega (Regla: 2 unidades en stock = 7 días de entrega; de lo contrario = 2 días)
    const stockDetails = `*Stock disponible:* ${currentTotalStock} unidades disponibles%0A*Tiempo de entrega:* ${deliveryDays} días hábiles (Listo aprox: ${deliveryDateFormatted})%0A`;

    const text = `¡Hola Platino Perú! Estoy interesado en ordenar esta joya personalizada:%0A%0A*Producto:* ${product.name}%0A*Metal seleccionado:* ${selectedMetal.name}%0A${sizeDetails}${
      product.hasGemSelection
        ? `*Forma de la Piedra/Gema:* ${selectedGemShape.name}%0A`
        : ""
    }${engravingDetails}${stockDetails}*Precio:* ${formatPrice(product.price)}%0A%0A¿Podrían confirmarme la disponibilidad y cómo procedemos con la orden?`;

    return `https://wa.me/51927357217?text=${text}`;
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
                <button
                  type="button"
                  className={`config-step-item ${currentStep === 1 ? "active" : ""}`}
                  onClick={() => {
                    setCurrentStep(1);
                    window.scrollTo({ top: 120, behavior: "smooth" });
                  }}
                >
                  <span className="config-step-number">1</span>
                  <div className="config-step-info">
                    <span className="config-step-title">SELECCIÓN DE DISEÑO</span>
                    <span className="config-step-sub">{product.name}</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`config-step-item ${currentStep === 2 ? "active" : ""}`}
                  onClick={() => {
                    setCurrentStep(2);
                    window.scrollTo({ top: 120, behavior: "smooth" });
                  }}
                >
                  <span className="config-step-number">2</span>
                  <div className="config-step-info">
                    <span className="config-step-title">ELIGE LA PRESENTACIÓN</span>
                    <span className="config-step-sub">Estuche y Empaque</span>
                  </div>
                </button>
              </>
            ) : !product.hasGemSelection ? (
              <>
                <button
                  type="button"
                  className={`config-step-item ${currentStep === 1 ? "active" : ""}`}
                  onClick={() => {
                    setCurrentStep(1);
                    window.scrollTo({ top: 120, behavior: "smooth" });
                  }}
                >
                  <span className="config-step-number">1</span>
                  <div className="config-step-info">
                    <span className="config-step-title">Características</span>
                    <span className="config-step-sub">{selectedMetal?.name || product.name}</span>
                  </div>
                  <i className="bi bi-circle config-step-icon"></i>
                </button>

                <button
                  type="button"
                  className={`config-step-item ${currentStep === 2 ? "active" : ""}`}
                  onClick={() => {
                    setCurrentStep(2);
                    window.scrollTo({ top: 120, behavior: "smooth" });
                  }}
                >
                  <span className="config-step-number">2</span>
                  <div className="config-step-info">
                    <span className="config-step-title">Complementos</span>
                    <span className="config-step-sub">{platinoCarePlan === "plus" ? "Platino Care +" : "Platino Care & Estuche"}</span>
                  </div>
                  <i className="bi bi-shield-check config-step-icon"></i>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={`config-step-item ${currentStep === 1 ? "active" : ""}`}
                  onClick={() => {
                    setCurrentStep(1);
                    window.scrollTo({ top: 120, behavior: "smooth" });
                  }}
                >
                  <span className="config-step-number">1</span>
                  <div className="config-step-info">
                    <span className="config-step-title">Características</span>
                    <span className="config-step-sub">{selectedMetal?.name || product.name}</span>
                  </div>
                  <i className="bi bi-circle config-step-icon"></i>
                </button>

                <button
                  type="button"
                  className={`config-step-item ${currentStep === 2 ? "active" : ""}`}
                  onClick={() => {
                    setCurrentStep(2);
                    window.scrollTo({ top: 120, behavior: "smooth" });
                  }}
                >
                  <span className="config-step-number">2</span>
                  <div className="config-step-info">
                    <span className="config-step-title">Elige tu Gema</span>
                    <span className="config-step-sub">{selectedGemShape?.name || "Redondo"}</span>
                  </div>
                  <i className="bi bi-gem config-step-icon"></i>
                </button>

                <button
                  type="button"
                  className={`config-step-item ${currentStep === 3 ? "active" : ""}`}
                  onClick={() => {
                    setCurrentStep(3);
                    window.scrollTo({ top: 120, behavior: "smooth" });
                  }}
                >
                  <span className="config-step-number">3</span>
                  <div className="config-step-info">
                    <span className="config-step-title">Complementos</span>
                    <span className="config-step-sub">{platinoCarePlan === "plus" ? "Platino Care +" : "Platino Care & Estuche"}</span>
                  </div>
                  <i className="bi bi-box-seam config-step-icon"></i>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ========================================================
          2. DETALLE PRINCIPAL DEL PRODUCTO (2 COLUMNAS)
          ======================================================== */}
      {/* Barra de Retorno / Breadcrumb Superior */}
      <div className="product-back-nav-bar">
        <button
          type="button"
          onClick={handleGoBack}
          className="btn-back-breadcrumb"
          title="Volver a la página anterior o catálogo"
        >
          <i className="bi bi-arrow-left"></i>
          <span>Volver Atrás</span>
        </button>
        <span className="product-breadcrumb-sep">/</span>
        <Link to="/catalogo" className="breadcrumb-catalog-link">
          Catálogo
        </Link>
        {product.category && (
          <>
            <span className="product-breadcrumb-sep">/</span>
            <Link to={`/categoria/${product.category}`} className="breadcrumb-catalog-link">
              {product.category.replace(/-/g, " ")}
            </Link>
          </>
        )}
        <span className="product-breadcrumb-sep">/</span>
        <span className="product-breadcrumb-current">{product.name}</span>
      </div>

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
                onClick={() => handleSelectThumbnail(img, idx)}
                aria-label={`Ver vista ${idx + 1}`}
              >
                <img
                  src={idx === 0 ? mainImage : getAssetUrl(img)}
                  alt={`Miniatura ${idx + 1}`}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getAssetUrl("/images/aros-trial.jpg");
                  }}
                />
              </button>
            ))}
          </div>

          {/* Imagen Grande Central */}
          <div className="product-main-img-box">
            <img
              src={mainImage}
              alt={`${product.name} en ${selectedMetal.name}`}
              className="product-main-img"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getAssetUrl("/images/aros-trial.jpg");
              }}
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

            {/* Badge interactivo del metal y joya */}
            <div className="gallery-badge-overlay">
              <span
                className="metal-badge-live-dot"
                style={{
                  background: selectedMetal?.color || "#e4e7e7",
                  border: `1px solid ${selectedMetal?.border || "#cfd3d3"}`,
                }}
              />
              <span>{selectedMetal.name}</span>
              {product.badge && (
                <span style={{ opacity: 0.75, marginLeft: "4px" }}>• {product.badge}</span>
              )}
            </div>

            {/* Sello Dorado P */}
            <div className="gallery-gold-p-stamp">P</div>
          </div>
        </div>

        {/* Columna Derecha: Configurador */}
        <div className="product-config-side">
          <div className="config-header-row">
            <p className="config-product-subtitle">
              {isAros
                ? `AROS EN "${selectedMetal.name.toUpperCase()}"`
                : isAnillo
                ? `ANILLO EN "${selectedMetal.name.toUpperCase()}"`
                : `${(product.subtitle || "JOYA FINA").toUpperCase()} EN "${selectedMetal.name.toUpperCase()}"`}
            </p>
            <h1 className="config-product-title">{product.name}</h1>

            <div className="config-price-row">
              <span className="config-product-price">
                {formatPrice(product.price)}
              </span>

              <button
                type="button"
                className={`btn-favoritos ${isFavorite ? "active" : ""}`}
                onClick={handleToggleFavorite}
                title={!user ? "Inicia sesión o regístrate para guardar en favoritos" : (isFavorite ? "Quitar de favoritos" : "Guardar en favoritos")}
              >
                <i className={isFavorite ? "bi bi-heart-fill" : "bi bi-heart"}></i>
                {isFavorite ? "EN FAVORITOS" : "FAVORITOS ★"}
              </button>
            </div>
          </div>

          {/* ========================================================
              PASO 1: CARACTERÍSTICAS
              ======================================================== */}
          {currentStep === 1 && (
            <div className="step-pane step-pane-1">
              <div className="step-mini-header">
                <span className="step-tag-pill">Paso 1 de {isAccesorio ? "2" : "3"}</span>
                <h3 className="step-heading-text">Personaliza las Características</h3>
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
                  <span className="metal-selected-name">{selectedMetal.name}</span>
                </div>
              )}

              {/* 2. PREGUNTA: ¿PARA QUIÉN ES LA JOYA? Y DESPRENDIMIENTO DE TALLAS */}
              {!isAccesorio && (
                <div className="config-block size-config-container">
                  {/* PREGUNTA PARA VARÓN O MUJER */}
                  <div className="target-gender-block">
                    <div className="target-gender-header-row">
                      <div className="target-gender-label">
                        <i className="bi bi-people" style={{ color: "#c5a059", fontSize: "17px" }}></i>
                        <span>¿Para quién es la joya?</span>
                      </div>
                      {targetGender && (
                        <button
                          type="button"
                          className="btn-undo-gender"
                          onClick={() => setTargetGender(null)}
                          title="Deshacer selección para volver a elegir"
                        >
                          <i className="bi bi-arrow-counterclockwise"></i>
                          <span>Deshacer elección</span>
                        </button>
                      )}
                    </div>
                    <div className="target-gender-options">
                      <button
                        type="button"
                        className={`btn-gender-target ${targetGender === "dama" ? "active" : ""}`}
                        onClick={() => {
                          setTargetGender(targetGender === "dama" ? null : "dama");
                          setSizeGuideTab("dama");
                        }}
                        title={targetGender === "dama" ? "Clic para deseleccionar" : "Seleccionar para Mujer"}
                      >
                        <i className="bi bi-gender-female"></i>
                        <span>Para Mujer (Dama)</span>
                      </button>

                      <button
                        type="button"
                        className={`btn-gender-target ${targetGender === "varon" ? "active" : ""}`}
                        onClick={() => {
                          setTargetGender(targetGender === "varon" ? null : "varon");
                          setSizeGuideTab("varon");
                        }}
                        title={targetGender === "varon" ? "Clic para deseleccionar" : "Seleccionar para Varón"}
                      >
                        <i className="bi bi-gender-male"></i>
                        <span>Para Varón (Caballero)</span>
                      </button>

                      {isAros && (
                        <button
                          type="button"
                          className={`btn-gender-target ${targetGender === "ambos" ? "active" : ""}`}
                          onClick={() => setTargetGender(targetGender === "ambos" ? null : "ambos")}
                          title={targetGender === "ambos" ? "Clic para deseleccionar" : "Seleccionar Ambos"}
                        >
                          <i className="bi bi-hearts"></i>
                          <span>Ambos (Par de Aros)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {!targetGender && (
                    <div className="gender-unselected-hint">
                      <i className="bi bi-info-circle"></i>
                      <span>Por favor selecciona si la joya es para <strong>Mujer</strong> o para <strong>Varón</strong> para desplegar las tallas y stock correspondiente.</span>
                    </div>
                  )}

                  {/* DESPRENDIMIENTO DE TALLAS SEGÚN LA ELECCIÓN */}
                  {targetGender === "dama" && (
                    <div className="size-dropdown-section">
                      <div className="config-block-header">
                        <span className="config-block-title">Talla Dama (05 al 27)</span>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <Link
                            to={`/agendar-cita?tab=inventario&prod=${product.id}`}
                            className="link-admin-stock-sync"
                            title="Gestionar existencias en Bodega y Sedes en el panel Admin"
                            style={{
                              fontSize: "11px",
                              color: "#245037",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "2px 7px",
                              borderRadius: "4px",
                              background: "#eaf3ee",
                              border: "1px solid #b7d6c5",
                              fontWeight: "600",
                            }}
                          >
                            <i className="bi bi-boxes" style={{ color: "#137748" }}></i> Stock Admin
                          </Link>
                          <button
                            type="button"
                            className="link-guia-tallas"
                            onClick={() => {
                              setSizeGuideTab("dama");
                              setSizeGuideOpen(true);
                            }}
                          >
                            <i className="bi bi-rulers"></i> Guía de Tallas
                          </button>
                        </div>
                      </div>
                      <select
                        value={selectedSizeDama}
                        onChange={(e) => setSelectedSizeDama(e.target.value)}
                        className="select-talla-dropdown"
                      >
                        <option value="asesor">¿No sabes tu talla? Solicitar asesoramiento de medida</option>
                        {DAMA_SIZES.map((sz) => {
                          const avail = getSizeAvailability(productStock, "dama", sz.number);
                          return (
                            <option key={sz.number} value={sz.number}>
                              {sz.label} ({avail.total > 0 ? `${avail.total} en stock` : "Sin stock"})
                            </option>
                          );
                        })}
                      </select>

                      <div className="size-advice-banner">
                        <div className="size-advice-text">
                          <i className="bi bi-question-circle"></i>
                          <span>¿No estás seguro de la talla?</span>
                        </div>
                        <button
                          type="button"
                          className="btn-open-size-advice"
                          onClick={() => setSizeAdviceModalOpen(true)}
                        >
                          Asesoría de Medida
                        </button>
                      </div>

                      {/* Stock General por Talla (Dama) */}
                      {selectedSizeDama !== "asesor" && (
                        <div className="size-stock-general">
                          {(() => {
                            const av = getSizeAvailability(productStock, "dama", selectedSizeDama);
                            return av.total > 0 ? (
                              <div className={`stock-general-badge ${av.total <= 2 ? "low-stock" : "in-stock"}`}>
                                <i className={av.total <= 2 ? "bi bi-exclamation-circle-fill" : "bi bi-check-circle-fill"}></i>
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                  <span>
                                    Stock disponible: <strong>{av.total} {av.total === 1 ? "unidad" : "unidades"}</strong>
                                    {av.total <= 2 ? " (Últimas unidades)" : ""}
                                  </span>
                                  <span style={{ fontSize: "11px", opacity: 0.85 }}>
                                    Bodega: <strong>{av.bodega}</strong> • Lima Centro: <strong>{av.limaCentro}</strong> • Miraflores: <strong>{av.miraflores}</strong>
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="stock-general-badge out-of-stock">
                                <i className="bi bi-clock-history"></i>
                                <span>Disponible a pedido (Fabricación en taller)</span>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {targetGender === "varon" && (
                    <div className="size-dropdown-section">
                      <div className="config-block-header">
                        <span className="config-block-title">Talla Varón (10 al 37)</span>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <Link
                            to={`/agendar-cita?tab=inventario&prod=${product.id}`}
                            className="link-admin-stock-sync"
                            title="Gestionar existencias en Bodega y Sedes en el panel Admin"
                            style={{
                              fontSize: "11px",
                              color: "#245037",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "2px 7px",
                              borderRadius: "4px",
                              background: "#eaf3ee",
                              border: "1px solid #b7d6c5",
                              fontWeight: "600",
                            }}
                          >
                            <i className="bi bi-boxes" style={{ color: "#137748" }}></i> Stock Admin
                          </Link>
                          <button
                            type="button"
                            className="link-guia-tallas"
                            onClick={() => {
                              setSizeGuideTab("varon");
                              setSizeGuideOpen(true);
                            }}
                          >
                            <i className="bi bi-rulers"></i> Guía de Tallas
                          </button>
                        </div>
                      </div>
                      <select
                        value={selectedSizeVaron}
                        onChange={(e) => setSelectedSizeVaron(e.target.value)}
                        className="select-talla-dropdown"
                      >
                        <option value="asesor">¿No sabes tu talla? Solicitar asesoramiento de medida</option>
                        {VARON_SIZES.map((sz) => {
                          const avail = getSizeAvailability(productStock, "varon", sz.number);
                          return (
                            <option key={sz.number} value={sz.number}>
                              {sz.label} ({avail.total > 0 ? `${avail.total} en stock` : "Sin stock"})
                            </option>
                          );
                        })}
                      </select>

                      <div className="size-advice-banner">
                        <div className="size-advice-text">
                          <i className="bi bi-question-circle"></i>
                          <span>¿No estás seguro de la talla?</span>
                        </div>
                        <button
                          type="button"
                          className="btn-open-size-advice"
                          onClick={() => setSizeAdviceModalOpen(true)}
                        >
                          Asesoría de Medida
                        </button>
                      </div>

                      {/* Stock General por Talla (Varón) */}
                      {selectedSizeVaron !== "asesor" && (
                        <div className="size-stock-general">
                          {(() => {
                            const av = getSizeAvailability(productStock, "varon", selectedSizeVaron);
                            return av.total > 0 ? (
                              <div className={`stock-general-badge ${av.total <= 2 ? "low-stock" : "in-stock"}`}>
                                <i className={av.total <= 2 ? "bi bi-exclamation-circle-fill" : "bi bi-check-circle-fill"}></i>
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                  <span>
                                    Stock disponible: <strong>{av.total} {av.total === 1 ? "unidad" : "unidades"}</strong>
                                    {av.total <= 2 ? " (Últimas unidades)" : ""}
                                  </span>
                                  <span style={{ fontSize: "11px", opacity: 0.85 }}>
                                    Bodega: <strong>{av.bodega}</strong> • Lima Centro: <strong>{av.limaCentro}</strong> • Miraflores: <strong>{av.miraflores}</strong>
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="stock-general-badge out-of-stock">
                                <i className="bi bi-clock-history"></i>
                                <span>Disponible a pedido (Fabricación en taller)</span>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {targetGender === "ambos" && isAros && (
                    <div className="double-sizes-grid">
                      <div>
                        <div className="config-block-header">
                          <span className="config-block-title">Talla Dama (05 al 27)</span>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <Link
                              to={`/agendar-cita?tab=inventario&prod=${product.id}`}
                              className="link-admin-stock-sync"
                              title="Gestionar existencias en Bodega y Sedes en el panel Admin"
                              style={{
                                fontSize: "11px",
                                color: "#245037",
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "2px 7px",
                                borderRadius: "4px",
                                background: "#eaf3ee",
                                border: "1px solid #b7d6c5",
                                fontWeight: "600",
                              }}
                            >
                              <i className="bi bi-boxes" style={{ color: "#137748" }}></i> Stock Admin
                            </Link>
                            <button
                              type="button"
                              className="link-guia-tallas"
                              onClick={() => {
                                setSizeGuideTab("dama");
                                setSizeGuideOpen(true);
                              }}
                            >
                              <i className="bi bi-rulers"></i> Guía de Tallas
                            </button>
                          </div>
                        </div>
                        <select
                          value={selectedSizeDama}
                          onChange={(e) => setSelectedSizeDama(e.target.value)}
                          className="select-talla-dropdown"
                        >
                          <option value="asesor">¿No sabes tu talla? Solicitar asesoramiento de medida</option>
                          {DAMA_SIZES.map((sz) => {
                            const avail = getSizeAvailability(productStock, "dama", sz.number);
                            return (
                              <option key={sz.number} value={sz.number}>
                                {sz.label} ({avail.total > 0 ? `${avail.total} en stock` : "Sin stock"})
                              </option>
                            );
                          })}
                        </select>

                        <div className="size-advice-banner">
                          <div className="size-advice-text">
                            <i className="bi bi-question-circle"></i>
                            <span>¿No estás seguro de la talla?</span>
                          </div>
                          <button
                            type="button"
                            className="btn-open-size-advice"
                            onClick={() => setSizeAdviceModalOpen(true)}
                          >
                            Asesoría de Medida
                          </button>
                        </div>

                        {selectedSizeDama !== "asesor" && (
                          <div className="size-stock-general">
                            {(() => {
                              const av = getSizeAvailability(productStock, "dama", selectedSizeDama);
                              return av.total > 0 ? (
                                <div className={`stock-general-badge ${av.total <= 2 ? "low-stock" : "in-stock"}`}>
                                  <i className={av.total <= 2 ? "bi bi-exclamation-circle-fill" : "bi bi-check-circle-fill"}></i>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                    <span>
                                      Stock disponible: <strong>{av.total} {av.total === 1 ? "unidad" : "unidades"}</strong>
                                      {av.total <= 2 ? " (Últimas unidades)" : ""}
                                    </span>
                                    <span style={{ fontSize: "11px", opacity: 0.85 }}>
                                      Bodega: <strong>{av.bodega}</strong> • Lima Centro: <strong>{av.limaCentro}</strong> • Miraflores: <strong>{av.miraflores}</strong>
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="stock-general-badge out-of-stock">
                                  <i className="bi bi-clock-history"></i>
                                  <span>Disponible a pedido (Fabricación en taller)</span>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="config-block-header">
                          <span className="config-block-title">Talla Varón (10 al 37)</span>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <Link
                              to={`/agendar-cita?tab=inventario&prod=${product.id}`}
                              className="link-admin-stock-sync"
                              title="Gestionar existencias en Bodega y Sedes en el panel Admin"
                              style={{
                                fontSize: "11px",
                                color: "#245037",
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "2px 7px",
                                borderRadius: "4px",
                                background: "#eaf3ee",
                                border: "1px solid #b7d6c5",
                                fontWeight: "600",
                              }}
                            >
                              <i className="bi bi-boxes" style={{ color: "#137748" }}></i> Stock Admin
                            </Link>
                            <button
                              type="button"
                              className="link-guia-tallas"
                              onClick={() => {
                                setSizeGuideTab("varon");
                                setSizeGuideOpen(true);
                              }}
                            >
                              <i className="bi bi-rulers"></i> Guía de Tallas
                            </button>
                          </div>
                        </div>
                        <select
                          value={selectedSizeVaron}
                          onChange={(e) => setSelectedSizeVaron(e.target.value)}
                          className="select-talla-dropdown"
                        >
                          <option value="asesor">¿No sabes tu talla? Solicitar asesoramiento de medida</option>
                          {VARON_SIZES.map((sz) => {
                            const avail = getSizeAvailability(productStock, "varon", sz.number);
                            return (
                              <option key={sz.number} value={sz.number}>
                                {sz.label} ({avail.total > 0 ? `${avail.total} en stock` : "Sin stock"})
                              </option>
                            );
                          })}
                        </select>

                        <div className="size-advice-banner">
                          <div className="size-advice-text">
                            <i className="bi bi-question-circle"></i>
                            <span>¿No estás seguro de la talla?</span>
                          </div>
                          <button
                            type="button"
                            className="btn-open-size-advice"
                            onClick={() => setSizeAdviceModalOpen(true)}
                          >
                            Asesoría de Medida
                          </button>
                        </div>

                        {selectedSizeVaron !== "asesor" && (
                          <div className="size-stock-general">
                            {(() => {
                              const av = getSizeAvailability(productStock, "varon", selectedSizeVaron);
                              return av.total > 0 ? (
                                <div className={`stock-general-badge ${av.total <= 2 ? "low-stock" : "in-stock"}`}>
                                  <i className={av.total <= 2 ? "bi bi-exclamation-circle-fill" : "bi bi-check-circle-fill"}></i>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                    <span>
                                      Stock disponible: <strong>{av.total} {av.total === 1 ? "unidad" : "unidades"}</strong>
                                      {av.total <= 2 ? " (Últimas unidades)" : ""}
                                    </span>
                                    <span style={{ fontSize: "11px", opacity: 0.85 }}>
                                      Bodega: <strong>{av.bodega}</strong> • Lima Centro: <strong>{av.limaCentro}</strong> • Miraflores: <strong>{av.miraflores}</strong>
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="stock-general-badge out-of-stock">
                                  <i className="bi bi-clock-history"></i>
                                  <span>Disponible a pedido (Fabricación en taller)</span>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. APARTADO DE GRABADO PERSONALIZADO EN LA JOYA */}
              {!isAccesorio && (
                <div className="engraving-config-block">
                  <div className="engraving-toggle-row">
                    <span className="engraving-toggle-label">
                      <i className="bi bi-pencil-square" style={{ color: "#c5a059", fontSize: "17px" }}></i>
                      <span>¿Deseas agregar grabado personalizado a tu joya?</span>
                    </span>
                    <div className="engraving-yes-no-switch">
                      <button
                        type="button"
                        className={`btn-yes-no ${hasEngraving ? "active" : ""}`}
                        onClick={() => setHasEngraving(true)}
                      >
                        SÍ
                      </button>
                      <button
                        type="button"
                        className={`btn-yes-no ${!hasEngraving ? "active" : ""}`}
                        onClick={() => setHasEngraving(false)}
                      >
                        NO
                      </button>
                    </div>
                  </div>

                  {hasEngraving && (
                    <div className="engraving-whatsapp-notice">
                      <i className="bi bi-whatsapp"></i>
                      <span>¡Excelente elección! La personalización del texto y estilo se coordinará directamente por WhatsApp.</span>
                    </div>
                  )}
                </div>
              )}

              {/* 4. APARTADO: TIEMPO DE ENTREGA DINÁMICO SEGÚN STOCK DE UNIDADES */}
              <div className={`delivery-estimate-card ${deliveryDays === 7 ? "slow-7days" : "fast-2days"}`}>
                <i className={`bi ${deliveryDays === 7 ? "bi-clock-history" : "bi-lightning-charge-fill"} delivery-estimate-icon`}></i>
                <div>
                  <div className="delivery-estimate-title">
                    {deliveryDays === 7 ? (
                      <>
                        <span>Tiempo de Entrega: 7 Días Hábiles</span>
                        <span style={{ fontSize: "11px", background: "#fef3c7", color: "#92400e", padding: "1px 8px", borderRadius: "10px", fontWeight: "700" }}>
                          Stock de 2 Unidades
                        </span>
                      </>
                    ) : (
                      <>
                        <span>Entrega Rápida en solo 2 Días Hábiles</span>
                        <span style={{ fontSize: "11px", background: "#d1fae5", color: "#065f46", padding: "1px 8px", borderRadius: "10px", fontWeight: "700" }}>
                          Despacho Inmediato
                        </span>
                      </>
                    )}
                  </div>
                  <p style={{ margin: "2px 0 0", fontSize: "12.5px" }}>
                    {deliveryDays === 7
                      ? `Al registrarse 2 unidades en almacén, tu joya pasa por ajuste y preparación en taller. Lista para entrega el ${deliveryDateFormatted}.`
                      : `Disponibilidad inmediata en stock (${currentTotalStock} unidades disponibles). Lista para entrega o despacho el ${deliveryDateFormatted}.`}
                  </p>
                </div>
              </div>

              {/* BOTONES DE NAVEGACIÓN DEL PASO 1 */}
              <div className="wizard-step-dual-actions">
                <button
                  type="button"
                  className="btn-wizard-prev-step"
                  onClick={handleGoBack}
                  title="Volver al catálogo o página anterior"
                >
                  <i className="bi bi-arrow-left"></i>
                  <span>Volver Atrás</span>
                </button>

                <button
                  type="button"
                  className="btn-wizard-next-step"
                  onClick={() => {
                    setCurrentStep(2);
                    window.scrollTo({ top: 120, behavior: "smooth" });
                  }}
                >
                  <span>
                    {isAccesorio
                      ? "CONTINUAR A PASO 2: PRESENTACIÓN"
                      : product.hasGemSelection
                      ? "CONTINUAR A PASO 2: ELIGE TU GEMA"
                      : "CONTINUAR A PASO 2: COMPLEMENTOS Y ESTUCHE"}
                  </span>
                  <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              PASO 2: ELIGE TU GEMA (SOLO PRODUCTOS CON ELECCIÓN DE GEMAS)
              ======================================================== */}
          {currentStep === 2 && !isAccesorio && product.hasGemSelection && (
            <div className="step-pane step-pane-2">
              <div className="step-mini-header">
                <span className="step-tag-pill">Paso 2 de 3</span>
                <h3 className="step-heading-text">Elige la Forma de tu Gema</h3>
              </div>

              <div className="config-block">
                <div className="config-block-header">
                  <span className="config-block-title">Siluetas y Formas Disponibles</span>
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
                        title={`${shape.name}: ${shape.desc || ""}`}
                      >
                        <div className="gem-shape-icon-box">
                          <DiamondCutIcon shape={shape.id} size={28} />
                        </div>
                        <span className="gem-shape-btn-name">{shape.name}</span>
                      </button>
                    );
                  })}
                  <Link
                    to="/catalogo-gemas"
                    className="gem-shape-btn more-btn"
                    title="Ver catálogo completo de gemas y diamantes certificados"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <i className="bi bi-arrow-up-right" style={{ fontSize: "18px" }}></i>
                    <span className="gem-shape-btn-name">Ver Todas</span>
                  </Link>
                </div>

                <div className="gem-selected-detail-card">
                  <div className="gem-selected-header-row">
                    <div className="gem-detail-icon-circle">
                      <DiamondCutIcon shape={selectedGemShape.id} size={40} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "15px", fontWeight: "700", color: "#0f2a24" }}>
                          Corte {selectedGemShape.name}
                        </span>
                        {selectedGemShape.popularCarat && (
                          <span className="gem-detail-carat-pill">
                            {selectedGemShape.popularCarat}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "12px", color: "#617169", marginTop: "2px" }}>
                        {isAros ? "Zirconita Incolora Suiza 2.0mm / Opción Diamante Natural" : "Diamante Fino Platino (Corte Brillante Certificado)"}
                      </div>
                    </div>
                  </div>
                  {selectedGemShape.desc && (
                    <p style={{ margin: "10px 0 6px", fontSize: "12.5px", color: "#3c4842", lineHeight: "1.5" }}>
                      {selectedGemShape.desc}
                    </p>
                  )}
                  {selectedGemShape.ratio && (
                    <div className="gem-detail-ratio-tag">
                      <span>Proporción recomendada: <strong>{selectedGemShape.ratio}</strong></span>
                    </div>
                  )}
                  <p style={{ margin: "8px 0 0", fontSize: "11.5px", color: "#6d7a74", lineHeight: "1.45" }}>
                    Montado bajo microscopio por nuestros maestros orfebres para garantizar el máximo reflejo de luz y seguridad de engaste de por vida.
                  </p>
                </div>
              </div>

              {/* Resumen del paso 1 */}
              <div className="step-review-capsule">
                <div className="step-review-line">
                  <i className="bi bi-check-circle-fill" style={{ color: "#15803d" }}></i>
                  <span><strong>Metal elegido:</strong> {selectedMetal.name}</span>
                </div>
                <div className="step-review-line">
                  <i className="bi bi-check-circle-fill" style={{ color: "#15803d" }}></i>
                  <span>
                    <strong>Medida:</strong> {targetGender === "ambos" && isAros ? `Dama ${selectedSizeDama} / Varón ${selectedSizeVaron}` : (targetGender === "varon" ? `Varón ${selectedSizeVaron}` : `Dama ${selectedSizeDama}`)}
                  </span>
                </div>
                {hasEngraving && (
                  <div className="step-review-line">
                    <i className="bi bi-check-circle-fill" style={{ color: "#15803d" }}></i>
                    <span><strong>Grabado:</strong> Sí solicita (Personalización por WhatsApp)</span>
                  </div>
                )}
              </div>

              {/* Botones de navegación del Paso 2 */}
              <div className="wizard-step-dual-actions">
                <button
                  type="button"
                  className="btn-wizard-prev-step"
                  onClick={() => {
                    setCurrentStep(1);
                    window.scrollTo({ top: 100, behavior: "smooth" });
                  }}
                >
                  <i className="bi bi-arrow-left"></i>
                  <span>Volver a Características</span>
                </button>

                <button
                  type="button"
                  className="btn-wizard-next-step"
                  onClick={() => {
                    setCurrentStep(3);
                    window.scrollTo({ top: 100, behavior: "smooth" });
                  }}
                >
                  <span>CONTINUAR A COMPLEMENTOS</span>
                  <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              PASO 2 (ACCESORIO O SIN GEMAS) O PASO 3 (CON GEMAS): COMPLEMENTOS & ESTUCHE
              ======================================================== */}
          {((currentStep === 3 && product.hasGemSelection && !isAccesorio) ||
            (currentStep === 2 && (!product.hasGemSelection || isAccesorio))) && (
            <div className="step-pane step-pane-3">
              <div className="step-mini-header">
                <span className="step-tag-pill">
                  Paso {!product.hasGemSelection || isAccesorio ? "2 de 2" : "3 de 3"}
                </span>
                <h3 className="step-heading-text">Complementos, Garantía y Estuche</h3>
              </div>

              {!isAccesorio && (
                /* PLATINO CARE DENTRO DEL PASO 3 */
                <div className="platino-care-step-block">
                  <div className="platino-care-step-banner">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src={getAssetUrl("/images/platino-logo-emerald.jpg")}
                        alt="Platino Care"
                        style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                      />
                      <div>
                        <h4 style={{ margin: 0, fontSize: "14.5px", fontWeight: "700", color: "#0f2a24" }}>
                          {platinoCareConfig?.name || "PLATINO CARE"}
                        </h4>
                        <span style={{ fontSize: "11px", color: "#c5a059", fontWeight: "700", letterSpacing: "0.08em" }}>
                          {platinoCareConfig?.tagline || "PROGRAMA OFICIAL DE CUIDADO"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="platino-care-accordions" style={{ marginTop: "12px" }}>
                    {(platinoCareConfig?.benefits || []).map((benefit, idx) => {
                      const benefitId = benefit.id || idx + 1;
                      const isOpen = openCareAccordion === benefitId;
                      return (
                        <div key={benefitId} className="care-accordion-item">
                          <button
                            type="button"
                            className="care-accordion-trigger"
                            onClick={() => toggleCareAccordion(benefitId)}
                          >
                            <span>{benefit.title}</span>
                            <i className={isOpen ? "bi bi-chevron-up" : "bi bi-chevron-down"}></i>
                          </button>
                          {isOpen && (
                            <div className="care-accordion-content">
                              {benefit.content}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Botones de Plan Platino Care */}
                  <div className="care-buttons-row" style={{ marginTop: "14px" }}>
                    <button
                      type="button"
                      className={`btn-care-plus ${platinoCarePlan === "plus" ? "active" : ""}`}
                      onClick={() => setPlatinoCarePlan("plus")}
                    >
                      <span>{platinoCareConfig?.plus?.title || "AÑADIR PLATINO CARE +"}</span>
                      <span className="care-price-sub">
                        {platinoCareConfig?.plus?.subtitle || `PAGO ÚNICO S/. ${carePlusPrice}`}
                      </span>
                    </button>

                    <button
                      type="button"
                      className={`btn-care-courtesy ${platinoCarePlan === "cortesia" ? "active" : ""}`}
                      onClick={() => setPlatinoCarePlan("cortesia")}
                    >
                      <span>{platinoCareConfig?.cortesia?.title || "AÑADIR PLATINO CARE"}</span>
                      <span className="care-price-sub">
                        {platinoCareConfig?.cortesia?.subtitle || "CORTESÍA CON TU COMPRA S/. 0"}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* ESTUCHE / PRESENTACIÓN */}
              <div className="config-block" style={{ marginTop: "16px" }}>
                <div className="config-block-header">
                  <span className="config-block-title">Elige tu Presentación y Estuche</span>
                </div>
                <select
                  value={selectedPresentation}
                  onChange={(e) => setSelectedPresentation(e.target.value)}
                  className="select-talla-dropdown"
                >
                  {(product.presentationOptions || [
                    { id: "caja-verde-lujo", name: "Caja de Lujo Esmeralda Platino (Recomendado)", price: 0 },
                    { id: "estuche-terciopelo", name: "Estuche de Terciopelo Negro Nupcial", price: 25 },
                    { id: "caja-madera", name: "Caja de Madera Laqueada con Luz LED Nupcial", price: 60 }
                  ]).map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name} {opt.price > 0 ? `(+S/. ${opt.price})` : "(Incluido de Cortesía)"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Resumen Final de Personalización */}
              <div className="step-review-capsule">
                <div className="step-review-line">
                  <i className="bi bi-gem" style={{ color: "#c5a059" }}></i>
                  <span><strong>Joya:</strong> {product.name} ({selectedMetal.name})</span>
                </div>
                {!isAccesorio && (
                  <>
                    <div className="step-review-line">
                      <i className="bi bi-rulers" style={{ color: "#c5a059" }}></i>
                      <span><strong>Medida:</strong> {targetGender === "ambos" && isAros ? `Dama ${selectedSizeDama} / Varón ${selectedSizeVaron}` : (targetGender === "varon" ? `Varón ${selectedSizeVaron}` : `Dama ${selectedSizeDama}`)}</span>
                    </div>
                    <div className="step-review-line">
                      <i className="bi bi-stars" style={{ color: "#c5a059" }}></i>
                      <span><strong>Gema:</strong> {selectedGemShape.name}</span>
                    </div>
                  </>
                )}
                <div className="step-review-line" style={{ fontWeight: "700", color: "#0f2a24" }}>
                  <i className="bi bi-truck" style={{ color: deliveryDays === 7 ? "#b45309" : "#15803d" }}></i>
                  <span>Entrega estimada: {deliveryDays} días hábiles ({deliveryDateFormatted})</span>
                </div>
              </div>

              {/* Botones de navegación del Paso 3 / Final */}
              <div className="wizard-step-dual-actions">
                <button
                  type="button"
                  className="btn-wizard-prev-step"
                  onClick={() => {
                    setCurrentStep(product.hasGemSelection && !isAccesorio ? 2 : 1);
                    window.scrollTo({ top: 100, behavior: "smooth" });
                  }}
                >
                  <i className="bi bi-arrow-left"></i>
                  <span>
                    {isAccesorio
                      ? "Volver a Diseño"
                      : product.hasGemSelection
                      ? "Volver a Gema"
                      : "Volver a Características"}
                  </span>
                </button>

                <button
                  type="button"
                  className="btn-wizard-finish-step"
                  onClick={handleChooseFeatures}
                  title="Ver resumen de características"
                >
                  <i className="bi bi-file-earmark-text"></i>
                  <span>VER RESUMEN</span>
                </button>

                {addToCart && (
                  <button
                    type="button"
                    className="btn-wizard-finish-step"
                    style={{
                      background: "linear-gradient(135deg, #0e2920 0%, #174232 100%)",
                      color: "#ffffff",
                      borderColor: "#c5a059",
                      boxShadow: "0 4px 15px rgba(14, 41, 32, 0.28)",
                    }}
                    onClick={handleAddToCartDirect}
                    title="Añadir esta joya personalizada a la bolsa de compras"
                  >
                    <i className="bi bi-bag-plus-fill" style={{ color: "#c5a059" }}></i>
                    <span>AÑADIR AL CARRITO</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

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
              borderRadius: "20px",
              padding: "32px",
              boxShadow: "0 25px 60px rgba(10, 39, 31, 0.25)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSummaryModalOpen(false)}
              style={{
                position: "absolute",
                top: "18px",
                right: "18px",
                border: "none",
                background: "#f4f1eb",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                fontSize: "14px",
                color: "#2c3b33",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              <i className="bi bi-x-lg"></i>
            </button>

            <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--platino-gold)" }}>
              Resumen de Personalización
            </span>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "26px", color: "var(--platino-green-dark)", margin: "4px 0 16px" }}>
              {product.name}
            </h3>

            <div style={{ background: "#fbfaf7", padding: "18px 20px", borderRadius: "14px", border: "1px solid #ebe6dc", fontSize: "13px", lineHeight: "1.8", marginBottom: "24px" }}>
              <div><strong>Metal:</strong> {selectedMetal.name}</div>
              {!isAccesorio && (
                isAros && targetGender === "ambos" ? (
                  <>
                    <div><strong>Talla Dama:</strong> {selectedSizeDama === "asesor" ? "Asesoría de Cortesía" : `Talla ${selectedSizeDama} (${DAMA_SIZES.find(s => s.number === selectedSizeDama)?.diameter || ""})`}</div>
                    <div><strong>Talla Varón:</strong> {selectedSizeVaron === "asesor" ? "Asesoría de Cortesía" : `Talla ${selectedSizeVaron} (${VARON_SIZES.find(s => s.number === selectedSizeVaron)?.diameter || ""})`}</div>
                  </>
                ) : targetGender === "varon" ? (
                  <div><strong>Talla Varón:</strong> {selectedSizeVaron === "asesor" ? "Asesoría de Cortesía" : `Talla ${selectedSizeVaron} (${VARON_SIZES.find(s => s.number === selectedSizeVaron)?.diameter || ""})`}</div>
                ) : (
                  <div><strong>Talla Dama:</strong> {selectedSizeDama === "asesor" ? "Asesoría de Cortesía" : `Talla ${selectedSizeDama} (${DAMA_SIZES.find(s => s.number === selectedSizeDama)?.diameter || ""})`}</div>
                )
              )}
              {product.hasGemSelection && (
                <div><strong>Gema:</strong> {selectedGemShape.name}</div>
              )}
              {hasEngraving && (
                <div>
                  <strong>Grabado:</strong> Sí solicita (Personalización por WhatsApp)
                </div>
              )}
              <div>
                <strong>Stock Disponible:</strong> {currentTotalStock} {currentTotalStock === 1 ? "unidad" : "unidades"}
              </div>
              <div>
                <strong>Plazo de Entrega:</strong>{" "}
                <span style={{ color: deliveryDays === 7 ? "#9a3412" : "#166534", fontWeight: "600" }}>
                  {deliveryDays === 7 ? "7 días hábiles (Ajuste en taller por stock reducido)" : "2 días hábiles (Despacho exprés)"}
                </span>{" "}
                — {deliveryDateFormatted}
              </div>
              {isAccesorio ? (
                <div><strong>Presentación:</strong> {product.presentationOptions?.find((o) => o.id === selectedPresentation)?.name}</div>
              ) : (
                <div><strong>Garantía:</strong> Platino Care {platinoCarePlan === "plus" ? `+ (S/. ${carePlusPrice})` : "Cortesía (S/. 0)"}</div>
              )}
              <div style={{ borderTop: "1px solid #e8e4db", paddingTop: "10px", marginTop: "10px", fontSize: "17px", fontWeight: "700", color: "#17241e" }}>
                Total: {formatPrice(product.price + (platinoCarePlan === "plus" && !isAccesorio ? carePlusPrice : 0))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <a
                href={getWhatsAppMessageUrl()}
                target="_blank"
                rel="noreferrer"
                className="btn-book-submit"
                style={{ backgroundColor: "#25d366", borderRadius: "9999px", padding: "14px 20px", textAlign: "center", textDecoration: "none", fontWeight: "700" }}
              >
                <i className="bi bi-whatsapp" style={{ marginRight: "6px" }}></i>
                Consultar / Cotizar por WhatsApp
              </a>

              <Link
                to={`/agendar-cita`}
                className="showroom-btn outline"
                style={{ textAlign: "center", borderRadius: "9999px", padding: "12px 20px" }}
              >
                Agendar Cita en Boutique para Probar Modelo
              </Link>

              {addToCart && (
                <button
                  type="button"
                  onClick={() => {
                    const customProduct = {
                      ...product,
                      selectedMetal: selectedMetal.name,
                      metal: selectedMetal.name,
                      selectedSize: isAros && targetGender === "ambos"
                        ? `Dama: ${selectedSizeDama === "asesor" ? "Asesoría" : selectedSizeDama} / Varón: ${selectedSizeVaron === "asesor" ? "Asesoría" : selectedSizeVaron}`
                        : (targetGender === "varon"
                            ? `Varón: ${selectedSizeVaron === "asesor" ? "Asesoría de medida" : selectedSizeVaron}`
                            : `Mujer: ${selectedSizeDama === "asesor" ? "Asesoría de medida" : selectedSizeDama}`),
                      size: isAros && targetGender === "ambos"
                        ? `Dama: ${selectedSizeDama === "asesor" ? "Asesoría" : selectedSizeDama} / Varón: ${selectedSizeVaron === "asesor" ? "Asesoría" : selectedSizeVaron}`
                        : (targetGender === "varon"
                            ? `Varón: ${selectedSizeVaron === "asesor" ? "Asesoría de medida" : selectedSizeVaron}`
                            : `Mujer: ${selectedSizeDama === "asesor" ? "Asesoría de medida" : selectedSizeDama}`),
                      selectedGemstone: product.hasGemSelection ? selectedGemShape.name : undefined,
                      gemstone: product.hasGemSelection ? selectedGemShape.name : undefined,
                      hasEngraving,
                      engraving: hasEngraving ? "Sí solicita (Personalización por WhatsApp)" : null,
                      needsSizeAdvice: (isAros && targetGender === "ambos" && (selectedSizeDama === "asesor" || selectedSizeVaron === "asesor")) || (targetGender === "varon" ? selectedSizeVaron === "asesor" : selectedSizeDama === "asesor"),
                      stockUnits: currentTotalStock,
                      deliveryDays,
                      estimatedDeliveryDate: deliveryDateFormatted,
                      price: product.price + (platinoCarePlan === "plus" && !isAccesorio ? carePlusPrice : 0),
                      image: mainImage || product.image,
                    };
                    addToCart(customProduct);
                    setSummaryModalOpen(false);
                  }}
                  className="showroom-btn filled"
                  style={{ borderRadius: "9999px", padding: "14px 20px" }}
                >
                  Añadir al Carrito
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: GUÍA DE TALLAS OFICIAL (DAMA 05-27 | VARÓN 10-37)
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
              maxWidth: "620px",
              width: "100%",
              borderRadius: "20px",
              padding: "32px",
              position: "relative",
              maxHeight: "88vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 60px rgba(10, 39, 31, 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSizeGuideOpen(false)}
              style={{
                position: "absolute",
                top: "18px",
                right: "18px",
                border: "none",
                background: "#f4f1eb",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                fontSize: "14px",
                color: "#2c3b33",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              <i className="bi bi-x-lg"></i>
            </button>

            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "24px", color: "var(--platino-green-dark)", margin: "0 0 8px" }}>
              Guía Oficial de Tallas Platino Perú
            </h3>
            <p style={{ fontSize: "12.5px", color: "#66726c", lineHeight: "1.5", margin: "0 0 16px 0" }}>
              Tallas calibradas en escala nacional milimétrica. Si tienes dudas, puedes seleccionar <em>«Necesito ayuda de un asesor»</em> o visitarnos en nuestras boutiques de Lima Centro y Miraflores para una medición gratuita con anillero profesional.
            </p>

            {/* Pestañas Dama / Varón */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", borderBottom: "1px solid #e0ded7", paddingBottom: "10px" }}>
              <button
                type="button"
                className={`guide-tab-btn ${sizeGuideTab === "dama" ? "active" : ""}`}
                onClick={() => setSizeGuideTab("dama")}
                style={{
                  padding: "8px 18px",
                  borderRadius: "20px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12.5px",
                  fontWeight: "600",
                  background: sizeGuideTab === "dama" ? "var(--platino-green-dark)" : "#f0ede6",
                  color: sizeGuideTab === "dama" ? "white" : "#4a5850",
                  transition: "all 0.2s ease",
                }}
              >
                <i className="bi bi-gender-female"></i> Tallas de Dama (05 al 27)
              </button>

              <button
                type="button"
                className={`guide-tab-btn ${sizeGuideTab === "varon" ? "active" : ""}`}
                onClick={() => setSizeGuideTab("varon")}
                style={{
                  padding: "8px 18px",
                  borderRadius: "20px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12.5px",
                  fontWeight: "600",
                  background: sizeGuideTab === "varon" ? "var(--platino-green-dark)" : "#f0ede6",
                  color: sizeGuideTab === "varon" ? "white" : "#4a5850",
                  transition: "all 0.2s ease",
                }}
              >
                <i className="bi bi-gender-male"></i> Tallas de Varón (10 al 37)
              </button>
            </div>

            {/* Tabla con scroll vertical */}
            <div style={{ overflowY: "auto", flex: "1", border: "1px solid #ebe7df", borderRadius: "14px", overflow: "hidden" }}>
              <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f5f3ec", textAlign: "left", position: "sticky", top: 0, zIndex: 1 }}>
                    <th style={{ padding: "10px 12px", fontWeight: "700" }}>Talla Oficial</th>
                    <th style={{ padding: "10px 12px", fontWeight: "700" }}>Diámetro Interior</th>
                    <th style={{ padding: "10px 12px", fontWeight: "700" }}>Circunferencia</th>
                    <th style={{ padding: "10px 12px", fontWeight: "700" }}>Disponibilidad en Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {(sizeGuideTab === "dama" ? DAMA_SIZES : VARON_SIZES).map((sz, idx) => {
                    const av = getSizeAvailability(productStock, sizeGuideTab, sz.number);
                    return (
                      <tr key={sz.number} style={{ borderBottom: "1px solid #f0ede6", background: idx % 2 === 0 ? "white" : "#faf9f6" }}>
                        <td style={{ padding: "9px 12px", fontWeight: "600", color: "var(--platino-green-dark)" }}>
                          {sz.label}
                        </td>
                        <td style={{ padding: "9px 12px", color: "#55645c" }}>
                          {sz.diameter}
                        </td>
                        <td style={{ padding: "9px 12px", color: "#55645c" }}>
                          {sz.circumference}
                        </td>
                        <td style={{ padding: "9px 12px" }}>
                          {av.total > 0 ? (
                            <span style={{ color: "#137748", fontWeight: "600", fontSize: "11px" }}>
                              <i className="bi bi-check-circle-fill"></i> {av.total} {av.total === 1 ? "unidad disponible" : "unidades disponibles"}
                            </span>
                          ) : (
                            <span style={{ color: "#8a9690", fontSize: "11px" }}>
                              A pedido (Fabricación)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
          <div style={{ position: "relative", maxHeight: "90vh", maxWidth: "90vw", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img
              src={mainImage}
              alt={product.name}
              style={{
                maxHeight: "90vh",
                maxWidth: "90vw",
                objectFit: "contain",
                borderRadius: "12px",
              }}
            />
          </div>
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

      {/* ========================================================
          MODAL: ASESORAMIENTO DE MEDIDA DE TALLA
          ======================================================== */}
      {sizeAdviceModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10001,
            padding: "20px",
          }}
          onClick={() => setSizeAdviceModalOpen(false)}
        >
          <div
            style={{
              background: "white",
              maxWidth: "580px",
              width: "100%",
              borderRadius: "20px",
              padding: "32px",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 60px rgba(10, 39, 31, 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSizeAdviceModalOpen(false)}
              style={{
                position: "absolute",
                top: "18px",
                right: "18px",
                border: "none",
                background: "#f4f1eb",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                fontSize: "14px",
                color: "#2c3b33",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i className="bi bi-x-lg"></i>
            </button>

            <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--platino-gold)" }}>
              Asesoría de Medida Personalizada
            </span>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "24px", color: "var(--platino-green-dark)", margin: "6px 0 12px" }}>
              ¿No conoces la talla exacta del anillo?
            </h3>
            <p style={{ fontSize: "13px", color: "#55645c", lineHeight: "1.6", margin: "0 0 20px" }}>
              En <strong>Platino Perú</strong> sabemos que una joya debe calzar con total perfección y confort. Por eso ponemos a tu disposición 3 facilidades sin costo adicional:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
              {/* Opción 1: Kit Anillero */}
              <div style={{ display: "flex", gap: "14px", padding: "14px 16px", borderRadius: "12px", background: "#fcfbfa", border: "1px solid #eee8df" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#f5eee2", color: "#997328", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                  <i className="bi bi-box-seam"></i>
                </div>
                <div>
                  <h4 style={{ margin: "0 0 3px", fontSize: "14px", color: "#17241e", fontWeight: "700" }}>
                    1. Envío de Kit Anillero Platino a Domicilio
                  </h4>
                  <p style={{ margin: 0, fontSize: "12px", color: "#55645c", lineHeight: "1.5" }}>
                    Te enviamos nuestro calibrador milimétrico oficial a tu domicilio en Lima o provincias para medir con calma y seguridad antes de la fundición final.
                  </p>
                </div>
              </div>

              {/* Opción 2: Asesoría WhatsApp */}
              <div style={{ display: "flex", gap: "14px", padding: "14px 16px", borderRadius: "12px", background: "#fcfbfa", border: "1px solid #eee8df" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#e8f8ed", color: "#15803d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                  <i className="bi bi-whatsapp"></i>
                </div>
                <div>
                  <h4 style={{ margin: "0 0 3px", fontSize: "14px", color: "#17241e", fontWeight: "700" }}>
                    2. Asesoría Directa con Maestro Joyero por WhatsApp
                  </h4>
                  <p style={{ margin: 0, fontSize: "12px", color: "#55645c", lineHeight: "1.5" }}>
                    Envíanos una fotografía de un anillo que la persona use habitualmente junto a una regla milimétrica o una moneda, y calculamos la talla al instante.
                  </p>
                </div>
              </div>

              {/* Opción 3: Boutique */}
              <div style={{ display: "flex", gap: "14px", padding: "14px 16px", borderRadius: "12px", background: "#fcfbfa", border: "1px solid #eee8df" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#edf3f0", color: "#0f2a24", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                  <i className="bi bi-geo-alt"></i>
                </div>
                <div>
                  <h4 style={{ margin: "0 0 3px", fontSize: "14px", color: "#17241e", fontWeight: "700" }}>
                    3. Prueba y Medición en Boutique (Miraflores / Lima Centro)
                  </h4>
                  <p style={{ margin: 0, fontSize: "12px", color: "#55645c", lineHeight: "1.5" }}>
                    Visítanos sin compromiso en nuestras salas de exhibición. Contamos con todas las tallas en metales reales y calibres profesionales.
                  </p>
                </div>
              </div>
            </div>

            {/* Acciones del Modal */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                type="button"
                className="showroom-btn filled"
                onClick={() => {
                  if (isAros && targetGender === "ambos") {
                    setSelectedSizeDama("asesor");
                    setSelectedSizeVaron("asesor");
                  } else if (targetGender === "varon") {
                    setSelectedSizeVaron("asesor");
                  } else {
                    setSelectedSizeDama("asesor");
                  }
                  setSizeAdviceModalOpen(false);
                }}
              >
                <i className="bi bi-check2-circle" style={{ marginRight: "6px" }}></i>
                Seleccionar «Asesoría de Medida» para este pedido
              </button>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <a
                  href={`https://wa.me/51927357217?text=${encodeURIComponent(`Hola Platino Perú, necesito asesoramiento de medida para el anillo "${product.name}". ¿Podrían orientarme sobre cómo determinar la talla correcta?`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-book-submit"
                  style={{ backgroundColor: "#25d366", borderRadius: "9999px", padding: "11px 16px", textAlign: "center", textDecoration: "none", fontSize: "12.5px" }}
                >
                  <i className="bi bi-whatsapp" style={{ marginRight: "6px" }}></i>
                  Hablar con Joyero
                </a>

                <button
                  type="button"
                  className="showroom-btn outline"
                  style={{ borderRadius: "9999px", padding: "11px 16px", fontSize: "12.5px" }}
                  onClick={() => {
                    setSizeAdviceModalOpen(false);
                    setSizeGuideOpen(true);
                  }}
                >
                  <i className="bi bi-table" style={{ marginRight: "6px" }}></i>
                  Ver Tabla Milimétrica
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
