FarmaStock AI - Integración del icono 2D minimalista (Expo SDK 55)

Incluye:
 - assets/icon.png (1024x1024, diseño completo aprobado)
 - assets/adaptive-icon.png (1024x1024, motivo central sobre transparencia)
 - assets/monochrome-icon.png (Android 13+ themed icons)
 - assets/splash-icon.png (1024x1024, pantalla nativa de arranque)
 - aplicar_icono.py (edita app.json y package.json sin sustituir las credenciales ni EAS)

INSTALACIÓN WSL:
1. cd /home/FarmaStock-AI/FarmaStock-AI-Frontend/mobile/farmastock-app
2. tar -czf ~/farmastock-respaldo-antes-icono.tar.gz App.js src app.json package.json eas.json
3. unzip -o /mnt/c/Users/roy70/Downloads/FarmaStock_Icono_Expo55_Parche.zip -d .
4. python3 aplicar_icono.py
5. npm install
6. npx expo config --type public
7. npx eas-cli@latest build -p android --profile preview

El icono/splash nativos requieren un NUEVO APK y no se pueden validar en Expo Go.
La integración no modifica el backend ni .env. Conserva com.farmastock.demo.
