import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const firebaseProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const firebaseAppId = import.meta.env.VITE_FIREBASE_APP_ID;

if (!firebaseApiKey || !firebaseProjectId || !firebaseAppId) {
  throw new Error("Firebase environment variables are missing");
}

const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: `${firebaseProjectId}.firebaseapp.com`,
  projectId: firebaseProjectId,
  storageBucket: `${firebaseProjectId}.appspot.com`,
  appId: firebaseAppId,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };