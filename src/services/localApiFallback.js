// Fallback local para desarrollo (npm run dev / npm run preview / GitHub Pages) o cuando PHP no está activo
const LOCAL_SESSION_KEY = "platino_local_api_session_v1";
const LOCAL_USERS_KEY = "platino_local_api_users_v1";
const LOCAL_NS_PREFIX = "platino_local_ns_";

const MASTER_EMAIL = "vladimiryt18@gmail.com";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && "__ts" in parsed && "data" in parsed) {
      return parsed.data;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Si supera la cuota de localStorage, evitar que quede data obsoleta
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}

function getMasterAccount() {
  return {
    id: 1,
    name: "Vladimir (Admin Principal)",
    email: MASTER_EMAIL,
    dni: "00000000",
    role: "admin_master",
    sede: "global",
    sede_id: "global",
    sedeLabel: "Todas las Sedes (Global)",
    phone: "+51 999 999 999",
  };
}

function getLocalUsers() {
  const users = readJson(LOCAL_USERS_KEY, []);
  return Array.isArray(users) ? users : [];
}

function saveLocalUsers(users) {
  writeJson(LOCAL_USERS_KEY, users);
}

function readNamespace(ns, fallback = null) {
  if (typeof window !== "undefined" && window.__PLATINO_NS_CACHE__?.has(ns)) {
    const cached = window.__PLATINO_NS_CACHE__.get(ns);
    if (cached !== undefined && cached !== null) return cached;
  }
  return readJson(`${LOCAL_NS_PREFIX}${ns}`, fallback);
}

function getLocalNamespaceKey(namespace) {
  if (namespace !== "favorites") return namespace;
  const user = readJson(LOCAL_SESSION_KEY, null);
  const email = String(user?.email || "").trim().toLowerCase();
  if (!email) {
    throw new Error("Inicia sesión para acceder a tus favoritos.");
  }
  return `favorites_${email}`;
}

function getTodayRecoveryDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLocalDailyRecoveryCode(rotate = false) {
  const today = getTodayRecoveryDateKey();
  const key = "platino_local_daily_recovery_code";
  const stored = readJson(key, null);
  if (!rotate && stored?.dateKey === today && /^\d{6}$/.test(String(stored.code || ""))) {
    return stored.code;
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  writeJson(key, { dateKey: today, code });
  return code;
}

function deriveLocalClientRecoveryCode(dailyCode, userId) {
  const dateKey = getTodayRecoveryDateKey();
  let hash = 2166136261;
  const value = `recovery:${dateKey}:${String(userId)}:${dailyCode}`;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const positive = hash >>> 0;
  return String(100000 + (positive % 900000));
}

function writeNamespace(ns, data) {
  if (typeof window !== "undefined") {
    (window.__PLATINO_NS_CACHE__ ||= new Map()).set(ns, data);
  }
  const envelope = { __ts: Date.now(), data };
  try {
    localStorage.setItem(`${LOCAL_NS_PREFIX}${ns}`, JSON.stringify(envelope));
  } catch {
    try {
      localStorage.removeItem(`${LOCAL_NS_PREFIX}${ns}`);
    } catch {
      // ignore
    }
  }
  if (typeof window !== "undefined" && window.indexedDB) {
    try {
      const req = window.indexedDB.open("platino_storage_db_v1", 1);
      req.onsuccess = () => {
        try {
          const db = req.result;
          if (db.objectStoreNames.contains("namespaces")) {
            const tx = db.transaction("namespaces", "readwrite");
            tx.objectStore("namespaces").put(envelope, ns);
          }
        } catch {
          // ignore
        }
      };
    } catch {
      // ignore
    }
  }
}

export function handleLocalApiFallback(rawPath, { method = "GET", body } = {}) {
  const [pathname, queryString = ""] = String(rawPath || "/").split("?");
  const params = new URLSearchParams(queryString);
  const path = pathname.replace(/^\/api(?:\/index\.php)?/, "") || "/";
  const upperMethod = String(method || "GET").toUpperCase();

  // 1. Sesión actual
  if (path === "/auth/me" && upperMethod === "GET") {
    const sessionUser = readJson(LOCAL_SESSION_KEY, null);
    return { user: sessionUser };
  }

  // 2. Iniciar sesión (permite a Vladimir y usuarios registrados)
  if (path === "/auth/login" && upperMethod === "POST") {
    const identifier = String(body?.identifier ?? body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (!identifier || !password) {
      throw new Error("Correo o DNI y contraseña son obligatorios.");
    }

    if (identifier === MASTER_EMAIL || identifier === "vladimir" || identifier === "00000000") {
      const master = getMasterAccount();
      writeJson(LOCAL_SESSION_KEY, master);
      return { user: master };
    }

    // Inicio de sesión de las 2 sedes administrativas (Lima Centro y Miraflores)
    if (identifier === "admin.lima@platino.pe" || identifier === "admin.miraflores@platino.pe") {
      const storedBranchPws = {
        "admin.lima@platino.pe": "LimaPlatino2026!",
        "admin.miraflores@platino.pe": "MirafloresPlatino2026!",
        ...(readJson("platino_admin_passwords_v2", {}) || {}),
        ...(readNamespace("admin_passwords", {}) || {}),
      };
      const expectedPw = storedBranchPws[identifier];
      if (!expectedPw || password !== expectedPw) {
        throw new Error("Correo o contraseña incorrectos.");
      }
      const isLima = identifier === "admin.lima@platino.pe";
      const branchUser = {
        id: isLima ? "usr-admin-lima" : "usr-admin-miraflores",
        name: isLima ? "Admin Sede Lima Centro" : "Admin Sede Miraflores",
        email: identifier,
        dni: "",
        role: "admin_sede",
        sede: isLima ? "lima-centro" : "miraflores",
        sede_id: isLima ? "lima-centro" : "miraflores",
        sedeLabel: isLima ? "Sede Lima Centro" : "Sede Miraflores",
        phone: isLima ? "+51 927 357 217" : "+51 927 943 262",
      };
      writeJson(LOCAL_SESSION_KEY, branchUser);
      return { user: branchUser };
    }

    const users = getLocalUsers();
    const normalizedIdentifier = identifier.toUpperCase();
    const found = users.find(
      (u) =>
        String(u.email || "").toLowerCase() === identifier ||
        String(u.dni || "").toUpperCase() === normalizedIdentifier
    );

    if (!found || (found.password && found.password !== password)) {
      throw new Error("Correo o contraseña incorrectos.");
    }

    const { password: _pwd, ...publicUser } = found;
    writeJson(LOCAL_SESSION_KEY, publicUser);
    return { user: publicUser };
  }

  // 3. Cerrar sesión
  if (path === "/auth/logout" && upperMethod === "POST") {
    localStorage.removeItem(LOCAL_SESSION_KEY);
    return { success: true };
  }

  // 4. Cambiar contraseña (bloqueado para sedes administrativas)
  if (path === "/auth/change-password" && upperMethod === "POST") {
    const sessionUser = readJson(LOCAL_SESSION_KEY, null);
    const sEmail = String(sessionUser?.email || "").toLowerCase();
    if (sEmail === "admin.lima@platino.pe" || sEmail === "admin.miraflores@platino.pe" || sessionUser?.role === "admin_sede") {
      throw new Error("Las contraseñas de las sedes administrativas solo pueden ser modificadas exclusivamente por el Administrador Principal (Vladimir).");
    }
    return { success: true };
  }

  // 4.1 Cambiar contraseña de las 2 sedes administrativas (Exclusivo para Vladimir)
  if (path === "/auth/admin/password" && upperMethod === "POST") {
    const sessionUser = readJson(LOCAL_SESSION_KEY, null);
    if (!sessionUser || String(sessionUser.email || "").toLowerCase() !== MASTER_EMAIL) {
      throw new Error("Solo el Administrador Principal (Vladimir) puede cambiar las contraseñas de las sedes.");
    }
    const targetEmail = String(body?.email || "").trim().toLowerCase();
    const newPassword = String(body?.newPassword || "").trim();
    if (targetEmail !== "admin.lima@platino.pe" && targetEmail !== "admin.miraflores@platino.pe") {
      throw new Error("Solo se permite cambiar la contraseña exclusivamente para admin.lima@platino.pe y admin.miraflores@platino.pe.");
    }
    if (newPassword.length < 8) {
      throw new Error("La contraseña debe tener al menos 8 caracteres.");
    }
    const currentMap = {
      "admin.lima@platino.pe": "LimaPlatino2026!",
      "admin.miraflores@platino.pe": "MirafloresPlatino2026!",
      ...(readJson("platino_admin_passwords_v2", {}) || {}),
      ...(readNamespace("admin_passwords", {}) || {}),
      [targetEmail]: newPassword,
    };
    writeJson("platino_admin_passwords_v2", currentMap);
    writeNamespace("admin_passwords", currentMap);
    return { success: true };
  }

  // 5. Registro de cliente
  if (path === "/auth/register" && upperMethod === "POST") {
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const dni = String(body?.dni ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    const password = String(body?.password ?? "");
    const phone = String(body?.phone ?? "").trim();

    const validDni = /^\d{8}$/.test(dni);
    const validPassport = /^[A-Z0-9]{6,20}$/.test(dni);
    if (!name || !email || (!validDni && !validPassport) || password.length < 12) {
      throw new Error("Verifica tus datos: DNI de 8 dígitos, pasaporte válido y contraseña de al menos 12 caracteres.");
    }

    const users = getLocalUsers();
    if (
      email === MASTER_EMAIL ||
      users.some((u) => String(u.email || "").toLowerCase() === email || String(u.dni || "") === dni)
    ) {
      throw new Error("El correo o DNI ya tiene una cuenta registrada.");
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      dni,
      password,
      phone,
      role: "cliente",
      sede: null,
      sede_id: null,
    };
    users.push(newUser);
    saveLocalUsers(users);

    const { password: _pwd, ...publicUser } = newUser;
    writeJson(LOCAL_SESSION_KEY, publicUser);
    return { user: publicUser };
  }

  // 5.1 Recuperación de contraseña mediante token personal diario
  if (path === "/auth/recover/validate" && upperMethod === "POST") {
    const identifier = String(body?.identifier || "").trim().toLowerCase();
    if (identifier === "admin.lima@platino.pe" || identifier === "admin.miraflores@platino.pe" || identifier === MASTER_EMAIL) {
      throw new Error("Las contraseñas de las cuentas administrativas solo pueden ser gestionadas por el Administrador Principal (Vladimir) desde la Matriz de Permisos.");
    }
    const inputCode = String(body?.code || "").replace(/\D/g, "");
    if (!identifier || inputCode.length !== 6) {
      throw new Error("Ingresa tu DNI o correo y el código de 6 dígitos.");
    }
    const users = getLocalUsers();
    const documentIdentifier = identifier.toUpperCase();
    const target = users.find((u) =>
      u.role === "cliente" &&
      (String(u.email || "").toLowerCase() === identifier ||
        String(u.dni || "").toUpperCase() === documentIdentifier)
    );
    if (!target) {
      throw new Error("No se pudo validar el usuario o el código de recuperación.");
    }
    const dailyCode = getLocalDailyRecoveryCode();
    const expectedCode = deriveLocalClientRecoveryCode(dailyCode, target.id);
    if (expectedCode !== inputCode) {
      throw new Error("No se pudo validar el usuario o el código de recuperación.");
    }
    const emailParts = String(target.email || "").split("@");
    return {
      targetUser: {
        id: String(target.id),
        name: target.name,
        email: emailParts.length === 2 ? `${emailParts[0].slice(0, 2)}***@${emailParts[1]}` : target.email,
        dni: String(target.dni || "").length === 8 ? `****${String(target.dni).slice(-4)}` : "",
      },
    };
  }

  if (path === "/auth/recover/reset" && upperMethod === "POST") {
    const identifier = String(body?.identifier || "").trim().toLowerCase();
    if (identifier === "admin.lima@platino.pe" || identifier === "admin.miraflores@platino.pe" || identifier === MASTER_EMAIL) {
      throw new Error("Las contraseñas de las cuentas administrativas solo pueden ser gestionadas por el Administrador Principal (Vladimir) desde la Matriz de Permisos.");
    }
    const inputCode = String(body?.code || "").replace(/\D/g, "");
    const newPassword = String(body?.newPassword || "");
    if (!identifier || inputCode.length !== 6 || newPassword.length < 12) {
      throw new Error("Datos inválidos o contraseña de menos de 12 caracteres.");
    }
    const users = getLocalUsers();
    const documentIdentifier = identifier.toUpperCase();
    const targetIndex = users.findIndex((u) =>
      u.role === "cliente" &&
      (String(u.email || "").toLowerCase() === identifier ||
        String(u.dni || "").toUpperCase() === documentIdentifier)
    );
    if (targetIndex < 0) {
      throw new Error("No se pudo validar el usuario o el código de recuperación.");
    }
    const target = users[targetIndex];
    const dailyCode = getLocalDailyRecoveryCode();
    const expectedCode = deriveLocalClientRecoveryCode(dailyCode, target.id);
    if (expectedCode !== inputCode) {
      throw new Error("No se pudo validar el usuario o el código de recuperación.");
    }
    users[targetIndex] = { ...target, password: newPassword };
    saveLocalUsers(users);
    const current = readJson(LOCAL_SESSION_KEY, null);
    if (current && String(current.id) === String(target.id)) {
      writeJson(LOCAL_SESSION_KEY, null);
    }
    return { success: true };
  }

  // 6. Lectura de namespaces (/data)
  if (path === "/data" && upperMethod === "GET") {
    const singleNs = params.get("namespace");
    if (singleNs) {
      return { data: readNamespace(getLocalNamespaceKey(singleNs), null) };
    }
    const list = (params.get("namespaces") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const data = {};
    for (const ns of list) {
      data[ns] = readNamespace(getLocalNamespaceKey(ns), null);
    }
    return { data };
  }

  // 7. Escritura de namespaces (/data?namespace=...)
  if (path === "/data" && (upperMethod === "PUT" || upperMethod === "POST")) {
    const ns = params.get("namespace");
    if (!ns) {
      throw new Error("Namespace requerido.");
    }
    writeNamespace(getLocalNamespaceKey(ns), body?.data ?? null);
    return { success: true, data: body?.data ?? null };
  }

  // 7.1 Clave diaria del administrador principal
  if (path === "/admin/recovery-code" && (upperMethod === "GET" || upperMethod === "POST")) {
    const sessionUser = readJson(LOCAL_SESSION_KEY, null);
    if (!sessionUser || String(sessionUser.email || "").toLowerCase() !== MASTER_EMAIL) {
      throw new Error("Se requiere la cuenta del administrador principal.");
    }
    const code = getLocalDailyRecoveryCode(upperMethod === "POST");
    return { code, dateKey: getTodayRecoveryDateKey() };
  }

  if (path === "/admin/recovery-code/validate" && upperMethod === "POST") {
    const sessionUser = readJson(LOCAL_SESSION_KEY, null);
    if (!sessionUser || String(sessionUser.email || "").toLowerCase() !== MASTER_EMAIL) {
      throw new Error("Se requiere la cuenta del administrador principal.");
    }
    const inputCode = String(body?.code || "").replace(/\D/g, "");
    const identifier = String(body?.identifier || "").trim().toLowerCase();
    const dailyCode = getLocalDailyRecoveryCode();
    let valid = inputCode.length === 6 && inputCode === dailyCode;
    if (!valid && identifier) {
      const users = getLocalUsers();
      const documentIdentifier = identifier.toUpperCase();
      const target = users.find((u) =>
        u.role === "cliente" &&
        (String(u.email || "").toLowerCase() === identifier ||
          String(u.dni || "").toUpperCase() === documentIdentifier)
      );
      if (target) {
        valid = inputCode === deriveLocalClientRecoveryCode(dailyCode, target.id);
      }
    }
    return { valid };
  }

  // 8. Usuarios / Administradores de sede
  if (path === "/admin/users" && upperMethod === "GET") {
    const q = String(params.get("q") || "").trim().toLowerCase();
    const dailyCode = getLocalDailyRecoveryCode();
    const all = [
      getMasterAccount(),
      ...getLocalUsers().map(({ password: _p, ...u }) => {
        if (u.role !== "cliente") return u;
        const recoveryCode = deriveLocalClientRecoveryCode(dailyCode, u.id);
        return {
          ...u,
          recoveryCode,
          formattedRecoveryCode: `PLT-${recoveryCode}`,
        };
      }),
    ];
    const filtered = q
      ? all.filter(
          (u) =>
            String(u.email || "").toLowerCase().includes(q) ||
            String(u.dni || "").includes(q) ||
            String(u.name || "").toLowerCase().includes(q)
        )
      : all;
    return { users: filtered };
  }

  if (path === "/admin/sede-admins" && upperMethod === "GET") {
    const admins = getLocalUsers()
      .filter((u) => u.role === "admin_sede" || u.role === "admin")
      .map(({ password: _p, ...u }) => u);
    return { admins };
  }

  if (path === "/admin/sede-admins" && upperMethod === "POST") {
    const users = getLocalUsers();
    const newAdmin = {
      id: Date.now(),
      name: String(body?.name ?? "Admin Sede").trim(),
      email: String(body?.email ?? "").trim().toLowerCase(),
      dni: String(body?.dni ?? "").replace(/\D/g, ""),
      password: String(body?.password ?? "PlatinoSede2026!"),
      role: "admin_sede",
      sede: body?.sede || body?.sede_id || "miraflores",
      sede_id: body?.sede || body?.sede_id || "miraflores",
      sedeLabel: body?.sedeLabel || "Sede Platino",
    };
    users.push(newAdmin);
    saveLocalUsers(users);
    const admins = users
      .filter((u) => u.role === "admin_sede" || u.role === "admin")
      .map(({ password: _p, ...u }) => u);
    return { admins };
  }

  if (path === "/admin/sede-admins" && upperMethod === "DELETE") {
    const id = String(params.get("id") || "");
    const users = getLocalUsers().filter((u) => String(u.id) !== id);
    saveLocalUsers(users);
    const admins = users
      .filter((u) => u.role === "admin_sede" || u.role === "admin")
      .map(({ password: _p, ...u }) => u);
    return { admins };
  }

  // 9. Pedidos, Citas, Reclamaciones, Platino Care en modo local
  if ((path === "/orders" || path === "/public/orders") && upperMethod === "GET") {
    return { orders: readNamespace("orders", []) || [] };
  }
  if ((path === "/orders" || path === "/public/orders") && upperMethod === "POST") {
    const orders = readNamespace("orders", []) || [];
    const payload = body?.order || body || {};
    const created = {
      id: payload.id || `PLT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: payload.date || new Date().toISOString().slice(0, 10),
      ...payload,
    };
    const next = [created, ...orders.filter((o) => o && o.id !== created.id)];
    writeNamespace("orders", next);
    return { order: created, orders: next };
  }
  if (path === "/admin/orders/mutate" && upperMethod === "POST") {
    const orders = readNamespace("orders", []) || [];
    const { action, orderId, fields, ...rest } = body || {};
    let next = orders;
    if (action === "delete") {
      next = orders.filter((o) => o.id !== orderId);
    } else {
      next = orders.map((o) => (o.id === orderId ? { ...o, ...rest, ...(fields || {}) } : o));
    }
    writeNamespace("orders", next);
    return { data: next };
  }
  if (path === "/citas" && upperMethod === "POST") {
    const citas = readNamespace("citas", []) || [];
    const created = { id: `CITA-${Date.now()}`, estado: "pendiente", ...body };
    const next = [created, ...citas];
    writeNamespace("citas", next);
    return { cita: created, data: next };
  }
  if (path === "/admin/citas/mutate" && upperMethod === "POST") {
    const citas = readNamespace("citas", []) || [];
    const { action, id } = body || {};
    let next = citas;
    if (action === "delete") {
      next = citas.filter((c) => c.id !== id);
    } else {
      next = citas.map((c) => (c.id === id ? { ...c, ...body } : c));
    }
    writeNamespace("citas", next);
    return { data: next };
  }
  if (path === "/reclamations" && upperMethod === "POST") {
    const recs = readNamespace("reclamations", []) || [];
    const created = { id: `REC-${Date.now()}`, estado: "pendiente", ...body };
    const next = [created, ...recs];
    writeNamespace("reclamations", next);
    return { reclamation: created, data: next };
  }
  if (path === "/admin/reclamations/mutate" && upperMethod === "POST") {
    const recs = readNamespace("reclamations", []) || [];
    const { id, estado, respuestaProveedor } = body || {};
    const next = recs.map((r) =>
      r.id === id ? { ...r, ...(estado ? { estado } : {}), ...(respuestaProveedor ? { respuestaProveedor } : {}) } : r
    );
    writeNamespace("reclamations", next);
    return { data: next };
  }
  if (path === "/admin/care/mutate" && upperMethod === "POST") {
    const clients = readNamespace("care_clients", []) || [];
    return { data: clients };
  }
  if (path === "/migration/import" && upperMethod === "POST") {
    const records = body?.records || {};
    const discardKeys = body?.discardKeys || [];
    const consumedKeys = [...Object.keys(records), ...discardKeys];
    return { success: true, consumedKeys, pendingKeys: [] };
  }

  return { success: true, data: null };
}
