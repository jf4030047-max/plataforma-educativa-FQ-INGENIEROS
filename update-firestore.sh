#!/bin/bash

# Script para actualizar cursos en Firestore usando API REST
# Uso: ./update-firestore.sh <AUTH_TOKEN>

PROJECT_ID="fq-ingenieros-educativa"
FIRESTORE_API="https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents"

# Obtener token de autenticación
if [ -z "$1" ]; then
    echo "❌ Uso: $0 <AUTH_TOKEN>"
    echo ""
    echo "Para obtener el token de autenticación:"
    echo "1. Abre https://fqingenieros.vercel.app/admin/panel.html"
    echo "2. Abre la consola (F12)"
    echo "3. Ejecuta: firebase.auth().currentUser.getIdToken()"
    echo "4. Copia el token y úsalo como argumento"
    exit 1
fi

AUTH_TOKEN="$1"

# Preparar datos en formato Firestore
SCHEDULE_1='{"id": {"stringValue": "h1"}, "label": {"stringValue": "Viernes (Opción 1)"}, "detail": {"stringValue": "5:00 p.m. — 6:00 p.m. • Viernes 22 de mayo"}}'
SCHEDULE_2='{"id": {"stringValue": "h2"}, "label": {"stringValue": "Viernes (Opción 2)"}, "detail": {"stringValue": "7:00 p.m. — 8:00 p.m. • Viernes 22 de mayo"}}'

PAYLOAD="{
  \"fields\": {
    \"schedules\": {
      \"arrayValue\": {
        \"values\": [
          {\"mapValue\": {\"fields\": ${SCHEDULE_1}}},
          {\"mapValue\": {\"fields\": ${SCHEDULE_2}}}
        ]
      }
    },
    \"startDate\": {\"stringValue\": \"2026-05-22\"}
  }
}"

echo "🔄 Actualizando curso 'sst-obras-civiles' en Firestore..."

curl -X PATCH \
  "${FIRESTORE_API}/courses/sst-obras-civiles?updateMask.fieldPaths=schedules&updateMask.fieldPaths=startDate" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${PAYLOAD}" \
  2>/dev/null | jq '.' 

echo ""
echo "✅ Actualización completada"
echo ""
echo "Verificar cambios en:"
echo "- Panel Admin: https://fqingenieros.vercel.app/admin/panel.html"
echo "- Página Curso: https://fqingenieros.vercel.app/cursos/curso.html?id=sst-obras-civiles"
