import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Obtenemos las variables de entorno de manera segura
const firebaseApiKey = typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_FIREBASE_API_KEY : process.env.VITE_FIREBASE_API_KEY;
const firebaseProjectId = typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_FIREBASE_PROJECT_ID : process.env.VITE_FIREBASE_PROJECT_ID;
const firebaseAppId = typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_FIREBASE_APP_ID : process.env.VITE_FIREBASE_APP_ID;

// Verifica si tenemos las variables necesarias, de lo contrario usa valores vacíos (solo para desarrollo)
const hasRequiredEnvVars = firebaseApiKey && firebaseProjectId && firebaseAppId;

console.log("Firebase Auth Domain Info:", {
  domain: window.location.hostname,
  projectId: firebaseProjectId
});

// Configuración de Firebase con dominio dinámico
// Usamos el dominio actual para autenticación (para desarrollo en Replit)
const currentDomain = window.location.hostname;

const firebaseConfig = {
  apiKey: firebaseApiKey || "",
  // Usamos el dominio actual de Replit para desarrollo y el dominio de Firebase para producción
  authDomain: `${firebaseProjectId || ""}.firebaseapp.com`,
  // Para desarrollo local en Replit
  authEmulator: currentDomain.includes('replit') ? `https://${currentDomain}` : undefined,
  projectId: firebaseProjectId || "",
  storageBucket: `${firebaseProjectId || ""}.appspot.com`,
  appId: firebaseAppId || "",
};

// Inicializa Firebase solo si tenemos las variables de entorno necesarias
// o si estamos en modo de desarrollo
let app, auth, db, storage;

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
} else {
    console.warn("Firebase configuration is incomplete. Some features may not work.");
    
    // Crear objetos simulados para desarrollo
    app = {};
    auth = { currentUser: null, onAuthStateChanged: () => {}, signOut: async () => {} };
    db = { collection: () => {} };
    storage = {};
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
  
  // Crear objetos simulados para manejo de errores
  app = {};
  auth = { currentUser: null, onAuthStateChanged: () => {}, signOut: async () => {} };
  db = { collection: () => {} };
  storage = {};
}

export { app, auth, db, storage };
