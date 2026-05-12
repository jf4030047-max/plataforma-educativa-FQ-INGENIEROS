// admin-panel.js - PANEL DE ADMINISTRACIÓN COMPLETO FQ INGENIEROS
// FUNCIONALIDAD: Agregar, editar, eliminar cursos | Editar usuarios | Estadísticas en tiempo real

document.addEventListener('DOMContentLoaded', function () {
  if (typeof firebase === 'undefined' || !firebase.firestore) return;
  const db = firebase.firestore();

  // ========== ESTADÍSTICAS COMPLETAS ==========
  function actualizarEstadisticas() {
    // Cursos activos
    db.collection('courses').where('active', '==', true).get().then(snap => {
      document.getElementById('statCursos').textContent = snap.size;
    });

    // Usuarios registrados
    db.collection('users').get().then(snap => {
      const totalUsers = snap.size;
      document.getElementById('statUsuarios').textContent = totalUsers;
      
      // Estudiantes activos (con matriculaciones)
      db.collection('enrollments').get().then(enrollSnap => {
        const activeStudents = new Set();
        enrollSnap.forEach(doc => { activeStudents.add(doc.data().userId); });
        document.getElementById('estudiantesActivos').textContent = activeStudents.size;
      });
    });

    // Ingresos del mes
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    db.collection('payments').where('status', '==', 'verified').get().then(snap => {
      let total = 0;
      snap.forEach(doc => {
        const pago = doc.data();
        if (typeof pago.amount === 'number') total += pago.amount;
      });
      document.getElementById('statIngresos').textContent = 'S/ ' + total.toLocaleString('es-PE');
    });

    // Matriculaciones este mes
    db.collection('enrollments').get().then(snap => {
      let thisMonth = 0;
      snap.forEach(doc => {
        const enr = doc.data();
        if (enr.enrolledAt) {
          const enrollDate = new Date(enr.enrolledAt.toDate ? enr.enrolledAt.toDate() : enr.enrolledAt);
          if (enrollDate >= firstDay && enrollDate <= lastDay) thisMonth++;
        }
      });
      document.getElementById('statMatriculaciones').textContent = thisMonth;
    });

    // Pagos pendientes de verificación
    db.collection('payments').where('status', '==', 'pending').get().then(snap => {
      document.getElementById('statPagosPendientes').textContent = snap.size;
    });

    // Certificados emitidos
    db.collection('certificates').get().then(snap => {
      document.getElementById('statCertificados').textContent = snap.size;
    });

    // Tasa de ocupación
    Promise.all([
      db.collection('courses').where('active', '==', true).get(),
      db.collection('enrollments').get()
    ]).then(([cursosSnap, enrollSnap]) => {
      const totalCursos = cursosSnap.size || 1;
      const totalEnroll = enrollSnap.size;
      const capacidadMax = totalCursos * 30; // Asumiendo 30 estudiantes por curso
      const tasaOcupacion = Math.round((totalEnroll / capacidadMax) * 100);
      document.getElementById('tasaOcupacion').textContent = Math.min(100, tasaOcupacion) + '%';
    });
  }

  // ========== PAGOS PENDIENTES ==========
  function renderPagosPendientes() {
    const container = document.getElementById('pagosPendientesContent');
    if (!container) return;
    
    db.collection('payments').where('status', '==', 'pending').orderBy('uploadedAt', 'desc').limit(10).get().then(snap => {
      if (snap.empty) {
        container.innerHTML = '<div style="color:#64748b;padding:16px;text-align:center;">✅ No hay pagos pendientes</div>';
        return;
      }

      let html = `
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:#f7f9fc">
              <th style="text-align:left;padding:12px 8px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#64748b">Estudiante</th>
              <th style="text-align:left;padding:12px 8px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#64748b">Curso</th>
              <th style="text-align:left;padding:12px 8px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#64748b">Monto</th>
              <th style="text-align:left;padding:12px 8px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#64748b">Método</th>
              <th style="text-align:center;padding:12px 8px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#64748b">Acciones</th>
            </tr>
          </thead>
          <tbody>
      `;

      snap.forEach(doc => {
        const pago = doc.data();
        const monto = pago.amount || 0;
        const metodo = pago.method || 'N/A';
        
        html += `
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:10px 8px;">${pago.userName || 'Usuario'}</td>
            <td style="padding:10px 8px;">${pago.courseName || 'N/A'}</td>
            <td style="padding:10px 8px;"><strong>S/ ${monto}</strong></td>
            <td style="padding:10px 8px;"><span style="background:#fef3c7;color:#b45309;padding:2px 8px;border-radius:4px;font-size:11px;">${metodo}</span></td>
            <td style="padding:10px 8px;text-align:center;">
              <button onclick="verificarPago('${doc.id}')" style="background:#16a34a;color:white;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600;">Aprobar</button>
              <button onclick="rechazarPago('${doc.id}')" style="background:#dc2626;color:white;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600;margin-left:4px;">Rechazar</button>
            </td>
          </tr>
        `;
      });

      html += '</tbody></table>';
      container.innerHTML = html;
    });
  }

  // ========== ÚLTIMAS MATRICULACIONES ==========
  function renderUltimasMatriculaciones() {
    const container = document.getElementById('ultimasMatriculacionesContent');
    if (!container) return;
    
    db.collection('enrollments').orderBy('enrolledAt', 'desc').limit(8).get().then(snap => {
      if (snap.empty) {
        container.innerHTML = '<div style="color:#64748b;padding:16px;">No hay matriculaciones aún.</div>';
        return;
      }

      let html = `
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:#f7f9fc">
              <th style="text-align:left;padding:12px 8px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#64748b">Estudiante</th>
              <th style="text-align:left;padding:12px 8px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#64748b">Curso</th>
              <th style="text-align:left;padding:12px 8px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#64748b">Fecha</th>
              <th style="text-align:left;padding:12px 8px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#64748b">Estado</th>
            </tr>
          </thead>
          <tbody>
      `;

      const promesas = [];
      const enrollmentsList = [];
      
      snap.forEach(doc => {
        const enr = doc.data();
        enrollmentsList.push(enr);
        
        // Obtener el nombre real del usuario desde la colección de usuarios
        promesas.push(
          db.collection('users').doc(enr.userId).get().then(userDoc => {
            if (userDoc.exists) {
              const usuario = userDoc.data();
              enr.userName = usuario.nombre || usuario.name || usuario.email || 'Usuario';
            } else {
              enr.userName = enr.userEmail || 'Usuario';
            }
          }).catch(() => {
            enr.userName = enr.userEmail || 'Usuario';
          })
        );
      });

      Promise.all(promesas).then(() => {
        enrollmentsList.forEach(enr => {
          const fecha = enr.enrolledAt ? new Date(enr.enrolledAt.toDate ? enr.enrolledAt.toDate() : enr.enrolledAt).toLocaleDateString('es-PE') : 'N/A';
          const status = enr.status || 'active';
          const statusColor = status === 'completed' ? '#dcfce7' : status === 'cancelled' ? '#fee2e2' : '#dbeafe';
          const statusText = status === 'completed' ? 'Completado' : status === 'cancelled' ? 'Cancelado' : 'Activo';
          const statusTextColor = status === 'completed' ? '#16a34a' : status === 'cancelled' ? '#dc2626' : '#0284c7';
          
          html += `
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:10px 8px;">${enr.userName}</td>
              <td style="padding:10px 8px;">${enr.courseName || 'N/A'}</td>
              <td style="padding:10px 8px;">${fecha}</td>
              <td style="padding:10px 8px;"><span style="background:${statusColor};color:${statusTextColor};padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">${statusText}</span></td>
            </tr>
          `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
      });
    });
  }

  // ========== ESTUDIANTES POR CURSO ==========
  function renderEstudiantesPorCurso() {
    const container = document.getElementById('estudiantesPorCursoContent');
    if (!container) return;
    
    db.collection('courses').get().then(cursosSnap => {
      if (cursosSnap.empty) {
        container.innerHTML = '<div style="color:#64748b;padding:16px;">No hay cursos registrados.</div>';
        return;
      }

      const cursosData = {};
      const cursosPromesas = [];

      // Obtener datos de cada curso
      cursosSnap.forEach(cursoDoc => {
        const curso = cursoDoc.data();
        cursosData[cursoDoc.id] = { name: curso.name || 'Sin nombre', estudiantes: [] };
        
        // Para cada curso, obtener sus matriculaciones
        cursosPromesas.push(
          db.collection('enrollments').where('courseId', '==', cursoDoc.id).get().then(enrollSnap => {
            const estudiantePromesas = [];
            
            enrollSnap.forEach(enrollDoc => {
              const enroll = enrollDoc.data();
              
              // Obtener el nombre real del usuario
              estudiantePromesas.push(
                db.collection('users').doc(enroll.userId).get().then(userDoc => {
                  if (userDoc.exists) {
                    const usuario = userDoc.data();
                    const nombre = usuario.nombre || usuario.name || usuario.email || 'Usuario';
                    cursosData[cursoDoc.id].estudiantes.push({
                      nombre: nombre,
                      email: enroll.userEmail || 'N/A',
                      fecha: enroll.enrolledAt ? new Date(enroll.enrolledAt.toDate ? enroll.enrolledAt.toDate() : enroll.enrolledAt).toLocaleDateString('es-PE') : 'N/A'
                    });
                  } else {
                    cursosData[cursoDoc.id].estudiantes.push({
                      nombre: enroll.userEmail || 'Usuario',
                      email: enroll.userEmail || 'N/A',
                      fecha: enroll.enrolledAt ? new Date(enroll.enrolledAt.toDate ? enroll.enrolledAt.toDate() : enroll.enrolledAt).toLocaleDateString('es-PE') : 'N/A'
                    });
                  }
                }).catch(() => {
                  cursosData[cursoDoc.id].estudiantes.push({
                    nombre: enroll.userEmail || 'Usuario',
                    email: enroll.userEmail || 'N/A',
                    fecha: enroll.enrolledAt ? new Date(enroll.enrolledAt.toDate ? enroll.enrolledAt.toDate() : enroll.enrolledAt).toLocaleDateString('es-PE') : 'N/A'
                  });
                })
              );
            });
            
            return Promise.all(estudiantePromesas);
          })
        );
      });

      Promise.all(cursosPromesas).then(() => {
        let html = `
          <div style="display:grid;gap:20px;">
        `;

        Object.keys(cursosData).forEach(cursoId => {
          const curso = cursosData[cursoId];
          const cantEstudiantes = curso.estudiantes.length;
          const colorBadge = cantEstudiantes === 0 ? '#f1f5f9' : cantEstudiantes < 5 ? '#fef3c7' : '#dcfce7';
          const colorTexto = cantEstudiantes === 0 ? '#94a3b8' : cantEstudiantes < 5 ? '#b45309' : '#16a34a';

          html += `
            <div style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;background:#fff;">
              <div style="background:#f7f9fc;padding:16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e2e8f0;">
                <div>
                  <h4 style="margin:0;color:#1565c0;font-size:16px;font-weight:600;">${curso.name}</h4>
                  <p style="margin:4px 0 0 0;color:#64748b;font-size:13px;">ID: ${cursoId}</p>
                </div>
                <span style="background:${colorBadge};color:${colorTexto};padding:8px 12px;border-radius:6px;font-weight:600;font-size:13px;">
                  ${cantEstudiantes} estudiante${cantEstudiantes !== 1 ? 's' : ''}
                </span>
              </div>
              <div style="padding:12px;">
          `;

          if (curso.estudiantes.length === 0) {
            html += '<div style="color:#94a3b8;padding:12px;text-align:center;font-size:13px;">Sin matriculaciones</div>';
          } else {
            html += `
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <thead>
                  <tr style="background:#f1f5f9;border-bottom:1px solid #e2e8f0;">
                    <th style="text-align:left;padding:10px 8px;font-weight:600;color:#64748b;">Estudiante</th>
                    <th style="text-align:left;padding:10px 8px;font-weight:600;color:#64748b;">Correo</th>
                    <th style="text-align:left;padding:10px 8px;font-weight:600;color:#64748b;">Fecha Matrícula</th>
                  </tr>
                </thead>
                <tbody>
            `;

            curso.estudiantes.forEach(est => {
              html += `
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:10px 8px;"><strong>${est.nombre}</strong></td>
                  <td style="padding:10px 8px;color:#64748b;font-size:12px;">${est.email}</td>
                  <td style="padding:10px 8px;color:#64748b;">${est.fecha}</td>
                </tr>
              `;
            });

            html += `
                </tbody>
              </table>
            `;
          }

          html += `
              </div>
            </div>
          `;
        });

        html += '</div>';
        container.innerHTML = html;
      });
    });
  }

  // ========== FUNCIÓN PARA VERIFICAR PAGO ==========
  window.verificarPago = function(paymentId) {
    if (!confirm('¿Aprobar este pago?')) return;
    
    db.collection('payments').doc(paymentId).update({ status: 'verified' }).then(() => {
      mostrarNotificacion('✅ Pago aprobado correctamente', 'success');
      actualizarEstadisticas();
      renderPagosPendientes();
    });
  }

  // ========== FUNCIÓN PARA RECHAZAR PAGO ==========
  window.rechazarPago = function(paymentId) {
    if (!confirm('¿Rechazar este pago?')) return;
    
    db.collection('payments').doc(paymentId).update({ status: 'rejected' }).then(() => {
      mostrarNotificacion('❌ Pago rechazado', 'info');
      actualizarEstadisticas();
      renderPagosPendientes();
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
        cursosContent.innerHTML = '<div style="color:#64748b;padding:16px;background:#f7f9fc;border-radius:8px;text-align:center;">📭 No hay cursos registrados. <button onclick="document.getElementById(\'btnAgregarCurso\').click()" style="background:none;border:none;color:#1565c0;text-decoration:underline;cursor:pointer;font-weight:600;">Crear uno ahora</button></div>';
        return;
      }

      let html = `
        <div style="display:grid;gap:16px;">
      `;

      snap.forEach(doc => {
        const c = doc.data();
        const docId = doc.id;
        const nombre = c.name || c.nombre || 'Sin nombre';
        const fecha = c.fecha || c.startDate || c.date || '-';
        const tema = c.temaPrincipal || '-';
        const precio = c.precio || 'Gratis';
        const desc = c.desc || c.description || 'Sin descripción';
        const activo = c.active !== false; // Por defecto activo
        const id = c.id || '-';

        const badgeColor = activo ? '#dcfce7' : '#fee2e2';
        const badgeTextColor = activo ? '#16a34a' : '#dc2626';
        const badgeText = activo ? '✓ Activo' : '✗ Inactivo';

        html += `
          <div style="border:1.5px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#fff;transition:all 0.2s">
            <div style="background:linear-gradient(135deg, #f7f9fc 0%, #eef2f7 100%);padding:16px;border-bottom:1px solid #e2e8f0;display:flex;align-items:flex-start;justify-content:space-between;">
              <div style="flex:1;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                  <h4 style="margin:0;color:#1565c0;font-size:16px;font-weight:700;">${nombre}</h4>
                  <span style="background:${badgeColor};color:${badgeTextColor};padding:4px 10px;border-radius:5px;font-size:11px;font-weight:600;white-space:nowrap;">${badgeText}</span>
                </div>
                <p style="margin:4px 0 0 0;color:#64748b;font-size:13px;">🏷️ ID: <code style="background:#f1f5f9;padding:2px 6px;border-radius:3px;font-family:monospace;font-size:11px;">${docId}</code></p>
              </div>
              <div style="text-align:right;font-weight:700;color:#1565c0;font-size:18px;">
                S/ ${precio}
              </div>
            </div>
            
            <div style="padding:16px;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:12px;font-size:13px;">
                <div>
                  <strong style="color:#64748b;display:block;margin-bottom:4px;">📅 Fecha</strong>
                  <span style="color:#334155;">${fecha}</span>
                </div>
                <div>
                  <strong style="color:#64748b;display:block;margin-bottom:4px;">📚 Tema</strong>
                  <span style="color:#334155;">${tema}</span>
                </div>
              </div>
              
              <div style="margin-bottom:12px;">
                <strong style="color:#64748b;display:block;margin-bottom:4px;font-size:13px;">📝 Descripción</strong>
                <p style="margin:0;color:#64748b;font-size:13px;line-height:1.4;max-height:60px;overflow:hidden;text-overflow:ellipsis;">${desc}</p>
              </div>
              
              <div style="display:flex;gap:8px;padding-top:12px;border-top:1px solid #f1f5f9;">
                <button onclick="editarCurso('${docId}')" style="flex:1;background:#0284c7;color:#fff;border:none;padding:8px 12px;border-radius:6px;font-weight:600;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;gap:6px;" class="btn-action" title="Editar curso">
                  <span class="material-icons-round" style="font-size:16px;">edit</span>Editar
                </button>
                <button onclick="confirmarEliminarCurso('${docId}','${nombre.replace(/'/g, "\\'")}')" style="flex:1;background:#dc2626;color:#fff;border:none;padding:8px 12px;border-radius:6px;font-weight:600;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;gap:6px;" class="btn-action" title="Eliminar curso">
                  <span class="material-icons-round" style="font-size:16px;">delete</span>Eliminar
                </button>
              </div>
            </div>
          </div>
        `;
      });

      html += '</div>';
      cursosContent.innerHTML = html;
    }).catch(err => {
      cursosContent.innerHTML = '<div style="color:#dc2626;padding:16px;background:#fee2e2;border-radius:8px;">❌ Error: ' + err.message + '</div>';
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
  renderCourses(); // Mostrar cursos automáticamente
  actualizarEstadisticas();
  renderPagosPendientes();
  renderUltimasMatriculaciones();
  renderEstudiantesPorCurso();
  
  // Actualizar datos cada 30 segundos
  setInterval(function() {
    actualizarEstadisticas();
    renderPagosPendientes();
    renderUltimasMatriculaciones();
    renderEstudiantesPorCurso();
    renderCourses(); // Actualizar cursos también
  }, 30000);
  
  // Botón para actualizar pagos manualmente
  const btnRefreshPagos = document.getElementById('btnRefreshPagos');
  if (btnRefreshPagos) {
    btnRefreshPagos.addEventListener('click', function() {
      renderPagosPendientes();
      mostrarNotificacion('✅ Datos actualizados', 'success');
    });
  }

  // Botón para actualizar cursos manualmente
  const btnRefreshCursos = document.getElementById('btnRefreshCursos');
  if (btnRefreshCursos) {
    btnRefreshCursos.addEventListener('click', function() {
      renderCourses();
      actualizarEstadisticas();
      mostrarNotificacion('✅ Cursos actualizados', 'success');
    });
  }

  // Crear modal para editar curso
  function crearModalEditarCurso() {
    const html = `
      <div id="modalEditarCurso" style="display:none;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(15,23,42,0.5);z-index:1000;align-items:center;justify-content:center;overflow-y:auto;padding:40px 20px;">
        <div style="background:#fff;padding:32px;border-radius:14px;box-shadow:0 10px 40px rgba(15,23,42,0.2);width:90%;max-width:700px;margin:auto;" onclick="event.stopPropagation();">
          <h3 style="margin-bottom:20px;color:#1565c0;font-size:20px;font-weight:700;">✏️ Editar Curso</h3>
          <form id="formEditarCurso">
            <div style="margin-bottom:16px;">
              <label style="display:block;margin-bottom:6px;color:#334155;font-weight:600;font-size:14px;">Nombre del curso</label>
              <input type="text" id="editCursoNombre" style="width:100%;padding:10px 12px;border:1.5px solid #dce3ed;border-radius:8px;font-size:14px;font-family:inherit;" required>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
              <div>
                <label style="display:block;margin-bottom:6px;color:#334155;font-weight:600;font-size:14px;">Fecha</label>
                <input type="date" id="editCursoFecha" style="width:100%;padding:10px 12px;border:1.5px solid #dce3ed;border-radius:8px;font-size:14px;font-family:inherit;">
              </div>
              <div>
                <label style="display:block;margin-bottom:6px;color:#334155;font-weight:600;font-size:14px;">Precio</label>
                <input type="number" id="editCursoPrecio" style="width:100%;padding:10px 12px;border:1.5px solid #dce3ed;border-radius:8px;font-size:14px;font-family:inherit;" step="0.01">
              </div>
            </div>
            <div style="margin-bottom:16px;">
              <label style="display:block;margin-bottom:6px;color:#334155;font-weight:600;font-size:14px;">Tema principal</label>
              <input type="text" id="editCursoTema" style="width:100%;padding:10px 12px;border:1.5px solid #dce3ed;border-radius:8px;font-size:14px;font-family:inherit;">
            </div>
            <div style="margin-bottom:16px;">
              <label style="display:block;margin-bottom:6px;color:#334155;font-weight:600;font-size:14px;">Descripción</label>
              <textarea id="editCursoDesc" style="width:100%;padding:10px 12px;border:1.5px solid #dce3ed;border-radius:8px;font-size:14px;font-family:inherit;resize:vertical;min-height:80px;"></textarea>
            </div>
            
            <!-- SECCIÓN DE TEMARIO/SUBTEMAS -->
            <div style="margin-bottom:16px;padding:16px;background:#f7f9fc;border-radius:8px;border:1px solid #e2e8f0;">
              <label style="display:block;margin-bottom:12px;color:#334155;font-weight:600;font-size:14px;">📚 Temario (Temas y Subtemas)</label>
              <div id="editTemarioContainer" style="display:flex;flex-direction:column;gap:12px;">
                <!-- Los temas se cargarán aquí dinámicamente -->
              </div>
              <button type="button" id="btnAgregarTema" style="margin-top:12px;background:#3b82f6;color:#fff;border:none;padding:8px 12px;border-radius:6px;font-weight:600;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:6px;">
                <span style="font-size:16px;">+</span>Agregar Tema
              </button>
            </div>
            
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:24px;padding-top:16px;border-top:1px solid #dce3ed;">
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
    const btnAgregarTema = document.getElementById('btnAgregarTema');
    const temarioContainer = document.getElementById('editTemarioContainer');

    function cerrarModal() { modal.style.display = 'none'; }
    
    btnCancelar.addEventListener('click', cerrarModal);
    modal.addEventListener('click', cerrarModal);
    
    // Función para renderizar un tema con sus subtemas
    function renderTema(temarioData, index) {
      const tema = temarioData[index];
      const html = `
        <div style="background:#fff;padding:12px;border-radius:8px;border:1px solid #dce3ed;position:relative;">
          <div style="display:flex;gap:8px;margin-bottom:8px;">
            <input type="text" class="temaTitle" placeholder="Nombre del tema" value="${tema.titulo}" style="flex:1;padding:8px;border:1px solid #dce3ed;border-radius:6px;font-size:13px;">
            <button type="button" onclick="this.closest('[data-tema]').remove()" style="background:#dc2626;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">Eliminar</button>
          </div>
          <div style="margin-left:8px;padding-left:12px;border-left:3px solid #3b82f6;">
            <div class="subtemasList" style="display:flex;flex-direction:column;gap:6px;margin-bottom:8px;">
              ${tema.temas.map((subtema, i) => `
                <div style="display:flex;gap:8px;">
                  <input type="text" class="subtema" placeholder="Subtema" value="${subtema}" style="flex:1;padding:6px 8px;border:1px solid #dce3ed;border-radius:4px;font-size:12px;">
                  <button type="button" onclick="this.parentElement.remove()" style="background:#f3f4f6;color:#dc2626;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:12px;">×</button>
                </div>
              `).join('')}
            </div>
            <button type="button" class="btnAgregarSubtema" style="background:#e0f2fe;color:#0284c7;border:none;padding:6px 10px;border-radius:4px;cursor:pointer;font-size:12px;font-weight:600;">+ Subtema</button>
          </div>
        </div>
      `;
      
      const el = document.createElement('div');
      el.setAttribute('data-tema', index);
      el.innerHTML = html;
      
      el.querySelector('.btnAgregarSubtema').addEventListener('click', (e) => {
        e.preventDefault();
        const subtemaList = el.querySelector('.subtemasList');
        const newSubtema = document.createElement('div');
        newSubtema.style.cssText = 'display:flex;gap:8px;';
        newSubtema.innerHTML = `
          <input type="text" class="subtema" placeholder="Nuevo subtema" style="flex:1;padding:6px 8px;border:1px solid #dce3ed;border-radius:4px;font-size:12px;">
          <button type="button" onclick="this.parentElement.remove()" style="background:#f3f4f6;color:#dc2626;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:12px;">×</button>
        `;
        subtemaList.appendChild(newSubtema);
      });
      
      return el;
    }
    
    // Función para cargar los temas en la UI
    window.cargarTemarioEnModal = function(temario) {
      temarioContainer.innerHTML = '';
      if (temario && Array.isArray(temario)) {
        temario.forEach((tema, index) => {
          temarioContainer.appendChild(renderTema(temario, index));
        });
      }
    };
    
    btnAgregarTema.addEventListener('click', (e) => {
      e.preventDefault();
      const nuevoTema = { titulo: '', temas: [] };
      const index = temarioContainer.children.length;
      const temarioList = [];
      
      temarioContainer.querySelectorAll('[data-tema]').forEach((el, i) => {
        temarioList.push({
          titulo: el.querySelector('.temaTitle').value,
          temas: Array.from(el.querySelectorAll('.subtema')).map(s => s.value)
        });
      });
      temarioList.push(nuevoTema);
      
      window.cargarTemarioEnModal(temarioList);
    });
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const docId = form.dataset.docId;
      
      // Recopilar el temario actualizado
      const temario = [];
      temarioContainer.querySelectorAll('[data-tema]').forEach((el) => {
        const titulo = el.querySelector('.temaTitle').value;
        const temas = Array.from(el.querySelectorAll('.subtema')).map(s => s.value.trim()).filter(s => s);
        if (titulo.trim()) {
          temario.push({ titulo: titulo.trim(), temas });
        }
      });

      const updates = {
        name: document.getElementById('editCursoNombre').value,
        fecha: document.getElementById('editCursoFecha').value,
        temaPrincipal: document.getElementById('editCursoTema').value,
        precio: parseFloat(document.getElementById('editCursoPrecio').value) || 0,
        desc: document.getElementById('editCursoDesc').value,
        temario: temario.length > 0 ? temario : []
      };

      try {
        await db.collection('courses').doc(docId).update(updates);
        cerrarModal();
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
      document.getElementById('editCursoDesc').value = curso.desc || '';
      
      // Cargar el temario si existe
      if (curso.temario && Array.isArray(curso.temario)) {
        window.cargarTemarioEnModal(curso.temario);
      } else {
        window.cargarTemarioEnModal([]);
      }
      
      document.getElementById('formEditarCurso').dataset.docId = docId;
      modalEditarCurso.style.display = 'flex';
    }).catch(err => {
      mostrarNotificacion('❌ Error al cargar datos: ' + err.message, 'error');
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
