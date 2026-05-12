# 📚 ARQUITECTURA COMPLETA - FQ INGENIEROS Plataforma Educativa

## 1️⃣ AUTENTICACIÓN DE USUARIOS

### Flujo de Registro
```
Usuario → Página /auth/registro.html → Firebase Auth.createUserWithEmailAndPassword()
↓
Crea usuario en Firestore collection "users" con campos:
{
  uid: string (Firebase UID),
  email: string,
  name: string (nombre del estudiante),
  phone: string (opcional),
  documentType: string ("DNI" | "Pasaporte"),
  documentNumber: string,
  createdAt: timestamp,
  role: "student" (por defecto),
  enrollment: [] (cursos matriculados),
  payments: [] (pagos realizados),
  certificates: [] (certificados obtenidos)
}
```

### Flujo de Login
```
Usuario → /auth/login.html → Firebase Auth.signInWithEmailAndPassword()
↓
Firebase Auth emite evento onAuthStateChanged()
↓
Auth-UI carga perfil y actualiza navbar
↓
Acceso a todas las páginas autenticadas
```

### Cierre de Sesión
- **Timeout automático**: 30 minutos de inactividad
- **Manual**: Click en "Cerrar sesión"
- Elimina token de Firebase Auth

### Seguridad (Firestore Rules)
```javascript
// Users (Documentos privados)
- Los usuarios pueden leer su propio documento
- Los usuarios pueden crear su propio perfil
- Admin (fq.ingenieros.empresa@gmail.com) puede actualizar cualquier usuario

// Cursos (Públicos para lectura)
- Cualquiera puede ver cursos
- Solo admin puede crear/editar/eliminar

// Enrollments (Matriculaciones - Privadas)
- Solo usuarios autenticados pueden crear enrollments
- Usuario solo puede crear enrollment para sí mismo
- Solo admin puede eliminar

// Payments (Privados)
- Solo usuarios autenticados pueden crear/leer pagos

// Certificates (Privados)
- Solo usuarios autenticados pueden crear/leer certificados
```

---

## 2️⃣ MATRICULACIÓN A CURSOS

### Flujo de Matriculación
```
1. Usuario ve curso en /cursos/curso.html?id=COURSE_ID
2. Click en botón "Matricularme"
3. Si NO está autenticado → Redirige a /auth/login.html
4. Si está autenticado → Crea documento en Firestore:

{
  id: "enrollment_" + userId + "_" + courseId,
  userId: string (UID del usuario),
  courseId: string (ID del curso),
  courseName: string,
  enrolledAt: timestamp,
  status: "active" | "completed" | "cancelled",
  progress: number (0-100),
  lastAccessed: timestamp,
  sessionAttendance: {
    "session-1": true/false,
    "session-2": true/false,
    ...
  }
}
```

### Verificación de Matriculación
- Se guarda en localStorage con clave: `enrollment_[userId]_[courseId]`
- Se verifica al cargar curso: ¿Ya está matriculado?
- Si SÍ → Muestra botón "Ir al curso" + link a grabaciones
- Si NO → Muestra botón "Matricularme"

### Almacenamiento
- **Firestore**: `enrollments/[docId]` → Base de datos permanente
- **LocalStorage**: Caché local para acceso rápido

---

## 3️⃣ PAGO / MATRICULACIÓN DE CURSOS PAGOS

### Métodos de Pago Disponibles
```
1. YAPE - App móvil (Número: 958 003 888)
2. PLIN - Sistema interbancario
3. BCP - Transferencia a cuenta BCP
4. Transferencia interbancaria (CCI)
```

### Flujo de Pago
```
1. Usuario accede a /certificado/pago.html?redirect=COURSE_ID
2. Selecciona método de pago
3. Ve datos de la cuenta
4. Realiza transferencia manualmente
5. Sube comprobante de pago
6. Admin verifica pago en panel
7. Admin marca como "pagado"
8. Se crea documento en Firestore:

{
  id: "payment_" + userId + "_" + courseId,
  userId: string,
  courseId: string,
  courseName: string,
  amount: number,
  method: "Yape" | "Plin" | "BCP" | "Transferencia",
  status: "pending" | "verified" | "rejected",
  proofFile: string (URL de comprobante),
  uploadedAt: timestamp,
  verifiedAt: timestamp,
  adminComment: string
}
```

