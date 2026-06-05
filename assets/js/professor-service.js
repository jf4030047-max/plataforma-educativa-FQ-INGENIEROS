/**
 * 👨‍🏫 PROFESSOR PANEL SERVICE
 * Gestiona: Asistencia, Calificaciones, Reportes, Estudiantes
 */

class ProfessorService {
  constructor() {
    this.currentUser = null;
    this.myCourses = [];
    this.myStudents = [];
    this.attendance = [];
    this.grades = [];
  }

  /**
   * Inicializar servicio de profesor
   */
  async init() {
    try {
      this.currentUser = firebase.auth().currentUser;
      if (!this.currentUser) return false;

      // Cargar cursos del profesor
      const coursesSnap = await firebase.firestore()
        .collection('courses')
        .where('professor', '==', this.currentUser.uid)
        .get();

      this.myCourses = coursesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Si no es profesor pero es admin, mostrar todos
      if (this.myCourses.length === 0 && this.currentUser.email === 'fq.ingenieros.empresa@gmail.com') {
        const allCoursesSnap = await firebase.firestore()
          .collection('courses')
          .get();
        this.myCourses = allCoursesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }

      return true;
    } catch (error) {
      console.error('Error iniciando ProfessorService:', error);
      return false;
    }
  }

  /**
   * Obtener estudiantes de un curso
   */
  async getStudentsByCourse(courseId) {
    try {
      const enrollmentsSnap = await firebase.firestore()
        .collection('enrollments')
        .where('courseId', '==', courseId)
        .get();

      const students = [];

      for (const doc of enrollmentsSnap.docs) {
        const enrollment = doc.data();
        const userSnap = await firebase.firestore()
          .collection('users')
          .doc(enrollment.userId)
          .get();

        const userData = userSnap.data() || {};

        students.push({
          enrollmentId: doc.id,
          userId: enrollment.userId,
          name: userData.displayName || 'Sin nombre',
          email: userData.email || 'sin-email@example.com',
          status: enrollment.status,
          progress: enrollment.progress || 0,
          enrolledAt: enrollment.enrolledAt
        });
      }

      return students.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
      return [];
    }
  }

  /**
   * Registrar asistencia
   */
  async recordAttendance(courseId, sessionNumber, studentIds, presentStudentIds) {
    try {
      const batch = firebase.firestore().batch();
      const timestamp = new Date();

      for (const studentId of studentIds) {
        const attendanceId = `${courseId}_${sessionNumber}_${studentId}`;
        const isPresent = presentStudentIds.includes(studentId);

        const attendanceRef = firebase.firestore()
          .collection('attendance')
          .doc(attendanceId);

        batch.set(attendanceRef, {
          courseId,
          sessionNumber,
          studentId,
          present: isPresent,
          recordedAt: timestamp,
          recordedBy: this.currentUser.uid
        }, { merge: true });
      }

      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error registrando asistencia:', error);
      return false;
    }
  }

  /**
   * Obtener asistencia de un curso
   */
  async getAttendanceByCourse(courseId) {
    try {
      const snapshot = await firebase.firestore()
        .collection('attendance')
        .where('courseId', '==', courseId)
        .orderBy('sessionNumber')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error cargando asistencia:', error);
      return [];
    }
  }

  /**
   * Calcular porcentaje de asistencia por estudiante
   */
  calculateAttendancePercentage(studentId, courseId, allAttendance) {
    const studentAttendance = allAttendance.filter(a => 
      a.studentId === studentId && a.courseId === courseId
    );

    if (studentAttendance.length === 0) return 0;

    const presentCount = studentAttendance.filter(a => a.present).length;
    return Math.round((presentCount / studentAttendance.length) * 100);
  }

  /**
   * Guardar calificación de examen
   */
  async saveGrade(courseId, studentId, score, percentage, passed) {
    try {
      const gradeId = `${courseId}_${studentId}`;

      await firebase.firestore()
        .collection('exams')
        .doc(gradeId)
        .set({
          courseId,
          userId: studentId,
          score,
          percentage,
          passed,
          submittedAt: new Date()
        }, { merge: true });

      return true;
    } catch (error) {
      console.error('Error guardando calificación:', error);
      return false;
    }
  }

