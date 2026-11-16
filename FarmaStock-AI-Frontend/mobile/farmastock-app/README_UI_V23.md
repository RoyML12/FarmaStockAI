# FarmaStock AI — UX/UI v2.3

Versión incremental basada en v2.2, manteniendo el login sin sección pública de URL y los selectores en panel superpuesto.

## Correcciones

1. Safe areas: `SafeAreaProvider`, `useSafeAreaInsets()` y margen inferior dependiente de Android/iOS. La barra inferior queda por encima de los gestos del sistema.
2. Encabezado: acceso a `Ajustes` mediante un botón de icono alineado al título. No hay botón flotante implementado por la app. El engrane que puede aparecer sobre la interfaz en Expo Go es un **control de desarrollo de Expo Go**, ajeno a FarmaStock AI y ausente en el APK independiente.
3. Iconografía: Ionicons consistente para navegación, métricas, menú Más, pantalla de login, estados vacíos, selectores y calendario. Se conserva la identidad verde y el comportamiento funcional.

## Dependencias adicionales

- `react-native-safe-area-context` para Expo SDK 55 (versión indicada por Expo: 5.6.x).
- `@expo/vector-icons` fijada a 15.0.3, compatible con la capa tradicional de Expo Go SDK 55.

Para instalar tras aplicar el parche, usar **`npx expo install react-native-safe-area-context @expo/vector-icons`** o **`npm install`**. Mantener dependencias del SDK 55 (no instalar los paquetes más recientes fuera de ese SDK sin compatibilidad comprobada).

## Aplicar

En WSL (app móvil):

```bash
cd /home/FarmaStock-AI/FarmaStock-AI-Frontend/mobile/farmastock-app
cp -a App.js src package.json "$HOME/farmastock-ui-prev-v23/"  # crear carpeta antes
unzip -o /mnt/c/Users/roy70/Downloads/FarmaStock_UI_V23_Parche.zip -d .
npm install
npx expo start --tunnel --clear
```

Para aplicaciones ya compiladas, las modificaciones JavaScript y dependencias requieren una nueva compilación APK para actualizar la versión independiente.

## Pruebas sugeridas

- Android con gestos: las etiquetas Inicio, Catálogo, Inventario, Ventas y Más quedan visibles sin solaparse con el indicador de sistema.
- Tocar Ajustes dentro del encabezado, regresar a Más y navegar de vuelta al Dashboard.
- Login: no aparece URL ni DEMO; ver configuración de conexión solamente al fallar la red.
- Abrir y cerrar los selectores en Catálogo, Inventario y Ventas.
- Comprobar que los iconos mantengan color y tamaño sin mostrar emojis.

No se modificaron rutas ni payloads de la API, bases de datos o microservicios.
