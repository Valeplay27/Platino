const STORAGE_KEY_NOSOTROS = "platino_nosotros_content_v1";

export const DEFAULT_NOSOTROS_CONTENT = {
  hero: {
    eyebrow: "SOBRE PLATINO PERÚ",
    title: "El Arte de Forjar Historias Inolvidables",
    subtitle:
      "Más de dos décadas perfeccionando la alta orfebrería en el Perú. Creamos piezas maestras en Oro de 18 Quilates y Plata Ley 950 con diamantes y gemas certificadas para conmemorar los momentos más trascendentes de tu vida.",
    bannerGradient: "linear-gradient(135deg, #0e2920 0%, #15392d 100%)",
  },
  historia: {
    tag: "LEGADO & MAESTRÍA",
    title: "Nuestra Historia",
    yearFounded: "1998",
    paragraph1:
      "En Platino Perú, cada anillo de compromiso y aro de matrimonio nace de una profunda reverencia por la tradición orfebre peruana y los más exigentes estándares de la gemología mundial.",
    paragraph2:
      "Nuestros maestros joyeros forjan a mano cada montura asegurando confort ergonómico, brillo imperecedero y proporciones áureas que destacan la belleza inigualable de cada piedra central.",
    paragraph3:
      "Desde nuestro taller fundado en Lima, combinamos la técnica ancestral de fundición a la cera perdida con modelado digital 3D de alta precisión, garantizando que cada joya entregada sea un legado eterno para las familias peruanas.",
    image: "/images/platino-logo-gold.jpg",
    imageCaption: "Platino Perú - Taller y Showroom de Alta Joyería",
  },
  misionVision: {
    misionTitle: "Nuestra Misión",
    misionText:
      "Acompañar las promesas más memorables de amor y celebración con joyas de calidad insuperable, manufactura ética y transparencia total en la certificación de metales y gemas.",
    visionTitle: "Nuestra Visión",
    visionText:
      "Consolidarnos como la casa joyera de referencia en el Perú y Sudamérica para parejas que buscan autenticidad, artesanía de lujo y atención personalizada de clase mundial.",
  },
  pilares: {
    pilar1Title: "Metales Nobles Certificados",
    pilar1Desc:
      "Trabajamos exclusivamente con Oro de 18 Quilates (amarillo, blanco y rosa) y Plata Ley 950 de alta pureza hipoalergénica con sellos de contraste oficiales.",
    pilar1Icon: "bi-shield-check",
    pilar2Title: "Gemología Rigurosa",
    pilar2Desc:
      "Selección minuciosa de diamantes, moissanitas y circonitas de corte de alta refracción, con proporciones de talla ideal para el máximo brillo de fuego.",
    pilar2Icon: "bi-gem",
    pilar3Title: "Garantía de Por Vida",
    pilar3Desc:
      "Cada joya incluye certificado de autenticidad, mantenimiento preventivo anual y servicio exclusivo de pulido y abrillantado por nuestros orfebres.",
    pilar3Icon: "bi-award",
  },
  talleresBoutiques: {
    title: "¿Deseas atención personalizada en nuestras boutiques?",
    desc: "Visítanos en nuestras sedes de Lima Centro y Miraflores o agenda una cita exclusiva con uno de nuestros asesores especialistas.",
    sedeLima: "Lima Centro: Jr. Huallaga 160, Stand 108",
    sedeMiraflores: "Miraflores: Av. José Larco 345, Oficina 402",
    whatsapp: "+51 927 357 217",
    telefono: "011 654 435",
    horario: "Lunes a Sábado: 10:00 am - 7:30 pm",
  },
};

export const getNosotrosContent = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOSOTROS);
    if (!raw) return DEFAULT_NOSOTROS_CONTENT;
    const parsed = JSON.parse(raw);
    return {
      hero: { ...DEFAULT_NOSOTROS_CONTENT.hero, ...(parsed.hero || {}) },
      historia: { ...DEFAULT_NOSOTROS_CONTENT.historia, ...(parsed.historia || {}) },
      misionVision: { ...DEFAULT_NOSOTROS_CONTENT.misionVision, ...(parsed.misionVision || {}) },
      pilares: { ...DEFAULT_NOSOTROS_CONTENT.pilares, ...(parsed.pilares || {}) },
      talleresBoutiques: { ...DEFAULT_NOSOTROS_CONTENT.talleresBoutiques, ...(parsed.talleresBoutiques || {}) },
    };
  } catch (error) {
    console.error("Error reading nosotros content from localStorage:", error);
    return DEFAULT_NOSOTROS_CONTENT;
  }
};

export const saveNosotrosContent = (updatedContent) => {
  try {
    localStorage.setItem(STORAGE_KEY_NOSOTROS, JSON.stringify(updatedContent));
    window.dispatchEvent(new CustomEvent("platino_nosotros_updated", { detail: updatedContent }));
    return true;
  } catch (error) {
    console.error("Error saving nosotros content to localStorage:", error);
    return false;
  }
};

export const resetNosotrosContent = () => {
  try {
    localStorage.removeItem(STORAGE_KEY_NOSOTROS);
    window.dispatchEvent(new CustomEvent("platino_nosotros_updated", { detail: DEFAULT_NOSOTROS_CONTENT }));
    return DEFAULT_NOSOTROS_CONTENT;
  } catch (error) {
    console.error("Error resetting nosotros content:", error);
    return DEFAULT_NOSOTROS_CONTENT;
  }
};
