# FarmaStock AI — UX/UI v2.4 (React Native, Expo SDK 55)

Esta entrega se creó **sobre FarmaStock UI v2.3**. Conserva la navegación segura de Android, el botón Ajustes en el encabezado, los iconos Ionicons, la selección de productos por ID y todos los endpoints existentes. No incluye `.env`, credenciales, `node_modules` ni datos de MySQL.

## Cambios v2.4

- Paleta médico-tecnológica: verde oscuro `#104E3B`, esmeralda `#168263`, fondo claro `#F7FAF9`, azul clínico, rojo/ámbar para prioridades.
- Dashboard: cuatro indicadores compactos (dos columnas), iconos contextuales, prioridad de caducidad, accesos rápidos y avisos recientes.
- Formularios: campos con borde de foco, mensajes de validación con icono, superficie y espaciado consistentes.
- Selectores: conserva la búsqueda y selección modal superpuesta de la v2.3; mejora el encabezado del panel y el estado seleccionado.
- Fechas: se muestran como `DD/MM/AAAA`, mientras el valor enviado a la API sigue en `AAAA-MM-DD`.
- Etiquetas de estado: mantienen texto accesible, con un punto indicador adicional. Los colores nunca son el único indicador del riesgo.
- Asistente de IA: reemplaza una etiqueta ambigua de riesgo «Bajo» por «IA local» cuando `mode=llm`, sin cambiar la consulta RAG.
- Menú Más: diferenciación visual de Compras, Alertas, IA y Ajustes.
- Metadatos de versión: `1.2.0`; Android `versionCode: 4`. Se conserva el `android.package` preexistente para actualizar la app instalada.

## Instalación en WSL (parche sobre v2.3)

1. Descarga `farmastock-ui-v24-parche.zip` en la carpeta Descargas de Windows.
2. En WSL:

```bash
cd /home/FarmaStock-AI/FarmaStock-AI-Frontend/mobile/farmastock-app
mkdir -p ~/farmastock-respaldo-v24
tar -czf ~/farmastock-respaldo-v24/frontend-anterior.tar.gz App.js src package.json app.json
unzip -o /mnt/c/Users/roy70/Downloads/farmastock-ui-v24-parche.zip -d .
npm install
npx expo start --tunnel --clear
```

**Alternativa sin `unzip`:** usa `farmastock-ui-v24-parche.tar.gz` con `tar -xzf archivo -C .`.

**No sustituir el `.env` actual.** No es necesario reiniciar MySQL, Docker, Ollama ni ngrok; el APK instalado tampoco cambia hasta generar otra compilación EAS.

## Comprobaciones en Android

1. En Inicio, comprobar cuatro tarjetas en 2 columnas y sección Acciones rápidas.
2. Revisar que un riesgo alto se muestre rojo y uno medio ámbar; con texto, no solo color.
3. En Catálogo o Inventario, abrir un formulario y probar que el campo seleccionado resalte su borde.
4. Abrir el selector de medicamentos: buscar, desplazarse y seleccionar sin recortes.
5. En Recibir lote, confirmar que la caducidad se ve DD/MM/AAAA y que el calendario sigue funcionando.
6. En IA, consultar al asistente: debe indicar `Modo: llm` si el backend usa Ollama y mostrar «IA local» sin confundirlo con una clasificación de riesgo.
7. Revisar barra inferior de navegación y botón Ajustes (se conservan desde v2.3).

## Construir APK (tras validar Expo Go)

```bash
npx eas-cli@latest build -p android --profile preview
```

## Recuperar versión anterior

```bash
cd /home/FarmaStock-AI/FarmaStock-AI-Frontend/mobile/farmastock-app
tar -xzf ~/farmastock-respaldo-v24/frontend-anterior.tar.gz -C .
npm install
```

## Alcance de las pruebas realizadas en la entrega

Se verificó la sintaxis de 18 archivos JavaScript/JSX con el parser TypeScript, la resolución de importaciones relativas y los JSON de configuración. **Aún no se ha ejecutado esta versión en un teléfono físico ni compilado un APK** en este entorno; la validación visual se realizará en tu Android.
