// dashboard-dynamic.js
// Lógica dinámica para la sección "Curso en progreso" del dashboard estudiante

document.addEventListener('DOMContentLoaded', function () {


  // Restauración: mostrar cursos de ejemplo siempre
  const heroCourse = document.querySelector('.hero-course');
  const heroCourseBody = heroCourse ? heroCourse.querySelector('.hero-course-body') : null;
  const heroCourseAction = heroCourse ? heroCourse.querySelector('.hero-course-action') : null;

  if (heroCourseBody) {
    heroCourseBody.innerHTML = `
      <div class="hero-course-label">Curso en progreso</div>
      <h3><a href="../cursos/panel.html?id=topografia-civil-3d" class="dash-course-link" style="color:inherit;text-decoration:none">Topografía en Civil 3D</a></h3>
      <div class="hero-course-meta">8 horas · 9 de mayo, 2026</div>
      <div class="hero-course-progress"><div class="progress-bar" style="flex:1"><div class="progress-fill pf-blue" style="width:0%"></div></div></div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:2px">
        <span class="hero-course-pct">0%</span>
      </div>
    `;
  }
  if (heroCourseAction) {
    heroCourseAction.innerHTML = `<a href="../sesiones/index.html?course=topografia-civil-3d" class="btn btn-primary btn-sm dash-course-link" style="white-space:nowrap">Continuar</a>`;
  }

  // Mis cursos
  const coursesList = document.getElementById('coursesList');
  if (coursesList) {
    coursesList.innerHTML = `
      <div class="course-item">
        <div class="course-icon ci-dark"><span class="material-icons-round">terrain</span></div>
        <div class="course-info">
          <h4><a href="../cursos/curso.html?id=topografia-civil-3d" data-course-id="topografia-civil-3d" class="dash-course-link" style="color:inherit;text-decoration:none">Topografía en Civil 3D</a></h4>
          <small>8 horas · 9 de mayo, 2026</small>
        </div>
        <div class="course-pct" style="color:#64748b">0%</div>
      </div>
      <div class="course-item">
        <div class="course-icon ci-teal"><span class="material-icons-round">engineering</span></div>
        <div class="course-info">
          <h4><a href="../cursos/curso.html?id=supervision-obra" data-course-id="supervision-obra" class="dash-course-link" style="color:inherit;text-decoration:none">Supervisión de Obra</a></h4>
          <small>10 sesiones · Próximamente</small>
        </div>
        <div class="course-pct" style="color:#64748b">0%</div>
      </div>
    `;
  }

  // Próximas clases
  const upcomingClassesList = document.getElementById('upcomingClassesList');
  if (upcomingClassesList) {
    upcomingClassesList.innerHTML = `
      <div class="schedule-item highlight">
        <div class="sched-date">
          <div class="day">30</div>
          <div class="month">Mar</div>
        </div>
        <div class="sched-info">
          <h4>Sesión 4: Identificación de peligros</h4>
          <p><span class="material-icons-round">schedule</span> 5:00 p.m. — 6:00 p.m.</p>
          <span class="sched-badge live"><span class="material-icons-round" style="font-size:12px">videocam</span> En vivo</span>
        </div>
      </div>
      <div class="schedule-item">
        <div class="sched-date">
          <div class="day">30</div>
          <div class="month">Mar</div>
        </div>
        <div class="sched-info">
          <h4>Sesión 5: Evaluación de riesgos</h4>
          <p><span class="material-icons-round">schedule</span> 7:00 p.m. — 8:00 p.m.</p>
          <span class="sched-badge live"><span class="material-icons-round" style="font-size:12px">videocam</span> En vivo</span>
        </div>
      </div>
      <div class="schedule-item">
        <div class="sched-date">
          <div class="day">06</div>
          <div class="month">Abr</div>
        </div>
        <div class="sched-info">
          <h4>Sesión 6: Plan de SST en obra</h4>
          <p><span class="material-icons-round">schedule</span> 5:00 p.m. — 6:00 p.m. / 7:00 p.m. — 8:00 p.m.</p>
          <span class="sched-badge live"><span class="material-icons-round" style="font-size:12px">videocam</span> En vivo</span>
        </div>
      </div>
    `;
  }

  // Clases recientes
  const recentClassesList = document.getElementById('recentClassesList');
  if (recentClassesList) {
    recentClassesList.innerHTML = `
      <div class="class-item">
        <div class="class-thumb"><span class="material-icons-round">ondemand_video</span></div>
        <div class="class-info">
          <h4>Sesión 3: EPP y señalización</h4>
          <small>Última vista hace 2 días</small>
        </div>
        <div class="class-action">
          <a href="../cursos/curso.html?id=sst-obras-civiles" data-course-id="sst-obras-civiles" class="btn btn-primary btn-sm dash-course-link">Continuar</a>
        </div>
      </div>
      <div class="class-item">
        <div class="class-thumb"><span class="material-icons-round">ondemand_video</span></div>
        <div class="class-info">
          <h4>Sesión 2: Marco normativo SST</h4>
          <small>Completada</small>
        </div>
        <div class="class-action">
          <a href="../cursos/curso.html?id=sst-obras-civiles" data-course-id="sst-obras-civiles" class="btn btn-outline btn-sm dash-course-link">Revisar</a>
        </div>
      </div>
    `;
  }

  // Avisos
  const noticesList = document.getElementById('noticesList');
  if (noticesList) {
    noticesList.innerHTML = `
      <div class="notif-item">
        <div class="notif-dot blue"></div>
        <div class="notif-info">
          <h4>Nueva clase disponible</h4>
          <p>La Sesión 3 "EPP y señalización" ya está disponible en diferido.</p>
        </div>
      </div>
      <div class="notif-item">
        <div class="notif-dot orange"></div>
        <div class="notif-info">
          <h4>Recordatorio: clase en vivo</h4>
          <p>Hoy a las 5:00 p.m. tienes la Sesión 4 en vivo.</p>
        </div>
      </div>
      <div class="notif-item">
        <div class="notif-dot green"></div>
        <div class="notif-info">
          <h4>Certificados disponibles</h4>
          <p>Ya puedes descargar tu certificado de la Sesión 2.</p>
        </div>
      </div>
    `;
  }

});
