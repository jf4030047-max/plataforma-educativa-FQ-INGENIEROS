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

  /* ── Utilidades ── */
  function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  }

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  /* ── Cierre de sesión ── */
  function logout(skipConfirm) {
    if (!skipConfirm) {
      const ok = confirm('¿Estás seguro de que deseas cerrar sesión?');
      if (!ok) return;
    }
    clearTimeout(inactivityTimer);
    if (typeof auth !== 'undefined') {
      auth.signOut();
    }
  }

  /* ── Inactividad ── */
  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (typeof auth === 'undefined' || !auth.currentUser) return;
    inactivityTimer = setTimeout(function () {
      alert('Tu sesión ha expirado por inactividad.');
      logout(true);
    }, INACTIVITY_TIMEOUT);
  }

  function setupInactivityDetection() {
    ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(function (evt) {
      document.addEventListener(evt, resetInactivityTimer, { passive: true });
    });
    resetInactivityTimer();
  }

  /* ── Construir HTML del perfil ── */
  function buildProfileHTML(profile) {
    var name = profile.name || 'Usuario';
    var initials = getInitials(name);
    var greeting = getGreeting();
    return (
      '<div class="user-profile" id="userProfile">' +
        '<button class="user-trigger" id="userTrigger" aria-expanded="false" aria-haspopup="true">' +
          '<div class="user-avatar">' + initials + '</div>' +
          '<div class="user-info">' +
            '<span class="user-name">' + name + '</span>' +
            '<span class="user-greeting">' + greeting + '</span>' +
          '</div>' +
          '<span class="material-icons-round user-chevron">expand_more</span>' +
        '</button>' +
        '<div class="user-dropdown" id="userDropdown">' +
          '<div class="dropdown-header">' +
            '<div class="user-avatar user-avatar-lg">' + initials + '</div>' +
            '<div>' +
              '<strong>' + name + '</strong>' +
              '<small>' + (profile.email || profile.phone || '') + '</small>' +
            '</div>' +
          '</div>' +
          '<div class="dropdown-divider"></div>' +
          '<a href="' + getRelPath('dashboard/index.html') + '" class="dropdown-item">' +
            '<span class="material-icons-round">dashboard</span> Mi panel' +
          '</a>' +
          '<a href="' + getRelPath('dashboard/index.html') + '#profile" class="dropdown-item">' +
            '<span class="material-icons-round">person</span> Ver perfil' +
          '</a>' +
          '<a href="' + getRelPath('dashboard/index.html') + '#settings" class="dropdown-item">' +
            '<span class="material-icons-round">settings</span> Configuración' +
          '</a>' +
          '<div class="dropdown-divider"></div>' +
          '<button class="dropdown-item dropdown-logout" id="btnLogout">' +
            '<span class="material-icons-round">logout</span> Cerrar sesión' +
          '</button>' +
        '</div>' +
      '</div>'
    );
  }

  /* ── Detectar nivel de directorio ── */
  function getRelPath(target) {
    var path = window.location.pathname;
    var segments = path.split('/').filter(Boolean);
    var knownDirs = ['auth', 'cursos', 'certificado', 'empresa', 'sesiones', 'dashboard', 'admin'];
    var lastDir = segments[segments.length - 2] || '';
    if (knownDirs.indexOf(lastDir) !== -1) {
      return '../' + target;
    }
    return target;
  }

  /* ── Actualizar interfaz ── */
  function updateUI(profile) {
    var actionsContainer = document.getElementById('navActions');
    if (!actionsContainer) return;

    var existing = document.getElementById('userProfile');
    if (existing) existing.remove();

    if (profile && profile.name) {
      actionsContainer.innerHTML = buildProfileHTML(profile);
      setupDropdown();
      setupInactivityDetection();
    } else {
      // No sobrescribir los botones si ya existen en el HTML base
      // Solo los agregamos si el contenedor está vacío
      if (!actionsContainer.innerHTML.trim()) {
        var loginPath = getRelPath('auth/login.html');
        var regPath = getRelPath('auth/registro.html');
        actionsContainer.innerHTML =
          '<a href="' + loginPath + '" class="btn btn-outline">Iniciar sesión</a>' +
          '<a href="' + regPath + '" class="btn btn-primary">Registrarse</a>';
      }
      clearTimeout(inactivityTimer);
    }
  }

  /* ── Dropdown toggle ── */
  function setupDropdown() {
    var trigger = document.getElementById('userTrigger');
    var dropdown = document.getElementById('userDropdown');
    var btnLogout = document.getElementById('btnLogout');

    if (!trigger || !dropdown) return;

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = dropdown.classList.contains('open');
      dropdown.classList.toggle('open');
      trigger.setAttribute('aria-expanded', !isOpen);
    });

    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target) && !trigger.contains(e.target)) {
        dropdown.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        dropdown.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });

    if (btnLogout) {
      btnLogout.addEventListener('click', function () {
        logout(false);
      });
    }
  }

  /* ── Firebase Auth State Observer ── */

  if (typeof auth !== 'undefined' && typeof db !== 'undefined') {
    document.addEventListener("DOMContentLoaded", function () {
      auth.onAuthStateChanged(function (user) {
        if (user) {
          db.collection('users').doc(user.uid).get().then(function (doc) {
            var profile = doc.exists ? doc.data() : {
              email: user.email || '',
              name: user.displayName || 'Usuario'
            };
            updateUI(profile);
          }).catch(function () {
            updateUI({
              email: user.email || '',
              name: user.displayName || 'Usuario'
            });
          });
        } else {
          updateUI(null);
        }
      });
    });
  } else {
    // Firebase not loaded — show login/register buttons
    function initFallback() { updateUI(null); }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initFallback);
    } else {
      initFallback();
    }
  }

  // Expose for external use
  window.FQAuth = {
    getSession: function () {
      if (typeof auth === 'undefined' || !auth.currentUser) return null;
      return { uid: auth.currentUser.uid, email: auth.currentUser.email, name: auth.currentUser.displayName };
    },
    getUser: function () { return typeof auth !== 'undefined' ? auth.currentUser : null; },
    logout: logout,
    updateUI: updateUI
  };

})();
