# 🎓 Sistema de Evaluaciones Progresivas - Topografía en Civil 3D

## Resumen Ejecutivo

Sistema de evaluaciones automatizado donde:
- **5 evaluaciones totales** = 100% del curso
- **Primeras 4 evaluaciones** se desbloquean inmediatamente (20% cada una)
- **Evaluación Final** se desbloquea automáticamente después de completar el Tema 4
- **Progreso real-time** que se actualiza conforme completas evaluaciones
- **Interfaz visual** que muestra estado (Bloqueado 🔒 / Disponible 📝 / Completado ✅)

---

## 📋 Estructura de Evaluaciones

### Evaluaciones de Temas (Disponibles Inmediatamente)

| Evaluación | Tema | % Progreso | Requisito |
|-----------|------|-----------|----------|
| 1️⃣ Tema 1 | Conceptos Básicos | 20% | Ninguno |
| 2️⃣ Tema 2 | Medición y Equipos | 20% | Ninguno |
| 3️⃣ Tema 3 | Cálculos y Proyecciones | 20% | Ninguno |
| 4️⃣ Tema 4 | Aplicaciones Civil 3D | 20% | Ninguno |

### Evaluación Final (Desbloqueada Condicionalmente)

| Evaluación | Tipo | % Progreso | Requisito |
|-----------|------|-----------|----------|
| 5️⃣ Final | Examen Integrador | 20% | ✅ Completar Tema 4 |

---

## 🚀 Cómo Usar

### Para Administradores: Inicializar el Curso

1. **Acceder al panel de inicialización:**
   ```
   https://tu-dominio.vercel.app/admin/inicializar-topografia.html
   ```

2. **Hacer click en "Crear Curso y Evaluaciones"**
   - Esto crea el curso `topografia-civil-3d` en Firebase
   - Crea las 5 evaluaciones con las reglas de desbloqueo

3. **Verificar creación (opcional):**
   - Click en "Testar Sistema"
   - Verifica que el curso y las 5 evaluaciones existen

### Para Estudiantes: Completar Evaluaciones

1. **Acceder al panel de evaluaciones:**
   ```
   https://tu-dominio.vercel.app/sesiones/panel-evaluaciones.html?course=topografia-civil-3d
   ```

2. **Ver estado del curso:**
   - Barra de progreso en la parte superior (0% → 100%)
   - Contador: "0 evaluaciones completadas"

3. **Completar evaluaciones:**
   - Los temas 1-4 muestran botón "Iniciar Evaluación"
   - Click para abrir la evaluación
   - Necesitas score ≥ 70% para marcar como completada

4. **Desbloqueo automático del Final:**
   - Después de completar Tema 4 ✅
   - El botón "Evaluación Final" cambia de 🔒 Bloqueado a 📝 Disponible
   - Puedes iniciarla y completar el curso

---

## 📊 Progreso del Curso

### Ejemplo de Progresión Típica

```
Inicio:
┌─ Progreso: 0% ────────────────────────────┐
└─ Estado: 0/5 evaluaciones completadas ────┘

Después Tema 1:
┌─ Progreso: 20% █───────────────────────────┐
└─ Estado: 1/5 evaluaciones completadas ────┘

Después Tema 2:
┌─ Progreso: 40% ██──────────────────────────┐
└─ Estado: 2/5 evaluaciones completadas ────┘

Después Tema 3:
┌─ Progreso: 60% ███─────────────────────────┐
└─ Estado: 3/5 evaluaciones completadas ────┘

Después Tema 4:
┌─ Progreso: 80% ████────────────────────────┐
└─ Estado: 4/5 evaluaciones completadas ────┘
⚡ ¡Evaluación Final DESBLOQUEADA! 🔓

Después Final:
┌─ Progreso: 100% ████████████████████████ ✅┐
└─ Estado: 5/5 evaluaciones completadas ────┘
🎓 ¡CURSO COMPLETADO!
```

---

## 🔧 Archivos Técnicos

### Backend JavaScript (`/assets/js/topografia-course-setup.js`)

```javascript
// 1. Inicializar curso
await initializeTopografiaCourse();
// Crea el curso y todas las evaluaciones en Firestore

// 2. Calcular progreso
const {totalProgress, completedExams} = 
  await calculateCourseProgress(userId, courseId);
// Devuelve: {totalProgress: 80, completedExams: {...}}

// 3. Verificar si evaluación está desbloqueada
const unlocked = isExamUnlocked(examId, examData, completedExams);
// true si está disponible, false si está bloqueada

// 4. Obtener mensaje de bloqueo
const message = getExamLockMessage(examData);
// "Se desbloquea después de completar Tema 4"
```

### Interfaz (`/sesiones/panel-evaluaciones.html`)

Muestra:
- ✅ Barra de progreso visual
- ✅ Tarjetas de 5 evaluaciones
- ✅ Estados: Bloqueado 🔒 / Disponible 📝 / Completado ✅
- ✅ Botones contextuales (Iniciar / Bloqueado / Completado)
- ✅ Mensajes de desbloqueo

### Estructura en Firestore

```
Firestore Database:
├── courses/
│   └── topografia-civil-3d/
│       ├── name: "Topografía en Civil 3D"
│       ├── description: "..."
│       └── evaluationType: "progressive"
│
└── exams/
    ├── topo-eval-tema-1/
    │   ├── courseId: "topografia-civil-3d"
    │   ├── name: "Evaluación Tema 1"
    │   ├── percentage: 20
    │   ├── type: "tema"
    │   ├── requiredFor: null (no required)
    │   └── unlockedAfter: null (immediately available)
    │
    ├── topo-eval-tema-2/ (similar...)
    ├── topo-eval-tema-3/ (similar...)
    ├── topo-eval-tema-4/ (similar...)
    │
    └── topo-eval-final/
        ├── courseId: "topografia-civil-3d"
        ├── name: "Evaluación Final"
        ├── percentage: 20
        ├── type: "final"
        ├── requiredFor: "topo-eval-tema-4" (requires tema 4)
        └── unlockedAfter: "topo-eval-tema-4" (unlocks after tema 4)
```

