
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
  console.error("⚠️ Configurando Firebase con credenciales de prueba");
  // Usar credenciales de prueba si no están configuradas
  process.env.FIREBASE_PROJECT_ID = "buscart-e1beb";
  process.env.FIREBASE_CLIENT_EMAIL = "firebase-adminsdk-YOUR-EMAIL";
  process.env.FIREBASE_PRIVATE_KEY = "YOUR-PRIVATE-KEY";
}

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

export const db = getFirestore(app);
