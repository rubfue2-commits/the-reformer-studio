import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import Logo from "@/components/Logo";

const Auth = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");

  const handleSubmit = () => navigate("/onboarding");

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#F5F0E8" }}>
      {/* Header avec logo */}
      <div className="flex flex-col items-center pt-16 pb-8 px-6">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Logo size="lg" variant="full" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-3 font-body text-xs tracking-widest uppercase"
          style={{ color: "#888780" }}>
          Pilates · Performance · Bien-être
        </motion.p>
      </div>

      {/* Card Auth */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
        className="flex-1 rounded-t-3xl px-6 pt-8 pb-10"
        style={{ background: "#FFFFFF" }}>

        {/* Tabs */}
        <div className="flex rounded-2xl p-1 mb-8" style={{ background: "#F5F0E8" }}>
          {(["signin", "signup"] as const).map(t2 => (
            <button key={t2} onClick={() => setTab(t2)}
              className="flex-1 rounded-xl py-3 font-body text-sm transition-all"
              style={{
                background: tab === t2 ? "#1C1B19" : "transparent",
                color: tab === t2 ? "#F5F0E8" : "#888780",
              }}>
              {t2 === "signin" ? t.auth.signIn : t.auth.signUp}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {/* Prénom (signup seulement) */}
          {tab === "signup" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
              <div className="flex items-center gap-3 rounded-2xl border px-4 py-3.5"
                style={{ borderColor: "#D3D1C7", background: "#FAFAF8" }}>
                <User size={16} style={{ color: "#888780" }} strokeWidth={1.5} />
                <input type="text" placeholder={t.auth.firstName} value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="flex-1 bg-transparent font-body text-sm outline-none"
                  style={{ color: "#1C1B19" }} />
              </div>
            </motion.div>
          )}

          {/* Email */}
          <div className="flex items-center gap-3 rounded-2xl border px-4 py-3.5"
            style={{ borderColor: "#D3D1C7", background: "#FAFAF8" }}>
            <Mail size={16} style={{ color: "#888780" }} strokeWidth={1.5} />
            <input type="email" placeholder={t.auth.email} value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 bg-transparent font-body text-sm outline-none"
              style={{ color: "#1C1B19" }} />
          </div>

          {/* Mot de passe */}
          <div className="flex items-center gap-3 rounded-2xl border px-4 py-3.5"
            style={{ borderColor: "#D3D1C7", background: "#FAFAF8" }}>
            <Lock size={16} style={{ color: "#888780" }} strokeWidth={1.5} />
            <input type={showPassword ? "text" : "password"} placeholder={t.auth.password}
              value={password} onChange={e => setPassword(e.target.value)}
              className="flex-1 bg-transparent font-body text-sm outline-none"
              style={{ color: "#1C1B19" }} />
            <button onClick={() => setShowPassword(p => !p)}>
              {showPassword
                ? <EyeOff size={16} style={{ color: "#888780" }} strokeWidth={1.5} />
                : <Eye size={16} style={{ color: "#888780" }} strokeWidth={1.5} />}
            </button>
          </div>

          {/* CTA principal */}
          <motion.button whileTap={{ scale: 0.98 }} onClick={handleSubmit}
            className="w-full rounded-2xl py-4 font-body text-sm font-medium tracking-wide"
            style={{ background: "#1C1B19", color: "#F5F0E8" }}>
            {tab === "signin" ? t.auth.signIn : t.auth.createAccount}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "#D3D1C7" }} />
            <span className="font-body text-xs" style={{ color: "#888780" }}>ou</span>
            <div className="h-px flex-1" style={{ background: "#D3D1C7" }} />
          </div>

          {/* Google */}
          <button onClick={handleSubmit}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border py-3.5 font-body text-sm transition-all"
            style={{ borderColor: "#D3D1C7", color: "#1C1B19" }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            {t.auth.continueGoogle}
          </button>

          {/* Apple */}
          <button onClick={handleSubmit}
            className="flex w-full items-center justify-center gap-3 rounded-2xl py-3.5 font-body text-sm"
            style={{ background: "#1C1B19", color: "#F5F0E8" }}>
            <svg width="16" height="16" viewBox="0 0 814 1000" fill="currentColor">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 429.4 0 290.3 0 185.7 0 83.1 56 29.5 160 29.5c52 0 96 29.5 129.8 29.5 32 0 81.3-31.3 143.9-31.3 22.7 0 108.2 1.9 174.2 76.1zm-247-159.8c31.3-35.9 53.6-85.5 53.6-135.1 0-6.9-.6-13.9-1.9-19.5-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32-55.1 81.6-55.1 131.9 0 7.6 1.3 15.1 1.9 17.5 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135-71.9z"/>
            </svg>
            {t.auth.continueApple}
          </button>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center font-body text-xs" style={{ color: "#888780" }}>
          En continuant, tu acceptes les{" "}
          <span className="underline" style={{ color: "#B8973E" }}>CGU</span>
          {" "}et la{" "}
          <span className="underline" style={{ color: "#B8973E" }}>politique de confidentialité</span>
          {" "}de Connect Reformer.
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
