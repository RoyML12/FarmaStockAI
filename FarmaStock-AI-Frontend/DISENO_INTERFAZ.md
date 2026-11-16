# Diseño de interfaz — FarmaStock AI (React + MUI)

## Identidad visual

- **Estilo**: panel administrativo farmacéutico limpio, profesional y adaptable.
- **Barra lateral**: azul petróleo profundo `#102B38`, con selección en verde oscuro.
- **Color primario**: verde farmacéutico `#16836B`.
- **Fondo**: gris blanco `#F5F7F8` con tarjetas blancas y bordes suaves.
- **Tipografía**: Manrope (fontsource), jerarquía de encabezados y datos grandes.
- **Estados**: verde para normal, ámbar para advertencia y rojo para caducidad o riesgos altos.
- **Diseño responsive**: barra lateral fija en escritorio; Drawer desplegable en pantallas más pequeñas.

## Pantallas incluidas

| Pantalla | Diseño y elementos |
|---|---|
| Login | Presentación de marca, credenciales del backend y acceso a modo demo sin servidor. |
| Dashboard | Tarjeta de IA, métricas, resumen de ventas, barras de stock, alertas y actividad reciente. |
| Medicamentos | Búsqueda, tabla y modal de registro de producto con SKU, categoría y precio. |
| Inventario | Indicadores de existencias, pestañas de stock y lotes, registro de lotes y caducidades. |
| Compras | Órdenes y proveedores, crear orden, agregar proveedor, recibir orden. |
| Ventas | Historial, venta unitaria nueva y descontado FEFO por API real. |
| Alertas | Bandeja, prioridades, lectura de notificaciones. |
| Predicciones AI | Tabla de riesgo por lote, ejecución de escaneo y asistente IA. |
| Ajustes | Dirección del Gateway, perfil y cierre de sesión. |

## Distinción entre web y móvil

- `web-mui/`: frontend web con React + Material UI. Puedes verlo en navegador, tablet o teléfono como sitio responsive.
- `mobile/farmastock-app/`: aplicación React Native existente para APK. Usa componentes nativos, no MUI, y comparte los endpoints del mismo backend.

## Comportamiento

- **Modo demo**: datos inventados que pueden cambiar localmente al registrar productos, lotes y ventas; no persisten ni representan el estado del backend.
- **Modo real**: token JWT en almacenamiento de sesión del navegador, requests hacia `/api` mediante proxy de Vite y operaciones del backend. Para producción conviene renovar el diseño de autenticación y permisos y establecer una política de almacenamiento de sesiones.
- **Errores**: avisos informativos en Snackbar; deshabilitación de acciones durante envío.

## Puesta en marcha

En el ZIP Frontend, entra a `web-mui`, ejecuta `npm install && npm run dev` y abre `http://localhost:5173`. Para usar base MySQL levanta primero el ZIP Backend.
