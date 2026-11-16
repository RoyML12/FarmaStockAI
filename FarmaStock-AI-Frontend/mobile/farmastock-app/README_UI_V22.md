# FarmaStock AI — UX/UI v2.2 (acceso limpio)

Esta versión está construida sobre la **v2.1 de selectores flotantes corregidos**.

## Cambios

- Encabezado principal: `FARMASTOCK AI` (sin el texto «DEMO»).
- Pantalla de acceso: ahora muestra únicamente correo, contraseña y botón «Iniciar sesión». Ya no muestra la dirección del servidor.
- Correo del administrador sin rellenar de forma predeterminada.
- Nombre de la cuenta de pruebas «Administrador demo» presentado como «Administrador» en el encabezado y la pantalla Ajustes (sin alterar la cuenta ni sus datos en MySQL).
- Eliminado el pie de «Demostración académica» del menú Más.
- La API se configura a través de `EXPO_PUBLIC_API_URL` en Expo o EAS Build, y se puede actualizar en Ajustes después de iniciar sesión.
- Si el servidor no se puede alcanzar desde el login, el aviso de conexión permite abrir «Configurar conexión» y guardar una nueva dirección sin haber iniciado sesión. El campo técnico no aparece de forma permanente en el login.
- Versión Android: `1.1.1`, `versionCode: 3`.
- Se conserva intencionalmente el identificador `com.farmastock.demo`: cambiarlo haría que Android considere la app una aplicación diferente y no se actualice sobre la instalada. Se puede renombrar cuando se decida publicar una aplicación nueva.
- `eas.json` incorpora en `preview.env.EXPO_PUBLIC_API_URL` el dominio ngrok que se utilizó durante las pruebas. Es una URL pública, no una credencial; si cambia el túnel, actualizar ese valor o cambiar la conexión desde Ajustes.

## Instalación desde WSL

1. Copia el archivo `.tar.gz` del parche a Descargas de Windows.
2. Haz un respaldo antes de aplicarlo:

```bash
cd /home/FarmaStock-AI/FarmaStock-AI-Frontend/mobile/farmastock-app
mkdir -p ~/farmastock-respaldo-v22
tar -czf ~/farmastock-respaldo-v22/frontend-previo.tar.gz App.js src app.json eas.json
```

3. Extrae desde la carpeta del proyecto:

```bash
tar -xzf /mnt/c/Users/roy70/Downloads/FarmaStock_UI_V22_Parche.tar.gz -C .
```

4. Comprueba que sigue existiendo `.env` y que contiene `EXPO_PUBLIC_API_URL` con la dirección que uses, **sin compartir ninguna clave**. La actualización no sobrescribe `.env`.

5. Prueba en Expo Go:

```bash
npx expo start --tunnel --clear
```

6. Tras verificar el login y la nueva navegación, recompila APK cuando lo necesites:

```bash
npx eas-cli@latest build -p android --profile preview
```

## Comprobaciones sugeridas

- Sin sesión, el login no muestra la URL del backend ni textos «demo».
- Inicia sesión con credenciales correctas. La cabecera indica FarmaStock AI y el nombre amigable «Administrador».
- Comprueba Catálogo, Inventario y Ventas sin registrar operaciones nuevas de prueba.
- En Más → Ajustes se sigue pudiendo cambiar el servidor.
- Para probar la recuperación del servidor, detén ngrok temporalmente, intenta iniciar sesión y verifica que el mensaje de error incluya «Configurar conexión»; posteriormente restaura el túnel.

## Alcance

Los nombres y códigos de productos, proveedores y otras filas que tengan «demo» provienen de MySQL, no de etiquetas de la interfaz. Esta actualización no altera las bases de datos, el backend, las credenciales ni los registros existentes. Solo se ha validado estáticamente la sintaxis y las importaciones JavaScript; la ejecución en tu dispositivo queda pendiente de probar.
