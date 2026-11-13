import { getRemoteData, setRemoteData } from "./remoteData";

export const DEFAULT_FAQS = [
  {
    id: "faq-entallado",
    q: "¿Se puede cambiar el tamaño de este anillo de compromiso?",
    a: "Sí, la gran mayoría de nuestros anillos cuentan con servicio de entallado. En Platino Perú ofrecemos un primer entallado de cortesía para asegurar el ajuste perfecto en tu dedo o el de tu pareja (sujeto a la arquitectura del modelo)."
  },
  {
    id: "faq-piedra-central",
    q: "¿Cómo mejora este ajuste solitario inspirado en la naturaleza la piedra central?",
    a: "El diseño eleva sutilmente la gema central para permitir una mayor entrada y refracción de luz desde todos los ángulos, magnificando el fuego, brillo y destello característico de las piezas de alta joyería."
  },
  {
    id: "faq-formas-gemas",
    q: "¿En qué formas y tipos de piedra central se puede colocar este anillo?",
    a: "Nuestros artesanos pueden adaptar la montura a gemas en corte Redondo, Princesa, Esmeralda, Pera, Marquesa, Cojín u Oval, ya sea en diamantes naturales certificados, diamantes cultivados o gemas preciosas como esmeraldas y zafiros."
  },
  {
    id: "faq-alianzas-boda",
    q: "¿Qué alianzas de boda combinan bien con este anillo de solitario?",
    a: "Diseñamos nuestras sortijas para que coincidan al ras con bandas lisas tradicionales, aros con textura o alianzas con pavé de diamantes, creando un conjunto nupcial armonioso y ergonómico."
  },
  {
    id: "faq-durabilidad",
    q: "¿Este anillo de compromiso es lo suficientemente duradero para el uso diario?",
    a: "Absolutamente. Forjamos nuestras joyas en Oro de 18 Quilates y Platino 950, aleaciones nobles con la densidad y tenacidad ideales para acompañarte toda la vida sin perder su estructura ni brillo."
  }
];

const FAQS_STORAGE_KEY = "platino_faqs";

/**
 * Normaliza un objeto FAQ asegurando id, q y a
 */
const normalizeFaq = (faq, index) => {
  if (!faq || typeof faq !== "object") {
    return {
      id: `faq-${index + 1}`,
      q: "Pregunta sin título",
      a: "",
    };
  }
  return {
    id: faq.id || `faq-${index + 1}-${Date.now()}`,
    q: (faq.q || faq.question || "").trim(),
    a: (faq.a || faq.answer || "").trim(),
  };
};

/**
 * Obtiene las FAQs para un producto específico o las globales de la tienda
 */
export const getStoredFaqs = (product = null) => {
  if (product && Array.isArray(product.faqs) && product.faqs.length > 0) {
    return product.faqs.map(normalizeFaq);
  }

  // Si el producto tiene configurado que NO permite entallado
  if (product && product.allowsEntallado === false) {
    const globals = getGlobalFaqs();
    return globals.map((item) => {
      if (item.id === "faq-entallado" || item.q.toLowerCase().includes("cambiar el tamaño") || item.q.toLowerCase().includes("entallado")) {
        return {
          ...item,
          a: product.entalladoCustomMessage || "Por la estructura de engaste continuo o diseño de este modelo específico, no es posible realizar entallado posterior. Te recomendamos verificar tu talla exacta con nuestra guía o con un asesor antes de ordenar.",
        };
      }
      return item;
    });
  }

  return getGlobalFaqs();
};

/**
 * Retorna las FAQs globales guardadas en el sistema
 */
export const getGlobalFaqs = () => {
  const remote = getRemoteData(FAQS_STORAGE_KEY, DEFAULT_FAQS);
  if (!Array.isArray(remote)) {
    return DEFAULT_FAQS.map(normalizeFaq);
  }
  return remote.map(normalizeFaq);
};

/**
 * Guarda la lista de FAQs globales y notifica a la aplicación
 */
export const saveGlobalFaqs = (faqsList) => {
  if (!Array.isArray(faqsList)) return false;
  const normalized = faqsList.map(normalizeFaq);
  setRemoteData(FAQS_STORAGE_KEY, normalized);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("platino_faqs_updated", { detail: normalized }));
  }
  return true;
};

/**
 * Agrega una nueva pregunta frecuente
 */
export const addFaq = ({ q, a }) => {
  const current = getGlobalFaqs();
  const newFaq = {
    id: `faq-${Date.now()}`,
    q: (q || "").trim(),
    a: (a || "").trim(),
  };
  const updated = [...current, newFaq];
  saveGlobalFaqs(updated);
  return newFaq;
};

/**
 * Actualiza una pregunta frecuente existente
 */
export const updateFaq = (id, fields) => {
  const current = getGlobalFaqs();
  const idx = current.findIndex((f) => f.id === id);
  if (idx === -1) return null;

  const updatedItem = {
    ...current[idx],
    ...fields,
    q: fields.q !== undefined ? fields.q.trim() : current[idx].q,
    a: fields.a !== undefined ? fields.a.trim() : current[idx].a,
  };
  const updatedList = [...current];
  updatedList[idx] = updatedItem;
  saveGlobalFaqs(updatedList);
  return updatedItem;
};

/**
 * Elimina una pregunta frecuente
 */
export const deleteFaq = (id) => {
  const current = getGlobalFaqs();
  const filtered = current.filter((f) => f.id !== id);
  saveGlobalFaqs(filtered);
  return true;
};

/**
 * Reordena la lista de preguntas
 */
export const moveFaq = (index, direction) => {
  const current = [...getGlobalFaqs()];
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= current.length) return false;

  const temp = current[index];
  current[index] = current[target];
  current[target] = temp;
  saveGlobalFaqs(current);
  return true;
};

/**
 * Restablece las FAQs predeterminadas
 */
export const resetFaqsToDefault = () => {
  saveGlobalFaqs(DEFAULT_FAQS);
  return DEFAULT_FAQS;
};
