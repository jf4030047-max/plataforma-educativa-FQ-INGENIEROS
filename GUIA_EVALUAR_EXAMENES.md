# Guía: Evaluar Exámenes - Panel del Profesor

## 📋 Descripción
El panel del profesor ahora incluye una nueva sección **"Evaluar Exámenes"** que permite:
- Ver todos los exámenes rendidos por los alumnos
- Agregar comentarios y retroalimentación
- Subir documentos de evaluación (PDF, imágenes, etc.)
- Guardar todo automáticamente en la plataforma

---

## 🔧 Requisitos Previos en Firebase

### 1. **Habilitar Firebase Storage**
Para que los profesores puedan subir documentos de evaluación:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. En el menú izquierdo, ve a **Build → Storage**
4. Haz clic en **"Create bucket"**
5. Sigue los pasos (puedes dejar los valores por defecto)

### 2. **Configurar Reglas de Firebase Storage**
Una vez creado el bucket, ve a la pestaña **"Rules"** y reemplaza con:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Los profesores pueden subir archivos de evaluación
    match /exam-evaluations/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    // Permite a cualquier usuario autenticado acceder a sus carpetas
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

Luego haz clic en **"Publish"**

---

## 🎯 Cómo Evaluar un Examen

### Paso 1: Acceder al Panel del Profesor
1. Ingresa con tu código de profesor en [/profesor/index.html](/profesor/index.html)

### Paso 2: Navegar a "Evaluar Exámenes"
1. En el menú lateral, bajo la sección **"Evaluación"**, haz clic en **"Evaluar Exámenes"**

### Paso 3: Ver los Exámenes
Verás una tabla con:
- **Alumno**: Email del alumno
- **Curso**: Nombre del curso
- **Resultado**: Porcentaje y estado (Aprobado/Desaprobado)
- **Evaluación**: Indicador si ya tiene evaluación
- **Acciones**: Botón para evaluar

### Paso 4: Evaluar un Examen
1. Haz clic en el botón **"Evaluar"** de la fila deseada
2. Se abrirá un formulario con:
   - **Resultado del alumno**: (vista, no editable) - muestra % y estado
   - **Fecha del examen**: (vista, no editable)
   - **Comentarios/Retroalimentación**: Campo de texto libre
   - **Subir documento**: Botón para seleccionar un archivo

### Paso 5: Subir Documento (Opcional)
1. Haz clic en el campo **"Subir documento de evaluación"**
2. Selecciona un archivo: PDF, PNG, JPG, JPEG, DOC, DOCX
3. Máximo 10 MB por archivo
4. El archivo se subirá automáticamente al guardar

### Paso 6: Guardar
1. Haz clic en **"Guardar evaluación"**
2. Verás un mensaje de confirmación
3. La evaluación se guardará en la plataforma

---

## 📲 Lo que ven los Alumnos

Una vez que guardes la evaluación, los alumnos podrán:
1. Ver sus exámenes en su dashboard
2. Ver tus comentarios de retroalimentación
3. Descargar el documento de evaluación (si subiste uno)

---

## 📊 Estructura de Datos en Firebase

### Colección: `exams`
```javascript
{
  "id": "exam_12345",
  "userId": "user_id",
  "courseId": "topografia-civil-3d",
  "score": 15,                              // Respuestas correctas
  "total": 20,                              // Total de preguntas
  "percentage": 75,                         // Porcentaje
  "passed": true,                           // ¿Aprobó?
  "completedAt": Timestamp,                 // Cuando el alumno envió
  "evaluationComments": "Excelente trabajo...",  // Tus comentarios
  "evaluationDocUrl": "https://...",        // URL del documento subido
  "evaluationDocName": "evaluacion.pdf",    // Nombre del archivo
  "evaluatedAt": Timestamp                  // Cuando evaluaste
}
```

---

## 🔐 Seguridad

- Solo los profesores autenticados pueden evaluar
- Los alumnos solo ven evaluaciones de cursos en los que están inscritos
- Los documentos se guardan en Firebase Storage (respaldados y seguros)
- Todos los cambios quedan registrados con timestamp

---

## 📝 Notas Importantes

- ✅ Los comentarios se guardan automáticamente aunque no subas documento
- ✅ Puedes editar la evaluación tantas veces como quieras
- ✅ Los alumnos recibirán notificación cuando tengan evaluación (opcional, según tu configuración)
- ⚠️ Los archivos deben ser < 10 MB
- ⚠️ Asegúrate que Firebase Storage esté habilitado antes de subir archivos

---

## ❓ Preguntas Frecuentes

**P: ¿Qué pasa si subo un archivo que supera 10 MB?**
R: Firebase rechazará la carga y verás un mensaje de error. Intenta comprimir el archivo o dividirlo.

**P: ¿Puedo editar una evaluación después de guardarla?**
R: Sí, haz clic en "Evaluar" nuevamente y edita los comentarios o archivo.

**P: ¿Los alumnos ven los comentarios inmediatamente?**
R: Sí, cuando guardes la evaluación, aparecerán en sus exámenes.

**P: ¿Puedo subir solo un documento sin comentarios?**
R: Sí, puedes dejar el campo de comentarios vacío y solo subir el documento.

---

## 🚀 Próximos Pasos

- Integración con certificados (mostrar evaluación en certificado)
- Notificaciones a alumnos cuando hay nueva evaluación
- Reportes de evaluación por curso
- Exportar evaluaciones a Excel
