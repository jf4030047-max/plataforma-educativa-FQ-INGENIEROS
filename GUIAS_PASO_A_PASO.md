# 👥 GUÍAS PASO A PASO POR ROL

---

## 🎓 GUÍA PARA ESTUDIANTE NUEVO

### PASO 1: REGISTRARSE

```
1. Abre: https://fqingenieros.vercel.app/
2. En navbar arriba → Click "Registrarse"
3. Completa formulario:
   ├─ Email: tu.email@gmail.com
   ├─ Contraseña: (mínimo 8 caracteres)
   ├─ Nombre completo: Juan Pérez
   ├─ Teléfono: 987654321
   ├─ Tipo documento: DNI / Pasaporte
   ├─ Número documento: 12345678
   └─ Click REGISTRARSE
4. ✅ Cuenta creada - Ya estás logueado
5. Vuelve a homepage (Click logo)
```

### PASO 2: VER CURSOS DISPONIBLES

```
1. En navbar → Click "Cursos" O "Explorar cursos"
2. Se abre: /cursos/catalogo.html
3. Ves lista con:
   ├─ Seguridad y Salud en el Trabajo (GRATIS)
   ├─ Topografía en Civil 3D (S/ 200)
   └─ Supervisión de Obra (S/ 120)
4. Click en la tarjeta del curso que te interesa
```

### PASO 3A: MATRICULARSE EN CURSO GRATIS

```
Curso: "Seguridad y Salud en el Trabajo (Gratis)"

1. Abre el curso → /cursos/curso.html?id=Wa2NuxyWwKyYmaNqP17T
2. Ve descripción, temario expandible
3. Click botón "Matricularme"
   → Sistema crea tu matriculación automáticamente
   → ¡Ya estás dentro del curso!
4. Ahora ves:
   ├─ ✅ Temario completo (módulos expandibles)
   ├─ ✅ Link a Zoom (si disponible)
   ├─ ✅ Video de grabación (si disponible)
   └─ ✅ Botón "Mi Dashboard"
5. Para entrar a clase: Click link Zoom
   → Se abre en nueva pestaña
   → ¡Conectate a la sesión en vivo!
```

### PASO 3B: PAGAR CURSO PAGADO

```
Curso: "Topografía en Civil 3D (S/ 200)"

1. Abre el curso → /cursos/curso.html?id=topografia-civil-3d
2. Click "Matricularme"
3. Sistema redirige a: /certificado/pago.html
4. Selecciona método de pago:
   ┌─ YAPE (Recomendado)
   ├─ PLIN
   ├─ BCP
   └─ Transferencia interbancaria
5. Ves datos de transferencia:
   ├─ Número Yape: 958 003 888
   ├─ Monto: S/ 200
   └─ Concepto: "Topografía Civil 3D"
6. En TU APP DE BANCO (Yape/Plin):
   ├─ Abre app Yape (o tu banco)
   ├─ Busca: "958 003 888"
   ├─ Ingresa monto: 200
   ├─ Confirma transferencia
   └─ Copia comprobante (screenshot)
7. Vuelve a navegador
8. Upload comprobante:
   ├─ Busca campo: "Subir comprobante de pago"
   ├─ Click en el área para subir foto
   ├─ Selecciona screenshot de transferencia
   └─ Click ENVIAR
9. Sistema crea solicitud de pago
   ├─ Estado: PENDIENTE
   ├─ Admin lo verifica en panel
   └─ Cuando admin aprueba → ¡Acceso activado!
10. Recibirás email cuando esté aprobado
```

### PASO 4: VER MI PROGRESO

```
1. En navbar (top derecha) → Tu nombre/avatar
2. Click dropdown → "Mi panel"
3. Se abre: /dashboard/index.html
4. Ves:
   ├─ Mis cursos (matriculados)
   ├─ Progreso en % por curso
   ├─ Mis certificados
   ├─ Mis calificaciones
   ├─ Mis pagos (estado)
   └─ Próximas sesiones
```

### PASO 5: HACER EXAMEN Y CERTIFICADO

```
Después de completar todas las sesiones:

1. Ve a: /certificado/examen.html
2. Lee instrucciones
3. Click "Comenzar examen"
4. Contesta preguntas (múltiple choice)
5. Click ENVIAR al terminar
6. Ves tu calificación
7. Opciones:
   ├─ DESCARGA CONSTANCIA (Gratis)
   │  └─ PDF con tu nombre + curso + fecha
   │
   └─ PAGA S/ 20 PARA CERTIFICADO
      ├─ Incluye tu calificación del examen
      ├─ Sigue pasos de pago (como en PASO 3B)
      └─ Se genera PDF con certificado
8. PDF se descarga automáticamente en tu PC
```

