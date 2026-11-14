export interface WebpConversionResult {
  dataUrl: string;
  originalSizeKb: number;
  webpSizeKb: number;
  savingsPercent: number;
  width: number;
  height: number;
}

/**
 * Converts any uploaded JPG/PNG/Image file into an optimized .webp Data URL
 * using an offscreen HTMLCanvasElement for fast catalog loading.
 */
export function convertImageToWebp(
  file: File,
  maxDimension = 1600,
  quality = 0.84
): Promise<WebpConversionResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo de imagen.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagen no compatible.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo inicializar el contexto gráfico.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/webp', quality);

        const originalSizeKb = Math.max(1, Math.round(file.size / 1024));
        const base64Length = dataUrl.split(',')[1]?.length ?? 0;
        const webpSizeKb = Math.max(1, Math.round((base64Length * 3) / 4 / 1024));
        const savingsPercent = Math.max(
          0,
          Math.round(((originalSizeKb - webpSizeKb) / originalSizeKb) * 100)
        );

        resolve({
          dataUrl,
          originalSizeKb,
          webpSizeKb,
          savingsPercent,
          width,
          height,
        });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo CAD.'));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}
