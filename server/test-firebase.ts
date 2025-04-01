
import { db } from './db.js';

async function testFirebaseConnection() {
  console.log('🔄 Iniciando prueba de conexión a Firebase...');
  
  try {
    console.log('📝 Intentando crear una colección de prueba...');
    const testCollection = db.collection('test');
    
    console.log('📤 Intentando escribir un documento...');
    const testDoc = await testCollection.add({
      message: 'Test connection',
      timestamp: new Date(),
      test: true
    });
    console.log('✅ Documento creado exitosamente con ID:', testDoc.id);

    console.log('📥 Intentando leer el documento...');
    const doc = await testDoc.get();
    if (doc.exists) {
      console.log('✅ Documento leído exitosamente:', doc.data());
    } else {
      console.error('❌ El documento no existe después de crearlo');
    }

    console.log('🗑️ Limpiando - eliminando documento de prueba...');
    await testDoc.delete();
    console.log('✅ Documento eliminado exitosamente');

    console.log('🎉 Todas las pruebas completadas con éxito');
    return true;
  } catch (error) {
    console.error('❌ Error detallado:', error);
    if (error instanceof Error) {
      console.error('Mensaje de error:', error.message);
      console.error('Stack trace:', error.stack);
    }
    return false;
  }
}

testFirebaseConnection();
