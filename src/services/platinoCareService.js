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

// =========================================================================
// REGISTRO & VALIDACIÓN DE CLIENTES PLATINO CARE POR DNI
// =========================================================================

const CLIENTS_STORAGE_KEY = "platino_care_clients_v2";

export const INITIAL_PLATINO_CARE_CLIENTS = [
  {
    id: "CARE-2026-001",
    dni: "47829103",
    clientName: "Camila Mendoza",
    clientEmail: "cliente@platino.pe",
    clientPhone: "+51 912 345 678",
    planType: "plus",
    planTitle: "Platino Care + (Premium S/. 90)",
    orderId: "PLT-2026-8941",
    productName: "Anillo Solitario Secret Garden",
    productMetal: "Oro 18K Rosa",
    fechaRegistro: "2026-03-25",
    fechaValidacionGratuidad: null,
    fechaEntallado: "2026-04-02",
    entalladoStatus: "realizado",
    entalladoDetalle: "Ajuste de talla 11 a 12.5 (Sede Miraflores)",
    fechaLimpieza: "2026-04-05",
    fechaProximoMantenimiento: "2026-10-05",
    status: "aprobado", // 'pendiente_pago' | 'aprobado' | 'rechazado'
    paymentConfirmed: true,
    paymentConfirmedAt: "25/03/2026 11:30 AM",
    approvedBy: "Admin Central (Vladimir)",
    paymentMethod: "BCP",
    amountPaid: 90,
    canEnjoyBenefits: true,
    notes: "Pago de S/. 90 confirmado vía BCP. Cobertura total Platino Care + activada.",
  },
  {
    id: "CARE-2026-002",
    dni: "45192837",
    clientName: "Valeria Morales",
    clientEmail: "v.morales@gmail.com",
    clientPhone: "+51 984 281 116",
    planType: "plus",
    planTitle: "Platino Care + (Premium S/. 90)",
    orderId: "PLT-2026-9115",
    productName: "Pulsera Tennis Diamantes Platino",
    productMetal: "Platino 950",
    fechaRegistro: "2026-03-30",
    fechaValidacionGratuidad: null,
    fechaEntallado: null,
    entalladoStatus: "pendiente",
    entalladoDetalle: "",
    fechaLimpieza: null,
    fechaProximoMantenimiento: null,
    status: "pendiente_pago",
    paymentConfirmed: false,
    paymentConfirmedAt: null,
    approvedBy: null,
    paymentMethod: "IziPay",
    amountPaid: 90,
    canEnjoyBenefits: false,
    notes: "Plan Premium registrado. Pendiente de pago para habilitar beneficios de taller.",
  },
  {
    id: "CARE-2026-003",
    dni: "72910384",
    clientName: "Diego Alarcón",
    clientEmail: "d.alarcon@gmail.com",
    clientPhone: "+51 927 357 217",
    planType: "cortesia",
    planTitle: "Platino Care Cortesía (Gratuito S/. 0)",
    orderId: "PLT-2026-9240",
    productName: "Anillo Aura Zafiro Azul",
    productMetal: "Oro 18K Blanco",
    fechaRegistro: "2026-04-03",
    fechaValidacionGratuidad: "2026-04-03",
    fechaEntallado: "2026-04-10",
    entalladoStatus: "realizado",
    entalladoDetalle: "Ajuste de talla 13 a 14 (Sede Lima Centro)",
    fechaLimpieza: "2026-04-15",
    fechaProximoMantenimiento: "2026-10-15",
    status: "activo",
    paymentConfirmed: true,
    paymentConfirmedAt: null,
    approvedBy: "Sistema Oficial Platino",
    paymentMethod: "Gratuito (Cortesía)",
    amountPaid: 0,
    canEnjoyBenefits: true,
    notes: "Validación de gratuidad completada con DNI. Beneficio de 1 entallado realizado el 10/04/2026.",
  },
  {
    id: "CARE-2026-004",
    dni: "41893021",
    clientName: "Rodrigo Benavides",
    clientEmail: "r.benavides@empresa.pe",
    clientPhone: "+51 998 765 432",
    planType: "cortesia",
    planTitle: "Platino Care Cortesía (Gratuito S/. 0)",
    orderId: "PLT-2026-9023",
    productName: "Anillo Corona Imperial",
    productMetal: "Oro 18K Amarillo",
    fechaRegistro: "2026-04-01",
    fechaValidacionGratuidad: "2026-04-01",
    fechaEntallado: null,
    entalladoStatus: "pendiente",
    entalladoDetalle: "Entallado de cortesía disponible dentro de los 90 días.",
    fechaLimpieza: null,
    fechaProximoMantenimiento: "2026-10-01",
    status: "activo",
    paymentConfirmed: true,
    paymentConfirmedAt: null,
    approvedBy: "Sistema Oficial Platino",
    paymentMethod: "Gratuito (Cortesía)",
    amountPaid: 0,
    canEnjoyBenefits: true,
    notes: "Plan Gratuito validado el 01/04/2026. Beneficio de 1 entallado pendiente de uso.",
  },
];

