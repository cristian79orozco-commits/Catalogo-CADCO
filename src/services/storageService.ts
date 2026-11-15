import { supabase } from '../lib/supabase';

const STORAGE_BUCKET = 'cadco-media';

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const binary = atob(base64 || '');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

function sanitizeFileName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .toLowerCase();
}

/**
 * Uploads a Base64 Data URL (3D CAD model or optimized Hero video) to the
 * Supabase Storage `cadco-media` bucket and returns its public CDN URL.
 * Returns null gracefully if Supabase is unconfigured or the bucket is not yet created,
 * allowing callers to fall back to inline Data URLs without breaking existing records.
 */
export async function uploadMediaToSupabaseStorage(
  dataUrl: string,
  folder: 'models' | 'hero-models' | 'hero-videos',
  fileName: string
): Promise<string | null> {
  if (!supabase || !dataUrl.startsWith('data:')) {
    return null;
  }

  try {
    const blob = dataUrlToBlob(dataUrl);
    const safeName = sanitizeFileName(fileName || 'asset');
    const path = `${folder}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, blob, {
        contentType: blob.type || 'application/octet-stream',
        cacheControl: '31536000',
        upsert: true,
      });

    if (uploadError) {
      return null;
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return data?.publicUrl ?? null;
  } catch {
    return null;
  }
}
