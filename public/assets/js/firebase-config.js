/* ══════════════════════════════════════════════════════════
   Firebase Configuration — FQ INGENIEROS
   ══════════════════════════════════════════════════════════

   INSTRUCCIONES DE CONFIGURACIÓN:

   1. Ve a https://console.firebase.google.com/
   2. Crea un nuevo proyecto (ej: "fq-ingenieros")
   3. Registra una app web (ícono </>) y copia la configuración
   4. En Authentication → Sign-in method, activa:
      - Correo electrónico/contraseña
      - Google
   5. En Firestore Database → Crear base de datos (modo prueba)
   6. Reemplaza los valores de firebaseConfig abajo con los tuyos

   IMPORTANTE: El admin debe registrarse primero en /auth/registro.html
   con el correo admin@fqingenieros.com para poder acceder al panel.

   REGLAS DE FIRESTORE (copia en Firestore → Reglas):

   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {

       function isAdmin() {
         return request.auth != null && request.auth.token.email == 'fq.ingenieros.empresa@gmail.com';
       }

       match /users/{userId} {
         allow read: if request.auth != null;
         allow create: if request.auth != null && request.auth.uid == userId;
         allow update: if request.auth != null && (request.auth.uid == userId || isAdmin());
         allow delete: if isAdmin();
       }
       match /payments/{doc} {
         allow read, write: if request.auth != null;
       }
       match /exams/{doc} {
         allow read, write: if request.auth != null;
       }
       match /certificates/{doc} {
         allow read, write: if request.auth != null;
       }
       match /enrollments/{doc} {
         allow read: if request.auth != null;
         allow create, update: if request.auth != null && request.resource.data.userId == request.auth.uid;
         allow delete: if isAdmin();
       }
     }
   }

   ══════════════════════════════════════════════════════════ */


// Solo declarar firebaseConfig si no existe
if (typeof firebaseConfig === 'undefined') {
  var firebaseConfig = {
    apiKey: "AIzaSyDvI3ow91zUPOWkM2ZwJacUyfFSkNOkXto",
    authDomain: "fq-ingenieros-educativa.firebaseapp.com",
    projectId: "fq-ingenieros-educativa",
    storageBucket: "fq-ingenieros-educativa.firebasestorage.app",
    messagingSenderId: "1045330908815",
    appId: "1:1045330908815:web:6eae5d6287f1f1631642fa"
  };
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// Idioma español para emails de autenticación
auth.languageCode = 'es';

// Sesión persistente (sobrevive cierre de pestaña/navegador)
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

const ADMIN_EMAIL = 'fq.ingenieros.empresa@gmail.com';

/* ══════════════════════════════════════════════════════════
   Account Linking — Prevención de usuarios duplicados
   ══════════════════════════════════════════════════════════
   Cuando un usuario inicia sesión con un proveedor social
   (Google/Apple) y ya existe una cuenta con el mismo correo,
   se vinculan ambas credenciales bajo un único UID.
   ══════════════════════════════════════════════════════════ */

/**
 * Muestra un modal para solicitar la contraseña al vincular cuentas.
 * @param {string} email - Correo del usuario existente.
 * @returns {Promise<string|null>} Contraseña ingresada o null si cancela.
 */
function promptForPassword(email) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;backdrop-filter:blur(4px)';
    const safeEmail = email.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:16px;width:100%;max-width:420px;padding:32px 28px;box-shadow:0 20px 60px rgba(0,0,0,.18)">
        <div style="text-align:center;margin-bottom:20px">
          <span class="material-icons-round" style="font-size:40px;color:#1565c0">link</span>
        </div>
        <h3 style="margin:0 0 8px;font-size:18px;font-weight:700;color:#0f172a;text-align:center">Vincular cuenta existente</h3>
        <p style="margin:0 0 20px;font-size:14px;color:#64748b;line-height:1.6;text-align:center">
          Ya existe una cuenta registrada con <strong style="color:#0f172a">${safeEmail}</strong>.<br>
          Ingresa tu contraseña para vincular ambos métodos de acceso.
        </p>
        <input type="password" id="__linkPwInput" placeholder="Contraseña de tu cuenta"
          style="width:100%;padding:12px 14px;background:#f7f9fc;border:1.5px solid #dce3ed;border-radius:10px;font-size:14px;font-family:inherit;box-sizing:border-box;margin-bottom:6px" />
        <p id="__linkPwError" style="color:#dc2626;font-size:12px;margin:0 0 16px;display:none"></p>
        <div style="display:flex;gap:10px">
          <button type="button" id="__linkCancelBtn" style="flex:1;padding:11px;border-radius:10px;border:1.5px solid #dce3ed;background:#fff;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;color:#64748b">Cancelar</button>
          <button type="button" id="__linkConfirmBtn" style="flex:1;padding:11px;border-radius:10px;border:none;background:#1565c0;color:#fff;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit">Vincular</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const inp = document.getElementById('__linkPwInput');
    setTimeout(() => inp.focus(), 100);
    const cleanup = () => overlay.remove();
    document.getElementById('__linkCancelBtn').onclick = () => { cleanup(); resolve(null); };
    document.getElementById('__linkConfirmBtn').onclick = () => {
      const pw = inp.value;
      if (!pw) {
        const err = document.getElementById('__linkPwError');
        err.textContent = 'Ingresa tu contraseña.';
        err.style.display = 'block';
        return;
      }
      cleanup();
      resolve(pw);
    };
    inp.onkeydown = (e) => { if (e.key === 'Enter') document.getElementById('__linkConfirmBtn').click(); };
    overlay.onclick = (e) => { if (e.target === overlay) { cleanup(); resolve(null); } };
  });
}

