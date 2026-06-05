/**
 * 🎥 ZOOM SERVICE
 * Gestiona: Links de sesiones, Asistencia automática, Recordatorios
 */

class ZoomService {
  static ZOOM_BASE = 'https://zoom.us/wc/join'; // URL para web join

  /**
   * Generar/Obtener link de sesión
   */
  static async getOrCreateSessionLink(courseId, sessionNumber, zoomMeetingId) {
    try {
      // Obtener sesión de Firestore
      const sessionId = `${courseId}_session_${sessionNumber}`;
      const sessionSnap = await firebase.firestore()
        .collection('sessions')
        .doc(sessionId)
        .get();

      if (sessionSnap.exists && sessionSnap.data().zoomLink) {
        // Retornar link existente
        return sessionSnap.data().zoomLink;
      }

      // Crear nuevo link (si tienes Zoom API integrada, aquí irían los detalles)
      // Por ahora, generamos un link modelo
      const zoomLink = `${this.ZOOM_BASE}/${zoomMeetingId || Math.random().toString().slice(2, 11)}`;

      // Guardar en Firestore
      const sessionData = {
        courseId,
        sessionNumber,
        zoomLink,
        zoomMeetingId: zoomMeetingId || null,
        createdAt: new Date(),
        reminderSent: false
      };

      await firebase.firestore()
        .collection('sessions')
        .doc(sessionId)
        .set(sessionData, { merge: true });

      return zoomLink;
    } catch (error) {
      console.error('Error creando link de Zoom:', error);
      return null;
    }
  }

  /**
   * Registrar acceso a sesión (asistencia automática)
   */
  static async recordJoin(courseId, sessionNumber, userId, userName) {
    try {
      const joinRecordId = `${courseId}_${sessionNumber}_${userId}_${Date.now()}`;

      await firebase.firestore()
        .collection('zoom_joins')
        .doc(joinRecordId)
        .set({
          courseId,
          sessionNumber,
          userId,
          userName,
          joinedAt: new Date(),
          duration: 0 // Se actualizará cuando salga
        });

      // Registrar asistencia automáticamente
      const attendanceId = `${courseId}_${sessionNumber}_${userId}`;
      await firebase.firestore()
        .collection('attendance')
        .doc(attendanceId)
        .set({
          courseId,
          sessionNumber,
          studentId: userId,
          present: true,
          recordedAt: new Date(),
          recordedBy: 'ZOOM_AUTO'
        }, { merge: true });

      return true;
    } catch (error) {
      console.error('Error registrando asistencia en Zoom:', error);
      return false;
    }
  }

  /**
   * Registrar salida de sesión
   */
  static async recordLeave(courseId, sessionNumber, userId, durationMinutes) {
    try {
      const joinRecords = await firebase.firestore()
        .collection('zoom_joins')
        .where('courseId', '==', courseId)
        .where('sessionNumber', '==', sessionNumber)
        .where('userId', '==', userId)
        .orderBy('joinedAt', 'desc')
        .limit(1)
        .get();

      if (!joinRecords.empty) {
        const lastRecord = joinRecords.docs[0];
        await lastRecord.ref.update({
          duration: durationMinutes,
          leftAt: new Date()
        });
      }

      return true;
    } catch (error) {
      console.error('Error registrando salida de Zoom:', error);
      return false;
    }
  }

  /**
   * Obtener participantes de una sesión
   */
  static async getSessionParticipants(courseId, sessionNumber) {
    try {
      const snapshot = await firebase.firestore()
        .collection('zoom_joins')
        .where('courseId', '==', courseId)
        .where('sessionNumber', '==', sessionNumber)
        .get();

      const participants = [];
      const uniqueUsers = new Set();

      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (!uniqueUsers.has(data.userId)) {
          uniqueUsers.add(data.userId);
          participants.push({
            userId: data.userId,
            userName: data.userName,
            joinedAt: data.joinedAt,
            duration: data.duration || 0
          });
        }
      }

      return participants;
    } catch (error) {
      console.error('Error obteniendo participantes:', error);
      return [];
    }
  }

  /**
   * Obtener duración promedio de sesión
   */
  static async getAverageSessionDuration(courseId, sessionNumber) {
    try {
      const participants = await this.getSessionParticipants(courseId, sessionNumber);
      if (participants.length === 0) return 0;

      const totalDuration = participants.reduce((sum, p) => sum + (p.duration || 0), 0);
      return Math.round(totalDuration / participants.length);
    } catch (error) {
      console.error('Error calculando duración promedio:', error);
      return 0;
    }
  }

  /**
   * Programar recordatorio automático (24h antes)
   */
  static async scheduleReminder(courseId, sessionNumber, startTime) {
    try {
      const reminderTime = new Date(startTime.toDate ? startTime.toDate() : new Date(startTime));
      reminderTime.setHours(reminderTime.getHours() - 24);

      const sessionId = `${courseId}_session_${sessionNumber}`;

      // Guardar recordatorio en Cloud Firestore
      await firebase.firestore()
        .collection('session_reminders')
        .doc(sessionId)
        .set({
          courseId,
          sessionNumber,
          scheduledFor: reminderTime,
          sessionStart: startTime,
          sent: false
        }, { merge: true });

      return true;
    } catch (error) {
      console.error('Error programando recordatorio:', error);
      return false;
    }
  }

  /**
   * Obtener información de la sesión
   */
  static async getSessionInfo(courseId, sessionNumber) {
    try {
      const sessionId = `${courseId}_session_${sessionNumber}`;
      const sessionSnap = await firebase.firestore()
        .collection('sessions')
        .doc(sessionId)
        .get();

      if (!sessionSnap.exists) return null;

      const sessionData = sessionSnap.data();

      return {
        courseId,
        sessionNumber,
        zoomLink: sessionData.zoomLink,
        startTime: sessionData.startTime,
        duration: sessionData.duration || 60,
        topic: sessionData.topic,
        recording: sessionData.recordingUrl || null,
        participants: await this.getSessionParticipants(courseId, sessionNumber),
        avgDuration: await this.getAverageSessionDuration(courseId, sessionNumber)
      };
    } catch (error) {
      console.error('Error obteniendo info de sesión:', error);
      return null;
    }
  }

  /**
   * Obtener grabaciones de un curso
   */
  static async getCourseRecordings(courseId) {
    try {
      const snapshot = await firebase.firestore()
        .collection('sessions')
        .where('courseId', '==', courseId)
        .where('recordingUrl', '!=', null)
        .orderBy('recordingUrl', 'desc')
        .orderBy('startTime', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        sessionNumber: doc.data().sessionNumber,
        topic: doc.data().topic,
        recordingUrl: doc.data().recordingUrl,
        startTime: doc.data().startTime,
        duration: doc.data().duration
      }));
    } catch (error) {
      console.error('Error obteniendo grabaciones:', error);
      return [];
    }
  }

  /**
   * Generar link de grabación (si está disponible)
   */
  static generateRecordingLink(courseId, sessionNumber, recordingId) {
    return `https://zoom.us/rec/download?uuid=${recordingId}`;
  }

  /**
   * Formatear fecha y hora
   */
  static formatDateTime(dateTime) {
    if (!dateTime) return '';
    const d = dateTime.toDate ? dateTime.toDate() : new Date(dateTime);
    return d.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

window.ZoomService = ZoomService;
