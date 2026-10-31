import { useCallback, useEffect, useState } from "react";
import { AuthContext } from "./authContextDef";
import { apiGet, apiPost } from "../services/apiClient";
import { isMasterAdmin as checkMasterAdmin } from "../services/permissionsService";

const LOCAL_SESSION_KEY = "platino_local_api_session_v1";

function readStoredSessionUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStoredSessionUser(account) {
  if (typeof window === "undefined") return;
  try {
    if (account) {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(account));
    } else {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
  } catch {
    // ignore
  }
}

function mapApiUser(user) {
  if (!user) return null;
  const master = user.role === "admin_master" || user.email?.toLowerCase() === "vladimiryt18@gmail.com";
  const isAdmin = master || user.role === "admin_sede" || user.role === "admin";
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    dni: user.dni || "",
    role: isAdmin ? "admin" : "cliente",
    adminType: master ? "master" : isAdmin ? "sede" : null,
    sede: master ? "global" : user.sede || user.sede_id || null,
    sedeLabel: master ? "Todas las Sedes (Global)" : user.sedeLabel || null,
    phone: user.phone || "",
    avatarBadge: master ? "👑" : isAdmin ? "🏛️" : null,
    title: master ? "Super Administrador Principal" : isAdmin ? "Administrador Sede" : "Cliente Platino",
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => mapApiUser(readStoredSessionUser()));
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [modalInitialView, setModalInitialView] = useState("login");

  useEffect(() => {
    let active = true;
    apiGet("/auth/me")
      .then((res) => {
        if (!active) return;
        if (res?.user) {
          saveStoredSessionUser(res.user);
          setUser(mapApiUser(res.user));
        } else {
          const fallbackUser = readStoredSessionUser();
          setUser(mapApiUser(fallbackUser));
        }
      })
      .catch((error) => {
        console.warn("Could not restore the server session:", error);
        if (active) {
          setUser(mapApiUser(readStoredSessionUser()));
        }
      })
      .finally(() => {
        if (active) setIsSessionReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const openAuthModal = (view = "login") => {
    setModalInitialView(view);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const login = async (identifier, password) => {
    try {
      const { user: account } = await apiPost("/auth/login", { identifier, password });
      saveStoredSessionUser(account);
      const mappedUser = mapApiUser(account);
      setUser(mappedUser);
      closeAuthModal();
      window.dispatchEvent(new CustomEvent("platino_authenticated"));
      return { success: true, user: mappedUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async ({ name, dni, email, password, phone = "" }) => {
    if (!dni || String(dni).replace(/\D/g, "").length !== 8) {
      return { success: false, code: "INVALID_DNI", error: "El DNI debe contener exactamente 8 dígitos." };
    }
    if (!password || password.length < 12) {
      return { success: false, error: "La contraseña debe tener al menos 12 caracteres." };
    }
    try {
      const { user: account } = await apiPost("/auth/register", {
        name: name.trim(),
        dni: String(dni).replace(/\D/g, ""),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
      });
      saveStoredSessionUser(account);
      const mappedUser = mapApiUser(account);
      setUser(mappedUser);
      closeAuthModal();
      window.dispatchEvent(new CustomEvent("platino_authenticated"));
      return { success: true, user: mappedUser };
    } catch (error) {
      return {
        success: false,
        code: error.message.includes("ya tiene una cuenta") ? "ACCOUNT_ALREADY_EXISTS" : "API_ERROR",
        error: error.message,
      };
    }
  };

  const findUserByDniOrEmail = useCallback(async (identifier) => {
    if (!identifier || !checkMasterAdmin(user)) return null;
    try {
      const { users } = await apiGet(`/admin/users?q=${encodeURIComponent(String(identifier).trim())}`);
      return users?.[0] || null;
    } catch (error) {
      console.error("Could not find account through the API:", error);
      return null;
    }
  }, [user]);

  const validateRecoveryCode = async (identifier, inputCode) => {
    try {
      const { targetUser } = await apiPost("/auth/recover/validate", {
        identifier,
        code: inputCode,
      });
      return { success: true, targetUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const resetPasswordWithAdminCode = async ({ identifier, inputCode, newPassword, confirmPassword }) => {
    if (newPassword !== confirmPassword) {
      return { success: false, error: "Las contraseñas ingresadas no coinciden." };
    }
    if (newPassword.length < 12) {
      return { success: false, error: "La nueva contraseña debe tener al menos 12 caracteres." };
    }
    try {
      await apiPost("/auth/recover/reset", { identifier, code: inputCode, newPassword });
      return { success: true, user: { email: identifier } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    saveStoredSessionUser(null);
    try {
      await apiPost("/auth/logout", {});
    } catch (error) {
      console.warn("Could not close the server session:", error);
    }
    setUser(null);
    window.dispatchEvent(new CustomEvent("platino_logged_out"));
  };

  const value = {
    user,
    usersDb: [],
    isSessionReady,
    isAdmin: user?.role === "admin",
    isMasterAdmin: checkMasterAdmin(user),
    adminType: user?.role === "admin" ? user.adminType : null,
    userSede: user?.role === "admin" ? user.sede : null,
    sedeLabel: user?.role === "admin" ? user.sedeLabel : null,
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
