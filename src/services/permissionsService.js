// Servicio de Gestión de Roles, Sedes y Permisos Administrativos para Platino Perú

const STORAGE_KEY_PERMISSIONS = "platino_admin_permissions_v4";
const STORAGE_KEY_REQUESTS = "platino_permission_requests_v4";

const STORAGE_KEY_ADMIN_PASSWORDS = "platino_admin_passwords_v2";

// Definición de las 3 Cuentas Oficiales de Administrador
export const INITIAL_ADMIN_ACCOUNTS = [
  {
    id: "usr-admin-vladimir",
    name: "Vladimir",
    email: "vladimiryt18@gmail.com",
    defaultPassword: "Pumita30****",
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
    defaultPassword: "LimaPlatino2026*",
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
    defaultPassword: "Miraflores2026*",
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

// Obtener mapa de contraseñas activas
export const getAdminPasswordsMap = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ADMIN_PASSWORDS);
    if (!stored) {
      const map = {};
      INITIAL_ADMIN_ACCOUNTS.forEach((a) => {
        map[a.email.toLowerCase()] = a.defaultPassword;
      });
      localStorage.setItem(STORAGE_KEY_ADMIN_PASSWORDS, JSON.stringify(map));
      return map;
    }
    return JSON.parse(stored);
  } catch {
    const map = {};
    INITIAL_ADMIN_ACCOUNTS.forEach((a) => {
      map[a.email.toLowerCase()] = a.defaultPassword;
    });
    return map;
  }
};

// Obtener las cuentas de administrador con sus contraseñas actuales
export const getAdminAccounts = () => {
  const passwordsMap = getAdminPasswordsMap();
  return INITIAL_ADMIN_ACCOUNTS.map((a) => ({
    ...a,
    password: passwordsMap[a.email.toLowerCase()] || a.defaultPassword,
  }));
};

// Exportar cuentas activas de administrador
export const ADMIN_ACCOUNTS = getAdminAccounts();

// Actualizar la contraseña de una cuenta de administrador (Función para Vladimir)
export const updateAdminPassword = (email, newPassword) => {
  if (!email || !newPassword || newPassword.trim().length < 4) {
    return { success: false, error: "La contraseña debe tener al menos 4 caracteres." };
  }
  try {
    const cleanEmail = email.toLowerCase().trim();
    const cleanPass = newPassword.trim();
    const passwordsMap = getAdminPasswordsMap();
    passwordsMap[cleanEmail] = cleanPass;
    localStorage.setItem(STORAGE_KEY_ADMIN_PASSWORDS, JSON.stringify(passwordsMap));

    // Sincronizar en platino_users_database si existe
    try {
      const storedUsers = localStorage.getItem("platino_users_database");
      if (storedUsers) {
        const usersList = JSON.parse(storedUsers);
        const idx = usersList.findIndex((u) => u.email.toLowerCase() === cleanEmail);
        if (idx >= 0) {
          usersList[idx].password = cleanPass;
          localStorage.setItem("platino_users_database", JSON.stringify(usersList));
        }
      }
    } catch {
      // ignore
    }

    // Actualizar array de ADMIN_ACCOUNTS en memoria
    const updatedAccounts = getAdminAccounts();
    ADMIN_ACCOUNTS.length = 0;
    ADMIN_ACCOUNTS.push(...updatedAccounts);

    // Disparar evento para actualizar en tiempo real AuthContext y demás componentes
    window.dispatchEvent(
      new CustomEvent("platino_admin_credentials_updated", {
        detail: { email: cleanEmail, newPassword: cleanPass },
      })
    );

    return { success: true, message: "Contraseña actualizada exitosamente." };
  } catch (e) {
    console.error("Error al actualizar contraseña de administrador", e);
    return { success: false, error: "Error al guardar en almacenamiento local." };
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

// Solicitudes de ejemplo iniciales para que Vladimir tenga interacción inmediata
const INITIAL_REQUESTS = [
  {
    id: "req-17912001",
    userEmail: "admin.lima@platino.pe",
    userName: "Admin Sede Lima Centro",
    userSede: "lima-centro",
    userSedeLabel: "Sede Lima Centro",
    permissionKey: "finanzas",
    permissionName: "Control de Pagos & Pedidos",
    reason: "Necesito validar en tiempo real los pagos recibidos por Yape y Datáfono de los clientes que compran en el local de Lima Centro.",
    status: "pendiente", // 'pendiente' | 'aprobado' | 'rechazado'
    createdAt: "2026-10-04T15:30:00.000Z",
    resolvedAt: null,
    resolvedBy: null,
  },
  {
    id: "req-17912002",
    userEmail: "admin.miraflores@platino.pe",
    userName: "Admin Sede Miraflores",
    userSede: "miraflores",
    userSedeLabel: "Sede Miraflores",
    permissionKey: "inventario_global",
    permissionName: "Inventario General & Bodega",
    reason: "Solicito autorización para consultar y solicitar traslados de stock desde la Bodega Central hacia la vitrina de Miraflores.",
    status: "pendiente",
    createdAt: "2026-10-04T18:15:00.000Z",
    resolvedAt: null,
    resolvedBy: null,
  },
];

// Obtener la matriz de permisos activa
export const getPermissionsMatrix = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PERMISSIONS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_PERMISSIONS, JSON.stringify(DEFAULT_USER_PERMISSIONS));
      return { ...DEFAULT_USER_PERMISSIONS };
    }
    const parsed = JSON.parse(stored);
    // Asegurar que Vladimir siempre tenga todos los permisos
    parsed["vladimiryt18@gmail.com"] = PERMISSIONS_CATALOG.map((p) => p.key);
    ADMIN_ACCOUNTS.forEach((acc) => {
      if (!Array.isArray(parsed[acc.email])) {
        parsed[acc.email] = DEFAULT_USER_PERMISSIONS[acc.email] || [];
      }
    });
    return parsed;
  } catch {
    return { ...DEFAULT_USER_PERMISSIONS };
  }
};

