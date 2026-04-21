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
			<h3 style="color:#1e293b;font-weight:600">${courseName}</h3>
			<div class="hero-course-meta"></div>
			<div class="progress-bar"><div class="progress-fill pf-blue" style="width:${progress}%"></div></div>
			<span class="hero-course-pct">${progress}%</span>
		`;
		heroCourseAction.innerHTML = `<a href="../cursos/curso.html?id=${courseId}" class="btn btn-primary btn-sm">Ir al curso</a>`;
	}

	// Aquí iría el resto de la lógica para cargar el curso en progreso, autenticación, etc.
	// ...

	// Por defecto, mostrar mensaje si no hay cursos
	renderNoCourses();

});
