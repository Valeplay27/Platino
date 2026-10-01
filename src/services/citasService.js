// Servicio de gestión de citas y bloqueos de horarios para Platino Perú

export const TIME_SLOTS = [
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  // 1:00 PM - 2:00 PM es refrigerio
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
];

const CITAS_STORAGE_KEY = "platino_citas_v1";
const BLOCKED_SLOTS_KEY = "platino_blocked_slots_v1";

// Citas iniciales de demostración
const INITIAL_CITAS = [
  {
    id: "PLT-1082",
    sedeId: "miraflores",
    sedeName: "Sede Miraflores",
    serviceType: "gemologo",
    serviceTitle: "Cita con Gemólogo",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Mañana
    time: "11:00 AM",
    clientName: "Valeria Mendoza",
    clientPhone: "+51 987 654 321",
    clientEmail: "valeria.mendoza@gmail.com",
    observation: "Busco diamante corte esmeralda de 1.5ct con certificación GIA para sortija de compromiso.",
    status: "confirmada", // confirmada, pendiente, cancelada, completada
    createdAt: new Date().toISOString(),
  },
  {
    id: "PLT-1083",
    sedeId: "lima-centro",
    sedeName: "Sede Lima Centro",
    serviceType: "asesoria",
    serviceTitle: "Cita de Asesoría General",
    date: new Date(Date.now() + 172800000).toISOString().split("T")[0], // Pasado mañana
    time: "04:00 PM",
    clientName: "Carlos Alarcón",
    clientPhone: "+51 912 345 678",
    clientEmail: "carlos.alarcon@hotmail.com",
    observation: "Ver modelos de aros de matrimonio en oro amarillo 18k con grabado personalizado.",
    status: "pendiente",
    createdAt: new Date().toISOString(),
  },
];

// Bloqueos iniciales de demostración
const INITIAL_BLOCKED = [
  {
    id: "block-1",
    sedeId: "lima-centro",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time: "10:00 AM",
    reason: "Capacitación interna de gemología",
    createdAt: new Date().toISOString(),
  },
  {
    id: "block-2",
    sedeId: "miraflores",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time: "03:00 PM",
    reason: "Mantenimiento y auditoría de vitrinas",
    createdAt: new Date().toISOString(),
  },
];

export const getCitas = () => {
  try {
    const data = localStorage.getItem(CITAS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(CITAS_STORAGE_KEY, JSON.stringify(INITIAL_CITAS));
      return INITIAL_CITAS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_CITAS;
  }
};

export const saveCita = (citaData) => {
  const citas = getCitas();
  const newCita = {
    ...citaData,
    id: `PLT-${Math.floor(1000 + Math.random() * 9000)}`,
    status: "confirmada",
    createdAt: new Date().toISOString(),
  };
  const updated = [newCita, ...citas];
  localStorage.setItem(CITAS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("citas_updated"));
  return newCita;
};

export const updateCitaStatus = (id, newStatus) => {
  const citas = getCitas();
  const updated = citas.map((c) => (c.id === id ? { ...c, status: newStatus } : c));
  localStorage.setItem(CITAS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("citas_updated"));
  return updated;
};

export const deleteCita = (id) => {
  const citas = getCitas();
  const updated = citas.filter((c) => c.id !== id);
  localStorage.setItem(CITAS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("citas_updated"));
  return updated;
};

export const getBlockedSlots = () => {
  try {
    const data = localStorage.getItem(BLOCKED_SLOTS_KEY);
    if (!data) {
      localStorage.setItem(BLOCKED_SLOTS_KEY, JSON.stringify(INITIAL_BLOCKED));
      return INITIAL_BLOCKED;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_BLOCKED;
  }
};

export const isSlotBlocked = (sedeId, dateStr, timeStr) => {
  // 1. Revisar si hay un bloqueo administrativo manual
  const blocked = getBlockedSlots();
  const isManuallyBlocked = blocked.some(
    (b) => b.sedeId === sedeId && b.date === dateStr && (b.time === timeStr || b.time === "FULL_DAY")
  );
  if (isManuallyBlocked) return { blocked: true, reason: "Bloqueado por administración" };

  // 2. Revisar si ya existe una cita confirmada o pendiente en ese horario y sede
  const citas = getCitas();
  const booked = citas.find(
    (c) =>
      c.sedeId === sedeId &&
      c.date === dateStr &&
      c.time === timeStr &&
      c.status !== "cancelada"
  );
  if (booked) return { blocked: true, reason: "Horario reservado por otro cliente" };

  return { blocked: false, reason: null };
};

export const blockSlot = (sedeId, dateStr, timeStr, reason = "Reservado / Bloqueo administrativo") => {
  const blocked = getBlockedSlots();
  const newBlock = {
    id: `block-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    sedeId,
    date: dateStr,
    time: timeStr,
    reason,
    createdAt: new Date().toISOString(),
  };
  const updated = [newBlock, ...blocked];
  localStorage.setItem(BLOCKED_SLOTS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("citas_updated"));
  return updated;
};

export const unblockSlot = (blockId) => {
  const blocked = getBlockedSlots();
  const updated = blocked.filter((b) => b.id !== blockId);
  localStorage.setItem(BLOCKED_SLOTS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("citas_updated"));
  return updated;
};

export const unblockBySlotDetails = (sedeId, dateStr, timeStr) => {
  const blocked = getBlockedSlots();
  const updated = blocked.filter(
    (b) => !(b.sedeId === sedeId && b.date === dateStr && b.time === timeStr)
  );
  localStorage.setItem(BLOCKED_SLOTS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("citas_updated"));
  return updated;
};
