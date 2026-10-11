import { useState, useEffect } from "react";
import { AuthContext } from "./authContextDef";
import {
  ADMIN_ACCOUNTS,
  getAdminAccounts,
  isMasterAdmin as checkMasterAdmin,
  validateDailyAdminRecoveryCode,
  addPasswordRecoveryLog,
  updateAdminPassword,
} from "../services/permissionsService";

const STORAGE_KEY_USER = "platino_auth_user";
const STORAGE_KEY_USERS_DB = "platino_users_database";

// Cuentas pre-configuradas de fábrica: 3 Administradores (Vladimir + Lima + Miraflores) + Cliente
const DEFAULT_USERS = [
  ...getAdminAccounts(),
  {
    id: "usr-cliente-1",
    name: "Camila Mendoza",
    dni: "74829103",
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
      // Si es un cliente, asegurarnos de que nunca tenga una sede asignada
      if (parsed.role !== "admin") {
        return {
          ...parsed,
          dni: parsed.dni || (parsed.email?.toLowerCase() === "cliente@platino.pe" ? "74829103" : ""),
          role: "cliente",
          adminType: null,
          sede: null,
          sedeLabel: null,
          avatarBadge: null,
          title: "Cliente Platino",
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

      // Limpiar cualquier sede en cuentas de clientes existentes y asegurar DNI de cuenta demo
      list = list.map((u) =>
        u.role !== "admin"
          ? {
              ...u,
              dni: u.dni || (u.email?.toLowerCase() === "cliente@platino.pe" ? "74829103" : ""),
              adminType: null,
              sede: null,
              sedeLabel: null,
            }
          : u
      );

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

  // Buscar usuario por DNI o Correo Electrónico
  const findUserByDniOrEmail = (identifier) => {
    if (!identifier) return null;
    const clean = String(identifier).trim().toLowerCase();
    const digitsOnly = clean.replace(/\D/g, "");
    return (
      usersDb.find(
        (u) =>
          (u.email && u.email.toLowerCase() === clean) ||
          (digitsOnly.length === 8 && u.dni && String(u.dni).trim() === digitsOnly)
      ) || null
    );
  };

  // Iniciar sesión (acepta Correo Electrónico o DNI de 8 dígitos)
  const login = (identifier, password) => {
    const cleanId = String(identifier || "").trim().toLowerCase();
    const digitsOnly = cleanId.replace(/\D/g, "");
    const foundUser = usersDb.find(
      (u) =>
        ((u.email && u.email.toLowerCase() === cleanId) ||
          (digitsOnly.length === 8 && u.dni && String(u.dni).trim() === digitsOnly)) &&
        u.password === password
    );

    if (foundUser) {
      const isUserAdmin = foundUser.role === "admin";
      const userEmailLower = (foundUser.email || "").toLowerCase();
      const safeUserData = isUserAdmin
        ? {
            id: foundUser.id,
            name: foundUser.name,
            email: foundUser.email,
            dni: foundUser.dni || null,
            role: "admin",
            adminType: foundUser.adminType || (userEmailLower === "vladimiryt18@gmail.com" ? "master" : "sede"),
            sede: foundUser.sede || (userEmailLower.includes("miraflores") ? "miraflores" : userEmailLower.includes("lima") ? "lima-centro" : "global"),
            sedeLabel: foundUser.sedeLabel || (foundUser.sede === "miraflores" ? "Sede Miraflores" : foundUser.sede === "lima-centro" ? "Sede Lima Centro" : "Todas las Sedes (Global)"),
            phone: foundUser.phone,
            avatarBadge: foundUser.avatarBadge || (userEmailLower === "vladimiryt18@gmail.com" ? "👑" : "🏛️"),
            title: foundUser.title || (userEmailLower === "vladimiryt18@gmail.com" ? "Super Administrador Principal" : "Administrador Sede"),
          }
        : {
            id: foundUser.id,
            name: foundUser.name,
            dni: foundUser.dni || "",
            email: foundUser.email,
            role: "cliente",
            adminType: null,
            sede: null,
            sedeLabel: null,
            phone: foundUser.phone,
            avatarBadge: null,
            title: "Cliente Platino",
          };
      setUser(safeUserData);
      closeAuthModal();
      return { success: true, user: safeUserData };
    }

    return {
      success: false,
      error: "DNI / Correo electrónico o contraseña incorrectos.",
    };
  };

  // Registrar nueva cuenta (DNI obligatorio y único: no puede repetirse dos veces en la página)
  const register = ({ name, dni, email, password, phone = "" }) => {
    const cleanDni = String(dni || "").replace(/\D/g, "").trim();
    if (!cleanDni || cleanDni.length !== 8) {
      return {
        success: false,
        code: "INVALID_DNI",
        error: "El DNI es obligatorio para registrarse y debe tener exactamente 8 dígitos numéricos.",
      };
    }

    // Validar que el DNI no se repita dos veces en la página
    const existingDniUser = usersDb.find(
      (u) => u.dni && String(u.dni).replace(/\D/g, "").trim() === cleanDni
    );
    if (existingDniUser) {
      return {
        success: false,
        code: "DNI_ALREADY_EXISTS",
        existingUser: {
          name: existingDniUser.name,
          email: existingDniUser.email,
          dni: existingDniUser.dni,
        },
        error: `El DNI ${cleanDni} ya se encuentra registrado en la página. Por favor ingresa tu contraseña para iniciar sesión, o solicita el código diario al Administrador si la olvidaste.`,
      };
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingEmailUser = usersDb.find((u) => u.email.toLowerCase() === cleanEmail);

    if (existingEmailUser) {
      return {
        success: false,
        code: "EMAIL_ALREADY_EXISTS",
        existingUser: {
          name: existingEmailUser.name,
          email: existingEmailUser.email,
          dni: existingEmailUser.dni || "",
        },
        error: "Ya existe una cuenta registrada con este correo electrónico. Por favor ingresa tu contraseña.",
      };
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      dni: cleanDni,
      email: cleanEmail,
      password,
      role: "cliente",
      adminType: null,
      sede: null,
      sedeLabel: null,
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
      dni: newUser.dni,
      email: newUser.email,
      role: "cliente",
      adminType: null,
      sede: null,
      sedeLabel: null,
      phone: newUser.phone,
      title: "Cliente Platino",
    };
    setUser(safeUserData);
    closeAuthModal();
    return { success: true, user: safeUserData };
  };

  // Paso 1 de recuperación: Validar DNI/Correo del cliente + Código Diario del Administrador
  const validateRecoveryCode = (identifier, inputCode) => {
    const foundUser = findUserByDniOrEmail(identifier);
    if (!foundUser) {
      return {
        success: false,
        error: "No existe ninguna cuenta registrada con ese DNI o correo electrónico.",
      };
    }

    if (!validateDailyAdminRecoveryCode(inputCode)) {
      return {
        success: false,
        error: "El código ingresado es incorrecto o no corresponde a la clave del día. Solicita el código vigente al Administrador Principal.",
      };
    }

    return {
      success: true,
      targetUser: {
        id: foundUser.id,
        name: foundUser.name,
        dni: foundUser.dni || "",
        email: foundUser.email,
      },
    };
  };

  // Paso 2 de recuperación: Guardar la nueva contraseña tras validar que coincida con su repetición
  const resetPasswordWithAdminCode = ({ identifier, inputCode, newPassword, confirmPassword }) => {
    const check = validateRecoveryCode(identifier, inputCode);
    if (!check.success) {
      return check;
    }

    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        error: "La nueva contraseña debe tener al menos 6 caracteres.",
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        success: false,
        error: "Las contraseñas ingresadas no coinciden. Verifica ambos campos.",
      };
    }

    const targetEmail = check.targetUser.email.toLowerCase();
    const updatedDb = usersDb.map((u) => {
      if (u.email.toLowerCase() === targetEmail) {
        return { ...u, password: newPassword };
      }
      return u;
    });

    setUsersDb(updatedDb);
    try {
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(updatedDb));
    } catch (e) {
      console.error("Error updating password in users DB", e);
    }

    // Si es una cuenta de administrador, sincronizar también en permissionsService
    const isAdminAcc = ADMIN_ACCOUNTS.some((a) => a.email.toLowerCase() === targetEmail);
    if (isAdminAcc) {
      updateAdminPassword(targetEmail, newPassword);
    }

    // Registrar en el historial de recuperaciones del Administrador Principal
    addPasswordRecoveryLog({
      userDni: check.targetUser.dni,
      userName: check.targetUser.name,
      userEmail: check.targetUser.email,
      usedCode: String(inputCode).trim().toUpperCase(),
    });

    return {
      success: true,
      user: check.targetUser,
    };
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
        usersDb,
        isAdmin: user?.role === "admin",
        isMasterAdmin: checkMasterAdmin(user),
        adminType: user?.role === "admin" ? (user?.adminType || (checkMasterAdmin(user) ? "master" : "sede")) : null,
        userSede: user?.role === "admin" ? (user?.sede || "global") : null,
        sedeLabel: user?.role === "admin" ? (user?.sedeLabel || "Todas las Sedes (Global)") : null,
        isAuthModalOpen,
        modalInitialView,
        setModalInitialView,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        findUserByDniOrEmail,
        validateRecoveryCode,
        resetPasswordWithAdminCode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;

