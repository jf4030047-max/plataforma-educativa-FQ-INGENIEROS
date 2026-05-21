# 📝 Sistema de Exámenes - Guía de Implementación

## ¿Qué se ha creado?

Se implementó un sistema completo de exámenes para la plataforma educativa FQ INGENIEROS que permite:

### Para Profesores:
1. **Crear exámenes** con preguntas de opción múltiple y verdadero/falso
2. **Gestionar exámenes** - Ver todos los exámenes creados
3. **Ver respuestas de estudiantes** - Tabla completa con puntuaciones
4. **Evaluar detalladamente** - Ver pregunta por pregunta qué respondió cada estudiante

### Para Estudiantes:
1. **Resolver exámenes** - Interfaz amigable para responder preguntas
2. **Ver calificaciones automáticas** - Resultado inmediato después de enviar
3. **Historial de exámenes** - Página con todos los exámenes resueltos y puntuaciones

## 📂 Archivos Creados/Modificados

### Nuevos archivos:
- `/profesor/crear-examen.html` - Formulario para crear exámenes
- `/certificado/resolver-examen.html` - Interfaz para resolver exámenes
- `/certificado/mis-examen.html` - Historial de exámenes resueltos
- `/public/profesor/crear-examen.html` (copia sincronizada)
- `/public/certificado/resolver-examen.html` (copia sincronizada)
- `/public/certificado/mis-examen.html` (copia sincronizada)

### Modificados:
- `/profesor/index.html` - Panel actualizado para gestión de exámenes
- `/public/profesor/index.html` - Panel sincronizado
- `/dashboard/index.html` - Nueva sección "Exámenes disponibles"
- `/public/dashboard/index.html` - Dashboard sincronizado

## 🔥 Colecciones de Firestore Necesarias

### 1. Colección: `exams`
Almacena los exámenes creados por profesores.

**Estructura de documento:**
```javascript
{
  id: "exam-1704067200000",
  name: "Evaluación Tema 1",
  courseId: "topografia-civil-3d",
  description: "Evaluación del primer tema de topografía",
  totalScore: 100,
  passScore: 70,
  questions: [
    {
      text: "¿Cuál es la definición de topografía?",
      type: "multiple", // o "truefalse"
      options: ["Opción 1", "Opción 2", "Opción 3"],
      correctOption: 0,
      points: 20
    }
    // ... más preguntas
  ],
  createdBy: "profesor_uid",
  createdAt: Timestamp,
  status: "active" // o "inactive"
}
```

### 2. Colección: `exam_submissions`
Almacena las respuestas de los estudiantes.

**Estructura de documento:**
```javascript
{
  id: "subm-1704067300000",
  examId: "exam-1704067200000",
  userId: "student_uid",
  userEmail: "estudiante@example.com",
  answers: {
    0: 0,  // pregunta 0, respuesta opción 0
    1: 2,  // pregunta 1, respuesta opción 2
    2: 1   // pregunta 2, respuesta opción 1
  },
  score: 75,
  totalScore: 100,
  percentage: 75,
  passed: true,
  submittedAt: Timestamp
}
```

## 🔒 Reglas de Firestore Necesarias

Agrega estas reglas a tu archivo `firestore.rules`:

```javascript
// Exámenes
match /exams/{examId} {
  allow read: if request.auth != null && 
    (resource.data.createdBy == request.auth.uid || // El profesor que lo creó
     request.auth.token.email in db.collection('enrollments')
       .where('courseId', '==', resource.data.courseId)
       .where('userId', '==', request.auth.uid)
       .get().data().userId); // O estudiantes inscritos en el curso
  
  allow create: if request.auth != null && 
    request.auth.token.email_verified; // Solo profesores verificados
  
  allow update, delete: if request.auth != null && 
    resource.data.createdBy == request.auth.uid;
}

// Respuestas de exámenes
match /exam_submissions/{submissionId} {
  allow create: if request.auth != null;
  
  allow read: if request.auth != null && 
    (resource.data.userId == request.auth.uid || // El estudiante que respondió
     request.auth.token.email_verified); // O profesores
}
```

## 🚀 Cómo Usar

### Para Profesores:

1. **Crear un examen:**
   - Ve a `/profesor/index.html`
   - Haz click en "Exámenes" → "Crear Examen"
   - Llena el formulario:
     - Nombre del examen
     - Selecciona el curso
     - Define la puntuación total y mínima para aprobar
     - Agrega preguntas (mínimo 1)
   - Haz click en "Guardar Examen"

2. **Ver respuestas:**
   - Ve a "Exámenes" → "Ver respuestas"
   - Verás una tabla con todos los estudiantes que respondieron
   - Haz click en "Ver detalle" para ver pregunta por pregunta

### Para Estudiantes:

1. **Resolver un examen:**
   - Ve a tu Dashboard
   - En la sección "Exámenes" verás los exámenes disponibles
   - Haz click en "Resolver"
   - Responde todas las preguntas (navegando con ← →)
   - Haz click en "Enviar Examen"
   - Verás tu calificación inmediatamente

2. **Ver historial:**
   - Ve a `/certificado/mis-examen.html`
   - Verás todos los exámenes que has resuelto con sus calificaciones

## 📊 Flujo de Datos

```
PROFESOR CREA EXAMEN
        ↓
   Firestore: exams/{examId}
        ↓
ESTUDIANTE VE EN DASHBOARD
        ↓
ESTUDIANTE RESUELVE
        ↓
   Firestore: exam_submissions/{submissionId}
        ↓
PUNTUACIÓN CALCULADA AUTOMÁTICAMENTE
        ↓
PROFESOR VE EN PANEL
```

## ⚠️ Próximas Mejoras

- [ ] Editar exámenes creados
- [ ] Eliminar exámenes
- [ ] Timer personalizable
- [ ] Tipos de preguntas adicionales (respuesta corta, ensayo)
- [ ] Intentos limitados por examen
- [ ] Retroalimentación automática después de resolver
- [ ] Exportar resultados a CSV
- [ ] Notificaciones cuando hay nuevos resultados

## 🆘 Solución de Problemas

### "No puedo ver los exámenes en el dashboard"
- Verifica que estés inscrito en el curso
- Verifica que el examen tenga `status: "active"`
- Revisa la consola del navegador para errores

### "El examen no se guarda"
- Verifica que Firestore tenga las reglas de seguridad configuradas
- Verifica que tu email esté verificado (para profesores)
- Comprueba la conexión a Internet

### "No veo las respuestas de estudiantes"
- Espera a que el estudiante complete y envíe el examen
- Recarga la página del profesor
- Verifica que estés en la sección "Exámenes" → "Ver respuestas"

## 📝 Notas Técnicas

- Los exámenes se almacenan con `createdBy` para rastrear quién los creó
- Las respuestas se guardan de forma binaria (índice de opción) para eficiencia
- La puntuación se calcula automáticamente basada en respuestas correctas
- El timer del examen es de 1 hora por defecto (configurable en código)
- Las fechas se almacenan como Timestamp de Firestore para sincronización

## 🔧 Personalización

### Cambiar el tiempo del examen:
En `/certificado/resolver-examen.html`, línea ~60:
```javascript
let timeLimit = 3600; // Cambiar a segundos (3600 = 1 hora)
```

### Cambiar preguntas mostradas por página:
En `/profesor/crear-examen.html`, puedes modificar cómo se renderizan las preguntas

### Cambiar puntuación mínima por defecto:
En `/profesor/crear-examen.html`, línea ~70:
```javascript
<input type="number" id="examPassScore" placeholder="70" value="70" ...>
```
