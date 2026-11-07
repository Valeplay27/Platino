import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { CATEGORY_INFO } from "../data/products";
import { getCatalogProducts } from "../services/catalogService";
import { getGemCollectionOptions } from "../services/gemCollectionService";
import "../../styles/catalog.css";

const FORMA_LABELS = {
  redondo: "Redondo",
  oval: "Oval",
  marquesa: "Marquesa",
  esmeralda: "Esmeralda",
  corazon: "Corazón",
  otros: "Otros Cortes",
};

const ESTILO_LABELS = {
  solitario: "Solitario",
  "3-piedras": "3 Piedras",
  "con-pave": "Con Pavé",
  moderno: "Moderno",
  vintage: "Vintage",
  "con-gemas": "Con Gemas",
  clasicos: "Clásicos",
  clasico: "Clásicos",
  "con-pedreria": "Con Pedrería",
  "sin-pedreria": "Sin Pedrería",
  "con-textura": "Con Textura",
  "gemas-naturales": "Gemas Naturales",
};

const METAL_LABELS = {
  "plata-950": "Plata Ley 950",
  "plata-oro-18k": "Plata con Oro 18k",
  "oro-natural-18k": "Oro 18k Natural",
  "oro-amarillo-18k": "Oro 18k Amarillo",
  "oro-rosado-18k": "Oro 18k Rosa",
  "oro-rosa-18k": "Oro 18k Rosa",
  "oro-blanco-18k": "Oro 18k Blanco",
  platino: "Platino 950",
};

const GEMA_LABELS = {
  diamante: "Diamante Fino",
  esmeralda: "Esmeralda Colombiana",
  rubi: "Rubí Pasión",
  zafiro: "Zafiro Royal",
};

const SUBCAT_LABELS = {
  "anillo-promesa": "Anillo de Promesa",
  "alianzas-amor": "Alianzas de Amor",
};

const GENERO_LABELS = {
  mujer: "Para Ella",
  hombre: "Para Él",
  kids: "Kids / Niños",
};

const TIPO_LABELS = {
  aretes: "Aretes",
  "aretes-bebes": "Aretes Bebé",
  "aretes-pegados": "Aretes Pegados",
  "aretes-colgantes": "Aretes Colgantes",
  "aretes-nina": "Aretes Niña",
  collares: "Collares",
  "collares-vestir": "Collares de Vestir",
  "collares-gemas": "Collares con Gemas",
  "collares-relicarios": "Relicarios",
  "collares-religiosos": "Collares Religiosos",
  "collares-personalizados": "Collares Personalizados",
  anillos: "Anillos",
  cadenas: "Cadenas",
  juegos: "Juegos",
  pulseras: "Pulseras",
  tobilleras: "Tobilleras",
  "aros-casuales": "Aros Casuales",
  relojes: "Relojes",
  "porta-aros": "Porta Aros",
  "copas-decoradas": "Copas Decoradas",
  cuadros: "Cuadros",
};


// Opciones para la cápsula minimalista
const FORMA_PILL_OPTIONS = [
  { value: "redondo", label: "Redondo" },
  { value: "oval", label: "Oval" },
  { value: "marquesa", label: "Marquesa" },
  { value: "esmeralda", label: "Esmeralda" },
  { value: "corazon", label: "Corazón" },
  { value: "otros", label: "Otros Cortes" },
  { value: "radiante", label: "Radiante" },
  { value: "pera", label: "Pera" },
  { value: "cojin-alargado", label: "Cojín Alargado" },
  { value: "cojin", label: "Cojín" },
  { value: "princesa", label: "Princesa" },
  { value: "asscher", label: "Asscher" },
  { value: "sin-forma", label: "Sin forma" },
];

const ESTILO_COMPROMISO_PILL_OPTIONS = [
  { value: "solitario", label: "Solitarios" },
  { value: "3-piedras", label: "3 Piedras" },
  { value: "con-pave", label: "Con Pavé" },
  { value: "moderno", label: "Modernos" },
  { value: "vintage", label: "Vintage" },
  { value: "con-gemas", label: "Con Gemas" },
];

const ESTILO_BODA_PILL_OPTIONS = [
  { value: "clasicos", label: "Clásicos" },
  { value: "con-pedreria", label: "Con Pedrería" },
  { value: "con-textura", label: "Con Textura" },
  { value: "moderno", label: "Moderno" },
  { value: "vintage", label: "Vintage" },
];

const SUBCAT_PROMESA_PILL_OPTIONS = [
  { value: "anillo-promesa", label: "Anillos de Promesa" },
  { value: "alianzas-amor", label: "Alianzas de Amor" },
];

const ESTILO_PROMESA_PILL_OPTIONS = [
  { value: "clasicos", label: "Clásicos" },
  { value: "con-pedreria", label: "Con Pedrería" },
  { value: "sin-pedreria", label: "Sin Pedrería" },
  { value: "moderno", label: "Moderno" },
  { value: "vintage", label: "Vintage" },
  { value: "gemas-naturales", label: "Gemas Naturales" },
];

const GENERO_PILL_OPTIONS = [
  { value: "ella", label: "Ella" },
  { value: "el", label: "Él" },
  { value: "kids", label: "Kids" },
];

const TIPO_JOYERIA_PILL_OPTIONS = [
  {
    isGroup: true,
    label: "Para Ella",
    items: [
      { value: "anillos", label: "Anillos" },
      { value: "aretes", label: "Aretes" },
      { value: "collares", label: "Collares" },
      { value: "pulseras", label: "Pulseras" },
      { value: "tobilleras", label: "Tobilleras" },
    ],
  },
  {
    isGroup: true,
    label: "Para Él",
    items: [
      { value: "aros-casuales", label: "Aros" },
      { value: "cadenas", label: "Cadenas" },
      { value: "pulseras", label: "Pulseras" },
      { value: "relojes", label: "Relojes" },
    ],
  },
  {
    isGroup: true,
    label: "Kids / Bebés",
    items: [
      { value: "aretes-bebes", label: "Aretes Bebé" },
      { value: "aretes-nina", label: "Aretes Niña" },
      { value: "cadenas", label: "Cadenas" },
      { value: "pulseras", label: "Pulseras" },
    ],
  },
];

const TIPO_REGALOS_PILL_OPTIONS = [
  { value: "porta-aros", label: "Porta Aros" },
  { value: "copas-decoradas", label: "Copas" },
  { value: "cuadros", label: "Cuadros" },
];

