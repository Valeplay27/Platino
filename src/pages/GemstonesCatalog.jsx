import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  GEM_SHAPES_DATA,
  GEM_TYPES,
  DIAMOND_COLORS,
  CLARITY_GRADES,
  GEM_COLORS,
} from "../data/gemstones";
import { DiamondCutIcon } from "../components/GemstoneIcons";
import GemstoneStoneVisual from "../components/GemstoneStoneVisual";
import { useAuth } from "../context/useAuth";
import { getUserFavorites, toggleUserFavorite } from "../services/favoritesService";
import { getStoredGemstones } from "../services/gemstonesService";
import "../../styles/gemstones.css";

export default function GemstonesCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, openAuthModal } = useAuth();

  // Lista dinámica de gemas (sincronizada con el panel de administración)
  const [gemstonesList, setGemstonesList] = useState(() => getStoredGemstones());

  useEffect(() => {
    const handleGemUpdate = () => {
      setGemstonesList(getStoredGemstones());
    };
    window.addEventListener("platino_gemstones_updated", handleGemUpdate);
    return () => window.removeEventListener("platino_gemstones_updated", handleGemUpdate);
  }, []);

  // Estados de filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("todos");
  const [selectedShape, setSelectedShape] = useState(() => searchParams.get("forma") || "todas");
  const [selectedDiamondColor, setSelectedDiamondColor] = useState("todos");
  const [selectedGemColor, setSelectedGemColor] = useState("todos");
  const [selectedClarity, setSelectedClarity] = useState("todos");
  const [selectedMmRange, setSelectedMmRange] = useState("todos");
  const [selectedCaratRange, setSelectedCaratRange] = useState("todos");
  const [sortBy, setSortBy] = useState("destacados");

  // Modal de detalle de gema
  const [detailGem, setDetailGem] = useState(null);

  // Estado reactivo de favoritos del usuario
  const [favoriteIds, setFavoriteIds] = useState(() => {
    if (!user?.email) return new Set();
    const favs = getUserFavorites(user.email);
    return new Set(favs.map((f) => String(f.id)));
  });

  useEffect(() => {
    const updateFavs = () => {
      if (user?.email) {
        const favs = getUserFavorites(user.email);
        setFavoriteIds(new Set(favs.map((f) => String(f.id))));
      } else {
        setFavoriteIds(new Set());
      }
    };
    updateFavs();
    window.addEventListener("platino_favorites_updated", updateFavs);
    return () => window.removeEventListener("platino_favorites_updated", updateFavs);
  }, [user]);

  // Sincronizar selectedShape si la URL cambia externamente
  useEffect(() => {
    const urlShape = searchParams.get("forma") || "todas";
    if (urlShape !== selectedShape) {
      setSelectedShape(urlShape);
    }
  }, [searchParams]);

  const handleToggleFavorite = (e, gem) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      if (openAuthModal) openAuthModal("login");
      return;
    }
    toggleUserFavorite(user.email, {
      id: gem.id,
      name: gem.name,
      price: gem.price,
      image: "/images/secret-garden-white.jpg",
      metal: "Gema Certificada",
      metalId: gem.shape,
      category: "Diamantes & Gemas",
      type: "gema",
      subtitle: `${gem.carat} ct · ${gem.cutQuality} · Cert. ${gem.certNumber}`,
    });
  };

  // Actualizar forma en memoria sin recargar ni alterar el scroll de la página
  const handleShapeSelect = (shapeId) => {
    setSelectedShape(shapeId);
    const nextParams = new URLSearchParams(searchParams);
    if (shapeId === "todas") {
      nextParams.delete("forma");
    } else {
      nextParams.set("forma", shapeId);
    }
    setSearchParams(nextParams, { replace: true, preventScrollReset: true });
  };

  // Lista de filtros actualmente activos para remoción rápida
  const activeFilters = useMemo(() => {
    const list = [];
    if (searchQuery.trim()) {
      list.push({ key: "query", label: `"${searchQuery}"`, clear: () => setSearchQuery("") });
    }
    if (selectedType !== "todos") {
      const t = GEM_TYPES.find((x) => x.id === selectedType);
      list.push({ key: "type", label: t ? t.label : selectedType, clear: () => setSelectedType("todos") });
    }
    if (selectedShape !== "todas") {
      const s = GEM_SHAPES_DATA.find((x) => x.id === selectedShape);
      list.push({ key: "shape", label: `Corte ${s ? s.name : selectedShape}`, clear: () => handleShapeSelect("todas") });
    }
    if (selectedDiamondColor !== "todos") {
      list.push({ key: "dColor", label: `Color ${selectedDiamondColor}`, clear: () => setSelectedDiamondColor("todos") });
    }
    if (selectedGemColor !== "todos") {
      const gc = GEM_COLORS.find((x) => x.id === selectedGemColor);
      list.push({ key: "gColor", label: `Tono ${gc ? gc.label : selectedGemColor}`, clear: () => setSelectedGemColor("todos") });
    }
    if (selectedClarity !== "todos") {
      list.push({ key: "clarity", label: `Pureza ${selectedClarity}`, clear: () => setSelectedClarity("todos") });
    }
    if (selectedMmRange !== "todos") {
      list.push({ key: "mm", label: "Tamaño mm", clear: () => setSelectedMmRange("todos") });
    }
    if (selectedCaratRange !== "todos") {
      list.push({ key: "carat", label: "Rango Carat", clear: () => setSelectedCaratRange("todos") });
    }
    return list;
  }, [
    searchQuery,
    selectedType,
    selectedShape,
    selectedDiamondColor,
    selectedGemColor,
    selectedClarity,
    selectedMmRange,
    selectedCaratRange,
  ]);

  // Contadores por forma para los chips
  const shapeCounts = useMemo(() => {
    const counts = {};
    GEM_SHAPES_DATA.forEach((s) => {
      counts[s.id] = gemstonesList.filter((g) => g.shape === s.id).length;
    });
    return counts;
  }, [gemstonesList]);

  // Filtrado de gemas
  const filteredGemstones = useMemo(() => {
    return gemstonesList.filter((gem) => {
      // 1. Búsqueda por texto (nombre, cert, corte)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = gem.name?.toLowerCase().includes(q);
        const matchCert = gem.certNumber?.toLowerCase().includes(q);
        const matchShape = gem.shape?.toLowerCase().includes(q);
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
    setSearchParams(nextParams, { replace: true, preventScrollReset: true });
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
                  <span className="shape-chip-count">{gemstonesList.length}</span>
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
                        {shape.image ? (
                          <img src={shape.image} alt={shape.name} className="shape-chip-thumb-img" />
                        ) : (
                          <DiamondCutIcon shape={shape.id} size={20} />
                        )}
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
                  className={`color-swatch-item all-swatch ${selectedGemColor === "todos" ? "active" : ""}`}
                  onClick={() => setSelectedGemColor("todos")}
                  title="Todos los colores y tonos"
                >
                  <span className="swatch-circle all">❖</span>
                  <span className="swatch-name">Todos los Tonos</span>
                </button>

                {GEM_COLORS.map((gc) => {
                  const displayName = gc.id === "incoloro" ? "Incoloro" : gc.label;
                  return (
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
                      <span className="swatch-name">{displayName}</span>
                    </button>
                  );
                })}
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

            {/* Fila de Filtros Activos con eliminación rápida sin recarga */}
            {activeFilters.length > 0 && (
              <div className="active-filters-bar">
                <span className="active-filters-title">Filtros activos:</span>
                <div className="active-filters-chips">
                  {activeFilters.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      className="active-filter-badge"
                      onClick={f.clear}
                      title={`Quitar ${f.label}`}
                    >
                      <span>{f.label}</span>
                      <i className="bi bi-x"></i>
                    </button>
                  ))}
                  <button
                    type="button"
                    className="btn-clear-all-inline"
                    onClick={handleResetFilters}
                  >
                    Limpiar todos
                  </button>
                </div>
              </div>
            )}

            {/* Grid de Gemas */}
            {filteredGemstones.length === 0 ? (
              <div className="no-gems-found">
                <i className="bi bi-gem"></i>
                <h3>No se encontraron gemas con estos criterios</h3>
                <p>
                  {activeFilters.length > 1
                    ? `Tienes ${activeFilters.length} filtros combinados activos. Prueba quitando alguno para ver gemas disponibles sin perder tu selección principal:`
                    : "Intenta ampliar los rangos de quilate, pureza o forma para ver más opciones disponibles en stock."}
                </p>

                {/* Accesos directos para quitar filtros individuales en 1 clic */}
                {activeFilters.length > 0 && (
                  <div className="no-gems-quick-adjust">
                    {activeFilters.map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        className="btn-remove-single-filter"
                        onClick={f.clear}
                      >
                        <i className="bi bi-dash-circle"></i>
                        <span>Quitar {f.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn-catalog-cta"
                >
                  <i className="bi bi-arrow-counterclockwise"></i>
                  <span>Ver Todas las Gemas Disponibles</span>
                </button>
              </div>
            ) : (
              <div className="gemstones-grid">
                {filteredGemstones.map((gem) => {
                  const isFav = favoriteIds.has(String(gem.id));
                  return (
                    <div key={gem.id} className="gem-card">
                      {/* Badge de Certificación, Stock y Favoritos */}
                      <div className="gem-card-header">
                        <div className="gem-header-left">
                          <span className="cert-pill">
                            <i className="bi bi-patch-check-fill" style={{ color: "#C6AC7F" }}></i>
                            <span>{gem.certificate}</span>
                          </span>
                          <span className="stock-pill">
                            <span className="stock-pulse-dot"></span>
                            <span>En Stock</span>
                          </span>
                        </div>

                        <button
                          type="button"
                          className={`gem-favorite-btn ${isFav ? "active" : ""}`}
                          onClick={(e) => handleToggleFavorite(e, gem)}
                          title={isFav ? "Quitar de favoritos" : "Guardar en mis favoritos"}
                          aria-label="Guardar gema en favoritos"
                        >
                          <i className={isFav ? "bi bi-heart-fill" : "bi bi-heart"}></i>
                        </button>
                      </div>

                      {/* Previsualización visual de la gema con facetas y brillos o foto real */}
                      <div
                        className="gem-card-visual-wrapper"
                        onClick={() => setDetailGem(gem)}
                        title="Haz clic para inspeccionar detalles y certificado"
                      >
                        {gem.image ? (
                          <div className="gem-real-photo-preview">
                            <img
                              src={gem.image}
                              alt={gem.name}
                              className="gem-photo-img"
                              loading="lazy"
                            />
                            <span className="photo-verified-tag">
                              <i className="bi bi-camera-fill"></i> Foto Real
                            </span>
                          </div>
                        ) : (
                          <GemstoneStoneVisual
                            shape={gem.shape}
                            color={gem.gemColor}
                            size={155}
                            carat={`${gem.carat} ct`}
                          />
                        )}
                      </div>

                      {/* Información y 4Cs */}
                      <div className="gem-card-info">
                        <div className="gem-card-shape-badge">
                          <span className="gem-shape-icon-mini">
                            <DiamondCutIcon shape={gem.shape} size={14} />
                          </span>
                          <span>Corte {gem.shape.charAt(0).toUpperCase() + gem.shape.slice(1)}</span>
                          <span className="gem-carat-accent">{gem.carat} ct</span>
                        </div>

                        <h3 className="gem-card-title">{gem.name}</h3>

                        {/* Nueva matriz estructurada de especificaciones (Solución al desborde de Medidas) */}
                        <div className="gem-specs-structured">
                          <div className="specs-row-trio">
                            <div className="spec-cell">
                              <span className="spec-label">Color</span>
                              <span className="spec-value">{gem.color}</span>
                            </div>
                            <div className="spec-cell">
                              <span className="spec-label">Pureza</span>
                              <span className="spec-value">{gem.clarity}</span>
                            </div>
                            <div className="spec-cell">
                              <span className="spec-label">Corte</span>
                              <span className="spec-value">{gem.cutQuality}</span>
                            </div>
                          </div>
                          
                          <div className="specs-row-duo">
                            <div className="spec-cell">
                              <span className="spec-label">Peso / Carat</span>
                              <span className="spec-value"><strong>{gem.carat} ct</strong></span>
                            </div>
                            <div className="spec-cell spec-cell-dimensions">
                              <span className="spec-label">Medidas Reales</span>
                              <span className="spec-value" title={gem.dimensions}>{gem.dimensions}</span>
                            </div>
                          </div>
                        </div>

                        <div className="gem-card-cert-row">
                          <span>
                            <i className="bi bi-shield-check" style={{ color: "#C6AC7F", marginRight: "4px" }}></i>
                            Inscripción Láser: <strong>{gem.certNumber}</strong>
                          </span>
                          <span>
                            <i className="bi bi-geo-alt" style={{ color: "#71857c", marginRight: "3px" }}></i>
                            {gem.origin}
                          </span>
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
                              <i className="bi bi-eye-fill" style={{ color: "#C6AC7F" }}></i>
                              <span>Detalles</span>
                            </button>

                            <Link
                              to={`/agendar-cita?gema=${encodeURIComponent(gem.name)}&cert=${gem.certNumber}`}
                              className="btn-book-gem"
                              title="Ver en vivo en nuestra boutique"
                            >
                              <i className="bi bi-calendar-check-fill" style={{ color: "#C6AC7F" }}></i>
                              <span>Agendar Cita</span>
                            </Link>
                          </div>

                          {/* Enlace directo a montaje en sortija */}
                          <Link
                            to={`/categoria/anillos-de-compromiso?gema_referencia=${encodeURIComponent(gem.name)}`}
                            className="gem-mount-link"
                          >
                            <i className="bi bi-magic" style={{ color: "#C6AC7F" }}></i>
                            <span>Montar en Sortija Platino Atelier</span>
                            <i className="bi bi-arrow-right-short"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Secciones de Valor y Asesoría que equilibran la columna y evitan el vacío */}
            <div className="gemstones-bottom-showcase">
              {/* Banner 1: Platino Atelier - Monta tu gema en un anillo */}
              <div className="atelier-ring-banner">
                <div className="atelier-content">
                  <span className="atelier-eyebrow">
                    <i className="bi bi-gem"></i> SERVICIO PLATINO ATELIER
                  </span>
                  <h3>¿Deseas montar esta gema en una sortija única?</h3>
                  <p>
                    Selecciona tu diamante o gema certificada y nuestros maestros orfebres la engastarán a medida en una montura exclusiva de <strong>Oro 18k</strong> (Blanco, Amarillo o Rosa) o <strong>Platino 950</strong>.
                  </p>
                  <div className="atelier-steps">
                    <div className="atelier-step">
                      <span className="step-num">1</span>
                      <span className="step-text">Elige tu Gema Certificada</span>
                    </div>
                    <div className="atelier-step-arrow">→</div>
                    <div className="atelier-step">
                      <span className="step-num">2</span>
                      <span className="step-text">Selecciona tu Montura en Oro 18k</span>
                    </div>
                    <div className="atelier-step-arrow">→</div>
                    <div className="atelier-step">
                      <span className="step-num">3</span>
                      <span className="step-text">Grabado Láser & Estuche de Lujo</span>
                    </div>
                  </div>
                </div>
                <div className="atelier-actions">
                  <Link to="/categoria/anillos-de-compromiso" className="btn-atelier-primary">
                    <i className="bi bi-ring"></i> Ver Monturas de Sortijas
                  </Link>
                  <a
                    href="https://wa.me/51927357217?text=Hola%20Platino%20Perú,%20deseo%20asesoría%20para%20montar%20una%20gema%20certificada%20en%20una%20sortija"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-atelier-secondary"
                  >
                    <i className="bi bi-whatsapp"></i> Hablar con un Gemólogo
                  </a>
                </div>
              </div>

              {/* Banner 2: Pilares de Garantía y Confianza Platino */}
              <div className="gem-trust-pillars">
                <div className="trust-pillar-card">
                  <div className="trust-pillar-icon">
                    <i className="bi bi-shield-check"></i>
                  </div>
                  <h4>Inscripción Láser en Filetín</h4>
                  <p>
                    Cada diamante lleva micro-grabado su número de certificado GIA o IGI, verificable en 10x bajo microscopio gemológico.
                  </p>
                </div>
                <div className="trust-pillar-card">
                  <div className="trust-pillar-icon">
                    <i className="bi bi-globe-americas"></i>
                  </div>
                  <h4>Trazabilidad Ética 100%</h4>
                  <p>
                    Cumplimos estrictamente el Proceso Kimberley, garantizando gemas libres de conflicto y de origen responsable.
                  </p>
                </div>
                <div className="trust-pillar-card">
                  <div className="trust-pillar-icon">
                    <i className="bi bi-award"></i>
                  </div>
                  <h4>Garantía Platino Care</h4>
                  <p>
                    Limpieza por ultrasonido, inspección anual de garras y pulido de cortesía incluido en cada joya confeccionada.
                  </p>
                </div>
              </div>
            </div>
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
                  {detailGem.image ? (
                    <div className="gem-modal-real-photo">
                      <img
                        src={detailGem.image}
                        alt={detailGem.name}
                        className="gem-modal-photo-img"
                      />
                      <span className="photo-verified-tag">
                        <i className="bi bi-camera-fill"></i> Fotografía Real
                      </span>
                    </div>
                  ) : (
                    <GemstoneStoneVisual
                      shape={detailGem.shape}
                      color={detailGem.gemColor}
                      size={220}
                      carat={`${detailGem.carat} ct`}
                    />
                  )}
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
