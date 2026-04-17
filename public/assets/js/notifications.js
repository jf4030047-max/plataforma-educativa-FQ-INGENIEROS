/* ═══════════════════════════════════════════════════════
	 SISTEMA DE NOTIFICACIONES — FQ INGENIEROS
	 notifications.js — Componente reutilizable
	 ═══════════════════════════════════════════════════════ */

(function(window) {
	'use strict';

	var ICONS = {
		success: 'check_circle',
		error:   'error',
		warning: 'warning',
		info:    'info'
	};

	var TITLES = {
		success: '¡Operación exitosa!',
		error:   'Ocurrió un error',
		warning: 'Atención',
		info:    'Información'
	};

	var DEFAULT_DURATION = 3000;

	/* ── Toast Container ─────────────────────────────── */
	function ensureContainer() {
		var c = document.getElementById('fqToastContainer');
		if (!c) {
			c = document.createElement('div');
			c.id = 'fqToastContainer';
			c.className = 'fq-toast-container';
			document.body.appendChild(c);
		}
		return c;
	}

	/* ── Show Toast ──────────────────────────────────── */
	function showToast(msg, type, options) {
		type = type || 'info';
		options = options || {};
		var title    = options.title    || TITLES[type] || TITLES.info;
		var icon     = options.icon     || ICONS[type]  || ICONS.info;
		var duration = options.duration != null ? options.duration : DEFAULT_DURATION;

		var container = ensureContainer();
		var toast = document.createElement('div');
		toast.className = 'fq-toast fq-toast-' + type;
		toast.style.position = 'relative';
		toast.style.overflow = 'hidden';
		if (duration > 0) toast.style.setProperty('--fq-toast-duration', duration + 'ms');

		toast.innerHTML =
			'<div class="fq-toast-icon"><span class="material-icons-round" style="font-size:20px">' + icon + '</span></div>' +
			'<div class="fq-toast-body"><div class="fq-toast-title">' + title + '</div><div class="fq-toast-msg">' + msg + '</div></div>' +
			'<button class="fq-toast-close" aria-label="Cerrar"><span class="material-icons-round" style="font-size:18px">close</span></button>' +
			(duration > 0 ? '<div class="fq-toast-progress"></div>' : '');

		toast.querySelector('.fq-toast-close').addEventListener('click', function() {
			dismissToast(toast);
		});

		container.appendChild(toast);

		if (duration > 0) {
			toast._timer = setTimeout(function() { dismissToast(toast); }, duration);
		}

		return toast;
	}

	/* ── Dismiss Toast ───────────────────────────────── */
	function dismissToast(el) {
		if (!el || el.classList.contains('removing')) return;
		if (el._timer) clearTimeout(el._timer);
		el.classList.add('removing');
		setTimeout(function() { if (el.parentElement) el.remove(); }, 300);
	}

	/* ── Inline Alert ────────────────────────────────── */
	function showAlert(elementId, msg, type, options) {
		type = type || 'info';
		options = options || {};
		var title = options.title || TITLES[type] || TITLES.info;
		var icon  = options.icon  || ICONS[type]  || ICONS.info;
		var autoHide = options.autoHide != null ? options.autoHide : (type === 'success' ? 5000 : 0);

		var el = document.getElementById(elementId);
		if (!el) return;

		if (el._alertTimer) { clearTimeout(el._alertTimer); el._alertTimer = null; }

		el.style.display = '';
		el.className = 'fq-alert fq-alert-' + type;
		el.innerHTML =
			'<div class="fq-alert-icon"><span class="material-icons-round" style="font-size:20px">' + icon + '</span></div>' +
			'<div class="fq-alert-content"><div class="fq-alert-title">' + title + '</div><div class="fq-alert-msg">' + msg + '</div></div>' +
			'<button class="fq-alert-close" aria-label="Cerrar"><span class="material-icons-round" style="font-size:16px;color:inherit">close</span></button>';

		el.querySelector('.fq-alert-close').addEventListener('click', function() {
			hideAlert(elementId);
		});

		el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

		if (autoHide > 0) {
			el._alertTimer = setTimeout(function() { hideAlert(elementId); }, autoHide);
		}
	}

	/* ── Hide Alert ──────────────────────────────────── */
	function hideAlert(elementId) {
		var el = document.getElementById(elementId);
		if (!el) return;
		if (el._alertTimer) { clearTimeout(el._alertTimer); el._alertTimer = null; }
		el.className = 'fq-alert';
		el.style.display = '';
	}

	/* ── Button Loading State ────────────────────────── */
	function btnLoading(btn, text) {
		if (typeof btn === 'string') btn = document.getElementById(btn);
		if (!btn) return;
		if (!btn._originalHTML) btn._originalHTML = btn.innerHTML;
		if (!btn._originalBg)   btn._originalBg   = btn.style.background;
		btn.disabled = true;
		btn.innerHTML = '<span class="material-icons-round" style="font-size:18px">hourglass_empty</span> ' + (text || 'Procesando...');
	}

	/* ── Button Done State ───────────────────────────── */
	function btnDone(btn, text, resetMs) {
		if (typeof btn === 'string') btn = document.getElementById(btn);
		if (!btn) return;
		btn.innerHTML = '<span class="material-icons-round" style="font-size:18px">check_circle</span> ' + (text || '¡Listo!');
		btn.style.background = '#16a34a';
		var saved = btn._originalHTML;
		var savedBg = btn._originalBg;
		setTimeout(function() {
			btn.disabled = false;
			btn.style.background = savedBg || '';
			btn.innerHTML = saved || btn.innerHTML;
			btn._originalHTML = null;
			btn._originalBg = null;
		}, resetMs || 2000);
	}

	/* ── Button Reset (for errors) ───────────────────── */
	function btnReset(btn) {
		if (typeof btn === 'string') btn = document.getElementById(btn);
		if (!btn) return;
		btn.disabled = false;
		if (btn._originalHTML) {
			btn.innerHTML = btn._originalHTML;
			btn._originalHTML = null;
		}
		if (btn._originalBg != null) {
			btn.style.background = btn._originalBg;
			btn._originalBg = null;
		}
	}

	/* ── Public API ──────────────────────────────────── */
	window.FQNotify = {
		toast:     showToast,
		dismiss:   dismissToast,
		alert:     showAlert,
		hideAlert: hideAlert,
		btnLoading: btnLoading,
		btnDone:    btnDone,
		btnReset:   btnReset
	};

})(window);
