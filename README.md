# TerrAPI

[![en](https://img.shields.io/badge/lang-en-blue)](README.en.md)

API REST de datos geográficos (países, departamentos y municipios) construida con [NestJS](https://nestjs.com/), TypeORM y PostgreSQL.

## Requisitos previos

- **Node.js** >= 18
- **pnpm**
- **PostgreSQL** con la base de datos ya poblada
- Archivos de entorno (`.env`, `.env.development`, `.env.development.local`) con las variables de conexión:

| Archivo                  | Uso                                          |
| ------------------------ | -------------------------------------------- |
| `.env`                   | Variables base / producción                  |
| `.env.development`       | Variables para entorno de desarrollo         |
| `.env.development.local` | Overrides locales (cargado por ConfigModule) |

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=tu_base_de_datos
```

> La app carga `.env.development.local` por defecto vía `ConfigModule`. Los valores en archivos más específicos sobreescriben los anteriores.

## Instalación

```bash
pnpm install
```

## Ejecutar la aplicación

```bash
# desarrollo
pnpm run start

# watch mode
pnpm run start:dev

# producción
pnpm run start:prod
```

La API estará disponible en `http://localhost:3000` con el prefijo global `/api`.

## Endpoints

### `GET /api/geo`

Endpoint raíz del módulo geográfico.

### `GET /api/geo/countries`

Busca países.

| Parámetro | Tipo   | Requerido | Descripción                   |
| --------- | ------ | --------- | ----------------------------- |
| `q`       | string | No        | Texto de búsqueda por nombre  |
| `limit`   | number | No        | Máximo de resultados (1 – 50) |

**Respuesta:**

```json
[{ "id": 1, "name": "Colombia", "iso2": "CO" }]
```

### `GET /api/geo/municipalities`

Busca municipios con joins a departamento y país.

| Parámetro | Tipo   | Requerido | Descripción                              |
| --------- | ------ | --------- | ---------------------------------------- |
| `country` | string | No        | Código ISO2 del país (2 caracteres)      |
| `q`       | string | No        | Búsqueda por nombre de municipio o depto |
| `limit`   | number | No        | Máximo de resultados (1 – 50)            |

**Respuesta:**

```json
[
  {
    "id": 123,
    "town": "Bogotá D.C.",
    "department": "Bogotá D.C.",
    "country": "Colombia",
    "full_name": "Bogotá D.C., Bogotá D.C., Colombia"
  }
]
```

## Validación

La API usa `class-validator` con `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`). Los parámetros inválidos o desconocidos devuelven un error **400 Bad Request**.

## Tests

```bash
# tests unitarios
pnpm run test

# tests e2e (requiere PostgreSQL corriendo)
pnpm run test:e2e

# cobertura
pnpm run test:cov
```

### Tests E2E incluidos

Los tests e2e (`test/app.e2e-spec.ts`) validan los tres endpoints con **21 casos**:

| Endpoint                      | Tests |
| ----------------------------- | ----- |
| `GET /api/geo`                | 1     |
| `GET /api/geo/countries`      | 8     |
| `GET /api/geo/municipalities` | 11    |
| Rutas desconocidas (404)      | 1     |

Cubren: respuestas exitosas, estructura de datos, límites, validación de parámetros (tipo, rango, formato ISO2), parámetros desconocidos, búsquedas sin resultados y case-insensitivity del ISO.

## Tech Stack

- **NestJS** 11
- **TypeORM** 0.3
- **PostgreSQL** (driver `pg`)
- **class-validator** + **class-transformer**
- **Jest** + **Supertest** (testing)

## Licencia

[MIT](LICENSE)
