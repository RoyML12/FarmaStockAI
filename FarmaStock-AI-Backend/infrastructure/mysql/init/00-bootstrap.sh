#!/bin/bash
set -euo pipefail
mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" <<SQL
CREATE DATABASE IF NOT EXISTS db_usuarios CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS db_catalogo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS db_inventarios CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS db_compras CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS db_ventas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS db_notificaciones CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS db_predicciones CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'farm_auth'@'%' IDENTIFIED BY '${DB_AUTH_PASSWORD}';
CREATE USER IF NOT EXISTS 'farm_catalog'@'%' IDENTIFIED BY '${DB_CATALOG_PASSWORD}';
CREATE USER IF NOT EXISTS 'farm_inventory'@'%' IDENTIFIED BY '${DB_INVENTORY_PASSWORD}';
CREATE USER IF NOT EXISTS 'farm_purchase'@'%' IDENTIFIED BY '${DB_PURCHASE_PASSWORD}';
CREATE USER IF NOT EXISTS 'farm_sales'@'%' IDENTIFIED BY '${DB_SALES_PASSWORD}';
CREATE USER IF NOT EXISTS 'farm_notification'@'%' IDENTIFIED BY '${DB_NOTIFICATION_PASSWORD}';
CREATE USER IF NOT EXISTS 'farm_ai'@'%' IDENTIFIED BY '${DB_AI_PASSWORD}';
GRANT ALL PRIVILEGES ON db_usuarios.* TO 'farm_auth'@'%';
GRANT ALL PRIVILEGES ON db_catalogo.* TO 'farm_catalog'@'%';
GRANT ALL PRIVILEGES ON db_inventarios.* TO 'farm_inventory'@'%';
GRANT ALL PRIVILEGES ON db_compras.* TO 'farm_purchase'@'%';
GRANT ALL PRIVILEGES ON db_ventas.* TO 'farm_sales'@'%';
GRANT ALL PRIVILEGES ON db_notificaciones.* TO 'farm_notification'@'%';
GRANT ALL PRIVILEGES ON db_predicciones.* TO 'farm_ai'@'%';
FLUSH PRIVILEGES;
SQL
