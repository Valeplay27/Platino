import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { DiamondCutIcon } from "../components/GemstoneIcons";
import GemstoneStoneVisual from "../components/GemstoneStoneVisual";
import AsesoriaOnlineModal from "../components/AsesoriaOnlineModal";
import { sedesData } from "../data/sedes";
import { getHomeImages } from "../services/homeImagesService";
import "../../styles/home.css";

const GEM_SHAPES = [
  { id: "oval", name: "Oval", desc: "Silueta alargada que estiliza la mano con brillo suave y elegante.", ratio: "1.35 - 1.50", popularCarat: "1.25 ct" },
  { id: "redondo", name: "Redondo", desc: "El corte clásico por excelencia, diseñado para maximizar el fuego y refracción.", ratio: "1.00", popularCarat: "1.00 ct" },
  { id: "esmeralda", name: "Esmeralda", desc: "Corte escalonado de gran claridad con reflejos tipo sala de espejos.", ratio: "1.30 - 1.45", popularCarat: "1.50 ct" },
  { id: "marquesa", name: "Marquesa", desc: "Silueta regia de puntas afiladas con máxima superficie visual por quilate.", ratio: "1.75 - 2.15", popularCarat: "1.05 ct" },
  { id: "pera", name: "Pera", desc: "Lágrima luminosa que fusiona la suavidad del redondo con el corte marquesa.", ratio: "1.50 - 1.70", popularCarat: "1.20 ct" },
  { id: "corazón", name: "Corazón", desc: "El símbolo definitivo de devoción y romance eterno tallado a mano.", ratio: "0.90 - 1.05", popularCarat: "1.00 ct" },
  { id: "cojín", name: "Cojín", desc: "Bordes redondeados de inspiración vintage con facetas profundas y luminosas.", ratio: "1.00 - 1.05", popularCarat: "1.30 ct" },
  { id: "princesa", name: "Princesa", desc: "Corte cuadrado contemporáneo de líneas puras con destello geométrico.", ratio: "1.00 - 1.03", popularCarat: "1.10 ct" },
];

const TRUST_BADGES = [
  { icon: "bi bi-truck", label: "ENVÍO A TODO EL PERÚ" },
  { icon: "bi bi-shield-check", label: "GARANTÍA Y MANTENIMIENTO" },
  { icon: "bi bi-headset", label: "ASESORÍA PERSONALIZADA" },
  { icon: "bi bi-gem", label: "RESPALDO GEMOLÓGICO" },
  { icon: "bi bi-circle", label: "ENTALLADO GRATUITO" },
];

