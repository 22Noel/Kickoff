# Kickoff

kickoff es una aplicación web (y próximamente móvil) que permite a los usuarios crear partidos y ligas con sus amigos, llevar recuento de goles y almacenar sus resultados.

## Arquitectura

- **Backend:** API REST desarrollada con Node, Oak y Drizzle ORM, usando PostgreSQL como base de datos.
- **Frontend:** React + Vite + Material UI.

## Requisitos previos

- Node.js >= 18
- Deno >= 1.40
- PostgreSQL >= 14

## Instalación y ejecución

### Frontend

```bash
cd webapp
npm install
npm run dev
```

### Backend

```bash
cd kickoff-api
npm start
```

Para modo depuración:

```bash
deno task debug
```

## Migraciones y base de datos

Asegúrate de que la base de datos PostgreSQL esté corriendo y la conexión en `drizzle.config.ts` sea correcta.

Si cambias el esquema (por ejemplo, eliminando o agregando columnas), actualiza la base de datos manualmente o usando migraciones SQL. Ejemplo para eliminar una columna obsoleta:

```sql
ALTER TABLE "match" DROP COLUMN IF EXISTS "creatorUsername";
```

## Flujo de trabajo recomendado

1. Inicia PostgreSQL.
2. Inicia el backend (`deno task dev`).
3. Inicia el frontend (`npm run dev` en `webapp`).
4. Accede a `http://localhost:5173`.

## Despliegue con Docker

El proyecto incluye configuraciones Docker para facilitar el despliegue:

```bash
docker-compose up -d
```

### Uso con Docker

1. Copia `sample.env` a `.env` y ajusta las variables según necesites.
2. Ejecuta `docker-compose up -d` para iniciar todos los servicios.
3. Accede a la aplicación web en `http://localhost:80`.

## CI/CD con GitHub Actions

El proyecto incluye un flujo de trabajo de GitHub Actions para construir y desplegar automáticamente las imágenes Docker cuando se hacen cambios en la rama `main`.

### Configuración de secretos

Para utilizar el flujo de trabajo de CI/CD, necesitas configurar los siguientes secretos en tu repositorio de GitHub:

1. `DOCKERHUB_USERNAME`: Tu nombre de usuario de Docker Hub.
2. `DOCKERHUB_TOKEN`: Un token de acceso de Docker Hub (no tu contraseña).
3. `API_URL`: La URL de tu API en producción (por ejemplo, `https://api.kickoff.com/api`).
4. `POSTGRES_USER`: Usuario de PostgreSQL para pruebas.
5. `POSTGRES_PASSWORD`: Contraseña de PostgreSQL para pruebas.

Para despliegue automático:

1. `DEPLOY_HOST`: La dirección IP o dominio del servidor de producción.
2. `DEPLOY_USERNAME`: El nombre de usuario SSH para acceder al servidor.
3. `DEPLOY_SSH_KEY`: La clave SSH privada para acceder al servidor.
4. `DEPLOY_PORT`: El puerto SSH (generalmente 22).

### Personalización del despliegue

Modifica el script en `.github/workflows/docker-image.yml` para adaptar el despliegue a tu entorno específico.

---

Para dudas o contribuciones, abre un issue o pull request.
