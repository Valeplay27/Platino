/**
 * Servicio de Inventario y Control de Stock por Tallas
 * Tallas de Dama: 05 al 27
 * Tallas de Varón: 10 al 37
 * 3 Almacenes / Inventarios:
 *  1. Bodega (Almacén Central)
 *  2. Sede Lima Centro (Jr. de la Unión)
 *  3. Sede Miraflores (Av. Larco)
 */

export const INVENTORY_LOCATIONS = [
  {
    id: "bodega",
    name: "Bodega",
    shortName: "Bodega",
    label: "Bodega (Almacén Central)",
    badge: "Almacén Central",
    icon: "bi-building-fill",
    color: "#4361ee",
  },
  {
    id: "lima-centro",
    name: "Sede Lima Centro",
    shortName: "Lima Centro",
    label: "Sede Lima Centro (Jr. de la Unión)",
    badge: "Jr. de la Unión 446",
    icon: "bi-geo-alt-fill",
    color: "#137748",
  },
  {
    id: "miraflores",
    name: "Sede Miraflores",
    shortName: "Miraflores",
    label: "Sede Miraflores (Av. Larco)",
    badge: "Av. Larco 345",
    icon: "bi-gem",
    color: "#8338ec",
  },
];

// Generar lista de Tallas de Dama (05 hasta el 27)
export const DAMA_SIZES = Array.from({ length: 23 }, (_, i) => {
  const num = i + 5;
  const numStr = num < 10 ? `0${num}` : `${num}`;
  // Aproximación de diámetro interior en mm estándar peruano
  const diameter = (13.7 + num * 0.32).toFixed(1);
  const circumference = (diameter * Math.PI).toFixed(1);
  return {
    id: `dama-${numStr}`,
    number: numStr,
    numericVal: num,
    label: `Talla ${numStr}`,
    fullLabel: `Talla ${numStr} (${diameter} mm)`,
    diameter: `${diameter} mm`,
    circumference: `${circumference} mm`,
    gender: "dama",
  };
});

// Generar lista de Tallas de Varón (10 hasta el 37)
export const VARON_SIZES = Array.from({ length: 28 }, (_, i) => {
  const num = i + 10;
  const numStr = `${num}`;
  const diameter = (15.0 + (num - 10) * 0.35).toFixed(1);
  const circumference = (diameter * Math.PI).toFixed(1);
  return {
    id: `varon-${numStr}`,
    number: numStr,
    numericVal: num,
    label: `Talla ${numStr}`,
    fullLabel: `Talla ${numStr} (${diameter} mm)`,
    diameter: `${diameter} mm`,
    circumference: `${circumference} mm`,
    gender: "varon",
  };
});

// Opción universal para asesoría presencial / medición gratuita
export const ASESOR_SIZE_OPTION = {
  id: "asesor",
  number: "asesor",
  label: "Necesito ayuda de un asesor",
  fullLabel: "Necesito ayuda de un asesor (Medición en Boutique)",
  isAsesor: true,
};

const STORAGE_KEY_INVENTORY = "platino_inventory_stock_v1";

/**
 * Genera stock inicial predeterminado para un producto
 */
export function generateDefaultProductStock(_productId, _hasDoubleSizes = false) {
  const stock = {
    dama: {},
    varon: {},
  };

  // Stock para Dama (05 al 27)
  DAMA_SIZES.forEach((sz) => {
    const n = sz.numericVal;
    let b = 1;
    let lc = 1;
    let m = 0;

    // Tallas más solicitadas para dama (11 al 17)
    if (n >= 11 && n <= 17) {
      b = (n % 3) + 2; // 2 a 4
      lc = (n % 2) + 1; // 1 a 2
      m = ((n + 1) % 2) + 1; // 1 a 2
    } else if (n >= 8 && n <= 20) {
      b = 1;
      lc = n % 2 === 0 ? 1 : 0;
      m = n % 2 === 1 ? 1 : 0;
    } else {
      // Tallas extremas
      b = n % 3 === 0 ? 1 : 0;
      lc = 0;
      m = 0;
    }

    stock.dama[sz.number] = {
      bodega: b,
      "lima-centro": lc,
      miraflores: m,
    };
  });

  // Stock para Varón (10 al 37)
  VARON_SIZES.forEach((sz) => {
    const n = sz.numericVal;
    let b = 1;
    let lc = 1;
    let m = 0;

    // Tallas más solicitadas para varón (18 al 26)
    if (n >= 18 && n <= 26) {
      b = (n % 3) + 2;
      lc = (n % 2) + 1;
      m = ((n + 1) % 2) + 1;
    } else if (n >= 14 && n <= 30) {
      b = 1;
      lc = n % 2 === 0 ? 1 : 0;
      m = n % 2 === 1 ? 1 : 0;
    } else {
      b = n % 4 === 0 ? 1 : 0;
      lc = 0;
      m = 0;
    }

    stock.varon[sz.number] = {
      bodega: b,
      "lima-centro": lc,
      miraflores: m,
    };
  });

  return stock;
}

