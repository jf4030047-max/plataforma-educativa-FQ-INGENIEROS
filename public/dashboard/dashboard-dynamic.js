// dashboard-dynamic.js - Dashboard funcional con Firebase
// Carga cursos matriculados, progreso, certificados y evaluaciones del profesor

let currentUser = null;
let enrollmentsData = [];
let coursesData = [];
let certificatesData = [];
let examsData = [];

// Inicializar Firebase
document.addEventListener('DOMContentLoaded', function() {
  // Esperar a que Firebase esté listo
  firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
      window.location.href = '/auth/login.html';
      return;
    }
    currentUser = user;
    initDashboard();
  });
});

function initDashboard() {
  if (!currentUser) return;

  // Actualizar perfil del usuario
  updateUserProfile();

  // Listeners para datos en tiempo real
  loadEnrollments();
  loadCourses();
  loadCertificates();
  loadExams();
}

function updateUserProfile() {
  // Actualizar nombre en el perfil
  db.collection('users').doc(currentUser.uid).get().then(function(doc) {
    if (doc.exists) {
      const userData = doc.data();
      const name = userData.name || currentUser.email;
      const initials = getInitials(name);

      // Actualizar sidebar
      const avatar = document.querySelector('.sidebar-avatar');
      if (avatar) avatar.textContent = initials;
      
      const nameEl = document.querySelector('.sidebar-name');
      if (nameEl) nameEl.textContent = name;
      
      const emailEl = document.querySelector('.sidebar-email');
      if (emailEl) emailEl.textContent = currentUser.email;
    }
  });
}

function loadEnrollments() {
  db.collection('enrollments')
    .where('userId', '==', currentUser.uid)
    .onSnapshot(function(snapshot) {
      enrollmentsData = [];
      snapshot.forEach(function(doc) {
        enrollmentsData.push({ id: doc.id, ...doc.data() });
      });
      renderCourses();
      renderHeroCourse();
    });
}

function loadCourses() {
  db.collection('courses').onSnapshot(function(snapshot) {
    coursesData = [];
    snapshot.forEach(function(doc) {
      coursesData.push({ id: doc.id, ...doc.data() });
    });
    renderCourses();
    renderHeroCourse();
  });
}

function loadCertificates() {
  db.collection('certificates')
    .where('userId', '==', currentUser.uid)
    .onSnapshot(function(snapshot) {
      certificatesData = [];
      snapshot.forEach(function(doc) {
        certificatesData.push({ id: doc.id, ...doc.data() });
      });
      renderCertificates();
    });
}

function loadExams() {
  db.collection('exams')
    .where('userId', '==', currentUser.uid)
    .onSnapshot(function(snapshot) {
      examsData = [];
      snapshot.forEach(function(doc) {
        examsData.push({ id: doc.id, ...doc.data() });
      });
      renderEvaluations();
    });
}

function getInitials(name) {
  return (name || '?')
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

function formatDate(timestamp) {
  if (!timestamp) return '—';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getCourseName(courseId) {
  const course = coursesData.find(c => c.id === courseId);
  return course ? course.name : courseId;
}

// ═══ CURSOS MATRICULADOS ═══
function renderCourses() {
  const container = document.getElementById('coursesList');
  if (!container) return;

  if (enrollmentsData.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#94a3b8;padding:20px">Aún no te has inscrito en ningún curso.</p>';
    return;
  }

  let html = '';
  enrollmentsData.forEach(function(enrollment, idx) {
    const course = coursesData.find(c => c.id === enrollment.courseId);
    if (!course) return;

    const progress = enrollment.progress || 0;
    const progressFill = '<div class="progress-fill pf-blue" style="width:' + progress + '%"></div>';
    const progressBar = '<div class="progress-bar">' + progressFill + '</div>';

    const icon = course.icon || 'menu_book';
    const colors = ['ci-blue', 'ci-teal', 'ci-orange', 'ci-purple'];
    const colorClass = colors[idx % colors.length];

    html += '<div class="course-item">' +
      '<div class="course-icon ' + colorClass + '"><span class="material-icons-round">' + icon + '</span></div>' +
      '<div class="course-info">' +
      '<h4><a href="/sesiones/index.html?course=' + course.id + '" style="color:inherit;text-decoration:none">' + escapeHtml(course.name || course.id) + '</a></h4>' +
      '<small>' + (course.duration || '—') + ' · ' + formatDate(enrollment.enrolledAt) + '</small>' +
      '</div>' +
      '<div class="course-pct" style="min-width:40px;text-align:right">' +
      '<strong>' + progress + '%</strong>' +
      '</div>' +
      '</div>';
  });

  container.innerHTML = html;
}

// ═══ CURSO EN PROGRESO (HERO CARD) ═══
function renderHeroCourse() {
  const heroCourseBody = document.querySelector('.hero-course-body');
  const heroCourseAction = document.querySelector('.hero-course-action');

  if (!heroCourseBody || !heroCourseAction) return;

  if (enrollmentsData.length === 0) {
    heroCourseBody.innerHTML = '<div class="hero-course-label">Sin cursos activos</div>' +
      '<h3>Explora nuestros cursos</h3>' +
      '<div class="hero-course-meta">Inscríbete en un curso para empezar</div>';
    heroCourseAction.innerHTML = '<a href="/cursos/catalogo.html" class="btn btn-primary btn-sm">Ver cursos</a>';
    return;
  }

  // Mostrar el primer curso matriculado
  const enrollment = enrollmentsData[0];
  const course = coursesData.find(c => c.id === enrollment.courseId);

  if (!course) {
    heroCourseBody.innerHTML = '<p>Cargando...</p>';
    return;
  }

  const progress = enrollment.progress || 0;
  const progressFill = '<div class="progress-fill pf-blue" style="width:' + progress + '%"></div>';

  heroCourseBody.innerHTML = '<div class="hero-course-label">Curso en progreso</div>' +
    '<h3><a href="/cursos/panel.html?id=' + course.id + '" style="color:inherit;text-decoration:none">' + escapeHtml(course.name) + '</a></h3>' +
    '<div class="hero-course-meta">' + (course.duration || '—') + ' · ' + formatDate(enrollment.enrolledAt) + '</div>' +
    '<div class="hero-course-progress"><div class="progress-bar">' + progressFill + '</div></div>' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:2px">' +
    '<span class="hero-course-pct">' + progress + '%</span>' +
    '</div>';

  heroCourseAction.innerHTML = '<a href="/sesiones/index.html?course=' + course.id + '" class="btn btn-primary btn-sm" style="white-space:nowrap">Continuar</a>';
}

// ═══ CERTIFICADOS ═══
function renderCertificates() {
  const container = document.getElementById('certificatesList');
  if (!container) return;

  if (certificatesData.length === 0 && examsData.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:20px;color:#94a3b8">' +
      '<p>Completa un curso y aprueba el examen para obtener certificados.</p>' +
      '</div>';
    return;
  }

  let html = '';

  // Mostrar certificados obtenidos
  certificatesData.forEach(function(cert) {
    const course = coursesData.find(c => c.id === cert.courseId);
    html += '<div style="background:#fff;border:1px solid #dce3ed;border-radius:12px;padding:16px;margin-bottom:10px">' +
      '<div style="display:flex;align-items:center;justify-content:space-between">' +
      '<div>' +
      '<h4 style="font-size:14px;font-weight:600;color:#0f172a;margin-bottom:2px">' +
      (cert.type === 'certificado' ? '🎖️ Certificado' : '📋 Constancia') + ' - ' + (course ? escapeHtml(course.name) : cert.courseId) +
      '</h4>' +
      '<small style="color:#64748b">' + formatDate(cert.issuedAt) + '</small>' +
      '</div>' +
      '<a href="' + cert.certificateUrl + '" target="_blank" class="btn btn-primary btn-sm" style="white-space:nowrap">Descargar</a>' +
      '</div>' +
      '</div>';
  });

  // Mostrar exámenes aprobados
  examsData.filter(function(e) { return e.passed; }).forEach(function(exam) {
    const course = coursesData.find(c => c.id === exam.courseId);
    const hasCert = certificatesData.find(c => c.courseId === exam.courseId && c.type === 'certificado');
    if (!hasCert) {
      html += '<div style="background:#fff;border:1px solid #e8f5e9;border-radius:12px;padding:16px;margin-bottom:10px">' +
        '<div style="display:flex;align-items:center;justify-content:space-between">' +
        '<div>' +
        '<h4 style="font-size:14px;font-weight:600;color:#0f172a;margin-bottom:2px">' +
        '✓ Examen aprobado: ' + (course ? escapeHtml(course.name) : exam.courseId) +
        '</h4>' +
        '<small style="color:#64748b">Calificación: ' + exam.percentage + '%</small>' +
        '</div>' +
        '<a href="/certificado/pago.html?course=' + exam.courseId + '" class="btn btn-primary btn-sm" style="white-space:nowrap">Certificar</a>' +
        '</div>' +
        '</div>';
    }
  });

  container.innerHTML = html || '<p style="text-align:center;color:#94a3b8;padding:20px">Sin certificados.</p>';
}

// ═══ EVALUACIONES DEL PROFESOR ═══
function renderEvaluations() {
  const container = document.getElementById('evaluationsList');
  if (!container) return;

  const evaluated = examsData.filter(function(e) { return e.evaluationComments || e.evaluationDocUrl; });

  if (evaluated.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#94a3b8;padding:20px">Sin evaluaciones aún.</p>';
    return;
  }

  let html = '';
  evaluated.forEach(function(exam) {
    const course = coursesData.find(c => c.id === exam.courseId);
    const status = exam.percentage >= 70 ? 'passed' : 'failed';
    const statusLabel = status === 'passed' ? 'Aprobado' : 'Desaprobado';

    html += '<div style="background:#fff;border:1px solid #dce3ed;border-radius:12px;padding:16px;margin-bottom:10px">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
      '<h4 style="font-size:14px;font-weight:600;color:#0f172a;margin:0">' +
      '📊 ' + (course ? escapeHtml(course.name) : exam.courseId) +
      '</h4>' +
      '<span style="background:' + (status === 'passed' ? '#d1fae5' : '#fef2f2') + ';color:' + (status === 'passed' ? '#065f46' : '#991b1b') + ';padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600">' +
      statusLabel + ' (' + exam.percentage + '%)' +
      '</span>' +
      '</div>';

    if (exam.evaluationComments) {
      html += '<div style="background:#f7f9fc;border-left:3px solid #1565c0;padding:10px 12px;border-radius:6px;margin-bottom:10px">' +
        '<small style="color:#334155"><strong>Comentarios del profesor:</strong></small><br>' +
        '<small style="color:#64748b;white-space:pre-wrap">' + escapeHtml(exam.evaluationComments) + '</small>' +
        '</div>';
    }

    if (exam.evaluationDocUrl) {
      html += '<a href="' + exam.evaluationDocUrl + '" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;color:#1565c0;text-decoration:none;font-size:12px;font-weight:600">' +
        '<span class="material-icons-round" style="font-size:16px">download</span>' +
        'Descargar evaluación (' + (exam.evaluationDocName || 'PDF') + ')' +
        '</a>';
    }

    html += '</div>';
  });

  container.innerHTML = html;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
