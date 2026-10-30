// Servicio de Gestión de Roles, Sedes y Permisos Administrativos para Platino Perú
import { apiGet, apiPost } from "./apiClient";
import { getRemoteData, setRemoteData, updateRemoteCache } from "./remoteData";

// Definición de las 3 Cuentas Oficiales de Administrador
export const INITIAL_ADMIN_ACCOUNTS = [
  {
    id: "usr-admin-vladimir",
    name: "Vladimir",
    email: "vladimiryt18@gmail.com",
    role: "admin",
    adminType: "master", // Super Administrador Principal
    sede: "global",
    sedeLabel: "Todas las Sedes (Global)",
    phone: "+51 927 357 217",
    avatarBadge: "👑",
    title: "Super Administrador Principal",
    registeredAt: "2026-01-01",
  },
  {
    id: "usr-admin-lima",
    name: "Admin Sede Lima Centro",
    email: "admin.lima@platino.pe",
    role: "admin",
    adminType: "sede",
    sede: "lima-centro",
    sedeLabel: "Sede Lima Centro",
    phone: "+51 927 357 217",
    avatarBadge: "🏛️",
    title: "Administrador Sede Lima Centro",
    registeredAt: "2026-01-15",
  },
  {
    id: "usr-admin-miraflores",
    name: "Admin Sede Miraflores",
    email: "admin.miraflores@platino.pe",
    role: "admin",
    adminType: "sede",
    sede: "miraflores",
    sedeLabel: "Sede Miraflores",
    phone: "+51 984 281 116",
    avatarBadge: "🌊",
    title: "Administrador Sede Miraflores",
    registeredAt: "2026-01-15",
  },
];

export const getAdminAccounts = () => {
  return INITIAL_ADMIN_ACCOUNTS.map((account) => ({ ...account }));
};

// Exportar cuentas activas de administrador
export const ADMIN_ACCOUNTS = getAdminAccounts();

