// Servicio de gestión de pedidos, seguimiento de taller y sincronización Cliente-Admin para Platino Perú
import { getRemoteData, updateRemoteCache } from "./remoteData";
import { apiPost } from "./apiClient";

export const ORDER_STAGES = [
  {
    id: "recibido",
    label: "Pedido Confirmado",
    shortLabel: "Recibido",
    description: "Orden recibida y validada. Preparando especificaciones y asignando maestro orfebre.",
    icon: "bi-check-circle-fill",
    stepNumber: 1,
    color: "#2563eb",
    bgColor: "#eff6ff",
    badgeClass: "badge-recibido",
  },
  {
    id: "diseno_taller",
    label: "Diseño CAD & Taller",
    shortLabel: "En Taller",
    description: "Modelado 3D, fundición del metal noble elegido y armado estructural de la joya.",
    icon: "bi-hammer",
    stepNumber: 2,
    color: "#d97706",
    bgColor: "#fffbeb",
    badgeClass: "badge-taller",
  },
  {
    id: "engaste_pulido",
    label: "Engaste & Acabado",
    shortLabel: "En Engaste / Grabación",
    description: "Fijación microscópica de diamantes o gemas preciosas y pulido fino artesanal.",
    icon: "bi-gem",
    stepNumber: 3,
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    badgeClass: "badge-engaste",
  },
  {
    id: "control_calidad",
    label: "Control de Calidad & Certificación",
    shortLabel: "Calidad / Empaque",
    description: "Inspección gemológica estricta con lupa 10x y emisión del certificado oficial Platino.",
    icon: "bi-shield-check",
    stepNumber: 4,
    color: "#0891b2",
    bgColor: "#ecfeff",
    badgeClass: "badge-calidad",
  },
  {
    id: "listo_envio",
    label: "Listo para Entrega / Despacho",
    shortLabel: "Listo para Entrega",
    description: "Empaque de lujo completado en estuche de madera fina. Listo para recojo o courier blindado.",
    icon: "bi-box-seam",
    stepNumber: 5,
    color: "#059669",
    bgColor: "#ecfdf5",
    badgeClass: "badge-listo",
  },
  {
    id: "entregado",
    label: "Entregado al Cliente",
    shortLabel: "Entregado",
    description: "Joya entregada satisfactoriamente. Cobertura Platino Care y garantía activadas.",
    icon: "bi-patch-check-fill",
    stepNumber: 6,
    color: "#15803d",
    bgColor: "#f0fdf4",
    badgeClass: "badge-entregado",
  },
];

// Etapas unificadas visibles para el CLIENTE (4 pasos):
// 1. Recibido
// 2. En Proceso (unifica las fases internas de taller, engaste y calidad)
// 3. Listo para entrega
// 4. Entregado
export const CLIENT_ORDER_STAGES = [
  {
    id: "recibido",
    label: "Pedido Confirmado",
    shortLabel: "Recibido",
    description: "Orden recibida y validada. Preparando especificaciones y asignando maestro orfebre.",
    icon: "bi-check-circle-fill",
    stepNumber: 1,
    color: "#2563eb",
    bgColor: "#eff6ff",
    badgeClass: "badge-recibido",
    internalStages: ["recibido"],
  },
  {
    id: "en_proceso",
    label: "En Proceso de Fabricación",
    shortLabel: "En Proceso",
    description: "Tu joya exclusiva está siendo confeccionada en nuestro taller central bajo el cuidado de nuestros maestros orfebres y gemólogos.",
    icon: "bi-gear-wide-connected",
    stepNumber: 2,
    color: "#d97706",
    bgColor: "#fffbeb",
    badgeClass: "badge-taller",
    internalStages: ["diseno_taller", "engaste_pulido", "control_calidad"],
  },
  {
    id: "listo_envio",
    label: "Listo para Entrega",
    shortLabel: "Listo para Entrega",
    description: "Empaque de lujo completado en estuche noble. Listo para entrega en boutique o despacho blindado.",
    icon: "bi-box-seam",
    stepNumber: 3,
    color: "#059669",
    bgColor: "#ecfdf5",
    badgeClass: "badge-listo",
    internalStages: ["listo_envio"],
  },
  {
    id: "entregado",
    label: "Entregado al Cliente",
    shortLabel: "Entregado",
    description: "Joya entregada satisfactoriamente. Cobertura Platino Care y garantía oficial activadas de por vida.",
    icon: "bi-patch-check-fill",
    stepNumber: 4,
    color: "#15803d",
    bgColor: "#f0fdf4",
    badgeClass: "badge-entregado",
    internalStages: ["entregado"],
  },
];