/**
 * Obtener todos los inventarios almacenados
 */
export function getAllStoredInventory() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_INVENTORY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error("Error reading inventory from localStorage", err);
  }
  return {};
}

/**
 * Guardar inventario completo
 */
export function saveAllInventory(inventoryMap) {
  try {
    localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(inventoryMap));
    window.dispatchEvent(
      new CustomEvent("platino_inventory_updated", { detail: { inventory: inventoryMap } })
    );
  } catch (err) {
    console.error("Error saving inventory to localStorage", err);
  }
}

/**
 * Obtiene el inventario de un producto específico (generando uno si no existe)
 */
export function getProductStock(productId, hasDoubleSizes = false) {
  if (!productId) return generateDefaultProductStock("temp", hasDoubleSizes);
  const all = getAllStoredInventory();
  if (!all[productId] || !all[productId].dama || !all[productId].varon) {
    const initial = generateDefaultProductStock(productId, hasDoubleSizes);
    all[productId] = initial;
    saveAllInventory(all);
    return initial;
  }
  return all[productId];
}

/**
 * Actualiza el inventario completo de un producto
 */
export function updateProductStock(productId, newStockData) {
  if (!productId) return;
  const all = getAllStoredInventory();
  all[productId] = newStockData;
  saveAllInventory(all);
  return newStockData;
}

/**
 * Actualiza el stock de una talla y almacén específico
 */
export function updateSingleStockItem(productId, gender, sizeNum, locationId, newQty) {
  const all = getAllStoredInventory();
  if (!all[productId]) {
    all[productId] = generateDefaultProductStock(productId, true);
  }

  const prodStock = all[productId];
  if (!prodStock[gender]) prodStock[gender] = {};
  if (!prodStock[gender][sizeNum]) {
    prodStock[gender][sizeNum] = { bodega: 0, "lima-centro": 0, miraflores: 0 };
  }

  const safeQty = Math.max(0, parseInt(newQty, 10) || 0);
  prodStock[gender][sizeNum][locationId] = safeQty;

  all[productId] = prodStock;
  saveAllInventory(all);
  return prodStock;
}

/**
 * Resumen de disponibilidad de una talla para un producto
 */
export function getSizeAvailability(productStock, gender, sizeNum) {
  if (sizeNum === "asesor") {
    return {
      total: 999,
      bodega: 999,
      limaCentro: 999,
      miraflores: 999,
      available: true,
      text: "Disponible para asesoría",
    };
  }

  const genderStock = productStock?.[gender] || {};
  const item = genderStock[sizeNum] || { bodega: 0, "lima-centro": 0, miraflores: 0 };

  const bodega = item.bodega || 0;
  const limaCentro = item["lima-centro"] || 0;
  const miraflores = item.miraflores || 0;
  const total = bodega + limaCentro + miraflores;

  let text = "Sin stock (A pedido)";
  let badgeType = "out";

  if (total > 3) {
    text = `${total} unidades disponibles`;
    badgeType = "available";
  } else if (total > 0) {
    text = `¡Últimas ${total} unidades!`;
    badgeType = "low";
  }

  return {
    total,
    bodega,
    limaCentro,
    miraflores,
    available: total > 0,
    text,
    badgeType,
  };
}

/**
 * Calcula estadísticas globales del producto
 */
export function getProductTotalStockStats(productStock) {
  let totalBodega = 0;
  let totalLimaCentro = 0;
  let totalMiraflores = 0;
  let outOfStockCount = 0;
  let inStockCount = 0;

  ["dama", "varon"].forEach((gender) => {
    const list = gender === "dama" ? DAMA_SIZES : VARON_SIZES;
    const gStock = productStock?.[gender] || {};

    list.forEach((sz) => {
      const item = gStock[sz.number] || { bodega: 0, "lima-centro": 0, miraflores: 0 };
      const b = item.bodega || 0;
      const lc = item["lima-centro"] || 0;
      const m = item.miraflores || 0;
      const tot = b + lc + m;

      totalBodega += b;
      totalLimaCentro += lc;
      totalMiraflores += m;

      if (tot > 0) {
        inStockCount++;
      } else {
        outOfStockCount++;
      }
    });
  });

  const grandTotal = totalBodega + totalLimaCentro + totalMiraflores;

  return {
    grandTotal,
    totalBodega,
    totalLimaCentro,
    totalMiraflores,
    inStockCount,
    outOfStockCount,
  };
}
