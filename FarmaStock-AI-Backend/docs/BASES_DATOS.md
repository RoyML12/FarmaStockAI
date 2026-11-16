# Bases de datos MySQL (7 esquemas lógicos)

| DB | Tablas |
|---|---|
| `db_usuarios` | `users` |
| `db_catalogo` | `categories`, `products` |
| `db_inventarios` | `warehouses`, `batches`, `stock_movements`, `reservations`, `reservation_items` |
| `db_compras` | `suppliers`, `purchase_orders`, `purchase_order_items` |
| `db_ventas` | `sales`, `sale_items` |
| `db_notificaciones` | `notifications`, `notification_deliveries` |
| `db_predicciones` | `forecast_runs`, `expiry_risks` |

Cada schema se crea en `infrastructure/mysql/init`. Los IDs de otras bases (por ejemplo `batches.product_id`) son referencias lógicas, **no llaves foráneas entre microservicios**. Los `FOREIGN KEY` locales solo usan tablas del mismo schema.

## Workbench

Crea una nueva conexión TCP/IP con `Hostname: 127.0.0.1`, `Port: 3307`, `Username: root` y la contraseña `MYSQL_ROOT_PASSWORD` del archivo `.env`. Si Docker corre dentro de WSL2 con NAT puro en vez de Docker Desktop, necesitarás el forwarding de WSL hacia Windows (consulta README). No mezcles estos esquemas con otras bases preexistentes.

## Backups de demo

Ejemplo: `docker compose exec -T mysql mysqldump -uroot -p'TU_PASSWORD' --databases db_usuarios db_catalogo db_inventarios db_compras db_ventas db_notificaciones db_predicciones > farmastock_backup.sql`. Guarda el respaldo fuera del repositorio y nunca lo subas a Git si contiene información sensible.
