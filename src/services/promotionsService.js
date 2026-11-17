// src/services/promotionsService.js
import { getRemoteData, setRemoteData } from "./remoteData";

export const CATALOG_TARGETS = [
  { id: "all", label: "Toda la Tienda (Todos los Catálogos)", icon: "bi-shop", scope: "global" },
  { id: "envio", label: "Envío a Domicilio", icon: "bi-truck", scope: "shipping" },
  { id: "anillos-compromiso", label: "Catálogo: Anillos de Compromiso", icon: "bi-gem", scope: "category" },
  { id: "aros-boda", label: "Catálogo: Aros de Boda y Matrimonio", icon: "bi-circle", scope: "category" },
  { id: "alianzas", label: "Catálogo: Alianzas de Amor", icon: "bi-heart-fill", scope: "category" },
  { id: "anillos-promesa", label: "Catálogo: Anillos de Promesa", icon: "bi-stars", scope: "category" },
  { id: "joyeria", label: "Catálogo: Joyería Fina (Aretes, Collares, Pulseras)", icon: "bi-sparkles", scope: "category" },
  { id: "gemas", label: "Catálogo: Gemas y Diamantes Certificados", icon: "bi-diamond-half", scope: "category" },
  { id: "producto_especifico", label: "Producto Específico del Catálogo", icon: "bi-box-seam", scope: "product" },
];

export const DEFAULT_PROMOTIONS = [
  {
    id: "PROMO-ENVIOGRATIS",
    code: "ENVIOGRATIS",
    type: "envio",
    target: "envio",
    targetLabel: "Envío a Domicilio",
    discountType: "percentage",
    discountValue: 100,
    minPurchase: 0,
    active: true,
    description: "Envío a domicilio 100% gratuito a cualquier destino del Perú",
    usageCount: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "PROMO-PLATINO10",
    code: "PLATINO10",
    type: "producto",
    target: "all",
    targetLabel: "Toda la Tienda",
    discountType: "percentage",
    discountValue: 10,
    minPurchase: 500,
    active: true,
    description: "10% de descuento en cualquier joya o gema desde S/. 500",
    usageCount: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "PROMO-BIENVENIDA50",
    code: "BIENVENIDA50",
    type: "producto",
    target: "all",
    targetLabel: "Toda la Tienda",
    discountType: "fixed",
    discountValue: 50,
    minPurchase: 300,
    active: true,
    description: "S/. 50 de descuento de bienvenida en compras desde S/. 300",
    usageCount: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

export function getStoredPromotions() {
  const parsed = getRemoteData("promotions", DEFAULT_PROMOTIONS);
  return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PROMOTIONS;
}

export function saveStoredPromotions(promotions) {
  setRemoteData("promotions", promotions, "platino_promotions_updated");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("platino_promotions_updated", { detail: promotions }));
  }
  return true;
}

/**
 * Valida un código promocional ingresado por el usuario
 */
export function validatePromotionCode(code, { subtotal = 0, shippingCost = 0, deliveryType = "envio_domicilio", cartItems = [] }) {
  if (!code || typeof code !== "string" || !code.trim()) {
    return { valid: false, message: "Por favor ingresa un código promocional." };
  }

  const cleanCode = code.trim().toUpperCase();
  const promotions = getStoredPromotions();
  const promo = promotions.find((p) => (p.code || "").toUpperCase() === cleanCode);

  if (!promo) {
    return { valid: false, message: `El código «${cleanCode}» no es válido o ha expirado.` };
  }

  if (!promo.active) {
    return { valid: false, message: `El cupón «${cleanCode}» se encuentra actualmente inactivo.` };
  }

  if (promo.minPurchase && subtotal < promo.minPurchase) {
    return {
      valid: false,
      message: `El código «${cleanCode}» requiere una compra mínima de S/. ${promo.minPurchase.toLocaleString("es-PE")}.`,
    };
  }

  let discountAmount = 0;
  const target = promo.target || (promo.type === "envio" ? "envio" : "all");

  if (promo.type === "envio" || target === "envio") {
    if (deliveryType === "recojo_sede") {
      return {
        valid: false,
        message: "Este código aplica exclusivamente para envíos a domicilio (tu modalidad actual es retiro en sede).",
      };
    }
    if (shippingCost <= 0) {
      return {
        valid: false,
        message: "Tu envío actual ya es gratuito.",
      };
    }

    if (promo.discountType === "percentage") {
      discountAmount = Math.round((shippingCost * (Number(promo.discountValue) || 100)) / 100);
    } else {
      discountAmount = Math.min(shippingCost, Number(promo.discountValue) || 0);
    }

    return {
      valid: true,
      code: cleanCode,
      promotion: promo,
      type: "envio",
      discountAmount: Math.max(0, discountAmount),
      message: `¡Cupón aplicado! Descuento de S/. ${discountAmount.toLocaleString("es-PE")} en tu costo de envío.`,
    };
  }

  // Filtrar productos aplicables según catálogo objetivo
  let applicableTotal = subtotal;

  if (Array.isArray(cartItems) && cartItems.length > 0 && target !== "all") {
    let matchingItems = [];

    if (target === "producto_especifico" && promo.targetProductId) {
      matchingItems = cartItems.filter((i) => String(i.id) === String(promo.targetProductId));
    } else {
      matchingItems = cartItems.filter((i) => {
        const cat = (i.category || "").toLowerCase();
        const name = (i.name || "").toLowerCase();
        if (target === "gemas") return Boolean(i.isGemstone || cat === "gemas" || name.includes("moissanita") || name.includes("zafiro") || name.includes("gema"));
        if (target === "anillos-compromiso") return cat.includes("compromiso") || name.includes("compromiso") || name.includes("solitario");
        if (target === "aros-boda") return cat.includes("boda") || cat.includes("matrimonio") || name.includes("boda") || name.includes("matrimonio");
        if (target === "alianzas") return cat.includes("alianza") || name.includes("alianza");
        if (target === "anillos-promesa") return cat.includes("promesa") || name.includes("promesa");
        if (target === "joyeria") return cat.includes("joyeria") || cat.includes("accesorios") || cat.includes("collares") || cat.includes("pulseras") || name.includes("arete") || name.includes("collar") || name.includes("pulsera") || name.includes("dije");
        return cat.includes(target);
      });
    }

    if (matchingItems.length === 0) {
      return {
        valid: false,
        message: `El cupón «${cleanCode}» aplica exclusivamente a productos del catálogo «${promo.targetLabel || target}».`,
      };
    }

    applicableTotal = matchingItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  }

  if (promo.discountType === "percentage") {
    discountAmount = Math.round((applicableTotal * (Number(promo.discountValue) || 0)) / 100);
  } else {
    discountAmount = Math.min(applicableTotal, Number(promo.discountValue) || 0);
  }

  return {
    valid: true,
    code: cleanCode,
    promotion: promo,
    type: "producto",
    discountAmount: Math.max(0, discountAmount),
    message: `¡Cupón aplicado! Descuento de S/. ${discountAmount.toLocaleString("es-PE")} en ${promo.targetLabel || "tus productos"}.`,
  };
}

