// Servicio de administración y persistencia de Gemas y Diamantes Certificados para Platino Perú
import { CERTIFIED_GEMSTONES } from "../data/gemstones";

const STORAGE_KEY = "platino_certified_gemstones";

/**
 * Obtiene la lista actual de gemas certificadas (desde localStorage o por defecto)
 */
export const getStoredGemstones = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(CERTIFIED_GEMSTONES));
      return CERTIFIED_GEMSTONES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return CERTIFIED_GEMSTONES;
  } catch (error) {
    console.error("Error al cargar gemas certificadas de almacenamiento:", error);
    return CERTIFIED_GEMSTONES;
  }
};

/**
 * Guarda la lista de gemas en localStorage y emite evento global
 */
export const saveStoredGemstones = (gemstones) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gemstones));
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
  
  const created = {
    ...newGem,
    id,
    price: priceNum,
    priceFormatted: `S/. ${priceNum.toLocaleString("es-PE")}`,
    inStock: newGem.inStock !== false,
    mm: parseFloat(newGem.mm || newGem.dimensions) || 7.0,
    dimensions: newGem.dimensions || `${newGem.mm || 7.0} x ${newGem.mm || 7.0} x 4.0 mm`,
    createdAt: new Date().toISOString(),
  };

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
  
  const updatedItem = {
    ...current[index],
    ...updatedFields,
    price: priceNum,
    priceFormatted: `S/. ${priceNum.toLocaleString("es-PE")}`,
    mm: updatedFields.mm ? parseFloat(updatedFields.mm) : current[index].mm,
    updatedAt: new Date().toISOString(),
  };

  const updatedList = [...current];
  updatedList[index] = updatedItem;
  saveStoredGemstones(updatedList);
  return updatedItem;
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

  current[index].inStock = !current[index].inStock;
  saveStoredGemstones([...current]);
  return current[index].inStock;
};

/**
 * Restablece las gemas al catálogo por defecto
 */
export const resetGemstonesToDefault = () => {
  saveStoredGemstones(CERTIFIED_GEMSTONES);
  return CERTIFIED_GEMSTONES;
};
