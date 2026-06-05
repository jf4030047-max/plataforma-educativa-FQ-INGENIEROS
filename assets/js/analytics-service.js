/**
 * 📈 ADMIN ANALYTICS SERVICE
 * Gestiona: Reportes, Gráficos, Estadísticas, KPIs
 */

class AdminAnalyticsService {
  constructor() {
    this.isAdmin = false;
  }

  /**
   * Verificar si el usuario es admin
   */
  async checkAdmin() {
    try {
      const user = firebase.auth().currentUser;
      if (!user) return false;

      // Admin hardcoded
      this.isAdmin = user.email === 'fq.ingenieros.empresa@gmail.com';
      return this.isAdmin;
    } catch (error) {
      console.error('Error verificando admin:', error);
      return false;
    }
  }

  /**
   * Obtener estadísticas generales
   */
  async getOverallStats() {
    try {
      const usersSnap = await firebase.firestore().collection('users').get();
      const coursesSnap = await firebase.firestore().collection('courses').get();
      const enrollmentsSnap = await firebase.firestore().collection('enrollments').get();
      const paymentsSnap = await firebase.firestore().collection('payments').get();
      const certificatesSnap = await firebase.firestore().collection('certificates').get();

      const payments = paymentsSnap.docs.map(doc => doc.data());
      const verifiedPayments = payments.filter(p => p.status === 'verified');
      const totalRevenue = verifiedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

      return {
        totalUsers: usersSnap.size,
        totalCourses: coursesSnap.size,
        totalEnrollments: enrollmentsSnap.size,
        totalCertificates: certificatesSnap.size,
        totalPayments: paymentsSnap.size,
        verifiedPayments: verifiedPayments.length,
        totalRevenue: totalRevenue,
        pendingPayments: payments.filter(p => p.status === 'pending').length,
        rejectedPayments: payments.filter(p => p.status === 'rejected').length
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas generales:', error);
      return {};
    }
  }

  /**
   * Obtener ingresos por período (mes)
   */
  async getRevenueByMonth() {
    try {
      const paymentsSnap = await firebase.firestore()
        .collection('payments')
        .where('status', '==', 'verified')
        .get();

      const payments = paymentsSnap.docs.map(doc => doc.data());
      const monthlyRevenue = {};

      for (const payment of payments) {
        const date = payment.verifiedAt?.toDate?.() || new Date(payment.verifiedAt || 0);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (payment.amount || 0);
      }

      return Object.keys(monthlyRevenue)
        .sort()
        .map(month => ({
          month,
          revenue: monthlyRevenue[month]
        }));
    } catch (error) {
      console.error('Error obteniendo ingresos por mes:', error);
      return [];
    }
  }

  /**
   * Obtener cursos más populares
   */
  async getMostPopularCourses() {
    try {
      const coursesSnap = await firebase.firestore().collection('courses').get();
      const enrollmentsSnap = await firebase.firestore().collection('enrollments').get();

      const courses = coursesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const enrollments = enrollmentsSnap.docs.map(doc => doc.data());

      // Contar matriculaciones por curso
      const courseEnrollments = {};
      for (const enrollment of enrollments) {
        courseEnrollments[enrollment.courseId] = (courseEnrollments[enrollment.courseId] || 0) + 1;
      }

      // Agregar conteos a cursos
      const coursesWithCounts = courses.map(course => ({
        id: course.id,
        name: course.name,
        price: course.price || 0,
        students: courseEnrollments[course.id] || 0,
        rating: course.rating || 5
      }));

      return coursesWithCounts
        .sort((a, b) => b.students - a.students)
        .slice(0, 10);
    } catch (error) {
      console.error('Error obteniendo cursos populares:', error);
      return [];
    }
  }

  /**
   * Obtener estudiantes más activos
   */
  async getMostActiveStudents() {
    try {
      const enrollmentsSnap = await firebase.firestore().collection('enrollments').get();
      const usersSnap = await firebase.firestore().collection('users').get();

      const enrollments = enrollmentsSnap.docs.map(doc => doc.data());
      const users = new Map(usersSnap.docs.map(doc => [doc.id, doc.data()]));

      // Contar cursos por estudiante
      const studentCourses = {};
      for (const enrollment of enrollments) {
        studentCourses[enrollment.userId] = (studentCourses[enrollment.userId] || 0) + 1;
      }

      // Crear lista con datos del usuario
      const activeStudents = Object.entries(studentCourses)
        .map(([userId, courseCount]) => {
          const userData = users.get(userId) || {};
          return {
            userId,
            name: userData.displayName || 'Sin nombre',
            email: userData.email || 'sin-email@example.com',
            enrolledCourses: courseCount
          };
        })
        .sort((a, b) => b.enrolledCourses - a.enrolledCourses)
        .slice(0, 10);

      return activeStudents;
    } catch (error) {
      console.error('Error obteniendo estudiantes activos:', error);
      return [];
    }
  }

  /**
   * Obtener tasa de aprobación
   */
  async getPassRate() {
    try {
      const examsSnap = await firebase.firestore().collection('exams').get();

      const exams = examsSnap.docs.map(doc => doc.data());

      if (exams.length === 0) return 0;

      const passedCount = exams.filter(e => e.passed).length;
      return Math.round((passedCount / exams.length) * 100);
    } catch (error) {
      console.error('Error obteniendo tasa de aprobación:', error);
      return 0;
    }
  }

  /**
   * Obtener distribución de matriculaciones por curso
   */
  async getEnrollmentDistribution() {
    try {
      const enrollmentsSnap = await firebase.firestore().collection('enrollments').get();
      const coursesSnap = await firebase.firestore().collection('courses').get();

      const enrollments = enrollmentsSnap.docs.map(doc => doc.data());
      const courses = new Map(coursesSnap.docs.map(doc => [doc.id, doc.data()]));

      const distribution = {};

      for (const enrollment of enrollments) {
        const courseId = enrollment.courseId;
        distribution[courseId] = (distribution[courseId] || 0) + 1;
      }

      return Object.entries(distribution)
        .map(([courseId, count]) => ({
          courseId,
          courseName: courses.get(courseId)?.name || courseId,
          students: count
        }))
        .sort((a, b) => b.students - a.students);
    } catch (error) {
      console.error('Error obteniendo distribución de matriculaciones:', error);
      return [];
    }
  }

  /**
   * Obtener estado de pagos
   */
  async getPaymentStatus() {
    try {
      const paymentsSnap = await firebase.firestore().collection('payments').get();

      const payments = paymentsSnap.docs.map(doc => doc.data());

      const status = {
        pending: payments.filter(p => p.status === 'pending').length,
        uploaded: payments.filter(p => p.status === 'uploaded').length,
        verified: payments.filter(p => p.status === 'verified').length,
        rejected: payments.filter(p => p.status === 'rejected').length
      };

      return status;
    } catch (error) {
      console.error('Error obteniendo estado de pagos:', error);
      return { pending: 0, uploaded: 0, verified: 0, rejected: 0 };
    }
  }

  /**
   * Obtener método de pago más usado
   */
  async getMostUsedPaymentMethod() {
    try {
      const paymentsSnap = await firebase.firestore()
        .collection('payments')
        .where('status', '==', 'verified')
        .get();

      const payments = paymentsSnap.docs.map(doc => doc.data());

      if (payments.length === 0) return [];

      const methodCounts = {};

      for (const payment of payments) {
        methodCounts[payment.method] = (methodCounts[payment.method] || 0) + 1;
      }

      return Object.entries(methodCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([method, count]) => ({ method, count }));
    } catch (error) {
      console.error('Error obteniendo método de pago:', error);
      return [];
    }
  }

  /**
   * Generar reporte completo
   */
  async generateFullReport() {
    try {
      const [
        overallStats,
        revenueByMonth,
        popularCourses,
        activeStudents,
        passRate,
        enrollmentDistribution,
        paymentStatus,
        paymentMethods
      ] = await Promise.all([
        this.getOverallStats(),
        this.getRevenueByMonth(),
        this.getMostPopularCourses(),
        this.getMostActiveStudents(),
        this.getPassRate(),
        this.getEnrollmentDistribution(),
        this.getPaymentStatus(),
        this.getMostUsedPaymentMethod()
      ]);

      return {
        generatedAt: new Date(),
        overall: overallStats,
        revenue: {
          byMonth: revenueByMonth,
          total: overallStats.totalRevenue
        },
        courses: {
          mostPopular: popularCourses,
          enrollmentDistribution
        },
        students: {
          mostActive: activeStudents,
          totalActive: overallStats.totalEnrollments,
          passRate
        },
        payments: {
          status: paymentStatus,
          mostUsedMethods: paymentMethods
        }
      };
    } catch (error) {
      console.error('Error generando reporte:', error);
      return null;
    }
  }

  /**
   * Exportar reporte a JSON
   */
  exportToJSON(report, filename = 'reporte-admin.json') {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2)));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  /**
   * Formatear número con separadores
   */
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Formatear moneda
   */
  formatCurrency(amount) {
    return 'S/ ' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}

window.AdminAnalyticsService = AdminAnalyticsService;
