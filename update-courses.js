#!/usr/bin/env node

/**
 * Script para actualizar datos de cursos en Firestore
 * Uso: node update-courses.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccountPath = path.join(__dirname, 'firebase-key.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('❌ Error: No se encontró firebase-key.json');
  console.error('Necesitas descargar la clave de servicio desde Firebase Console:');
  console.error('Project Settings > Service Accounts > Generate new private key');
  process.exit(1);
}

const db = admin.firestore();

const COURSES_TO_UPDATE = [
  {
    id: 'sst-obras-civiles',
    name: 'Seguridad y Salud en el Trabajo en Obras Civiles',
    updateData: {
      schedules: [
        { id: 'h1', label: 'Viernes (Opción 1)', detail: '5:00 p.m. — 6:00 p.m. • Viernes 22 de mayo' },
        { id: 'h2', label: 'Viernes (Opción 2)', detail: '7:00 p.m. — 8:00 p.m. • Viernes 22 de mayo' }
      ],
      startDate: '2026-05-22'
    }
  }
];

async function updateCourses() {
  try {
    console.log('🔄 Actualizando cursos en Firestore...\n');

    let updatedCount = 0;

    for (const course of COURSES_TO_UPDATE) {
      try {
        await db.collection('courses').doc(course.id).update(course.updateData);
        console.log(`✅ "${course.name}"`);
        console.log(`   ID: ${course.id}`);
        console.log(`   Fecha: ${course.updateData.startDate}`);
        console.log(`   Horarios: ${course.updateData.schedules.map(s => s.label).join(', ')}\n`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Error actualizando ${course.id}:`, error.message);
      }
    }

    console.log(`\n✨ Actualización completada: ${updatedCount} curso(s) actualizado(s)\n`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateCourses();