// Actualizar la contraseña de una cuenta de administrador (Función para Vladimir)
export const updateAdminPassword = async (email, newPassword) => {
  if (!email || !newPassword || newPassword.trim().length < 12) {
    return { success: false, error: "La contraseña debe tener al menos 12 caracteres." };
  }
  try {
    await apiPost("/auth/admin/password", { email: email.toLowerCase().trim(), newPassword });
    window.dispatchEvent(new CustomEvent("platino_admin_credentials_updated"));
    return { success: true, message: "Contraseña actualizada exitosamente." };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Catálogo de Permisos del Sistema
export const PERMISSIONS_CATALOG = [
  {
    key: "citas",
    name: "Citas & Horarios",
    shortLabel: "Citas & Horarios de Sede",
    description: "Permite ver, gestionar y bloquear horarios en su sede asignada.",
    category: "Citas",
    icon: "bi-calendar2-check",
    defaultForSede: true,
  },
  {
    key: "catalogo",
    name: "Crear Portafolio / Catálogo",
    shortLabel: "Crear Joyas / Catálogo",
    description: "Permite crear nuevas joyas en el catálogo, subir fotos y actualizar precios de venta.",
    category: "Catálogo",
    icon: "bi-gem",
    defaultForSede: false, // Requiere aprobación de Vladimir
  },
  {
    key: "inventario",
    name: "Inventario & Stock",
    shortLabel: "Inventario & Control de Stock",
    description: "Permite administrar el inventario y stock de piezas y tallas en su sede.",
    category: "Inventario",
    icon: "bi-boxes",
    defaultForSede: true,
  },
  {
    key: "pedidos",
    name: "Pedidos en Taller",
    shortLabel: "Pedidos en Taller & Fabricación",
    description: "Permite supervisar los pedidos y etapas de fabricación de clientes.",
    category: "Taller & Pedidos",
    icon: "bi-box-seam",
    defaultForSede: true,
  },
  {
    key: "home_images",
    name: "Imágenes del Inicio",
    shortLabel: "Imágenes & Banners del Inicio",
    description: "Permite cambiar banners de inicio, fotos destacadas y barra de anuncios.",
    category: "Marketing",
    icon: "bi-images",
    defaultForSede: false, // Requiere aprobación de Vladimir
  },
  {
    key: "finanzas",
    name: "Control de Pagos & Pedidos",
    shortLabel: "Control de Pagos & Ventas",
    description: "Permite auditar pedidos, verificar si se pagó y validar medios de pago (Yape, Visa, etc.).",
    category: "Finanzas",
    icon: "bi-wallet2",
    defaultForSede: false, // Requiere aprobación de Vladimir
  },
  {
    key: "nosotros",
    name: "Editar Historia (Nosotros)",
    shortLabel: "Editar Historia (Nosotros)",
    description: "Permite modificar textos, pilares y fotos de la historia de la joyería Platino.",
    category: "Contenido",
    icon: "bi-journal-richtext",
    defaultForSede: false, // Requiere aprobación de Vladimir
  },
  {
    key: "citas_global",
    name: "Citas Multisede",
    shortLabel: "Citas de Otras Sedes",
    description: "Permite ver y gestionar citas de todas las sedes del país.",
    category: "Citas",
    icon: "bi-calendar3-range",
    defaultForSede: false,
  },
  {
    key: "inventario_global",
    name: "Inventario General & Bodega",
    shortLabel: "Editar Stock de Todas las Sedes",
    description: "Permite modificar el stock de Bodega Central y de sedes ajenas.",
    category: "Inventario",
    icon: "bi-shield-check",
    defaultForSede: false,
  },
  {
    key: "descargar_excel",
    name: "Descarga de Reportes en Excel",
    shortLabel: "Exportar Tallas en Excel",
    description: "Permite exportar archivos oficiales en formato Excel (.xls y .csv).",
    category: "Reportes",
    icon: "bi-file-earmark-excel",
    defaultForSede: true,
  },
  {
    key: "reclamaciones",
    name: "Libro de Reclamaciones (INDECOPI)",
    shortLabel: "Libro de Reclamaciones",
    description: "Supervisión y atención de hojas de reclamo y queja de consumidores (Exclusivo Super Administrador Principal).",
    category: "Legal & Reclamos",
    icon: "bi-book-half",
    defaultForSede: false,
  },
];

// Matriz de permisos inicial por defecto (los otros administradores deben solicitar permisos y ser aprobados por Vladimir)
const DEFAULT_USER_PERMISSIONS = {
  // Vladimir tiene todos los permisos por ser Master
  "vladimiryt18@gmail.com": PERMISSIONS_CATALOG.map((p) => p.key),
  // Admin Lima Centro: Inicia sin módulos activos hasta que solicite permisos y Vladimir los acepte
  "admin.lima@platino.pe": [],
  // Admin Miraflores: Inicia sin módulos activos hasta que solicite permisos y Vladimir los acepte
  "admin.miraflores@platino.pe": [],
};

// Solicitudes iniciales vacías en producción (se conserva constante por compatibilidad)
export const INITIAL_REQUESTS = [];

// Obtener la matriz de permisos activa
export const getPermissionsMatrix = () => {
  const parsed = { ...DEFAULT_USER_PERMISSIONS, ...getRemoteData("permissions", DEFAULT_USER_PERMISSIONS) };
  parsed["vladimiryt18@gmail.com"] = PERMISSIONS_CATALOG.map((permission) => permission.key);
  ADMIN_ACCOUNTS.forEach((account) => {
    if (!Array.isArray(parsed[account.email])) parsed[account.email] = DEFAULT_USER_PERMISSIONS[account.email] || [];
  });
  return parsed;
};

// Guardar la matriz de permisos
export const savePermissionsMatrix = (matrix) => {
  matrix["vladimiryt18@gmail.com"] = PERMISSIONS_CATALOG.map((permission) => permission.key);
  setRemoteData("permissions", matrix, "platino_permissions_updated");
  return true;
};

// Comprobar si un usuario es el Super Admin Principal (Vladimir)
export const isMasterAdmin = (user) => {
  if (!user) return false;
  const email = (user.email || "").toLowerCase().trim();
  return email === "vladimiryt18@gmail.com";
};

// Comprobar si un usuario tiene un permiso específico
export const hasPermission = (user, permissionKey) => {
  if (!user) return false;
  // Vladimir siempre tiene acceso a todo
  if (isMasterAdmin(user)) return true;

  const email = (user.email || "").toLowerCase().trim();
  const matrix = getPermissionsMatrix();
  const userPerms = matrix[email] || [];
  return userPerms.includes(permissionKey);
};

// Obtener todas las solicitudes de permiso
export const getPermissionRequests = () => {
  const stored = getRemoteData("permission_requests", []);
  return Array.isArray(stored) ? stored : [];
};

// Guardar solicitudes
export const savePermissionRequests = (requests) => {
  setRemoteData("permission_requests", requests, "platino_permission_requests_updated");
  return true;
};

// Crear una nueva solicitud de permiso
export const requestPermission = ({ user, permissionKey, reason = "" }) => {
  if (!user || !permissionKey) return { success: false, error: "Datos incompletos" };

  const email = (user.email || "").toLowerCase().trim();
  const permInfo = PERMISSIONS_CATALOG.find((p) => p.key === permissionKey);
  const requests = getPermissionRequests();

  // Verificar si ya existe una solicitud pendiente
  const alreadyPending = requests.find(
    (r) => r.userEmail.toLowerCase() === email && r.permissionKey === permissionKey && r.status === "pendiente"
  );

  if (alreadyPending) {
    return { success: false, error: "Ya tienes una solicitud pendiente para este permiso. Vladimir la revisará pronto." };
  }

  const newRequest = {
    id: `req-${Date.now()}`,
    userEmail: email,
    userName: user.name || "Administrador de Sede",
    userSede: user.sede || "lima-centro",
    userSedeLabel: user.sedeLabel || (user.sede === "miraflores" ? "Sede Miraflores" : "Sede Lima Centro"),
    permissionKey,
    permissionName: permInfo ? permInfo.name : permissionKey,
    reason: reason.trim() || "Solicito acceso para optimizar la gestión operativa de mi sede.",
    status: "pendiente",
    createdAt: new Date().toISOString(),
    resolvedAt: null,
    resolvedBy: null,
  };

  const updated = [newRequest, ...requests];
  updateRemoteCache("permission_requests", updated, "platino_permission_requests_updated");
  apiPost("/admin/permission-requests/mutate", { action: "create", request: newRequest }).catch((error) => {
    console.error("Failed to create permission request:", error);
    window.dispatchEvent(new CustomEvent("platino_api_error", { detail: { namespace: "permission_requests", message: error.message } }));
  });
  return { success: true, request: newRequest };
};

// Aprobar una solicitud (Acción de Vladimir: cruza con la matriz de permisos del admin solicitante)
export const approvePermissionRequest = (requestId, resolverName = "Vladimir") => {
  const requests = getPermissionRequests();
  const reqIndex = requests.findIndex((r) => r.id === requestId);
  if (reqIndex === -1) return { success: false, error: "Solicitud no encontrada" };

  const targetReq = requests[reqIndex];
  targetReq.status = "aprobado";
  targetReq.resolvedAt = new Date().toISOString();
  targetReq.resolvedBy = resolverName;

  // Añadir permiso a la matriz del usuario solicitante
  const matrix = getPermissionsMatrix();
  const userEmailKey = (targetReq.userEmail || "").toLowerCase().trim();
  const userPerms = matrix[userEmailKey] || [];
  if (!userPerms.includes(targetReq.permissionKey)) {
    matrix[userEmailKey] = [...userPerms, targetReq.permissionKey];
    savePermissionsMatrix(matrix);
  }

  updateRemoteCache("permission_requests", requests, "platino_permission_requests_updated");
  apiPost("/admin/permission-requests/mutate", {
    action: "resolve",
    id: requestId,
    status: "aprobado",
    resolvedBy: resolverName,
  }).catch((error) => {
    console.error("Failed to approve permission request:", error);
    window.dispatchEvent(new CustomEvent("platino_api_error", { detail: { namespace: "permission_requests", message: error.message } }));
  });
  return { success: true, request: targetReq };
};

// Rechazar una solicitud (Acción de Vladimir: revoca también de la matriz si estaba activo)
export const rejectPermissionRequest = (requestId, resolverName = "Vladimir") => {
  const requests = getPermissionRequests();
  const reqIndex = requests.findIndex((r) => r.id === requestId);
  if (reqIndex === -1) return { success: false, error: "Solicitud no encontrada" };

  const targetReq = requests[reqIndex];
  targetReq.status = "rechazado";
  targetReq.resolvedAt = new Date().toISOString();
  targetReq.resolvedBy = resolverName;

  // Retirar el permiso de la matriz del usuario si lo tenía concedido
  const matrix = getPermissionsMatrix();
  const userEmailKey = (targetReq.userEmail || "").toLowerCase().trim();
  if (Array.isArray(matrix[userEmailKey])) {
    matrix[userEmailKey] = matrix[userEmailKey].filter((k) => k !== targetReq.permissionKey);
    savePermissionsMatrix(matrix);
  }

  updateRemoteCache("permission_requests", requests, "platino_permission_requests_updated");
  apiPost("/admin/permission-requests/mutate", {
    action: "resolve",
    id: requestId,
    status: "rechazado",
    resolvedBy: resolverName,
  }).catch((error) => {
    console.error("Failed to reject permission request:", error);
    window.dispatchEvent(new CustomEvent("platino_api_error", { detail: { namespace: "permission_requests", message: error.message } }));
  });
  return { success: true, request: targetReq };
};

// Conceder o revocar permiso manualmente desde la Matriz de Vladimir (sincroniza con sus solicitudes)
export const toggleUserPermission = (email, permissionKey, granted) => {
  const cleanEmail = (email || "").toLowerCase().trim();
  if (cleanEmail === "vladimiryt18@gmail.com") return true; // Vladimir intocable

  const matrix = getPermissionsMatrix();
  let userPerms = matrix[cleanEmail] || [];

  if (granted) {
    if (!userPerms.includes(permissionKey)) {
      userPerms = [...userPerms, permissionKey];
    }
  } else {
    userPerms = userPerms.filter((k) => k !== permissionKey);
  }

  matrix[cleanEmail] = userPerms;
  savePermissionsMatrix(matrix);

  // Sincronizar con la lista de solicitudes para mantener el cruce exacto
  const requests = getPermissionRequests();
  let updatedReqs = false;
  requests.forEach((r) => {
    if ((r.userEmail || "").toLowerCase().trim() === cleanEmail && r.permissionKey === permissionKey) {
      if (granted && r.status === "pendiente") {
        r.status = "aprobado";
        r.resolvedAt = new Date().toISOString();
        r.resolvedBy = "Vladimir";
        updatedReqs = true;
      } else if (!granted && r.status === "aprobado") {
        r.status = "rechazado";
        r.resolvedAt = new Date().toISOString();
        r.resolvedBy = "Vladimir";
        updatedReqs = true;
      }
    }
  });
  if (updatedReqs) {
    savePermissionRequests(requests);
  }

  return true;
};

// Comprobar estado de solicitud pendiente de un usuario para un permiso
export const getActivePendingRequest = (user, permissionKey) => {
  if (!user) return null;
  const email = (user.email || "").toLowerCase().trim();
  const requests = getPermissionRequests();
  return requests.find(
    (r) => r.userEmail.toLowerCase() === email && r.permissionKey === permissionKey && r.status === "pendiente"
  );
};

// ============================================================================
// CLAVE DIARIA DEL ADMINISTRADOR PRINCIPAL (VLADIMIR) PARA RECUPERACIÓN DE CONTRASEÑA
// Cambia automáticamente todos los días a las 00:00 (según la fecha local YYYY-MM-DD)
// ============================================================================
// Obtener fecha local en formato YYYY-MM-DD
export const getTodayDateKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getDailyAdminRecoveryCodeInfo = () => {
  const todayKey = getTodayDateKey();
  const cached = getRemoteData("recovery_code", null);
  const formattedDate = new Date(`${todayKey}T12:00:00`).toLocaleDateString("es-PE");
  return cached?.dateKey === todayKey
    ? { ...cached, formattedCode: `PLT-${cached.code}`, formattedDate, displayDate: formattedDate }
    : { code: "", formattedCode: "", dateKey: todayKey, formattedDate, displayDate: formattedDate, rotationCountToday: 0 };
};

export const loadDailyAdminRecoveryCodeInfo = async () => {
  const info = await apiGet("/admin/recovery-code");
  const normalized = {
    ...info,
    formattedCode: `PLT-${info.code}`,
    formattedDate: new Date(`${info.dateKey}T12:00:00`).toLocaleDateString("es-PE"),
    displayDate: new Date(`${info.dateKey}T12:00:00`).toLocaleDateString("es-PE"),
  };
  updateRemoteCache("recovery_code", normalized);
  return normalized;
};

export const validateDailyAdminRecoveryCode = async (inputCode, identifier = "") => {
  const cleanInput = String(inputCode || "")
    .trim()
    .toUpperCase()
    .replace(/^PLT[-\s]?/, "")
    .replace(/\s+/g, "");
  const { valid } = await apiPost("/admin/recovery-code/validate", {
    code: cleanInput,
    identifier: String(identifier || "").trim(),
  });
  return valid;
};

export const rotateDailyAdminRecoveryCode = async () => {
  const response = await apiPost("/admin/recovery-code", {});
  const info = {
    ...response,
    formattedCode: `PLT-${response.code}`,
    formattedDate: new Date(`${response.dateKey}T12:00:00`).toLocaleDateString("es-PE"),
    displayDate: new Date(`${response.dateKey}T12:00:00`).toLocaleDateString("es-PE"),
  };
  updateRemoteCache("recovery_code", info);
  window.dispatchEvent(new CustomEvent("platino_daily_code_updated", { detail: info }));
  return info;
};

export const getPasswordRecoveryLogs = () => {
  return getRemoteData("recovery_logs", []);
};

export const addPasswordRecoveryLog = () => null;
