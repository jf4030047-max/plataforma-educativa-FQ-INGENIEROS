/**
 * 📧 CLOUD FUNCTIONS - AUTOMATIZACIÓN DE NOTIFICACIONES Y EMAILS
 * 
 * Este archivo debe ser ubicado en: /functions/index.js
 * Requiere: Firebase Admin SDK, Nodemailer
 * 
 * Instalación:
 * cd functions
 * npm install firebase-admin nodemailer
 * 
 * Deploy:
 * firebase deploy --only functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

// ═══════════════════════════════════════════════════════════════
// CONFIGURAR TRANSPORTE DE EMAIL
// Reemplaza con credenciales reales (Gmail, SendGrid, etc.)
// ═══════════════════════════════════════════════════════════════

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Configurar en .env o Firebase console
    pass: process.env.EMAIL_PASSWORD
  }
});

// ALTERNATIVA: Usar SendGrid
// const sgTransport = require('nodemailer-sendgrid-transport');
// const transporter = nodemailer.createTransport(
//   sgTransport({
//     auth: {
//       api_key: process.env.SENDGRID_API_KEY
//     }
//   })
// );

// ═══════════════════════════════════════════════════════════════
// TRIGGER: Cuando se crea una notificación, enviar email
// ═══════════════════════════════════════════════════════════════

exports.sendNotificationEmail = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();
    const notifId = context.params.notificationId;

    try {
      // Obtener datos del usuario
      const userDoc = await db.collection('users').doc(notification.userId).get();
      const userData = userDoc.data();
      const userEmail = notification.data.email || userData.email;

      // Generar contenido del email basado en tipo
      const emailContent = generateEmailContent(notification.type, notification.data);

      // Enviar email
      const mailOptions = {
        from: `FQ INGENIEROS <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: emailContent.subject,
        html: generateHTMLTemplate(emailContent.subject, emailContent.template)
      };

      await transporter.sendMail(mailOptions);

      // Marcar como enviado
      await snap.ref.update({
        status: 'sent',
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`Email enviado a ${userEmail} - Tipo: ${notification.type}`);
    } catch (error) {
      console.error('Error sending email:', error);

      // Marcar como fallido para reintentar
      await snap.ref.update({
        status: 'failed',
        error: error.message,
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

// ═══════════════════════════════════════════════════════════════
// TRIGGER: Cuando se aprueba un examen, generar certificado
// ═══════════════════════════════════════════════════════════════

exports.onExamSubmitted = functions.firestore
  .document('exams/{examId}')
  .onCreate(async (snap, context) => {
    const exam = snap.data();

    try {
      // Obtener datos del curso
      const courseDoc = await db.collection('courses').doc(exam.courseId).get();
      const courseData = courseDoc.data();

      // Obtener datos del usuario
      const userDoc = await db.collection('users').doc(exam.userId).get();
      const userData = userDoc.data();

      // CREAR CONSTANCIA automáticamente (siempre)
      await createCertificateRecord(
        exam.userId,
        exam.userEmail,
        exam.courseId,
        courseData.name,
        null,
        'constancia'
      );

      // Si APROBÓ, crear CERTIFICADO
      if (exam.passed) {
        await createCertificateRecord(
          exam.userId,
          exam.userEmail,
          exam.courseId,
          courseData.name,
          exam.percentage,
          'certificado'
        );

        // Enviar notificación
        await db.collection('notifications').doc().set({
          userId: exam.userId,
          type: 'certificate_ready',
          data: {
            email: exam.userEmail,
            courseName: courseData.name,
            certificateType: 'Certificado de Aprobación',
            dashboardLink: '/dashboard/index.html'
          },
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'pending'
        });
      }

      // Marcar enrollment como completado
      const enrollmentId = `${exam.userId}_${exam.courseId}`;
      await db.collection('enrollments').doc(enrollmentId).update({
        status: 'completed',
        progress: 100,
        completedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`Certificados generados para exam ${context.params.examId}`);
    } catch (error) {
      console.error('Error processing exam:', error);
    }
  });

// ═══════════════════════════════════════════════════════════════
// TRIGGER: Cuando se aprueba un pago, activar matrícula
// ═══════════════════════════════════════════════════════════════

exports.onPaymentApproved = functions.firestore
  .document('payments/{paymentId}')
  .onUpdate(async (change, context) => {
    const newPayment = change.after.data();
    const oldPayment = change.before.data();

    // Solo procesar si cambió a 'verified'
    if (oldPayment.status !== 'verified' && newPayment.status === 'verified') {
      try {
        // Crear/activar matrícula
        const enrollmentId = `${newPayment.userId}_${newPayment.courseId}`;
        const enrollmentRef = db.collection('enrollments').doc(enrollmentId);
        const enrollmentSnap = await enrollmentRef.get();

        if (!enrollmentSnap.exists) {
          // Crear matrícula
          await enrollmentRef.set({
            userId: newPayment.userId,
            courseId: newPayment.courseId,
            courseName: newPayment.courseName,
            status: 'active',
            enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
            progress: 0,
            schedule: 'Por definir'
          });
        } else {
          // Activar matrícula existente
          await enrollmentRef.update({
            status: 'active'
          });
        }

        // Enviar notificación
        await db.collection('notifications').doc().set({
          userId: newPayment.userId,
          type: 'payment_approved',
          data: {
            email: newPayment.userEmail,
            courseName: newPayment.courseName,
            amount: newPayment.amount,
            transactionId: context.params.paymentId
          },
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'pending'
        });

        console.log(`Pago verificado y matrícula activada: ${context.params.paymentId}`);
      } catch (error) {
        console.error('Error processing payment:', error);
      }
    }
  });

// ═══════════════════════════════════════════════════════════════
// TRIGGER: Recordatorios automáticos de sesiones (24 horas antes)
// Ejecutar con Cloud Scheduler
// ═══════════════════════════════════════════════════════════════

exports.sendSessionReminders = functions.pubsub
  .schedule('every 1 hours')
  .timeZone('America/Lima')
  .onRun(async (context) => {
    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Obtener sesiones en las próximas 24 horas
      const sessionsSnap = await db.collection('sessions')
        .where('startTime', '>=', now)
        .where('startTime', '<=', tomorrow)
        .where('reminderSent', '==', false)
        .get();

      for (const sessionDoc of sessionsSnap.docs) {
        const session = sessionDoc.data();

        // Obtener estudiantes inscritos en ese curso
        const enrollmentsSnap = await db.collection('enrollments')
          .where('courseId', '==', session.courseId)
          .where('status', '==', 'active')
          .get();

        for (const enrollmentDoc of enrollmentsSnap.docs) {
          const enrollment = enrollmentDoc.data();

          // Obtener email del usuario
          const userDoc = await db.collection('users').doc(enrollment.userId).get();
          const userData = userDoc.data();

          // Crear notificación de recordatorio
          await db.collection('notifications').doc().set({
            userId: enrollment.userId,
            type: 'session_reminder',
            data: {
              email: userData.email,
              courseName: session.courseName,
              sessionDateTime: formatDateTime(session.startTime),
              zoomLink: session.zoomLink
            },
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
          });
        }

        // Marcar como recordatorio enviado
        await sessionDoc.ref.update({
          reminderSent: true
        });
      }

      console.log(`Recordatorios de sesiones enviados: ${sessionsSnap.size}`);
    } catch (error) {
      console.error('Error sending session reminders:', error);
    }
  });

// ═══════════════════════════════════════════════════════════════
// FUNCIONES AUXILIARES
// ═══════════════════════════════════════════════════════════════

function generateEmailContent(notificationType, data) {
  const templates = {
    enrollment: {
      subject: '✅ Matriculación Confirmada',
      template: `
        <h2>¡Te has matriculado exitosamente!</h2>
        <p>Curso: <strong>${data.courseName}</strong></p>
        <p>Horario: ${data.schedule}</p>
        <p><a href="https://plataforma.fqingenieros.com${data.courseLink}" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver curso</a></p>
      `
    },
    payment_approved: {
      subject: '💳 Pago Aprobado',
      template: `
        <h2>Tu pago ha sido aprobado exitosamente</h2>
        <p>Curso: <strong>${data.courseName}</strong></p>
        <p>Monto: <strong>S/ ${data.amount.toFixed(2)}</strong></p>
        <p>Transacción: ${data.transactionId}</p>
        <p>Ahora puedes acceder completamente al curso.</p>
      `
    },
    payment_rejected: {
      subject: '❌ Pago Rechazado',
      template: `
        <h2>Tu pago ha sido rechazado</h2>
        <p>Curso: <strong>${data.courseName}</strong></p>
        <p>Motivo: ${data.reason}</p>
        <p>Por favor contacta con nuestro equipo de soporte.</p>
      `
    },
    exam_result: {
      subject: data.passed ? '🎉 ¡Examen Aprobado!' : '📝 Resultado del Examen',
      template: `
        <h2>${data.passed ? '¡Aprobaste el examen!' : 'No aprobaste esta vez'}</h2>
        <p>Curso: <strong>${data.courseName}</strong></p>
        <p>Calificación: <strong>${data.percentage}%</strong></p>
        <p>${data.passed ? 'Tu certificado está listo para descargar.' : 'Puedes intentarlo nuevamente.'}</p>
      `
    },
    certificate_ready: {
      subject: '📜 Tu Certificado está Listo',
      template: `
        <h2>Tu certificado está disponible</h2>
        <p>Curso: <strong>${data.courseName}</strong></p>
        <p>Tipo: ${data.certificateType}</p>
        <p><a href="${data.certificateLink}" style="background: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Descargar certificado</a></p>
      `
    },
    session_reminder: {
      subject: '🎯 Recordatorio: Sesión en vivo próximamente',
      template: `
        <h2>No olvides tu sesión</h2>
        <p>Curso: <strong>${data.courseName}</strong></p>
        <p>Fecha y hora: ${data.sessionDateTime}</p>
        <p><a href="${data.zoomLink}" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Unirse a la sesión</a></p>
      `
    }
  };

  return templates[notificationType] || templates.enrollment;
}

function generateHTMLTemplate(subject, content) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Inter', sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .body { background: #f9f9f9; padding: 20px; }
          .footer { background: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
          a { color: #667eea; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>FQ INGENIEROS</h1>
            <p>Plataforma Educativa</p>
          </div>
          <div class="body">
            ${content}
            <p style="margin-top: 30px; color: #666; font-size: 14px;">Si tienes preguntas, contacta con nuestro equipo de soporte.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 FQ INGENIEROS - Todos los derechos reservados</p>
            <p><a href="https://plataforma.fqingenieros.com">Visita nuestra plataforma</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

async function createCertificateRecord(userId, userEmail, courseId, courseName, score, certificateType) {
  // Aquí se registra que se generó un certificado
  // El certificado PDF se genera en el cliente (certificate-generator.js)
  // Esta función solo registra el evento
  
  await db.collection('certificates').doc().set({
    userId,
    userEmail,
    courseId,
    courseName,
    type: certificateType,
    score: score || 0,
    issuedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

function formatDateTime(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
