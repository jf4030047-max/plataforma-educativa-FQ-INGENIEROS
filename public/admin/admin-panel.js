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

  // --- Renderizadores ---
  function renderCourses() {
    const panelContent = document.getElementById('panelContent');
    if (!panelContent) return;
    panelContent.innerHTML = `
      <form id="createCourseForm" style="margin-bottom:24px">
        <h3 style="font-size:17px;margin-bottom:10px">Crear nuevo curso</h3>
        <div style="margin-bottom:10px">
          <label>Nombre del curso</label>
          <input type="text" id="courseName" required style="width:100%;padding:8px;margin-top:2px" />
        </div>
        <div style="margin-bottom:10px">
          <label>ID del curso (único, sin espacios)</label>
          <input type="text" id="courseId" required style="width:100%;padding:8px;margin-top:2px" />
        </div>
        <div style="margin-bottom:10px">
          <label>Precio (S/)</label>
          <input type="number" id="coursePrice" min="0" required style="width:100%;padding:8px;margin-top:2px" />
        </div>
        <button type="submit" style="padding:10px 18px;background:#1565c0;color:#fff;border:none;border-radius:8px;font-weight:600">Crear curso</button>
      </form>
      <div id="coursesList"></div>
    `;
    // Listar cursos
    const list = document.getElementById('coursesList');
    if (!list) return;
    list.innerHTML = '<div style="color:#64748b">Cargando cursos...</div>';
    db.collection('courses').get().then(snap => {
      if (snap.empty) {
        list.innerHTML = '<div style="color:#64748b">No hay cursos registrados.</div>';
        return;
      }
      let html = '<h4 style="margin:18px 0 8px">Cursos registrados</h4><ul style="padding-left:18px">';
      snap.forEach(doc => {
        const c = doc.data();
        html += `<li style="margin-bottom:8px"><b>${c.name}</b> (ID: <code>${doc.id}</code>) — S/ ${c.price} ${c.active===false ? '<span style=\"color:#dc2626;font-size:12px\">(inactivo)</span>' : ''}
        <button onclick=\"editCourse('${doc.id}')\" style=\"margin-left:10px;padding:2px 10px;font-size:12px;border-radius:6px;border:1px solid #1565c0;background:#fff;color:#1565c0;cursor:pointer\">Editar</button>
        <button onclick=\"deleteCourse('${doc.id}')\" style=\"margin-left:4px;padding:2px 10px;font-size:12px;border-radius:6px;border:1px solid #dc2626;background:#fff;color:#dc2626;cursor:pointer\">Eliminar</button>
        </li>`;
      });
      html += '</ul>';
      list.innerHTML = html;
      window.editCourse = function(id) {
        db.collection('courses').doc(id).get().then(function(doc) {
          if (!doc.exists) return alert('Curso no encontrado');
          const c = doc.data();
          const formHtml = `
            <form id=\"editCourseForm\" style=\"margin-bottom:18px\">
              <h3 style=\"font-size:16px;margin-bottom:10px\">Editar curso</h3>
              <div style=\"margin-bottom:10px\">
                <label>Nombre del curso</label>
                <input type=\"text\" id=\"editCourseName\" value=\"${c.name||''}\" required style=\"width:100%;padding:8px;margin-top:2px\" />
              </div>
              <div style=\"margin-bottom:10px\">
                <label>Precio (S/)</label>
                <input type=\"number\" id=\"editCoursePrice\" value=\"${c.price||0}\" min=\"0\" required style=\"width:100%;padding:8px;margin-top:2px\" />
              </div>
              <div style=\"margin-bottom:10px\">
                <label>Activo</label>
                <input type=\"checkbox\" id=\"editCourseActive\" ${c.active!==false?'checked':''} />
                <span style=\"font-size:13px;color:#64748b\">(Visible para usuarios)</span>
              </div>
              <button type=\"submit\" style=\"padding:8px 18px;background:#1565c0;color:#fff;border:none;border-radius:8px;font-weight:600\">Guardar cambios</button>
              <button type=\"button\" id=\"cancelEditBtn\" style=\"margin-left:8px;padding:8px 18px;background:#e2e8f0;color:#334155;border:none;border-radius:8px;font-weight:600\">Cancelar</button>
            </form>`;
          list.innerHTML = formHtml;
          document.getElementById('editCourseForm').onsubmit = function(e) {
            e.preventDefault();
            const name = document.getElementById('editCourseName').value.trim();
            const price = parseFloat(document.getElementById('editCoursePrice').value);
            const active = document.getElementById('editCourseActive').checked;
            db.collection('courses').doc(id).update({ name, price, active }).then(function() {
              alert('Curso actualizado');
              renderCourses();
            }).catch(function(err) {
              alert('Error al actualizar: ' + err.message);
            });
          };
          document.getElementById('cancelEditBtn').onclick = function() { renderCourses(); };
        });
      };
      window.deleteCourse = function(id) {
        if (!confirm('¿Eliminar este curso? Esta acción no se puede deshacer.')) return;
        db.collection('courses').doc(id).delete().then(function() {
          alert('Curso eliminado');
          renderCourses();
        }).catch(function(err) {
          alert('Error al eliminar: ' + err.message);
        });
      };
    });
  }

  function renderUsers() {
    const panelContent = document.getElementById('panelContent');
    if (!panelContent) return;
    panelContent.innerHTML = '<div style="color:#64748b">Cargando usuarios...</div>';
    db.collection('users').get().then(snap => {
      if (snap.empty) {
        panelContent.innerHTML = '<div style="color:#64748b">No hay usuarios registrados.</div>';
        return;
      }
      let html = '<h3 style="margin-bottom:14px;font-size:17px">Usuarios registrados</h3>';
      html += '<table style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr><th style="text-align:left;padding:8px 6px;border-bottom:1px solid #e2e8f0">Nombre</th><th style="text-align:left;padding:8px 6px;border-bottom:1px solid #e2e8f0">Correo</th></tr></thead><tbody>';
      snap.forEach(doc => {
        const u = doc.data();
        html += `<tr><td style=\"padding:7px 6px;border-bottom:1px solid #f1f5f9\">${u.name||'-'}</td><td style=\"padding:7px 6px;border-bottom:1px solid #f1f5f9\">${u.email||'-'}</td></tr>`;
      });
      html += '</tbody></table>';
      panelContent.innerHTML = html;
    }).catch(err => {
      panelContent.innerHTML = '<div style="color:#dc2626">Error al cargar usuarios: ' + err.message + '</div>';
    });
  }

  // --- Menú ---
  document.querySelectorAll('.sidebar-menu a').forEach(link => {
    link.addEventListener('click', function(e) {
      if (this.textContent.includes('Panel')) {
        renderCourses();
      } else if (this.textContent.includes('Usuarios')) {
        e.preventDefault();
        renderUsers();
      }
    });
  });

  // Mostrar cursos por defecto
  renderCourses();
});
