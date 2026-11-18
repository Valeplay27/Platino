// src/services/clientProfileService.js
import { getRemoteData, setRemoteData } from "./remoteData";

const LOCAL_SESSION_KEY = "platino_local_api_session_v1";
const LOCAL_USERS_KEY = "platino_local_api_users_v1";
const PROFILES_STORAGE_KEY = "platino_client_profiles_v1";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function readAllProfilesMap() {
  if (typeof window === "undefined") return {};
  const remote = getRemoteData("client_profiles", null);
  if (remote && typeof remote === "object" && !Array.isArray(remote)) {
    return remote;
  }
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAllProfilesMap(map) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore quota errors
  }
  setRemoteData("client_profiles", map, "platino_profile_updated");
}

export function getClientProfile(user) {
  const email = normalizeEmail(user?.email);
  if (!email) {
    return {
      name: user?.name || "",
      email: "",
      dni: user?.dni || "",
      phone: user?.phone || "",
      addresses: [],
    };
  }

  const allProfiles = readAllProfilesMap();
  const stored = allProfiles[email] || {};

  return {
    name: stored.name || user?.name || "",
    email,
    dni: stored.dni || user?.dni || "",
    phone: stored.phone || user?.phone || "",
    addresses: Array.isArray(stored.addresses) ? stored.addresses : [],
  };
}

export function updateClientPersonalData(emailOrUser, { name, phone, dni }) {
  const email = normalizeEmail(typeof emailOrUser === "string" ? emailOrUser : emailOrUser?.email);
  if (!email) {
    throw new Error("Debes iniciar sesión para actualizar tu perfil.");
  }

  const cleanName = String(name || "").trim();
  const cleanPhone = String(phone || "").trim();
  const cleanDni = String(dni || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (!cleanName) {
    throw new Error("El nombre completo es obligatorio.");
  }

  const allProfiles = { ...readAllProfilesMap() };
  const current = allProfiles[email] || {};

  const updatedProfile = {
    ...current,
    email,
    name: cleanName,
    phone: cleanPhone,
    dni: cleanDni,
    addresses: Array.isArray(current.addresses) ? current.addresses : [],
    updatedAt: new Date().toISOString(),
  };

  allProfiles[email] = updatedProfile;
  writeAllProfilesMap(allProfiles);

  // Actualizar también la sesión activa en localStorage para que el cambio sea inmediato en toda la web
  try {
    const rawSession = localStorage.getItem(LOCAL_SESSION_KEY);
    if (rawSession) {
      const sessionObj = JSON.parse(rawSession);
      if (normalizeEmail(sessionObj?.email) === email) {
        const nextSession = {
          ...sessionObj,
          name: cleanName,
          phone: cleanPhone,
          dni: cleanDni || sessionObj.dni || "",
        };
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(nextSession));
      }
    }
  } catch {
    // ignore
  }

  // Actualizar en la lista local de usuarios registrados si existe
  try {
    const rawUsers = localStorage.getItem(LOCAL_USERS_KEY);
    if (rawUsers) {
      const usersArr = JSON.parse(rawUsers);
      if (Array.isArray(usersArr)) {
        const nextUsers = usersArr.map((u) =>
          normalizeEmail(u?.email) === email
            ? { ...u, name: cleanName, phone: cleanPhone, dni: cleanDni || u.dni || "" }
            : u
        );
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(nextUsers));
      }
    }
  } catch {
    // ignore
  }

  window.dispatchEvent(new CustomEvent("platino_profile_updated", { detail: updatedProfile }));
  return updatedProfile;
}

export function getClientAddresses(emailOrUser) {
  const profile = getClientProfile(
    typeof emailOrUser === "string" ? { email: emailOrUser } : emailOrUser
  );
  return profile.addresses || [];
}

