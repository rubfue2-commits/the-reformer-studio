import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ChevronRight } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import { useLanguage } from "@/i18n/LanguageContext";

type AuthTab = "signin" | "create";

const Auth = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [tab, setTab] = useState<AuthTab>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const canProceed = () => {
    if (tab === "signin") return email !== "" && password !== "";
    return email !== "" && password !== "" && firstName !== "" && lastName !== "" && confirmPassword === password;
  };

  const handleContinue = () => {
    if (tab === "signin") navigate("/home");
    else navigate("/onboarding");
  };

  return (
    <MobileLayout showNav={false}>
      <div className="flex min-h-screen flex-col px-6 pt-14 pb-8">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">The Reformer Studio</p>
          <h1 className="font-display text-3xl font-light text-foreground leading-tight">
            {tab === "signin" ? t.auth.welcome : t.auth.createTitle}
          </h1>
          <p className="mt-2 font-body text-sm text-muted-foreground">
            {tab === "signin" ? t.auth.welcomeSub : t.auth.createSub}
          </p>
        </motion.div>

        <div className="mb-8 flex border-b border-border">
          {(["signin", "create"] as AuthTab[]).map((tabKey) => (
            <button key={tabKey} onClick={() => setTab(tabKey)}
              className={`flex-1 pb-3 font-body text-sm transition-all ${tab === tabKey ? "border-b-2 border-gold text-foreground -mb-[1px]" : "text-muted-foreground"}`}>
              {tabKey === "signin" ? t.auth.tabSignIn : t.auth.tabCreate}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, x: tab === "signin" ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: tab === "signin" ? 20 : -20 }} transition={{ duration: 0.25 }} className="space-y-3">
            {tab === "create" && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1.5 block font-body text-[10px] tracking-widest uppercase text-muted-foreground">{t.auth.firstName}</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Camille"
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none" />
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 block font-body text-[10px] tracking-widest uppercase text-muted-foreground">{t.auth.lastName}</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Laurent"
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none" />
                </div>
              </div>
            )}
            <div>
              <label className="mb-1.5 block font-body text-[10px] tracking-widest uppercase text-muted-foreground">{t.auth.email}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="camille@studio.com"
                className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none" />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">{t.auth.password}</label>
                {tab === "signin" && <button className="font-body text-[10px] text-gold underline-offset-2">{t.auth.forgotPassword}</button>}
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 pr-12 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none" />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {tab === "create" && (
              <div>
                <label className="mb-1.5 block font-body text-[10px] tracking-widest uppercase text-muted-foreground">{t.auth.confirmPassword}</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••"
                  className={`w-full rounded-2xl border bg-card px-4 py-3.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none ${confirmPassword && confirmPassword !== password ? "border-red-400" : "border-border focus:border-gold"}`} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <motion.button onClick={handleContinue} disabled={!canProceed()} whileTap={{ scale: 0.98 }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-body text-sm font-medium tracking-wide text-primary-foreground transition-opacity disabled:opacity-30">
          {t.auth.continueBtn} <ChevronRight size={16} />
        </motion.button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-[1px] flex-1 bg-border" />
          <span className="font-body text-xs text-muted-foreground">{t.auth.orDivider}</span>
          <div className="h-[1px] flex-1 bg-border" />
        </div>

        <div className="space-y-3">
          <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card py-3.5 font-body text-sm text-foreground hover:bg-muted">
            {t.auth.apple}
          </button>
          <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card py-3.5 font-body text-sm text-foreground hover:bg-muted">
            {t.auth.google}
          </button>
        </div>

        <p className="mt-6 text-center font-body text-xs text-muted-foreground">
          {tab === "signin" ? t.auth.noAccount : t.auth.hasAccount}{" "}
          <button onClick={() => setTab(tab === "signin" ? "create" : "signin")} className="text-gold underline-offset-2">
            {tab === "signin" ? t.auth.signUp : t.auth.signIn}
          </button>
        </p>
      </div>
    </MobileLayout>
  );
};

export default Auth;