---

## 🔧 GUÍA PARA ADMIN

### ACCESO AL PANEL

```
1. Email: fq.ingenieros.empresa@gmail.com
2. Abre: https://fqingenieros.vercel.app/admin/panel.html
3. Click "Iniciar sesión"
4. Ingresa tu email y contraseña
5. ✅ Acceso al panel de administración
```

### CREAR NUEVO CURSO

```
En el panel admin (/admin/panel.html):

1. Sección izquierda → Click "Gestionar Cursos"
2. Ve tabla con cursos existentes
3. Click botón "➕ Crear Nuevo Curso"
4. Se abre modal con formulario:
   
   CAMPOS A LLENAR:
   ├─ Nombre: "Cálculo Estructural Avanzado"
   ├─ Precio: 250 (número)
   ├─ Etiqueta de precio: "S/ 250"
   ├─ Descripción: "Aprende a calcular estructuras..."
   ├─ Duración: "10 horas"
   ├─ Sesiones: 5
   ├─ Temático principal: "Estructuras"
   ├─ Tags: (separados por coma) "Cálculo,Acero,Concreto"
   ├─ Modalidad: "En vivo + Grabado"
   └─ Descripción larga: (más detalles del curso)

5. Click "GUARDAR CURSO"
   → Se crea en Firestore automáticamente
   → Aparece en lista de cursos
   → Aparece en catálogo público
```

### EDITAR CURSO EXISTENTE

```
1. En tabla de cursos
2. Busca el curso a editar
3. Click botón "✏️ Editar" (lápiz)
4. Se abre modal pre-poblado con datos actuales
5. Modifica lo que necesites:
   ├─ Cambiar precio
   ├─ Actualizar temario
   ├─ Cambiar fecha
   └─ etc.
6. Click "GUARDAR CAMBIOS"
7. ✅ Curso actualizado en Firestore
```

### AGREGAR ZOOM A CURSO

```
1. En tabla de cursos
2. Busca el curso
3. Click botón "🎥 Zoom/Grabación"
4. Se abre modal con campos:
   ├─ Link de Zoom: https://zoom.us/j/123456789
   │  (O si usan Meetjitsi: https://meet.jit.si/NOMBASALA)
   │
   └─ URL de Grabación: https://ejemplo.com/video.mp4
5. Click "GUARDAR"
6. ✅ Automáticamente disponible para estudiantes
```

### AGREGAR GRABACIÓN A CURSO

```
Prerequisito: Video ya subido a servidor/CDN

1. En tabla de cursos
2. Click botón "🎥 Zoom/Grabación"
3. Campo: "URL de Grabación"
4. Pega URL: https://ejemplo.com/grabacion-video.mp4
   (Puede ser de: Google Drive, Dropbox, tu servidor, etc.)
5. Click "GUARDAR"
6. ✅ Los estudiantes pueden ver el video
```

### ELIMINAR CURSO

```
⚠️ CUIDADO - Es irreversible

1. En tabla de cursos
2. Click botón "🗑️ Eliminar"
3. Se pide confirmación: "¿Estás seguro?"
4. Click "SÍ, ELIMINAR"
5. ✅ Curso desaparece de Firestore
6. Ya no aparece en catálogo
7. Los estudiantes ya matriculados pierden acceso
```

### VERIFICAR PAGOS PENDIENTES

```
En el panel admin:

1. Sección izquierda → "Gestionar Pagos"
2. Ve tabla con pagos:
   ├─ Pendiente (naranja) - Necesita verificación
   ├─ Aprobado (verde) - Ya verificado
   └─ Rechazado (rojo) - No válido
3. Click en pago PENDIENTE
4. Ver detalles:
   ├─ Estudiante
   ├─ Curso pagado
   ├─ Monto
   ├─ Comprobante (foto)
   └─ Método de pago
5. Si es válido → Click "APROBAR"
   → El sistema automáticamente:
      ├─ Marca como aprobado
      ├─ Crea matriculación
      ├─ Envía email al estudiante
      └─ Activa acceso al curso
```

### VER ESTADÍSTICAS

```
En el panel admin - Dashboard:

Ve las tarjetas de estadísticas:
├─ 📚 Total de cursos activos
├─ 👥 Total de estudiantes registrados
├─ 💰 Ingresos del mes
└─ 📊 Gráficos de actividad
```

### VER USUARIOS REGISTRADOS