### Gestión en Admin Panel
- Admin ve tabla de pagos pendientes
- Puede verificar comprobante
- Marca como "Pagado" o rechaza
- Sistema automáticamente activa acceso al curso

---

## 4️⃣ GENERACIÓN DE CERTIFICADOS

### Dos Tipos de Certificados

#### A) CONSTANCIA DE PARTICIPACIÓN (Gratuita)
```
- Se otorga al completar el curso
- Incluye: Nombre estudiante, Nombre curso, Fecha, Código verificación
- Formato: PDF descargable
- Generador: jsPDF library (FQCertificate.generateConstancia)
```

#### B) CERTIFICADO CON EXAMEN (Pago)
```
- Se otorga después de pagar S/ 20 adicional
- Incluye: Constancia + Calificación del examen
- Formato: PDF descargable con marca de agua
- Generador: jsPDF library (FQCertificate.generateCertificado)
```

### Flujo de Certificación
```
1. Usuario completa todas las sesiones del curso
2. Accede a /certificado/examen.html
3. Realiza examen (preguntas tipo múltiple)
4. Obtiene calificación
5. Puede descargar CONSTANCIA (gratis)
6. O paga S/ 20 para obtener CERTIFICADO
7. Certificado se guarda en Firestore:

{
  id: "cert_" + certificateId,
  userId: string,
  courseId: string,
  courseName: string,
  studentName: string,
  certificateType: "constancia" | "certificado",
  score: number (si es con examen),
  issuedAt: timestamp,
  verificationCode: string (único para validar),
  pdfUrl: string (link para descargar)
}
```

### Tabla de Calificación
```
- A (90-100): Excelente
- B (80-89): Bueno
- C (70-79): Regular
- D (60-69): Aprobado
- F (<60): Desaprobado
```

---

## 5️⃣ GRABACIONES DE CLASES

### Sistema de Grabaciones

#### Almacenamiento
```
Método 1: URL Directa (Actual)
- Admin sube video a servidor o CDN
- Ingresa URL en panel: /admin/panel.html
- Se guarda en Firestore: curso.recordingUrl = "https://..."

Método 2: Firestore Storage (Futuro)
- Firebase Storage para almacenar videos
- URL se genera automáticamente después de subida
```

#### Visualización en Curso
```
1. Usuario accede a /cursos/curso.html?id=COURSE_ID
2. Si está matriculado y recordingUrl existe:
   → Muestra sección "Grabación disponible"
   → Video player con controles
3. Si NO está matriculado:
   → Muestra "Matriz primero para ver grabación"
```

#### Gestión en Admin
```
Panel: /admin/panel.html → Cursos → Editar
- Campo: "URL de Grabación"
- Ingresa: https://ejemplo.com/video.mp4
- Guardar → Actualiza Firestore
- Automáticamente disponible en página del curso
```

---

## 6️⃣ INTEGRACIÓN CON MEETJITSI / ZOOM

### Configuración

#### Método Actual: ZOOM
```
1. Admin obtiene link de sala Zoom: https://zoom.us/j/123456789
2. Ingresa en panel: /admin/panel.html → Cursos → "Link de Zoom"
3. Se guarda en Firestore: curso.zoomLink = "https://zoom.us/j/..."
4. Estudiantes ven link en página del curso
5. Click en link → Abre sala Zoom
```

#### Para Cambiar a MEETJITSI
```
1. En lugar de https://zoom.us/j/... usar: https://meet.jit.si/[ROOM_NAME]
2. Resto del proceso es idéntico
3. Solo cambiar la URL del link
```

### Visualización
```
- Página del curso: /cursos/curso.html
- Si zoomLink existe → Muestra botón "Entrar a Zoom"
- Click → Abre en nueva pestaña
- Estudiante se conecta a videollamada
```

---

## 7️⃣ ASIGNACIÓN DE PROFESORES A CURSOS

### Estado Actual
```
❌ NO está implementado todavía

Futuro:
- Cada curso tendrá campo: profesor (string - UID o email)
- Panel de profesor: /profesor/index.html
- Profesor accede y ve sus cursos asignados
- Puede gestionar zoom, grabaciones, calificaciones
```

### Panel de Profesor (Estructura existente)
```
/profesor/index.html tiene:
- Sección "Mis Cursos" (vacía - sin asignación aún)
- Panel de Zoom/Grabaciones
- Panel de Calificaciones
- Panel de Estudiantes
- Reportes
```

