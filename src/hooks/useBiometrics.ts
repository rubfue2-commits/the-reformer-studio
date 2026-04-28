import { useState, useEffect } from "react";

export interface BiometricResult {
  available: boolean;
  authenticated: boolean;
  error: string | null;
}

export function useBiometrics() {
  const [available, setAvailable] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => { checkAvailability(); }, []);

  const checkAvailability = async () => {
    try {
      const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
      if (!isNative) { setAvailable(false); setChecking(false); return; }
      const { BiometricAuth } = await import("@aparajita/capacitor-biometric-auth");
      const info = await BiometricAuth.checkBiometry();
      setAvailable(info.isAvailable);
    } catch { setAvailable(false); }
    finally { setChecking(false); }
  };

  const authenticate = async (): Promise<BiometricResult> => {
    try {
      const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
      if (!isNative) return { available: false, authenticated: false, error: null };
      const { BiometricAuth } = await import("@aparajita/capacitor-biometric-auth");
      await BiometricAuth.authenticate({
        reason: "Accedez a votre espace Connect Reformer",
        cancelTitle: "Utiliser le mot de passe",
        allowDeviceCredential: true,
        iosFallbackTitle: "Utiliser le mot de passe",
      });
      return { available: true, authenticated: true, error: null };
    } catch (e: any) {
      return { available: true, authenticated: false, error: e.message };
    }
  };

  return { available, checking, authenticate };
}
