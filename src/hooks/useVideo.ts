import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';

const VIDEO_BUCKET = 'videos';
const THUMB_BUCKET = 'thumbnails';

/**
 * Génère une URL signée (valide 1h) pour lire une vidéo privée.
 * Passe le storage_path du workout (ex: "core-essentials-15.mp4")
 */
export async function getVideoUrl(storagePath: string, expiresInSeconds = 3600): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(VIDEO_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error) { console.error('getVideoUrl:', error.message); return null; }
  return data.signedUrl;
}

/**
 * Génère l'URL publique d'une miniature (bucket public).
 */
export function getThumbnailUrl(storagePath: string): string {
  const { data } = supabase.storage.from(THUMB_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

/**
 * Hook pour lire une vidéo depuis Supabase Storage.
 * Usage: const { url, loading } = useVideoUrl('core-essentials-15.mp4');
 */
export function useVideoUrl(storagePath: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!storagePath) return;
    setLoading(true);
    const signed = await getVideoUrl(storagePath);
    if (!signed) setError('Vidéo introuvable');
    else { setUrl(signed); setError(null); }
    setLoading(false);
  }, [storagePath]);

  return { url, loading, error, load };
}

/**
 * Hook admin — upload une vidéo + sa miniature vers Supabase Storage.
 * Utilise la service_role key côté admin uniquement (ne jamais exposer dans l'app).
 *
 * Usage côté admin :
 *   const { upload, progress, error } = useVideoUpload();
 *   await upload({ videoFile, thumbFile, workoutSlug: 'core-essentials-15' });
 */
export function useVideoUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async ({
    videoFile,
    thumbFile,
    workoutSlug,
  }: {
    videoFile: File;
    thumbFile?: File;
    workoutSlug: string;
  }) => {
    setUploading(true);
    setError(null);
    setProgress(0);

    // Derive filenames from slug
    const ext = videoFile.name.split('.').pop() ?? 'mp4';
    const videoPath = workoutSlug + '.' + ext;
    const thumbPath = workoutSlug + '.jpg';

    // Upload video
    const { error: videoErr } = await supabase.storage
      .from(VIDEO_BUCKET)
      .upload(videoPath, videoFile, { upsert: true, contentType: videoFile.type });

    if (videoErr) {
      setError(videoErr.message);
      setUploading(false);
      return { error: videoErr.message };
    }
    setProgress(70);

    // Upload thumbnail (optional)
    if (thumbFile) {
      const { error: thumbErr } = await supabase.storage
        .from(THUMB_BUCKET)
        .upload(thumbPath, thumbFile, { upsert: true, contentType: thumbFile.type });

      if (thumbErr) console.warn('Thumbnail upload failed:', thumbErr.message);
    }
    setProgress(85);

    // Update workout row with the storage paths
    const updatePayload: Record<string, string> = { video_url: videoPath };
    if (thumbFile) updatePayload.thumbnail_url = thumbPath;

    const { error: dbErr } = await supabase
      .from('workouts')
      .update(updatePayload)
      .eq('slug', workoutSlug);

    if (dbErr) {
      setError(dbErr.message);
      setUploading(false);
      return { error: dbErr.message };
    }

    setProgress(100);
    setUploading(false);
    return { error: null, videoPath, thumbPath };
  }, []);

  return { upload, uploading, progress, error };
}
