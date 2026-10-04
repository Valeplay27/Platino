// Servicio para la gestión financiera y porcentajes de ganancia por categoría de Platino Joyería (Exclusivo Administrador)

export const CATEGORIES_CONFIG = [
  { id: "anillo-compromiso", label: "Anillos de Compromiso", icon: "💍", defaultMargin: 40 },
  { id: "aros-boda", label: "Aros de Boda", icon: "💒", defaultMargin: 35 },
  { id: "anillo-promesa", label: "Anillos de Promesa", icon: "✨", defaultMargin: 40 },
  { id: "aros-alianzas", label: "Aros de Alianzas", icon: "🤝", defaultMargin: 35 },
  { id: "joyeria", label: "Joyería & Accesorios", icon: "💎", defaultMargin: 45 },
];

export const DEFAULT_CATEGORY_MARGINS = {
  "anillo-compromiso": 40,
  "aros-boda": 35,
  "anillo-promesa": 40,
  "aros-alianzas": 35,
  "joyeria": 45,
};

const STORAGE_KEY_CATEGORY_MARGINS = "platino_category_margins_v2";

/**
 * Obtiene los porcentajes de ganancia de cada categoría
 */
export const getCategoryMargins = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CATEGORY_MARGINS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed === "object" && parsed !== null) {
        return { ...DEFAULT_CATEGORY_MARGINS, ...parsed };
      }
    }
  } catch (e) {
    console.error("Error al leer márgenes de categorías:", e);
  }
  return { ...DEFAULT_CATEGORY_MARGINS };
};

/**
 * Guarda el porcentaje de ganancia de una categoría específica
 */
export const saveCategoryMargin = (categoryId, marginVal) => {
  try {
    const current = getCategoryMargins();
    const num = Math.min(99, Math.max(1, parseInt(marginVal, 10) || 0));
    current[categoryId] = num;
    localStorage.setItem(STORAGE_KEY_CATEGORY_MARGINS, JSON.stringify(current));
    window.dispatchEvent(new Event("platino_category_margins_updated"));
    return current;
  } catch (e) {
    console.error("Error al guardar margen de categoría:", e);
    return DEFAULT_CATEGORY_MARGINS;
  }
};

/**
 * Determina la categoría de negocio de una joya para el cálculo de ganancias
 */
export const getProductCategoryKey = (prod) => {
  if (!prod) return "joyeria";
  const cat = (prod.category || "").toLowerCase();
  const cats = Array.isArray(prod.categories) ? prod.categories.map((c) => String(c).toLowerCase()) : [];
  const name = (prod.name || "").toLowerCase();
  const all = [cat, ...cats, name].join(" ");

  if (all.includes("compromiso")) return "anillo-compromiso";
  if (all.includes("promesa")) return "anillo-promesa";
  if (all.includes("alianza")) return "aros-alianzas";
  if (all.includes("boda") || all.includes("matrimonio") || all.includes("aros")) return "aros-boda";
  return "joyeria";
};

/**
 * Calcula las métricas por categoría dejando el valor del producto como Ventas (sin descontar costos)
 */
export const calculateCategoryFinancials = (catalogList = [], allInventoryMap = {}, categoryMargins = {}) => {
  const margins = { ...DEFAULT_CATEGORY_MARGINS, ...categoryMargins };

  const byCategory = {};
  CATEGORIES_CONFIG.forEach((cat) => {
    byCategory[cat.id] = {
      ...cat,
      margin: margins[cat.id] ?? cat.defaultMargin,
      productCount: 0,
      totalUnits: 0,
      totalVentas: 0,
      totalProfit: 0,
      products: [],
    };
  });

  (catalogList || []).forEach((prod) => {
    const key = getProductCategoryKey(prod);
    const catEntry = byCategory[key] || byCategory["joyeria"];
    catEntry.productCount += 1;

    // Unidades de inventario
    const stockObj = allInventoryMap[prod.id];
    let prodUnits = 0;
    if (stockObj && stockObj.dama && stockObj.varon) {
      ["dama", "varon"].forEach((g) => {
        const sizes = stockObj[g] || {};
        Object.keys(sizes).forEach((sz) => {
          const locs = sizes[sz] || {};
          prodUnits += (locs.bodega || 0) + (locs.limaCentro || 0) + (locs.miraflores || 0);
        });
      });
    } else {
      prodUnits = 0;
    }

    // El valor que se le pone al producto se toma directamente como Ventas
    const price = parseFloat(prod.price) || 0;
    catEntry.totalUnits += prodUnits;
    catEntry.totalVentas += price;

    catEntry.products.push({
      id: prod.id,
      name: prod.name,
      price: price,
      image: prod.image,
      units: prodUnits,
    });
  });

  // Ganancia por categoría = Ventas * (% de Ganancia / 100)
  let grandTotalVentas = 0;
  let grandTotalProfit = 0;
  let grandTotalUnits = 0;

  Object.values(byCategory).forEach((item) => {
    item.totalProfit = Math.round(item.totalVentas * (item.margin / 100));
    grandTotalVentas += item.totalVentas;
    grandTotalProfit += item.totalProfit;
    grandTotalUnits += item.totalUnits;
  });

  const averageMargin = grandTotalVentas > 0
    ? Math.round((grandTotalProfit / grandTotalVentas) * 100)
    : 40;

  return {
    categories: Object.values(byCategory),
    grandTotalVentas,
    grandTotalProfit,
    grandTotalUnits,
    averageMargin,
  };
};
