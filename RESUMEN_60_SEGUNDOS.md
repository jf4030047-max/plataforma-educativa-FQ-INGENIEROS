# 🎯 RESUMEN RÁPIDO - 60 SEGUNDOS

## ¿CÓMO FUNCIONA?

### 1. USUARIO NUEVO
```
Llega a https://fqingenieros.vercel.app/
         ↓
    Ve cursos gratis/pagos
         ↓
    Hace CLICK en "Matricularme"
         ↓
    ¿Logueado? NO → Va a /auth/registro.html (crear cuenta)
         ↓
    Se matricula automáticamente en Firestore
         ↓
    Ya puede ver: Temario, Zoom, Grabaciones ✅
```

### 2. USUARIO PAGA (Si curso es de pago)
```
Click en curso pago → Va a /certificado/pago.html
         ↓
    Selecciona: Yape / Plin / BCP
         ↓
    Ve número cuenta: 958 003 888
         ↓
    Transfiere dinero desde su app bancaria
         ↓
    Sube comprobante en navegador
         ↓
    Admin verifica en panel
         ↓
    Admin marca PAGADO → Acceso activado ✅
```

### 3. ADMIN CREA CURSO
```
Admin accede: /admin/panel.html
         ↓
    Click "Nuevo Curso"
         ↓
    Llena: Nombre, Precio, Temario, Duración, etc.
         ↓
    Click GUARDAR
         ↓
    Se crea en Firestore automáticamente
         ↓
    Aparece en homepage + catálogo ✅
```

---

## 📊 TABLA DE FUNCIONALIDADES

| Función | Estado | Ubicación |
|---------|--------|-----------|
| **Autenticación** | ✅ Completa | /auth/login.html, /auth/registro.html |
| **Cursos** | ✅ CRUD | /admin/panel.html |
| **Matriculación** | ✅ Automática | /cursos/curso.html → Click "Matricularme" |
| **Pago Manual** | ✅ Yape/Plin/BCP | /certificado/pago.html |
| **Zoom/Meetjitsi** | ✅ Configurable | /admin/panel.html → Agregar link |
| **Grabaciones** | ✅ URL Manual | /admin/panel.html → Agregar URL video |
| **Certificados PDF** | ✅ Auto-generados | /certificado/examen.html |
| **Dashboard Estudiante** | ✅ Básico | /dashboard/index.html |
| **Seguridad** | ✅ Firestore Rules | Solo admin, acceso privado |
| **Temario Expandible** | ✅ Funciona | /cursos/curso.html - Click en módulos |
| **Progreso Estudiante** | 🟡 Parcial | Guardado en enrollments |
| **Panel Profesor** | ❌ Por asignar | /profesor/index.html (estructura lista) |
| **Carrito Compras** | ❌ No existe | Pago por curso individual |
| **Pago Online** | ❌ No integrado | Pago manual actual |

---

## 🔐 SEGURIDAD - RESUMEN

### ¿Quién puede ver qué?

**PUBLICO** (Sin login):
- Homepage
- Catálogo de cursos
- Descripción de cursos

**ESTUDIANTE LOGUEADO**:
- Mi curso si estoy matriculado
- Mis datos personales
- Mis certificados
- Mi progreso

**ADMIN** (Email: fq.ingenieros.empresa@gmail.com):
- TODO
- Crear/editar/eliminar cursos
- Ver todos los estudiantes
- Aprobar pagos
- Panel de admin

---

## 📱 FLUJO DE USUARIO TÍPICO

```
1. Estudiante nuevo
   ↓
2. Se registra (email + contraseña)
   ↓
3. Busca curso en catálogo
   ↓
4. Si GRATIS → Matricula inmediato
   Si PAGO → Va a pagar primero
   ↓
5. Ve temario expandible
   ↓
6. Ingresa a Zoom en horario (link proporcionado)
   ↓
7. Participa en clase en vivo
   ↓
8. Descarga grabación después
   ↓
9. Hace examen
   ↓
10. Descarga certificado (PDF) ✅
```

