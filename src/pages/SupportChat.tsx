import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSupportChat, isSupportOpen, SUPPORT_OPEN_HOUR, SUPPORT_CLOSE_HOUR } from "@/hooks/useSupportChat";

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

function formatDay(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
  } catch { return ""; }
}

export default function SupportChat() {
  const { t, language } = useLanguage() as { t: (fr: string, en: string) => string; language?: string };
  const navigate = useNavigate();
  const { messages, loading, sending, sendMessage } = useSupportChat();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const open = isSupportOpen();
  const locale = language === "en" ? "en-GB" : "fr-FR";

  // Défile toujours vers le dernier message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    await sendMessage(text);
  };

  // Regroupe les messages par jour pour afficher des séparateurs de date
  let lastDay = "";

  return (
    <MobileLayout>
      <div className="flex flex-col" style={{ height: "100dvh" }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-12 pb-3 border-b border-border flex-shrink-0" style={{ backgroundColor: "hsl(var(--card))" }}>
          <button onClick={() => navigate(-1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-card border border-border flex-shrink-0">
            <ChevronLeft size={18} className="text-muted-foreground" />
          </button>
          <div className="flex-1">
            <p className="font-body text-sm font-medium text-foreground">{t("Discuter avec nous", "Chat with us")}</p>
            <div className="flex items-center gap-1.5">
              <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: open ? "#16A34A" : "#9CA3AF", display: "inline-block" }} />
              <p className="font-body text-[11px] text-muted-foreground">
                {open ? t("En ligne · réponse rapide", "Online · quick reply") : t(`Fermé · ouvre à ${SUPPORT_OPEN_HOUR}h`, `Closed · opens at ${SUPPORT_OPEN_HOUR}:00`)}
              </p>
            </div>
          </div>
        </div>

        {/* Fil de messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4" style={{ backgroundColor: "hsl(var(--background))" }}>
          {loading ? (
            <p className="text-center font-body text-xs text-muted-foreground mt-8">{t("Chargement…", "Loading…")}</p>
          ) : messages.length === 0 ? (
            <div className="text-center mt-10 px-6">
              <p className="font-display text-lg font-light text-foreground mb-2">{t("Bonjour 👋", "Hello 👋")}</p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {t("Une question sur ta séance, ton abonnement ou ta machine ? Écris-nous, on te répond avec plaisir.",
                   "A question about your session, subscription or machine? Write to us, we'll gladly reply.")}
              </p>
              <p className="font-body text-[11px] text-muted-foreground mt-4">
                {t(`Nous répondons tous les jours de ${SUPPORT_OPEN_HOUR}h à ${SUPPORT_CLOSE_HOUR}h.`,
                   `We reply every day from ${SUPPORT_OPEN_HOUR}:00 to ${SUPPORT_CLOSE_HOUR}:00.`)}
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const day = formatDay(m.created_at, locale);
              const showDay = day !== lastDay;
              lastDay = day;
              const mine = m.sender === "user";
              return (
                <div key={m.id}>
                  {showDay && (
                    <div className="text-center my-3">
                      <span className="font-body text-[10px] text-muted-foreground px-3 py-1 rounded-full" style={{ backgroundColor: "hsl(var(--card))" }}>{day}</span>
                    </div>
                  )}
                  <div className={`flex mb-2 ${mine ? "justify-end" : "justify-start"}`}>
                    <div style={{
                      maxWidth: "78%",
                      padding: "9px 13px",
                      borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      backgroundColor: mine ? "#B8973E" : "hsl(var(--card))",
                      border: mine ? "none" : "0.5px solid hsl(var(--border))",
                    }}>
                      <p className="font-body text-sm" style={{ color: mine ? "#1C1B19" : "hsl(var(--foreground))", lineHeight: 1.4 }}>{m.body}</p>
                      <p className="font-body text-[9px] mt-1" style={{ color: mine ? "rgba(28,27,25,0.5)" : "hsl(var(--muted-foreground))", textAlign: "right" }}>{formatTime(m.created_at)}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Message automatique hors horaires */}
          {!open && !loading && (
            <div className="flex justify-start mb-2">
              <div style={{ maxWidth: "78%", padding: "9px 13px", borderRadius: "16px 16px 16px 4px", backgroundColor: "hsl(var(--card))", border: "0.5px solid hsl(var(--border))" }}>
                <p className="font-body text-sm" style={{ color: "hsl(var(--muted-foreground))", lineHeight: 1.4, fontStyle: "italic" }}>
                  {t(`Nous sommes fermés pour le moment. Écris-nous quand même : nous te répondrons dès l'ouverture, à ${SUPPORT_OPEN_HOUR}h.`,
                     `We're closed right now. Write to us anyway: we'll reply as soon as we open, at ${SUPPORT_OPEN_HOUR}:00.`)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Zone de saisie */}
        <div className="flex items-end gap-2 px-3 py-3 border-t border-border flex-shrink-0" style={{ backgroundColor: "hsl(var(--card))", paddingBottom: "calc(12px + var(--safe-bottom, 0px))" }}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={t("Écris ton message…", "Write your message…")}
            rows={1}
            style={{ flex: 1, resize: "none", maxHeight: 100, padding: "10px 14px", borderRadius: 20, border: "0.5px solid hsl(var(--border))", backgroundColor: "hsl(var(--background))", color: "hsl(var(--foreground))", fontSize: 13, outline: "none" }}
          />
          <button onClick={handleSend} disabled={!draft.trim() || sending}
            aria-label={t("Envoyer", "Send")}
            style={{ width: 42, height: 42, borderRadius: "50%", backgroundColor: draft.trim() ? "#B8973E" : "hsl(var(--muted))", border: "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: draft.trim() ? "pointer" : "default", transition: "background 0.15s" }}>
            <Send size={17} color={draft.trim() ? "#1C1B19" : "hsl(var(--muted-foreground))"} />
          </button>
        </div>

      </div>
    </MobileLayout>
  );
}
