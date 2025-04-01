import React, { createContext, useContext, useEffect, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const token = await user.getIdToken(true);
          localStorage.setItem('auth_token', token);
          
          // Refresh token periódicamente
          const refreshToken = setInterval(async () => {
            const newToken = await user.getIdToken(true);
            localStorage.setItem('auth_token', newToken);
          }, 30 * 60 * 1000); // Cada 30 minutos

          setUser(user);
          return () => clearInterval(refreshToken);
        } else {
          localStorage.removeItem('auth_token');
          setUser(null);
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        toast({
          variant: "destructive",
          title: "Error de autenticación",
          description: "Ha ocurrido un error con tu sesión",
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Has cerrado sesión",
        description: "Tu sesión ha sido cerrada correctamente",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error al cerrar sesión",
        description: "Ha ocurrido un error al intentar cerrar sesión",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
