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
  return readJson(`${LOCAL_NS_PREFIX}${ns}`, fallback);
}

function writeNamespace(ns, data) {
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

    const users = getLocalUsers();
    const digits = identifier.replace(/\D/g, "");
    const found = users.find(
      (u) =>
        String(u.email || "").toLowerCase() === identifier ||
        (digits.length === 8 && String(u.dni || "") === digits)
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

  // 4. Cambiar contraseña
  if (path === "/auth/change-password" && upperMethod === "POST") {
    return { success: true };
  }

  // 5. Registro de cliente
  if (path === "/auth/register" && upperMethod === "POST") {
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const dni = String(body?.dni ?? "").replace(/\D/g, "");
    const password = String(body?.password ?? "");
    const phone = String(body?.phone ?? "").trim();

    if (!name || !email || dni.length !== 8 || password.length < 12) {
      throw new Error("Verifica tus datos: DNI de 8 dígitos y contraseña de al menos 12 caracteres.");
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

  // 6. Lectura de namespaces (/data)
  if (path === "/data" && upperMethod === "GET") {
    const singleNs = params.get("namespace");
    if (singleNs) {
      return { data: readNamespace(singleNs, null) };
    }
    const list = (params.get("namespaces") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const data = {};
    for (const ns of list) {
      data[ns] = readNamespace(ns, null);
    }
    return { data };
  }

  // 7. Escritura de namespaces (/data?namespace=...)
  if (path === "/data" && (upperMethod === "PUT" || upperMethod === "POST")) {
    const ns = params.get("namespace");
    if (!ns) {
      throw new Error("Namespace requerido.");
    }
    writeNamespace(ns, body?.data ?? null);
    return { success: true, data: body?.data ?? null };
  }

  // 8. Usuarios / Administradores de sede
  if (path === "/admin/users" && upperMethod === "GET") {
    const q = String(params.get("q") || "").trim().toLowerCase();
    const all = [getMasterAccount(), ...getLocalUsers().map(({ password: _p, ...u }) => u)];
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
  if (path === "/orders" && upperMethod === "GET") {
    return { orders: readNamespace("orders", []) || [] };
  }
  if (path === "/orders" && upperMethod === "POST") {
    const orders = readNamespace("orders", []) || [];
    const created = { id: `ORD-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10), ...body };
    const next = [created, ...orders];
    writeNamespace("orders", next);
    return { order: created, orders: next };
  }
  if (path === "/admin/orders/mutate" && upperMethod === "POST") {
    const orders = readNamespace("orders", []) || [];
    const { action, orderId } = body || {};
    let next = orders;
    if (action === "delete") {
      next = orders.filter((o) => o.id !== orderId);
    } else {
      next = orders.map((o) => (o.id === orderId ? { ...o, ...body, ...(body?.fields || {}) } : o));
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

  return { success: true, data: null };
}
