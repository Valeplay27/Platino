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

export const STORAGE_KEY_INVENTORY = "platino_inventory_stock_v1";

/**
 * Normaliza la clave de talla según el género ('05' para dama < 10, '10'..'37' para varón)
 */
export function normalizeSizeKey(gender, sizeNum) {
  if (!sizeNum || sizeNum === "asesor") return sizeNum;
  const num = parseInt(sizeNum, 10);
  if (isNaN(num)) return String(sizeNum);
  if (gender === "dama" && num < 10) {
    return `0${num}`;
  }
  return String(num);
}

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
 * Obtener todos los inventarios almacenados, con auto-migración y curación de tallas
 */
export function getAllStoredInventory() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_INVENTORY);
    if (stored) {
      const parsed = JSON.parse(stored);
      let needsSave = false;

      // Asegurar que exista _master_
      if (!parsed["_master_"] || !parsed["_master_"].dama) {
        parsed["_master_"] = generateDefaultProductStock("_master_", true);
        needsSave = true;
      }

      // Si alguna joya tiene existencias personalizadas mayores (ej. Talla 05 con 4 unidades en collar-cristal o anillo),
      // asegurarnos de sincronizarla a _master_
      Object.keys(parsed).forEach((k) => {
        if (k !== "_master_" && parsed[k]?.dama) {
          Object.keys(parsed[k].dama).forEach((sz) => {
            const item = parsed[k].dama[sz];
            const tot = (Number(item?.bodega) || 0) + (Number(item?.["lima-centro"]) || 0) + (Number(item?.miraflores) || 0);
            if (tot > 0) {
              const norm = normalizeSizeKey("dama", sz);
              const mItem = parsed["_master_"].dama[norm];
              const mTot = (Number(mItem?.bodega) || 0) + (Number(mItem?.["lima-centro"]) || 0) + (Number(mItem?.miraflores) || 0);
              if (tot > mTot) {
                parsed["_master_"].dama[norm] = { ...item };
                needsSave = true;
              }
            }
          });
        }
      });

      // Propagar cualquier talla configurada en _master_ a todas las joyas del catálogo
      if (parsed["_master_"]) {
        Object.keys(parsed).forEach((k) => {
          if (k !== "_master_" && parsed[k]?.dama) {
            Object.keys(parsed["_master_"].dama).forEach((sz) => {
              const mItem = parsed["_master_"].dama[sz];
              const mTot = (Number(mItem?.bodega) || 0) + (Number(mItem?.["lima-centro"]) || 0) + (Number(mItem?.miraflores) || 0);
              if (mTot > 0) {
                const curItem = parsed[k].dama[sz];
                const curTot = (Number(curItem?.bodega) || 0) + (Number(curItem?.["lima-centro"]) || 0) + (Number(curItem?.miraflores) || 0);
                if (curTot === 0) {
                  parsed[k].dama[sz] = { ...mItem };
                  needsSave = true;
                }
              }
            });
          }
        });
      }

      if (needsSave) {
        localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(parsed));
      }

      return parsed;
    }
  } catch (err) {
    console.error("Error reading inventory from localStorage", err);
  }
  return {};
}

/**
 * Guardar inventario completo y notificar tanto localmente como a otras pestañas
 */
