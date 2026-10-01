import { useState, useEffect } from "react";
import { AuthContext } from "./authContextDef";

const STORAGE_KEY_USER = "platino_auth_user";
const STORAGE_KEY_USERS_DB = "platino_users_database";

// Cuentas pre-configuradas de fábrica
const DEFAULT_USERS = [
  {
    id: "usr-admin-vladimir",
    name: "Vladimir",
    email: "vladimiryt18@gmail.com",
    password: "Pumita30****",
    role: "admin",
    phone: "+51 927 357 217",
    registeredAt: "2026-01-01",
  },
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
      // Actualizar si tenía el admin previo
      if (parsed.role === "admin" && parsed.email !== "vladimiryt18@gmail.com") {
        return {
          id: "usr-admin-vladimir",
          name: "Vladimir",
          email: "vladimiryt18@gmail.com",
          role: "admin",
          phone: "+51 927 357 217",
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
      const adminIndex = list.findIndex(
        (u) => u.email.toLowerCase() === "vladimiryt18@gmail.com"
      );
      if (adminIndex >= 0) {
        list[adminIndex].password = "Pumita30****";
        list[adminIndex].role = "admin";
        list[adminIndex].name = "Vladimir";
      } else {
        list.push(DEFAULT_USERS[0]);
      }
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(list));
      return list;
    } catch {
      return DEFAULT_USERS;
    }
  });

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
        phone: foundUser.phone,
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
