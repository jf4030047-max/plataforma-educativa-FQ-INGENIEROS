// index-dynamic.js
// Sincroniza el estado de autenticación y matrícula en la página de inicio


let authResolved = false;

document.addEventListener('DOMContentLoaded', function () {
  if (typeof firebase === 'undefined' || !firebase.auth || !firebase.firestore) return;
  const auth = firebase.auth();
  const db = firebase.firestore();

  // Actualiza los botones de acción de cursos según matrícula
  // Estados de cursos (centralizado)
  const courseStates = {
    'sst-obras-civiles': 'disponible',
    'topografia-civil-3d': 'disponible',
    'supervision-obra': 'proximamente'
  };

  // Auto-fix: asegurar fecha de SST en Firestore
  const SST_DATE_FIX = { 'sst-obras-civiles': { startDate: '2026-04-23', startTime: '17:00', endTime: '20:00' } };
  Object.keys(SST_DATE_FIX).forEach(function(cid) {
    db.collection('courses').doc(cid).get().then(function(doc) {
      if (doc.exists) {
        var d = doc.data();
        if (!d.startDate || d.endTime !== SST_DATE_FIX[cid].endTime) {
          doc.ref.update(SST_DATE_FIX[cid]);
        }
      }
    }).catch(function() {});
  });

  async function renderCourseActions(user) {
    const actions = document.querySelectorAll('.course-action');
    if (!actions.length) return;
    let enrolledCourses = [];
    if (user) {
      // Consultar enrollments del usuario
      const snap = await db.collection('enrollments').where('userId', '==', user.uid).get();
      enrolledCourses = snap.docs.map(doc => doc.data().courseId);
    }
    actions.forEach(action => {
      const courseId = action.getAttribute('data-course');
      const state = courseStates[courseId] || 'disponible';
      action.innerHTML = '';
      // Ocultar .cc-meta si el curso es "proximamente"
      if (state === 'proximamente') {
        // Buscar el .cc-meta más cercano dentro del mismo .course-card
        const courseCard = action.closest('.course-card');
        if (courseCard) {
          const meta = courseCard.querySelector('.cc-meta');
          if (meta) meta.style.display = 'none';
        }
        // Mostrar badge Próximamente SIEMPRE, sin importar usuario
        const badge = document.createElement('span');
        badge.className = 'cbadge';
        badge.style.background = '#fef3c7';
        badge.style.color = '#92400e';
        badge.style.fontSize = '13px';
        badge.style.padding = '5px 14px';
        badge.style.display = 'block';
        badge.style.textAlign = 'center';
        badge.style.marginBottom = '8px';
        badge.style.borderRadius = '18px';
        badge.innerHTML = '<span class="material-icons-round" style="font-size:16px;vertical-align:middle;">upcoming</span> Próximamente';
        action.appendChild(badge);
        return;
      } else {
        // Si el curso está disponible, asegurarse de mostrar la meta
        const courseCard = action.closest('.course-card');
        if (courseCard) {
          const meta = courseCard.querySelector('.cc-meta');
          if (meta) meta.style.display = '';
        }
      }
      if (!user) {
        // Usuario no autenticado: mostrar botón para login
        const btn = document.createElement('a');
        btn.href = 'auth/login.html';
        btn.className = 'btn btn-primary btn-sm';
        btn.textContent = 'Iniciar sesión';
        action.appendChild(btn);
      } else if (enrolledCourses.includes(courseId)) {
        // Usuario inscrito: mostrar botón verde para ir al curso (panel de sesiones)
        const btn = document.createElement('a');
        btn.className = 'btn btn-success btn-sm';
        btn.innerHTML = '<span class="material-icons-round">play_circle</span> Ir al curso';
        btn.href = `sesiones/index.html?course=${courseId}`;
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          window.location.href = `sesiones/index.html?course=${courseId}`;
        });
        action.appendChild(btn);
      } else {
        // Usuario autenticado pero no inscrito: mostrar botón para inscribirse
        const btn = document.createElement('a');
        btn.href = `cursos/curso.html?id=${courseId}`;
        btn.className = 'btn btn-outline btn-sm';
        btn.textContent = 'Inscribirme';
        action.appendChild(btn);
      }
    });
  }

  auth.onAuthStateChanged(async function(user) {
    // No tocar navActions aquí, solo renderizar acciones de cursos
    await renderCourseActions(user);
  });
});
