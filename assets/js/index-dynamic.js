// Sincronizar precios en cards de cursos disponibles
function syncCoursePrices() {
  const priceMap = {
    'sst-obras-civiles': 'price-sst-obras',
    'topografia-civil-3d': 'price-topografia',
    'supervision-obra': 'price-supervision'
  };
  Object.entries(priceMap).forEach(([courseId, elId]) => {
    fetch(BASE + courseId)
      .then(r => r.ok ? r.json() : null)
      .then(doc => {
        var el = document.getElementById(elId);
        if (!el) return;
        if (!doc || !doc.fields) {
          el.textContent = 'Por definir';
          return;
        }
        var f = doc.fields;
        var price = fsVal(f.price);
        el.textContent = (price && price !== '0') ? 'S/ ' + price : 'Por definir';
      })
      .catch(() => {
        var el = document.getElementById(elId);
        if (el) el.textContent = 'Por definir';
      });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  syncCoursePrices();
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

  // Sync hero card info via REST API (no SDK cache)
  var meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  var dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  function formatDate(dateStr) {
    var p = dateStr.split('-');
    var d = new Date(parseInt(p[0]), parseInt(p[1])-1, parseInt(p[2]));
    return dias[d.getDay()] + ' ' + d.getDate() + ' de ' + meses[d.getMonth()] + ', ' + d.getFullYear();
  }
  function fsVal(field) { return field ? (field.stringValue || field.integerValue || '') : ''; }

  var PROJECT = 'fq-ingenieros-educativa';
  var BASE = 'https://firestore.googleapis.com/v1/projects/' + PROJECT + '/databases/(default)/documents/courses/';

  // SST
  fetch(BASE + 'sst-obras-civiles').then(function(r){return r.json()}).then(function(doc){
    var f = doc.fields || {};
    var el;
    if (fsVal(f.startDate) && (el = document.getElementById('sst-date'))) {
      el.innerHTML = '<span class="material-icons-round">calendar_month</span> ' + formatDate(fsVal(f.startDate));
    }
    if (fsVal(f.startTime) && (el = document.getElementById('sst-time'))) {
      var txt = fsVal(f.startTime);
      if (fsVal(f.endTime)) txt += ' — ' + fsVal(f.endTime);
      el.innerHTML = '<span class="material-icons-round">schedule</span> ' + txt;
    }
  }).catch(function(){});

  // Topografia
  fetch(BASE + 'topografia-civil-3d').then(function(r){return r.json()}).then(function(doc){
    var f = doc.fields || {};
    var el;
    if (fsVal(f.startDate) && (el = document.getElementById('topo-date'))) {
      el.innerHTML = '<span class="material-icons-round">calendar_month</span> ' + formatDate(fsVal(f.startDate));
    }
    if (fsVal(f.duration) && (el = document.getElementById('topo-duration'))) {
      el.innerHTML = '<span class="material-icons-round">schedule</span> ' + fsVal(f.duration) + (fsVal(f.modality) ? ' · ' + fsVal(f.modality) : '');
    }
    if ((el = document.getElementById('topo-price'))) {
      var price = fsVal(f.price);
      el.innerHTML = '<span class="material-icons-round">sell</span> ' + (price && price !== '0' ? 'S/ ' + price : 'Precio por definir');
    }
  }).catch(function(){});

  // Si hay un campo priceLabel, ignóralo para mostrar siempre el valor numérico si existe

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
