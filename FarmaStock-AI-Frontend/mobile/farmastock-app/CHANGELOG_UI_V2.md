# Cambios de interfaz de FarmaStock AI

## 1.1.0 — UX/UI v2 (fuente entregada)

- Pantallas extraídas a `src/screens/` en vez de concentrarse en `App.js`.
- Identidad visual consistente: verde farmacéutico, jerarquía tipográfica, espacios, tarjetas y estados.
- Barra inferior de navegación, sección «Más» y retorno desde submódulos.
- `SelectField` reutilizable, con filtro y listado en línea compatible con formularios modales.
- `DateField` reutilizable: calendario sin instalar librerías nativas.
- Validación local y mensajes de error específicos por campo mediante `src/form-utils.js`.
- Formularios con estado de guardado que evita toques repetidos.
- Ventas con carrito agrupado, stock visible cuando está disponible, total orientativo y confirmación.
- Listas de catálogo e inventario con búsqueda.
- Riesgos de IA ordenados y etiquetas alto/medio/bajo; presentación de respuestas limpia.
- Misma API existente. API opcional para categorías con fallback.

### Límites no cubiertos

- No se rediseña el backend ni se agregan nuevas rutas obligatorias.
- No se incluye animación avanzada ni recursos de marca definitivos.
- Las validaciones servidor siguen siendo obligatorias.
- Queda pendiente una prueba E2E en Android y la compilación EAS del APK actualizado.