export default function Home() {
  const [selectedCut, setSelectedCut] = useState(GEM_SHAPES[0]);
  const [viewMode, setViewMode] = useState("piedra"); // 'piedra' | 'sortija'
  const [asesoriaModalOpen, setAsesoriaModalOpen] = useState(false);
  const [homeImages, setHomeImages] = useState(getHomeImages);

  // Scroll infinito continuo con aceleración GPU (translate3d)
  const trackRef = useRef(null);
  const posRef = useRef(0);
  const isPausedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartPosRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const [isGrabbing, setIsGrabbing] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setHomeImages(getHomeImages());
    };
    window.addEventListener("home_images_updated", handleUpdate);
    return () => window.removeEventListener("home_images_updated", handleUpdate);
  }, []);

  const categories = [
    { name: homeImages.catCompromiso?.name || "ANILLO DE COMPROMISO", img: homeImages.catCompromiso?.image || "/images/cat-compromiso.jpg", path: "/categoria/anillos-compromiso" },
    { name: homeImages.catBoda?.name || "AROS DE BODA", img: homeImages.catBoda?.image || "/images/cat-boda.jpg", path: "/categoria/aros-boda" },
    { name: homeImages.catPromesa?.name || "ANILLO DE PROMESA", img: homeImages.catPromesa?.image || "/images/cat-promesa.jpg", path: "/categoria/anillos-promesa" },
    { name: homeImages.catAlianzas?.name || "AROS DE ALIANZAS", img: homeImages.catAlianzas?.image || "/images/cat-alianzas.jpg", path: "/categoria/alianzas" },
    { name: homeImages.catPulseras?.name || "PULSERAS", img: homeImages.catPulseras?.image || "/images/cat-pulseras.jpg", path: "/categoria/pulseras" },
    { name: homeImages.catCollares?.name || "COLLARES", img: homeImages.catCollares?.image || "/images/cat-collares.jpg", path: "/categoria/collares" },
  ];

  // Cuadruplicamos las categorías para permitir un bucle infinito continuo sin fin
  const carouselCategories = [
    ...categories,
    ...categories,
    ...categories,
    ...categories,
  ];

  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();
    // Velocidad constante y elegante (~46 píxeles por segundo)
    const speed = 46;

    const tick = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (!isPausedRef.current && !isDraggingRef.current && trackRef.current) {
        const firstCard = trackRef.current.querySelector(".category-card");
        if (firstCard) {
          const cardWidth = firstCard.offsetWidth + 20; // 20px gap
          const singleSetWidth = cardWidth * categories.length;

          posRef.current += speed * delta;

          // Bucle infinito perfecto: cuando avanza un set completo, se reinicia de forma imperceptible
          if (posRef.current >= singleSetWidth) {
            posRef.current -= singleSetWidth;
          }

          trackRef.current.style.transform = `translate3d(-${posRef.current}px, 0, 0)`;
        }
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrameId);
  }, [categories.length]);

  const scrollCategoryCarousel = (direction) => {
    if (!trackRef.current) return;
    const firstCard = trackRef.current.querySelector(".category-card");
    if (!firstCard) return;
    const cardWidth = firstCard.offsetWidth + 20;
    const singleSetWidth = cardWidth * categories.length;
    const step = cardWidth * 1.5;

    if (direction === "next") {
      posRef.current += step;
      if (posRef.current >= singleSetWidth * 2) {
        posRef.current -= singleSetWidth;
      }
    } else {
      posRef.current -= step;
      if (posRef.current < 0) {
        posRef.current += singleSetWidth;
      }
    }

    trackRef.current.style.transform = `translate3d(-${posRef.current}px, 0, 0)`;
  };

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    setIsGrabbing(true);
    dragStartXRef.current = e.pageX;
    dragStartPosRef.current = posRef.current;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !trackRef.current) return;
    const diff = e.pageX - dragStartXRef.current;
    if (Math.abs(diff) > 4) {
      hasDraggedRef.current = true;
    }
    const firstCard = trackRef.current.querySelector(".category-card");
    const cardWidth = firstCard ? firstCard.offsetWidth + 20 : 235;
    const singleSetWidth = cardWidth * categories.length;

    let newPos = dragStartPosRef.current - diff;
    if (newPos >= singleSetWidth) newPos -= singleSetWidth;
    if (newPos < 0) newPos += singleSetWidth;

    posRef.current = newPos;
    trackRef.current.style.transform = `translate3d(-${newPos}px, 0, 0)`;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setIsGrabbing(false);
  };

  const handleCardClick = (e) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
    }
  };

  const ringStyles = [
    {
      name: homeImages.styleNaturaleza?.name || "Anillos inspirados en la naturaleza",
      img: homeImages.styleNaturaleza?.image || "/images/style-naturaleza.jpg",
      path: "/categoria/anillos-naturaleza",
    },
    {
      name: homeImages.styleVintage?.name || "Anillos antiguos y vintage",
      img: homeImages.styleVintage?.image || "/images/style-vintage.jpg",
      path: "/categoria/anillos-vintage",
    },
    {
      name: homeImages.styleTresPiedras?.name || "Anillos de tres piedras",
      img: homeImages.styleTresPiedras?.image || "/images/style-tres-piedras.jpg",
      path: "/categoria/anillos-tres-piedras",
    },
    {
      name: homeImages.styleSolitarios?.name || "Anillos solitarios",
      img: homeImages.styleSolitarios?.image || "/images/style-solitarios.jpg",
      path: "/categoria/anillos-solitarios",
    },
    {
      name: homeImages.styleNupciales?.name || "Conjuntos nupciales",
      img: homeImages.styleNupciales?.image || "/images/style-nupciales.jpg",
      path: "/categoria/conjuntos-nupciales",
    },
    {
      name: homeImages.styleBisel?.name || "Anillos de bisel",
      img: homeImages.styleBisel?.image || "/images/style-bisel.jpg",
      path: "/categoria/anillos-bisel",
    },
  ];

  return (
    <div className="home-page">
      {/* 1. HERO SPLIT: Compromiso & Matrimonio */}
      <section className="hero-split-section" aria-label="Colecciones destacadas">
        {/* Banner Izquierdo: Compromiso */}
        <Link to="/categoria/anillos-compromiso" className="hero-banner-card">
          <img
            src={homeImages.heroCompromiso?.image || "/images/hero-compromiso.jpg"}
            alt="Anillos de Compromiso Platino Perú"
            className="hero-banner-bg"
            loading="eager"
          />
          <div className="hero-banner-overlay" />
          <div className="hero-banner-content">
            <h2 className="hero-banner-title">{homeImages.heroCompromiso?.title || "Compromiso"}</h2>
            <span className="hero-banner-btn">{homeImages.heroCompromiso?.buttonText || "Ver Colección"}</span>
          </div>
        </Link>

        {/* Banner Derecho: Matrimonio */}
        <Link to="/categoria/aros-boda" className="hero-banner-card">
          <img
            src={homeImages.heroMatrimonio?.image || "/images/hero-matrimonio.jpg"}
            alt="Aros de Matrimonio Platino Perú"
            className="hero-banner-bg"
            loading="eager"
          />
          <div className="hero-banner-overlay" />
          <div className="hero-banner-content">
            <h2 className="hero-banner-title">{homeImages.heroMatrimonio?.title || "Matrimonio"}</h2>
            <span className="hero-banner-btn">{homeImages.heroMatrimonio?.buttonText || "Ver Colección"}</span>
          </div>
        </Link>
      </section>

      {/* 2. COMPRAR JOYAS POR CATEGORÍA */}
      <section className="categories-section">
        <div className="section-header-left">
          <h2 className="section-title">Comprar joyas por categoría</h2>
          <p className="section-subtitle">
            Colecciones cuidadosamente diseñadas para el gran día y todos los días.
          </p>
        </div>

        <div
          className="categories-carousel-wrapper"
          onMouseEnter={() => {
            isPausedRef.current = true;
          }}
          onMouseLeave={() => {
            isPausedRef.current = false;
            handleMouseUp();
          }}
          onTouchStart={() => {
            isPausedRef.current = true;
          }}
          onTouchEnd={() => {
            isPausedRef.current = false;
          }}
        >
          <button
            type="button"
            className="carousel-prev-arrow"
            aria-label="Ver categorías anteriores"
            onClick={() => scrollCategoryCarousel("prev")}
          >
            <i className="bi bi-chevron-left"></i>
          </button>

          <div
            className={`categories-track ${isGrabbing ? "is-dragging" : ""}`}
            ref={trackRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {carouselCategories.map((cat, idx) => (
              <Link
                key={`${cat.path}-${idx}`}
                to={cat.path}
                className="category-card"
                onClick={handleCardClick}
              >
                <div className="category-img-box">
                  <img src={cat.img} alt={cat.name} className="category-img" loading="lazy" />
                </div>
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>

          <button
            type="button"
            className="carousel-next-arrow"
            aria-label="Ver más categorías"
            onClick={() => scrollCategoryCarousel("next")}
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </section>

      {/* 3. SELECCIONA LA FORMA DE TU GEMA */}
      <section className="gem-selector-section">
        <div className="gem-selector-layout">
          {/* Columna Izquierda: Render de la gema o de la sortija */}
          <div className="gem-preview-col">
            <h2 className="gem-section-heading">
              Selecciona la forma de tu gema
            </h2>

            {/* Selector de modo de vista: Gema Suelta vs En Sortija */}
            <div className="gem-view-toggle">
              <button
                type="button"
                className={`gem-toggle-btn ${viewMode === "piedra" ? "active" : ""}`}
                onClick={() => setViewMode("piedra")}
                title="Ver la piedra suelta con sus facetas y brillo"
              >
                <i className="bi bi-gem"></i> Gema Suelta
              </button>
              <button
                type="button"
                className={`gem-toggle-btn ${viewMode === "sortija" ? "active" : ""}`}
                onClick={() => setViewMode("sortija")}
                title="Ver montada en sortija de platino"
              >
                <i className="bi bi-circle"></i> En Sortija
              </button>
            </div>

            {viewMode === "piedra" ? (
              <div className="gem-stone-card-preview">
                <GemstoneStoneVisual
                  shape={selectedCut.id}
                  size={165}
                  carat={selectedCut.popularCarat}
                />
                <p className="gem-stone-desc">{selectedCut.desc}</p>
              </div>
            ) : (
              <div className="gem-ring-preview">
                <img
                  src={homeImages.ringRender?.image || "/images/ring-render.png"}
                  alt="Montura de sortija en platino con diamante"
                  className="gem-ring-img"
                />
              </div>
            )}

            <div className="gem-active-badge">
              <span>Corte {selectedCut.name} seleccionado</span>
            </div>

            {/* Botón para ir al Catálogo de Gemas con el filtro de esa piedra */}
            <Link
              to={`/catalogo-gemas?forma=${selectedCut.id}`}
              className="btn-go-gemstones-catalog"
              title={`Ver todos los diamantes y gemas certificadas corte ${selectedCut.name}`}
            >
              <span>Ver Catálogo de Gemas {selectedCut.name}</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          {/* Columna Derecha: Cuadrícula 4x2 de Formas */}
          <div className="gem-grid-col">
            {GEM_SHAPES.map((gem) => {
              const isActive = selectedCut.id === gem.id;
              return (
                <button
                  key={gem.id}
                  className={`gem-cut-btn ${isActive ? "active" : ""}`}
                  onClick={() => setSelectedCut(gem)}
                  title={`${gem.name}: ${gem.desc}`}
                >
                  <div className="gem-icon-container">
                    <DiamondCutIcon shape={gem.id} size={46} />
                  </div>
                  <span className="gem-cut-label">{gem.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. ANILLOS DE COMPROMISO DIGNOS DE OBSESIÓN */}
      <section className="ring-styles-section">
        <div className="section-header-left">
          <h2 className="section-title">Anillos de compromiso dignos de obsesión</h2>
          <p className="section-subtitle">Arte y artesanía en cada detalle.</p>
        </div>

        <div className="ring-styles-grid">
          {ringStyles.map((style, idx) => (
            <Link key={idx} to={style.path} className="ring-style-card">
              <div className="ring-style-img-wrapper">
                <img
                  src={style.img}
                  alt={style.name}
                  className="ring-style-img"
                  loading="lazy"
                />
              </div>
              <span className="ring-style-title">{style.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. EDITORIAL: THE FALL EDIT & THE NEW CLASSICS */}
      <section className="editorial-section">
        <div className="editorial-layout">
          {/* Lado Izquierdo: The Fall Edit */}
          <div className="editorial-left">
            <img
              src={homeImages.editorialFall?.image || "/images/editorial-fall.jpg"}
              alt="The Fall Edit - Platino Perú"
              className="editorial-left-img"
              loading="lazy"
            />
            <div className="editorial-left-overlay" />
            <div className="editorial-left-content">
              <h2 className="editorial-title">{homeImages.editorialFall?.title || "The Fall Edit"}</h2>
              <p className="editorial-text">
                {homeImages.editorialFall?.subtitle || "Some designs never go out of style. Discover new classics for the season ahead."}
              </p>
              <Link to="/categoria/joyeria" className="editorial-btn">
                Shop Now
              </Link>
            </div>
          </div>

          {/* Lado Derecho: The New Classics con Mosaico */}
          <div className="editorial-right">
            <div className="mosaic-grid">
              <div className="mosaic-item">
                <img src={homeImages.mosaic1?.image || "/images/mosaic-1.jpg"} alt={homeImages.mosaic1?.alt || "Diamond Tennis Necklace"} loading="lazy" />
              </div>
              <div className="mosaic-item">
                <img src={homeImages.mosaic2?.image || "/images/mosaic-2.jpg"} alt={homeImages.mosaic2?.alt || "Emerald Solitaire Pendant"} loading="lazy" />
              </div>
              <div className="mosaic-item">
                <img src={homeImages.mosaic3?.image || "/images/mosaic-3.jpg"} alt={homeImages.mosaic3?.alt || "Sapphire & Diamond Band"} loading="lazy" />
              </div>
              <div className="mosaic-item">
                <img src={homeImages.mosaic4?.image || "/images/mosaic-4.jpg"} alt={homeImages.mosaic4?.alt || "Cocktail Gemstone Rings"} loading="lazy" />
              </div>
              <div className="mosaic-item">
                <img src={homeImages.mosaic5?.image || "/images/mosaic-5.jpg"} alt={homeImages.mosaic5?.alt || "Ruby Eternity Band"} loading="lazy" />
              </div>
              <div className="mosaic-item">
                <img src={homeImages.mosaic6?.image || "/images/mosaic-6.jpg"} alt={homeImages.mosaic6?.alt || "Bridal Diamond Collection"} loading="lazy" />
              </div>
            </div>

            {/* Script Elegante Superpuesto */}
            <div className="mosaic-script-overlay">
              <span className="script-text">The New Classics</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ESTAMOS AQUÍ PARA TI, EN PERSONA Y EN LÍNEA */}
      <section className="showroom-section">
        <div className="showroom-layout">
          {/* Izquierda: Imagen del Showroom */}
          <div className="showroom-image-box">
            <img
              src={homeImages.showroom?.image || "/images/showroom.jpg"}
              alt="Boutique y Showroom Platino Perú"
              className="showroom-img"
              loading="lazy"
            />
          </div>

          {/* Derecha: Texto, Sedes y Botones de Cita */}
          <div className="showroom-info">
            <h2 className="showroom-heading">
              Estamos aquí para ti, en persona y en línea
            </h2>
            <p className="showroom-desc">
              Ya sea en una tienda cercana a usted o en línea, seleccionamos su cita solo para usted.
            </p>

            {/* Tarjetas rápidas de las 2 Sedes con enlaces a Google Maps */}
            <div className="showroom-sedes-preview">
              {sedesData.map((sede) => (
                <a
                  key={sede.id}
                  href={sede.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="showroom-sede-card"
                  title={`Ver ${sede.name} en Google Maps`}
                >
                  <span className="showroom-sede-tag">
                    <i className="bi bi-geo-alt-fill"></i> {sede.name}
                  </span>
                  <p className="showroom-sede-address">{sede.address}</p>
                  <span className="showroom-sede-link">
                    Cómo llegar <i className="bi bi-arrow-up-right"></i>
                  </span>
                </a>
              ))}
            </div>

            <div className="showroom-buttons-grid">
              <Link to="/sedes" className="showroom-btn outline">
                Descubrir Sedes
              </Link>
              <Link to="/agendar-cita?tipo=asesoria" className="showroom-btn outline">
                Cita en Joyería
              </Link>
              <button
                type="button"
                onClick={() => setAsesoriaModalOpen(true)}
                className="showroom-btn filled"
                title="Conéctate por WhatsApp con el asesor de tu sede más cercana"
              >
                Asesoría Online
              </button>
              <Link to="/agendar-cita?tipo=gemologo" className="showroom-btn outline">
                Cita con Gemólogo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. RESPALDO PLATINO */}
      <section className="respaldo-section">
        <div className="respaldo-container">
          <h2 className="respaldo-heading">Respaldo Platino</h2>
          <div className="respaldo-grid">
            {TRUST_BADGES.map((badge, idx) => (
              <div key={idx} className="respaldo-item">
                <div className="respaldo-icon-circle">
                  <i className={badge.icon}></i>
                </div>
                <span className="respaldo-label">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal Interactivo de Asesoría Online por Sede */}
      <AsesoriaOnlineModal
        isOpen={asesoriaModalOpen}
        onClose={() => setAsesoriaModalOpen(false)}
      />
    </div>
  );
}
