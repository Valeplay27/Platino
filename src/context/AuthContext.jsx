import { useState, useEffect } from "react";
import { AuthContext } from "./authContextDef";
import { ADMIN_ACCOUNTS, getAdminAccounts, isMasterAdmin as checkMasterAdmin } from "../services/permissionsService";

const STORAGE_KEY_USER = "platino_auth_user";
const STORAGE_KEY_USERS_DB = "platino_users_database";

// Cuentas pre-configuradas de fábrica: 3 Administradores (Vladimir + Lima + Miraflores) + Cliente
const DEFAULT_USERS = [
  ...getAdminAccounts(),
  {
    id: "usr-cliente-1",
    name: "Camila Mendoza",
    email: "cliente@platino.pe",
    password: "platino2026",
    role: "cliente",
    phone: "+51 912 345 678",
    registeredAt: "2026-02-15",
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      // Sincronizar metadatos de las cuentas oficiales de admin si es necesario
      const adminList = getAdminAccounts();
      const matchingAdmin = adminList.find(
        (a) => a.email.toLowerCase() === parsed.email.toLowerCase()
      );
      if (matchingAdmin) {
        return {
          ...parsed,
          name: matchingAdmin.name,
          role: "admin",
          adminType: matchingAdmin.adminType,
          sede: matchingAdmin.sede,
          sedeLabel: matchingAdmin.sedeLabel,
          avatarBadge: matchingAdmin.avatarBadge,
          title: matchingAdmin.title,
        };
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [usersDb, setUsersDb] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USERS_DB);
      let list = stored ? JSON.parse(stored) : [...DEFAULT_USERS];

      // Asegurar que las 3 cuentas de administrador oficiales estén siempre presentes y con sus contraseñas actuales
      const currentAdmins = getAdminAccounts();
      currentAdmins.forEach((adminAcc) => {
        const idx = list.findIndex(
          (u) => u.email.toLowerCase() === adminAcc.email.toLowerCase()
        );
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...adminAcc };
        } else {
          list.push(adminAcc);
        }
      });

      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(list));
      return list;
    } catch {
      return DEFAULT_USERS;
    }
  });

  // Sincronizar contraseñas actualizadas por Vladimir en tiempo real
  useEffect(() => {
    const handleCredentialsUpdated = () => {
      const currentAdmins = getAdminAccounts();
      setUsersDb((prev) => {
        const nextList = [...prev];
        currentAdmins.forEach((adminAcc) => {
          const idx = nextList.findIndex(
            (u) => u.email.toLowerCase() === adminAcc.email.toLowerCase()
          );
          if (idx >= 0) {
            nextList[idx] = { ...nextList[idx], password: adminAcc.password };
          }
        });
        localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(nextList));
        return nextList;
      });
    };

    window.addEventListener("platino_admin_credentials_updated", handleCredentialsUpdated);
    return () => {
      window.removeEventListener("platino_admin_credentials_updated", handleCredentialsUpdated);
    };
  }, []);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [modalInitialView, setModalInitialView] = useState("login"); // 'login' | 'register' | 'forgot'

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [user]);

  const openAuthModal = (view = "login") => {
    setModalInitialView(view);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Iniciar sesión
  const login = (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const foundUser = usersDb.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === password
    );

    if (foundUser) {
      const safeUserData = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        adminType: foundUser.adminType || (cleanEmail === "vladimiryt18@gmail.com" ? "master" : "sede"),
        sede: foundUser.sede || (cleanEmail.includes("miraflores") ? "miraflores" : cleanEmail.includes("lima") ? "lima-centro" : "global"),
        sedeLabel: foundUser.sedeLabel || (foundUser.sede === "miraflores" ? "Sede Miraflores" : foundUser.sede === "lima-centro" ? "Sede Lima Centro" : "Todas las Sedes (Global)"),
        phone: foundUser.phone,
        avatarBadge: foundUser.avatarBadge || (cleanEmail === "vladimiryt18@gmail.com" ? "👑" : "🏛️"),
        title: foundUser.title || (cleanEmail === "vladimiryt18@gmail.com" ? "Super Administrador Principal" : "Administrador Sede"),
      };
      setUser(safeUserData);
      closeAuthModal();
      return { success: true, user: safeUserData };
    }

    return {
      success: false,
      error: "Correo electrónico o contraseña incorrectos.",
    };
  };

  // Registrar nueva cuenta
  const register = ({ name, email, password, phone = "", role = "cliente" }) => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = usersDb.find((u) => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      return {
        success: false,
        error: "Ya existe una cuenta registrada con este correo electrónico.",
      };
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password,
      role,
      adminType: role === "admin" ? "sede" : "cliente",
      sede: "lima-centro",
      sedeLabel: "Sede Lima Centro",
      phone: phone.trim(),
      registeredAt: new Date().toISOString(),
    };

    const updatedDb = [...usersDb, newUser];
    setUsersDb(updatedDb);
    try {
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(updatedDb));
    } catch (e) {
      console.error("Error saving users DB", e);
    }

    const safeUserData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      adminType: newUser.adminType,
      sede: newUser.sede,
      sedeLabel: newUser.sedeLabel,
      phone: newUser.phone,
    };
    setUser(safeUserData);
    closeAuthModal();
    return { success: true, user: safeUserData };
  };

  // Cerrar sesión
  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_USER);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === "admin",
        isMasterAdmin: checkMasterAdmin(user),
        adminType: user?.adminType || (checkMasterAdmin(user) ? "master" : "sede"),
        userSede: user?.sede || "global",
        sedeLabel: user?.sedeLabel || "Todas las Sedes (Global)",
        isAuthModalOpen,
        modalInitialView,
        setModalInitialView,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
