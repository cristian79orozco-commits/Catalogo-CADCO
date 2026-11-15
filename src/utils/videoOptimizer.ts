import { readFileAsDataUrl } from './imageConverter';

export interface OptimizedVideoResult {
  name: string;
  mimeType: string;
  dataUrl: string;
  width: number;
  height: number;
  durationSec: number;
  originalSizeKb: number;
  optimizedSizeKb: number;
  savingsPercent: number;
}

const MAX_INPUT_BYTES = 100 * 1024 * 1024; // 100 MB raw input limit
const MAX_DIMENSION = 960; // Optimal 540p/qHD+ sharpness for Hero showcase with fast decoding

function pickBestVideoMimeType(): { mimeType: string; extension: string } | null {
  if (typeof MediaRecorder === 'undefined') return null;

  // Prefer hardware-accelerated H.264 MP4 or fast-encoding VP8 WebM to prevent frame drops
  const candidates = [
    { mimeType: 'video/mp4;codecs=avc1.42E01E', extension: 'mp4' },
    { mimeType: 'video/webm;codecs=vp8', extension: 'webm' },
    { mimeType: 'video/webm;codecs=vp9', extension: 'webm' },
    { mimeType: 'video/webm', extension: 'webm' },
    { mimeType: 'video/mp4', extension: 'mp4' },
  ];

  for (const candidate of candidates) {
    if (MediaRecorder.isTypeSupported(candidate.mimeType)) {
      return candidate;
    }
  }
  return null;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo procesar el video optimizado.'));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

function getScaledDimensions(srcWidth: number, srcHeight: number) {
  let width = srcWidth || 960;
  let height = srcHeight || 540;

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    if (width >= height) {
      height = Math.round((height * MAX_DIMENSION) / width);
      width = MAX_DIMENSION;
    } else {
      width = Math.round((width * MAX_DIMENSION) / height);
      height = MAX_DIMENSION;
    }
  }

  // Ensure even dimensions required by video codecs
  width = Math.max(2, width - (width % 2));
  height = Math.max(2, height - (height % 2));
  return { width, height };
}

/**
 * Accepts any standard video format (MP4, MOV, AVI, MKV, WebM, etc.) and
 * transcodes/compresses it in-browser with frame-synced capture for smooth
 * 30fps playback, fast GPU decoding, and minimal database/storage footprint.
 */
export async function optimizeVideoForHero(
  file: File,
  onProgress?: (percent: number) => void
): Promise<OptimizedVideoResult> {
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('El video supera el límite de 100 MB de entrada.');
  }

  const originalSizeKb = Math.max(1, Math.round(file.size / 1024));
  const objectUrl = URL.createObjectURL(file);

  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = objectUrl;

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () =>
        reject(new Error('El navegador no pudo decodificar este formato de video.'));
    });

    const durationSec = Number.isFinite(video.duration) ? Math.max(0.5, video.duration) : 0;
    const { width, height } = getScaledDimensions(video.videoWidth, video.videoHeight);
    const chosen = pickBestVideoMimeType();

    // If the file is already a compact web-native MP4/WebM (<= 4 MB & <= 960px), keep it lossless & instant
    const isAlreadyOptimal =
      (file.type === 'video/mp4' || file.type === 'video/webm') &&
      file.size <= 4 * 1024 * 1024 &&
      video.videoWidth <= MAX_DIMENSION &&
      video.videoHeight <= MAX_DIMENSION;

    if (
      isAlreadyOptimal ||
      !chosen ||
      typeof HTMLCanvasElement.prototype.captureStream !== 'function'
    ) {
      const dataUrl = await readFileAsDataUrl(file);
      onProgress?.(100);
      return {
        name: file.name,
        mimeType: file.type || 'video/mp4',
        dataUrl,
        width: video.videoWidth || width,
        height: video.videoHeight || height,
        durationSec: Math.round(durationSec * 10) / 10,
        originalSizeKb,
        optimizedSizeKb: originalSizeKb,
        savingsPercent: 0,
      };
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) {
      throw new Error('No se pudo inicializar el lienzo de conversión de video.');
    }

    const targetBitrate = durationSec > 20 ? 850_000 : 1_150_000;
    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, {
      mimeType: chosen.mimeType,
      videoBitsPerSecond: targetBitrate,
    });

    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) {
        chunks.push(ev.data);
      }
    };

    const recordingFinished = new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        resolve(new Blob(chunks, { type: chosen.mimeType.split(';')[0] }));
      };
    });

    const videoWithRvfc = video as HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number;
    };

    let rafId = 0;
    const renderFrame = () => {
      if (video.paused || video.ended) return;
      ctx.drawImage(video, 0, 0, width, height);
      if (durationSec > 0 && onProgress) {
        const pct = Math.min(98, Math.round((video.currentTime / durationSec) * 100));
        onProgress(pct);
      }
      if (typeof videoWithRvfc.requestVideoFrameCallback === 'function') {
        videoWithRvfc.requestVideoFrameCallback(renderFrame);
      } else {
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    video.currentTime = 0;
    recorder.start(500);
    await video.play();
    renderFrame();

    await new Promise<void>((resolve) => {
      video.onended = () => resolve();
    });

    cancelAnimationFrame(rafId);
    ctx.drawImage(video, 0, 0, width, height);
    if (recorder.state !== 'inactive') {
      recorder.stop();
    }

    const optimizedBlob = await recordingFinished;
    onProgress?.(100);

    const isAlreadyWebFormat =
      file.type === 'video/webm' || file.type === 'video/mp4';
    const useOriginal = isAlreadyWebFormat && file.size <= optimizedBlob.size;

    const finalBlob = useOriginal ? file : optimizedBlob;
    const finalMime = useOriginal
      ? file.type
      : chosen.mimeType.split(';')[0];
    const baseName = file.name.replace(/\.[^.]+$/, '');
    const finalName = useOriginal ? file.name : `${baseName}.${chosen.extension}`;

    const dataUrl = await blobToDataUrl(finalBlob);
    const optimizedSizeKb = Math.max(1, Math.round(finalBlob.size / 1024));
    const savingsPercent = Math.max(
      0,
      Math.round(((originalSizeKb - optimizedSizeKb) / originalSizeKb) * 100)
    );

    return {
      name: finalName,
      mimeType: finalMime,
      dataUrl,
      width,
      height,
      durationSec: Math.round(durationSec * 10) / 10,
      originalSizeKb,
      optimizedSizeKb,
      savingsPercent,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