```
1. Sección izquierda → "Gestionar Usuarios"
2. Ve tabla con todos los estudiantes:
   ├─ Email
   ├─ Nombre
   ├─ Teléfono
   ├─ Cursos matriculados
   └─ Fecha de registro
3. Click en usuario para ver detalles:
   ├─ Documento de identidad
   ├─ Cursos en los que está
   ├─ Pagos realizados
   ├─ Certificados obtenidos
   └─ Progreso
```

---

## 👨‍🏫 GUÍA PARA PROFESOR (Estructura lista, asignación pendiente)

### ACCESO AL PANEL

```
⚠️ NOTA: Todavía NO está asignación de profesores
Cuando esté implementado:

1. Email: profesor@fqingenieros.com
2. Abre: https://fqingenieros.vercel.app/profesor/index.html
3. Click "Iniciar sesión"
4. Acceso a mis cursos asignados
```

### MIS CURSOS (Cuando esté asignado)

```
Panel de profesor tendrá:

Sección: "Mis Cursos"
├─ Lista de cursos asignados a mí
├─ Estudiantes matriculados por curso
├─ Progreso de cada estudiante
└─ Botones para:
   ├─ Ver grabaciones
   ├─ Ver calificaciones
   ├─ Agregar notas
   └─ Contactar estudiantes
```

### GESTIÓN DE ZOOM Y GRABACIONES

```
El panel del profesor tendrá:

Sección: "Zoom / Grabaciones"
├─ Link de Zoom del curso
├─ Fecha/hora de próxima clase
├─ URL de grabaciones anteriores
├─ Botón para subir nueva grabación
└─ Copiar enlace para enviar a estudiantes
```

---

## 📋 TABLA DE URLS POR FUNCIÓN

| Función | URL | Quién accede |
|---------|-----|--------------|
| **Homepage** | / | Todos |
| **Registro** | /auth/registro.html | No logueados |
| **Login** | /auth/login.html | No logueados |
| **Catálogo cursos** | /cursos/catalogo.html | Todos (ver solo descrip) |
| **Ver curso** | /cursos/curso.html?id=ID | Todos (ver completo si matriculado) |
| **Pagar** | /certificado/pago.html | Logueados |
| **Examen** | /certificado/examen.html | Logueados |
| **Mi Dashboard** | /dashboard/index.html | Logueados |
| **Panel Admin** | /admin/panel.html | Solo Admin |
| **Panel Profesor** | /profesor/index.html | Solo Profesor |

---

## 🚨 TROUBLESHOOTING

### "No me aparece el botón Matricularme"
```
Probable causa: NO estás logueado
Solución: 
1. Click "Registrarse" o "Iniciar sesión"
2. Vuelve al curso
3. Ya deberías ver el botón
```

### "Puse Zoom pero no aparece en curso"
```
Probable causa: Caché del navegador
Solución:
1. Admin: Guarda zoom en panel
2. Estudiante: 
   - Ctrl+Shift+Delete (borrar caché)
   - O abre en incógnito
   - O espera 5 minutos y recarga
```

### "El estudiante pagó pero no tiene acceso"
```
Probable causa: Admin no aprobó el pago
Solución:
1. Admin ve "Gestionar Pagos"
2. Busca el pago del estudiante
3. Si está en PENDIENTE → Click "APROBAR"
4. ✅ Acceso se activa automáticamente
```

### "La grabación no se ve"
```
Probable causa: URL incorrecta o video no existe
Solución:
1. Admin verifica URL en panel
2. Copia URL en navegador directamente
3. Si muestra error 404 → URL está mal
4. Corrige URL en panel y guarda
```

---

## ✅ CHECKLIST PARA ENTREGAR

### Antes de entregar al cliente:

- [ ] Probar registro de usuario nuevo
- [ ] Probar matriculación en curso GRATIS
- [ ] Probar pago de curso PAGADO
- [ ] Probar admin panel (crear/editar/eliminar curso)
- [ ] Probar agregar Zoom
- [ ] Probar agregar grabación
- [ ] Probar descarga de certificado
- [ ] Probar Dashboard de estudiante
- [ ] Limpiar base de datos (solo cursos reales)
- [ ] Verificar links en homepage
- [ ] Probar en móvil (responsive)
- [ ] Verificar emails se envían (si está configurado)
- [ ] Crear usuario admin en Firestore
- [ ] Crear algunos cursos de ejemplo
- [ ] Verificar que precios sean correctos
- [ ] Verificar que Zoom/Meetjitsi funcione
- [ ] Hacer test de flujo completo

---

**¿Dudas?** Revisa los documentos:
- `ARQUITECTURA_PLATAFORMA.md` - Técnico detallado
- `RESUMEN_60_SEGUNDOS.md` - Visión rápida
- Este archivo - Guías paso a paso
