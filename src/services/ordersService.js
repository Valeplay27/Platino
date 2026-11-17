// Servicio de gestión de pedidos, seguimiento de taller y sincronización Cliente-Admin para Platino Perú
import { getRemoteData, updateRemoteCache } from "./remoteData";
import { apiPost } from "./apiClient";
import { decrementGemstoneStock, isItemGemstone } from "./gemstonesService";
import { decrementProductStock } from "./inventoryService";
import { recordPromotionUsage } from "./promotionsService";

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
    description: "Empaque de lujo completado en estuche de madera fina. Listo para recojo o envío a domicilio.",
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
    description: "Empaque de lujo completado en estuche noble. Listo para entrega en boutique o despacho a domicilio.",
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

// Pedidos preconfigurados para demostración y evaluación
export const INITIAL_ORDERS = [
  {
    id: "PLT-2026-8941",
    date: "2026-03-25",
    clientName: "Camila Mendoza",
    clientEmail: "cliente@platino.pe",
    clientPhone: "+51 912 345 678",
    deliveryType: "recojo_sede",
    sedeId: "miraflores",
    sedeName: "Sede Miraflores",
    sedeRecojo: "Sede Miraflores - Av. Larco 345 (Multicentro)",
    shippingAddress: "",
    stage: "engaste_pulido",
    estimatedCompletion: "10 de Abril, 2026",
    adminNotes: "Montura en Oro 18K Rosa fundida y pulida con éxito. Diamante central de 1.00 ct en proceso de engaste en 4 uñas.",
    lastUpdated: "2026-03-29",
    paymentStatus: "Pagado (100%)",
    paymentMethod: "BCP",
    total: 4850,
    items: [
      {
        id: "prod-secret-garden",
        name: "Anillo Solitario Secret Garden",
        metal: "Oro 18K Rosa",
        metalId: "oro-18k-rosa",
        tone: "rose",
        size: "12 (Dama)",
        gemstone: "Diamante Natural 1.00 ct - Corte Redondo Brillante (GIA)",
        price: 4850,
        quantity: 1,
        image: "/images/secret-garden-rose.jpg",
        sku: "SG-OR-12",
      },
    ],
    timeline: [
      {
        stage: "recibido",
        date: "2026-03-25 10:30 AM",
        note: "Orden recibida en línea y pago validado.",
      },
      {
        stage: "diseno_taller",
        date: "2026-03-27 02:15 PM",
        note: "Modelado 3D terminado y vaciado en Oro 18K Rosa realizado en taller central.",
      },
      {
        stage: "engaste_pulido",
        date: "2026-03-29 11:00 AM",
        note: "Montura lista; maestro engastador fijando gema central y diamantes laterales.",
      },
    ],
  },
  {
    id: "PLT-2026-9115",
    date: "2026-03-30",
    clientName: "Valeria Morales",
    clientEmail: "v.morales@gmail.com",
    clientPhone: "+51 927 943 262",
    deliveryType: "recojo_sede",
    sedeId: "miraflores",
    sedeName: "Sede Miraflores",
    sedeRecojo: "Sede Miraflores - Av. Larco 345 (Multicentro)",
    shippingAddress: "",
    stage: "control_calidad",
    estimatedCompletion: "12 de Abril, 2026",
    adminNotes: "Engaste de diamantes 100% verificado. En laboratorio para emisión de certificado gemológico.",
    lastUpdated: "2026-04-03",
    paymentStatus: "Pagado (100%)",
    paymentMethod: "IziPay",
    total: 6400,
    items: [
      {
        id: "prod-pulsera-tennis",
        name: "Pulsera Tennis Diamantes Platino",
        metal: "Platino 950",
        metalId: "platino",
        tone: "white",
        size: "17 cm",
        gemstone: "Diamantes corte brillante 2.50 ct total",
        price: 6400,
        quantity: 1,
        image: "/images/cat-pulseras.jpg",
        sku: "PT-PL-17",
      },
    ],
    timeline: [
      { stage: "recibido", date: "2026-03-30 11:20 AM", note: "Pedido registrado y validado en tienda Miraflores." },
      { stage: "diseno_taller", date: "2026-04-01 09:30 AM", note: "Eslabones articulados armados en taller." },
      { stage: "engaste_pulido", date: "2026-04-02 03:00 PM", note: "Engaste de 48 diamantes completado." },
      { stage: "control_calidad", date: "2026-04-03 10:00 AM", note: "En revisión de laboratorio gemológico." },
    ],
  },
  {
    id: "PLT-2025-4102",
    date: "2025-11-14",
    clientName: "Camila Mendoza",
    clientEmail: "cliente@platino.pe",
    clientPhone: "+51 912 345 678",
    deliveryType: "recojo_sede",
    sedeId: "lima-centro",
    sedeName: "Sede Lima Centro",
    sedeRecojo: "Sede Lima Centro - Jr. de la Unión 446",
    shippingAddress: "",
    stage: "entregado",
    estimatedCompletion: "28 de Noviembre, 2025",
    adminNotes: "Entregado a satisfacción en tienda Lima Centro con estuche de madera fina y tarjeta Platino Care.",
    lastUpdated: "2025-11-28",
    paymentStatus: "Pagado (100%)",
    paymentMethod: "Interbank",
    total: 3600,
    items: [
      {
        id: "prod-aros-eternidad",
        name: "Aros de Matrimonio Platino Eternidad",
        metal: "Platino 950",
        metalId: "platino",
        tone: "white",
        size: "Dama: 11 / Varón: 18",
        gemstone: "Micro-pavé de Diamantes corte brillante 0.15 ct",
        price: 3600,
        quantity: 1,
        image: "/images/aros-trial-oro-blanco.jpg",
        sku: "ET-PL-11-18",
      },
    ],
    timeline: [
      { stage: "recibido", date: "2025-11-14 09:00 AM", note: "Pedido registrado." },
      { stage: "diseno_taller", date: "2025-11-16 11:20 AM", note: "Fundición en Platino 950 completada." },
      { stage: "engaste_pulido", date: "2025-11-20 04:45 PM", note: "Engaste de diamantes y grabado láser interior." },
      { stage: "control_calidad", date: "2025-11-24 10:00 AM", note: "Inspección gemológica aprobada." },
      { stage: "listo_envio", date: "2025-11-26 03:00 PM", note: "Empacado listo en vitrina de Lima Centro." },
      { stage: "entregado", date: "2025-11-28 01:15 PM", note: "Entregado a la cliente en local Lima Centro." },
    ],
  },
  {
    id: "PLT-2026-9023",
    date: "2026-04-01",
    clientName: "Rodrigo Benavides",
    clientEmail: "r.benavides@empresa.pe",
    clientPhone: "+51 998 765 432",
    deliveryType: "recojo_sede",
    sedeId: "lima-centro",
    sedeName: "Sede Lima Centro",
    sedeRecojo: "Sede Lima Centro - Jr. de la Unión 446",
    shippingAddress: "",
    stage: "diseno_taller",
    estimatedCompletion: "16 de Abril, 2026",
    adminNotes: "Diseño CAD aprobado por el cliente. Fundiendo montura en Oro 18K Amarillo en taller de Lima.",
    lastUpdated: "2026-04-02",
    paymentStatus: "Pagado (100%)",
    paymentMethod: "BanBif",
    total: 5200,
    items: [
      {
        id: "prod-corona-imperial",
        name: "Anillo de Compromiso Corona Imperial",
        metal: "Oro 18K Amarillo",
        metalId: "oro-18k-amarillo",
        tone: "yellow",
        size: "13 (Dama)",
        gemstone: "Zafiro Azul Real 1.50 ct",
        price: 5200,
        quantity: 1,
        image: "/images/aros-trial-oro-amarillo.jpg",
        sku: "CI-OA-13",
      },
    ],
    timeline: [
      { stage: "recibido", date: "2026-04-01 03:40 PM", note: "Pedido registrado y validado." },
      { stage: "diseno_taller", date: "2026-04-02 10:15 AM", note: "Iniciada fundición en crisol con aleación de Oro 18K Amarillo." },
    ],
  },
  {
    id: "PLT-2026-9240",
    date: "2026-04-03",
    clientName: "Diego Alarcón",
    clientEmail: "d.alarcon@gmail.com",
    clientPhone: "+51 927 357 217",
    deliveryType: "recojo_sede",
    sedeId: "lima-centro",
    sedeName: "Sede Lima Centro",
    sedeRecojo: "Sede Lima Centro - Jr. de la Unión 446",
    shippingAddress: "",
    stage: "recibido",
    estimatedCompletion: "20 de Abril, 2026",
    adminNotes: "Pedido presencial en tienda Lima Centro. Pago en efectivo recibido en caja.",
    lastUpdated: "2026-04-03",
    paymentStatus: "Pagado (100%)",
    paymentMethod: "Efectivo",
    total: 2800,
    items: [
      {
        id: "prod-solitario-aura",
        name: "Anillo Aura Zafiro Azul",
        metal: "Oro 18K Blanco",
        metalId: "oro-18k-blanco",
        tone: "white",
        size: "14 (Dama)",
        gemstone: "Zafiro Natural 0.80 ct",
        price: 2800,
        quantity: 1,
        image: "/images/cat-compromiso.jpg",
        sku: "AU-OB-14",
      },
    ],
    timeline: [
      { stage: "recibido", date: "2026-04-03 04:30 PM", note: "Orden recibida en tienda física Lima Centro." },
    ],
  },
];

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
  const parsed = getRemoteData("orders", null);
  const sourceList = Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ORDERS;
  return sourceList
    .filter((order) => order && typeof order === "object")
    .map((order) => ({
      ...order,
      sedeId: getOrderSedeId(order),
      paymentMethod: PAYMENT_METHODS.includes(order.paymentMethod)
        ? order.paymentMethod
        : normalizePaymentMethod(order.paymentMethod),
      items: Array.isArray(order.items)
        ? order.items.map((item) => {
            if (isItemGemstone(item)) {
              return {
                ...item,
                isGemstone: true,
                metal: null,
                size: null,
                engraving: null,
                needsSizeAdvice: false,
              };
            }
            return item;
          })
        : order.items,
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
    instructions: "Una vez confirmado tu pedido, te enviaremos los datos de nuestras cuentas bancarias por WhatsApp para que puedas realizar el pago.",
  },
  {
    id: "Interbank",
    name: "Interbank",
    badge: "Directo",
    category: "Transferencia Bancaria",
    description: "Transferencia directa o interbancaria Interbank",
    icon: "bi-building-fill",
    instructions: "Una vez confirmado tu pedido, te enviaremos los datos de nuestras cuentas bancarias por WhatsApp para que puedas realizar el pago.",
  },
  {
    id: "BanBif",
    name: "BanBif",
    badge: "Banca Exclusiva",
    category: "Transferencia Bancaria",
    description: "Abono o transferencia a cuenta corriente BanBif",
    icon: "bi-bank2",
    instructions: "Una vez confirmado tu pedido, te enviaremos los datos de nuestras cuentas bancarias por WhatsApp para que puedas realizar el pago.",
  },
  {
    id: "Banco de la Nación",
    name: "Banco de la Nación",
    badge: "Nacional",
    category: "Depósito / Transferencia",
    description: "Depósito en ventanilla, agente o transferencia BN",
    icon: "bi-building",
    instructions: "Una vez confirmado tu pedido, te enviaremos los datos de nuestras cuentas bancarias por WhatsApp para que puedas realizar el pago.",
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
    instructions: "Una vez confirmado tu pedido, te enviaremos los datos de nuestras cuentas bancarias por WhatsApp para que puedas realizar el pago.",
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
export const createOrder = async (orderData = {}) => {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const newId = orderData.id || `PLT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const sedeId = orderData.sedeId || getOrderSedeId(orderData);
  const isMiraflores = sedeId === "miraflores";

  const fallbackOrder = {
    id: newId,
    date: todayStr,
    clientName: orderData.clientName || "Cliente Platino",
    clientDni: orderData.clientDni || "",
    clientEmail: orderData.clientEmail || "cliente@platino.pe",
    clientPhone: orderData.clientPhone || (isMiraflores ? "+51 927 943 262" : "+51 927 357 217"),
    deliveryType: orderData.deliveryType || "recojo_sede",
    sedeId,
    sedeName: orderData.sedeName || (isMiraflores ? "Sede Miraflores" : "Sede Lima Centro"),
    sedeRecojo: orderData.sedeRecojo || (isMiraflores ? "Sede Miraflores - Av. Larco 345 (Multicentro)" : "Sede Lima Centro - Jr. de la Unión 446"),
    shippingAddress: orderData.shippingAddress || "",
    department: orderData.department || "",
    province: orderData.province || "",
    district: orderData.district || "",
    shippingCost: Number(orderData.shippingCost || 0),
    subtotal: Number(orderData.subtotal || orderData.total || 0),
    stage: orderData.stage || "recibido",
    estimatedCompletion: orderData.estimatedCompletion || "15 días hábiles",
    adminNotes: orderData.adminNotes || "Pedido ingresado al sistema. En espera de asignación de maestro joyero.",
    lastUpdated: todayStr,
    paymentStatus: orderData.paymentStatus || "Pagado (100%)",
    paymentMethod: orderData.paymentMethod || "BCP",
    total: orderData.total || 0,
    items: orderData.items || [],
    timeline: orderData.timeline || [
      {
        stage: "recibido",
        date: `${todayStr} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        note: "Pedido confirmado y registrado en el taller de orfebrería.",
      },
    ],
    ...orderData,
  };

  try {
    const res = await apiPost("/public/orders", { order: fallbackOrder });
    const createdOrder = res?.order || res?.data?.order || res?.data || fallbackOrder;
    const currentOrders = getOrders();
    const nextOrders = [createdOrder, ...currentOrders.filter((o) => o.id !== createdOrder.id)];
    updateRemoteCache("orders", nextOrders, "orders_updated");

    // Disminuir stock en catálogo de gemas y control de inventario
    if (Array.isArray(createdOrder.items || fallbackOrder.items)) {
      const itemsToDeduct = createdOrder.items || fallbackOrder.items;
      itemsToDeduct.forEach((item) => {
        const isGem = isItemGemstone(item);
        if (isGem) {
          decrementGemstoneStock(item, item.quantity || 1);
        } else if (item.size && item.size !== "Estándar" && item.size !== "asesor") {
          decrementProductStock(item.id, "dama", item.size, item.quantity || 1, sedeId);
        }
      });
    }

    if (fallbackOrder.promoCode) {
      recordPromotionUsage(fallbackOrder.promoCode);
    }

    return createdOrder;
  } catch (error) {
    console.warn("Could not post order to server, using local fallback:", error);
    const currentOrders = getOrders();
    const nextOrders = [fallbackOrder, ...currentOrders.filter((o) => o.id !== fallbackOrder.id)];
    updateRemoteCache("orders", nextOrders, "orders_updated");

    // Disminuir stock en catálogo de gemas y control de inventario (fallback)
    if (Array.isArray(fallbackOrder.items)) {
      fallbackOrder.items.forEach((item) => {
        const isGem = isItemGemstone(item);
        if (isGem) {
          decrementGemstoneStock(item, item.quantity || 1);
        } else if (item.size && item.size !== "Estándar" && item.size !== "asesor") {
          decrementProductStock(item.id, "dama", item.size, item.quantity || 1, sedeId);
        }
      });
    }

    if (fallbackOrder.promoCode) {
      recordPromotionUsage(fallbackOrder.promoCode);
    }

    return fallbackOrder;
  }
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
