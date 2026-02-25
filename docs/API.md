# TerrAPI — Geographic REST API

> A fast, open geographic REST API for searching **countries**, **departments**, and **municipalities** with accent-insensitive, case-insensitive full-text search.

![NestJS](https://img.shields.io/badge/NestJS-11-red?logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![TypeORM](https://img.shields.io/badge/TypeORM-0.3-orange)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [API Reference](#api-reference)
  - [GET /api/geo](#get-apigeo)
  - [GET /api/geo/countries](#get-apigeocountries)
  - [GET /api/geo/municipalities](#get-apigeomunicipalities)
- [Data Models](#data-models)
  - [Country](#country)
  - [Municipality Result](#municipality-result)
- [Validation Rules](#validation-rules)
- [Error Reference](#error-reference)
- [Examples](#examples)
  - [cURL](#curl)
  - [JavaScript (fetch)](#javascript-fetch)
  - [Axios](#axios)
- [Testing](#testing)
- [Tech Stack](#tech-stack)

---

## Overview

TerrAPI exposes a simple, read-only REST API to query hierarchical geographic data organized in three levels:

```
Country  →  Department  →  Municipality
```

All text searches are **case-insensitive** and **accent-insensitive** (powered by PostgreSQL's `unaccent` extension), making it easy to search for "bogota" and match "Bogotá".

> **Authentication:** This API is fully public. No API key or token is required.

---

## Base URL

```
http://localhost:3000/api
```

> In production, replace `localhost:3000` with your deployed domain.

---

## Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | `>= 18` |
| pnpm | `>= 8` |
| PostgreSQL | `>= 14` |

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/TerrAPI.git
cd TerrAPI

# Install dependencies
pnpm install
```

### Environment Variables

Create a `.env.development.local` file in the project root:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=countries
```

> The application uses an **existing, pre-populated** database. Schema synchronization is disabled (`synchronize: false`).

### Running the App

```bash
# Development (watch mode)
pnpm run start:dev

# Production build
pnpm run build
pnpm run start:prod
```

The server will be available at `http://localhost:3000`.

---

## API Reference

### GET /api/geo

Health-check / root endpoint for the geo module.

#### Request

```
GET /api/geo
```

No parameters required.

#### Response

```
200 OK
Content-Type: text/plain
```

```
Geographic API is running.
```

---

### GET /api/geo/countries

Search and retrieve countries. Returns a list of countries optionally filtered by name.

#### Request

```
GET /api/geo/countries
```

##### Query Parameters

| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| `q` | `string` | No | 1–80 characters | Search term to filter countries by name. Case and accent-insensitive. |
| `limit` | `integer` | No | 1–50 | Maximum number of results to return. |

#### Response

```
200 OK
Content-Type: application/json
```

Returns an array of [Country](#country) objects.

```json
[
  {
    "id": 49,
    "name": "Colombia",
    "iso2": "CO"
  },
  {
    "id": 50,
    "name": "Comoros",
    "iso2": "KM"
  }
]
```

Returns an **empty array** `[]` if no results match the query — never a `404`.

---

### GET /api/geo/municipalities

Search and retrieve municipalities. Results include the department and country they belong to, plus a pre-formatted full name.

#### Request

```
GET /api/geo/municipalities
```

##### Query Parameters

| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| `country` | `string` | No | Exactly 2 characters (ISO 3166-1 alpha-2) | Filter results by country. Automatically uppercased (e.g., `co` → `CO`). |
| `q` | `string` | No | 1–100 characters | Search term to filter by municipality **or** department name. Case and accent-insensitive. |
| `limit` | `integer` | No | 1–50 | Maximum number of results to return. |

#### Response

```
200 OK
Content-Type: application/json
```

Returns an array of [Municipality Result](#municipality-result) objects.

```json
[
  {
    "id": 1001,
    "town": "Bogotá D.C.",
    "department": "Bogotá D.C.",
    "country": "Colombia",
    "full_name": "Bogotá D.C., Bogotá D.C., Colombia"
  },
  {
    "id": 1002,
    "town": "Medellín",
    "department": "Antioquia",
    "country": "Colombia",
    "full_name": "Medellín, Antioquia, Colombia"
  }
]
```

Returns an **empty array** `[]` if no results match the query — never a `404`.

---

## Data Models

### Country

Represents a sovereign country.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `integer` | Unique internal identifier |
| `name` | `string` | Official country name |
| `iso2` | `string` | ISO 3166-1 alpha-2 code (e.g., `"CO"`, `"US"`) |

```json
{
  "id": 49,
  "name": "Colombia",
  "iso2": "CO"
}
```

### Municipality Result

A flattened view of a municipality with its parent department and country resolved.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `integer` | Unique internal identifier of the municipality |
| `town` | `string` | Name of the municipality / town |
| `department` | `string` | Name of the parent department / state / region |
| `country` | `string` | Name of the parent country |
| `full_name` | `string` | Formatted string: `"Town, Department, Country"` |

```json
{
  "id": 1001,
  "town": "Bogotá D.C.",
  "department": "Bogotá D.C.",
  "country": "Colombia",
  "full_name": "Bogotá D.C., Bogotá D.C., Colombia"
}
```

---

## Validation Rules

The API applies strict validation on all query parameters. Requests with unknown parameters or invalid values are **rejected with `400 Bad Request`**.

| Endpoint | Parameter | Rule |
|----------|-----------|------|
| `/countries` | `q` | String, min 1 char, max 80 chars |
| `/countries` | `limit` | Integer, min `1`, max `50` |
| `/municipalities` | `country` | String, exactly `2` characters |
| `/municipalities` | `q` | String, min 1 char, max 100 chars |
| `/municipalities` | `limit` | Integer, min `1`, max `50` |

> Unknown query parameters (e.g., `?foo=bar`) will cause a `400` error.

---

## Error Reference

| HTTP Code | Meaning | Common Causes |
|-----------|---------|---------------|
| `200` | OK | Successful request (even if the result array is empty) |
| `400` | Bad Request | Validation failed: invalid parameter type, out-of-range value, or unknown query param |
| `404` | Not Found | Route does not exist |

### 400 Error Example

```json
{
  "message": [
    "limit must not be greater than 50",
    "limit must be an integer number"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## Examples

### cURL

**Search all countries:**
```bash
curl "http://localhost:3000/api/geo/countries"
```

**Search countries matching "col":**
```bash
curl "http://localhost:3000/api/geo/countries?q=col"
```

**Get first 5 countries:**
```bash
curl "http://localhost:3000/api/geo/countries?limit=5"
```

**Search municipalities in Colombia:**
```bash
curl "http://localhost:3000/api/geo/municipalities?country=CO"
```

**Search municipalities with "medellin" (accent-insensitive):**
```bash
curl "http://localhost:3000/api/geo/municipalities?q=medellin&country=CO&limit=10"
```

---

### JavaScript (fetch)

```js
// Search countries by name
const response = await fetch('http://localhost:3000/api/geo/countries?q=colombia&limit=5');
const countries = await response.json();
console.log(countries);

// Search municipalities in Colombia
const url = new URL('http://localhost:3000/api/geo/municipalities');
url.searchParams.set('country', 'CO');
url.searchParams.set('q', 'bogota');
url.searchParams.set('limit', '10');

const res = await fetch(url.toString());
const municipalities = await res.json();
console.log(municipalities);
```

---

### Axios

```js
import axios from 'axios';

const client = axios.create({ baseURL: 'http://localhost:3000/api' });

// Search countries
const { data: countries } = await client.get('/geo/countries', {
  params: { q: 'colombia', limit: 5 },
});

// Search municipalities
const { data: municipalities } = await client.get('/geo/municipalities', {
  params: { country: 'CO', q: 'bogota', limit: 10 },
});
```

---

## Testing

The project includes a full **End-to-End (E2E)** test suite with 21 test cases covering all endpoints, success paths, error cases, and edge cases.

```bash
# Run E2E tests
pnpm run test:e2e

# Run unit tests
pnpm run test

# Run unit tests in watch mode
pnpm run test:watch

# Generate coverage report
pnpm run test:cov
```

### Test Coverage Overview

| Suite | Tests |
|-------|-------|
| `GET /api/geo` | 1 |
| `GET /api/geo/countries` | 8 |
| `GET /api/geo/municipalities` | 11 |
| Non-existing routes (404) | 1 |
| **Total** | **21** |

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | [NestJS](https://nestjs.com/) 11 |
| Language | TypeScript 5 |
| Runtime | Node.js >= 18 |
| Database | PostgreSQL 14+ |
| ORM | TypeORM 0.3 |
| Validation | class-validator + class-transformer |
| Testing | Jest + Supertest |
| Package Manager | pnpm |
| Code Style | ESLint + Prettier |

---

<p align="center">
  Built with NestJS &amp; PostgreSQL
</p>