const ESTILO_GENERAL_PILL_OPTIONS = [
  { value: "solitario", label: "Solitarios" },
  { value: "clasicos", label: "Clásicos" },
  { value: "con-pedreria", label: "Con Pedrería" },
  { value: "sin-pedreria", label: "Sin Pedrería" },
  { value: "con-textura", label: "Con Textura" },
  { value: "3-piedras", label: "3 Piedras" },
  { value: "con-pave", label: "Con Pavé" },
  { value: "moderno", label: "Modernos" },
  { value: "vintage", label: "Vintage" },
  { value: "con-gemas", label: "Con Gemas" },
];

const MATERIAL_PILL_OPTIONS = [
  {
    isGroup: true,
    label: "Plata",
    items: [{ value: "plata-950", label: "Plata 950" }],
  },
  {
    isGroup: true,
    label: "Plata con Oro 18k",
    items: [{ value: "plata-oro-18k", label: "Plata con Oro" }],
  },
  {
    isGroup: true,
    label: "Oro 18 Quilates",
    items: [
      { value: "oro-natural-18k", label: "Oro 18k Natural" },
      { value: "oro-amarillo-18k", label: "Oro 18k Amarillo" },
      { value: "oro-rosado-18k", label: "Oro 18k Rosa" },
      { value: "oro-blanco-18k", label: "Oro 18k Blanco" },
    ],
  },
  {
    isGroup: true,
    label: "Platino",
    items: [{ value: "platino", label: "Platino 950" }],
  },
];

const FILTER_ALL_LABELS = {
  Forma: "Todas las formas",
  Estilo: "Todos los estilos",
  Gema: "Todas las gemas",
  Material: "Todos los materiales",
  Colección: "Todas las colecciones",
  Para: "Todos los destinatarios",
  Tipo: "Todos los tipos",
};

function MinimalPillFilter({ label, value, onChange, options, isActive, alignRight = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside, { passive: true });
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  let displayLabel = label;
  if (value) {
    for (const opt of options) {
      if (opt.isGroup && opt.items) {
        const found = opt.items.find((item) => item.value === value);
        if (found) {
          displayLabel = found.label;
          break;
        }
      } else if (opt.value === value) {
        displayLabel = opt.label;
        break;
      }
    }
  }

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  const allLabel = FILTER_ALL_LABELS[label] || `Todos (${label})`;

  return (
    <div
      ref={containerRef}
      className={`minimal-select-wrap ${isActive ? "is-active" : ""} ${isOpen ? "is-open" : ""}`}
    >
      <button
        type="button"
        className="minimal-select-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="minimal-display-text">{displayLabel}</span>
        <svg
          className={`minimal-display-chevron ${isOpen ? "rotate" : ""}`}
          viewBox="0 0 10 6"
          width="10"
          height="6"
          aria-hidden="true"
        >
          <path
            d="M1 1L5 5L9 1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="minimal-dropdown-backdrop"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className={`minimal-dropdown-menu ${alignRight ? "align-right" : ""}`}>
            <div className="minimal-dropdown-mobile-header">
              <span className="minimal-dropdown-mobile-title">Filtrar por {label}</span>
              <button
                type="button"
                className="minimal-dropdown-mobile-close"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar filtro"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          <button
            type="button"
            className={`minimal-dropdown-item ${!value ? "selected" : ""}`}
            onClick={() => handleSelect("")}
          >
            <span>{allLabel}</span>
            {!value && <i className="bi bi-check2"></i>}
          </button>

          {options.map((opt, i) =>
            opt.isGroup ? (
              <div key={i} className="minimal-dropdown-group">
                <div className="minimal-dropdown-group-title">{opt.label}</div>
                {opt.items.map((sub) => (
                  <button
                    key={sub.value}
                    type="button"
                    className={`minimal-dropdown-item ${value === sub.value ? "selected" : ""}`}
                    onClick={() => handleSelect(sub.value)}
                  >
                    <span>{sub.label}</span>
                    {value === sub.value && <i className="bi bi-check2"></i>}
                  </button>
                ))}
              </div>
            ) : (
              <button
                key={opt.value}
                type="button"
                className={`minimal-dropdown-item ${value === opt.value ? "selected" : ""}`}
                onClick={() => handleSelect(opt.value)}
              >
                <span>{opt.label}</span>
                {value === opt.value && <i className="bi bi-check2"></i>}
              </button>
            )
          )}
        </div>
        </>
      )}
    </div>
  );
}

function MinimalSortFilter({ sortBy, setSortBy }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside, { passive: true });
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const sortLabel =
    sortBy === "destacados"
      ? "Ordenar"
      : sortBy === "precio-menor"
      ? "Menor Precio"
      : "Mayor Precio";

  const handleSelect = (val) => {
    setSortBy(val);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`minimal-sort-wrap ${sortBy !== "destacados" ? "is-active" : ""} ${isOpen ? "is-open" : ""}`}
    >
      <button
        type="button"
        className="minimal-select-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <i className="bi bi-arrow-down-up minimal-sort-icon" aria-hidden="true"></i>
        <span className="minimal-display-text">{sortLabel}</span>
        <svg
          className={`minimal-display-chevron ${isOpen ? "rotate" : ""}`}
          viewBox="0 0 10 6"
          width="10"
          height="6"
          aria-hidden="true"
        >
          <path
            d="M1 1L5 5L9 1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="minimal-dropdown-backdrop"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="minimal-dropdown-menu align-right">
            <div className="minimal-dropdown-mobile-header">
              <span className="minimal-dropdown-mobile-title">Ordenar por</span>
              <button
                type="button"
                className="minimal-dropdown-mobile-close"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar orden"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          <button
            type="button"
            className={`minimal-dropdown-item ${sortBy === "destacados" ? "selected" : ""}`}
            onClick={() => handleSelect("destacados")}
          >
            <span>Destacados</span>
            {sortBy === "destacados" && <i className="bi bi-check2"></i>}
          </button>
          <button
            type="button"
            className={`minimal-dropdown-item ${sortBy === "precio-menor" ? "selected" : ""}`}
            onClick={() => handleSelect("precio-menor")}
          >
            <span>Precio: Menor a Mayor</span>
            {sortBy === "precio-menor" && <i className="bi bi-check2"></i>}
          </button>
          <button
            type="button"
            className={`minimal-dropdown-item ${sortBy === "precio-mayor" ? "selected" : ""}`}
            onClick={() => handleSelect("precio-mayor")}
          >
            <span>Precio: Mayor a Menor</span>
            {sortBy === "precio-mayor" && <i className="bi bi-check2"></i>}
          </button>
        </div>
        </>
      )}
    </div>
  );
}