// Guardar la matriz de permisos
export const savePermissionsMatrix = (matrix) => {
  try {
    // Proteger permisos de Vladimir
    matrix["vladimiryt18@gmail.com"] = PERMISSIONS_CATALOG.map((p) => p.key);
    localStorage.setItem(STORAGE_KEY_PERMISSIONS, JSON.stringify(matrix));
    window.dispatchEvent(new CustomEvent("platino_permissions_updated", { detail: matrix }));
    return true;
  } catch (e) {
    console.error("Error saving permissions matrix", e);
    return false;
  }
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
  try {
    const stored = localStorage.getItem(STORAGE_KEY_REQUESTS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(INITIAL_REQUESTS));
      return [...INITIAL_REQUESTS];
    }
    return JSON.parse(stored);
  } catch {
    return [...INITIAL_REQUESTS];
  }
};

// Guardar solicitudes
export const savePermissionRequests = (requests) => {
  try {
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
    window.dispatchEvent(new CustomEvent("platino_permission_requests_updated", { detail: requests }));
    return true;
  } catch (e) {
    console.error("Error saving permission requests", e);
    return false;
  }
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
  savePermissionRequests(updated);
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

  savePermissionRequests(requests);
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

  savePermissionRequests(requests);
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
const STORAGE_KEY_DAILY_CODE_SEED = "platino_daily_recovery_seed_v1";
const STORAGE_KEY_RECOVERY_LOGS = "platino_password_recovery_logs_v1";

// Obtener fecha local en formato YYYY-MM-DD
export const getTodayDateKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Generar código determinístico de 6 dígitos basado en la fecha del día + semilla opcional del día
export const getDailyAdminRecoveryCodeInfo = () => {
  const todayKey = getTodayDateKey();
  let customSalt = 0;

  try {
    const stored = localStorage.getItem(STORAGE_KEY_DAILY_CODE_SEED);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Solo aplica si corresponde exactamente a la fecha de HOY; al cambiar de día se reinicia solo
      if (parsed && parsed.dateKey === todayKey && typeof parsed.salt === "number") {
        customSalt = parsed.salt;
      }
    }
  } catch {
    // ignore
  }

  const seedStr = `PLATINO-VLADIMIR-${todayKey}-SALT-${customSalt}`;
  let hash = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    hash ^= seedStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const positiveNum = Math.abs(hash);
  const sixDigits = String(100000 + (positiveNum % 900000));

  const [y, m, d] = todayKey.split("-");
  const formattedDate = `${d}/${m}/${y}`;

  return {
    code: sixDigits, // Ej: "482916"
    formattedCode: `PLT-${sixDigits}`, // Ej: "PLT-482916"
    dateKey: todayKey,
    formattedDate,
    rotationCountToday: customSalt,
  };
};

// Validar si un código ingresado por el cliente coincide con la clave diaria vigente de Vladimir
export const validateDailyAdminRecoveryCode = (inputCode) => {
  if (!inputCode) return false;
  const cleanInput = String(inputCode)
    .trim()
    .toUpperCase()
    .replace(/^PLT[-\s]?/, "")
    .replace(/\s+/g, "");
  const { code } = getDailyAdminRecoveryCodeInfo();
  return cleanInput === code;
};

// Permitir a Vladimir regenerar/rotar manualmente la clave del día si lo desea (además del cambio diario automático)
export const rotateDailyAdminRecoveryCode = () => {
  const todayKey = getTodayDateKey();
  let nextSalt = 1;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_DAILY_CODE_SEED);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.dateKey === todayKey && typeof parsed.salt === "number") {
        nextSalt = parsed.salt + 1;
      }
    }
    localStorage.setItem(
      STORAGE_KEY_DAILY_CODE_SEED,
      JSON.stringify({ dateKey: todayKey, salt: nextSalt })
    );
  } catch {
    // ignore
  }
  const info = getDailyAdminRecoveryCodeInfo();
  window.dispatchEvent(new CustomEvent("platino_daily_code_updated", { detail: info }));
  return info;
};

// Obtener historial de validaciones y cambios de contraseña realizados con el código diario
export const getPasswordRecoveryLogs = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_RECOVERY_LOGS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Registrar un evento de recuperación de contraseña exitosa
export const addPasswordRecoveryLog = ({ userDni, userName, userEmail, usedCode }) => {
  try {
    const current = getPasswordRecoveryLogs();
    const entry = {
      id: `rec-${Date.now()}`,
      userDni: userDni || "No registrado",
      userName: userName || "Cliente",
      userEmail: userEmail || "",
      usedCode: usedCode || getDailyAdminRecoveryCodeInfo().code,
      dateKey: getTodayDateKey(),
      timestamp: new Date().toISOString(),
    };
    const updated = [entry, ...current].slice(0, 50);
    localStorage.setItem(STORAGE_KEY_RECOVERY_LOGS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("platino_daily_code_updated", { detail: updated }));
    return entry;
  } catch {
    return null;
  }
};

