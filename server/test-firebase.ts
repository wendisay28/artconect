
import { db } from './db';
import { Timestamp } from 'firebase-admin/firestore';

async function testFirebaseConnection() {
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
    return true;
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    throw error;
  }
}

// Ejecutar la prueba
testFirebaseConnection()
  .then(() => {
    console.log('✅ Test finalizado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test fallido:', error);
    process.exit(1);
  });
