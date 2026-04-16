// dashboard-dynamic.js
// Lógica dinámica para la sección "Curso en progreso" del dashboard estudiante

document.addEventListener('DOMContentLoaded', function () {


  // Esperar a que Firebase esté disponible
  if (typeof firebase === 'undefined' || !firebase.auth || !firebase.firestore) {
    console.log('[FQ][DBG] Firebase no está disponible');
    return;
  }
  const auth = firebase.auth();
  const db = firebase.firestore();

  const heroCourse = document.querySelector('.hero-course');
  const heroCourseBody = heroCourse ? heroCourse.querySelector('.hero-course-body') : null;
  const heroCourseAction = heroCourse ? heroCourse.querySelector('.hero-course-action') : null;

  console.log('[FQ][DBG] heroCourse:', heroCourse);
  console.log('[FQ][DBG] heroCourseBody:', heroCourseBody);
  console.log('[FQ][DBG] heroCourseAction:', heroCourseAction);

  // Limpiar contenido estático al inicio solo si existen los elementos
  if (heroCourseBody) heroCourseBody.innerHTML = '';
  if (heroCourseAction) heroCourseAction.innerHTML = '';

  function renderNoCourses() {
    console.log('[FQ][DBG] renderNoCourses() called');
    if (heroCourseBody) {
      heroCourseBody.innerHTML = `
        <div class="hero-course-label">Curso en progreso</div>
        <h3 style="color:#64748b;font-weight:600">Aún no te has inscrito en ningún curso.</h3>
        <div class="hero-course-meta"></div>
        <div class="progress-bar"><div class="progress-fill pf-blue" style="width:0%"></div></div>
        <span class="hero-course-pct">0%</span>
      `;
    } else {
      console.log('[FQ][DBG] heroCourseBody no existe en renderNoCourses');
    }
    if (heroCourseAction) {
      heroCourseAction.innerHTML = `<a href="../cursos/catalogo.html" class="btn btn-primary btn-sm">Explorar cursos</a>`;
    } else {
      console.log('[FQ][DBG] heroCourseAction no existe en renderNoCourses');
    }
  }

  // Renderiza curso solo con datos de enrollment si no existe el curso en Firestore
  function renderCourseFromEnrollmentOnly(enrollment) {
    if (!heroCourseBody || !heroCourseAction) {
      console.log('[FQ][DBG] No existen heroCourseBody o heroCourseAction en renderCourseFromEnrollmentOnly');
      return;
    }
    const courseName = enrollment.courseName || 'Curso sin nombre';
    let progress = 0;
    if (typeof enrollment.progress === 'number' && !isNaN(enrollment.progress)) {
      progress = enrollment.progress;
    }
    const courseId = enrollment.courseId || '';
    heroCourseBody.innerHTML = `
      <div class="hero-course-label">Curso en progreso</div>
      <h3><a href="../cursos/curso.html?id=${courseId}" data-course-id="${courseId}" class="dash-course-link" style="color:inherit;text-decoration:none">${courseName}</a></h3>
      ${scheduleText ? `<div style=\"font-size:13px;color:#1565c0;font-weight:500;margin-bottom:2px\">${scheduleText}</div>` : ''}
      <div class="hero-course-meta">${meta}</div>
      <div class="progress-bar"><div class="progress-fill pf-blue" style="width:${progress}%"></div></div>
      <span class="hero-course-pct">${progress}%</span>
    `;
  }

  function renderCourseProgress(course, enrollment) {
    // Validar existencia de contenedores
    if (!heroCourseBody || !heroCourseAction) {
      console.log('[FQ][DBG] No existen heroCourseBody o heroCourseAction en renderCourseProgress');
      return;
    }

    // Render dinámico del curso en progreso
    const courseName = course.name || 'Curso sin nombre';
    const meta = course.meta || '';
    const progress = typeof enrollment.progress === 'number' ? enrollment.progress : 0;
    const courseId = course.id;

    // Horario seleccionado
    let scheduleText = '';
    if (enrollment.schedule && enrollment.schedule.label) {
      scheduleText = `Horario: ${enrollment.schedule.label}`;
      if (enrollment.schedule.date) {
        scheduleText += ` (${enrollment.schedule.date})`;
      }
    }

    console.log('[FQ][DBG] renderCourseProgress() - course:', course);
    console.log('[FQ][DBG] renderCourseProgress() - enrollment:', enrollment);

    // Calculate real progress: 0% → not started, 50% → session, 75% → payment verified, 100% → exam passed
    let realProgress = progress;
    if (enrollment.examPassed) realProgress = 100;
    else if (enrollment.paymentVerified) realProgress = Math.max(realProgress, 75);
    else if ((enrollment.attended || enrollment.watched || enrollment.completed) && realProgress < 50) realProgress = 50;

    let examBadge = '';
    if (enrollment.examPassed) {
      examBadge = `<div style="display:inline-flex;align-items:center;gap:4px;background:#d1fae5;color:#065f46;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;margin-top:4px"><span class="material-icons-round" style="font-size:14px">check_circle</span> Certificado obtenido (${enrollment.examScore || 0}%)</div>`;
    } else if (enrollment.paymentVerified) {
      examBadge = `<div style="display:inline-flex;align-items:center;gap:4px;background:#dbeafe;color:#1565c0;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;margin-top:4px"><span class="material-icons-round" style="font-size:14px">verified</span> Pago verificado — Examen pendiente</div>`;
    } else if (enrollment.completed || enrollment.attended || enrollment.watched) {
      examBadge = `<div style="display:inline-flex;align-items:center;gap:4px;background:#fef3c7;color:#92400e;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;margin-top:4px"><span class="material-icons-round" style="font-size:14px">payments</span> Pago pendiente (S/ 20)</div>`;
    }

    let progressColor = realProgress >= 75 ? 'pf-green' : 'pf-blue';

    heroCourseBody.innerHTML = `
      <div class="hero-course-label">Curso en progreso</div>
      <h3><a href="../cursos/panel.html?id=${courseId}" data-course-id="${courseId}" class="dash-course-link" style="color:inherit;text-decoration:none">${courseName}</a></h3>
      ${scheduleText ? `<div style=\"font-size:13px;color:#1565c0;font-weight:500;margin-bottom:2px\">${scheduleText}</div>` : ''}
      <div class="hero-course-meta">${meta}</div>
      <div class="hero-course-progress"><div class="progress-bar" style="flex:1"><div class="progress-fill ${progressColor}" style="width:${realProgress}%"></div></div></div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:2px">
        <span class="hero-course-pct">${realProgress}%</span>
        ${examBadge}
      </div>
    `;

    let heroAction = '';
    if (enrollment.examPassed) {
      heroAction = `<a href="../sesiones/index.html?course=${courseId}" class="btn btn-primary btn-sm" style="white-space:nowrap"><span class="material-icons-round" style="font-size:16px">download</span> Descargar certificado</a>`;
    } else if (enrollment.paymentVerified) {
      heroAction = `<a href="../certificado/examen.html?course=${courseId}" class="btn btn-primary btn-sm" style="white-space:nowrap"><span class="material-icons-round" style="font-size:16px">quiz</span> Dar examen</a>`;
    } else if (enrollment.completed || enrollment.attended || enrollment.watched) {
      heroAction = `<a href="../certificado/pago.html?course=${courseId}" class="btn btn-primary btn-sm" style="white-space:nowrap"><span class="material-icons-round" style="font-size:16px">payments</span> Pagar S/ 20</a>`;
    } else {
      heroAction = `<a href="../sesiones/index.html?course=${courseId}" data-course-id="${courseId}" class="btn btn-primary btn-sm dash-course-link" style="white-space:nowrap">Continuar</a>`;
    }
    heroCourseAction.innerHTML = heroAction;
  }

  auth.onAuthStateChanged(async function(user) {
    if (!user) {
      console.log('[FQ] Usuario no autenticado');
      return;
    }
    console.log('[FQ] UID autenticado:', user.uid);
    // Consultar enrollments del usuario
    try {
      const snap = await db.collection('enrollments').where('userId', '==', user.uid).get();
      console.log('[FQ][DBG] Enrollments encontrados:', snap.docs.map(d => d.data()));
      if (snap.empty) {
        renderNoCourses();
        return;
      }
      // Tomar el primer curso inscrito
      const enrollment = snap.docs[0].data();
      const courseId = enrollment.courseId;
      console.log('[FQ][DBG] Enrollment seleccionado:', enrollment);
      // Obtener info del curso
      try {
        const courseDoc = await db.collection('courses').doc(courseId).get();
        if (courseDoc.exists) {
          const course = courseDoc.data();
          course.id = courseId;
          // Meta info: sesiones y duración
          let meta = '';
          if (course.sessions && course.duration) {
            meta = `${course.sessions} sesión${course.sessions > 1 ? 'es' : ''} · ${course.duration}`;
          }
          course.meta = meta;
          console.log('[FQ][DBG] Curso encontrado:', course);
          renderCourseProgress(course, enrollment);
        } else {
          console.log('[FQ][DBG] No existe el curso con ID:', courseId);
          // Renderizar solo con datos de enrollment
          renderCourseFromEnrollmentOnly(enrollment);
        }
      } catch (err) {
        console.error('[FQ][DBG] Error al buscar curso en courses:', err);
        renderCourseFromEnrollmentOnly(enrollment);
      }
    } catch (err) {
      console.error('[FQ][DBG] Error en onAuthStateChanged:', err);
      renderNoCourses();
    }
  });
});
