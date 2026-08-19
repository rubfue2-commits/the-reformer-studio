import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface SupportMessage {
  id: string;
  user_id: string;
  sender: "user" | "admin";
  body: string;
  read_by_admin: boolean;
  read_by_user: boolean;
  created_at: string;
}

// Horaires d'ouverture du support (heure locale de l'utilisateur)
export const SUPPORT_OPEN_HOUR = 9;
export const SUPPORT_CLOSE_HOUR = 18;

export function isSupportOpen(d: Date = new Date()): boolean {
  const h = d.getHours();
  return h >= SUPPORT_OPEN_HOUR && h < SUPPORT_CLOSE_HOUR;
}

interface UseSupportChatResult {
  messages: SupportMessage[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  sendMessage: (body: string) => Promise<void>;
  open: boolean;
}

export function useSupportChat(): UseSupportChatResult {
  const { user } = useAuth();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Chargement de l'historique complet (persistant — la conversation reste)
  const fetchMessages = useCallback(async () => {
    if (!user) { setMessages([]); setLoading(false); return; }
    setLoading(true);
    const { data, error: err } = await supabase
      .from("support_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (err) setError(err.message);
    else { setMessages((data as SupportMessage[]) ?? []); setError(null); }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Abonnement temps réel : les réponses de l'admin arrivent instantanément
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`support:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_messages", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const msg = payload.new as SupportMessage;
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
        }
      )
      .subscribe();
    channelRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, [user]);

  const sendMessage = useCallback(async (body: string) => {
    const text = body.trim();
    if (!text || !user) return;
    setSending(true);
    const { data, error: err } = await supabase
      .from("support_messages")
      .insert({ user_id: user.id, sender: "user", body: text } as never)
      .select()
      .single();
    setSending(false);
    if (err) { setError(err.message); return; }
    const inserted = data as SupportMessage;
    setMessages((prev) => (prev.some((m) => m.id === inserted.id) ? prev : [...prev, inserted]));
  }, [user]);

  return { messages, loading, sending, error, sendMessage, open: isSupportOpen() };
}