---

## 🗂️ ESTRUCTURA DE CARPETAS

```
project/
├── public/
│   ├── index.html (Homepage)
│   ├── auth/
│   │   ├── login.html
│   │   └── registro.html
│   ├── cursos/
│   │   ├── catalogo.html (Lista todos los cursos)
│   │   ├── curso.html (Página individual del curso)
│   │   └── panel.html (Panel de estudiante)
│   ├── certificado/
│   │   ├── pago.html (Pagar curso o certificado)
│   │   └── examen.html (Hacer examen)
│   ├── dashboard/
│   │   └── index.html (Mi panel de estudiante)
│   ├── admin/
│   │   ├── panel.html (Panel de admin - CRUD cursos)
│   │   └── restaurar-cursos.html (Herramienta bulk-import)
│   ├── profesor/
│   │   └── index.html (Panel de profesor - no asignado todavía)
│   └── assets/
│       ├── js/
│       │   ├── firebase-config.js (Configuración)
│       │   ├── auth-ui.js (Autenticación UI)
│       │   ├── certificate-generator.js (PDF)
│       │   └── admin-panel.js (Lógica admin)
│       └── css/
│           └── header.css (Estilos)
├── firestore.rules (Seguridad)
└── firebase.json
```

---

## 🚀 PARA ENTREGAR HOY

### Completo ✅
- Autenticación (login/registro)
- Cursos (crear/editar/eliminar)
- Matriculación
- Temario expandible
- Pago manual
- Certificados
- Zoom/Meetjitsi integrado
- Grabaciones

### Falta Configurar
- [ ] Agregar links de Zoom para cada curso (en admin panel)
- [ ] Agregar URLs de grabaciones (en admin panel)
- [ ] Crear usuario admin si no existe
- [ ] Testear flujo completo (registro → matriculación → pago → certificado)

### Entregar Como Funciona
- "Pago manual: Estudiante transfiere dinero a 958 003 888 (Yape)"
- "Admin verifica y marca como pagado en panel"
- "Automáticamente se activa acceso al curso"

---

## ❓ PREGUNTAS COMUNES

**P: ¿Los estudiantes pueden pagar con tarjeta?**
R: No todavía. Sistema actual: Transferencia manual a Yape/Plin/BCP
Luego: Integrar Stripe o Culqi

**P: ¿Se envía certificado por email?**
R: No. Estudiante lo descarga manualmente en PDF desde navegador

**P: ¿Qué pasa si el admin no verifica el pago?**
R: El estudiante no tiene acceso al curso. Necesita confirmación manual.

**P: ¿Pueden varios estudiantes ver una grabación?**
R: SÍ, pero solo si están matriculados en el curso

**P: ¿Hay notificaciones?**
R: No todavía. Futuro: Email cuando se aprueba pago, cuando sale nueva clase, etc.

**P: ¿Qué pasa si el estudiante no hace el examen?**
R: Puede ver curso y obtener CONSTANCIA (gratis)
Para CERTIFICADO necesita hacer examen y pagar S/ 20

---

## 🔧 PARA DESARROLLADORES

### Agregar un nuevo campo a cursos
1. En restaurar-cursos.html: Agregar campo en objeto `curso`
2. En admin-panel.js: Agregar input en modal
3. En curso.html: Mostrar campo si existe

### Agregar nuevo método de pago
1. En pago.html: Agregar `.method-card` en el grid
2. En JavaScript: Actualizar `selectMethod()` para nuevo método

### Cambiar admin email
1. En firestore.rules: Cambiar email en función `isAdmin()`
2. En firebase-config.js: Confirmar email configurado

---

**Última actualización**: 12 de Mayo 2026
**Versión**: 1.0 - MVP completo
**Estado**: Listo para entrega y testing
