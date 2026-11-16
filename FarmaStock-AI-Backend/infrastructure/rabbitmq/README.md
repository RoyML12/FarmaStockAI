RabbitMQ usa el exchange `farmastock.events` (topic) creado desde `shared/index.js`.
La cola `notifications.alerts` se enlaza con `inventory.stock.low`, `inventory.expiry.risk`, `sale.completed` y `purchase.received`.
Management UI: http://localhost:15672 (usuario y clave en .env).
