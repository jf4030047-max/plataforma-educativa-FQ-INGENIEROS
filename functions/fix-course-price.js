#!/usr/bin/env node

/**
 * Script para corregir el precio del curso "topografia-civil-3d" a 200 soles
 * Usar: node fix-course-price.js
 */

const admin = require('firebase-admin');

// Inicializar Firebase Admin
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixCoursePrice() {
    try {
        console.log('🔄 Actualizando precio del curso...');

        const courseId = 'topografia-civil-3d';
        const newPrice = 200;

        // Obtener el curso actual
        const courseDoc = await db.collection('courses').doc(courseId).get();
        
        if (!courseDoc.exists) {
            console.error('❌ Curso no encontrado:', courseId);
            process.exit(1);
        }

        console.log('📚 Curso encontrado:', courseDoc.data());
        console.log(`💰 Precio actual: S/ ${courseDoc.data().price || courseDoc.data().precio}`);
        console.log(`✏️ Nuevo precio: S/ ${newPrice}`);

        // Actualizar el precio
        await db.collection('courses').doc(courseId).update({
            price: newPrice,
            precio: newPrice,
            updatedAt: new Date(),
            updatedBy: 'admin-script'
        });

        console.log('✅ Precio actualizado exitosamente');
        
        // Verificar
        const updatedDoc = await db.collection('courses').doc(courseId).get();
        console.log('🔍 Verificación:', {
            id: updatedDoc.id,
            name: updatedDoc.data().name,
            price: updatedDoc.data().price,
            precio: updatedDoc.data().precio
        });

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixCoursePrice();
