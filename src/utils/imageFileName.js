export function attachImageFileName(imageData, fileName) {
  if (
    typeof imageData !== "string" ||
    !imageData.startsWith("data:image/") ||
    !fileName
  ) {
    return imageData;
  }

  return `${imageData.split("#", 1)[0]}#filename=${encodeURIComponent(fileName)}`;
}

export function getImageFileName(imageData) {
  if (typeof imageData !== "string" || !imageData.startsWith("data:image/")) {
    return "";
  }

  const match = imageData.match(/#filename=([^#]*)$/);
  if (!match) return "";

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return "";
  }
}

export function getImageInputValue(imageData) {
  if (typeof imageData !== "string" || !imageData.startsWith("data:image/")) {
    return imageData || "";
  }

  return getImageFileName(imageData) || "Imagen cargada (nombre no disponible)";
}

export function isEmbeddedImage(imageData) {
  return typeof imageData === "string" && imageData.startsWith("data:image/");
}

export function getFriendlyImageName(imageSrc, fallbackName = "imagen.jpg") {
  if (!imageSrc || typeof imageSrc !== "string") return fallbackName;

  const embedded = getImageFileName(imageSrc);
  if (embedded) return embedded;

  if (!imageSrc.startsWith("data:")) {
    const cleanUrl = imageSrc.split("?")[0].split("#")[0];
    const parts = cleanUrl.split("/");
    const last = parts[parts.length - 1];
    if (last && last.includes(".")) {
      try {
        return decodeURIComponent(last);
      } catch {
        return last;
      }
    }
  }

  return fallbackName.endsWith(".jpg") || fallbackName.endsWith(".png") || fallbackName.endsWith(".jpeg") || fallbackName.endsWith(".webp")
    ? fallbackName
    : `${fallbackName}.jpg`;
}
