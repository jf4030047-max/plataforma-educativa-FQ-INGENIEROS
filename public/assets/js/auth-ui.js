/* ══════════════════════════════════════════════
	 FQ INGENIEROS — Auth UI Manager (Firebase)
	 Maneja el estado de sesión con Firebase Auth
	 ══════════════════════════════════════════════ */

(function () {
	'use strict';
	// Usar instancias globales de auth y db si existen
	var auth = window.auth || (window.firebase && firebase.auth ? firebase.auth() : undefined);
	var db = window.db || (window.firebase && firebase.firestore ? firebase.firestore() : undefined);
	// Exponer globalmente si no existen
	if (!window.auth && auth) window.auth = auth;
	if (!window.db && db) window.db = db;

	const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos
	let inactivityTimer = null;

	/* ...existing code... */

})();