/**
 * Garantiza que exista un documento Firestore para el usuario (UID como key).
 * Si ya existe, agrega el proveedor a linkedProviders.
 */
async function ensureFirestoreProfile(user, providerName) {
  const docRef = db.collection('users').doc(user.uid);
  const snap = await docRef.get();
  if (!snap.exists) {
    await docRef.set({
      email: user.email || '',
      name: user.displayName || '',
      phone: user.phoneNumber || '',
      docType: '', docNumber: '', address: '',
      date: new Date().toLocaleDateString('es-PE'),
      method: providerName,
      profileComplete: false,
      linkedProviders: [providerName],
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } else {
    await docRef.update({
      linkedProviders: firebase.firestore.FieldValue.arrayUnion(providerName)
    });
  }
}

/**
 * Maneja el inicio de sesión social con vinculación automática de cuentas.
 * Si el correo ya tiene una cuenta con otro método, solicita credenciales
 * y vincula ambos proveedores bajo un único UID.
 * @param {firebase.auth.AuthProvider} provider - Proveedor de autenticación.
 * @param {string} providerName - Nombre legible ('google', 'apple', etc.).
 * @returns {Promise<firebase.User>} Usuario autenticado.
 */
async function handleSocialSignIn(provider, providerName) {
  try {
    const result = await auth.signInWithPopup(provider);
    await ensureFirestoreProfile(result.user, providerName);
    return result.user;
  } catch (error) {
    if (error.code === 'auth/account-exists-with-different-credential') {
      const email = error.email;
      const pendingCred = error.credential;
      if (!pendingCred) throw new Error('No se pudo obtener la credencial pendiente para vincular.');

      let methods = [];
      try { methods = await auth.fetchSignInMethodsForEmail(email); } catch (_) {}

      // Cuenta existente usa correo/contraseña → pedir password para vincular
      if (methods.includes('password') || methods.length === 0) {
        const password = await promptForPassword(email);
        if (!password) throw { code: 'auth/linking-cancelled', message: 'Vinculación cancelada por el usuario.' };
        const cred = await auth.signInWithEmailAndPassword(email, password);
        await cred.user.linkWithCredential(pendingCred);
        await db.collection('users').doc(cred.user.uid).update({
          linkedProviders: firebase.firestore.FieldValue.arrayUnion(providerName)
        });
        return cred.user;
      }

      // Cuenta existente usa Google → re-autenticar con Google y vincular
      if (methods.includes('google.com')) {
        const gp = new firebase.auth.GoogleAuthProvider();
        gp.setCustomParameters({ login_hint: email });
        alert('Inicia sesión con tu cuenta de Google para vincular este método de acceso.');
        const gResult = await auth.signInWithPopup(gp);
        await gResult.user.linkWithCredential(pendingCred);
        await ensureFirestoreProfile(gResult.user, providerName);
        return gResult.user;
      }

      throw new Error('No se pudo vincular la cuenta. Método de inicio de sesión no soportado.');
    }
    throw error;
  }
}

/**
 * Vincula una credencial email/password a una cuenta social existente.
 * Se usa cuando el usuario intenta registrarse con email/password pero
 * el correo ya está asociado a un proveedor social (Google/Apple).
 * @returns {Promise<firebase.User|null>} Usuario vinculado o null.
 */
async function linkPasswordToExistingAccount(email, password) {
  let methods = [];
  try { methods = await auth.fetchSignInMethodsForEmail(email); } catch (_) {}
  if (methods.length === 0 || methods.includes('password')) return null;

  if (methods.includes('google.com')) {
    const gp = new firebase.auth.GoogleAuthProvider();
    gp.setCustomParameters({ login_hint: email });
    const result = await auth.signInWithPopup(gp);
    const pwCredential = firebase.auth.EmailAuthProvider.credential(email, password);
    await result.user.linkWithCredential(pwCredential);
    await db.collection('users').doc(result.user.uid).update({
      linkedProviders: firebase.firestore.FieldValue.arrayUnion('password'),
      profileComplete: true
    });
    return result.user;
  }
  return null;
}
