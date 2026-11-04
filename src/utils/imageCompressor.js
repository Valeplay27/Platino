import { attachImageFileName } from "./imageFileName";

/**
 * Comprime y redimensiona una imagen en el navegador usando HTML5 Canvas.
 * Reduce el peso de imágenes pesadas de celular/cámara (de varios MB a ~60KB - 120KB)
 * permitiendo guardar imágenes optimizadas en la persistencia de la aplicación
 * sin sobrepasar la cuota del navegador (5MB).
 */
export async function compressImageFile(file, maxWidth = 1000, maxHeight = 1000, quality = 0.82) {
  if (!file) return "";

  if (!file.type || !file.type.startsWith("image/")) {
    throw new Error("El archivo seleccionado no es una imagen válida.");
  }

  return new Promise((resolve, reject) => {
    const resolveWithFileName = (imageData) => {
      resolve(attachImageFileName(imageData, file.name));
    };
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Error al leer el archivo de imagen."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Error al procesar la imagen seleccionada."));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolveWithFileName(e.target.result);
          return;
        }

        // Si la imagen es PNG o tiene transparencias, dibujar sobre fondo blanco limpio
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        try {
          // Intentar WebP para máxima calidad y ligereza; si no, JPEG
          const webpData = canvas.toDataURL("image/webp", quality);
          if (webpData.startsWith("data:image/webp")) {
            resolveWithFileName(webpData);
          } else {
            resolveWithFileName(canvas.toDataURL("image/jpeg", quality));
          }
        } catch {
          resolveWithFileName(canvas.toDataURL("image/jpeg", quality));
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
