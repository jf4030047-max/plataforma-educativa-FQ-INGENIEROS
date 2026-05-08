// restore-courses.js
// Script para restaurar cursos en Firestore desde COURSE_DATA_EXTRACTED.json
// Ejecuta: node restore-courses.js

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Cambia la ruta si tu serviceAccountKey está en otro lugar
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const dataPath = path.join(__dirname, 'COURSE_DATA_EXTRACTED.json');
const raw = fs.readFileSync(dataPath, 'utf8');
const coursesData = JSON.parse(raw).courses;

async function restoreCourses() {
  for (const [id, course] of Object.entries(coursesData)) {
    // Puedes ajustar los campos según tu estructura en Firestore
    await db.collection('courses').doc(id).set({
      ...course,
      active: course.status === 'disponible',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('Restaurado:', course.name);
  }
  console.log('Todos los cursos restaurados.');
  process.exit(0);
}

restoreCourses().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