export const getClientStageInfo = (internalStageId) => {
  if (internalStageId === "recibido") return CLIENT_ORDER_STAGES[0];
  if (["diseno_taller", "engaste_pulido", "control_calidad"].includes(internalStageId)) return CLIENT_ORDER_STAGES[1];
  if (internalStageId === "listo_envio") return CLIENT_ORDER_STAGES[2];
  if (internalStageId === "entregado") return CLIENT_ORDER_STAGES[3];
  return CLIENT_ORDER_STAGES[0];
};

export const getClientProgressPercentage = (internalStageId) => {
  switch (internalStageId) {
    case "recibido":
      return 25;
    case "diseno_taller":
      return 45;
    case "engaste_pulido":
      return 60;
    case "control_calidad":
      return 75;
    case "listo_envio":
      return 90;
    case "entregado":
      return 100;
    default:
      return 25;
  }
};

// Función para determinar con certeza la sede asociada a una orden
export const getOrderSedeId = (order) => {
  if (!order) return "lima-centro";
  if (order.sedeId === "miraflores" || order.sedeId === "lima-centro") return order.sedeId;
  if (order.sede === "miraflores" || order.sede === "lima-centro") return order.sede;
  const str = `${order.sedeRecojo || ""} ${order.shippingAddress || ""} ${order.adminNotes || ""}`.toLowerCase();
  if (str.includes("miraflores") || str.includes("larco")) return "miraflores";
  return "lima-centro";
};

// Obtener todos los pedidos
export const getOrders = () => {
  const parsed = getRemoteData("orders", []);
  if (!Array.isArray(parsed) || parsed.length === 0) return [];
  return parsed.map((order) => ({
    ...order,
    sedeId: getOrderSedeId(order),
    paymentMethod: PAYMENT_METHODS.includes(order.paymentMethod)
      ? order.paymentMethod
      : normalizePaymentMethod(order.paymentMethod),
  }));
};

const mutateOrderOnServer = (payload) => {
  apiPost("/admin/orders/mutate", payload)
    .then(({ data }) => {
      if (Array.isArray(data)) updateRemoteCache("orders", data, "orders_updated");
    })
    .catch((error) => {
      console.error("Could not persist order update on the API:", error);
      window.dispatchEvent(new CustomEvent("platino_api_error", { detail: { namespace: "orders", message: error.message } }));
    });
};

// Obtener pedidos de un cliente por su correo
export const getOrdersByClientEmail = (email) => {
  const all = getOrders();
  if (!email) return [];
  const cleanEmail = email.trim().toLowerCase();
  return all.filter((o) => (o.clientEmail || "").trim().toLowerCase() === cleanEmail);
};

// Avanzar al siguiente paso del proceso de fabricación
export const advanceOrderStep = (orderId) => {
  const all = getOrders();
  const order = all.find((o) => o.id === orderId);
  if (!order) return null;

  const currentIdx = ORDER_STAGES.findIndex((s) => s.id === order.stage);
  if (currentIdx === -1 || currentIdx >= ORDER_STAGES.length - 1) {
    return ORDER_STAGES[ORDER_STAGES.length - 1];
  }

  const nextStage = ORDER_STAGES[currentIdx + 1];
  const autoNotes = {
    diseno_taller: "Diseño 3D CAD aprobado por el cliente. Fundición iniciada en crisol del taller central.",
    engaste_pulido: "Montura fundida con éxito. Maestro engastador montando diamantes y realizando pulido fino.",
    control_calidad: "Engaste completado. La joya ingresó a laboratorio para inspección gemológica y certificado GIA.",
    listo_envio: "Control de calidad 100% aprobado. Empacado en estuche de madera fina listo para entrega o despacho.",
    entregado: "Joya entregada conforme al cliente. Garantía y cobertura Platino Care activadas de por vida.",
  };

  const newNote = autoNotes[nextStage.id] || `El pedido avanzó a la etapa de ${nextStage.label}.`;
  updateOrderStatus(orderId, nextStage.id, newNote);
  return nextStage;
};