export function addClientAddress(emailOrUser, addressInput) {
  const email = normalizeEmail(typeof emailOrUser === "string" ? emailOrUser : emailOrUser?.email);
  if (!email) {
    throw new Error("Debes iniciar sesión para guardar una dirección.");
  }

  const street = String(addressInput?.address || "").trim();
  const department = String(addressInput?.department || "Lima").trim();
  const province = String(addressInput?.province || "Lima").trim();
  const district = String(addressInput?.district || "").trim();
  const label = String(addressInput?.label || "Casa").trim() || "Casa";
  const reference = String(addressInput?.reference || "").trim();

  if (!street) {
    throw new Error("Ingresa la dirección exacta (calle, avenida, número o interior).");
  }
  if (!district) {
    throw new Error("Ingresa el distrito de la dirección.");
  }

  const allProfiles = { ...readAllProfilesMap() };
  const current = allProfiles[email] || {};
  const existingAddresses = Array.isArray(current.addresses) ? [...current.addresses] : [];

  const isFirst = existingAddresses.length === 0;
  const shouldBeDefault = Boolean(addressInput?.isDefault) || isFirst;

  const newAddress = {
    id: `ADDR-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    label,
    address: street,
    department,
    province,
    district,
    reference,
    isDefault: shouldBeDefault,
    createdAt: new Date().toISOString(),
  };

  const nextAddresses = shouldBeDefault
    ? [newAddress, ...existingAddresses.map((a) => ({ ...a, isDefault: false }))]
    : [...existingAddresses, newAddress];

  allProfiles[email] = {
    ...current,
    email,
    addresses: nextAddresses,
    updatedAt: new Date().toISOString(),
  };

  writeAllProfilesMap(allProfiles);
  window.dispatchEvent(new CustomEvent("platino_profile_updated", { detail: allProfiles[email] }));
  return newAddress;
}

export function updateClientAddress(emailOrUser, addressId, addressInput) {
  const email = normalizeEmail(typeof emailOrUser === "string" ? emailOrUser : emailOrUser?.email);
  if (!email) {
    throw new Error("Debes iniciar sesión para actualizar tu dirección.");
  }

  const street = String(addressInput?.address || "").trim();
  const department = String(addressInput?.department || "Lima").trim();
  const province = String(addressInput?.province || "Lima").trim();
  const district = String(addressInput?.district || "").trim();
  const label = String(addressInput?.label || "Casa").trim() || "Casa";
  const reference = String(addressInput?.reference || "").trim();

  if (!street) {
    throw new Error("Ingresa la dirección exacta.");
  }
  if (!district) {
    throw new Error("Ingresa el distrito.");
  }

  const allProfiles = { ...readAllProfilesMap() };
  const current = allProfiles[email] || {};
  const existingAddresses = Array.isArray(current.addresses) ? [...current.addresses] : [];

  const wantDefault = Boolean(addressInput?.isDefault);

  const nextAddresses = existingAddresses.map((addr) => {
    if (addr.id === addressId) {
      return {
        ...addr,
        label,
        address: street,
        department,
        province,
        district,
        reference,
        isDefault: wantDefault ? true : addr.isDefault,
      };
    }
    return wantDefault ? { ...addr, isDefault: false } : addr;
  });

  allProfiles[email] = {
    ...current,
    email,
    addresses: nextAddresses,
    updatedAt: new Date().toISOString(),
  };

  writeAllProfilesMap(allProfiles);
  window.dispatchEvent(new CustomEvent("platino_profile_updated", { detail: allProfiles[email] }));
  return nextAddresses;
}

export function deleteClientAddress(emailOrUser, addressId) {
  const email = normalizeEmail(typeof emailOrUser === "string" ? emailOrUser : emailOrUser?.email);
  if (!email) return [];

  const allProfiles = { ...readAllProfilesMap() };
  const current = allProfiles[email] || {};
  const existingAddresses = Array.isArray(current.addresses) ? [...current.addresses] : [];

  let nextAddresses = existingAddresses.filter((a) => a.id !== addressId);
  if (nextAddresses.length > 0 && !nextAddresses.some((a) => a.isDefault)) {
    nextAddresses[0] = { ...nextAddresses[0], isDefault: true };
  }

  allProfiles[email] = {
    ...current,
    email,
    addresses: nextAddresses,
    updatedAt: new Date().toISOString(),
  };

  writeAllProfilesMap(allProfiles);
  window.dispatchEvent(new CustomEvent("platino_profile_updated", { detail: allProfiles[email] }));
  return nextAddresses;
}

export function setDefaultClientAddress(emailOrUser, addressId) {
  const email = normalizeEmail(typeof emailOrUser === "string" ? emailOrUser : emailOrUser?.email);
  if (!email) return [];

  const allProfiles = { ...readAllProfilesMap() };
  const current = allProfiles[email] || {};
  const existingAddresses = Array.isArray(current.addresses) ? [...current.addresses] : [];

  const nextAddresses = existingAddresses.map((a) => ({
    ...a,
    isDefault: a.id === addressId,
  }));

  allProfiles[email] = {
    ...current,
    email,
    addresses: nextAddresses,
    updatedAt: new Date().toISOString(),
  };

  writeAllProfilesMap(allProfiles);
  window.dispatchEvent(new CustomEvent("platino_profile_updated", { detail: allProfiles[email] }));
  return nextAddresses;
}
