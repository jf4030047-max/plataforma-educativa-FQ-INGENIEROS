/**
 * 📧 SISTEMA DE NOTIFICACIONES POR EMAIL
 * Administra notificaciones automáticas en Firestore
 * Cloud Functions ejecuta envío real de emails
 */

class NotificationService {
  /**
   * Crear notificación en Firestore (Cloud Functions la procesa)
   */
  static async createNotification(userId, type, data) {
    try {
      const notif = {
        id: 'notif_' + Date.now(),
        userId,
        type, // 'enrollment', 'payment_approved', 'exam_result', 'certificate_ready'
        data,
        read: false,
        createdAt: new Date(),
        processedAt: null,
        status: 'pending' // pending, sent, failed
      };

      await firebase.firestore()
        .collection('notifications')
        .doc(notif.id)
        .set(notif);

      return notif;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Enviar emails (se ejecuta desde Cloud Functions)
   * Esta función es llamada automáticamente por triggers de Firebase
   */
  static async sendNotificationEmail(userId, type, data) {
    const templates = {
      enrollment: {
        subject: 'Matriculación Confirmada',
        template: `
          <h2>¡Te has matriculado exitosamente!</h2>
          <p>Curso: <strong>${data.courseName}</strong></p>
          <p>Horario: ${data.schedule}</p>
          <p><a href="${data.courseLink}">Ver curso →</a></p>
        `
      },
      payment_approved: {
        subject: 'Pago Aprobado',
        template: `
          <h2>Tu pago ha sido aprobado</h2>
          <p>Curso: <strong>${data.courseName}</strong></p>
          <p>Monto: S/ ${data.amount}</p>
          <p>Transacción: ${data.transactionId}</p>
        `
      },
      payment_rejected: {
        subject: 'Pago Rechazado',
        template: `
          <h2>Tu pago ha sido rechazado</h2>
          <p>Curso: <strong>${data.courseName}</strong></p>
          <p>Motivo: ${data.reason}</p>
          <p><a href="${data.contactLink}">Contacta soporte →</a></p>
        `
      },
      exam_result: {
        subject: data.passed ? 'Examen Aprobado' : 'Examen No Aprobado',
        template: `
          <h2>${data.passed ? '¡Aprobaste!' : 'No aprobaste esta vez'}</h2>
          <p>Curso: <strong>${data.courseName}</strong></p>
          <p>Calificación: <strong>${data.percentage}%</strong></p>
          <p>${data.passed ? 'Tu certificado está listo para descargar.' : 'Puedes intentarlo nuevamente.'}</p>
          <p><a href="${data.dashboardLink}">Ver resultados →</a></p>
        `
      },
      certificate_ready: {
        subject: 'Tu Certificado está Listo',
        template: `
          <h2>Tu certificado está disponible</h2>
          <p>Curso: <strong>${data.courseName}</strong></p>
          <p>Tipo: ${data.certificateType}</p>
          <p><a href="${data.certificateLink}">Descargar certificado →</a></p>
        `
      },
      session_reminder: {
        subject: 'Recordatorio: Sesión en vivo próximamente',
        template: `
          <h2>No olvides tu sesión</h2>
          <p>Curso: <strong>${data.courseName}</strong></p>
          <p>Fecha y hora: ${data.sessionDateTime}</p>
          <p><a href="${data.zoomLink}">Unirse a la sesión →</a></p>
        `
      }
    };

    return templates[type] || templates.enrollment;
  }

  /**
   * Marcar notificación como leída
   */
  static async markAsRead(notificationId) {
    try {
      await firebase.firestore()
        .collection('notifications')
        .doc(notificationId)
        .update({
          read: true
        });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Obtener notificaciones del usuario
   */
  static async getNotifications(userId, limit = 10) {
    try {
      const snapshot = await firebase.firestore()
        .collection('notifications')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Obtener notificaciones no leídas
   */
  static async getUnreadCount(userId) {
    try {
      const snapshot = await firebase.firestore()
        .collection('notifications')
        .where('userId', '==', userId)
        .where('read', '==', false)
        .get();

      return snapshot.size;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Crear notificación de matrícula
   */
  static async notifyEnrollment(userId, userEmail, courseName, schedule, courseId) {
    return this.createNotification(userId, 'enrollment', {
      email: userEmail,
      courseName,
      schedule,
      courseLink: `/cursos/curso.html?id=${courseId}`
    });
  }

  /**
   * Crear notificación de pago aprobado
   */
  static async notifyPaymentApproved(userId, userEmail, courseName, amount, transactionId) {
    return this.createNotification(userId, 'payment_approved', {
      email: userEmail,
      courseName,
      amount,
      transactionId
    });
  }

  /**
   * Crear notificación de examen
   */
  static async notifyExamResult(userId, userEmail, courseName, percentage, passed) {
    return this.createNotification(userId, 'exam_result', {
      email: userEmail,
      courseName,
      percentage,
      passed,
      dashboardLink: '/dashboard/index.html'
    });
  }

  /**
   * Crear notificación de certificado listo
   */
  static async notifyCertificateReady(userId, userEmail, courseName, certificateType, certificateUrl) {
    return this.createNotification(userId, 'certificate_ready', {
      email: userEmail,
      courseName,
      certificateType: certificateType === 'constancia' ? 'Constancia' : 'Certificado',
      certificateLink: certificateUrl
    });
  }

  /**
   * Recordatorio de sesión (24 horas antes)
   */
  static async notifySessionReminder(userId, userEmail, courseName, sessionDateTime, zoomLink) {
    return this.createNotification(userId, 'session_reminder', {
      email: userEmail,
      courseName,
      sessionDateTime,
      zoomLink
    });
  }
}

window.NotificationService = NotificationService;
