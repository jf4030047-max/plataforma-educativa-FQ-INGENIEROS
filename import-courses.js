// Script para importar cursos a Firestore usando REST API
const fs = require('fs');

// Leer los datos del JSON
const courseData = JSON.parse(fs.readFileSync('./COURSE_DATA_EXTRACTED.json', 'utf-8'));

// Importar con REST API
async function importarCursos() {
  const courses = courseData.courses;
  let contador = 0;

  for (const courseId in courses) {
    const curso = courses[courseId];
    
    const nuevosCurso = {
      name: curso.name,
      fecha: new Date().toISOString().split('T')[0],
      temaPrincipal: curso.tags ? curso.tags[0] : 'General',
      precio: curso.price || 0,
      description: curso.desc,
      duration: curso.duration,
      sessions: curso.sessions,
      modality: curso.modality,
      status: curso.status,
      active: true,
      createdAt: new Date()
    };

    try {
      const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/fq-ingenieros-educativa/databases/(default)/documents/courses?documentId=${courseId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: Object.entries(nuevosCurso).reduce((acc, [key, value]) => {
              if (typeof value === 'string') acc[key] = { stringValue: value };
              else if (typeof value === 'number') acc[key] = { integerValue: String(value) };
              else if (typeof value === 'boolean') acc[key] = { booleanValue: value };
              else if (value instanceof Date) acc[key] = { timestampValue: value.toISOString() };
              return acc;
            }, {})
          })
        }
      );

      if (response.ok) {
        contador++;
        console.log(`✅ ${curso.name}`);
      } else {
        console.error(`❌ Error en ${curso.name}: ${response.statusText}`);
      }
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
    }
  }

  console.log(`\n✅ Se importaron ${contador} cursos correctamente`);
}

importarCursos().catch(err => console.error('Error:', err));