function Category({ addToCart }) {
  const { category = "todas" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const formaParam = searchParams.get("forma") || "";
  const estiloParam = searchParams.get("estilo") || "";
  const metalParam = searchParams.get("metal") || "";
  const gemaParam = searchParams.get("gema") || "";
  const tipoParam = searchParams.get("tipo") || "";
  const subcatParam = searchParams.get("subcat") || "";
  const generoParam = searchParams.get("genero") || "";
  const qParam = searchParams.get("q") || "";

  const [productsList, setProductsList] = useState(() => getCatalogProducts());
  const [gemCollectionOptions, setGemCollectionOptions] = useState(() => getGemCollectionOptions());
  const [sortBy, setSortBy] = useState("destacados");

  useEffect(() => {
    const handleUpdate = () => setProductsList(getCatalogProducts());
    handleUpdate();
    window.addEventListener("catalog_updated", handleUpdate);
    window.addEventListener("platino_data_loaded", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("focus", handleUpdate);
    document.addEventListener("visibilitychange", handleUpdate);
    return () => {
      window.removeEventListener("catalog_updated", handleUpdate);
      window.removeEventListener("platino_data_loaded", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
      document.removeEventListener("visibilitychange", handleUpdate);
    };
  }, [category]);

  useEffect(() => {
    const refreshGemCollectionOptions = () => setGemCollectionOptions(getGemCollectionOptions());
    window.addEventListener("gem_collection_options_updated", refreshGemCollectionOptions);
    return () => window.removeEventListener("gem_collection_options_updated", refreshGemCollectionOptions);
  }, []);

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [category]);

  const categoryKey = category || "todas";
  const normKey = categoryKey.toLowerCase().trim();

  const categoryMeta =
    CATEGORY_INFO[categoryKey] ||
    (normKey.includes("boda") || normKey.includes("matrimonio") || normKey.includes("aros")
      ? CATEGORY_INFO["aros-boda"]
      : null) || {
      title: category ? category.replace(/-/g, " ").toUpperCase() : "Colección Exclusiva",
      eyebrow: "Alta Joyería Platino Perú",
      desc: "Piezas de diseño sereno y acabados de precisión fabricadas en Oro de 18 Quilates y Plata Ley 950.",
      banner: "/images/hero-matrimonio.jpg",
    };

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === "todos") {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const clearParam = (key) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(key);
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    const newParams = new URLSearchParams();
    setSearchParams(newParams);
    setSortBy("destacados");
  };

  const hasActiveFilters = Boolean(
    formaParam || estiloParam || metalParam || gemaParam || tipoParam || subcatParam || generoParam || qParam
  );

  // Filtrar productos por categoría y parámetros de búsqueda
  const filteredProducts = useMemo(() => {
    let list = productsList.filter((p) => {
      if (normKey === "todas" || normKey === "catalogo") return true;

      const pCat = (p.category || "").toLowerCase();
      const pCats = Array.isArray(p.categories) ? p.categories.map((c) => String(c).toLowerCase()) : [];
      const pType = (p.type || "").toLowerCase();
      const pSubtype = (p.subtype || "").toLowerCase();
      const pStyle = (p.style || "").toLowerCase();
      const pName = (p.name || "").toLowerCase();

      // 1. Aros de Boda y Matrimonio
      if (
        normKey === "aros-boda" ||
        normKey === "aros-de-boda" ||
        normKey === "aros-matrimonio" ||
        normKey === "boda" ||
        normKey === "matrimonio" ||
        normKey === "aros"
      ) {
        return (
          pCat === "aros-boda" ||
          pCat === "aros-matrimonio" ||
          pCat === "aros" ||
          pSubtype === "aros-boda" ||
          pCats.includes("aros-boda") ||
          pCats.includes("aros-matrimonio") ||
          pCats.includes("aros") ||
          (pType === "aros" && pCat !== "aros-alianzas" && pCat !== "alianzas") ||
          pName.includes("boda") ||
          pName.includes("matrimonio")
        );
      }

      // 2. Anillos de Compromiso (singular o plural)
      if (normKey === "anillo-compromiso" || normKey === "anillos-compromiso" || normKey === "compromiso") {
        return (
          pCat === "anillo-compromiso" ||
          pCat === "anillos-compromiso" ||
          pSubtype === "anillo-compromiso" ||
          pCats.includes("anillo-compromiso") ||
          pCats.includes("anillos-compromiso") ||
          pName.includes("compromiso")
        );
      }

      // 2b. Rutas de Estilos de Anillos desde la Portada
      if (normKey === "anillos-solitarios") {
        return pStyle === "solitario" || pCats.includes("anillos-solitarios") || pName.includes("solitario");
      }
      if (normKey === "anillos-tres-piedras") {
        return pStyle === "3-piedras" || pCats.includes("anillos-tres-piedras") || pName.includes("3 piedras") || pName.includes("tres piedras");
      }
      if (normKey === "anillos-vintage") {
        return pStyle === "vintage" || pCats.includes("anillos-vintage") || pName.includes("vintage");
      }
      if (normKey === "anillos-naturaleza") {
        return pStyle === "naturaleza" || pCats.includes("anillos-naturaleza") || pName.includes("naturaleza");
      }
      if (normKey === "conjuntos-nupciales") {
        return pStyle === "conjunto-nupcial" || pCats.includes("conjuntos-nupciales") || pName.includes("nupcial");
      }
      if (normKey === "anillos-bisel") {
        return pStyle === "bisel" || pStyle === "moderno" || pCats.includes("anillos-bisel") || pName.includes("bisel");
      }

      // 3. Amor y Promesa (Fusión de Anillos de Promesa y Aros de Alianzas)
      if (
        normKey === "amor-promesa" ||
        normKey === "amor-y-promesa" ||
        normKey === "anillo-promesa" ||
        normKey === "anillos-promesa" ||
        normKey === "promesa" ||
        normKey === "aros-alianzas" ||
        normKey === "alianzas"
      ) {
        if (normKey === "anillo-promesa" || normKey === "anillos-promesa" || normKey === "promesa") {
          return (
            pCat === "anillo-promesa" ||
            pCat === "anillos-promesa" ||
            pSubtype === "anillo-promesa" ||
            pCats.includes("anillo-promesa") ||
            pCats.includes("anillos-promesa") ||
            pName.includes("promesa")
          );
        }
        if (normKey === "aros-alianzas" || normKey === "alianzas") {
          return (
            pCat === "aros-alianzas" ||
            pCat === "alianzas" ||
            pSubtype === "alianzas-amor" ||
            pSubtype === "aros-alianzas" ||
            pCats.includes("aros-alianzas") ||
            pCats.includes("alianzas") ||
            pCats.includes("alianzas-amor") ||
            pName.includes("alianza")
          );
        }
        return (
          pCat === "anillo-promesa" ||
          pCat === "anillos-promesa" ||
          pCat === "aros-alianzas" ||
          pCat === "alianzas" ||
          pCat === "amor-promesa" ||
          pSubtype === "anillo-promesa" ||
          pSubtype === "alianzas-amor" ||
          pSubtype === "aros-alianzas" ||
          pCats.includes("anillo-promesa") ||
          pCats.includes("anillos-promesa") ||
          pCats.includes("aros-alianzas") ||
          pCats.includes("alianzas") ||
          pCats.includes("alianzas-amor") ||
          pCats.includes("amor-promesa") ||
          pName.includes("promesa") ||
          pName.includes("alianza")
        );
      }

      // 4. Joyería y Accesorios
      if (normKey === "joyeria" || normKey === "joyería" || normKey === "accesorios") {
        return (
          pCat === "collares" ||
          pCat === "pulseras" ||
          pCat === "aretes" ||
          pCat === "joyeria" ||
          pCat === "cadenas" ||
          pCat === "tobilleras" ||
          pCat === "juegos" ||
          pCat === "relojes" ||
          pCat === "anillos" ||
          pCat === "aros-casuales" ||
          pCat === "bebes-kids" ||
          pCats.includes("joyeria") ||
          pCats.includes("collares") ||
          pCats.includes("pulseras") ||
          pCats.includes("aretes") ||
          pCats.includes("cadenas") ||
          pCats.includes("tobilleras") ||
          pCats.includes("juegos") ||
          pCats.includes("relojes") ||
          pCats.includes("aros-casuales") ||
          pCats.includes("kids") ||
          pCats.includes("bebes-kids") ||
          Boolean(p.gender && p.gender !== "unisex") ||
          Boolean(pSubtype && !["anillo-compromiso", "aros-boda", "anillo-promesa", "alianzas-amor", "aros-alianzas", "porta-aros", "copas-decoradas", "cuadros"].includes(pSubtype)) ||
          pType === "accesorio"
        );
      }

      // 5. Regalos
      if (normKey === "regalos") {
        return (
          pCat === "regalos" ||
          pCats.includes("regalos") ||
          pSubtype === "porta-aros" ||
          pSubtype === "copas-decoradas" ||
          pSubtype === "cuadros" ||
          pCats.includes("porta-aros") ||
          pCats.includes("copas-decoradas") ||
          pCats.includes("cuadros") ||
          pType === "porta-aros" ||
          pType === "copas-decoradas" ||
          pType === "cuadros" ||
          pName.includes("porta") ||
          pName.includes("copa") ||
          pName.includes("cuadro")
        );
      }

      return pCat === normKey || pSubtype === normKey || pCats.includes(normKey);
    });

    // Filtro por Subcategoría (Amor y Promesa: Anillo de Promesa vs Alianzas de Amor)
    if (subcatParam) {
      const targetSubcat = subcatParam.toLowerCase();
      list = list.filter((p) => {
        const pCat = (p.category || "").toLowerCase();
        const pCats = Array.isArray(p.categories) ? p.categories.map((c) => String(c).toLowerCase()) : [];
        const pType = (p.type || "").toLowerCase();
        const pSubtype = (p.subtype || "").toLowerCase();
        const pName = (p.name || "").toLowerCase();

        if (targetSubcat === "anillo-promesa" || targetSubcat === "promesa") {
          return (
            pCat === "anillo-promesa" ||
            pCat === "anillos-promesa" ||
            pSubtype === "anillo-promesa" ||
            pCats.includes("anillo-promesa") ||
            pCats.includes("anillos-promesa") ||
            pName.includes("promesa") ||
            (pType === "anillo" && pCat !== "aros-alianzas" && pSubtype !== "alianzas-amor")
          );
        }
        if (targetSubcat === "alianzas-amor" || targetSubcat === "alianzas" || targetSubcat === "alianza") {
          return (
            pCat === "alianzas" ||
            pCat === "aros-alianzas" ||
            pSubtype === "alianzas-amor" ||
            pSubtype === "aros-alianzas" ||
            pCats.includes("alianzas") ||
            pCats.includes("aros-alianzas") ||
            pCats.includes("alianzas-amor") ||
            pName.includes("alianza") ||
            pType === "aros"
          );
        }
        return pCat === targetSubcat || pSubtype === targetSubcat || pCats.includes(targetSubcat);
      });
    }

    // Filtro por Género (Joyería: Mujer, Hombre, Kids)
    if (generoParam) {
      const targetGenero = generoParam.toLowerCase();
      list = list.filter((p) => {
        const pGender = (p.gender || "").toLowerCase();
        const pSubtype = (p.subtype || "").toLowerCase();
        const pCats = Array.isArray(p.categories) ? p.categories.map((c) => String(c).toLowerCase()) : [];
        const pName = (p.name || "").toLowerCase();

        if (targetGenero === "mujer") {
          return (
            pGender === "mujer" ||
            pSubtype === "aretes-bebes" ||
            pCats.includes("aretes-bebes") ||
            (!pGender && pGender !== "hombre" && pGender !== "kids")
          );
        }
        if (targetGenero === "hombre" || targetGenero === "el" || targetGenero === "él") {
          return pGender === "hombre" || pCats.includes("hombre") || pName.includes("varón") || pName.includes("varon") || pName.includes("hombre");
        }
        if (targetGenero === "kids" || targetGenero === "ninos" || targetGenero === "niños") {
          return (
            pGender === "kids" ||
            pSubtype === "aretes-bebes" ||
            pSubtype === "aretes-nina" ||
            pCats.includes("kids") ||
            pCats.includes("bebes-kids") ||
            pCats.includes("aretes-bebes") ||
            pCats.includes("aretes-nina") ||
            pName.includes("bebé") ||
            pName.includes("bebe") ||
            pName.includes("niña") ||
            pName.includes("nina")
          );
        }
        return pGender === targetGenero;
      });
    }

    // Filtro por Forma de Gema
    if (formaParam) {
      const targetForma = formaParam.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      list = list.filter((p) => {
        if (targetForma === "sin-forma") return p.hasGemSelection === false;
        if (p.hasGemSelection === false) return false;

        const defaultShape = (p.defaultGemShape || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const shapes = Array.isArray(p.availableGemShapes)
          ? p.availableGemShapes.map((s) => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
          : [];
        const pName = (p.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (targetForma === "redondo") {
          return defaultShape.includes("redondo") || shapes.includes("redondo") || pName.includes("redondo");
        }
        if (targetForma === "oval") {
          return defaultShape.includes("oval") || shapes.includes("oval") || pName.includes("oval");
        }
        if (targetForma === "marquesa") {
          return defaultShape.includes("marquesa") || shapes.includes("marquesa") || pName.includes("marquesa");
        }
        if (targetForma === "esmeralda") {
          return defaultShape.includes("esmeralda") || shapes.includes("esmeralda") || pName.includes("esmeralda");
        }
        if (targetForma === "corazon") {
          return (
            defaultShape.includes("corazon") ||
            defaultShape.includes("corazón") ||
            shapes.includes("corazon") ||
            shapes.includes("corazón") ||
            pName.includes("coraz")
          );
        }
        if (targetForma === "otros") {
          const otherShapes = ["radiante", "pera", "cojin", "cojin-alargado", "princesa", "asscher"];
          return (
            otherShapes.some((shape) => shapes.includes(shape) || defaultShape.includes(shape) || pName.includes(shape))
          );
        }
        return defaultShape.includes(targetForma) || shapes.includes(targetForma);
      });
    }

    // Filtro por Estilo (Aros de Boda, Compromiso, Amor y Promesa)
    if (estiloParam) {
      const targetEstilo = estiloParam.toLowerCase();
      list = list.filter((p) => {
        const pStyle = (p.style || "").toLowerCase();
        const pName = (p.name || "").toLowerCase();
        const pBadge = (p.badge || "").toLowerCase();
        const pDesc = (p.description || "").toLowerCase();

        if (targetEstilo === "solitario") {
          return pStyle === "solitario" || pName.includes("solitario") || pBadge.includes("solitario");
        }
        if (targetEstilo === "3-piedras" || targetEstilo === "tres-piedras") {
          return (
            pStyle === "3-piedras" ||
            pName.includes("tres piedras") ||
            pName.includes("3 piedras") ||
            pName.includes("trilog") ||
            pBadge.includes("trilog")
          );
        }
        if (targetEstilo === "con-pave" || targetEstilo === "pave") {
          return (
            pStyle === "con-pave" ||
            pName.includes("pavé") ||
            pName.includes("pave") ||
            pBadge.includes("pavé") ||
            pBadge.includes("pave") ||
            pDesc.includes("pavé") ||
            pDesc.includes("pave") ||
            p.id === "anillo-9-promesas"
          );
        }
        if (targetEstilo === "moderno") {
          return (
            pStyle === "moderno" ||
            pName.includes("moderno") ||
            pName.includes("bicolor") ||
            pName.includes("onda") ||
            pName.includes("bisel") ||
            pBadge.includes("moderno") ||
            pBadge.includes("contemporáneo") ||
            pBadge.includes("bisel") ||
            p.id === "aros-boda-moderno-dual"
          );
        }
        if (targetEstilo === "vintage") {
          return (
            pStyle === "vintage" ||
            pName.includes("vintage") ||
            pName.includes("corona") ||
            pBadge.includes("vintage") ||
            pBadge.includes("milgrain") ||
            pDesc.includes("vintage") ||
            pDesc.includes("milgrain") ||
            p.id === "aros-boda-vintage-milgrain"
          );
        }
        if (targetEstilo === "con-gemas" || targetEstilo === "gemas" || targetEstilo === "gemas-naturales") {
          return (
            pStyle === "con-gemas" ||
            pStyle === "gemas-naturales" ||
            Boolean(p.gem) ||
            pBadge.includes("rubí") ||
            pBadge.includes("rubi") ||
            pBadge.includes("esmeralda") ||
            pBadge.includes("zafiro") ||
            pName.includes("rubí") ||
            pName.includes("rubi") ||
            pName.includes("esmeralda") ||
            pName.includes("zafiro") ||
            p.id === "anillo-promesa-esmeralda"
          );
        }
        if (targetEstilo === "clasicos" || targetEstilo === "clasico") {
          return (
            pStyle === "clasicos" ||
            pStyle === "clasico" ||
            pStyle === "solitario" ||
            pName.includes("clásico") ||
            pName.includes("clasico") ||
            pName.includes("tradicional") ||
            pBadge.includes("tradicional") ||
            p.id === "aros-romance-clasico" ||
            p.id === "aros-trial" ||
            p.id === "anillo-promesa-infinito-oro" ||
            p.id === "alianza-amor-clasica-oro"
          );
        }
        if (targetEstilo === "con-pedreria") {
          return (
            pStyle === "con-pedreria" ||
            pStyle === "con-pave" ||
            pBadge.includes("pavé") ||
            pBadge.includes("pave") ||
            pBadge.includes("pedrería") ||
            pBadge.includes("pedreria") ||
            pBadge.includes("circonita") ||
            pName.includes("pavé") ||
            pName.includes("pave") ||
            pName.includes("pedrería") ||
            pName.includes("pedreria") ||
            p.id === "aros-boda-pedreria-lux" ||
            p.id === "aros-alianza-eterna" ||
            p.id === "anillo-9-promesas"
          );
        }
        if (targetEstilo === "sin-pedreria") {
          return (
            pStyle === "sin-pedreria" ||
            pStyle === "clasicos" ||
            pStyle === "clasico" ||
            pName.includes("sin pedrería") ||
            pName.includes("sin pedreria") ||
            pName.includes("nudo") ||
            pName.includes("lazo") ||
            p.hasGemSelection === false ||
            p.id === "anillo-promesa-nudo-amor" ||
            p.id === "alianza-amor-sin-pedreria-dual"
          );
        }
        if (targetEstilo === "con-textura") {
          return (
            pStyle === "con-textura" ||
            pName.includes("textura") ||
            pBadge.includes("textura") ||
            pDesc.includes("textura") ||
            pDesc.includes("martillad") ||
            pDesc.includes("laurel") ||
            p.id === "aros-boda-textura-laurel"
          );
        }
        return pStyle === targetEstilo;
      });
    }

    // Filtro por Gema Selecta
    if (gemaParam) {
      const targetGema = gemaParam.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      list = list.filter((p) => {
        const normalize = (value) => String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const pGem = normalize(p.gem);
        const pName = normalize(p.name);
        const pBadge = normalize(p.badge);
        const pDesc = normalize(p.description);
        const pCategories = Array.isArray(p.categories) ? p.categories.map(normalize) : [];

        if (targetGema === "diamante") {
          return (
            pGem === "diamante" ||
            (!pGem && (pName.includes("diamante") || pBadge.includes("diamante") || pDesc.includes("diamante") || p.category?.includes("compromiso")))
          );
        }
        if (targetGema === "esmeralda") {
          return pGem === "esmeralda" || pName.includes("esmeralda") || pBadge.includes("esmeralda") || pDesc.includes("esmeralda");
        }
        if (targetGema === "rubi" || targetGema === "rubí") {
          return pGem === "rubi" || pName.includes("rubí") || pName.includes("rubi") || pBadge.includes("rubí") || pBadge.includes("rubi");
        }
        if (targetGema === "zafiro") {
          return pGem === "zafiro" || pName.includes("zafiro") || pBadge.includes("zafiro") || pDesc.includes("zafiro");
        }
        const categoryLabel = normalize(gemCollectionOptions.find((option) => option.id === gemaParam)?.label);
        return (
          pGem === targetGema ||
          pCategories.includes(`gema-${targetGema}`) ||
          Boolean(
            categoryLabel &&
              (pName.includes(categoryLabel) || pBadge.includes(categoryLabel) || pDesc.includes(categoryLabel))
          )
        );
      });
    }

    // Filtro por Metal / Material
    if (metalParam) {
      const activeMetal = metalParam.toLowerCase();
      list = list.filter((p) => {
        const metals = p.availableMetals || [];
        const pMetal = (p.selectedMetal || "").toLowerCase();
        const pSub = (p.subtitle || "").toLowerCase();

        if (activeMetal.includes("plata-oro") || activeMetal.includes("plata con oro")) {
          return (
            metals.some((m) => m.id.includes("plata-950-oro") || (m.name.toLowerCase().includes("plata") && m.name.toLowerCase().includes("oro"))) ||
            (pSub.includes("plata") && pSub.includes("oro"))
          );
        }
        if (activeMetal.includes("plata-950") || activeMetal === "plata 950") {
          return metals.some((m) => m.id === "plata-950" || (m.name.toLowerCase().includes("plata") && !m.name.toLowerCase().includes("oro")));
        }
        if (activeMetal.includes("oro-natural") || activeMetal.includes("natural")) {
          return (
            metals.some((m) => m.id.includes("natural") || m.name.toLowerCase().includes("natural")) ||
            pSub.includes("natural")
          );
        }
        if (activeMetal.includes("oro-amarillo") || activeMetal.includes("amarillo")) {
          return (
            metals.some((m) => m.id.includes("amarillo") || m.name.toLowerCase().includes("amarillo")) ||
            pSub.includes("amarillo")
          );
        }
        if (activeMetal.includes("oro-ros") || activeMetal.includes("oro-rosa") || activeMetal.includes("rosa")) {
          return (
            metals.some((m) => m.id.includes("rosa") || m.name.toLowerCase().includes("rosa") || m.name.toLowerCase().includes("rosado")) ||
            pSub.includes("rosa") ||
            pSub.includes("rosado")
          );
        }
        if (activeMetal.includes("oro-blanco") || activeMetal.includes("blanco")) {
          return (
            metals.some((m) => m.id.includes("blanco") || m.name.toLowerCase().includes("blanco")) ||
            pSub.includes("blanco")
          );
        }
        if (activeMetal.includes("platino")) {
          return metals.some((m) => m.id.includes("platino") || m.name.toLowerCase().includes("platino"));
        }

        return metals.some((m) => m.name.toLowerCase().includes(activeMetal) || m.id.includes(activeMetal)) || pMetal.includes(activeMetal);
      });
    }

    // Filtro por Tipo de Joya / Accesorio / Regalo
    if (tipoParam) {
      const targetTipo = tipoParam.toLowerCase();
      list = list.filter((p) => {
        const pCat = (p.category || "").toLowerCase();
        const pCats = Array.isArray(p.categories) ? p.categories.map((c) => String(c).toLowerCase()) : [];
        const pType = (p.type || "").toLowerCase();
        const pSubtype = (p.subtype || "").toLowerCase();
        const pName = (p.name || "").toLowerCase();

        // Aretes
        if (targetTipo === "aretes") {
          return (
            pCat === "aretes" ||
            pCats.includes("aretes") ||
            pSubtype.startsWith("aretes") ||
            pType.includes("aretes") ||
            pName.includes("arete")
          );
        }
        if (targetTipo === "aretes-bebes") {
          return (
            pSubtype === "aretes-bebes" ||
            pCats.includes("aretes-bebes") ||
            pType === "aretes-bebes" ||
            pName.includes("bebé") ||
            pName.includes("bebe") ||
            pName.includes("abridor")
          );
        }
        if (targetTipo === "aretes-pegados") {
          return (
            pSubtype === "aretes-pegados" ||
            pCats.includes("aretes-pegados") ||
            pType === "aretes-pegados" ||
            pName.includes("pegado") ||
            pName.includes("solitario")
          );
        }
        if (targetTipo === "aretes-colgantes") {
          return (
            pSubtype === "aretes-colgantes" ||
            pCats.includes("aretes-colgantes") ||
            pType === "aretes-colgantes" ||
            pName.includes("colgante") ||
            pName.includes("cascada")
          );
        }
        if (targetTipo === "aretes-nina") {
          return (
            pSubtype === "aretes-nina" ||
            pSubtype === "aretes-bebes" ||
            pCats.includes("aretes-nina") ||
            pCats.includes("aretes-bebes") ||
            pType === "aretes-nina" ||
            pType === "aretes-bebes" ||
            pName.includes("niña") ||
            pName.includes("mariposa")
          );
        }

        // Collares
        if (targetTipo === "collares") {
          return (
            pCat === "collares" ||
            pCats.includes("collares") ||
            pSubtype.startsWith("collares") ||
            pType.includes("collar") ||
            pName.includes("collar") ||
            pName.includes("gargantilla")
          );
        }
        if (targetTipo === "collares-vestir") {
          return (
            pSubtype === "collares-vestir" ||
            pCats.includes("collares-vestir") ||
            pType === "collares-vestir" ||
            (pCat === "collares" && !pSubtype && !pName.includes("relicario"))
          );
        }
        if (targetTipo === "collares-gemas") {
          return (
            pSubtype === "collares-gemas" ||
            pCats.includes("collares-gemas") ||
            pType === "collares-gemas" ||
            (pCat === "collares" && Boolean(p.gem))
          );
        }
        if (targetTipo === "collares-relicarios") {
          return (
            pSubtype === "collares-relicarios" ||
            pCats.includes("collares-relicarios") ||
            pType === "collares-relicarios" ||
            pName.includes("relicario") ||
            pName.includes("guardapelo")
          );
        }
        if (targetTipo === "collares-religiosos") {
          return (
            pSubtype === "collares-religiosos" ||
            pCats.includes("collares-religiosos") ||
            pType === "collares-religiosos" ||
            pName.includes("cruz") ||
            pName.includes("ángel") ||
            pName.includes("angel") ||
            pName.includes("religioso")
          );
        }
        if (targetTipo === "collares-personalizados") {
          return (
            pSubtype === "collares-personalizados" ||
            pCats.includes("collares-personalizados") ||
            pType === "collares-personalizados" ||
            pName.includes("personalizado") ||
            pName.includes("nombre")
          );
        }

        // Otras Joyas
        if (targetTipo === "anillos") {
          return (
            pSubtype === "anillos" ||
            pCats.includes("anillos") ||
            pType === "anillo" ||
            pCat.includes("anillo") ||
            pCats.some((c) => c.includes("anillo")) ||
            pName.includes("anillo")
          );
        }
        if (targetTipo === "cadenas") {
          return (
            pSubtype === "cadenas" ||
            pType === "cadenas" ||
            pCat === "cadenas" ||
            pCats.includes("cadenas") ||
            pName.includes("cadena")
          );
        }
        if (targetTipo === "juegos") {
          return (
            pSubtype === "juegos" ||
            pType === "juegos" ||
            pCat === "juegos" ||
            pCats.includes("juegos") ||
            pName.includes("juego") ||
            pName.includes("set")
          );
        }
        if (targetTipo === "pulseras") {
          return (
            pSubtype === "pulseras" ||
            pCat === "pulseras" ||
            pCats.includes("pulseras") ||
            pType === "pulseras" ||
            pName.includes("pulsera") ||
            pName.includes("esclava")
          );
        }
        if (targetTipo === "tobilleras") {
          return (
            pSubtype === "tobilleras" ||
            pCat === "tobilleras" ||
            pType === "tobilleras" ||
            pCats.includes("tobilleras") ||
            pName.includes("tobillera")
          );
        }
        if (targetTipo === "aros-casuales") {
          return (
            pSubtype === "aros-casuales" ||
            pCat === "aros-casuales" ||
            pType === "aros-casuales" ||
            pCats.includes("aros-casuales") ||
            (pName.includes("aro") && (p.gender === "hombre" || pName.includes("varón")))
          );
        }
        if (targetTipo === "relojes") {
          return (
            pSubtype === "relojes" ||
            pCat === "relojes" ||
            pType === "relojes" ||
            pCats.includes("relojes") ||
            pName.includes("reloj")
          );
        }

        // Accesorios y Regalos
        if (targetTipo === "porta-aros" || targetTipo === "porta-aro") {
          return (
            pSubtype === "porta-aros" ||
            pCats.includes("porta-aros") ||
            pType === "porta-aros" ||
            pName.includes("porta") ||
            p.id.includes("porta")
          );
        }
        if (targetTipo === "copas-decoradas" || targetTipo === "copas") {
          return (
            pSubtype === "copas-decoradas" ||
            pCats.includes("copas-decoradas") ||
            pType === "copas-decoradas" ||
            pName.includes("copa") ||
            p.id.includes("copa")
          );
        }
        if (targetTipo === "cuadros") {
          return (
            pSubtype === "cuadros" ||
            pCats.includes("cuadros") ||
            pType === "cuadros" ||
            pName.includes("cuadro") ||
            p.id.includes("cuadro")
          );
        }

        return pSubtype === targetTipo || pType === targetTipo || pCat === targetTipo || pCats.includes(targetTipo);
      });
    }

    // Filtro de Búsqueda de Texto
    if (qParam) {
      const query = qParam.toLowerCase().trim();
      list = list.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(query) ||
          (p.subtitle || "").toLowerCase().includes(query) ||
          (p.description || "").toLowerCase().includes(query)
      );
    }

    // Ordenamiento
    if (sortBy === "precio-menor") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === "precio-mayor") {
      list = [...list].sort((a, b) => b.price - a.price);
    }

    return list;
  }, [categoryKey, formaParam, estiloParam, metalParam, gemaParam, tipoParam, subcatParam, generoParam, qParam, sortBy, productsList, gemCollectionOptions]);

  const isCompromisoCategory =
    normKey === "anillo-compromiso" ||
    normKey === "anillos-compromiso" ||
    normKey === "compromiso";

  const isBodaCategory =
    normKey === "aros-boda" ||
    normKey === "aros-de-boda" ||
    normKey === "aros-matrimonio" ||
    normKey === "boda" ||
    normKey === "matrimonio" ||
    normKey === "aros";

  const isPromesaCategory =
    normKey === "amor-promesa" ||
    normKey === "amor-y-promesa" ||
    normKey === "anillo-promesa" ||
    normKey === "anillos-promesa" ||
    normKey === "promesa" ||
    normKey === "aros-alianzas" ||
    normKey === "alianzas";

  const isPromesaRingSelection =
    isPromesaCategory &&
    (subcatParam !== "alianzas-amor" || ["anillo-promesa", "anillos-promesa", "promesa"].includes(normKey));

  const isJoyeriaCategory =
    normKey === "joyeria" ||
    normKey === "joyería" ||
    normKey === "collares" ||
    normKey === "pulseras" ||
    normKey === "aretes" ||
    normKey === "accesorios";

  const isRegalosCategory = normKey === "regalos";

  const isGeneralCategory =
    normKey === "todas" ||
    normKey === "catalogo" ||
    (!isCompromisoCategory && !isBodaCategory && !isPromesaCategory && !isJoyeriaCategory && !isRegalosCategory);

  return (
    <div className="catalog-page">
      {/* Banner de la Categoría */}
      <header className="catalog-hero-banner">
        <div className="catalog-hero-content">
          <span className="catalog-eyebrow">{categoryMeta.eyebrow}</span>
          <h1 className="catalog-title">{categoryMeta.title}</h1>
          <p className="catalog-desc">{categoryMeta.desc}</p>
        </div>
      </header>

      {/* Barra de Filtros y Catálogo */}
      <main className="catalog-container">
        <div className="catalog-filter-bar">
          <div className="catalog-count-text">
            Mostrando <strong>{filteredProducts.length}</strong> modelos en catálogo
            {hasActiveFilters && (
              <button
                type="button"
                className="catalog-clear-inline-btn"
                onClick={clearAllFilters}
                title="Limpiar todos los filtros"
              >
                <i className="bi bi-x-circle"></i> Limpiar filtros
              </button>
            )}
          </div>

          {/* Barra de Filtros Minimalista Estilo Cápsula */}
          <div className="catalog-minimal-pill-bar">
            {/* 1. Anillos de Compromiso */}
            {isCompromisoCategory && (
              <>
                <MinimalPillFilter
                  label="Forma"
                  value={formaParam}
                  onChange={(val) => updateParam("forma", val)}
                  options={FORMA_PILL_OPTIONS}
                  isActive={Boolean(formaParam)}
                />
                <MinimalPillFilter
                  label="Estilo"
                  value={estiloParam}
                  onChange={(val) => updateParam("estilo", val)}
                  options={ESTILO_COMPROMISO_PILL_OPTIONS}
                  isActive={Boolean(estiloParam)}
                />
                <MinimalPillFilter
                  label="Gema"
                  value={gemaParam}
                  onChange={(val) => updateParam("gema", val)}
                  options={gemCollectionOptions.filter((option) => option.id).map((option) => ({
                    value: option.id,
                    label: option.label,
                  }))}
                  isActive={Boolean(gemaParam)}
                />
              </>
            )}

            {/* 2. Aros de Boda */}
            {isBodaCategory && (
              <MinimalPillFilter
                label="Estilo"
                value={estiloParam}
                onChange={(val) => updateParam("estilo", val)}
                options={ESTILO_BODA_PILL_OPTIONS}
                isActive={Boolean(estiloParam)}
              />
            )}

            {/* 3. Amor y Promesa */}
            {isPromesaCategory && (
              <>
                {isPromesaRingSelection && (
                  <MinimalPillFilter
                    label="Forma"
                    value={formaParam}
                    onChange={(val) => updateParam("forma", val)}
                    options={FORMA_PILL_OPTIONS}
                    isActive={Boolean(formaParam)}
                  />
                )}
                <MinimalPillFilter
                  label="Colección"
                  value={subcatParam}
                  onChange={(val) => updateParam("subcat", val)}
                  options={SUBCAT_PROMESA_PILL_OPTIONS}
                  isActive={Boolean(subcatParam)}
                />
                <MinimalPillFilter
                  label="Estilo"
                  value={estiloParam}
                  onChange={(val) => updateParam("estilo", val)}
                  options={ESTILO_PROMESA_PILL_OPTIONS}
                  isActive={Boolean(estiloParam)}
                />
              </>
            )}

            {/* 4. Joyería */}
            {isJoyeriaCategory && (
              <>
                <MinimalPillFilter
                  label="Para"
                  value={generoParam}
                  onChange={(val) => updateParam("genero", val)}
                  options={GENERO_PILL_OPTIONS}
                  isActive={Boolean(generoParam)}
                />
                <MinimalPillFilter
                  label="Tipo"
                  value={tipoParam}
                  onChange={(val) => updateParam("tipo", val)}
                  options={TIPO_JOYERIA_PILL_OPTIONS}
                  isActive={Boolean(tipoParam)}
                />
              </>
            )}

            {/* 5. Regalos */}
            {isRegalosCategory && (
              <MinimalPillFilter
                label="Tipo"
                value={tipoParam}
                onChange={(val) => updateParam("tipo", val)}
                options={TIPO_REGALOS_PILL_OPTIONS}
                isActive={Boolean(tipoParam)}
              />
            )}

            {/* 6. Catálogo General */}
            {isGeneralCategory && (
              <MinimalPillFilter
                label="Estilo"
                value={estiloParam}
                onChange={(val) => updateParam("estilo", val)}
                options={ESTILO_GENERAL_PILL_OPTIONS}
                isActive={Boolean(estiloParam)}
              />
            )}

            {/* Material */}
            {!isRegalosCategory && (
              <MinimalPillFilter
                label="Material"
                value={metalParam}
                onChange={(val) => updateParam("metal", val)}
                options={MATERIAL_PILL_OPTIONS}
                isActive={Boolean(metalParam)}
                alignRight={true}
              />
            )}

            {/* Separador vertical */}
            <span className="minimal-pill-divider" aria-hidden="true"></span>

            {/* Ordenar */}
            <MinimalSortFilter sortBy={sortBy} setSortBy={setSortBy} />
          </div>
        </div>

        {/* Grilla Dinámica de Productos */}
        {filteredProducts.length === 0 ? (
          <div className="catalog-empty-state">
            <i className="bi bi-gem" style={{ fontSize: "36px", display: "block", marginBottom: "12px", color: "var(--platino-gold)" }}></i>
            <h3>No se encontraron piezas con los filtros seleccionados</h3>
            <p>Intenta restablecer o combinar otros filtros para explorar la colección completa.</p>
            <button
              onClick={clearAllFilters}
              className="showroom-btn filled"
              style={{ marginTop: "16px" }}
            >
              Restablecer todos los filtros
            </button>
          </div>
        ) : (
          <section className="catalog-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </section>
        )}

        {/* Asesoría nupcial banner */}
        <div
          style={{
            marginTop: "70px",
            background: "#ffffff",
            border: "1px solid #ebe7df",
            padding: "35px 30px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "24px", color: "var(--platino-green-dark)", margin: "0 0 6px 0" }}>
              ¿Prefieres ver estos modelos en persona?
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "#66726c" }}>
              Agenda una cita exclusiva en nuestras sedes de Lima Centro o Miraflores con un asesor de joyería.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <Link to="/agendar-cita" className="showroom-btn filled">
              Agendar Cita en Joyería
            </Link>
            <Link to="/sedes" className="showroom-btn outline">
              Ver Sedes
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Category;
