
import { db } from './db';

async function testFirebaseConnection() {
  try {
    // Test creating a document
    const testCollection = db.collection('test');
    const testDoc = await testCollection.add({
      message: 'Test connection',
      timestamp: new Date()
    });
    console.log('✅ Documento creado exitosamente:', testDoc.id);

    // Test reading the document
    const doc = await testDoc.get();
    if (doc.exists) {
      console.log('✅ Documento leído exitosamente:', doc.data());
    }

    // Clean up - delete test document
    await testDoc.delete();
    console.log('✅ Documento eliminado exitosamente');

    console.log('🎉 Todas las pruebas completadas con éxito');
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  }
}

// Ejecutar prueba
testFirebaseConnection();
