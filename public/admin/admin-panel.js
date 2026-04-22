// admin-panel.js - Gestión de cursos para el panel de administrador FQ INGENIEROS

document.addEventListener('DOMContentLoaded', function () {
  if (typeof firebase === 'undefined' || !firebase.firestore) return;
  const db = firebase.firestore();

  // Render formulario para crear curso
  const panelContent = document.getElementById('panelContent');
  if (panelContent) {
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
  }

  // Crear curso
  const form = document.getElementById('createCourseForm');
  if (form) {
    form.onsubmit = async function (e) {
      e.preventDefault();
      const name = document.getElementById('courseName').value.trim();
      const id = document.getElementById('courseId').value.trim();
      const price = parseFloat(document.getElementById('coursePrice').value);
      if (!name || !id || isNaN(price)) return alert('Completa todos los campos.');
      try {
        await db.collection('courses').doc(id).set({ name, price });
        alert('Curso creado correctamente');
        form.reset();
        renderCourses();
      } catch (err) {
        alert('Error al crear curso: ' + err.message);
      }
    };
  }

  // Mostrar lista de cursos
  async function renderCourses() {
    const list = document.getElementById('coursesList');
    if (!list) return;
    list.innerHTML = '<div style="color:#64748b">Cargando cursos...</div>';
    try {
      const snap = await db.collection('courses').get();
      if (snap.empty) {
        list.innerHTML = '<div style="color:#64748b">No hay cursos registrados.</div>';
        return;
      }
      let html = '<h4 style="margin:18px 0 8px">Cursos registrados</h4><ul style="padding-left:18px">';
      snap.forEach(doc => {
        const c = doc.data();
        html += `<li><b>${c.name}</b> (ID: <code>${doc.id}</code>) — S/ ${c.price}</li>`;
      });
      html += '</ul>';
      list.innerHTML = html;
    } catch (err) {
      list.innerHTML = '<div style="color:#dc2626">Error al cargar cursos: ' + err.message + '</div>';
    }
  }

  renderCourses();
});
