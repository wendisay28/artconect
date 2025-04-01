
import { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface AuthCredentials {
  email: string;
  password: string;
}

interface SignUpCredentials extends AuthCredentials {
  username: string;
  displayName: string;
}

const handleAuthError = (error: any): string => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'Este correo ya está registrado. Por favor inicia sesión';
    case 'auth/invalid-email':
      return 'El formato del correo electrónico es inválido';
    case 'auth/operation-not-allowed':
      return 'Esta operación no está permitida. Contacta soporte';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres';
    case 'auth/user-disabled':
      return 'Esta cuenta ha sido deshabilitada. Contacta soporte';
    case 'auth/user-not-found':
      return 'No existe cuenta con este correo. Regístrate primero';
    case 'auth/wrong-password':
      return 'Contraseña incorrecta. Intenta de nuevo';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Intenta más tarde';
    case 'auth/network-request-failed':
      return 'Error de conexión. Verifica tu internet';
    default:
      console.error('Auth error:', error);
      return 'Error inesperado. Por favor intenta de nuevo';
  }
};

export const useFirebaseAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createUserInDatabase = async (userCredential: UserCredential, username: string, displayName: string) => {
    try {
      await apiRequest("POST", "/api/users", {
        firebaseUid: userCredential.user.uid,
        email: userCredential.user.email,
        username,
        displayName,
        photoURL: userCredential.user.photoURL || "",
        role: "user"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    } catch (error) {
      console.error("Error creating user in database:", error);
      throw error;
    }
  };

  const signIn = async ({ email, password }: AuthCredentials) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${userCredential.user.displayName || userCredential.user.email}`,
      });
      return userCredential.user;
    } catch (error: any) {
      const errorMessage = handleAuthError(error);
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: errorMessage,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const validateSignUpData = ({ email, password, username, displayName }: SignUpCredentials) => {
    if (!email || !password || !username || !displayName) {
      throw new Error("Todos los campos son obligatorios");
    }
    if (password.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }
    if (username.length < 3) {
      throw new Error("El nombre de usuario debe tener al menos 3 caracteres");
    }
  };

  const signUp = async ({ email, password, username, displayName }: SignUpCredentials) => {
    setIsLoading(true);
    try {
      validateSignUpData({ email, password, username, displayName });
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, { displayName });
      await createUserInDatabase(userCredential, username, displayName);

      toast({
        title: "¡Registro exitoso!",
        description: `Bienvenido a BuscArt, ${displayName}`,
      });

      return userCredential.user;
    } catch (error: any) {
      const errorMessage = handleAuthError(error);
      toast({
        variant: "destructive",
        title: "Error al registrarse",
        description: errorMessage,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      await createUserInDatabase(
        userCredential,
        userCredential.user.email?.split('@')[0] || userCredential.user.uid,
        userCredential.user.displayName || userCredential.user.email?.split('@')[0] || ''
      );

      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${userCredential.user.displayName || userCredential.user.email}`,
      });
      return userCredential.user;
    } catch (error: any) {
      const errorMessage = handleAuthError(error);
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión con Google",
        description: errorMessage,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    signUp,
    signInWithGoogle,
    isLoading,
  };
};
