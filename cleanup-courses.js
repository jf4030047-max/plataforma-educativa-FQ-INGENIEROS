const admin = require('firebase-admin');
const serviceAccount = require('./fq-ingenieros-educativa-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://fq-ingenieros-educativa.firebaseio.com'
});

const db = admin.firestore();

async function limpiar() {
  try {
    // Eliminar cursos problemáticos
    const cursosParaEliminar = [
      'topografia-civil3d',  // Duplicado sin datos
      'prueba'               // Curso de prueba
    ];

    for (const cursoId of cursosParaEliminar) {
      await db.collection('courses').doc(cursoId).delete();
      console.log(`✅ Eliminado: ${cursoId}`);
    }

    console.log('\n✅ Limpieza completada');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

limpiar();