---

## 8️⃣ PROGRESO DEL ESTUDIANTE

### Rastreo de Progreso
```
Documento en Firestore: enrollments/{docId}
{
  userId: string,
  courseId: string,
  progress: number (0-100),
  
  sessionAttendance: {
    "session-1": true/false,
    "session-2": true/false,
    "session-3": true/false
  },
  
  completedAt: timestamp (si completó),
  lastAccessed: timestamp,
  timeSpent: number (minutos totales),
  
  examScore: number (0-100 si realizó examen),
  certificateDownloaded: boolean
}
```

### Dashboard del Estudiante
```
Página: /dashboard/index.html

Muestra:
1. Cursos actuales (mis matriculaciones)
2. Progreso (barra de % completado)
3. Próximas sesiones
4. Mis certificados
5. Mis calificaciones
6. Mis pagos

Estadísticas:
- Total de cursos: count(enrollments)
- Cursos completados: count(enrollments.status === 'completed')
- Certificados obtenidos: count(certificates)
- Tiempo total invertido: sum(enrollments.timeSpent)
```

### Actualización de Progreso
```
- Se actualiza cuando:
  1. Usuario marca sesión como vista
  2. Usuario completa examen
  3. Usuario descarga certificado
  4. Admin marca manualmente en panel

- Cálculo de porcentaje:
  progress = (sessionsAttended / totalSessions) * 100
```

---

## 9️⃣ SEGURIDAD Y PERMISOS

### Niveles de Acceso

#### 1. USUARIO NO AUTENTICADO
```
✅ Puede ver:
- Homepage
- Lista de cursos (catálogo)
- Descripción de cursos
- Precios

❌ NO puede:
- Matricularse
- Ver grabaciones
- Acceder a dashboard
- Descargar certificados
```

#### 2. USUARIO ESTUDIANTE (Autenticado)
```
✅ Puede:
- Registrarse en cursos
- Ver curso completo si está matriculado
- Acceder a zoom/grabaciones
- Hacer exámen
- Descargar certificado
- Ver su dashboard y progreso
- Editar su perfil

❌ NO puede:
- Crear cursos
- Editar cursos
- Ver datos de otros estudiantes
- Acceder a admin panel
```

#### 3. ADMIN (Email: fq.ingenieros.empresa@gmail.com)
```
✅ Puede hacer TODO:
- Crear/editar/eliminar cursos
- Ver todos los estudiantes
- Ver todos los pagos
- Verificar pagos
- Generar reportes
- Asignar profesores (cuando esté implementado)
- Acceder al panel /admin/panel.html
```

### Validaciones en Firestore

```javascript
// Solo admin puede crear cursos
match /courses/{doc} {
  allow create, update, delete: if isAdmin();
}

// Usuario solo ve su propio documento
match /users/{userId} {
  allow read: if request.auth.uid == userId || isAdmin();
}

// Usuario solo puede matricularse a sí mismo
match /enrollments/{doc} {
  allow create: if request.resource.data.userId == request.auth.uid;
}
```

---

## 🔟 CARRITO DE COMPRAS

### Estado Actual
```
❌ NO está implementado

Opción 1 (Actual):
- Usuario va a cada curso
- Click "Pagar"
- Redirige a /certificado/pago.html
- Paga cada curso por separado

Opción 2 (Futuro - Carrito):
- Usuario agrega múltiples cursos al carrito
- Ve total a pagar
- Paga todos juntos
- Una sola verificación de pago
```

---

## 📊 FLUJOS PRINCIPALES

### FLUJO 1: Estudiante Nuevo

```
1. Llega a homepage /index.html
2. Busca cursos en /cursos/catalogo.html
3. Selecciona curso → /cursos/curso.html?id=SST
4. Click "Matricularme"
   → Redirige a login (/auth/login.html)
5. Se registra (email + contraseña)
   → Crea perfil en Firestore
   → Crea enrollment
6. Vuelve a página del curso
7. Ahora ve:
   - Temario completo
   - Link a Zoom (si disponible)
   - Grabaciones (si disponibles)
   - Botón "Entrar a sesión en vivo"
8. Se conecta a Zoom → Asiste a clase
9. Descarga grabación después
10. Hace examen → Obtiene calificación
11. Descarga certificado → ¡Completado!
```

