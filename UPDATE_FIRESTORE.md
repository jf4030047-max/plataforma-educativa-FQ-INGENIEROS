# Actualizar Datos en Firestore

Hay dos formas de actualizar los datos de los cursos en Firestore:

## Opción 1: Usando Node.js (Recomendado)

### Requisitos:
1. Descargar la clave de servicio de Firebase
2. Tener Node.js instalado

### Pasos:

1. **Descargar la clave de servicio:**
   - Ir a: https://console.firebase.google.com/project/fq-ingenieros-educativa/settings/serviceaccounts/adminsdk
   - Click en "Generate new private key"
   - Guardar el archivo como `firebase-key.json` en la raíz del proyecto

2. **Ejecutar el script:**
   ```bash
   node update-courses.js
   ```

3. **Resultado esperado:**
   ```
   ✅ "Seguridad y Salud en el Trabajo en Obras Civiles"
      ID: sst-obras-civiles
      Fecha: 2026-05-22
      Horarios: Viernes (Opción 1), Viernes (Opción 2)

   ✨ Actualización completada: 1 curso(s) actualizado(s)
   ```

## Opción 2: Usar Panel Web

- Abrir: https://fqingenieros.vercel.app/admin/actualizar-cursos.html
- Autenticarse como administrador
- Click en "Inicializar/Actualizar Cursos"

## Opción 3: Firestore Console

1. Ir a: https://console.firebase.google.com/project/fq-ingenieros-educativa/firestore/data/courses
2. Seleccionar documento `sst-obras-civiles`
3. Actualizar manualmente:
   - `startDate`: "2026-05-22"
   - `schedules`: Array con horarios de viernes

## Verificar Cambios

Después de actualizar:

1. **Panel de Administración:** https://fqingenieros.vercel.app/admin/panel.html
2. **Página de Curso:** https://fqingenieros.vercel.app/cursos/curso.html?id=sst-obras-civiles
3. **Dashboard Estudiante:** https://fqingenieros.vercel.app/dashboard/index.html

Todos deberían mostrar "Viernes 22 de mayo" en lugar de "Jueves 23 de abril".