// Retroceder un paso del proceso de fabricación (para pruebas y ajustes)
export const stepBackOrderStep = (orderId) => {
  const all = getOrders();
  const order = all.find((o) => o.id === orderId);
  if (!order) return null;

  const currentIdx = ORDER_STAGES.findIndex((s) => s.id === order.stage);
  if (currentIdx <= 0) return ORDER_STAGES[0];

  const prevStage = ORDER_STAGES[currentIdx - 1];
  updateOrderStatus(orderId, prevStage.id, `Regresado a fase de ${prevStage.label} para ajustes adicionales.`);
  return prevStage;
};

// Obtener un pedido específico por ID
export const getOrderById = (orderId) => {
  const all = getOrders();
  return all.find((o) => o.id === orderId) || null;
};

// Obtener información de una etapa
export const getOrderStageInfo = (stageId) => {
  return (
    ORDER_STAGES.find((s) => s.id === stageId) || {
      id: stageId,
      label: stageId,
      shortLabel: stageId,
      description: "",
      icon: "bi-info-circle",
      stepNumber: 1,
      color: "#6b7280",
      bgColor: "#f3f4f6",
      badgeClass: "badge-default",
    }
  );
};

// Actualizar el estado / etapa de un pedido (por parte del Administrador)
export const updateOrderStatus = (orderId, newStage, adminNotes = null) => {
  const all = getOrders();
  const index = all.findIndex((o) => o.id === orderId);
  if (index === -1) return false;

  const currentOrder = all[index];
  const stageInfo = getOrderStageInfo(newStage);
  const now = new Date();
  const formattedDate = `${now.toISOString().split("T")[0]} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  const updatedNotes = adminNotes !== null ? adminNotes : currentOrder.adminNotes;

  const timeline = Array.isArray(currentOrder.timeline) ? [...currentOrder.timeline] : [];
  const alreadyInTimeline = timeline.some((t) => t.stage === newStage);

  if (!alreadyInTimeline) {
    timeline.push({
      stage: newStage,
      date: formattedDate,
      note: adminNotes || `El pedido avanzó a la etapa de ${stageInfo.label}.`,
    });
  }

  all[index] = {
    ...currentOrder,
    stage: newStage,
    adminNotes: updatedNotes,
    lastUpdated: now.toISOString().split("T")[0],
    timeline,
  };

  updateRemoteCache("orders", all, "orders_updated");
  mutateOrderOnServer({ action: "update_status", orderId, stage: newStage, adminNotes: updatedNotes, timeline });
  return true;
};

export const PAYMENT_STATUSES = [
  { id: "Pagado (100%)", label: "Pagado (100%)", color: "#15803d", bgColor: "#dcfce7", icon: "bi-check-circle-fill" },
  { id: "Pendiente de Validación", label: "Pendiente de Validación", color: "#b45309", bgColor: "#fef3c7", icon: "bi-hourglass-split" },
  { id: "Pago Parcial (50%)", label: "Pago Parcial (50%)", color: "#1d4ed8", bgColor: "#dbeafe", icon: "bi-pie-chart-fill" },
  { id: "Pendiente de Pago", label: "Pendiente de Pago", color: "#b91c1c", bgColor: "#fee2e2", icon: "bi-x-circle-fill" },
];

export const PAYMENT_METHODS = [
  "BanBif",
  "Banco de la Nación",
  "BCP",
  "Interbank",
  "IziPay",
  "Pichincha",
  "Fondo Platino",
  "Efectivo",
];

export const PAYMENT_METHODS_DATA = [
  {
    id: "BCP",
    name: "BCP",
    badge: "Inmediato",
    category: "Transferencia Bancaria",
    description: "Transferencia directa a cuenta corriente Soles / Dólares BCP",
    icon: "bi-bank",
    instructions: "Transfiere vía App BCP o agente a nuestra Cta. Cte. Soles: 194-8291048-0-12 (CCI: 00219400829104801290).",
  },
  {
    id: "Interbank",
    name: "Interbank",
    badge: "Directo",
    category: "Transferencia Bancaria",
    description: "Transferencia directa o interbancaria Interbank",
    icon: "bi-building-fill",
    instructions: "Transfiere desde tu banca móvil Interbank a nuestra Cta. Cte. Soles: 200-3001847192 (CCI: 00320000300184719245).",
  },
  {
    id: "BanBif",
    name: "BanBif",
    badge: "Banca Exclusiva",
    category: "Transferencia Bancaria",
    description: "Abono o transferencia a cuenta corriente BanBif",
    icon: "bi-bank2",
    instructions: "Transfiere vía BanBif a nuestra Cta. Cte. Soles: 007-001928471-9 (CCI: 03800700192847190011).",
  },
  {
    id: "Banco de la Nación",
    name: "Banco de la Nación",
    badge: "Nacional",
    category: "Depósito / Transferencia",
    description: "Depósito en ventanilla, agente o transferencia BN",
    icon: "bi-building",
    instructions: "Abono o depósito en ventanilla o agente Banco de la Nación a la Cta. Institucional: 04-019-382910.",
  },
  {
    id: "IziPay",
    name: "IziPay",
    badge: "Pasarela Segura",
    category: "Pasarela & Tarjetas",
    description: "Pago seguro con tarjeta Débito / Crédito vía pasarela IziPay",
    icon: "bi-credit-card-2-front-fill",
    instructions: "Procesamiento 100% encriptado con tarjetas Visa, Mastercard o Amex a través del terminal / pasarela virtual IziPay.",
  },
  {
    id: "Pichincha",
    name: "Pichincha",
    badge: "Red Pichincha",
    category: "Transferencia Bancaria",
    description: "Transferencia a cuenta empresarial Banco Pichincha",
    icon: "bi-credit-card",
    instructions: "Transfiere desde la banca móvil Pichincha o interbancario a la Cta.: 0011-0982736182 (CCI: 01100110982736182390).",
  },
  {
    id: "Fondo Platino",
    name: "Fondo Platino",
    badge: "Línea Joyera",
    category: "Financiamiento & Saldo",
    description: "Crédito corporativo directo o saldo a favor Fondo Platino",
    icon: "bi-gem",
    instructions: "Aplica tu línea de crédito o fondo a favor de taller Platino. Un asesor confirmará tu código corporativo.",
  },
  {
    id: "Efectivo",
    name: "Efectivo",
    badge: "En Boutique",
    category: "Pago Presencial",
    description: "Pago en efectivo en tienda física o al coordinar entrega",
    icon: "bi-cash-stack",
    instructions: "Cancela en efectivo directamente en caja en nuestra boutique de Miraflores o Lima Centro al retirar tu joya.",
  },
];

export const normalizePaymentMethod = (pm) => {
  if (!pm) return "BCP";
  const str = String(pm).trim().toLowerCase();
  if (str.includes("banbif")) return "BanBif";
  if (str.includes("nacion") || str.includes("nación")) return "Banco de la Nación";
  if (str.includes("interbank")) return "Interbank";
  if (str.includes("bcp") || str.includes("transferencia")) return "BCP";
  if (str.includes("izipay") || str.includes("tarjeta") || str.includes("pos") || str.includes("visa") || str.includes("mastercard") || str.includes("datafono") || str.includes("datáfono")) return "IziPay";
  if (str.includes("pichincha")) return "Pichincha";
  if (str.includes("fondo platino") || str.includes("fondo")) return "Fondo Platino";
  if (str.includes("efectivo") || str.includes("cash")) return "Efectivo";
  if (str.includes("plin")) return "Interbank";
  if (str.includes("yape")) return "BCP";
  return "BCP";
};

// Actualizar estado de pago y medio de pago (Administrador)
export const updateOrderPayment = (orderId, paymentStatus, paymentMethod = null, paymentNotes = null) => {
  const all = getOrders();
  const index = all.findIndex((o) => o.id === orderId);
  if (index === -1) return false;

  const currentOrder = all[index];
  const nextStatus = paymentStatus || currentOrder.paymentStatus;
  const nextMethod = paymentMethod !== null ? paymentMethod : currentOrder.paymentMethod;
  const nextNotes = paymentNotes !== null ? paymentNotes : (currentOrder.paymentNotes || "");

  all[index] = {
    ...currentOrder,
    paymentStatus: nextStatus,
    paymentMethod: nextMethod,
    paymentNotes: nextNotes,
    lastUpdated: new Date().toISOString().split("T")[0],
  };

  updateRemoteCache("orders", all, "orders_updated");
  mutateOrderOnServer({
    action: "update_payment",
    orderId,
    paymentStatus: nextStatus,
    paymentMethod: nextMethod,
    paymentNotes: nextNotes,
  });
  return true;
};

// Crear nuevo pedido (desde Checkout o Admin)
export const createOrder = async (orderData) => {
  const { order } = await apiPost("/public/orders", { order: orderData });
  updateRemoteCache("orders", [order, ...getOrders()], "orders_updated");
  return order;
};

// Eliminar pedido (función administrativa)
export const deleteOrder = (orderId) => {
  const all = getOrders();
  const filtered = all.filter((o) => o.id !== orderId);
  updateRemoteCache("orders", filtered, "orders_updated");
  mutateOrderOnServer({ action: "delete", orderId });
  return true;
};

// ==========================================
// CONFIGURACIÓN Y ASIGNACIÓN DE TALLER (FASES 2, 3 Y 4)
// ==========================================
export const WORKSHOP_JEWELERS = [
  "Joyero | Raúl",
  "Joyero | Hernán",
  "Joyero | Felix",
  "Joyero | Elías",
  "Joyero | Alejandro",
  "Joyera | Ermy",
  "Joyero | Externo",
  "Joyero | Platino",
  "Servicio | Baño de Rodhio",
  "Servicio | Enchape",
  "Servicio | Diamantado",
  "Servicio | Otros",
];

export const WORKSHOP_PROCESSES = [
  "Grabación Tradicional",
  "Grabación Láser",
  "Engaste | Joaquín",
  "Engaste | Uchupe",
  "Engaste | Otros",
  "Engaste | Platino",
];

export const WORKSHOP_DELIVERY_CHOICES = [
  "Calidad Aprobada",
  "Enviar a Sede Miraflores",
  "Enviar a Sede Lima",
  "Olva Courier",
  "Shalom",
  "Interprovincial",
  "Motorizado",
  "Delivery Platino",
];

export const WORKSHOP_BOX_OPTIONS = [
  "Cofre de Madera Fina Platino",
  "Cofre Terciopelo Verde Platino",
  "Cofre Especial Matrimonio",
  "Cofre Estándar Platino",
  "Sin Cofre",
];

// Actualizar campos específicos de fases de taller (Fase 2, Fase 3, Fase 4)
export const updateOrderWorkshopFields = (orderId, partialFields) => {
  const all = getOrders();
  const index = all.findIndex((o) => o.id === orderId);
  if (index === -1) return false;

  all[index] = {
    ...all[index],
    ...partialFields,
    lastUpdated: new Date().toISOString().split("T")[0],
  };

  updateRemoteCache("orders", all, "orders_updated");
  mutateOrderOnServer({ action: "update_fields", orderId, fields: partialFields });
  return true;
};

// Actualizar comentarios internos opcionales por fase (Solo visible para Administradores)
export const updateOrderStageComment = (orderId, stageId, commentText) => {
  const all = getOrders();
  const index = all.findIndex((o) => o.id === orderId);
  if (index === -1) return false;

  const current = all[index];
  const stageComments = { ...(current.stageComments || {}), [stageId]: commentText };

  const updates = { stageComments };
  if (stageId === "diseno_taller") {
    updates.workshopInternalNotes = commentText;
    updates.phase2Notes = commentText;
  } else if (stageId === "engaste_pulido") {
    updates.phase3Notes = commentText;
  } else if (stageId === "control_calidad") {
    updates.phase4Notes = commentText;
  }

  all[index] = {
    ...current,
    ...updates,
    lastUpdated: new Date().toISOString().split("T")[0],
  };

  updateRemoteCache("orders", all, "orders_updated");
  mutateOrderOnServer({ action: "update_fields", orderId, fields: updates });
  return true;
};
