// src/services/shippingService.js
import { getRemoteData, setRemoteData } from "./remoteData";
import { PERU_DEPARTMENTS_AND_PROVINCES } from "../data/peruLocations";

export const DEFAULT_SHIPPING_CONFIG = {
  limaCallaoJewelry: 0, // Gratis
  limaCallaoGems: 15,   // S/. 15
  provincesJewelry: 20, // S/. 20
  provincesGems: 25,    // S/. 25
  customDepartmentRates: {},
  notes: "Tarifas oficiales para envíos a domicilio en Lima Metropolitana, Callao y Provincias."
};

/**
 * Obtiene la configuración de tarifas de envío
 */
export function getShippingConfig() {
  const parsed = getRemoteData("shipping_config", DEFAULT_SHIPPING_CONFIG);
  if (parsed && typeof parsed === "object") {
    return {
      ...DEFAULT_SHIPPING_CONFIG,
      ...parsed,
      customDepartmentRates: parsed.customDepartmentRates || {}
    };
  }
  return DEFAULT_SHIPPING_CONFIG;
}

/**
 * Guarda la configuración de tarifas de envío y emite evento reactivo
 */
export function saveShippingConfig(newConfig) {
  const payload = {
    ...DEFAULT_SHIPPING_CONFIG,
    ...newConfig,
    updatedAt: new Date().toISOString()
  };
  setRemoteData("shipping_config", payload, "platino_shipping_updated");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("platino_shipping_updated", { detail: payload }));
  }
  return payload;
}

/**
 * Calcula el costo de envío exacto según la modalidad, departamento y tipo de producto.
 */
export function calculateShippingCost({ isGemOnly = false, deliveryType = "recojo_sede", department = "Lima" }) {
  if (deliveryType === "recojo_sede") {
    return 0;
  }

  const config = getShippingConfig();
  const isLimaOrCallao = department === "Lima" || department === "Callao";

  // Verificar si hay una tarifa personalizada para este departamento
  if (config.customDepartmentRates && config.customDepartmentRates[department]) {
    const custom = config.customDepartmentRates[department];
    if (isGemOnly && custom.gems !== undefined) return Number(custom.gems);
    if (!isGemOnly && custom.jewelry !== undefined) return Number(custom.jewelry);
  }

  if (isGemOnly) {
    return isLimaOrCallao ? Number(config.limaCallaoGems ?? 15) : Number(config.provincesGems ?? 25);
  }

  return isLimaOrCallao ? Number(config.limaCallaoJewelry ?? 0) : Number(config.provincesJewelry ?? 20);
}
