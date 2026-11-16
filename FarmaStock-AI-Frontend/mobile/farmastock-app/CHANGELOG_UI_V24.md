# Registro de cambios — v2.4

**Base:** interfaz React Native FarmaStock AI v2.3.
**Alcance:** cambios visuales y componentes compartidos; sin cambios en rutas REST, lógica de negocio o datos persistidos.

- `src/theme.js`: tokens clínicos, tarjetas y botones más compactos, bordes, tipografía, estilos de foco y navegación existentes.
- `src/screens/Dashboard.js`: indicadores compactos, información prioritaria, accesos rápidos, avisos recientes.
- `src/components.js`: selección, campos, validaciones, estados y presentación de fechas.
- `src/screens/shared.js`: encabezados consistentes.
- `src/screens/Login.js`: refinamiento visual sin modificar autenticación ni recuperación de servidor.
- `src/screens/AI.js`: respuesta clínica en azul y etiqueta del tipo de asistente correcta.
- `src/screens/Notifications.js`: mejor indicación de notificaciones sin leer.
- `src/screens/More.js`: tonos discretos por sección.
- `package.json`, `app.json`: versión 1.2.0; versionCode Android 4.

**No incluidos:** `.env`, keystore, credenciales, node_modules.
