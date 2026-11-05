import { getImageFileName } from "./imageFileName";
import { compressImageFile } from "./imageCompressor";

/**
 * Guarda una imagen como archivo y devuelve su URL conservando el nombre original.
 * Si por alguna razón el servidor no puede guardar el archivo físico,
 * hace fallback transparente a Base64 sin interrumpir al usuario con alertas.
 */
export async function uploadImageFile(file, fallbackCustomName = "") {
  if (!file) return "";

  const rawName = file.name || fallbackCustomName || "joya.jpg";

  // 1. Intentar guardar como archivo físico en el servidor
  try {
    const formData = new FormData();
    formData.append("image", file, rawName);
    formData.append("fileName", rawName);

    const uploadUrl = new URL(`${import.meta.env.BASE_URL}api/index.php`, window.location.href);
    uploadUrl.searchParams.set("route", "/upload-image");
    const res = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.url) {
      return data.url;
    }
    console.warn("API de subida devolvió:", data?.error || res.statusText);
  } catch (err) {
    console.warn("No se pudo conectar con el endpoint de subida:", err);
  }

  // 2. Fallback seguro a compresión local para que nunca se bloquee el flujo del usuario
  try {
    return await compressImageFile(file);
  } catch (err) {
    console.error("Error al procesar imagen localmente:", err);
    return "";
  }
}

/**
 * Migra una imagen Base64 existente a un archivo físico con su nombre guardado.
 */
export async function convertBase64ToImageFile(base64Data, defaultName = "joya.jpg") {
  if (!base64Data || typeof base64Data !== "string" || !base64Data.startsWith("data:image/")) {
    return base64Data;
  }

  const fileName = getImageFileName(base64Data) || defaultName;
  try {
    const response = await fetch(base64Data.split("#", 1)[0]);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type || "image/jpeg" });
    const url = await uploadImageFile(file, fileName);
    if (url && !url.startsWith("data:")) {
      return url;
    }
  } catch (err) {
    console.warn("No se pudo convertir Base64 a archivo:", err);
  }
  return base64Data;
}
