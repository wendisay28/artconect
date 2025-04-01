
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCBoZP34puZLNgXOd12g67pCStZ5XA_7ok",
  authDomain: "buscart-e1beb.firebaseapp.com",
  projectId: "buscart-e1beb",
  storageBucket: "buscart-e1beb.firebasestorage.app",
  messagingSenderId: "288663409318",
  appId: "1:288663409318:web:b0ed9915b80765a5519a67",
  measurementId: "G-75JBY8VWKL"
};

// Configurar dominios autorizados para desarrollo
if (window.location.hostname.includes('replit.dev')) {
  firebaseConfig.authDomain = window.location.hostname;
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
