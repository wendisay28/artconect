import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Obtenemos las variables de entorno de manera segura
const firebaseApiKey = typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_FIREBASE_API_KEY : process.env.VITE_FIREBASE_API_KEY;
const firebaseProjectId = typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_FIREBASE_PROJECT_ID : process.env.VITE_FIREBASE_PROJECT_ID;
const firebaseAppId = typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_FIREBASE_APP_ID : process.env.VITE_FIREBASE_APP_ID;

// Verifica si tenemos las variables necesarias
const hasRequiredEnvVars = firebaseApiKey && firebaseProjectId && firebaseAppId;

console.log("Firebase Auth Domain Info:", {
  domain: window.location.hostname,
  projectId: firebaseProjectId
});

// Configuración de Firebase con dominio dinámico
const currentDomain = window.location.hostname;

const firebaseConfig = {
  apiKey: firebaseApiKey || "",
  authDomain: `${firebaseProjectId || ""}.firebaseapp.com`,
  authEmulator: currentDomain.includes('replit') ? `https://${currentDomain}` : undefined,
  projectId: firebaseProjectId || "",
  storageBucket: `${firebaseProjectId || ""}.appspot.com`,
  appId: firebaseAppId || "",
};

// Initialize Firebase objects
let app = {};
let auth = { currentUser: null, onAuthStateChanged: () => {}, signOut: async () => {} };
let db = { collection: () => {} };
let storage = {};

try {
  if (!hasRequiredEnvVars) {
    throw new Error("Firebase configuration is incomplete. Check your environment variables.");
  }
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log("Firebase initialized successfully with config:", 
    { projectId: firebaseConfig.projectId, authDomain: firebaseConfig.authDomain });
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

export { app, auth, db, storage };