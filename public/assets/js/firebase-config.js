/* ══════════════════════════════════════════════════════════
   Firebase Configuration — FQ INGENIEROS
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
