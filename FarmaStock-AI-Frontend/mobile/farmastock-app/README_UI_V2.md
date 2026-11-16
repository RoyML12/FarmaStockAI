# FarmaStock AI · UX/UI móvil v2.0

Actualización del frontend React Native / Expo **SDK 55**, basada en el archivo `FarmaStock_UI_Source.tar.gz` suministrado. No cambia los microservicios, los contratos de API, MySQL ni el flujo de autenticación.

## Qué se mejoró

| Área | Mejora |
|---|---|
| Navegación | Barra inferior con Inicio, Catálogo, Inventario, Ventas y Más; Compras, Alertas, IA y Ajustes accesibles desde Más. |
| Diseño | Un sistema unificado de colores, espaciado, campos, botones, tarjetas, estados vacíos y alertas. |
| Estructura | Pantallas divididas en `src/screens/` y controles reutilizables en `src/components.js`. |
| Selects | Selector con filtro por nombre/SKU, lista dinámica y valor numérico interno; funciona dentro de formularios modales Android. |
| Medicamentos | Validación de SKU, nombre, precio, existencia mínima y categoría; búsqueda del catálogo. |
| Inventario | Selección por producto, calendario y validación de cantidad/costo. |
| Ventas | Selección por medicamento, comprobación de stock si la API lo proporciona, carrito consolidado, total estimado y confirmación. |
| Compras | Selects de proveedores y productos, calendario, validación de costos y confirmación de recepción. |
| IA | Ordenación por riesgo, niveles traducidos, respuestas limpiadas de Markdown y estado de consulta. |
| Formatos | Validaciones compartidas `src/form-utils.js`, errores junto al campo y bloqueo durante guardado. |
| Versión Android | `version 1.1.0`, `android.versionCode 2`, `cli.appVersionSource local`. |

No se agregaron dependencias externas; se utilizan componentes de React Native ya compatibles con el proyecto.

## Instalación en la carpeta actual de WSL

1. Crea una copia de seguridad del frontend antes de copiar los archivos.
2. Abre la carpeta que contiene `App.js`, `src/`, `package.json`, `app.json` y `eas.json`.
3. Extrae el paquete dentro de esa carpeta. **No reemplaces `.env`**: no está incluido en el paquete.
4. Ejecuta `npm install` solamente si las dependencias no están instaladas.
5. Prueba en Expo Go compatible con SDK 55.

Ejemplo:

```bash
APP=/home/FarmaStock-AI/FarmaStock-AI-Frontend/mobile/farmastock-app
cd "$APP"
mkdir -p "$HOME/farmastock-backups"
cp -a App.js src app.json eas.json "$HOME/farmastock-backups/"  # opcional: respaldo previo
# Copia FarmaStock_UI_V2.tar.gz a un directorio accesible desde WSL y extráelo:
tar -xzf /ruta/a/FarmaStock_UI_V2.tar.gz -C "$APP"
npx expo start --tunnel --clear
```

Si utilizas Windows, puedes extraer el ZIP y copiar **el contenido** sobre la carpeta de la app. Mantén tus archivos locales `.env` y `.git`.

## Compilación del APK actualizado

```bash
cd /home/FarmaStock-AI/FarmaStock-AI-Frontend/mobile/farmastock-app
npx expo install --check
npx eas-cli@latest build -p android --profile preview
```

El proyecto mantiene el identificador `com.farmastock.demo` y el `projectId` EAS original. La compilación nueva debe firmarse con el mismo keystore EAS si quieres instalar sobre el APK anterior. Si ya existe una versión instalada con `versionCode` **mayor o igual a 2**, aumenta `android.versionCode` antes de compilar.

## Endpoints REST preservados

- Autenticación: `/api/auth/login`
- Catálogo: `/api/catalog/products`; `/api/catalog/categories` es **opcional** y se maneja con fallback si no existe.
- Lotes: `/api/inventory/batches`; existencias: `/api/inventory/stock`
- Ventas: `/api/sales`
- Proveedores: `/api/purchases/suppliers`; órdenes: `/api/purchases/orders`; recepción: `/api/purchases/orders/:id/receive`
- Alertas: `/api/notifications`; marcar leída: `/api/notifications/:id/read`
- Riesgos y asistente: `/api/ai/risks`, `/api/ai/scan`, `/api/ai/ask`

## Verificación sugerida

- [ ] Inicio de sesión desde ngrok; guardado de URL y persistencia de sesión.
- [ ] Navegación inferior y pantalla «Más» sin perder acceso a las ocho secciones.
- [ ] Catálogo: buscar, abrir formulario, validar campos requeridos, guardar SKU de prueba.
- [ ] Inventario: buscar medicamento por nombre, seleccionar, elegir fecha, ingresar lote y verificar MySQL.
- [ ] Ventas: buscar producto, agregar cantidades, editar carrito, confirmar total estimado y validar descuento en inventario.
- [ ] Compras: crear proveedor, seleccionarlo, seleccionar producto, hacer una orden y recibirla si corresponde.
- [ ] Alertas: listar, marcar leída, comprobar mensaje y prioridad.
- [ ] IA: riesgos ordenados, consulta con `Modo: llm` y respuesta limpia.
- [ ] Verificar formato en un teléfono Android real con teclado abierto.

## Consideraciones

- No se probó la conexión a **tu backend en ejecución** desde este entorno, ni se compiló un APK en EAS. Se comprobó sintaxis, resolución interna de importaciones y utilidades de validación. Las rutas conocidas se conservaron.
- La selección de categoría toma primero `/api/catalog/categories` si existe; si no, utiliza IDs de categoría presentes en productos, o solicita el ID manualmente cuando no existen opciones detectables. Esta es una compatibilidad deliberada con la API entregada.
- La disponibilidad por medicamento solo se valida localmente si `/api/inventory/stock` proporciona `product_id` y `available`; **el backend sigue siendo la fuente de verdad** para descontar existencias.
- Las fechas no permiten elegir días pasados; se conservan como `AAAA-MM-DD` para los endpoints actuales.
- La URL HTTPS de ngrok puede cambiar. La URL almacenada en SecureStore y `.env` existente no se modifican con esta actualización.
- Los cambios de frontend en Expo Go requieren una compilación EAS nueva para aparecer en el APK instalado.
