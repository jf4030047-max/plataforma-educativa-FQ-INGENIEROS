#!/usr/bin/env node
/**
 * Restaurador de datos de cursos a Firestore
 * Restaura los cursos con toda su información completa
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

async function restaurarCursos() {
  try {
    // Leer credenciales
    const credentialsPath = path.join(__dirname, 'serviceAccountKey.json');
    if (!fs.existsSync(credentialsPath)) {
      console.error('❌ No se encontró serviceAccountKey.json');
      return;
    }

    const serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    
    // Inicializar Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://fq-ingenieros-educativa.firebaseio.com'
    });

    const db = admin.firestore();

    // Datos completos de cursos a restaurar
    const cursos = [
      {
        id: 'Wa2NuxyWwKyYmaNqP17T',
        name: 'Seguridad y Salud en el Trabajo en Obras Civiles',
        price: 0,
        priceLabel: 'Gratis',
        priceDisplay: 'Gratis',
        desc: 'Conoce los fundamentos de la Seguridad y Salud en el Trabajo aplicados a obras civiles, incluyendo marco legal peruano, identificación de peligros y riesgos, investigación de incidentes y elaboración de análisis de riesgos según normativa vigente.',
        duration: '1 hora',
        sessions: 1,
        modality: 'En vivo + Grabado',
        fecha: '2026-05-22',
        startDate: '2026-05-22',
        startTime: '5:00 p.m.',
        endTime: '6:00 p.m.',
        tags: ['Seguridad', 'Obras Civiles', 'Normativa'],
        status: 'disponible',
        active: true,
        temario: [
          'Fundamentos de SST',
          'Marco legal peruano',
          'Identificación de peligros y riesgos',
          'Investigación de incidentes',
          'Análisis de riesgos'
        ],
        includes: [
          { icon: 'videocam', text: 'Clases en vivo por Zoom' },
          { icon: 'play_circle', text: 'Grabaciones disponibles' },
          { icon: 'description', text: 'Material descargable' },
          { icon: 'workspace_premium', text: 'Constancia de participación' }
        ],
        schedules: [
          { id: 'sst-schedule-1', label: 'Jueves (Opción 1)', detail: '5:00 p.m. — 6:00 p.m.' },
          { id: 'sst-schedule-2', label: 'Jueves (Opción 2)', detail: '7:00 p.m. — 8:00 p.m.' }
        ],
        enrolled: 0
      },
      {
        id: 'supervision-obra',
        name: 'Supervisión de Obra',
        price: 120,
        priceLabel: 'S/ 120',
        priceDisplay: 'S/ 120',
        desc: 'Técnicas y normas para supervising de proyectos civiles',
        duration: '4 horas',
        sessions: 4,
        modality: 'En vivo + Grabado',
        status: 'proximamente',
        active: false,
        temario: [
          'Normas de Supervisión',
          'Control de Calidad',
          'Seguridad en Obra'
        ],
        enrolled: 0
      },
      {
        id: 'topografia-civil3d',
        name: 'Topografía en Civil 3D',
        price: 150,
        priceLabel: 'S/ 150',
        priceDisplay: 'S/ 150',
        desc: 'Aprende a utilizar Civil 3D para proyectos topográficos',
        duration: '8 horas',
        sessions: 8,
        modality: 'En vivo + Grabado',
        status: 'disponible',
        active: true,
        temario: [
          'Fundamentos de Topografía',
          'Levantamiento Topográfico',
          'AutoCAD Civil 3D',
          'Modelado de superficies TIN',
          'Diseño de alineamientos y perfiles'
        ],
        enrolled: 0
      }
    ];

    console.log('🔄 Iniciando restauración de cursos...\n');

    for (const curso of cursos) {
      try {
        await db.collection('courses').doc(curso.id).set(curso, { merge: true });
        console.log(`✅ Restaurado: ${curso.name}`);
      } catch (error) {
        console.error(`❌ Error restaurando ${curso.name}: ${error.message}`);
      }
    }

    console.log('\n✅ ¡Restauración completada!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  }
}

restaurarCursos();
