const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

admin.initializeApp();

// Usar variable de entorno
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendPaymentConfirmation = functions.firestore
  .document('payments/{paymentId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const msg = {
      to: data.email,
      from: 'certificados@fqingenieros.com', // Cambia por tu correo verificado en SendGrid
      subject: 'Confirmación de registro de pago - FQ Ingenieros',
      html: `
        <h2>¡Hola, ${data.fullName}!</h2>
        <p>Hemos recibido tu comprobante de pago para el curso <strong>${data.course}</strong>.</p>
        <p>En un máximo de 24 horas validaremos tu pago y te enviaremos tu certificado digital.</p>
        <p>Gracias por confiar en FQ Ingenieros.</p>
        <hr>
        <small>No respondas a este correo. Plataforma Educativa FQ Ingenieros.</small>
      `,
    };
    try {
      await sgMail.send(msg);
      console.log('Correo de confirmación enviado a', data.email);
    } catch (error) {
      console.error('Error enviando correo:', error);
    }
    return null;
  });