  /**
   * Obtener calificaciones de un curso
   */
  async getGradesByCourse(courseId) {
    try {
      const snapshot = await firebase.firestore()
        .collection('exams')
        .where('courseId', '==', courseId)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error cargando calificaciones:', error);
      return [];
    }
  }

  /**
   * Generar reporte de curso
   */
  async generateCourseReport(courseId) {
    try {
      const students = await this.getStudentsByCourse(courseId);
      const attendance = await this.getAttendanceByCourse(courseId);
      const grades = await this.getGradesByCourse(courseId);

      const report = {
        courseId,
        generatedAt: new Date(),
        generatedBy: this.currentUser.uid,
        totalStudents: students.length,
        students: students.map(student => {
          const attendancePercent = this.calculateAttendancePercentage(
            student.userId,
            courseId,
            attendance
          );

          const gradeInfo = grades.find(g => g.userId === student.userId);

          return {
            name: student.name,
            email: student.email,
            enrolledAt: student.enrolledAt,
            attendance: attendancePercent,
            grade: gradeInfo?.percentage || null,
            passed: gradeInfo?.passed || null,
            progress: student.progress
          };
        }),
        statistics: {
          avgAttendance: Math.round(
            students.reduce((sum, s) => sum + this.calculateAttendancePercentage(s.userId, courseId, attendance), 0) / 
            (students.length || 1)
          ),
          avgGrade: grades.length > 0 
            ? Math.round(grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length)
            : 0,
          passRate: grades.length > 0
            ? Math.round((grades.filter(g => g.passed).length / grades.length) * 100)
            : 0,
          totalSessions: new Set(attendance.map(a => a.sessionNumber)).size
        }
      };

      return report;
    } catch (error) {
      console.error('Error generando reporte:', error);
      return null;
    }
  }

  /**
   * Agregar comentario/feedback al estudiante
   */
  async addStudentFeedback(courseId, studentId, feedback) {
    try {
      const feedbackId = `${courseId}_${studentId}_${Date.now()}`;

      await firebase.firestore()
        .collection('feedback')
        .doc(feedbackId)
        .set({
          courseId,
          studentId,
          professorId: this.currentUser.uid,
          feedback,
          createdAt: new Date()
        });

      // Crear notificación para el estudiante
      await firebase.firestore()
        .collection('notifications')
        .doc()
        .set({
          userId: studentId,
          type: 'professor_feedback',
          data: {
            courseName: this.myCourses.find(c => c.id === courseId)?.name || 'Curso',
            feedback,
            professorName: this.currentUser.displayName || 'Profesor'
          },
          read: false,
          createdAt: new Date(),
          status: 'pending'
        });

      return true;
    } catch (error) {
      console.error('Error agregando feedback:', error);
      return false;
    }
  }

  /**
   * Obtener feedback de un estudiante
   */
  async getStudentFeedback(courseId, studentId) {
    try {
      const snapshot = await firebase.firestore()
        .collection('feedback')
        .where('courseId', '==', courseId)
        .where('studentId', '==', studentId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error cargando feedback:', error);
      return [];
    }
  }

  /**
   * Exportar reporte a CSV
   */
  exportReportToCSV(report) {
    const headers = ['Estudiante', 'Email', 'Asistencia %', 'Calificación', 'Aprobado', 'Progreso'];
    const rows = report.students.map(student => [
      student.name,
      student.email,
      student.attendance + '%',
      student.grade !== null ? student.grade + '%' : 'N/A',
      student.passed !== null ? (student.passed ? 'Sí' : 'No') : 'N/A',
      student.progress + '%'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csv;
  }

  /**
   * Descargar CSV
   */
  downloadCSV(csv, filename = 'reporte.csv') {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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

window.ProfessorService = ProfessorService;
