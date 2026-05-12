# Script para comprimir imágenes y videos en public/
# Requisitos: ffmpeg (video), python (imágenes)
# Uso: Ejecuta este script en PowerShell o CMD

REM Comprimir video a menos de 100MB
ffmpeg -i public/guion-grafico-2.mp4 -b:v 800k -maxrate 900k -bufsize 1800k -vf scale=1280:-2 -c:a aac -b:a 128k public/guion-grafico-2-comprimido.mp4

REM Comprimir imágenes .jfif a menos de 10MB
python public/compress_images.py

echo Listo. Usa los archivos comprimidos para el deploy.
