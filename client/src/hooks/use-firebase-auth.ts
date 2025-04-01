
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
      return 'Este correo ya está registrado';
    case 'auth/invalid-email':
      return 'Correo electrónico inválido';
    case 'auth/operation-not-allowed':
      return 'Operación no permitida';
    case 'auth/weak-password':
      return 'La contraseña es muy débil';
    case 'auth/user-disabled':
      return 'Usuario deshabilitado';
    case 'auth/user-not-found':
      return 'Usuario no encontrado';
    case 'auth/wrong-password':
      return 'Contraseña incorrecta';
    default:
      return 'Error de autenticación';
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

  const signUp = async ({ email, password, username, displayName }: SignUpCredentials) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, { displayName });
      await createUserInDatabase(userCredential, username, displayName);

      toast({
        title: "Registro exitoso",
        description: `Bienvenido, ${displayName}`,
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
