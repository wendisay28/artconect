import { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
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

export const useFirebaseAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const signIn = async ({ email, password }: AuthCredentials) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido de nuevo, ${userCredential.user.displayName || userCredential.user.email}`,
      });
      return userCredential.user;
    } catch (error) {
      const errorMessage = (error as Error).message;
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
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: displayName,
      });

      // Create user in our database
      await apiRequest("POST", "/api/users", {
        firebaseUid: userCredential.user.uid,
        email: email,
        username: username,
        displayName: displayName,
        photoURL: userCredential.user.photoURL || "",
      });

      // Invalidate users cache
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });

      toast({
        title: "Registro exitoso",
        description: `Bienvenido, ${displayName}`,
      });

      return userCredential.user;
    } catch (error) {
      const errorMessage = (error as Error).message;
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
      
      // Check if user exists in our database, if not create it
      try {
        await apiRequest("POST", "/api/users", {
          firebaseUid: userCredential.user.uid,
          email: userCredential.user.email || "",
          username: userCredential.user.email?.split('@')[0] || userCredential.user.uid,
          displayName: userCredential.user.displayName || "",
          photoURL: userCredential.user.photoURL || "",
        });
        // Invalidate users cache
        queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      } catch (error) {
        // User might already exist, that's fine
        console.log("User might already exist:", error);
      }

      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${userCredential.user.displayName || userCredential.user.email}`,
      });
      return userCredential.user;
    } catch (error) {
      const errorMessage = (error as Error).message;
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
