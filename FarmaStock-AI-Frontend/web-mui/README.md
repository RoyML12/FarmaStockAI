# FarmaStock AI — Panel web React + Vite + MUI

Interfaz administrativa en **JavaScript y Material UI**, con vistas para dashboard, catálogo, inventario y lotes, compras, ventas, alertas y predicciones.

## Inicio rápido sin servidor (visualizar diseño)

```bash
cd web-mui
npm install
npm run dev
```

Abre **http://localhost:5173** y selecciona **Explorar demostración sin servidor**. Es un modo de datos ficticios editables en memoria para validar la interfaz. No almacena información en MySQL.

## Conectar al backend real

1. Inicia `FarmaStock-AI-Backend` con Docker y verifica `http://localhost:3000/health`.
2. Mantén la URL del Gateway vacía en **Ajustes** de MUI. El proxy de Vite reenviará `/api` a `http://localhost:3000` y evitará problemas CORS en desarrollo.
3. En login usa `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` de tu archivo `.env` del backend.
4. Carga datos con `python3 scripts/seed_demo.py` desde el backend cuando sea necesario.

**Si el frontend se ejecuta dentro de WSL2** y el backend se publica en Windows de otra forma, ajusta `target` en `vite.config.js` al host accesible. Si quieres servir el panel públicamente en un dominio separado, el Gateway necesitará una lista CORS de orígenes permitidos o un proxy de mismo origen. No actives CORS `*` con credenciales ni publiques otros servicios internos.

## Generar build web

```bash
npm run build
npm run preview
```

La salida se guarda en `dist/`. Para despliegue es recomendable servir `dist/` detrás de un reverse proxy que dirija `/api` al Gateway en el mismo origen. El comando `preview` **no configura** ese proxy por sí solo.

## Estructura

- `src/components/` — Sidebar, barra superior, tablas, formularios y login.
- `src/pages/` — Dashboard, operaciones, alertas, asistente de IA y ajustes.
- `src/styles/theme.js` — Identidad visual de MUI.
- `src/lib/api.js` — Cliente REST con JWT y base URL configurable.
- `src/data/demo.js` — Datos ficticios para explorar las pantallas sin Docker.

## Importante

**MUI no se ejecuta como UI nativa en React Native.** Este panel sirve para web. La APK se genera desde `../mobile/farmastock-app` con Expo. Ambos frontends usan el mismo API Gateway; pueden tener diseños similares, pero son proyectos de interfaz independientes.

El panel es un MVP académico; faltan auditorías, pruebas de integración completas, autorizaciones de interfaz por rol, manejo avanzado de concurrencia y endurecimiento antes de uso real.
