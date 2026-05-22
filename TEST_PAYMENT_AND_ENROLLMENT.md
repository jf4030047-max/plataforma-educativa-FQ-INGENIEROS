# Prueba de Pagos y Matrículas

## 🔴 ERRORES CORREGIDOS

### 1. **Validación de Pagos en Matrículas**
**Antes:** Los estudiantes podían matricularse en cursos pagos sin pagar
**Ahora:** Se valida que exista un pago aprobado antes de permitir la matrícula

### 2. **Visibilidad de Alumnos en Panel de Profesor**
**Antes:** Los nuevos alumnos NO aparecían en el panel del profesor
**Ahora:** Los alumnos aparecen en tiempo real cuando se matriculan

---

## ✅ PROCEDIMIENTO DE PRUEBA

### PARTE A: Prueba de Validación de Pagos

#### Caso 1: Intentar matricularse SIN pagar (Debe RECHAZAR)
1. Ir a Catálogo de Cursos
2. Seleccionar **Topografía** (tiene precio: 200 S/)
3. Presionar "Matricularme"
4. **Esperado:** Mostrar mensaje de error y redirigir a página de pagos
5. **No debe:** Crear la matrícula sin pago

#### Caso 2: Matricularse DESPUÉS de pagar (Debe PERMITIR)
1. Ir a Catálogo de Cursos
2. Seleccionar **Topografía**
3. Presionar "Matricularme"
4. Seguir a página de pagos
5. Llenar formulario de pago (datos de prueba)
6. **IMPORTANTE:** El admin debe aprobar el pago en panel administrativo
7. Intentar nuevamente matricularse en **Topografía**
8. **Esperado:** Permitir la matrícula
9. **Verificar:** Aparecer en Dashboard personal y en panel del profesor

#### Caso 3: Matricularse en curso GRATUITO (Debe PERMITIR)
1. Crear un curso nuevo con precio: **0** (o dejar vacío)
2. Ir a ese curso
3. Presionar "Matricularme"
4. **Esperado:** Permitir matrícula inmediatamente sin pedir pago

---

### PARTE B: Prueba de Visibilidad en Panel de Profesor

#### Caso 1: Profesor ve nuevos alumnos en tiempo real
1. **Ventana 1:** Abierto como ESTUDIANTE en curso.html de Topografía
2. **Ventana 2:** Abierto como PROFESOR en profesor/index.html
3. En Ventana 1: Presionar "Matricularme" (después de pagar)
4. En Ventana 2: Cambiar a tab "Alumnos"
5. **Esperado:** El nuevo alumno aparece en la lista dentro de 1-2 segundos
6. **Verificar:** Nombre del alumno, email, y fecha de matrícula

#### Caso 2: Panel del profesor refleja cambios sin recargar
1. Profesor está en panel de "Alumnos"
2. Nuevo estudiante se matricula en uno de sus cursos
3. **Esperado:** Lista se actualiza automáticamente sin F5
4. **NO debe:** Requerir recarga de página

---

## 🔧 VERIFICACIÓN TÉCNICA (Firestore)

### Colecciones a verificar:

**1. `enrollments` collection**
```
Documento ID: userId_courseId
Contenido esperado:
{
  userId: "user123",
  courseId: "curso_topografia",
  userEmail: "estudiante@ejemplo.com",
  userName: "Juan Pérez",
  enrolledAt: timestamp,
  ...otros campos
}
```

**2. `payments` collection**
```
Documento ID: auto-generado
Contenido esperado:
{
  userId: "user123",
  courseId: "curso_topografia",
  status: "approved" (debe estar aprobado por admin),
  amount: 200,
  createdAt: timestamp,
  ...otros campos
}
```

**3. `courses` collection**
```
Documento: curso_topografia
Debe tener campo:
{
  price: 200 (o "precio": 200),
  ...otros campos
}
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Si estudiante no puede matricularse (incluso con pago aprobado):
1. Abrir Console del navegador (F12)
2. Ver si hay errores de JavaScript
3. Verificar que en Firestore el pago tenga `status: "approved"`
4. Verificar que `courseId` y `userId` coincidan exactamente

### Si profesor no ve nuevos alumnos:
1. Verificar en Firestore que existe documento en `enrollments`
2. Confirmar que `courseId` del enrollment coincide con curso del profesor
3. Abrir Console (F12) y revisar si hay errores en listeners
4. Intentar recargar página F5 - si aparecen los alumnos, el listener está roto

### Si hay errores de sintaxis:
1. Validar que los archivos se copiaron correctamente a `/public/`
2. Limpiar caché: Ctrl+Shift+Delete → Cookies y datos de sitio
3. Hacer Ctrl+F5 (hard refresh)

---

## 📋 CAMBIOS REALIZADOS EN CÓDIGO

### cursos/curso.html
**Línea ~675:** Función `handleEnroll()` ahora:
- Obtiene el precio del curso desde Firestore
- Si precio > 0: Consulta collection `payments` para verificar pago aprobado
- Si NO hay pago: Redirige a `/certificado/pago.html`
- Si SI hay pago: Procede con `proceedEnrollment()`

### profesor/index.html
**Línea ~395:** Agregado `var enrollmentsData = [];`

**Línea ~475-486:** Nuevo listener de `enrollments`:
```javascript
db.collection('enrollments').onSnapshot(function(snapshot) {
  enrollmentsData = [];
  snapshot.forEach(function(doc) {
    enrollmentsData.push({ id: doc.id, ...doc.data() });
  });
  renderDashboard();
  renderAlumnos();
});
```

**Línea ~537:** Función `myAlumnos()` completamente reescrita para:
- Filtrar enrollments por cursos del profesor
- Extraer estudiantes únicos con información de inscripción
- Retornar array de estudiantes matriculados

---

## ✔️ COMMIT GIT

```bash
git add .
git commit -m "Fix: Require payment verification before enrollment and sync real-time student visibility in professor panel"
git push
```

---

**Responsabilidad del Admin:**
El admin debe estar atento a que los pagos en estado "pending" se cambien a "approved" para que los estudiantes puedan completar su matrícula.
