// Servicio de Configuración y Gestión de Platino Care (Platino Perú)
// Permite al Administrador / Vladimir editar beneficios, precios y coberturas

const STORAGE_KEY = "platino_care_config_v2";

export const DEFAULT_PLATINO_CARE_CONFIG = {
  isActive: true,
  name: "PLATINO CARE",
  tagline: "PROGRAMA OFICIAL DE CUIDADO Y GARANTÍA DE POR VIDA",
  badgeText: "RESPALDO OFICIAL PLATINO PERÚ",

  // Plan Plus (Con costo adicional)
  plus: {
    title: "AÑADIR PLATINO CARE +",
    subtitle: "PAGO ÚNICO",
    price: 90,
    priceFormatted: "S/. 90",
    description:
      "Máxima cobertura premium: incluye reposición gratuita de micro-gemas (hasta 0.10 ct), pulidos ultrasónicos ilimitados al año y baño de rodio de mantenimiento.",
    badge: "RECOMENDADO",
    features: [
      "Reposición de micro-gemas caídas por uso normal (hasta 0.10 ct)",
      "Pulido ultrasónico y abrillantado ilimitado en taller",
      "1 Baño de Rodio o re-acabado de oro blanco al año",
      "Ajuste prioritario de garras y engaste express en 24h",
      "Mantenimiento vitalicio de ley Oro 18K y Plata 950",
    ],
  },

  // Plan Cortesía (Incluido con la joya)
  cortesia: {
    title: "AÑADIR PLATINO CARE",
    subtitle: "CORTESÍA CON TU COMPRA S/. 0",
    price: 0,
    priceFormatted: "S/. 0",
    description:
      "Garantía oficial vitalicia que certifica la autenticidad y pureza de los metales preciosos con 1 entallado de cortesía.",
    features: [
      "Garantía de por vida de la ley del Oro 18K y Plata 950",
      "Entallado gratuito de hasta 2 tallas (1 sola vez dentro de los 90 días)",
      "Limpieza por ultrasonido y ajuste de garras periódico",
      "Certificado físico gemológico y respaldo en taller",
    ],
  },

  // Coberturas / Acordeones del Producto
  benefits: [
    {
      id: 1,
      title: "Garantía de por vida del material",
      content:
        "Certificamos la ley y pureza del Oro 18K y Plata 950 de por vida ante cualquier auditoría gemológica.",
      icon: "bi-shield-fill-check",
    },
    {
      id: 2,
      title: "Mantenimiento y pulido profesional",
      content:
        "Incluye pulido ultrasónico profesional y ajuste periódico de garras para un brillo eterno en todas nuestras sedes.",
      icon: "bi-gem",
    },
    {
      id: 3,
      title: "Entallado gratuito (1 sola vez)*",
      content:
        "Si la medida no es exacta al recibir tu joya, realizamos el ajuste de hasta 2 tallas sin costo alguno.",
      icon: "bi-arrows-angle-expand",
    },
    {
      id: 4,
      title: "Respaldo y trazabilidad en taller",
      content:
        "Registro serializado de tu joya en nuestro libro de orfebrería con historial de intervenciones y mantenimiento preventivo.",
      icon: "bi-journal-check",
    },
  ],

  termsNote:
    "* El entallado gratuito de cortesía aplica para sortijas y anillos dentro de los primeros 90 días naturales posteriores a la entrega.",
  lastUpdated: new Date().toISOString(),
};

/**
 * Obtener configuración actual de Platino Care
 */
export function getPlatinoCareConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PLATINO_CARE_CONFIG));
      return { ...DEFAULT_PLATINO_CARE_CONFIG };
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PLATINO_CARE_CONFIG,
      ...parsed,
      plus: { ...DEFAULT_PLATINO_CARE_CONFIG.plus, ...(parsed.plus || {}) },
      cortesia: { ...DEFAULT_PLATINO_CARE_CONFIG.cortesia, ...(parsed.cortesia || {}) },
    };
  } catch (err) {
    console.error("Error leyendo platino_care_config:", err);
    return { ...DEFAULT_PLATINO_CARE_CONFIG };
  }
}

/**
 * Guardar nueva configuración de Platino Care
 */
export function savePlatinoCareConfig(config) {
  try {
    const updated = {
      ...config,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Disparar evento para que otras pestañas o componentes se actualicen reactivamente
    window.dispatchEvent(new Event("platino_care_updated"));
    return updated;
  } catch (err) {
    console.error("Error guardando platino_care_config:", err);
    return config;
  }
}

/**
 * Restablecer a los valores predeterminados
 */
export function resetPlatinoCareConfig() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PLATINO_CARE_CONFIG));
  window.dispatchEvent(new Event("platino_care_updated"));
  return { ...DEFAULT_PLATINO_CARE_CONFIG };
}
