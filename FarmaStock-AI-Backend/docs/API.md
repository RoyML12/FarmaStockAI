# Contrato REST (v1 de demostración)

Todas las rutas se llaman desde el **Gateway** en `http://localhost:3000`, prefijo `/api/`. Salvo `POST /api/auth/login` y `GET /health`, requieren el header `Authorization: Bearer TOKEN`.

| Método | Ruta | Uso |
|---|---|---|
| POST | `/api/auth/login` | `{email,password}` devuelve token JWT y usuario |
| GET | `/api/auth/users` | Listar usuarios (admin) |
| POST | `/api/auth/users` | Alta de usuarios (admin), `{full_name,email,password,role}` |
| GET | `/api/catalog/categories` | Categorías |
| POST | `/api/catalog/categories` | Alta categoría (admin / pharmacist) |
| GET | `/api/catalog/products` | Lista productos; parámetro `q` |
| GET | `/api/catalog/products/ID` | Consultar producto |
| POST | `/api/catalog/products` | Alta producto (admin / pharmacist) |
| PUT | `/api/catalog/products/ID` | Editar producto (admin / pharmacist) |
| GET | `/api/inventory/warehouses` | Listar almacenes |
| GET | `/api/inventory/batches` | Lotes, incluyendo reservas |
| POST | `/api/inventory/batches` | Recibir lote (admin / pharmacist) |
| GET | `/api/inventory/stock` | Stock agregado por producto |
| GET | `/api/inventory/movements` | Movimientos de stock |
| GET | `/api/purchases/suppliers` | Listar proveedores |
| POST | `/api/purchases/suppliers` | Alta proveedor (admin / pharmacist) |
| GET | `/api/purchases/orders` | Listar órdenes |
| POST | `/api/purchases/orders` | Alta orden con ítems y datos de lote |
| POST | `/api/purchases/orders/ID/receive` | Recibir orden en Inventarios |
| GET | `/api/sales` | Lista ventas |
| POST | `/api/sales` | Crear venta; requiere `client_request_id` único |
| GET | `/api/notifications` | Bandeja de alertas |
| PATCH | `/api/notifications/ID/read` | Marcar como leída |
| GET | `/api/ai/risks` | Último análisis de caducidad |
| POST | `/api/ai/scan` | Recalcular riesgo (admin / pharmacist) |
| POST | `/api/ai/ask` | Asistente IA (online u offline) |

## Ejemplos

**Login**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@farmastock.local","password":"TU_PASSWORD_DEL_ENV"}'
```

**Crear producto**

```http
POST /api/catalog/products
Authorization: Bearer <token>
Content-Type: application/json

{"sku":"PARA-500","name":"Paracetamol 500mg","generic_name":"Paracetamol","category_id":1,"presentation":"Caja 20","price":45.00,"reorder_level":10}
```

**Ingresar lote**

```http
POST /api/inventory/batches
Authorization: Bearer <token>
Content-Type: application/json

{"product_id":1,"lot_number":"LOT-0001","expiry_date":"2027-09-30","quantity":60,"unit_cost":20.0}
```

**Realizar venta**

```http
POST /api/sales
Authorization: Bearer <token>
Content-Type: application/json

{"client_request_id":"demo-venta-1000","items":[{"product_id":1,"quantity":2}]}
```

**Consultar IA**

```http
POST /api/ai/ask
Authorization: Bearer <token>
Content-Type: application/json

{"question":"¿Qué medicamentos tienen mayor riesgo de vencimiento?"}
```

Los errores siguen `{ "error": "Mensaje en español" }`, con códigos HTTP 400/401/403/404/409/502 según el caso.

## Endpoints internos (NO públicos por Gateway)

El servicio llamador pasa `x-internal-key`, que solo circula por la red privada Compose:

- Catálogo: `GET /internal/products/:id`
- Inventarios: `POST /internal/reservations`, `POST /internal/reservations/:key/confirm`, `POST /internal/reservations/:key/release`, `POST /internal/batches/receive`, `GET /internal/batches`
- Ventas: `GET /internal/summary?days=30`
- IA: `POST /internal/scan` (para n8n)
