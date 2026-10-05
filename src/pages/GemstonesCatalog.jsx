import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CERTIFIED_GEMSTONES,
  GEM_SHAPES_DATA,
  GEM_TYPES,
  DIAMOND_COLORS,
  CLARITY_GRADES,
  GEM_COLORS,
} from "../data/gemstones";
import { DiamondCutIcon } from "../components/GemstoneIcons";
import GemstoneStoneVisual from "../components/GemstoneStoneVisual";
import "../../styles/gemstones.css";

export default function GemstonesCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados de filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("todos");
  const selectedShape = searchParams.get("forma") || "todas";
  const [selectedDiamondColor, setSelectedDiamondColor] = useState("todos");
  const [selectedGemColor, setSelectedGemColor] = useState("todos");
  const [selectedClarity, setSelectedClarity] = useState("todos");
  const [selectedMmRange, setSelectedMmRange] = useState("todos");
  const [selectedCaratRange, setSelectedCaratRange] = useState("todos");
  const [sortBy, setSortBy] = useState("destacados");

  // Modal de detalle de gema
  const [detailGem, setDetailGem] = useState(null);

  // Actualizar URL cuando el usuario cambia de forma
  const handleShapeSelect = (shapeId) => {
    const nextParams = new URLSearchParams(searchParams);
    if (shapeId === "todas") {
      nextParams.delete("forma");
    } else {
      nextParams.set("forma", shapeId);
    }
    setSearchParams(nextParams);
  };

  // Contadores por forma para los chips
  const shapeCounts = useMemo(() => {
    const counts = {};
    GEM_SHAPES_DATA.forEach((s) => {
      counts[s.id] = CERTIFIED_GEMSTONES.filter((g) => g.shape === s.id).length;
    });
    return counts;
  }, []);

  // Filtrado de gemas
  const filteredGemstones = useMemo(() => {
    return CERTIFIED_GEMSTONES.filter((gem) => {
      // 1. Búsqueda por texto (nombre, cert, corte)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = gem.name.toLowerCase().includes(q);
        const matchCert = gem.certNumber.toLowerCase().includes(q);
        const matchShape = gem.shape.toLowerCase().includes(q);
        if (!matchName && !matchCert && !matchShape) return false;
      }

      // 2. Tipo de Gema
      if (selectedType !== "todos" && gem.type !== selectedType) {
        return false;
      }

      // 3. Forma / Corte
      if (selectedShape !== "todas" && gem.shape !== selectedShape) {
        return false;
      }

      // 4. Color de Diamante
      if (selectedDiamondColor !== "todos" && gem.color !== selectedDiamondColor) {
        return false;
      }

      // 5. Color de Gema
      if (selectedGemColor !== "todos" && gem.gemColor !== selectedGemColor) {
        return false;
      }

      // 6. Pureza
      if (selectedClarity !== "todos" && gem.clarity !== selectedClarity) {
        return false;
      }

      // 7. Tamaño en mm
      if (selectedMmRange !== "todos") {
        if (selectedMmRange === "menor-6" && gem.mm >= 6.0) return false;
        if (selectedMmRange === "6-7.5" && (gem.mm < 6.0 || gem.mm > 7.5)) return false;
        if (selectedMmRange === "7.5-9" && (gem.mm < 7.5 || gem.mm > 9.0)) return false;
        if (selectedMmRange === "mayor-9" && gem.mm <= 9.0) return false;
      }

      // 8. Rango de Carat
      if (selectedCaratRange !== "todos") {
        if (selectedCaratRange === "0.5-0.79" && (gem.carat < 0.5 || gem.carat >= 0.8)) return false;
        if (selectedCaratRange === "0.8-0.99" && (gem.carat < 0.8 || gem.carat >= 1.0)) return false;
        if (selectedCaratRange === "1.0-1.49" && (gem.carat < 1.0 || gem.carat >= 1.5)) return false;
        if (selectedCaratRange === "1.5-1.99" && (gem.carat < 1.5 || gem.carat >= 2.0)) return false;
        if (selectedCaratRange === "2.0-plus" && gem.carat < 2.0) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "precio-menor") return a.price - b.price;
      if (sortBy === "precio-mayor") return b.price - a.price;
      if (sortBy === "carat-mayor") return b.carat - a.carat;
      return 0; // destacados / orden por defecto
    });
  }, [
    searchQuery,
    selectedType,
    selectedShape,
    selectedDiamondColor,
    selectedGemColor,
    selectedClarity,
    selectedMmRange,
    selectedCaratRange,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedType("todos");
    setSelectedShape("todas");
    setSelectedDiamondColor("todos");
    setSelectedGemColor("todos");
    setSelectedClarity("todos");
    setSelectedMmRange("todos");
    setSelectedCaratRange("todos");
    setSortBy("destacados");
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("forma");
    setSearchParams(nextParams);
  };

  const currentShapeObj = GEM_SHAPES_DATA.find((s) => s.id === selectedShape);

  return (
    <div className="gemstones-page">
      {/* Banner Superior Hero */}
      <div className="gemstones-hero">
        <div className="gemstones-hero-content">
          <span className="gemstones-eyebrow">
            <i className="bi bi-gem"></i> GIA & IGI CERTIFICACIÓN INTERNACIONAL
          </span>
          <h1 className="gemstones-title">
            Catálogo de Diamantes & Gemas Preciosas
          </h1>
          <p className="gemstones-desc">
            Encuentra la piedra perfecta para tu sortija de compromiso o matrimonio. Cada gema cuenta con certificación gemológica, trazabilidad ética y respaldo oficial en Platino Perú.
          </p>

          {/* Breadcrumb */}
          <div className="gemstones-breadcrumb">
            <Link to="/">Inicio</Link>
            <span>/</span>
            <Link to="/categoria/anillo-compromiso">Compromiso</Link>
            <span>/</span>
            <strong>Gemas & Diamantes</strong>
          </div>
        </div>
      </div>

      <div className="gemstones-container">
        {/* Layout en 2 Columnas: Barra lateral de Filtros + Grid de Gemas */}
        <div className="gemstones-layout">
          {/* ========================================================
              COLUMNA IZQUIERDA: FILTROS ESTILO PLATINO (UX MEJORADO)
              ======================================================== */}
          <aside className="gemstones-filters-sidebar">
            <div className="filters-sidebar-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="bi bi-sliders" style={{ color: "var(--platino-green-dark)", fontSize: "18px" }}></i>
                <h3 className="filters-sidebar-title">Filtros de Búsqueda</h3>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-reset-filters"
                title="Restablecer todos los filtros"
              >
                Limpiar Todo
              </button>
            </div>

            {/* 1. Buscar */}
            <div className="filter-group">
              <label className="filter-label">Buscar Gema o Certificado</label>
              <div className="filter-search-box">
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  placeholder="Ej: GIA, Oval, 1.50 ct..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="filter-input-search"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="btn-clear-search"
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>

            {/* 2. Selección de Gemas (Tipo) */}
            <div className="filter-group">
              <label className="filter-label">Selección de Gemas</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="filter-select-modern"
              >
                {GEM_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Forma / Corte */}
            <div className="filter-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label className="filter-label" style={{ margin: 0 }}>
                  Forma / Corte
                </label>
                {selectedShape !== "todas" && (
                  <button
                    type="button"
                    onClick={() => handleShapeSelect("todas")}
                    style={{ background: "none", border: "none", color: "#137748", fontSize: "11.5px", fontWeight: "600", cursor: "pointer" }}
                  >
                    Ver todas
                  </button>
                )}
              </div>

              <div className="shape-chips-grid">
                <button
                  type="button"
                  className={`shape-chip ${selectedShape === "todas" ? "active" : ""}`}
                  onClick={() => handleShapeSelect("todas")}
                >
                  <span className="shape-chip-name">Todas</span>
                  <span className="shape-chip-count">{CERTIFIED_GEMSTONES.length}</span>
                </button>

                {GEM_SHAPES_DATA.map((shape) => {
                  const count = shapeCounts[shape.id] || 0;
                  const isActive = selectedShape === shape.id;
                  return (
                    <button
                      key={shape.id}
                      type="button"
                      className={`shape-chip ${isActive ? "active" : ""}`}
                      onClick={() => handleShapeSelect(shape.id)}
                    >
                      <div className="shape-chip-icon">
                        <DiamondCutIcon shape={shape.id} size={20} />
                      </div>
                      <span className="shape-chip-name">{shape.name}</span>
                      <span className="shape-chip-count">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Color de Diamante */}
            <div className="filter-group">
              <label className="filter-label">Color de Diamante (Escala GIA)</label>
              <div className="color-grades-row">
                <button
                  type="button"
                  className={`color-pill ${selectedDiamondColor === "todos" ? "active" : ""}`}
                  onClick={() => setSelectedDiamondColor("todos")}
                >
                  Todos
                </button>
                {DIAMOND_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    className={`color-pill ${selectedDiamondColor === col ? "active" : ""}`}
                    onClick={() => setSelectedDiamondColor(col)}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Color de Gema (Swatches para Gemas de Color) */}
            <div className="filter-group">
              <label className="filter-label">Tonalidad / Color de Gema</label>
              <div className="gem-color-swatches">
                <button
                  type="button"
                  className={`color-swatch-item ${selectedGemColor === "todos" ? "active" : ""}`}
                  onClick={() => setSelectedGemColor("todos")}
                  title="Todos los colores"
                >
                  <span className="swatch-circle all">❖</span>
                  <span className="swatch-name">Todos</span>
                </button>

                {GEM_COLORS.map((gc) => (
                  <button
                    key={gc.id}
                    type="button"
                    className={`color-swatch-item ${selectedGemColor === gc.id ? "active" : ""}`}
                    onClick={() => setSelectedGemColor(gc.id)}
                    title={gc.label}
                  >
                    <span
                      className="swatch-circle"
                      style={{ backgroundColor: gc.hex }}
                    />
                    <span className="swatch-name">{gc.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Pureza (Clarity) */}
            <div className="filter-group">
              <label className="filter-label">Pureza (Clarity)</label>
              <select
                value={selectedClarity}
                onChange={(e) => setSelectedClarity(e.target.value)}
                className="filter-select-modern"
              >
                <option value="todos">- Seleccionar Pureza (Todas) -</option>
                {CLARITY_GRADES.map((cl) => (
                  <option key={cl} value={cl}>
                    {cl} {cl === "FL" || cl === "IF" ? "(Sin inclusiones)" : cl.includes("VVS") ? "(Inclusiones mínimas)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* 7. Tamaño (mm) */}
            <div className="filter-group">
              <label className="filter-label">Tamaño Exterior (mm)</label>
              <select
                value={selectedMmRange}
                onChange={(e) => setSelectedMmRange(e.target.value)}
                className="filter-select-modern"
              >
                <option value="todos">- Seleccionar Tamaño (mm) -</option>
                <option value="menor-6">Menor a 6.0 mm (Sortijas delicadas)</option>
                <option value="6-7.5">6.0 a 7.5 mm (Tamaño clásico)</option>
                <option value="7.5-9">7.5 a 9.0 mm (Gran presencia)</option>
                <option value="mayor-9">Mayor a 9.0 mm (Exclusiva)</option>
              </select>
            </div>

            {/* 8. Peso / Carat (ct) */}
            <div className="filter-group">
              <label className="filter-label">Peso / Carat (ct)</label>
              <select
                value={selectedCaratRange}
                onChange={(e) => setSelectedCaratRange(e.target.value)}
                className="filter-select-modern"
              >
                <option value="todos">- Seleccionar Peso / Carat (ct) -</option>
                <option value="0.5-0.79">0.50 a 0.79 ct</option>
                <option value="0.8-0.99">0.80 a 0.99 ct</option>
                <option value="1.0-1.49">1.00 a 1.49 ct (Más cotizado)</option>
                <option value="1.5-1.99">1.50 a 1.99 ct</option>
                <option value="2.0-plus">2.00 ct a más</option>
              </select>
            </div>

            {/* Banner de Asesoría Gemológica */}
            <div className="gem-advisor-card">
              <div className="advisor-icon">
                <i className="bi bi-award"></i>
              </div>
              <h4>¿Dudas eligiendo la gema?</h4>
              <p>
                Agenda una sesión con nuestro asesor especialista para evaluar el corte, brillo y proporciones de tus gemas.
              </p>
              <Link to="/agendar-cita" className="btn-advisor-link">
                Agendar Asesoría en Sede <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </aside>

          {/* ========================================================
              COLUMNA DERECHA: RESULTADOS DEL CATÁLOGO DE GEMAS
              ======================================================== */}
          <main className="gemstones-results-col">
            {/* Barra superior de resultados */}
            <div className="results-top-bar">
              <div>
                <h2 className="results-count-title">
                  {filteredGemstones.length}{" "}
                  {filteredGemstones.length === 1 ? "Gema Encontrada" : "Gemas Certificadas Disponibles"}
                  {selectedShape !== "todas" && currentShapeObj && (
                    <span className="selected-shape-tag">
                      Corte {currentShapeObj.name}
                    </span>
                  )}
                </h2>
                <p className="results-subtext">
                  Gemas con grabado láser en el filetín y certificado físico GIA / IGI.
                </p>
              </div>

              {/* Ordenamiento */}
              <div className="results-sort-box">
                <label>Ordenar por:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="results-sort-select"
                >
                  <option value="destacados">Recomendadas Platino</option>
                  <option value="precio-menor">Precio: Menor a Mayor</option>
                  <option value="precio-mayor">Precio: Mayor a Menor</option>
                  <option value="carat-mayor">Mayor Quilate (Carat)</option>
                </select>
              </div>
            </div>

            {/* Grid de Gemas */}
            {filteredGemstones.length === 0 ? (
              <div className="no-gems-found">
                <i className="bi bi-gem"></i>
                <h3>No se encontraron gemas con estos criterios</h3>
                <p>
                  Intenta ampliar los rangos de quilate, pureza o forma para ver más opciones disponibles en stock.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn-catalog-cta"
                  style={{ marginTop: "16px" }}
                >
                  Ver Todas las Gemas
                </button>
              </div>
            ) : (
              <div className="gemstones-grid">
                {filteredGemstones.map((gem) => (
                  <div key={gem.id} className="gem-card">
                    {/* Badge de Certificación */}
                    <div className="gem-card-header">
                      <span className="cert-pill">
                        <i className="bi bi-patch-check-fill"></i> {gem.certificate}
                      </span>
                      <span className="stock-pill">En Stock</span>
                    </div>

                    {/* Previsualización visual de la gema con facetas y brillos */}
                    <div
                      className="gem-card-visual-wrapper"
                      onClick={() => setDetailGem(gem)}
                      title="Haz clic para inspeccionar detalles y certificado"
                    >
                      <GemstoneStoneVisual
                        shape={gem.shape}
                        color={gem.gemColor}
                        size={150}
                        carat={`${gem.carat} ct`}
                      />
                    </div>

                    {/* Información y 4Cs */}
                    <div className="gem-card-info">
                      <h3 className="gem-card-title">{gem.name}</h3>

                      <div className="gem-4c-specs">
                        <div className="spec-pill">
                          <span className="spec-name">Color</span>
                          <span className="spec-val">{gem.color}</span>
                        </div>
                        <div className="spec-pill">
                          <span className="spec-name">Pureza</span>
                          <span className="spec-val">{gem.clarity}</span>
                        </div>
                        <div className="spec-pill">
                          <span className="spec-name">Corte</span>
                          <span className="spec-val">{gem.cutQuality}</span>
                        </div>
                        <div className="spec-pill">
                          <span className="spec-name">Medidas</span>
                          <span className="spec-val">{gem.dimensions}</span>
                        </div>
                      </div>

                      <div className="gem-card-cert-row">
                        <span>Certificado: <strong>{gem.certNumber}</strong></span>
                        <span>Origen: {gem.origin}</span>
                      </div>

                      {/* Precio y Botones de Acción */}
                      <div className="gem-card-footer">
                        <div className="gem-price-box">
                          <span className="price-label">Precio Gema:</span>
                          <span className="gem-price">{gem.priceFormatted}</span>
                        </div>

                        <div className="gem-actions-row">
                          <button
                            type="button"
                            onClick={() => setDetailGem(gem)}
                            className="btn-inspect-gem"
                            title="Ver ficha técnica completa"
                          >
                            <i className="bi bi-eye"></i> Detalles
                          </button>

                          <Link
                            to={`/agendar-cita?gema=${encodeURIComponent(gem.name)}&cert=${gem.certNumber}`}
                            className="btn-book-gem"
                            title="Ver en vivo en nuestra joyería"
                          >
                            <i className="bi bi-calendar-check"></i> Agendar Cita
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ========================================================
          MODAL: FICHA TÉCNICA Y CERTIFICADO DE LA GEMA
          ======================================================== */}
      {detailGem && (
        <div
          className="gem-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDetailGem(null);
          }}
        >
          <div className="gem-modal-card" role="dialog" aria-modal="true">
            <button
              className="gem-modal-close"
              onClick={() => setDetailGem(null)}
              aria-label="Cerrar modal"
            >
              <i className="bi bi-x-lg"></i>
            </button>

            <div className="gem-modal-body">
              {/* Lado Izquierdo: Visualizador de la Gema */}
              <div className="gem-modal-visual-side">
                <div className="gem-modal-visual-bg">
                  <GemstoneStoneVisual
                    shape={detailGem.shape}
                    color={detailGem.gemColor}
                    size={220}
                    carat={`${detailGem.carat} ct`}
                  />
                </div>

                <div className="gem-cert-badge-box">
                  <i className="bi bi-shield-fill-check"></i>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "14px" }}>
                      Certificado Oficial {detailGem.certificate}
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)" }}>
                      Nº {detailGem.certNumber} (Grabado Láser en Filetín)
                    </div>
                  </div>
                </div>
              </div>

              {/* Lado Derecho: Especificaciones Completas */}
              <div className="gem-modal-info-side">
                <span className="gem-modal-badge">
                  {detailGem.type === "diamante-natural"
                    ? "Diamante Natural Extraído de Mina Ética"
                    : detailGem.type === "diamante-lab"
                    ? "Diamante Cultivado en Laboratorio Ecológico"
                    : "Gema Preciosa Natural"}
                </span>

                <h2 className="gem-modal-title">{detailGem.name}</h2>
                <div className="gem-modal-price">{detailGem.priceFormatted}</div>

                <div className="gem-specs-table">
                  <div className="spec-row">
                    <span className="spec-lbl">Forma / Corte:</span>
                    <span className="spec-data" style={{ textTransform: "capitalize" }}>
                      {detailGem.shape}
                    </span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-lbl">Peso en Quilates:</span>
                    <span className="spec-data">{detailGem.carat} ct</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-lbl">Grado de Color:</span>
                    <span className="spec-data">{detailGem.color} ({detailGem.gemColorLabel})</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-lbl">Grado de Pureza:</span>
                    <span className="spec-data">{detailGem.clarity}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-lbl">Calidad de Corte:</span>
                    <span className="spec-data">{detailGem.cutQuality}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-lbl">Pulido / Simetría:</span>
                    <span className="spec-data">{detailGem.polish} / {detailGem.symmetry}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-lbl">Dimensiones Reales:</span>
                    <span className="spec-data">{detailGem.dimensions}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-lbl">Tabla / Profundidad:</span>
                    <span className="spec-data">{detailGem.table} / {detailGem.depth}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-lbl">Fluorescencia:</span>
                    <span className="spec-data">{detailGem.fluorescence}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-lbl">Origen Ético:</span>
                    <span className="spec-data">{detailGem.origin}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="gem-modal-actions">
                  <Link
                    to={`/agendar-cita?gema=${encodeURIComponent(detailGem.name)}&cert=${detailGem.certNumber}`}
                    className="btn-modal-book"
                    onClick={() => setDetailGem(null)}
                  >
                    <i className="bi bi-calendar-check"></i> Agendar Cita para Ver en Joyería
                  </Link>

                  <a
                    href={`https://wa.me/51927357217?text=Hola%20Platino%20Perú,%20estoy%20interesado(a)%20en%20la%20gema%20certificada%20${encodeURIComponent(detailGem.name)}%20(${detailGem.certNumber})`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-modal-wa"
                  >
                    <i className="bi bi-whatsapp"></i> Consultar Asesor por WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