/**
 * Registra el uso de un código promocional
 */
export function recordPromotionUsage(code) {
  if (!code) return;
  const clean = code.trim().toUpperCase();
  const list = getStoredPromotions();
  const idx = list.findIndex((p) => (p.code || "").toUpperCase() === clean);
  if (idx !== -1) {
    list[idx] = {
      ...list[idx],
      usageCount: (list[idx].usageCount || 0) + 1,
      lastUsedAt: new Date().toISOString(),
    };
    saveStoredPromotions([...list]);
  }
}

export function addPromotion(promoData) {
  const current = getStoredPromotions();
  const code = (promoData.code || "").trim().toUpperCase();
  if (!code) throw new Error("El código de promoción no puede estar vacío");

  if (current.some((p) => (p.code || "").toUpperCase() === code)) {
    throw new Error(`Ya existe un código de promoción llamado «${code}»`);
  }

  const target = promoData.target || (promoData.type === "envio" ? "envio" : "all");
  const targetObj = CATALOG_TARGETS.find((t) => t.id === target);

  const newPromo = {
    id: `PROMO-${Date.now().toString(36).toUpperCase()}`,
    code,
    type: target === "envio" ? "envio" : "producto",
    target,
    targetLabel: promoData.targetLabel || targetObj?.label || (target === "all" ? "Toda la Tienda" : target),
    targetProductId: promoData.targetProductId || null,
    targetProductName: promoData.targetProductName || null,
    discountType: promoData.discountType === "percentage" ? "percentage" : "fixed",
    discountValue: Number(promoData.discountValue) || 0,
    minPurchase: Number(promoData.minPurchase) || 0,
    active: promoData.active !== false,
    description: (promoData.description || "").trim() || "Promoción especial Platino Perú",
    usageCount: 0,
    createdAt: new Date().toISOString(),
  };

  const updated = [newPromo, ...current];
  saveStoredPromotions(updated);
  return newPromo;
}

export function updatePromotion(id, fields) {
  const current = getStoredPromotions();
  const idx = current.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  current[idx] = {
    ...current[idx],
    ...fields,
    code: fields.code ? fields.code.trim().toUpperCase() : current[idx].code,
    discountValue: fields.discountValue !== undefined ? Number(fields.discountValue) : current[idx].discountValue,
    minPurchase: fields.minPurchase !== undefined ? Number(fields.minPurchase) : current[idx].minPurchase,
    updatedAt: new Date().toISOString(),
  };

  saveStoredPromotions([...current]);
  return current[idx];
}

export function deletePromotion(id) {
  const current = getStoredPromotions();
  const filtered = current.filter((p) => p.id !== id);
  saveStoredPromotions(filtered);
  return true;
}

export function togglePromotionActive(id) {
  const current = getStoredPromotions();
  const idx = current.findIndex((p) => p.id === id);
  if (idx === -1) return false;

  current[idx] = {
    ...current[idx],
    active: !current[idx].active,
    updatedAt: new Date().toISOString(),
  };

  saveStoredPromotions([...current]);
  return current[idx].active;
}