/**
 * Obtener todos los clientes registrados en Platino Care
 */
export function getPlatinoCareClients() {
  try {
    const raw = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(INITIAL_PLATINO_CARE_CLIENTS));
      return [...INITIAL_PLATINO_CARE_CLIENTS];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(INITIAL_PLATINO_CARE_CLIENTS));
    return [...INITIAL_PLATINO_CARE_CLIENTS];
  } catch (err) {
    console.error("Error leyendo platino_care_clients:", err);
    return [...INITIAL_PLATINO_CARE_CLIENTS];
  }
}

/**
 * Guardar lista completa de clientes de Platino Care
 */
export function savePlatinoCareClients(clients) {
  try {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
    window.dispatchEvent(new Event("platino_care_clients_updated"));
    return clients;
  } catch (err) {
    console.error("Error guardando platino_care_clients:", err);
    return clients;
  }
}

/**
 * Buscar cliente por DNI (ignora espacios)
 */
export function getPlatinoCareClientByDni(dni) {
  if (!dni) return null;
  const cleanDni = String(dni).trim();
  const all = getPlatinoCareClients();
  return all.find((c) => String(c.dni).trim() === cleanDni) || null;
}

/**
 * Registrar o actualizar cliente en Platino Care por DNI
 */
export function registerPlatinoCareClient({
  dni,
  clientName = "Cliente Platino",
  clientEmail = "",
  clientPhone = "",
  planType = "cortesia", // 'cortesia' o 'plus'
  orderId = "",
  productName = "Joya Platino",
  productMetal = "Oro 18K",
  paymentMethod = "BCP",
  amountPaid = null,
  fechaValidacionGratuidad = null,
  fechaEntallado = null,
  entalladoStatus = "pendiente",
  entalladoDetalle = "",
  fechaLimpieza = null,
  fechaProximoMantenimiento = null,
  notes = "",
}) {
  const cleanDni = String(dni).trim();
  if (!cleanDni) return null;

  const now = new Date();
  const formattedDate = now.toISOString().split("T")[0];

  const isPlus = planType === "plus";
  const all = getPlatinoCareClients();
  const existingIdx = all.findIndex((c) => String(c.dni).trim() === cleanDni);

  const finalFechaGratuidad = !isPlus
    ? (fechaValidacionGratuidad || (existingIdx >= 0 && all[existingIdx].fechaValidacionGratuidad ? all[existingIdx].fechaValidacionGratuidad : formattedDate))
    : null;

  const newRecord = {
    id: existingIdx >= 0 ? all[existingIdx].id : `CARE-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    dni: cleanDni,
    clientName: clientName.trim() || "Cliente Platino",
    clientEmail: clientEmail.trim().toLowerCase(),
    clientPhone: clientPhone.trim(),
    planType: isPlus ? "plus" : "cortesia",
    planTitle: isPlus ? "Platino Care + (Premium S/. 90)" : "Platino Care Cortesía (Gratuito S/. 0)",
    orderId: orderId || (existingIdx >= 0 ? all[existingIdx].orderId : `PLT-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`),
    productName: productName || (existingIdx >= 0 ? all[existingIdx].productName : "Joya Platino"),
    productMetal: productMetal || (existingIdx >= 0 ? all[existingIdx].productMetal : "Oro 18K"),
    fechaRegistro: existingIdx >= 0 ? all[existingIdx].fechaRegistro : formattedDate,
    fechaValidacionGratuidad: finalFechaGratuidad,
    fechaEntallado: fechaEntallado !== undefined ? fechaEntallado : (existingIdx >= 0 ? all[existingIdx].fechaEntallado : null),
    entalladoStatus: entalladoStatus || (existingIdx >= 0 ? all[existingIdx].entalladoStatus : "pendiente"),
    entalladoDetalle: entalladoDetalle || (existingIdx >= 0 ? all[existingIdx].entalladoDetalle : ""),
    fechaLimpieza: fechaLimpieza !== undefined ? fechaLimpieza : (existingIdx >= 0 ? all[existingIdx].fechaLimpieza : null),
    fechaProximoMantenimiento: fechaProximoMantenimiento !== undefined ? fechaProximoMantenimiento : (existingIdx >= 0 ? all[existingIdx].fechaProximoMantenimiento : null),
    status: isPlus ? "pendiente_pago" : "activo",
    paymentConfirmed: !isPlus,
    paymentConfirmedAt: null,
    approvedBy: !isPlus ? "Sistema Oficial Platino" : null,
    paymentMethod: isPlus ? paymentMethod : "Gratuito (Cortesía)",
    amountPaid: isPlus ? (amountPaid ?? 90) : 0,
    canEnjoyBenefits: !isPlus, // Para premium es false hasta que el admin confirme el pago
    notes: notes || (isPlus
      ? "Plan Premium registrado. Pendiente de confirmación de pago para activar beneficios de taller."
      : `Plan Gratuito de Cortesía validado en sistema con fecha ${finalFechaGratuidad}.`),
  };

  let updatedList;
  if (existingIdx >= 0) {
    updatedList = [...all];
    updatedList[existingIdx] = {
      ...all[existingIdx],
      ...newRecord,
    };
  } else {
    updatedList = [newRecord, ...all];
  }

  savePlatinoCareClients(updatedList);
  return newRecord;
}

/**
 * Actualizar fechas de calendario y beneficios de un cliente Platino Care
 */
export function updatePlatinoCareClientDates(idOrDni, datesData = {}) {
  const all = getPlatinoCareClients();
  const index = all.findIndex((c) => c.id === idOrDni || String(c.dni).trim() === String(idOrDni).trim());
  if (index === -1) return null;

  const current = all[index];
  const updatedClient = {
    ...current,
    fechaValidacionGratuidad: datesData.fechaValidacionGratuidad !== undefined ? datesData.fechaValidacionGratuidad : current.fechaValidacionGratuidad,
    fechaEntallado: datesData.fechaEntallado !== undefined ? datesData.fechaEntallado : current.fechaEntallado,
    entalladoStatus: datesData.entalladoStatus !== undefined ? datesData.entalladoStatus : current.entalladoStatus,
    entalladoDetalle: datesData.entalladoDetalle !== undefined ? datesData.entalladoDetalle : current.entalladoDetalle,
    fechaLimpieza: datesData.fechaLimpieza !== undefined ? datesData.fechaLimpieza : current.fechaLimpieza,
    fechaProximoMantenimiento: datesData.fechaProximoMantenimiento !== undefined ? datesData.fechaProximoMantenimiento : current.fechaProximoMantenimiento,
    notes: datesData.notes !== undefined ? datesData.notes : current.notes,
  };

  const updatedList = [...all];
  updatedList[index] = updatedClient;
  savePlatinoCareClients(updatedList);
  return updatedClient;
}

/**
 * Aceptar / Confirmar Pago de Plan Premium por el Administrador
 */
export function approvePlatinoCareClientPayment(idOrDni, adminUser = "Administración Platino") {
  const all = getPlatinoCareClients();
  const index = all.findIndex((c) => c.id === idOrDni || String(c.dni).trim() === String(idOrDni).trim());
  if (index === -1) return null;

  const now = new Date();
  const formattedDateTime = `${now.toLocaleDateString("es-PE")} ${now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`;

  const updatedClient = {
    ...all[index],
    status: "aprobado",
    paymentConfirmed: true,
    paymentConfirmedAt: formattedDateTime,
    approvedBy: adminUser,
    canEnjoyBenefits: true,
    notes: `Pago de Plan Premium confirmado por ${adminUser} el ${formattedDateTime}. Beneficios Platino Care + activados.`,
  };

  const updatedList = [...all];
  updatedList[index] = updatedClient;
  savePlatinoCareClients(updatedList);
  return updatedClient;
}

/**
 * Rechazar o suspender pago de Plan Premium
 */
export function rejectPlatinoCareClientPayment(idOrDni, reason = "Pago no identificado en cuenta") {
  const all = getPlatinoCareClients();
  const index = all.findIndex((c) => c.id === idOrDni || String(c.dni).trim() === String(idOrDni).trim());
  if (index === -1) return null;

  const updatedClient = {
    ...all[index],
    status: "rechazado",
    paymentConfirmed: false,
    canEnjoyBenefits: false,
    notes: `Pago rechazado por administración: ${reason}`,
  };

  const updatedList = [...all];
  updatedList[index] = updatedClient;
  savePlatinoCareClients(updatedList);
  return updatedClient;
}

/**
 * Eliminar registro de cliente Platino Care
 */
export function deletePlatinoCareClient(idOrDni) {
  const all = getPlatinoCareClients();
  const updatedList = all.filter((c) => c.id !== idOrDni && String(c.dni).trim() !== String(idOrDni).trim());
  savePlatinoCareClients(updatedList);
  return true;
}

/**
 * Validar o registrar Plan Gratuito directamente por DNI
 */
export function validateFreePlatinoCareByDni(dni, clientData = {}) {
  return registerPlatinoCareClient({
    dni,
    clientName: clientData.clientName || "Cliente Platino",
    clientEmail: clientData.clientEmail || "",
    clientPhone: clientData.clientPhone || "",
    planType: "cortesia",
    productName: clientData.productName || "Joya Platino",
    productMetal: clientData.productMetal || "Oro 18K / Plata 950",
    orderId: clientData.orderId || "",
    notes: "Validación de cortesía gratuita realizada con DNI.",
  });
}

