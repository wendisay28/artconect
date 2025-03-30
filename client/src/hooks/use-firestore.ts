import { useState } from "react";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  GeoPoint 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface FirestoreHookReturn {
  isLoading: boolean;
  error: Error | null;
  add: <T extends object>(collectionName: string, data: T) => Promise<string>;
  update: <T extends object>(collectionName: string, id: string, data: Partial<T>) => Promise<void>;
  remove: (collectionName: string, id: string) => Promise<void>;
  getById: <T>(collectionName: string, id: string) => Promise<T | null>;
  getAll: <T>(collectionName: string) => Promise<T[]>;
  getWhere: <T>(collectionName: string, field: string, operator: any, value: any) => Promise<T[]>;
}

export const useFirestore = (): FirestoreHookReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const handleError = (error: Error, operation: string) => {
    setError(error);
    toast({
      variant: "destructive", 
      title: `Error in ${operation}`,
      description: error.message,
    });
    console.error(`Error in ${operation}:`, error);
  };

  const add = async <T extends object>(collectionName: string, data: T): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (err) {
      handleError(err as Error, 'add operation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const update = async <T extends object>(collectionName: string, id: string, data: Partial<T>): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (err) {
      handleError(err as Error, 'update operation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const remove = async (collectionName: string, id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (err) {
      handleError(err as Error, 'remove operation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getById = async <T>(collectionName: string, id: string): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      } else {
        return null;
      }
    } catch (err) {
      handleError(err as Error, 'getById operation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getAll = async <T>(collectionName: string): Promise<T[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const data: T[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as T);
      });
      return data;
    } catch (err) {
      handleError(err as Error, 'getAll operation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getWhere = async <T>(collectionName: string, field: string, operator: any, value: any): Promise<T[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const q = query(collection(db, collectionName), where(field, operator, value));
      const querySnapshot = await getDocs(q);
      const data: T[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as T);
      });
      return data;
    } catch (err) {
      handleError(err as Error, 'getWhere operation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    add,
    update,
    remove,
    getById,
    getAll,
    getWhere,
  };
};
