# FarmaStock AI — Frontend separado

Este ZIP contiene **dos interfaces** para el mismo backend:

- **`web-mui/`**: React + Vite + Material UI, diseño administrativo responsive con modo demostración y conexión a la API.
- **`mobile/farmastock-app/`**: React Native + Expo en JavaScript, para compilar un APK Android.

## Panel web MUI

```bash
cd web-mui
npm install
npm run dev
```

Abre http://localhost:5173 y pulsa «Explorar demostración sin servidor». Cuando tengas el backend arriba, cierra sesión e ingresa con las credenciales del backend. El proxy integrado de Vite redirige `/api` al puerto 3000.

## React Native / APK

```bash
cd mobile/farmastock-app
npm install
npx expo start
# Compilación cuando esté configurada tu cuenta EAS:
eas build -p android --profile preview
```

Dentro de la app puedes cambiar la dirección del Gateway por IP local o URL de ngrok.

**No hay un APK precompilado.** MUI funciona en navegador; React Native usa sus propios componentes. Ambos consumen la misma API REST.

Las contraseñas, la configuración de Docker y el archivo `.env` del backend no deben estar en este proyecto. Revisa el README del ZIP Backend.