### FLUJO 2: Pago de Curso

```
1. Usuario intenta matricularse en curso PAGADO (no gratis)
2. Se muestra página de pago: /certificado/pago.html
3. Selecciona método (Yape, Plin, etc.)
4. Lee datos: 958 003 888
5. Realiza transferencia en app Yape
6. Sube comprobante en navegador
7. Sistema crea documento en "payments" (status: pending)
8. Admin recibe notificación
9. Admin verifica comprobante en panel
10. Admin marca como "Pagado" → status: verified
11. Sistema automáticamente crea enrollment
12. Usuario recibe email → ¡Acceso activado!
```

### FLUJO 3: Admin Gestiona Curso

```
1. Admin accede a /admin/panel.html
   → Se identifica con email: fq.ingenieros.empresa@gmail.com
2. Navega a "Gestionar Cursos"
3. Ve tabla de cursos existentes
4. Puede:
   a) CREAR: Click "Nuevo curso"
      → Modal con campos (nombre, precio, temario, etc.)
      → Guardar → Crea en Firestore
   
   b) EDITAR: Click lápiz → Modal pre-poblado
      → Modifica campos
      → Guardar → Actualiza Firestore
   
   c) AGREGAR ZOOM: Click "Zoom/Grabación"
      → Ingresa link Zoom: https://zoom.us/j/123456789
      → Ingresa URL grabación: https://...video.mp4
      → Guardar → Estudiantes lo ven automáticamente
   
   d) ELIMINAR: Click X → Confirmación
      → Borra de Firestore
      → Ya no aparece en catálogo
```

---

## 🔧 CONFIGURACIÓN TÉCNICA

### Stack Tecnológico
```
Frontend:
- HTML5
- CSS3 (Flexbox/Grid)
- Vanilla JavaScript (ES6+)
- Material Design Icons

Backend:
- Firebase Authentication (Auth)
- Firestore (Base de datos NoSQL)
- Firebase Hosting (Deployment)
- Vercel (Deployment alternativo)

Librerías Externas:
- jsPDF (Generación de certificados PDF)
- Firebase SDK 10.12.0
- Material Icons

CDN:
- Google Fonts (Inter)
- Material Design Icons
- jsPDF (CDN)
```

### Base de Datos (Firestore)

#### Colecciones
```
/users/[userId]
  - Perfil de estudiantes
  
/courses/[courseId]
  - Información de cursos
  - Temario, incluye, horarios
  
/enrollments/[enrollmentId]
  - Matriculaciones de estudiantes
  - Progreso, asistencia
  
/payments/[paymentId]
  - Registros de pagos
  - Comprobantes, estado
  
/certificates/[certificateId]
  - Certificados emitidos
  - Verificación
  
/exams/[examId]
  - Calificaciones de exámenes
  
/exam_questions/[questionId]
  - Preguntas de exámenes
```

---

## ✅ CHECKLIST DE FUNCIONALIDADES

### Implementadas
- ✅ Autenticación (Login/Registro)
- ✅ Cursos (CRUD completo)
- ✅ Matriculación
- ✅ Visualización de temario expandible
- ✅ Admin panel
- ✅ Pago manual (Yape, Plin, BCP, Transferencia)
- ✅ Certificados (Generador PDF)
- ✅ Integración Zoom/Meetjitsi
- ✅ Grabaciones
- ✅ Dashboard estudiante básico
- ✅ Seguridad Firestore Rules

### Por Implementar
- ❌ Asignación de profesores
- ❌ Panel completo de profesor
- ❌ Carrito de compras
- ❌ Pago integrado (Stripe/PayPal)
- ❌ Notificaciones por email
- ❌ Reportes avanzados
- ❌ Sistema de exámenes interactivo completo
- ❌ Foro de estudiantes

---

## 📝 NOTAS IMPORTANTES

### Para Entregas
1. **Zoom/Meetjitsi**: Agrega los links en el admin panel
2. **Grabaciones**: Sube videos a un servidor y agrega URLs
3. **Pagos**: Sistema es manual (necesita verificación admin)
4. **Certificados**: Se generan automáticamente en PDF

### Próximas Mejoras
1. Integración de payment gateway (Stripe/Culqi)
2. Emisión automática de certificados
3. Sistema de notificaciones por email
4. Dashboard de reportes completo
5. Asignación automática de profesores
