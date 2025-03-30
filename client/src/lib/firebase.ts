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

// Configuración de Firebase
const firebaseConfig = {
  apiKey: firebaseApiKey || "",
  authDomain: `${firebaseProjectId || ""}.firebaseapp.com`,
  projectId: firebaseProjectId || "",
  storageBucket: `${firebaseProjectId || ""}.appspot.com`,
  appId: firebaseAppId || "",
};

// Inicializa Firebase solo si tenemos las variables de entorno necesarias
// o si estamos en modo de desarrollo
let app, auth, db, storage;

try {
  if (hasRequiredEnvVars) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log("Firebase initialized successfully");
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
