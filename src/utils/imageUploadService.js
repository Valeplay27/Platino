import { getImageFileName } from "./imageFileName";

/**
 * Guarda una imagen como archivo y devuelve su URL conservando el nombre original.
 */
export async function uploadImageFile(file, fallbackCustomName = "") {
  if (!file) return "";

  const rawName = file.name || fallbackCustomName || "joya.jpg";
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
  if (!res.ok || !data?.url) {
    throw new Error(data?.error || "No se pudo guardar la imagen en el servidor.");
  }
  return data.url;
}

/**
 * Migra una imagen Base64 existente a un archivo físico con su nombre guardado.
 */
export async function convertBase64ToImageFile(base64Data, defaultName = "joya.jpg") {
  if (!base64Data || typeof base64Data !== "string" || !base64Data.startsWith("data:image/")) {
    return base64Data;
  }

  const fileName = getImageFileName(base64Data) || defaultName;
  const response = await fetch(base64Data.split("#", 1)[0]);
  const blob = await response.blob();
  const file = new File([blob], fileName, { type: blob.type });
  return uploadImageFile(file, fileName);
}
