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

  /* ── Modal: Completar perfil (DNI + Teléfono) ── */
  function needsProfileCompletion(profile) {
    if (!profile) return false;
    if (profile.profileComplete === true) return false;
    if (profile.docNumber && profile.phone) return false;
    return true;
  }

  function showProfileModal(user, profile) {
    // No mostrar en admin
    if (window.location.pathname.indexOf('/admin') !== -1) return;
    // Ya existe
    if (document.getElementById('fqProfileModal')) return;

    var overlay = document.createElement('div');
    overlay.id = 'fqProfileModal';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.7);display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(4px)';

    var card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:20px;max-width:420px;width:100%;padding:32px 28px;box-shadow:0 25px 60px rgba(0,0,0,.3);animation:fqModalIn .3s ease';

    card.innerHTML =
      '<style>@keyframes fqModalIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}' +
      '#fqProfileModal .pm-input{width:100%;padding:12px 14px;border:2px solid #e2e8f0;border-radius:12px;font-size:15px;font-family:Inter,sans-serif;transition:border-color .2s;outline:none;box-sizing:border-box}' +
      '#fqProfileModal .pm-input:focus{border-color:#1565c0}' +
      '#fqProfileModal .pm-input.pm-error{border-color:#dc2626}' +
      '#fqProfileModal .pm-input.pm-ok{border-color:#16a34a}' +
      '#fqProfileModal .pm-label{display:block;font-size:13px;font-weight:600;color:#334155;margin-bottom:6px}' +
      '#fqProfileModal .pm-hint{font-size:12px;color:#94a3b8;margin-top:4px}' +
      '#fqProfileModal .pm-hint.pm-err-text{color:#dc2626}' +
      '#fqProfileModal .pm-btn{width:100%;padding:14px;border:none;border-radius:12px;font-size:15px;font-weight:700;font-family:Inter,sans-serif;cursor:pointer;transition:all .2s}' +
      '#fqProfileModal .pm-btn-primary{background:#1565c0;color:#fff}' +
      '#fqProfileModal .pm-btn-primary:hover{background:#0d47a1}' +
      '#fqProfileModal .pm-btn-primary:disabled{background:#94a3b8;cursor:not-allowed}' +
      '</style>' +
      '<div style="text-align:center;margin-bottom:24px">' +
        '<div style="width:56px;height:56px;border-radius:50%;background:#eff6ff;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px">' +
          '<span class="material-icons-round" style="font-size:28px;color:#1565c0">badge</span>' +
        '</div>' +
        '<h2 style="font-size:20px;font-weight:800;color:#0f172a;margin:0 0 6px">Completa tu perfil</h2>' +
        '<p style="font-size:14px;color:#64748b;margin:0">Necesitamos estos datos para tu certificado y constancia.</p>' +
      '</div>' +
      '<div style="margin-bottom:18px">' +
        '<label class="pm-label">Tipo de documento</label>' +
        '<select id="pmDocType" class="pm-input" style="cursor:pointer">' +
          '<option value="DNI"' + (profile.docType === 'DNI' || !profile.docType ? ' selected' : '') + '>DNI</option>' +
          '<option value="CE"' + (profile.docType === 'CE' ? ' selected' : '') + '>Carné de Extranjería</option>' +
          '<option value="RUC"' + (profile.docType === 'RUC' ? ' selected' : '') + '>RUC</option>' +
          '<option value="Pasaporte"' + (profile.docType === 'Pasaporte' ? ' selected' : '') + '>Pasaporte</option>' +
        '</select>' +
      '</div>' +
      '<div style="margin-bottom:18px">' +
        '<label class="pm-label">Número de documento</label>' +
        '<input type="text" id="pmDocNumber" class="pm-input" placeholder="Ej: 12345678" value="' + (profile.docNumber || '') + '" maxlength="12" inputmode="numeric" />' +
        '<p class="pm-hint" id="pmDocHint">DNI: 8 dígitos</p>' +
      '</div>' +
      '<div style="margin-bottom:24px">' +
        '<label class="pm-label">Teléfono celular</label>' +
        '<input type="tel" id="pmPhone" class="pm-input" placeholder="Ej: 987654321" value="' + (profile.phone || '') + '" maxlength="9" inputmode="numeric" />' +
        '<p class="pm-hint" id="pmPhoneHint">9 dígitos</p>' +
      '</div>' +
      '<button class="pm-btn pm-btn-primary" id="pmSaveBtn" disabled>Guardar y continuar</button>';

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // References
    var docTypeEl = document.getElementById('pmDocType');
    var docNumEl = document.getElementById('pmDocNumber');
    var phoneEl = document.getElementById('pmPhone');
    var saveBtn = document.getElementById('pmSaveBtn');
    var docHint = document.getElementById('pmDocHint');
    var phoneHint = document.getElementById('pmPhoneHint');

    var docRules = {
      'DNI': { len: 8, pattern: /^[0-9]{8}$/, hint: 'DNI: 8 dígitos', maxlen: 8 },
      'CE': { len: 9, pattern: /^[A-Za-z0-9]{6,12}$/, hint: 'CE: 6 a 12 caracteres', maxlen: 12 },
      'RUC': { len: 11, pattern: /^[0-9]{11}$/, hint: 'RUC: 11 dígitos', maxlen: 11 },
      'Pasaporte': { len: 6, pattern: /^[A-Za-z0-9]{6,12}$/, hint: 'Pasaporte: 6 a 12 caracteres', maxlen: 12 }
    };

    function getRule() { return docRules[docTypeEl.value] || docRules['DNI']; }

    function updateDocRules() {
      var rule = getRule();
      docHint.textContent = rule.hint;
      docHint.classList.remove('pm-err-text');
      docNumEl.maxLength = rule.maxlen;
      validate();
    }

    function validate() {
      var rule = getRule();
      var docValid = rule.pattern.test(docNumEl.value.trim());
      var phoneValid = /^[0-9]{9}$/.test(phoneEl.value.trim());

      docNumEl.classList.toggle('pm-ok', docValid && docNumEl.value.trim().length > 0);
      docNumEl.classList.toggle('pm-error', !docValid && docNumEl.value.trim().length > 0);
      phoneEl.classList.toggle('pm-ok', phoneValid && phoneEl.value.trim().length > 0);
      phoneEl.classList.toggle('pm-error', !phoneValid && phoneEl.value.trim().length > 0);

      if (!phoneValid && phoneEl.value.trim().length > 0) {
        phoneHint.textContent = 'Debe tener exactamente 9 dígitos';
        phoneHint.classList.add('pm-err-text');
      } else {
        phoneHint.textContent = '9 dígitos';
        phoneHint.classList.remove('pm-err-text');
      }

      if (!docValid && docNumEl.value.trim().length > 0) {
        docHint.classList.add('pm-err-text');
      }

      saveBtn.disabled = !(docValid && phoneValid);
      return docValid && phoneValid;
    }

    // Only allow digits for DNI/RUC, alphanumeric for CE/Pasaporte
    docNumEl.addEventListener('input', function () {
      var rule = getRule();
      if (docTypeEl.value === 'DNI' || docTypeEl.value === 'RUC') {
        this.value = this.value.replace(/[^0-9]/g, '');
      }
      validate();
    });
    phoneEl.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '');
      validate();
    });
    docTypeEl.addEventListener('change', updateDocRules);

    saveBtn.addEventListener('click', function () {
      if (!validate()) return;
      saveBtn.disabled = true;
      saveBtn.textContent = 'Guardando...';
      db.collection('users').doc(user.uid).update({
        docType: docTypeEl.value,
        docNumber: docNumEl.value.trim(),
        phone: phoneEl.value.trim(),
        profileComplete: true
      }).then(function () {
        overlay.remove();
      }).catch(function () {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Guardar y continuar';
        alert('Error al guardar. Intenta nuevamente.');
      });
    });

    // Block closing with Escape
    overlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') e.stopPropagation();
    });

    updateDocRules();
    validate();
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
            // Verificar si necesita completar perfil
            if (doc.exists && needsProfileCompletion(profile)) {
              showProfileModal(user, profile);
            }
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
