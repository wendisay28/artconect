
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { db } from './db.js';

const testFirebaseConnection = async () => {
  try {
    console.log('🔄 Iniciando prueba de conexión a Firebase...');
    
    const testCollection = db.collection('test');
    const data = {
      message: 'Test connection',
      timestamp: Timestamp.now(),
      test: true
    };
    
    console.log('📝 Intentando escribir datos:', data);
    const testDoc = await testCollection.add(data);
    console.log('✅ Documento creado con ID:', testDoc.id);
    
    const doc = await testDoc.get();
    console.log('📄 Datos del documento:', doc.data());
    
    await testDoc.delete();
    console.log('🗑️ Documento eliminado');
    
    console.log('✅ Prueba completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    process.exit(1);
  }
};

testFirebaseConnection();
