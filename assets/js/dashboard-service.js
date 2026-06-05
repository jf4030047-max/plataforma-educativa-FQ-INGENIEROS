/**
 * 📊 DASHBOARD MEJORADO - Estudiante
 * Integra: Cursos, Exámenes, Certificados, Pagos, Notificaciones
 * 
 * Características:
 * - Progreso visual por curso con barras animadas
 * - Certificados descargables
 * - Historial de pagos
 * - Notificaciones en tiempo real
 * - Próximas sesiones/exámenes
 */

class DashboardService {
  constructor() {
    this.currentUser = null;
    this.userCourses = [];
    this.certificates = [];
    this.payments = [];
    this.notifications = [];
    this.exams = [];
  }

  /**
   * Inicializar dashboard
   */
  async init() {
    try {
      // Obtener usuario actual
      this.currentUser = firebase.auth().currentUser;
      if (!this.currentUser) {
        console.log('No hay usuario autenticado');
        return false;
      }

      // Cargar todos los datos en paralelo
      await Promise.all([
        this.loadUserCourses(),
        this.loadCertificates(),
        this.loadPayments(),
        this.loadNotifications(),
        this.loadAvailableExams()
      ]);

      return true;
    } catch (error) {
      console.error('Error inicializando dashboard:', error);
      return false;
    }
  }

  /**
   * Cargar cursos del usuario
   */
  async loadUserCourses() {
    try {
      const snapshot = await firebase.firestore()
        .collection('enrollments')
        .where('userId', '==', this.currentUser.uid)
        .get();

      this.userCourses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Obtener datos completos de cada curso
      for (let course of this.userCourses) {
        const courseDoc = await firebase.firestore()
          .collection('courses')
          .doc(course.courseId)
          .get();

        if (courseDoc.exists) {
          course.courseData = courseDoc.data();
        }
      }

      return this.userCourses;
    } catch (error) {
      console.error('Error cargando cursos:', error);
      return [];
    }
  }

  /**
   * Cargar certificados del usuario
   */
  async loadCertificates() {
    try {
      const snapshot = await firebase.firestore()
        .collection('certificates')
        .where('userId', '==', this.currentUser.uid)
        .orderBy('issuedAt', 'desc')
        .get();

      this.certificates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return this.certificates;
    } catch (error) {
      console.error('Error cargando certificados:', error);
      return [];
    }
  }

  /**
   * Cargar pagos del usuario
   */
  async loadPayments() {
    try {
      const snapshot = await firebase.firestore()
        .collection('payments')
        .where('userId', '==', this.currentUser.uid)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();

      this.payments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return this.payments;
    } catch (error) {
      console.error('Error cargando pagos:', error);
      return [];
    }
  }

  /**
   * Cargar notificaciones del usuario
   */
  async loadNotifications() {
    try {
      const snapshot = await firebase.firestore()
        .collection('notifications')
        .where('userId', '==', this.currentUser.uid)
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();

      this.notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return this.notifications;
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      return [];
    }
  }

  /**
   * Cargar exámenes disponibles
   */
  async loadAvailableExams() {
    try {
      // Obtener cursos donde el usuario está matriculado
      const courseIds = this.userCourses
        .filter(c => c.status === 'active')
        .map(c => c.courseId);

      if (courseIds.length === 0) {
        return [];
      }

      // Obtener exámenes no completados para esos cursos
      const snapshot = await firebase.firestore()
        .collection('exams')
        .where('userId', '==', this.currentUser.uid)
        .get();

      const submittedExamIds = snapshot.docs.map(doc => doc.data().courseId);

      // Exámenes disponibles = cursos sin examen completado
      this.exams = courseIds.filter(id => !submittedExamIds.includes(id));

      return this.exams;
    } catch (error) {
      console.error('Error cargando exámenes:', error);
      return [];
    }
  }

  /**
   * Obtener resumen de progreso
   */
  getProgressSummary() {
    const total = this.userCourses.length;
    const active = this.userCourses.filter(c => c.status === 'active').length;
    const completed = this.userCourses.filter(c => c.status === 'completed').length;
    const avgProgress = total > 0 
      ? Math.round(this.userCourses.reduce((sum, c) => sum + (c.progress || 0), 0) / total)
      : 0;

    return {
      totalCourses: total,
      activeCourses: active,
      completedCourses: completed,
      averageProgress: avgProgress,
      certificates: this.certificates.length,
      pendingExams: this.exams.length
    };
  }

  /**
   * Marcar notificación como leída
   */
  async markNotificationAsRead(notificationId) {
    try {
      await firebase.firestore()
        .collection('notifications')
        .doc(notificationId)
        .update({
          read: true
        });

      const notif = this.notifications.find(n => n.id === notificationId);
      if (notif) notif.read = true;
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  }

  /**
   * Obtener color por estatus de pago
   */
  getPaymentStatusColor(status) {
    const colors = {
      pending: '#f97316',    // Orange
      uploaded: '#eab308',   // Yellow
      verified: '#16a34a',   // Green
      rejected: '#dc2626'    // Red
    };
    return colors[status] || '#64748b';
  }

  /**
   * Obtener etiqueta de estatus de pago
   */
  getPaymentStatusLabel(status) {
    const labels = {
      pending: 'Pendiente',
      uploaded: 'Cargado',
      verified: 'Verificado',
      rejected: 'Rechazado'
    };
    return labels[status] || status;
  }

  /**
   * Formatear fecha
   */
  formatDate(date) {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}

// Instancia global
window.dashboardService = new DashboardService();
