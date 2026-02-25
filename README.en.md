# TerrAPI

[![es](https://img.shields.io/badge/lang-es-red)](README.md)

REST API for geographic data (countries, departments, and municipalities) built with [NestJS](https://nestjs.com/), TypeORM, and PostgreSQL.

## Prerequisites

- **Node.js** >= 18
- **pnpm**
- **PostgreSQL** with a pre-populated database
- Environment files (`.env`, `.env.development`, `.env.development.local`) with connection variables:

| File                     | Purpose                                  |
| ------------------------ | ---------------------------------------- |
| `.env`                   | Base / production variables              |
| `.env.development`       | Development environment variables        |
| `.env.development.local` | Local overrides (loaded by ConfigModule) |

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_user
DB_PASSWORD=your_password
DB_NAME=your_database
```

> The app loads `.env.development.local` by default via `ConfigModule`. Values in more specific files override the previous ones.

## Installation

```bash
pnpm install
```

## Running the Application

```bash
# development
pnpm run start

# watch mode
pnpm run start:dev

# production
pnpm run start:prod
```

The API will be available at `http://localhost:3000` with the global prefix `/api`.

## Endpoints

### `GET /api/geo`

Root endpoint of the geographic module.

### `GET /api/geo/countries`

Search for countries.

| Parameter | Type   | Required | Description                      |
| --------- | ------ | -------- | -------------------------------- |
| `q`       | string | No       | Search text by name              |
| `limit`   | number | No       | Maximum number of results (1–50) |

**Response:**

```json
[{ "id": 1, "name": "Colombia", "iso2": "CO" }]
```

### `GET /api/geo/municipalities`

Search for municipalities with joins to department and country.

| Parameter | Type   | Required | Description                               |
| --------- | ------ | -------- | ----------------------------------------- |
| `country` | string | No       | ISO2 country code (2 characters)          |
| `q`       | string | No       | Search by municipality or department name |
| `limit`   | number | No       | Maximum number of results (1–50)          |

**Response:**

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

## Validation

The API uses `class-validator` with `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`). Invalid or unknown parameters return a **400 Bad Request** error.

## Tests

```bash
# unit tests
pnpm run test

# e2e tests (requires PostgreSQL running)
pnpm run test:e2e

# coverage
pnpm run test:cov
```

### Included E2E Tests

The e2e tests (`test/app.e2e-spec.ts`) validate all three endpoints with **21 test cases**:

| Endpoint                      | Tests |
| ----------------------------- | ----- |
| `GET /api/geo`                | 1     |
| `GET /api/geo/countries`      | 8     |
| `GET /api/geo/municipalities` | 11    |
| Unknown routes (404)          | 1     |

They cover: successful responses, data structure, limits, parameter validation (type, range, ISO2 format), unknown parameters, empty result searches, and ISO case-insensitivity.

## Tech Stack

- **NestJS** 11
- **TypeORM** 0.3
- **PostgreSQL** (`pg` driver)
- **class-validator** + **class-transformer**
- **Jest** + **Supertest** (testing)

## License

[MIT](LICENSE)
