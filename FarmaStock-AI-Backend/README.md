# FarmaStock AI — Backend separado

Backend del MVP académico: **Node.js/Express + 7 microservicios de arquitectura hexagonal + 7 bases MySQL + RabbitMQ + n8n + Qdrant + Docker Compose**.

Este repositorio **ya no contiene frontend**. El panel administrativo MUI y la aplicación React Native están en el ZIP independiente **FarmaStock-AI-Frontend.zip**.

## Inicio en WSL2 / Docker

```bash
cp .env.example .env
# Configura secretos y contraseñas propias en .env
docker compose up -d --build
docker compose ps
curl http://localhost:3000/health
```

Para datos ficticios de la exposición:

```bash
python3 scripts/seed_demo.py
```

Y para validación básica:

```bash
python3 scripts/verify_static.py
node --test services/ai-service/tests/riskCalculator.test.js services/inventory-service/tests/fefo.test.js
python3 scripts/smoke_api.py
```

**Rutas y contratos:** `docs/API.md`. **Arquitectura:** `docs/ARQUITECTURA.md`. **Bases:** `docs/BASES_DATOS.md`.

### Puertos locales

| Componente | Puerto |
|---|---|
| API Gateway | 3000 (publicado en host, úsalo en MUI y Expo) |
| MySQL Workbench → MySQL | 127.0.0.1:3307 |
| RabbitMQ panel | 127.0.0.1:15672 |
| n8n panel | 127.0.0.1:5678 |
| Qdrant | 127.0.0.1:6333 |

**Panel web MUI:** `npm run dev` desde `FarmaStock-AI-Frontend/web-mui/` abre `http://localhost:5173` y su proxy envía `/api` al Gateway local.

**APK React Native:** `FarmaStock-AI-Frontend/mobile/farmastock-app/`, Expo / EAS. MUI no puede usarse directamente en React Native.

**ngrok opcional:** `ngrok http 3000` (túnel al Gateway, nunca a MySQL ni n8n). **Telegram:** importa los workflows de `infrastructure/n8n/workflows/`, configura el bot y webhook; requiere Internet.

No se han ejecutado aquí todos los contenedores con Docker ni se ha compilado el APK. Es prototipo para demostración académica y requiere pruebas locales. No está certificado para uso farmacéutico real. No publiques credenciales en git, y no uses `docker compose down -v` si deseas conservar datos.
