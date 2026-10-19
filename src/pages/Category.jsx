import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { CATEGORY_INFO } from "../data/products";
import { getCatalogProducts } from "../services/catalogService";
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
  const [sortBy, setSortBy] = useState("destacados");

  useEffect(() => {
    const handleUpdate = () => setProductsList(getCatalogProducts());
    window.addEventListener("catalog_updated", handleUpdate);
    return () => window.removeEventListener("catalog_updated", handleUpdate);
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
          pCats.includes("aros-boda") ||
          pCats.includes("aros-matrimonio") ||
          pCats.includes("aros") ||
          pType === "aros" ||
          pName.includes("aros") ||
          pName.includes("boda") ||
          pName.includes("matrimonio")
        );
      }

      // 2. Anillos de Compromiso (singular o plural)
      if (normKey === "anillo-compromiso" || normKey === "anillos-compromiso" || normKey === "compromiso") {
        return (
          pCat === "anillo-compromiso" ||
          pCat === "anillos-compromiso" ||
          pCats.includes("anillo-compromiso") ||
          pCats.includes("anillos-compromiso") ||
          pName.includes("compromiso")
        );
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
        return (
          pCat === "anillo-promesa" ||
          pCat === "anillos-promesa" ||
          pCat === "aros-alianzas" ||
          pCat === "alianzas" ||
          pCat === "amor-promesa" ||
          pCats.includes("anillo-promesa") ||
          pCats.includes("anillos-promesa") ||
          pCats.includes("aros-alianzas") ||
          pCats.includes("alianzas") ||
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
          pCats.includes("joyeria") ||
          pCats.includes("collares") ||
          pCats.includes("pulseras") ||
          pCats.includes("aretes") ||
          pCats.includes("cadenas") ||
          pCats.includes("tobilleras") ||
          pCats.includes("juegos") ||
          pCats.includes("kids") ||
          Boolean(p.gender) ||
          pType === "accesorio"
        );
      }

      // 5. Regalos
      if (normKey === "regalos") {
        return (
          pCat === "regalos" ||
          pCats.includes("regalos") ||
          p.hasPresentationChoice ||
          pType === "accesorio" ||
          pType === "porta-aros" ||
          pType === "copas-decoradas" ||
          pType === "cuadros" ||
          pName.includes("porta") ||
          pName.includes("copa") ||
          pName.includes("cuadro")
        );
      }

      return pCat === normKey || pCats.includes(normKey);
    });

    // Filtro por Subcategoría (Amor y Promesa: Anillo de Promesa vs Alianzas de Amor)
    if (subcatParam) {
      const targetSubcat = subcatParam.toLowerCase();
      list = list.filter((p) => {
        const pCat = (p.category || "").toLowerCase();
        const pCats = Array.isArray(p.categories) ? p.categories.map((c) => String(c).toLowerCase()) : [];
        const pType = (p.type || "").toLowerCase();
        const pName = (p.name || "").toLowerCase();

        if (targetSubcat === "anillo-promesa" || targetSubcat === "promesa") {
          return (
            pCat === "anillo-promesa" ||
            pCat === "anillos-promesa" ||
            pCats.includes("anillo-promesa") ||
            pCats.includes("anillos-promesa") ||
            pName.includes("promesa") ||
            pType === "anillo"
          );
        }
        if (targetSubcat === "alianzas-amor" || targetSubcat === "alianzas" || targetSubcat === "alianza") {
          return (
            pCat === "alianzas" ||
            pCat === "aros-alianzas" ||
            pCats.includes("alianzas") ||
            pCats.includes("aros-alianzas") ||
            pName.includes("alianza") ||
            pType === "aros"
          );
        }
        return pCat === targetSubcat || pCats.includes(targetSubcat);
      });
    }

    // Filtro por Género (Joyería: Mujer, Hombre, Kids)
    if (generoParam) {
      const targetGenero = generoParam.toLowerCase();
      list = list.filter((p) => {
        const pGender = (p.gender || "").toLowerCase();
        const pCats = Array.isArray(p.categories) ? p.categories.map((c) => String(c).toLowerCase()) : [];
        const pName = (p.name || "").toLowerCase();

        if (targetGenero === "mujer") {
          return pGender === "mujer" || (!pGender && pGender !== "hombre" && pGender !== "kids");
        }
        if (targetGenero === "hombre" || targetGenero === "el" || targetGenero === "él") {
          return pGender === "hombre" || pName.includes("varón") || pName.includes("varon") || pName.includes("hombre");
        }
        if (targetGenero === "kids" || targetGenero === "ninos" || targetGenero === "niños") {
          return (
            pGender === "kids" ||
            pCats.includes("kids") ||
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
      const targetForma = formaParam.toLowerCase();
      list = list.filter((p) => {
        const defaultShape = (p.defaultGemShape || "").toLowerCase();
        const shapes = Array.isArray(p.availableGemShapes)
          ? p.availableGemShapes.map((s) => String(s).toLowerCase())
          : [];
        const pName = (p.name || "").toLowerCase();

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
          return (
            shapes.some((s) => !["redondo", "oval"].includes(s)) ||
            defaultShape.includes("princesa") ||
            defaultShape.includes("pera") ||
            defaultShape.includes("cojín") ||
            defaultShape.includes("cojin") ||
            defaultShape.includes("radiante")
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
      const targetGema = gemaParam.toLowerCase();
      list = list.filter((p) => {
        const pGem = (p.gem || "").toLowerCase();
        const pName = (p.name || "").toLowerCase();
        const pBadge = (p.badge || "").toLowerCase();
        const pDesc = (p.description || "").toLowerCase();

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
        return pGem === targetGema;
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
        const pName = (p.name || "").toLowerCase();

        // Aretes
        if (targetTipo === "aretes") {
          return pCat === "aretes" || pCats.includes("aretes") || pType.includes("aretes") || pName.includes("arete");
        }
        if (targetTipo === "aretes-bebes") {
          return pType === "aretes-bebes" || pName.includes("bebé") || pName.includes("bebe") || pName.includes("abridor");
        }
        if (targetTipo === "aretes-pegados") {
          return pType === "aretes-pegados" || pName.includes("pegado") || pName.includes("solitario");
        }
        if (targetTipo === "aretes-colgantes") {
          return pType === "aretes-colgantes" || pName.includes("colgante") || pName.includes("cascada");
        }
        if (targetTipo === "aretes-nina") {
          return pType === "aretes-nina" || pType === "aretes-bebes" || pName.includes("niña") || pName.includes("mariposa");
        }

        // Collares
        if (targetTipo === "collares") {
          return pCat === "collares" || pCats.includes("collares") || pType.includes("collar") || pName.includes("collar") || pName.includes("gargantilla");
        }
        if (targetTipo === "collares-vestir") {
          return pType === "collares-vestir" || p.id === "collar-solitario-lagrima" || (pCat === "collares" && !pName.includes("relicario"));
        }
        if (targetTipo === "collares-gemas") {
          return pType === "collares-gemas" || p.id === "collar-cristal" || p.id === "collar-solitario-lagrima" || Boolean(p.gem) || (p.badge || "").includes("Cristal");
        }
        if (targetTipo === "collares-relicarios") {
          return pType === "collares-relicarios" || pName.includes("relicario") || pName.includes("guardapelo");
        }
        if (targetTipo === "collares-religiosos") {
          return pType === "collares-religiosos" || pName.includes("cruz") || pName.includes("ángel") || pName.includes("angel") || pName.includes("religioso");
        }
        if (targetTipo === "collares-personalizados") {
          return pType === "collares-personalizados" || pName.includes("personalizado") || pName.includes("nombre");
        }

        // Otras Joyas
        if (targetTipo === "anillos") {
          return pType === "anillo" || pCat.includes("anillo") || pCats.some((c) => c.includes("anillo")) || pName.includes("anillo");
        }
        if (targetTipo === "cadenas") {
          return pType === "cadenas" || pCat === "cadenas" || pCats.includes("cadenas") || pName.includes("cadena");
        }
        if (targetTipo === "juegos") {
          return pType === "juegos" || pCats.includes("juegos") || pName.includes("juego") || pName.includes("set");
        }
        if (targetTipo === "pulseras") {
          return pCat === "pulseras" || pCats.includes("pulseras") || pType === "pulseras" || pName.includes("pulsera") || pName.includes("esclava");
        }
        if (targetTipo === "tobilleras") {
          return pType === "tobilleras" || pCats.includes("tobilleras") || pName.includes("tobillera");
        }
        if (targetTipo === "aros-casuales") {
          return pType === "aros-casuales" || pCats.includes("aros-casuales") || (pName.includes("aro") && (p.gender === "hombre" || pName.includes("varón")));
        }
        if (targetTipo === "relojes") {
          return pType === "relojes" || pCats.includes("relojes") || pName.includes("reloj");
        }

        // Accesorios y Regalos
        if (targetTipo === "porta-aros" || targetTipo === "porta-aro") {
          return pType === "porta-aros" || pName.includes("porta") || p.id.includes("porta");
        }
        if (targetTipo === "copas-decoradas" || targetTipo === "copas") {
          return pType === "copas-decoradas" || pName.includes("copa") || p.id.includes("copa");
        }
        if (targetTipo === "cuadros") {
          return pType === "cuadros" || pName.includes("cuadro") || p.id.includes("cuadro");
        }

        return pType === targetTipo || pCat === targetTipo;
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
  }, [categoryKey, formaParam, estiloParam, metalParam, gemaParam, tipoParam, subcatParam, generoParam, qParam, sortBy, productsList]);

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
          </div>

          <div className="catalog-filter-group">
            {/* 1. Categoría: Anillos de Compromiso */}
            {isCompromisoCategory && (
              <>
                <select
                  value={formaParam}
                  onChange={(e) => updateParam("forma", e.target.value)}
                  className="catalog-filter-select"
                  aria-label="Filtrar por forma de gema"
                >
                  <option value="">Forma: Todas</option>
                  <option value="redondo">Redondo</option>
                  <option value="oval">Oval</option>
                  <option value="marquesa">Marquesa</option>
                  <option value="esmeralda">Esmeralda</option>
                  <option value="corazon">Corazón</option>
                  <option value="otros">Otros Cortes</option>
                </select>

                <select
                  value={estiloParam}
                  onChange={(e) => updateParam("estilo", e.target.value)}
                  className="catalog-filter-select"
                  aria-label="Filtrar por estilo"
                >
                  <option value="">Estilo: Todos</option>
                  <option value="solitario">Solitarios</option>
                  <option value="3-piedras">3 Piedras</option>
                  <option value="con-pave">Con Pavé</option>
                  <option value="moderno">Modernos</option>
                  <option value="vintage">Vintage</option>
                  <option value="con-gemas">Con Gemas</option>
                </select>

                <select
                  value={gemaParam}
                  onChange={(e) => updateParam("gema", e.target.value)}
                  className="catalog-filter-select"
                  aria-label="Filtrar por gema"
                >
                  <option value="">Gema: Todas</option>
                  <option value="diamante">Diamante</option>
                  <option value="esmeralda">Esmeralda</option>
                  <option value="rubi">Rubí</option>
                  <option value="zafiro">Zafiro</option>
                </select>
              </>
            )}

            {/* 2. Categoría: Aros de Boda */}
            {isBodaCategory && (
              <select
                value={estiloParam}
                onChange={(e) => updateParam("estilo", e.target.value)}
                className="catalog-filter-select"
                aria-label="Filtrar por estilo de aros"
              >
                <option value="">Estilo: Todos</option>
                <option value="clasicos">Clásicos</option>
                <option value="con-pedreria">Con Pedrería</option>
                <option value="con-textura">Con Textura</option>
                <option value="moderno">Moderno</option>
                <option value="vintage">Vintage</option>
              </select>
            )}

            {/* 3. Categoría: Amor y Promesa */}
            {isPromesaCategory && (
              <>
                <select
                  value={subcatParam}
                  onChange={(e) => updateParam("subcat", e.target.value)}
                  className="catalog-filter-select"
                  aria-label="Filtrar por colección"
                >
                  <option value="">Colección: Todas</option>
                  <option value="anillo-promesa">Anillos de Promesa</option>
                  <option value="alianzas-amor">Alianzas de Amor</option>
                </select>

                <select
                  value={estiloParam}
                  onChange={(e) => updateParam("estilo", e.target.value)}
                  className="catalog-filter-select"
                  aria-label="Filtrar por estilo"
                >
                  <option value="">Estilo: Todos</option>
                  <option value="clasicos">Clásicos</option>
                  <option value="con-pedreria">Con Pedrería</option>
                  <option value="sin-pedreria">Sin Pedrería</option>
                  <option value="moderno">Moderno</option>
                  <option value="vintage">Vintage</option>
                  <option value="gemas-naturales">Gemas Naturales</option>
                </select>
              </>
            )}

            {/* 4. Categoría: Joyería */}
            {isJoyeriaCategory && (
              <>
                <select
                  value={generoParam}
                  onChange={(e) => updateParam("genero", e.target.value)}
                  className="catalog-filter-select"
                  aria-label="Filtrar por destinatario"
                >
                  <option value="">Para: Todos</option>
                  <option value="mujer">Para Ella</option>
                  <option value="hombre">Para Él</option>
                  <option value="kids">Kids / Niños</option>
                </select>

                <select
                  value={tipoParam}
                  onChange={(e) => updateParam("tipo", e.target.value)}
                  className="catalog-filter-select"
                  aria-label="Filtrar por tipo de joya"
                >
                  <option value="">Tipo: Todos</option>
                  <optgroup label="Para Ella">
                    <option value="aretes">Aretes</option>
                    <option value="aretes-pegados">Aretes Pegados</option>
                    <option value="aretes-colgantes">Aretes Colgantes</option>
                    <option value="collares">Collares</option>
                    <option value="collares-vestir">Collares de Vestir</option>
                    <option value="collares-gemas">Collares con Gemas</option>
                    <option value="collares-relicarios">Relicarios</option>
                    <option value="collares-religiosos">Collares Religiosos</option>
                    <option value="collares-personalizados">Collares Personalizados</option>
                    <option value="anillos">Anillos</option>
                    <option value="cadenas">Cadenas</option>
                    <option value="juegos">Juegos</option>
                    <option value="pulseras">Pulseras</option>
                    <option value="tobilleras">Tobilleras</option>
                  </optgroup>
                  <optgroup label="Para Él">
                    <option value="aros-casuales">Aros Casuales</option>
                    <option value="cadenas">Cadenas</option>
                    <option value="pulseras">Pulseras</option>
                    <option value="relojes">Relojes</option>
                  </optgroup>
                  <optgroup label="Kids">
                    <option value="aretes-bebes">Aretes Bebé</option>
                    <option value="aretes-nina">Aretes Niña</option>
                    <option value="cadenas">Cadenas</option>
                    <option value="pulseras">Pulseras</option>
                  </optgroup>
                </select>
              </>
            )}

            {/* 5. Categoría: Regalos */}
            {isRegalosCategory && (
              <select
                value={tipoParam}
                onChange={(e) => updateParam("tipo", e.target.value)}
                className="catalog-filter-select"
                aria-label="Filtrar por tipo de regalo"
              >
                <option value="">Tipo: Todos</option>
                <option value="porta-aros">Porta Aros</option>
                <option value="copas-decoradas">Copas Decoradas</option>
                <option value="cuadros">Cuadros Conmemorativos</option>
              </select>
            )}

            {/* 6. Catálogo General 'todas' */}
            {isGeneralCategory && (
              <select
                value={estiloParam}
                onChange={(e) => updateParam("estilo", e.target.value)}
                className="catalog-filter-select"
                aria-label="Filtrar por estilo"
              >
                <option value="">Estilo: Todos</option>
                <option value="solitario">Solitarios</option>
                <option value="clasicos">Clásicos</option>
                <option value="con-pedreria">Con Pedrería</option>
                <option value="sin-pedreria">Sin Pedrería</option>
                <option value="con-textura">Con Textura</option>
                <option value="3-piedras">3 Piedras</option>
                <option value="con-pave">Con Pavé</option>
                <option value="moderno">Modernos</option>
                <option value="vintage">Vintage</option>
                <option value="con-gemas">Con Gemas</option>
              </select>
            )}

            {/* Filtro por Metal / Material (Visible salvo en Regalos puros) */}
            {!isRegalosCategory && (
              <select
                value={metalParam}
                onChange={(e) => updateParam("metal", e.target.value)}
                className="catalog-filter-select"
                aria-label="Filtrar por material"
              >
                <option value="">Material: Todos</option>
                <optgroup label="Plata">
                  <option value="plata-950">Plata Ley 950</option>
                </optgroup>
                <optgroup label="Plata con Oro 18k">
                  <option value="plata-oro-18k">Plata 950 con Oro 18k</option>
                </optgroup>
                <optgroup label="Oro de 18 Quilates">
                  <option value="oro-natural-18k">Oro 18k Natural</option>
                  <option value="oro-amarillo-18k">Oro 18k Amarillo</option>
                  <option value="oro-rosado-18k">Oro 18k Rosa</option>
                  <option value="oro-blanco-18k">Oro 18k Blanco</option>
                </optgroup>
                <optgroup label="Platino">
                  <option value="platino">Platino 950</option>
                </optgroup>
              </select>
            )}

            {/* Ordenar por */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="catalog-filter-select"
              aria-label="Ordenar productos"
            >
              <option value="destacados">Ordenar: Destacados</option>
              <option value="precio-menor">Precio: Menor a Mayor</option>
              <option value="precio-mayor">Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>

        {/* Fila de Chips de Filtros Activos */}
        {hasActiveFilters && (
          <div className="active-filters-row">
            <span className="active-filters-label">
              <i className="bi bi-funnel"></i> Filtros activos:
            </span>

            <div className="active-filters-chips">
              {subcatParam && (
                <button
                  type="button"
                  className="active-filter-chip"
                  onClick={() => clearParam("subcat")}
                  title="Eliminar filtro de colección"
                >
                  <span>Colección: {SUBCAT_LABELS[subcatParam] || subcatParam}</span>
                  <i className="bi bi-x-lg"></i>
                </button>
              )}

              {generoParam && (
                <button
                  type="button"
                  className="active-filter-chip"
                  onClick={() => clearParam("genero")}
                  title="Eliminar filtro de destinatario"
                >
                  <span>Para: {GENERO_LABELS[generoParam] || generoParam}</span>
                  <i className="bi bi-x-lg"></i>
                </button>
              )}

              {tipoParam && (
                <button
                  type="button"
                  className="active-filter-chip"
                  onClick={() => clearParam("tipo")}
                  title="Eliminar filtro de tipo"
                >
                  <span>Tipo: {TIPO_LABELS[tipoParam] || tipoParam}</span>
                  <i className="bi bi-x-lg"></i>
                </button>
              )}

              {formaParam && (
                <button
                  type="button"
                  className="active-filter-chip"
                  onClick={() => clearParam("forma")}
                  title="Eliminar filtro de corte"
                >
                  <span>Forma: {FORMA_LABELS[formaParam] || formaParam}</span>
                  <i className="bi bi-x-lg"></i>
                </button>
              )}

              {estiloParam && (
                <button
                  type="button"
                  className="active-filter-chip"
                  onClick={() => clearParam("estilo")}
                  title="Eliminar filtro de estilo"
                >
                  <span>Estilo: {ESTILO_LABELS[estiloParam] || estiloParam}</span>
                  <i className="bi bi-x-lg"></i>
                </button>
              )}

              {metalParam && (
                <button
                  type="button"
                  className="active-filter-chip"
                  onClick={() => clearParam("metal")}
                  title="Eliminar filtro de material"
                >
                  <span>Material: {METAL_LABELS[metalParam] || metalParam}</span>
                  <i className="bi bi-x-lg"></i>
                </button>
              )}

              {gemaParam && (
                <button
                  type="button"
                  className="active-filter-chip"
                  onClick={() => clearParam("gema")}
                  title="Eliminar filtro de gema"
                >
                  <span>Gema: {GEMA_LABELS[gemaParam] || gemaParam}</span>
                  <i className="bi bi-x-lg"></i>
                </button>
              )}

              {qParam && (
                <button
                  type="button"
                  className="active-filter-chip"
                  onClick={() => clearParam("q")}
                  title="Eliminar búsqueda"
                >
                  <span>Búsqueda: "{qParam}"</span>
                  <i className="bi bi-x-lg"></i>
                </button>
              )}

              <button
                type="button"
                className="clear-all-filters-btn"
                onClick={clearAllFilters}
              >
                Limpiar todo
              </button>
            </div>
          </div>
        )}

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
