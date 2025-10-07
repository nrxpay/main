import { useState, useEffect, createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isSuspended: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuspended, setIsSuspended] = useState(false);

  const checkUserSuspension = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('username')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        setIsSuspended(data.username?.startsWith('[SUSPENDED]') || false);
      } else {
        setIsSuspended(false);
      }
    } catch (error) {
      console.error('Error checking user suspension:', error);
      setIsSuspended(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Defer suspension check to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            checkUserSuspension(session.user.id);
          }, 0);
        } else {
          setIsSuspended(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await checkUserSuspension(session.user.id);
      } else {
        setIsSuspended(false);
      }
      
      setLoading(false);
    }).catch((error) => {
      console.error('Session check failed:', error);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isSuspended, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};