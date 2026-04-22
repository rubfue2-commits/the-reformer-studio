import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

export default function LanguageSelect() {
  const navigate = useNavigate();
  const { setLanguage } = useLanguage();

  const choose = (lang: "fr" | "en") => {
    setLanguage(lang);
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-display text-5xl text-foreground mb-2">The Reformer</h1>
        <p className="font-display text-3xl text-primary mb-3">Studio</p>
        <p className="font-body text-sm text-muted-foreground mb-10 tracking-widest uppercase">Pilates</p>

        <div className="space-y-3">
          <button onClick={() => choose("fr")}
            className="w-full flex items-center gap-4 bg-card border border-border rounded-2xl p-5 hover:bg-accent transition-colors cursor-pointer">
            <span className="text-3xl">🇫🇷</span>
            <div className="text-left flex-1">
              <p className="font-display text-xl text-foreground">Francais</p>
              <p className="font-body text-xs text-muted-foreground">Continuer en francais</p>
            </div>
            <span className="text-muted-foreground text-lg">›</span>
          </button>

          <button onClick={() => choose("en")}
            className="w-full flex items-center gap-4 bg-card border border-border rounded-2xl p-5 hover:bg-accent transition-colors cursor-pointer">
            <span className="text-3xl">🇬🇧</span>
            <div className="text-left flex-1">
              <p className="font-display text-xl text-foreground">English</p>
              <p className="font-body text-xs text-muted-foreground">Continue in English</p>
            </div>
            <span className="text-muted-foreground text-lg">›</span>
          </button>
        </div>

        <p className="font-body text-xs text-muted-foreground mt-8">
          You can change this later in your profile
        </p>
      </div>
    </div>
  );
}
