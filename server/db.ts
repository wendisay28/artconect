
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let db;

try {
  const app = initializeApp({
    credential: cert({
      projectId: "buscart-e1beb",
      clientEmail: "firebase-adminsdk-wq4g9@buscart-e1beb.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nTU_CLAVE_PRIVADA_AQUÍ\n-----END PRIVATE KEY-----\n"
    })
  });

  db = getFirestore(app);
  console.log('✅ Firebase Admin inicializado correctamente');
} catch (error) {
  console.error('❌ Error inicializando Firebase Admin:', error);
  throw error;
}

export { db };
