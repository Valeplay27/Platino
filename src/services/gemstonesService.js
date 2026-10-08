// Servicio de administración y persistencia de Gemas y Diamantes Certificados para Platino Perú
import { CERTIFIED_GEMSTONES } from "../data/gemstones";

const STORAGE_KEY = "platino_certified_gemstones";
const LABS_STORAGE_KEY = "platino_gem_laboratories";

/**
 * Laboratorios gemológicos por defecto
 */
export const DEFAULT_LABORATORIES = [
  { id: "GIA", code: "GIA", name: "GIA (Gemological Institute of America)" },
  { id: "IGI", code: "IGI", name: "IGI (International Gemological Institute)" },
  { id: "HRD", code: "HRD", name: "HRD Antwerp (Bélgica)" },
  { id: "AGS", code: "AGS", name: "AGS (American Gem Society)" },
  { id: "EGL", code: "EGL", name: "EGL (European Gemological Laboratory)" },
  { id: "GCAL", code: "GCAL", name: "GCAL (Gem Certification & Assurance Lab)" },
  { id: "GUBELIN", code: "GÜBELIN", name: "Gübelin Gem Lab (Suiza)" },
  { id: "SSEF", code: "SSEF", name: "SSEF (Swiss Gemmological Institute)" },
  { id: "PLATINO", code: "PLATINO", name: "Laboratorio Gemológico Platino (Perú)" },
];

/**
 * Obtiene los laboratorios gemológicos almacenados (o por defecto)
 */
export const getStoredLaboratories = () => {
  try {
    const raw = localStorage.getItem(LABS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LABS_STORAGE_KEY, JSON.stringify(DEFAULT_LABORATORIES));
      return DEFAULT_LABORATORIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_LABORATORIES;
  } catch (error) {
    console.error("Error al cargar laboratorios gemológicos:", error);
    return DEFAULT_LABORATORIES;
  }
};

/**
 * Guarda los laboratorios gemológicos en localStorage y emite evento reactivo
 */
export const saveStoredLaboratories = (laboratories) => {
  try {
    localStorage.setItem(LABS_STORAGE_KEY, JSON.stringify(laboratories));
    window.dispatchEvent(new CustomEvent("platino_gem_laboratories_updated"));
    return true;
  } catch (error) {
    console.error("Error al guardar laboratorios gemológicos:", error);
    return false;
  }
};

/**
 * Agrega un nuevo laboratorio gemológico personalizado
 */
export const addLaboratory = (newLab) => {
  const current = getStoredLaboratories();
  const name = typeof newLab === "string" ? newLab.trim() : (newLab.name || "").trim();
  const rawCode = typeof newLab === "object" && newLab.code ? newLab.code.trim() : name.split(" ")[0];
  const code = (rawCode || name).toUpperCase();
  if (!name) return null;

  // Evitar duplicados por nombre o código
  const exists = current.find(
    (l) => l.name.toLowerCase() === name.toLowerCase() || l.code.toLowerCase() === code.toLowerCase()
  );
  if (exists) return exists;

  const created = {
    id: `LAB-${Date.now().toString(36).toUpperCase()}`,
    name,
    code,
    isCustom: true,
    createdAt: new Date().toISOString(),
  };

  const updated = [...current, created];
  saveStoredLaboratories(updated);
  return created;
};

/**
 * Elimina un laboratorio gemológico (si es personalizado)
 */
export const deleteLaboratory = (labId) => {
  const current = getStoredLaboratories();
  const filtered = current.filter((l) => l.id !== labId && l.code !== labId);
  saveStoredLaboratories(filtered);
  return true;
};

/**
 * Normaliza una gema garantizando campos de unidades y sincronización de stock
 */
export const normalizeGemstone = (g) => {
  const rawUnits = g.units !== undefined ? Number(g.units) : (g.inStock !== false ? 1 : 0);
  const units = Math.max(0, isNaN(rawUnits) ? 0 : rawUnits);
  const inStock = units > 0 && g.inStock !== false;

  return {
    ...g,
    units,
    inStock,
    price: Number(g.price) || 0,
    priceFormatted: g.priceFormatted || `S/. ${(Number(g.price) || 0).toLocaleString("es-PE")}`,
  };
};

/**
 * Obtiene la lista actual de gemas certificadas (desde localStorage o por defecto)
 */
export const getStoredGemstones = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const normalizedDefaults = CERTIFIED_GEMSTONES.map(normalizeGemstone);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedDefaults));
      return normalizedDefaults;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(normalizeGemstone);
    }
    const normalizedDefaults = CERTIFIED_GEMSTONES.map(normalizeGemstone);
    return normalizedDefaults;
  } catch (error) {
    console.error("Error al cargar gemas certificadas de almacenamiento:", error);
    return CERTIFIED_GEMSTONES.map(normalizeGemstone);
  }
};

/**
 * Guarda la lista de gemas en localStorage y emite evento global
 */
export const saveStoredGemstones = (gemstones) => {
  try {
    const normalized = (gemstones || []).map(normalizeGemstone);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent("platino_gemstones_updated"));
    return true;
  } catch (error) {
    console.error("Error al guardar gemas certificadas:", error);
    return false;
  }
};

/**
 * Agrega una nueva gema certificada
 */
export const addGemstone = (newGem) => {
  const current = getStoredGemstones();
  const id = newGem.id || `GEM-${Date.now().toString(36).toUpperCase()}`;
  const priceNum = Number(newGem.price) || 0;
  const rawUnits = newGem.units !== undefined ? Number(newGem.units) : 1;
  const unitsNum = Math.max(0, isNaN(rawUnits) ? 0 : rawUnits);
  const inStock = unitsNum > 0 && newGem.inStock !== false;
  
  const created = normalizeGemstone({
    ...newGem,
    id,
    price: priceNum,
    priceFormatted: `S/. ${priceNum.toLocaleString("es-PE")}`,
    units: unitsNum,
    inStock,
    mm: parseFloat(newGem.mm || newGem.dimensions) || 7.0,
    dimensions: newGem.dimensions || `${newGem.mm || 7.0} x ${newGem.mm || 7.0} x 4.0 mm`,
    createdAt: new Date().toISOString(),
  });

  const updated = [created, ...current];
  saveStoredGemstones(updated);
  return created;
};

/**
 * Actualiza una gema existente
 */
export const updateGemstone = (id, updatedFields) => {
  const current = getStoredGemstones();
  const index = current.findIndex((g) => g.id === id);
  if (index === -1) return null;

  const priceNum = updatedFields.price !== undefined ? Number(updatedFields.price) : current[index].price;
  
  let unitsNum = current[index].units !== undefined ? current[index].units : 1;
  if (updatedFields.units !== undefined) {
    const parsed = Number(updatedFields.units);
    unitsNum = Math.max(0, isNaN(parsed) ? 0 : parsed);
  }
  const inStock = unitsNum > 0 && updatedFields.inStock !== false;

  const updatedItem = normalizeGemstone({
    ...current[index],
    ...updatedFields,
    price: priceNum,
    priceFormatted: `S/. ${priceNum.toLocaleString("es-PE")}`,
    units: unitsNum,
    inStock,
    mm: updatedFields.mm ? parseFloat(updatedFields.mm) : current[index].mm,
    updatedAt: new Date().toISOString(),
  });

  const updatedList = [...current];
  updatedList[index] = updatedItem;
  saveStoredGemstones(updatedList);
  return updatedItem;
};

/**
 * Actualiza directamente las unidades de una gema
 */
export const updateGemstoneUnits = (id, newUnits) => {
  const current = getStoredGemstones();
  const index = current.findIndex((g) => g.id === id);
  if (index === -1) return null;

  const parsed = Number(newUnits);
  const unitsNum = Math.max(0, isNaN(parsed) ? 0 : parsed);
  const inStock = unitsNum > 0;

  const updatedItem = {
    ...current[index],
    units: unitsNum,
    inStock,
    updatedAt: new Date().toISOString(),
  };

  current[index] = normalizeGemstone(updatedItem);
  saveStoredGemstones([...current]);
  return current[index];
};

/**
 * Elimina una gema por su ID
 */
export const deleteGemstone = (id) => {
  const current = getStoredGemstones();
  const filtered = current.filter((g) => g.id !== id);
  saveStoredGemstones(filtered);
  return true;
};

/**
 * Alterna el estado de stock (En Stock / Agotado)
 */
export const toggleGemstoneStock = (id) => {
  const current = getStoredGemstones();
  const index = current.findIndex((g) => g.id === id);
  if (index === -1) return false;

  const currentItem = current[index];
  const nextInStock = !currentItem.inStock;
  
  let newUnits = currentItem.units;
  if (nextInStock && (!newUnits || newUnits <= 0)) {
    newUnits = 1; // Si reactiva stock y estaba en 0, asigna 1
  } else if (!nextInStock) {
    newUnits = 0; // Si se marca agotado, se fija en 0
  }

  current[index] = normalizeGemstone({
    ...currentItem,
    inStock: nextInStock,
    units: newUnits,
    updatedAt: new Date().toISOString(),
  });

  saveStoredGemstones([...current]);
  return current[index].inStock;
};

/**
 * Restablece las gemas al catálogo por defecto
 */
export const resetGemstonesToDefault = () => {
  const defaults = CERTIFIED_GEMSTONES.map(normalizeGemstone);
  saveStoredGemstones(defaults);
  return defaults;
};
