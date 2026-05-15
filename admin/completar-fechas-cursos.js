// Script para completar el campo de fecha en todos los cursos que no lo tengan
// Debes ejecutarlo en la consola de tu navegador en el panel de administrador (ya autenticado)

(async function completarFechasCursos() {
  const db = firebase.firestore();
  const snap = await db.collection('courses').get();
  let actualizados = 0;
  for (const doc of snap.docs) {
    const data = doc.data();
    // Si no tiene ningún campo de fecha
    if (!data.fecha && !data.fechaCurso && !data.date && !data.startdate) {
      // Puedes cambiar la fecha por defecto aquí:
      const fechaDefault = prompt(`Curso: ${data.name || doc.id}\nIngresa la fecha (YYYY-MM-DD):`, "2026-05-23");
      if (fechaDefault && /^\d{4}-\d{2}-\d{2}$/.test(fechaDefault)) {
        await db.collection('courses').doc(doc.id).set({ startdate: fechaDefault }, { merge: true });
        actualizados++;
      }
    }
  }
  alert(`Fechas completadas en ${actualizados} cursos.`);
})();
