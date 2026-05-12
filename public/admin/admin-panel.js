// admin-panel.js - PANEL DE ADMINISTRACIÓN COMPLETO FQ INGENIEROS
// FUNCIONALIDAD: Agregar, editar, eliminar cursos | Editar usuarios | Estadísticas en tiempo real

document.addEventListener('DOMContentLoaded', function () {
  if (typeof firebase === 'undefined' || !firebase.firestore) return;
  const db = firebase.firestore();

  // ========== ESTADÍSTICAS ==========
  function actualizarEstadisticas() {
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
  }

  // ========== USUARIOS ==========
  function renderUsers() {
    const usuariosContent = document.getElementById('usuariosContent');
    if (!usuariosContent) return;
    usuariosContent.innerHTML = '<div style="color:#64748b">Cargando usuarios...</div>';

    db.collection('users').get().then(snap => {
      if (snap.empty) {
        usuariosContent.innerHTML = '<div style="color:#64748b;padding:16px">No hay usuarios registrados.</div>';
        return;
      }

      let html = `
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="background:#f7f9fc">
              <th style="text-align:left;padding:12px 8px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#64748b">Nombre</th>
              <th style="text-align:left;padding:12px 8px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#64748b">Correo</th>
              <th style="text-align:left;padding:12px 8px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#64748b">Rol</th>
              <th style="text-align:center;padding:12px 8px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#64748b">Acciones</th>
            </tr>
          </thead>
          <tbody>
      `;

      snap.forEach(doc => {
        const u = doc.data();
        const docId = doc.id;
        const nombre = u.nombre || u.name || 'Sin nombre';
        const email = u.email || 'Sin correo';
        const rol = u.rol || 'Estudiante';

        html += `
          <tr style="border-bottom:1px solid #f1f5f9;hover:background:#f7f9fc">
            <td style="padding:10px 8px">${nombre}</td>
            <td style="padding:10px 8px">${email}</td>
            <td style="padding:10px 8px"><span style="background:#e0f2fe;color:#0284c7;padding:4px 10px;border-radius:6px;font-size:12px">${rol}</span></td>
            <td style="padding:10px 8px;text-align:center">
              <button onclick="editarUsuario('${docId}')" style="background:none;border:none;cursor:pointer;color:#0284c7;font-size:16px" class="material-icons-round" title="Editar">edit</button>
              <button onclick="confirmarEliminarUsuario('${docId}','${nombre.replace(/'/g, "\\'")}')" style="background:none;border:none;cursor:pointer;color:#dc2626;font-size:16px;margin-left:8px" class="material-icons-round" title="Eliminar">delete</button>
            </td>
          </tr>
        `;
      });

      html += '</tbody></table>';
      usuariosContent.innerHTML = html;
    }).catch(err => {
      usuariosContent.innerHTML = '<div style="color:#dc2626;padding:16px">Error: ' + err.message + '</div>';
    });
  }

  // ========== CURSOS ==========
  function renderCourses() {
    const cursosContent = document.getElementById('cursosContent');
    if (!cursosContent) return;
    cursosContent.innerHTML = '<div style="color:#64748b">Cargando cursos...</div>';

    db.collection('courses').get().then(snap => {
      if (snap.empty) {
        cursosContent.innerHTML = '<div style="color:#64748b;padding:16px">No hay cursos registrados.</div>';
        return;
      }

      let html = `
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="background:#f7f9fc">
              <th style="text-align:left;padding:12px 8px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#64748b">Nombre</th>
              <th style="text-align:left;padding:12px 8px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#64748b">Fecha</th>
              <th style="text-align:left;padding:12px 8px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#64748b">Tema</th>
              <th style="text-align:left;padding:12px 8px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#64748b">Precio</th>
              <th style="text-align:center;padding:12px 8px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#64748b">Acciones</th>
            </tr>
          </thead>
          <tbody>
      `;

      snap.forEach(doc => {
        const c = doc.data();
        const docId = doc.id;
        const nombre = c.name || c.nombre || 'Sin nombre';
        const fecha = c.fecha || c.date || '-';
        const tema = c.temaPrincipal || '-';
        const precio = c.precio || '-';

        html += `
          <tr style="border-bottom:1px solid #f1f5f9">
            <td style="padding:10px 8px">${nombre}</td>
            <td style="padding:10px 8px">${fecha}</td>
            <td style="padding:10px 8px">${tema}</td>
            <td style="padding:10px 8px">S/ ${precio}</td>
            <td style="padding:10px 8px;text-align:center">
              <button onclick="editarCurso('${docId}')" style="background:none;border:none;cursor:pointer;color:#0284c7;font-size:16px" class="material-icons-round" title="Editar">edit</button>
              <button onclick="confirmarEliminarCurso('${docId}','${nombre.replace(/'/g, "\\'")}')" style="background:none;border:none;cursor:pointer;color:#dc2626;font-size:16px;margin-left:8px" class="material-icons-round" title="Eliminar">delete</button>
            </td>
          </tr>
        `;
      });

      html += '</tbody></table>';
      cursosContent.innerHTML = html;
    }).catch(err => {
      cursosContent.innerHTML = '<div style="color:#dc2626;padding:16px">Error: ' + err.message + '</div>';
    });
  }

  // ========== TABS ==========
  const tabUsuarios = document.getElementById('tabUsuarios');
  const tabCursos = document.getElementById('tabCursos');
  const usuariosSection = document.getElementById('usuariosSection');
  const cursosSection = document.getElementById('cursosSection');
  const menuCursos = document.getElementById('menuCursos');
  const menuPanel = document.getElementById('menuPanel');

  if (tabUsuarios && tabCursos) {
    tabUsuarios.addEventListener('click', function() {
      tabUsuarios.style.background = '#e3f0fa';
      tabUsuarios.style.color = '#1565c0';
      tabCursos.style.background = '#f7f9fc';
      tabCursos.style.color = '#64748b';
      usuariosSection.style.display = '';
      cursosSection.style.display = 'none';
      renderUsers();
    });

    tabCursos.addEventListener('click', function() {
      tabCursos.style.background = '#e3f0fa';
      tabCursos.style.color = '#1565c0';
      tabUsuarios.style.background = '#f7f9fc';
      tabUsuarios.style.color = '#64748b';
      usuariosSection.style.display = 'none';
      cursosSection.style.display = '';
      renderCourses();
    });
  }

  // Hacer click en "Gestionar Cursos" del menú
  if (menuCursos) {
    menuCursos.addEventListener('click', function(e) {
      e.preventDefault();
      // Activar tab de cursos
      if (tabCursos) {
        tabCursos.click();
      }
    });
  }

  // ========== AGREGAR CURSO ==========
  const btnAgregarCurso = document.getElementById('btnAgregarCurso');
  const modalAgregarCurso = document.getElementById('modalAgregarCurso');
  const formAgregarCurso = document.getElementById('formAgregarCurso');
  const btnCancelarModal = document.getElementById('btnCancelarModal');

  if (btnAgregarCurso) {
    btnAgregarCurso.addEventListener('click', function() {
      modalAgregarCurso.style.display = 'flex';
      formAgregarCurso.reset();
    });
  }

  if (btnCancelarModal) {
    btnCancelarModal.addEventListener('click', function() {
      modalAgregarCurso.style.display = 'none';
    });
  }

  // Cerrar modal al hacer click fuera
  if (modalAgregarCurso) {
    modalAgregarCurso.addEventListener('click', function(e) {
      if (e.target === this) {
        this.style.display = 'none';
      }
    });
  }

  if (formAgregarCurso) {
    formAgregarCurso.addEventListener('submit', function(e) {
      e.preventDefault();
      const nombre = document.querySelector('input[name="nombre"]').value;
      const fecha = document.querySelector('input[name="fecha"]').value;
      const tema = document.querySelector('input[name="temaPrincipal"]').value;
      const precio = parseFloat(document.querySelector('input[name="precio"]').value);
      const desc = document.querySelector('textarea[name="desc"]').value;

      db.collection('courses').add({
        name: nombre,
        fecha: fecha,
        temaPrincipal: tema,
        precio: precio,
        desc: desc,
        active: true,
        createdAt: new Date()
      }).then(() => {
        modalAgregarCurso.style.display = 'none';
        renderCourses();
        actualizarEstadisticas();
        mostrarNotificacion('✅ Curso creado exitosamente', 'success');
      }).catch(err => mostrarNotificacion('❌ Error: ' + err.message, 'error'));
    });
  }

  // ========== INICIAR ==========
  renderUsers();
  actualizarEstadisticas();

  // Crear modal para editar curso
  function crearModalEditarCurso() {
    const html = `
      <div id="modalEditarCurso" style="display:none;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(15,23,42,0.5);z-index:1000;align-items:center;justify-content:center;">
        <div style="background:#fff;padding:32px;border-radius:14px;box-shadow:0 10px 40px rgba(15,23,42,0.2);width:90%;max-width:500px;">
          <h3 style="margin-bottom:20px;color:#1565c0;font-size:20px;">✏️ Editar Curso</h3>
          <form id="formEditarCurso">
            <div style="margin-bottom:16px;">
              <label style="display:block;margin-bottom:6px;color:#334155;font-weight:500;font-size:14px;">Nombre del curso</label>
              <input type="text" id="editCursoNombre" style="width:100%;padding:10px 12px;border:1.5px solid #dce3ed;border-radius:8px;font-size:14px;font-family:inherit;" required>
            </div>
            <div style="margin-bottom:16px;">
              <label style="display:block;margin-bottom:6px;color:#334155;font-weight:500;font-size:14px;">Fecha</label>
              <input type="date" id="editCursoFecha" style="width:100%;padding:10px 12px;border:1.5px solid #dce3ed;border-radius:8px;font-size:14px;font-family:inherit;">
            </div>
            <div style="margin-bottom:16px;">
              <label style="display:block;margin-bottom:6px;color:#334155;font-weight:500;font-size:14px;">Tema principal</label>
              <input type="text" id="editCursoTema" style="width:100%;padding:10px 12px;border:1.5px solid #dce3ed;border-radius:8px;font-size:14px;font-family:inherit;">
            </div>
            <div style="margin-bottom:16px;">
              <label style="display:block;margin-bottom:6px;color:#334155;font-weight:500;font-size:14px;">Precio</label>
              <input type="number" id="editCursoPrecio" style="width:100%;padding:10px 12px;border:1.5px solid #dce3ed;border-radius:8px;font-size:14px;font-family:inherit;" step="0.01">
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:24px;">
              <button type="button" id="btnCancelarEditar" style="background:#f3f4f6;color:#334155;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;font-family:inherit;">Cancelar</button>
              <button type="submit" style="background:#1565c0;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;font-family:inherit;">Guardar cambios</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    
    const modal = document.getElementById('modalEditarCurso');
    const form = document.getElementById('formEditarCurso');
    const btnCancelar = document.getElementById('btnCancelarEditar');

    btnCancelar.addEventListener('click', () => modal.style.display = 'none');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const docId = form.dataset.docId;
      const updates = {
        name: document.getElementById('editCursoNombre').value,
        fecha: document.getElementById('editCursoFecha').value,
        temaPrincipal: document.getElementById('editCursoTema').value,
        precio: parseFloat(document.getElementById('editCursoPrecio').value) || 0
      };

      try {
        await db.collection('courses').doc(docId).update(updates);
        modal.style.display = 'none';
        renderCourses();
        actualizarEstadisticas();
        mostrarNotificacion('✅ Curso actualizado correctamente', 'success');
      } catch (err) {
        mostrarNotificacion('❌ Error: ' + err.message, 'error');
      }
    });

    return modal;
  }

  const modalEditarCurso = crearModalEditarCurso();

  function mostrarNotificacion(mensaje, tipo) {
    const notif = document.createElement('div');
    notif.textContent = mensaje;
    notif.style.cssText = `
      position:fixed;
      top:20px;
      right:20px;
      padding:12px 20px;
      border-radius:8px;
      background:${tipo === 'success' ? '#dcfce7' : '#fee2e2'};
      color:${tipo === 'success' ? '#16a34a' : '#dc2626'};
      border:1px solid ${tipo === 'success' ? '#86efac' : '#fca5a5'};
      z-index:2000;
      font-weight:600;
      font-size:14px;
    `;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
  }

  // Exponemos funciones globales para botones de acciones
  window.editarCurso = editarCurso;
  window.confirmarEliminarCurso = confirmarEliminarCurso;
  window.editarUsuario = editarUsuario;
  window.confirmarEliminarUsuario = confirmarEliminarUsuario;

  function editarCurso(docId) {
    db.collection('courses').doc(docId).get().then(doc => {
      const curso = doc.data();
      document.getElementById('editCursoNombre').value = curso.name || '';
      document.getElementById('editCursoFecha').value = curso.fecha || '';
      document.getElementById('editCursoTema').value = curso.temaPrincipal || '';
      document.getElementById('editCursoPrecio').value = curso.precio || 0;
      document.getElementById('formEditarCurso').dataset.docId = docId;
      modalEditarCurso.style.display = 'flex';
    });
  }

  function confirmarEliminarCurso(docId, nombre) {
    if (confirm(`¿Eliminar curso "${nombre}"? Esta acción no se puede deshacer.`)) {
      db.collection('courses').doc(docId).delete()
        .then(() => { renderCourses(); actualizarEstadisticas(); mostrarNotificacion('✅ Curso eliminado', 'success'); })
        .catch(err => mostrarNotificacion('❌ Error: ' + err.message, 'error'));
    }
  }

  function editarUsuario(docId) {
    const nuevoNombre = prompt('Nombre del usuario:');
    if (nuevoNombre) {
      db.collection('users').doc(docId).update({ nombre: nuevoNombre })
        .then(() => { renderUsers(); actualizarEstadisticas(); mostrarNotificacion('✅ Usuario actualizado', 'success'); })
        .catch(err => mostrarNotificacion('❌ Error: ' + err.message, 'error'));
    }
  }

  function confirmarEliminarUsuario(docId, nombre) {
    if (confirm(`¿Eliminar usuario "${nombre}"?`)) {
      db.collection('users').doc(docId).delete()
        .then(() => { renderUsers(); actualizarEstadisticas(); mostrarNotificacion('✅ Usuario eliminado', 'success'); })
        .catch(err => mostrarNotificacion('❌ Error: ' + err.message, 'error'));
    }
  }
});