export function saveAllInventory(inventoryMap) {
  try {
    localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(inventoryMap));
    // Ping con timestamp para forzar evento storage en todas las pestañas
    localStorage.setItem("platino_inventory_sync_ping", String(Date.now()));
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
  const all = getAllStoredInventory();
  const master = all["_master_"];

  if (!productId) return master || generateDefaultProductStock("temp", hasDoubleSizes);

  if (!all[productId] || !all[productId].dama || !all[productId].varon) {
    const initial = master ? JSON.parse(JSON.stringify(master)) : generateDefaultProductStock(productId, hasDoubleSizes);
    all[productId] = initial;
    saveAllInventory(all);
    return initial;
  }

  // Si existe _master_, sincronizar cualquier talla con stock que esté en _master_
  if (master) {
    ["dama", "varon"].forEach((g) => {
      if (master[g]) {
        Object.keys(master[g]).forEach((sNum) => {
          const mItem = master[g][sNum];
          const mTot = (Number(mItem?.bodega) || 0) + (Number(mItem?.["lima-centro"]) || 0) + (Number(mItem?.miraflores) || 0);
          if (mTot > 0) {
            const curItem = all[productId][g]?.[sNum];
            const curTot = (Number(curItem?.bodega) || 0) + (Number(curItem?.["lima-centro"]) || 0) + (Number(curItem?.miraflores) || 0);
            if (curTot === 0) {
              if (!all[productId][g]) all[productId][g] = {};
              all[productId][g][sNum] = { ...mItem };
            }
          }
        });
      }
    });
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
  all["_master_"] = JSON.parse(JSON.stringify(newStockData));
  saveAllInventory(all);
  return newStockData;
}

/**
 * Actualiza el stock de una talla y almacén específico en tiempo real
 * Se sincroniza tanto a la joya activa como globalmente para garantizar coherencia en toda la tienda
 */
export function updateSingleStockItem(productId, gender, sizeNum, locationId, newQty) {
  const all = getAllStoredInventory();
  const normKey = normalizeSizeKey(gender, sizeNum);
  const safeQty = Math.max(0, parseInt(newQty, 10) || 0);

  if (!all["_master_"]) {
    all["_master_"] = generateDefaultProductStock("_master_", true);
  }
  if (!all["_master_"][gender]) all["_master_"][gender] = {};
  if (!all["_master_"][gender][normKey]) {
    all["_master_"][gender][normKey] = { bodega: 0, "lima-centro": 0, miraflores: 0 };
  }
  all["_master_"][gender][normKey][locationId] = safeQty;

  // Actualizar en todas las joyas del catálogo para que nunca haya discrepancia de stock entre modelos
  Object.keys(all).forEach((pKey) => {
    if (all[pKey] && all[pKey][gender]) {
      if (!all[pKey][gender][normKey]) {
        all[pKey][gender][normKey] = { bodega: 0, "lima-centro": 0, miraflores: 0 };
      }
      all[pKey][gender][normKey][locationId] = safeQty;
    }
  });

  if (productId && (!all[productId] || !all[productId][gender])) {
    all[productId] = JSON.parse(JSON.stringify(all["_master_"]));
  }
  if (productId) {
    all[productId][gender][normKey][locationId] = safeQty;
  }

  saveAllInventory(all);
  return productId && all[productId] ? all[productId] : all["_master_"];
}

/**
 * Actualiza múltiples almacenes para una talla en un solo paso atómico
 */
export function updateMultipleStockItems(productId, gender, sizeNum, locationDeltaOrQtyMap, isDelta = false) {
  const all = getAllStoredInventory();
  const normKey = normalizeSizeKey(gender, sizeNum);

  if (!all["_master_"]) {
    all["_master_"] = generateDefaultProductStock("_master_", true);
  }
  if (!all["_master_"][gender]) all["_master_"][gender] = {};
  if (!all["_master_"][gender][normKey]) {
    all["_master_"][gender][normKey] = { bodega: 0, "lima-centro": 0, miraflores: 0 };
  }

  const masterItem = all["_master_"][gender][normKey];
  Object.entries(locationDeltaOrQtyMap).forEach(([locId, val]) => {
    if (isDelta) {
      const cur = Number(masterItem[locId]) || 0;
      masterItem[locId] = Math.max(0, cur + (Number(val) || 0));
    } else {
      masterItem[locId] = Math.max(0, parseInt(val, 10) || 0);
    }
  });

  // Actualizar en todas las joyas para sincronización global completa
  Object.keys(all).forEach((pKey) => {
    if (all[pKey] && all[pKey][gender]) {
      if (!all[pKey][gender][normKey]) {
        all[pKey][gender][normKey] = { bodega: 0, "lima-centro": 0, miraflores: 0 };
      }
      Object.entries(locationDeltaOrQtyMap).forEach(([locId, val]) => {
        if (isDelta) {
          const cur = Number(all[pKey][gender][normKey][locId]) || 0;
          all[pKey][gender][normKey][locId] = Math.max(0, cur + (Number(val) || 0));
        } else {
          all[pKey][gender][normKey][locId] = Math.max(0, parseInt(val, 10) || 0);
        }
      });
    }
  });

  saveAllInventory(all);
  return productId && all[productId] ? all[productId] : all["_master_"];
}

/**
 * Copia el stock de un producto a múltiples productos seleccionados
 */
export function copyProductStockToTargets(sourceProductId, targetProductIds = []) {
  if (!sourceProductId || targetProductIds.length === 0) return;
  const all = getAllStoredInventory();
  const sourceStock = all[sourceProductId] || generateDefaultProductStock(sourceProductId, true);

  targetProductIds.forEach((id) => {
    if (id !== sourceProductId) {
      all[id] = JSON.parse(JSON.stringify(sourceStock));
    }
  });

  saveAllInventory(all);
  return all;
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
  const normKey = normalizeSizeKey(gender, sizeNum);
  const rawKey = String(sizeNum);
  const intKey = String(parseInt(sizeNum, 10) || "");

  const item =
    genderStock[normKey] ||
    genderStock[rawKey] ||
    (intKey ? genderStock[intKey] : null) ||
    { bodega: 0, "lima-centro": 0, miraflores: 0 };

  const bodega = Number(item.bodega) || 0;
  const limaCentro = Number(item["lima-centro"]) || 0;
  const miraflores = Number(item.miraflores) || 0;
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
