// admin-panel.js - Gestión de cursos para el panel de administrador FQ INGENIEROS


// --- Panel Admin Unificado ---
document.addEventListener('DOMContentLoaded', function () {
  if (typeof firebase === 'undefined' || !firebase.firestore) return;
  const db = firebase.firestore();

  // Estadísticas
  const elCursos = document.querySelector('.stat-card .stat-value');
  const elUsuarios = document.querySelectorAll('.stat-card .stat-value')[1];
  const elIngresos = document.querySelectorAll('.stat-card .stat-value')[2];
  db.collection('courses').where('active', '==', true).get().then(snap => { if (elCursos) elCursos.textContent = snap.size; });
  db.collection('users').get().then(snap => { if (elUsuarios) elUsuarios.textContent = snap.size; });
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  db.collection('payments').where('date', '>=', firstDay).where('date', '<=', lastDay).get().then(snap => {
    let total = 0;
    snap.forEach(doc => { const pago = doc.data(); if (typeof pago.amount === 'number') total += pago.amount; });
    if (elIngresos) elIngresos.textContent = 'S/ ' + total.toLocaleString('es-PE');
  });

  // --- Renderizado de Usuarios ---
  function renderUsers() {
    const usuariosContent = document.getElementById('usuariosContent');
    if (!usuariosContent) return;
    usuariosContent.innerHTML = '<div style="color:#64748b">Cargando usuarios...</div>';
    db.collection('users').get().then(snap => {
      if (snap.empty) {
        usuariosContent.innerHTML = '<div style="color:#64748b">No hay usuarios registrados.</div>';
        return;
      }
      let html = '<table style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr><th style="text-align:left;padding:8px 6px;border-bottom:1px solid #e2e8f0">Nombre</th><th style="text-align:left;padding:8px 6px;border-bottom:1px solid #e2e8f0">Correo</th><th style="text-align:left;padding:8px 6px;border-bottom:1px solid #e2e8f0">Rol</th></tr></thead><tbody>';
      snap.forEach(doc => {
        const u = doc.data();
        html += `<tr><td style=\"padding:7px 6px;border-bottom:1px solid #f1f5f9\">${u.nombre||u.name||'-'}</td><td style=\"padding:7px 6px;border-bottom:1px solid #f1f5f9\">${u.email||'-'}</td><td style=\"padding:7px 6px;border-bottom:1px solid #f1f5f9\">${u.rol||'-'}</td></tr>`;
      });
      html += '</tbody></table>';
      usuariosContent.innerHTML = html;
    }).catch(err => {
      usuariosContent.innerHTML = '<div style="color:#dc2626">Error al cargar usuarios: ' + err.message + '</div>';
    });
  }

  // --- Renderizado de Cursos ---
  function renderCourses() {
    const cursosContent = document.getElementById('cursosContent');
    if (!cursosContent) return;
    cursosContent.innerHTML = '<div style="color:#64748b">Cargando cursos...</div>';
    db.collection('courses').get().then(snap => {
      if (snap.empty) {
        cursosContent.innerHTML = '<div style="color:#64748b">No hay cursos registrados.</div>';
        return;
      }
      let html = '<table style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr><th style="text-align:left;padding:8px 6px;border-bottom:1px solid #e2e8f0">Nombre</th><th style="text-align:left;padding:8px 6px;border-bottom:1px solid #e2e8f0">Fecha</th><th style="text-align:left;padding:8px 6px;border-bottom:1px solid #e2e8f0">Tema principal</th><th style="text-align:left;padding:8px 6px;border-bottom:1px solid #e2e8f0">Precio</th></tr></thead><tbody>';
      snap.forEach(doc => {
        const c = doc.data();
        html += `<tr><td style=\"padding:7px 6px;border-bottom:1px solid #f1f5f9\">${c.name||c.nombre||'-'}</td><td style=\"padding:7px 6px;border-bottom:1px solid #f1f5f9\">${c.fecha||c.date||'-'}</td><td style=\"padding:7px 6px;border-bottom:1px solid #f1f5f9\">${c.temaPrincipal||'-'}</td><td style=\"padding:7px 6px;border-bottom:1px solid #f1f5f9\">S/ ${c.precio||'-'}</td></tr>`;
      });
      html += '</tbody></table>';
      cursosContent.innerHTML = html;
    }).catch(err => {
      cursosContent.innerHTML = '<div style="color:#dc2626">Error al cargar cursos: ' + err.message + '</div>';
    });
  }

  // --- Tabs switching logic ---
  const tabUsuarios = document.getElementById('tabUsuarios');
  const tabCursos = document.getElementById('tabCursos');
  const usuariosSection = document.getElementById('usuariosSection');
  const cursosSection = document.getElementById('cursosSection');

  if (tabUsuarios && tabCursos && usuariosSection && cursosSection) {
    tabUsuarios.addEventListener('click', function() {
      tabUsuarios.classList.add('active');
      tabCursos.classList.remove('active');
      usuariosSection.style.display = '';
      cursosSection.style.display = 'none';
      renderUsers();
    });
    tabCursos.addEventListener('click', function() {
      tabCursos.classList.add('active');
      tabUsuarios.classList.remove('active');
      usuariosSection.style.display = 'none';
      cursosSection.style.display = '';
      renderCourses();
    });
    // Mostrar usuarios por defecto
    renderUsers();
  }
});
