import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface SignUpParams {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  language: string;
  referralCode?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (params: SignUpParams) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithApple: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  // loading = true tant qu'on n'a pas vérifié la session persistée
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Récupérer la session déjà persistée (localStorage iOS)
    //    → si l'utilisateur était connecté, on le retrouve ici sans prompt
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Écouter les changements de session (login, logout, refresh token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async ({ email, password, firstName, lastName, language, referralCode }: SignUpParams) => {
    // 1. Créer le compte
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          language,
          referral_code_used: referralCode || null,
        },
      },
    });

    // 2. Si code parrainage fourni — vérifier et enregistrer
    if (!error && data.user && referralCode) {
      try {
        // Vérifier que le code existe
        const { data: codeData } = await supabase
          .from('referral_codes')
          .select('user_id, code')
          .eq('code', referralCode.toUpperCase())
          .single();

        if (codeData) {
          // Créer le parrainage en base
          await supabase.from('referrals').insert({
            referrer_id: codeData.user_id,
            referred_id: data.user.id,
            referred_email: email,
            code_used: referralCode.toUpperCase(),
            status: 'pending',
          });
        }
      } catch (e) {
        // Le code est invalide — on ne bloque pas l'inscription
        console.log('Referral code invalid or already used:', referralCode);
      }
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    return { error };
  };

  const signInWithApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: window.location.origin },
    });
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user, session, loading,
      signIn, signUp, signOut,
      signInWithGoogle, signInWithApple,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