---

## 🔐 Reglas de Desbloqueo

### Lógica de Desbloqueo

```javascript
// Una evaluación está desbloqueada si:
function isExamUnlocked(examId, examData, completedExams) {
  // Si no tiene requisito, siempre está desbloqueada
  if (!examData.requiredFor) {
    return true;  // Temas 1-4
  }
  
  // Si tiene requisito, verifica si se completó
  return completedExams[examData.requiredFor] !== undefined;
  // Evaluación Final: desbloqueada si Tema 4 completado
}
```

### Estados Posibles

| Estado | Condición | Botón | Descripción |
|--------|-----------|-------|-------------|
| 📝 Disponible | No tiene requisitos | "Iniciar Evaluación" | Se puede empezar |
| 🔒 Bloqueado | Requisito no completado | "Bloqueado" | Espera a que se complete requisito |
| ✅ Completado | Score ≥ 70% | "Completado" | Ya fue completada |

---

## 📈 Cálculo de Progreso

### Fórmula

```
Progreso Total = (Evaluaciones Completadas ÷ 5) × 100%
```

### Puntos de Control

- **0%**: 0/5 completadas
- **20%**: 1/5 completadas (después Tema 1)
- **40%**: 2/5 completadas (después Tema 2)
- **60%**: 3/5 completadas (después Tema 3)
- **80%**: 4/5 completadas (después Tema 4)
- **100%**: 5/5 completadas (después Final)

### En Firebase

```javascript
// Cómo se almacena el progreso
collection("userProgress") {
  doc(userId) {
    courseId: "topografia-civil-3d",
    completedExams: {
      "topo-eval-tema-1": true,  // 20%
      "topo-eval-tema-2": true,  // 40%
      "topo-eval-tema-3": false,
      "topo-eval-tema-4": false,
      "topo-eval-final": false
    },
    totalProgress: 40,  // 2/5 evaluaciones
    lastUpdated: Timestamp
  }
}
```

---

## 🎯 Casos de Uso

### Caso 1: Estudiante ve evaluaciones bloqueadas

**Usuario:** Estudiante Juan
**Acción:** Accede a `/sesiones/panel-evaluaciones.html`

**Resultado:**
- Ver 4 evaluaciones disponibles (Temas 1-4)
- Ver "Evaluación Final" bloqueada 🔒
- Mensaje: "Se desbloquea después de completar Tema 4"
- Progreso: 0%

### Caso 2: Estudiante completa Tema 4

**Usuario:** Estudiante Juan
**Acción:** Completa evaluación Tema 4 con 75%

**Resultado (automático en tiempo real):**
- Barra de progreso sube a 80%
- Contador: "4/5 completadas"
- "Evaluación Final" cambia a ✅ Disponible
- Botón "Iniciar Evaluación" está habilitado

### Caso 3: Estudiante completa Final

**Usuario:** Estudiante Juan
**Acción:** Completa evaluación Final con 85%

**Resultado (automático):**
- Barra de progreso llega a 100% ✅
- Contador: "5/5 completadas"
- Mensaje: "¡CURSO COMPLETADO!"
- Se registra en certificados

---

## 🐛 Troubleshooting

### Problema: "Evaluación Final sigue bloqueada después de Tema 4"

**Solución:**
1. Verifica que la puntuación en Tema 4 sea ≥ 70%
2. Recarga la página (F5)
3. Verifica conexión a Firebase
4. Revisa la consola (F12) para errores

### Problema: "Progreso no sube"

**Solución:**
1. Verifica que la evaluación se marcó como "completada"
2. Recarga la página
3. Limpia cache (Ctrl+Shift+Delete)

### Problema: "No puedo acceder al panel de evaluaciones"

**Solución:**
1. Verifica que estés autenticado
2. Verifica que estés matriculado en el curso
3. Prueba con otra navegador

---

## 📱 URLs Importantes

| Página | URL | Acceso |
|--------|-----|--------|
| Panel Evaluaciones | `/sesiones/panel-evaluaciones.html` | Estudiante |
| Inicializar Curso | `/admin/inicializar-topografia.html` | Admin |
| Dashboard | `/dashboard/index.html` | Estudiante |
| Admin Panel | `/admin/panel.html` | Admin |

---

## ✅ Checklist de Implementación

- [x] Backend de evaluaciones (topografia-course-setup.js)
- [x] Panel visual de evaluaciones (panel-evaluaciones.html)
- [x] Página de inicialización (inicializar-topografia.html)
- [x] Cálculo automático de progreso
- [x] Sistema de desbloqueo automático
- [x] Mensajes contextuales
- [x] Interfaz responsive
- [ ] Integración con examen.html
- [ ] Integración con dashboard.js (mostrar progreso)
- [ ] Certificado automático al 100%

---

## 🎓 Próximos Pasos

1. **Admin:** Acceder a `/admin/inicializar-topografia.html` y crear el curso
2. **Estudiante:** Acceder a `/sesiones/panel-evaluaciones.html` y completar evaluaciones
3. **Monitor:** Verificar que las evaluaciones se desbloquean correctamente
4. **Certificado:** Automatizar generación al completar 100%

---

*Documentación del Sistema de Evaluaciones Progresivas - FQ INGENIEROS Platform*
