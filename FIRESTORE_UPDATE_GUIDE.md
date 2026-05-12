# Actualización de Datos del Curso - Resumen

## ✅ Estado Actual

### Página Pública - FUNCIONANDO CORRECTAMENTE
- **URL**: https://fqingenieros.vercel.app/cursos/curso.html?id=sst-obras-civiles
- **Estado**: ✅ Mostrando datos actualizados
- **Datos Mostrados**:
  - Título: "Seguridad y Salud en el Trabajo en Obras Civiles"
  - Fecha: "22 de mayo, 2026"
  - Horarios: "Viernes (Opción 1)" y "Viernes (Opción 2)"
  - Temario: Los 5 módulos completos cargando correctamente

### Panel de Administración - PENDIENTE
- **URL**: https://fqingenieros.vercel.app/admin/panel.html
- **Estado**: Esperando actualización de Firestore
- **Próximos Pasos**: Elegir uno de los métodos abajo

---

## 📋 Métodos para Actualizar Firestore

### Opción 1: Web (Recomendado - Sin configuración)
1. Accede a: https://fqingenieros.vercel.app/admin/panel.html
2. Inicia sesión como administrador
3. Abre en nueva pestaña: https://fqingenieros.vercel.app/admin/actualizar-cursos.html
4. Haz click en "Inicializar/Actualizar Cursos"

**Requisitos**: Navegador web, autenticación como admin
**Tiempo**: 2 minutos

---

### Opción 2: Node.js (Para Developers)
```bash
# 1. Descargar clave de servicio desde:
# https://console.firebase.google.com/project/fq-ingenieros-educativa/settings/serviceaccounts/adminsdk
# Guardar como: firebase-key.json (en la raíz del proyecto)

# 2. Ejecutar:
npm install firebase-admin

# 3. Correr script:
node update-courses.js
```

**Requisitos**: Node.js, clave de servicio Firebase
**Tiempo**: 5 minutos (incluye setup)

---

### Opción 3: Bash/Shell (Para Terminal)
```bash
# 1. Obtener token de autenticación:
# Abre: https://fqingenieros.vercel.app/admin/panel.html
# Consola (F12) > ejecuta: 
# firebase.auth().currentUser.getIdToken()

# 2. Copiar el token y ejecutar:
./update-firestore.sh "TOKEN_AQUI"
```

**Requisitos**: Terminal bash, curl, jq (opcional)
**Tiempo**: 3 minutos

---

### Opción 4: Firestore Console (Manual)
1. Ir a: https://console.firebase.google.com/project/fq-ingenieros-educativa/firestore/data/courses
2. Seleccionar documento `sst-obras-civiles`
3. Actualizar campos:
   - `startDate`: "2026-05-22"
   - `schedules[0].label`: "Viernes (Opción 1)"
   - `schedules[0].detail`: "5:00 p.m. — 6:00 p.m. • Viernes 22 de mayo"
   - `schedules[1].label`: "Viernes (Opción 2)"
   - `schedules[1].detail`: "7:00 p.m. — 8:00 p.m. • Viernes 22 de mayo"

**Requisitos**: Acceso a Firebase Console
**Tiempo**: 5 minutos

---

## ✨ Después de Actualizar

Verifica que los cambios aparezcan en:

1. **Panel Admin**: https://fqingenieros.vercel.app/admin/panel.html
   - Debe mostrar el curso con fecha viernes 22 de mayo

2. **Página de Curso**: https://fqingenieros.vercel.app/cursos/curso.html?id=sst-obras-civiles
   - Debe mostrar "Viernes 22 de mayo" (ya está mostrando)

3. **Dashboard Estudiante**: https://fqingenieros.vercel.app/dashboard/index.html
   - Debe mostrar el curso con la nueva fecha

---

## 📝 Notas Técnicas

- Los datos fallback (página pública) ya están actualizados a viernes 22 de mayo
- Firestore tendrá los datos autoritativos para el panel admin
- Los cambios se reflejarán en tiempo real en todas las páginas
- En caso de conectividad, se usa el cache local

---

## 🆘 Solución de Problemas

**P: La página web no funciona para actualizar**
R: Verifica que estés autenticado en el panel admin primero

**P: El Node.js script falla con firebase-key.json no encontrado**
R: Descarga la clave desde Firebase Console y colócala en la raíz del proyecto

**P: Los cambios no aparecen inmediatamente**
R: Recarga la página (Ctrl+F5) - el cache puede estar activo

---

Recomendación: Usa **Opción 1 (Web)** si eres usuario final, o **Opción 2 (Node.js)** si eres developer.
