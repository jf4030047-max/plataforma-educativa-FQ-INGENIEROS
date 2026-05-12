# compress_images.py
# Comprime todas las imágenes .jfif en public/ menores a 10MB
from PIL import Image
import os

PUBLIC_DIR = 'public'
MAX_SIZE_MB = 10

for root, _, files in os.walk(PUBLIC_DIR):
    for file in files:
        if file.lower().endswith('.jfif'):
            path = os.path.join(root, file)
            size_mb = os.path.getsize(path) / (1024 * 1024)
            if size_mb > MAX_SIZE_MB:
                img = Image.open(path)
                quality = 85
                while size_mb > MAX_SIZE_MB and quality > 10:
                    img.save(path, quality=quality, optimize=True)
                    size_mb = os.path.getsize(path) / (1024 * 1024)
                    quality -= 5
                print(f'Comprimida: {path} a {size_mb:.2f}MB (calidad {quality+5})')
            else:
                print(f'OK: {path} ({size_mb:.2f}MB)')
print('Listo.')
