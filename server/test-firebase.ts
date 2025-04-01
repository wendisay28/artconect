
import { db } from './db';

async function testFirebaseConnection() {
  try {
    console.log('🔄 Iniciando prueba de conexión a Firebase...');
    
    // Intentar crear una colección de prueba
    const testCollection = db.collection('test');
    
    // Crear un documento de prueba
    const testDoc = await testCollection.add({
      message: 'Test connection',
      timestamp: new Date(),
      test: true
    });
    
    console.log('✅ Documento creado con ID:', testDoc.id);
    
    // Leer el documento
    const doc = await testDoc.get();
    console.log('📄 Datos del documento:', doc.data());
    
    // Eliminar el documento de prueba
    await testDoc.delete();
    console.log('🗑️ Documento eliminado');
    
    console.log('✅ Prueba completada exitosamente');
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    throw error;
  }
}

// Ejecutar la prueba
testFirebaseConnection()
  .then(() => console.log('✅ Test finalizado'))
  .catch((error) => {
    console.error('❌ Test fallido:', error);
    process.exit(1);
  });
