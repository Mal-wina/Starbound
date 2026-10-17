import type { Session } from "@supabase/supabase-js";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

import { supabase } from "../lib/supabase";

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let authEventReceived = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      authEventReceived = true;

      if (active) {
        setSession(nextSession);
        setLoading(false);
      }
    });

    // Restore a previously saved login session.
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active || authEventReceived) return;

        if (error) {
          console.warn("Could not restore login:", error.message);
        }

        setSession(data.session);
        setLoading(false);
      })
      .catch((error) => {
        if (!active || authEventReceived) return;

        console.warn("Could not restore login:", error);
        setLoading(false);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
