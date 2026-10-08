import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  GEM_SHAPES_DATA,
  GEM_TYPES,
  DIAMOND_COLORS,
  CLARITY_GRADES,
  GEM_COLORS,
} from "../data/gemstones";
import {
  getStoredGemstones,
  addGemstone,
  updateGemstone,
  deleteGemstone,
  toggleGemstoneStock,
  resetGemstonesToDefault,
  getStoredLaboratories,
  addLaboratory,
  deleteLaboratory,
  updateGemstoneUnits,
} from "../services/gemstonesService";
import { DiamondCutIcon } from "./GemstoneIcons";
import GemstoneStoneVisual from "./GemstoneStoneVisual";

export default function AdminGemstonesTab({ isMaster = true }) {
  const [gemstones, setGemstones] = useState(() => getStoredGemstones());
  const [laboratories, setLaboratories] = useState(() => getStoredLaboratories());
  const [editingGem, setEditingGem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const fileInputRef = useRef(null);

  // Modal para agregar y gestionar laboratorios gemológicos dinámicos
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [newLabName, setNewLabName] = useState("");
  const [newLabCode, setNewLabCode] = useState("");

  // Filtros de búsqueda en la tabla del admin
  const [adminSearch, setAdminSearch] = useState("");
  const [filterShape, setFilterShape] = useState("todas");
  const [filterType, setFilterType] = useState("todos");

  // Estado del formulario
  const initialForm = {
    name: "",
    shape: "oval",
    type: "diamante-natural",
    carat: "1.25",
    color: "D",
    gemColor: "incoloro",
    gemColorLabel: "Incoloro Puro",
    clarity: "VVS1",
    cutQuality: "Excelente",
    polish: "Excelente",
    symmetry: "Excelente",
    dimensions: "8.45 x 5.92 x 3.68 mm",
    mm: "8.45",
    certificate: "GIA",
    certNumber: "GIA-" + Math.floor(10000000 + Math.random() * 90000000),
    price: 8450,
    origin: "Botsuana (Ético)",
    fluorescence: "Ninguna",
    table: "58%",
    depth: "62.1%",
    units: 1, // Cantidad de piezas en stock
    inStock: true,
    image: "", // Fotografía de la gema subida por el admin
  };

  const [formData, setFormData] = useState(initialForm);

  // Escuchar cambios en gemas y en laboratorios
  useEffect(() => {
    const handleGemUpdate = () => {
      setGemstones(getStoredGemstones());
    };
    const handleLabUpdate = () => {
      setLaboratories(getStoredLaboratories());
    };

    window.addEventListener("platino_gemstones_updated", handleGemUpdate);
    window.addEventListener("platino_gem_laboratories_updated", handleLabUpdate);

    return () => {
      window.removeEventListener("platino_gemstones_updated", handleGemUpdate);
      window.removeEventListener("platino_gem_laboratories_updated", handleLabUpdate);
    };
  }, []);

  const showFeedbackMsg = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 4500);
  };

  // Generador inteligente de nombre según atributos
  const generateSuggestedName = () => {
    const typeLabel =
      formData.type === "diamante-natural"
        ? "Diamante Natural"
        : formData.type === "diamante-lab"
        ? "Diamante Lab-Grown"
        : `Gema Preciosa ${formData.gemColor.charAt(0).toUpperCase() + formData.gemColor.slice(1)}`;
    const shapeLabel = formData.shape.charAt(0).toUpperCase() + formData.shape.slice(1);
    const caratVal = `${formData.carat} ct`;
    const certVal = formData.certificate;
    const grade = formData.type === "gema-color" ? formData.clarity : `${formData.color}/${formData.clarity}`;

    return `${typeLabel} ${shapeLabel} ${caratVal} ${certVal} ${grade}`;
  };

  // Cargar imagen mediante FileReader (Base64)
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no debe superar los 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({
        ...prev,
        image: event.target.result,
      }));
      showFeedbackMsg("Fotografía de gema cargada con éxito");
    };
    reader.readAsDataURL(file);
  };

  const handleEditClick = (gem) => {
    setEditingGem(gem);
    const gemUnits = gem.units !== undefined ? Number(gem.units) : (gem.inStock !== false ? 1 : 0);
    setFormData({
      ...gem,
      carat: String(gem.carat || "1.00"),
      mm: String(gem.mm || "7.00"),
      price: gem.price || 5000,
      units: gemUnits,
      inStock: gemUnits > 0 && gem.inStock !== false,
      image: gem.image || "",
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  const handleCancelForm = () => {
    setEditingGem(null);
    setFormData(initialForm);
    setIsFormOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalName = formData.name.trim() || generateSuggestedName();
    const unitsNum = Math.max(0, parseInt(formData.units !== undefined ? formData.units : 1, 10) || 0);
    const isAvailable = unitsNum > 0 && formData.inStock !== false;

    const payload = {
      ...formData,
      name: finalName,
      carat: parseFloat(formData.carat) || 1.0,
      mm: parseFloat(formData.mm) || 7.0,
      price: Number(formData.price) || 0,
      units: unitsNum,
      inStock: isAvailable,
    };

    if (editingGem) {
      updateGemstone(editingGem.id, payload);
      showFeedbackMsg(
        unitsNum === 0
          ? `Gema "${finalName}" actualizada con 0 unidades (OCULTA para los clientes).`
          : `Gema "${finalName}" actualizada correctamente (${unitsNum} un. disponibles).`
      );
    } else {
      addGemstone(payload);
      showFeedbackMsg(
        unitsNum === 0
          ? `Nueva gema "${finalName}" registrada con 0 unidades (Permanecerá oculta hasta agregar stock).`
          : `Nueva gema "${finalName}" creada y publicada en el catálogo (${unitsNum} un.).`
      );
    }

    handleCancelForm();
  };

  const handleDelete = (gem) => {
    if (window.confirm(`¿Estás seguro de eliminar la gema "${gem.name}"?`)) {
      deleteGemstone(gem.id);
      showFeedbackMsg(`Gema "${gem.name}" eliminada.`);
    }
  };

  // Ajuste rápido de unidades desde la tabla
  const handleUnitChange = (gem, newUnits) => {
    const valid = Math.max(0, parseInt(newUnits, 10) || 0);
    updateGemstoneUnits(gem.id, valid);
    if (valid === 0) {
      showFeedbackMsg(`Gema "${gem.name}" quedó en 0 unidades y ahora está OCULTA para clientes.`);
    } else {
      showFeedbackMsg(`Stock de "${gem.name}" actualizado a ${valid} ${valid === 1 ? "unidad" : "unidades"}.`);
    }
  };

  const handleToggleStock = (gem) => {
    const newState = toggleGemstoneStock(gem.id);
    showFeedbackMsg(
      newState
        ? `Gema "${gem.name}" marcada como EN STOCK (Visible en catálogo).`
        : `Gema "${gem.name}" quedó en 0 unidades y está OCULTA a clientes.`
    );
  };

  // Guardar nuevo laboratorio dinámico
  const handleSaveNewLaboratory = (e) => {
    if (e) e.preventDefault();
    const rawCode = (newLabCode.trim() || newLabName.trim().split(" ")[0]).toUpperCase();
    const rawName = newLabName.trim() || rawCode;

    if (!rawName) {
      alert("Por favor ingresa al menos las siglas o el nombre del laboratorio.");
      return;
    }

    const created = addLaboratory({ code: rawCode, name: rawName });
    if (created) {
      setFormData((prev) => ({ ...prev, certificate: created.code }));
      showFeedbackMsg(`Laboratorio "${created.name}" agregado y seleccionado.`);
      setNewLabCode("");
      setNewLabName("");
      setIsLabModalOpen(false);
    }
  };

  const handleDeleteLab = (labId) => {
    if (window.confirm("¿Deseas eliminar este laboratorio personalizado?")) {
      deleteLaboratory(labId);
      showFeedbackMsg("Laboratorio eliminado con éxito.");
    }
  };

  const handleResetCatalog = () => {
    if (
      window.confirm(
        "¿Deseas restablecer las gemas originales de fábrica? Se conservarán los diamantes y zafiros de demostración certificados."
      )
    ) {
      resetGemstonesToDefault();
      showFeedbackMsg("Catálogo de gemas restablecido a los valores oficiales.");
    }
  };

  // KPIs
  const kpis = useMemo(() => {
    const totalGems = gemstones.length;
    const availableGems = gemstones.filter(
      (g) => g.inStock !== false && (g.units === undefined || Number(g.units) > 0)
    ).length;
    const outOfStockGems = totalGems - availableGems;
    const totalUnits = gemstones.reduce(
      (sum, g) => sum + (g.inStock !== false ? Math.max(0, Number(g.units || 0)) : 0),
      0
    );

    return {
      total: totalGems,
      inStock: availableGems,
      outOfStock: outOfStockGems,
      totalUnits,
      naturales: gemstones.filter((g) => g.type === "diamante-natural").length,
      labGrown: gemstones.filter((g) => g.type === "diamante-lab").length,
      color: gemstones.filter((g) => g.type === "gema-color").length,
    };
  }, [gemstones]);

  // Lista filtrada en admin
  const filteredList = useMemo(() => {
    return gemstones.filter((gem) => {
      if (adminSearch.trim()) {
        const q = adminSearch.toLowerCase();
        const mName = gem.name?.toLowerCase().includes(q);
        const mCert = gem.certNumber?.toLowerCase().includes(q);
        const mShape = gem.shape?.toLowerCase().includes(q);
        if (!mName && !mCert && !mShape) return false;
      }
      if (filterShape !== "todas" && gem.shape !== filterShape) return false;
      if (filterType !== "todos" && gem.type !== filterType) return false;
      return true;
    });
  }, [gemstones, adminSearch, filterShape, filterType]);

  return (
    <div className="admin-gemstones-management">
      {/* Alerta de Feedback */}
      {feedback && (
        <div className="admin-gem-feedback-banner">
          <i className="bi bi-check-circle-fill"></i>
          <span>{feedback}</span>
        </div>
      )}

      {/* Barra de Encabezado y Acciones Principales */}
      <div className="admin-gem-header-bar">
        <div>
          <span className="admin-gem-eyebrow">
            <i className="bi bi-gem"></i> GIA & IGI GEMOLOGICAL LAB MANAGEMENT
          </span>
          <h2 className="admin-gem-main-title">
            Gestión y Creación de Diamantes & Gemas
          </h2>
          <p className="admin-gem-main-desc">
            Registra nuevas gemas certificadas con especificaciones 4Cs completas, trazabilidad ética, stock de unidades y fotografías reales.
          </p>
        </div>

        <div className="admin-gem-header-actions">
          <button
            type="button"
            className="btn-create-gem-main"
            onClick={() => {
              setEditingGem(null);
              setFormData({
                ...initialForm,
                certNumber: "GIA-" + Math.floor(10000000 + Math.random() * 90000000),
              });
              setIsFormOpen(!isFormOpen);
            }}
          >
            <i className={isFormOpen ? "bi bi-x-lg" : "bi bi-plus-lg"}></i>
            <span>{isFormOpen ? "Cerrar Formulario" : "Crear Nueva Gema"}</span>
          </button>

          <button
            type="button"
            className="btn-manage-labs"
            onClick={() => setIsLabModalOpen(true)}
            title="Administrar entidades y laboratorios certificadores"
          >
            <i className="bi bi-patch-check"></i>
            <span>Laboratorios ({laboratories.length})</span>
          </button>

          <Link
            to="/catalogo-gemas"
            target="_blank"
            rel="noreferrer"
            className="btn-view-public-gems"
          >
            <i className="bi bi-box-arrow-up-right"></i>
            <span>Ver Catálogo Público</span>
          </Link>
        </div>
      </div>

      {/* Tarjetas de Métricas KPI */}
      <div className="admin-gem-kpi-grid">
        <div className="gem-kpi-card">
          <div className="gem-kpi-icon gold">
            <i className="bi bi-gem"></i>
          </div>
          <div>
            <div className="gem-kpi-val">{kpis.total}</div>
            <div className="gem-kpi-lbl">Total Gemas Registradas</div>
          </div>
        </div>

        <div className="gem-kpi-card">
          <div className="gem-kpi-icon green">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div>
            <div className="gem-kpi-val">{kpis.inStock}</div>
            <div className="gem-kpi-lbl">Visibles en Catálogo</div>
          </div>
        </div>

        <div className="gem-kpi-card">
          <div className="gem-kpi-icon out">
            <i className="bi bi-eye-slash-fill"></i>
          </div>
          <div>
            <div className="gem-kpi-val">{kpis.outOfStock}</div>
            <div className="gem-kpi-lbl">0 Unidades (Ocultas)</div>
          </div>
        </div>

        <div className="gem-kpi-card">
          <div className="gem-kpi-icon diamond">
            <i className="bi bi-box-seam-fill"></i>
          </div>
          <div>
            <div className="gem-kpi-val">{kpis.totalUnits}</div>
            <div className="gem-kpi-lbl">Total Unidades en Stock</div>
          </div>
        </div>

        <div className="gem-kpi-card">
          <div className="gem-kpi-icon lab">
            <i className="bi bi-flower1"></i>
          </div>
          <div>
            <div className="gem-kpi-val">{kpis.labGrown}</div>
            <div className="gem-kpi-lbl">Lab-Grown (Ecológicos)</div>
          </div>
        </div>

        <div className="gem-kpi-card">
          <div className="gem-kpi-icon rubi">
            <i className="bi bi-palette-fill"></i>
          </div>
          <div>
            <div className="gem-kpi-val">{kpis.color}</div>
            <div className="gem-kpi-lbl">Gemas Preciosas Color</div>
          </div>
        </div>
      </div>

      {/* ========================================================
          PANEL / FORMULARIO DE CREACIÓN & EDICIÓN
          ======================================================== */}
      {isFormOpen && (
        <div className="admin-gem-form-panel">
          <div className="form-panel-header">
            <div>
              <h3>
                {editingGem
                  ? `Editar Gema: ${editingGem.name}`
                  : "Registrar Nueva Gema Certificada"}
              </h3>
              <p>
                Configura todos los filtros y características que los clientes verán en el catálogo, controla las unidades disponibles y sube la foto real.
              </p>
            </div>
            <button
              type="button"
              className="btn-close-form"
              onClick={handleCancelForm}
              aria-label="Cerrar formulario"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="admin-gem-two-col-layout">
            {/* COLUMNA IZQUIERDA: CAMPOS DEL FILTRO */}
            <div className="form-fields-column">
              {/* 1. SELECCIÓN DE GEMAS / TIPO */}
              <div className="form-row-2">
                <div className="form-field-group">
                  <label className="form-label-bold">
                    <i className="bi bi-layers-fill"></i> Selección de Gemas (Tipo)
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="admin-form-select"
                    required
                  >
                    {GEM_TYPES.filter((t) => t.id !== "todos").map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. FORMA / CORTE */}
                <div className="form-field-group">
                  <label className="form-label-bold">
                    <i className="bi bi-gem"></i> Forma / Corte de Piedra
                  </label>
                  <select
                    value={formData.shape}
                    onChange={(e) =>
                      setFormData({ ...formData, shape: e.target.value })
                    }
                    className="admin-form-select"
                    required
                  >
                    {GEM_SHAPES_DATA.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.facetCount} facetas)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. COLOR DE DIAMANTE & TONALIDAD DE GEMA */}
              <div className="form-row-2">
                <div className="form-field-group">
                  <label className="form-label-bold">
                    Color de Diamante (Escala GIA)
                  </label>
                  <select
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="admin-form-select"
                  >
                    {DIAMOND_COLORS.map((col) => (
                      <option key={col} value={col}>
                        Color {col} {col === "D" ? "(Incoloro Máximo)" : col === "Fancy" ? "(Color Fantasía)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="form-label-bold">
                    Tonalidad / Color de Gema
                  </label>
                  <select
                    value={formData.gemColor}
                    onChange={(e) => {
                      const found = GEM_COLORS.find((c) => c.id === e.target.value);
                      setFormData({
                        ...formData,
                        gemColor: e.target.value,
                        gemColorLabel: found ? found.label : "Incoloro",
                      });
                    }}
                    className="admin-form-select"
                  >
                    {GEM_COLORS.map((gc) => (
                      <option key={gc.id} value={gc.id}>
                        {gc.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. PUREZA (CLARITY) & CALIDAD DE CORTE */}
              <div className="form-row-2">
                <div className="form-field-group">
                  <label className="form-label-bold">Pureza (Clarity)</label>
                  <select
                    value={formData.clarity}
                    onChange={(e) =>
                      setFormData({ ...formData, clarity: e.target.value })
                    }
                    className="admin-form-select"
                    required
                  >
                    {CLARITY_GRADES.map((cl) => (
                      <option key={cl} value={cl}>
                        {cl} {cl === "FL" || cl === "IF" ? "(Sin inclusiones)" : cl.includes("VVS") ? "(Inclusiones mínimas)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="form-label-bold">Calidad de Corte (Cut)</label>
                  <select
                    value={formData.cutQuality}
                    onChange={(e) =>
                      setFormData({ ...formData, cutQuality: e.target.value })
                    }
                    className="admin-form-select"
                  >
                    <option value="Ideal">Ideal (Máximo Fuego)</option>
                    <option value="Excelente">Excelente</option>
                    <option value="Muy Bueno">Muy Bueno</option>
                    <option value="Bueno">Bueno</option>
                  </select>
                </div>
              </div>

              {/* 5. PESO / CARAT & TAMAÑO EXTERIOR MM */}
              <div className="form-row-2">
                <div className="form-field-group">
                  <label className="form-label-bold">Peso en Quilates (Carat)</label>
                  <div className="input-with-affix">
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      max="20"
                      value={formData.carat}
                      onChange={(e) =>
                        setFormData({ ...formData, carat: e.target.value })
                      }
                      className="admin-form-input"
                      placeholder="1.25"
                      required
                    />
                    <span className="input-affix">ct</span>
                  </div>
                </div>

                <div className="form-field-group">
                  <label className="form-label-bold">Tamaño Exterior (mm)</label>
                  <div className="input-with-affix">
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      max="30"
                      value={formData.mm}
                      onChange={(e) =>
                        setFormData({ ...formData, mm: e.target.value })
                      }
                      className="admin-form-input"
                      placeholder="8.45"
                      required
                    />
                    <span className="input-affix">mm</span>
                  </div>
                </div>
              </div>

              {/* 6. DIMENSIONES REALES & PRECIO EN SOLES */}
              <div className="form-row-2">
                <div className="form-field-group">
                  <label className="form-label-bold">
                    Dimensiones Reales (Largo x Ancho x Profundidad)
                  </label>
                  <input
                    type="text"
                    value={formData.dimensions}
                    onChange={(e) =>
                      setFormData({ ...formData, dimensions: e.target.value })
                    }
                    className="admin-form-input"
                    placeholder="8.45 x 5.92 x 3.68 mm"
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label-bold">Precio Oficial de la Gema</label>
                  <div className="input-with-affix">
                    <span className="input-affix-left">S/.</span>
                    <input
                      type="number"
                      min="100"
                      step="50"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="admin-form-input with-left-affix"
                      placeholder="8450"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 7. LABORATORIO GEMOLÓGICO DINÁMICO & NÚMERO DE CERTIFICADO */}
              <div className="form-row-2">
                <div className="form-field-group">
                  <div className="lab-header-row">
                    <label className="form-label-bold" style={{ margin: 0 }}>
                      Laboratorio Gemológico
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsLabModalOpen(true)}
                      className="btn-add-lab-inline"
                    >
                      <i className="bi bi-plus-circle-fill"></i> + Nuevo Lab
                    </button>
                  </div>
                  <select
                    value={formData.certificate}
                    onChange={(e) =>
                      setFormData({ ...formData, certificate: e.target.value })
                    }
                    className="admin-form-select"
                  >
                    {laboratories.map((lab) => (
                      <option key={lab.id || lab.code} value={lab.code || lab.name}>
                        {lab.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="form-label-bold">
                    Número de Certificado (Grabado Láser en Filetín)
                  </label>
                  <input
                    type="text"
                    value={formData.certNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, certNumber: e.target.value })
                    }
                    className="admin-form-input"
                    placeholder="GIA-24891024"
                    required
                  />
                </div>
              </div>

              {/* 8. ORIGEN ÉTICO & UNIDADES EN STOCK (REQUERIMIENTO: AL SER 0, OCULTAR DEL CATÁLOGO) */}
              <div className="form-row-2">
                <div className="form-field-group">
                  <label className="form-label-bold">Origen Ético (Proceso Kimberley)</label>
                  <input
                    type="text"
                    value={formData.origin}
                    onChange={(e) =>
                      setFormData({ ...formData, origin: e.target.value })
                    }
                    className="admin-form-input"
                    placeholder="Botsuana (Ético)"
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label-bold">
                    Unidades en Stock (Piezas disponibles)
                  </label>
                  <div className="units-stepper-box">
                    <button
                      type="button"
                      className="btn-unit-stepper-btn"
                      onClick={() => {
                        const next = Math.max(0, (parseInt(formData.units, 10) || 0) - 1);
                        setFormData({ ...formData, units: next, inStock: next > 0 });
                      }}
                      title="Restar 1 unidad"
                    >
                      <i className="bi bi-dash"></i>
                    </button>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.units}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                        setFormData({ ...formData, units: val, inStock: val > 0 });
                      }}
                      className="admin-form-input units-num-input"
                      placeholder="1"
                      required
                    />
                    <button
                      type="button"
                      className="btn-unit-stepper-btn"
                      onClick={() => {
                        const next = (parseInt(formData.units, 10) || 0) + 1;
                        setFormData({ ...formData, units: next, inStock: true });
                      }}
                      title="Sumar 1 unidad"
                    >
                      <i className="bi bi-plus"></i>
                    </button>
                  </div>
                  <div className="units-helper-hint">
                    {Number(formData.units) > 0 ? (
                      <span className="hint-stock-ok">
                        <i className="bi bi-check-circle-fill"></i> Visible en el catálogo público ({formData.units} {formData.units === 1 ? "pieza" : "piezas"})
                      </span>
                    ) : (
                      <span className="hint-stock-zero">
                        <i className="bi bi-eye-slash-fill"></i> 0 unidades: Oculto a clientes (no se mostrará en el catálogo)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 9. FOTOGRAFÍA DE LA GEMA */}
              <div className="form-field-group photo-uploader-box">
                <label className="form-label-bold">
                  <i className="bi bi-camera-fill"></i> Fotografía Real de la Gema
                </label>
                <p className="photo-help-text">
                  Puedes subir una fotografía real de la piedra (fondo blanco o vitrina). Si no se sube foto, se mostrará el visualizador 3D facetado.
                </p>

                <div className="photo-inputs-row">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-upload-gem-photo"
                  >
                    <i className="bi bi-cloud-arrow-up-fill"></i>
                    <span>Subir Foto desde Computadora</span>
                  </button>

                  <span className="or-divider">o ingresar URL:</span>

                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    placeholder="https://ejemplo.com/diamante.jpg"
                    className="admin-form-input photo-url-input"
                  />

                  {formData.image && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: "" })}
                      className="btn-clear-photo"
                      title="Eliminar foto y usar render 3D"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* 10. TÍTULO / NOMBRE DE LA GEMA */}
              <div className="form-field-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="form-label-bold">Título / Nombre Oficial</label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, name: generateSuggestedName() })
                    }
                    className="btn-auto-name"
                  >
                    <i className="bi bi-magic"></i> Auto-generar Título
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="admin-form-input"
                  placeholder="ej. Diamante Natural Oval 1.25 ct GIA D/VVS1"
                  required
                />
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="form-action-buttons">
                <button type="submit" className="btn-save-gem">
                  <i className="bi bi-check2-circle"></i>
                  <span>{editingGem ? "Guardar Cambios" : "Publicar Gema en Tienda"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="btn-cancel-gem"
                >
                  Cancelar
                </button>
              </div>
            </div>

            {/* COLUMNA DERECHA: PREVISUALIZACIÓN EN VIVO (LIVE STORE CARD) */}
            <div className="form-preview-column">
              <div className="preview-sticky-card">
                <div className="preview-badge-header">
                  <i className="bi bi-eye-fill"></i>
                  <span>Previsualización en Tienda Pública</span>
                </div>

                {Number(formData.units) <= 0 && (
                  <div className="preview-warning-hidden-banner">
                    <i className="bi bi-eye-slash-fill"></i>
                    <span>Esta gema tiene <strong>0 unidades</strong> y permanecerá oculta para los clientes.</span>
                  </div>
                )}

                {/* Tarjeta idéntica al catálogo público */}
                <div className="gem-card preview-mode">
                  <div className="gem-card-header">
                    <div className="gem-header-left">
                      <span className="cert-pill">
                        <i className="bi bi-patch-check-fill" style={{ color: "#C6AC7F" }}></i>
                        <span>{formData.certificate}</span>
                      </span>
                      <span className="stock-pill">
                        <span className={`stock-pulse-dot ${Number(formData.units) > 0 && formData.inStock ? "" : "out"}`}></span>
                        <span>{Number(formData.units) > 0 && formData.inStock ? `En Stock (${formData.units} un.)` : "0 un. (Oculto a clientes)"}</span>
                      </span>
                    </div>

                    <button type="button" className="gem-favorite-btn active" disabled>
                      <i className="bi bi-heart-fill"></i>
                    </button>
                  </div>

                  {/* Previsualización visual: Foto real o GemstoneStoneVisual */}
                  <div className="gem-card-visual-wrapper">
                    {formData.image ? (
                      <div className="gem-real-photo-preview">
                        <img
                          src={formData.image}
                          alt={formData.name || "Gema Platino"}
                          className="gem-photo-img"
                        />
                        <span className="photo-tag">
                          <i className="bi bi-camera-fill"></i> Foto Real
                        </span>
                      </div>
                    ) : (
                      <GemstoneStoneVisual
                        shape={formData.shape}
                        color={formData.gemColor}
                        size={170}
                        carat={`${formData.carat} ct`}
                      />
                    )}
                  </div>

                  <div className="gem-card-body">
                    <div className="gem-card-type-row">
                      <span className="gem-type-badge">
                        {formData.type === "diamante-natural"
                          ? "Diamante Natural"
                          : formData.type === "diamante-lab"
                          ? "Lab-Grown Diamond"
                          : "Gema Natural"}
                      </span>
                      <span className="gem-carat-badge">{formData.carat} ct</span>
                    </div>

                    <h4 className="gem-card-title">
                      {formData.name || generateSuggestedName()}
                    </h4>

                    <div className="gem-specs-compact">
                      <span className="spec-item">
                        <strong>Color:</strong> {formData.color}
                      </span>
                      <span className="spec-sep">·</span>
                      <span className="spec-item">
                        <strong>Pureza:</strong> {formData.clarity}
                      </span>
                      <span className="spec-sep">·</span>
                      <span className="spec-item">
                        <strong>Corte:</strong> {formData.cutQuality}
                      </span>
                    </div>

                    <div className="gem-dimensions-compact">
                      <i className="bi bi-aspect-ratio"></i>
                      <span>{formData.dimensions || `${formData.mm} mm`}</span>
                    </div>

                    <div className="gem-card-footer">
                      <div className="gem-price-box">
                        <span className="price-lbl">Precio de Piedra</span>
                        <div className="price-num">
                          S/. {Number(formData.price || 0).toLocaleString("es-PE")}
                        </div>
                      </div>

                      <div className="btn-preview-dummy">
                        <span>Ver Ficha Técnica</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================
          MODAL: REGISTRAR Y GESTIONAR LABORATORIOS GEMOLÓGICOS
          ======================================================== */}
      {isLabModalOpen && (
        <div className="admin-lab-modal-overlay" onClick={() => setIsLabModalOpen(false)}>
          <div className="admin-lab-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-lab-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <i className="bi bi-patch-check-fill" style={{ fontSize: "22px", color: "#C6AC7F" }}></i>
                <div>
                  <h4 style={{ margin: 0, fontSize: "17px", fontWeight: "700", color: "#113B3A" }}>
                    Laboratorios Gemológicos Certificadores
                  </h4>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#6a7971" }}>
                    Agrega laboratorios que van surgiendo o actualizándose con el tiempo.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn-close-form"
                onClick={() => setIsLabModalOpen(false)}
                aria-label="Cerrar modal de laboratorios"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSaveNewLaboratory} className="admin-lab-modal-body">
              <div className="admin-lab-create-box">
                <span className="admin-lab-section-title">
                  <i className="bi bi-plus-circle-fill"></i> Agregar Nuevo Laboratorio
                </span>

                <div className="admin-lab-inputs-row">
                  <div style={{ width: "130px" }}>
                    <label className="form-label-bold" style={{ fontSize: "12px" }}>
                      Siglas / Código *
                    </label>
                    <input
                      type="text"
                      value={newLabCode}
                      onChange={(e) => setNewLabCode(e.target.value.toUpperCase())}
                      placeholder="Ej: GCAL"
                      className="admin-form-input"
                      style={{ textTransform: "uppercase", fontWeight: "700" }}
                      required
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label className="form-label-bold" style={{ fontSize: "12px" }}>
                      Nombre Completo / Entidad *
                    </label>
                    <input
                      type="text"
                      value={newLabName}
                      onChange={(e) => setNewLabName(e.target.value)}
                      placeholder="Ej: GCAL (Gem Certification & Assurance Lab)"
                      className="admin-form-input"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-save-lab-action"
                    disabled={!newLabName.trim() && !newLabCode.trim()}
                  >
                    <i className="bi bi-check2"></i>
                    <span>Agregar</span>
                  </button>
                </div>
              </div>

              {/* Lista actual de laboratorios disponibles */}
              <div className="admin-current-labs-section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span className="admin-lab-section-title" style={{ margin: 0 }}>
                    <i className="bi bi-building"></i> Laboratorios Disponibles en el Selector ({laboratories.length})
                  </span>
                </div>

                <div className="admin-labs-chips-container">
                  {laboratories.map((lab) => (
                    <div key={lab.id || lab.code} className="admin-lab-chip">
                      <span className="lab-chip-code">{lab.code}</span>
                      <span className="lab-chip-name">{lab.name}</span>
                      {lab.isCustom && (
                        <button
                          type="button"
                          onClick={() => handleDeleteLab(lab.id)}
                          className="btn-del-lab-chip"
                          title="Eliminar este laboratorio personalizado"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </form>

            <div className="admin-lab-modal-footer">
              <button
                type="button"
                className="btn-close-lab-modal"
                onClick={() => setIsLabModalOpen(false)}
              >
                Listo / Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TABLA Y LISTA DE GEMAS EXISTENTES EN INVENTARIO
          ======================================================== */}
      <div className="admin-gem-inventory-section">
        <div className="inventory-section-top">
          <div className="inventory-search-row">
            <div className="admin-search-input-box">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Buscar gema por nombre, certificado o corte..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
              />
              {adminSearch && (
                <button
                  type="button"
                  onClick={() => setAdminSearch("")}
                  className="btn-clear-admin-search"
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>

            {/* Filtro por Forma */}
            <select
              value={filterShape}
              onChange={(e) => setFilterShape(e.target.value)}
              className="admin-filter-dropdown"
            >
              <option value="todas">Todas las Formas ({gemstones.length})</option>
              {GEM_SHAPES_DATA.map((s) => (
                <option key={s.id} value={s.id}>
                  Corte {s.name}
                </option>
              ))}
            </select>

            {/* Filtro por Tipo */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="admin-filter-dropdown"
            >
              <option value="todos">Todos los Tipos</option>
              {GEM_TYPES.filter((t) => t.id !== "todos").map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleResetCatalog}
            className="btn-reset-catalog-soft"
            title="Restablece las gemas a las de fábrica"
          >
            <i className="bi bi-arrow-counterclockwise"></i>
            <span>Restablecer Gemas de Fábrica</span>
          </button>
        </div>

        {/* Tabla de Gemas */}
        <div className="admin-gem-table-wrapper">
          <table className="admin-gem-table">
            <thead>
              <tr>
                <th>Gema / Vista</th>
                <th>Nombre & Certificado</th>
                <th>Corte & Carat</th>
                <th>Color & Pureza</th>
                <th>Dimensiones</th>
                <th>Precio (PEN)</th>
                <th>Stock & Unidades</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "40px" }}>
                    <i className="bi bi-gem" style={{ fontSize: "36px", color: "#C6AC7F" }}></i>
                    <p style={{ marginTop: "10px", color: "#6a7971" }}>
                      No se encontraron gemas con estos criterios de búsqueda.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredList.map((gem) => {
                  const currentUnits = gem.units !== undefined ? Number(gem.units) : (gem.inStock !== false ? 1 : 0);
                  const isVisible = currentUnits > 0 && gem.inStock !== false;

                  return (
                    <tr key={gem.id} className={!isVisible ? "row-out-stock" : ""}>
                      {/* Vista Previa Miniatura */}
                      <td style={{ width: "80px" }}>
                        <div className="table-gem-thumb">
                          {gem.image ? (
                            <img src={gem.image} alt={gem.name} />
                          ) : (
                            <DiamondCutIcon shape={gem.shape} size={32} />
                          )}
                          {gem.image && (
                            <span className="thumb-photo-dot" title="Tiene fotografía real"></span>
                          )}
                        </div>
                      </td>

                      {/* Nombre y Certificado */}
                      <td>
                        <div className="table-gem-name">{gem.name}</div>
                        <div className="table-gem-cert">
                          <span className="cert-tag">{gem.certificate}</span>
                          <span>{gem.certNumber}</span>
                        </div>
                      </td>

                      {/* Corte y Carat */}
                      <td>
                        <span className="table-shape-badge">
                          Corte {gem.shape}
                        </span>
                        <div style={{ fontWeight: "700", marginTop: "3px" }}>
                          {gem.carat} ct
                        </div>
                      </td>

                      {/* Color y Pureza */}
                      <td>
                        <div style={{ fontWeight: "700" }}>Color {gem.color}</div>
                        <div style={{ fontSize: "12px", color: "#5c7068" }}>
                          {gem.clarity} · {gem.cutQuality}
                        </div>
                      </td>

                      {/* Dimensiones */}
                      <td style={{ fontSize: "12px", color: "#44554d" }}>
                        {gem.dimensions}
                      </td>

                      {/* Precio */}
                      <td>
                        <div className="table-gem-price">
                          {gem.priceFormatted || `S/. ${Number(gem.price).toLocaleString("es-PE")}`}
                        </div>
                      </td>

                      {/* Control de Unidades de Stock y Visibilidad */}
                      <td>
                        <div className="table-stock-control-cell">
                          <div className="table-units-stepper">
                            <button
                              type="button"
                              className="btn-tbl-step"
                              onClick={() => handleUnitChange(gem, Math.max(0, currentUnits - 1))}
                              disabled={currentUnits <= 0}
                              title="Restar 1 unidad"
                            >
                              <i className="bi bi-dash"></i>
                            </button>
                            <span className="tbl-unit-counter-number">
                              {currentUnits} {currentUnits === 1 ? "un." : "un."}
                            </span>
                            <button
                              type="button"
                              className="btn-tbl-step"
                              onClick={() => handleUnitChange(gem, currentUnits + 1)}
                              title="Sumar 1 unidad"
                            >
                              <i className="bi bi-plus"></i>
                            </button>
                          </div>

                          <div className="table-stock-badge-container">
                            {isVisible ? (
                              <button
                                type="button"
                                onClick={() => handleToggleStock(gem)}
                                className="table-visibility-badge online"
                                title="Haz clic para marcar como agotado (0 unidades)"
                              >
                                <span className="dot-pulse-green"></span>
                                <span>Visible en Tienda</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleStock(gem)}
                                className="table-visibility-badge hidden"
                                title="Haz clic para reponer stock (+1 unidad)"
                              >
                                <span className="dot-gray"></span>
                                <span>0 un. (Oculto a clientes)</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Botones de Acción */}
                      <td style={{ textAlign: "right" }}>
                        <div className="table-actions-cell">
                          <button
                            type="button"
                            onClick={() => handleEditClick(gem)}
                            className="btn-table-action edit"
                            title="Editar gema, unidades y fotografía"
                          >
                            <i className="bi bi-pencil-fill"></i>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(gem)}
                            className="btn-table-action delete"
                            title="Eliminar gema"
                          >
                            <i className="bi bi-trash-fill"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
