import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface Video {
  id: string;
  title: string;
  description: string;
  level: "debutant" | "intermediaire" | "avance";
  duration_minutes: number;
  theme: string;
  thumbnail_url: string | null;
  video_path: string;       // chemin dans Storage ex: "seance-01-fondamentaux.mp4"
  video_url: string | null; // URL signée temporaire (1h)
  order_index: number;
  is_free: boolean;         // true = visible sans abonnement actif
}

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
      // 1. Récupérer la liste des vidéos depuis la table workouts
      const { data: workouts, error: wErr } = await supabase
        .from("workouts")
        .select("*")
        .order("order_index", { ascending: true });

      if (wErr) throw wErr;
      if (!workouts?.length) { setVideos([]); return; }

      // 2. Générer les URLs signées pour chaque vidéo (valables 1 heure)
      const videosWithUrls = await Promise.all(
        workouts.map(async (w) => {
          let video_url = null;
          let thumbnail_url = null;

          if (w.video_path) {
            const { data } = await supabase.storage
              .from("videos")
              .createSignedUrl(w.video_path, 3600); // 1 heure
            video_url = data?.signedUrl ?? null;
          }

          if (w.thumbnail_path) {
            const { data } = await supabase.storage
              .from("videos")
              .createSignedUrl(w.thumbnail_path, 3600);
            thumbnail_url = data?.signedUrl ?? null;
          }

          return {
            id: w.id,
            title: w.title,
            description: w.description ?? "",
            level: w.level ?? "debutant",
            duration_minutes: w.duration_minutes ?? 30,
            theme: w.theme ?? "Full Body",
            thumbnail_url,
            video_path: w.video_path ?? "",
            video_url,
            order_index: w.order_index ?? 0,
            is_free: w.is_free ?? false,
          } as Video;
        })
      );

      setVideos(videosWithUrls);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getSignedUrl = async (videoPath: string): Promise<string | null> => {
    const { data } = await supabase.storage
      .from("videos")
      .createSignedUrl(videoPath, 3600);
    return data?.signedUrl ?? null;
  };

  return { videos, loading, error, reload: loadVideos, getSignedUrl };
}
