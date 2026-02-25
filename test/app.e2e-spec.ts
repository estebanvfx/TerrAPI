import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('GeoController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ──────────────────────────────────────────────
  // GET /api/geo
  // ──────────────────────────────────────────────
  describe('/api/geo (GET)', () => {
    it('should return 200 with a string message', () => {
      return request(app.getHttpServer())
        .get('/api/geo')
        .expect(200)
        .expect((res) => {
          expect(typeof res.text).toBe('string');
        });
    });
  });

  // ──────────────────────────────────────────────
  // GET /api/geo/countries
  // ──────────────────────────────────────────────
  describe('/api/geo/countries (GET)', () => {
    it('should return 200 and an array when called without params', () => {
      return request(app.getHttpServer())
        .get('/api/geo/countries')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should filter countries by query "col"', () => {
      return request(app.getHttpServer())
        .get('/api/geo/countries')
        .query({ q: 'col' })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          for (const country of res.body) {
            expect(country).toHaveProperty('id');
            expect(country).toHaveProperty('name');
            expect(country).toHaveProperty('iso2');
          }
        });
    });

    it('should respect the limit param', () => {
      return request(app.getHttpServer())
        .get('/api/geo/countries')
        .query({ limit: 3 })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeLessThanOrEqual(3);
        });
    });

    it('should return 400 when limit is less than 1', () => {
      return request(app.getHttpServer())
        .get('/api/geo/countries')
        .query({ limit: 0 })
        .expect(400);
    });

    it('should return 400 when limit exceeds 50', () => {
      return request(app.getHttpServer())
        .get('/api/geo/countries')
        .query({ limit: 51 })
        .expect(400);
    });

    it('should return 400 when limit is not an integer', () => {
      return request(app.getHttpServer())
        .get('/api/geo/countries')
        .query({ limit: 'abc' })
        .expect(400);
    });

    it('should return 400 for unknown query params', () => {
      return request(app.getHttpServer())
        .get('/api/geo/countries')
        .query({ unknown: 'value' })
        .expect(400);
    });

    it('should return an empty array for a non-matching query', () => {
      return request(app.getHttpServer())
        .get('/api/geo/countries')
        .query({ q: 'xyznonexistent' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual([]);
        });
    });
  });

  // ──────────────────────────────────────────────
  // GET /api/geo/municipalities
  // ──────────────────────────────────────────────
  describe('/api/geo/municipalities (GET)', () => {
    it('should return 200 and an array when called without params', () => {
      return request(app.getHttpServer())
        .get('/api/geo/municipalities')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should filter municipalities by country ISO code', () => {
      return request(app.getHttpServer())
        .get('/api/geo/municipalities')
        .query({ country: 'CO', limit: 5 })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          for (const mun of res.body) {
            expect(mun).toHaveProperty('id');
            expect(mun).toHaveProperty('town');
            expect(mun).toHaveProperty('department');
            expect(mun).toHaveProperty('country');
            expect(mun).toHaveProperty('full_name');
          }
        });
    });

    it('should search municipalities by name (q param)', () => {
      return request(app.getHttpServer())
        .get('/api/geo/municipalities')
        .query({ q: 'bog', country: 'CO', limit: 5 })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          for (const mun of res.body) {
            const nameMatch =
              mun.town.toLowerCase().includes('bog') ||
              mun.department.toLowerCase().includes('bog');
            expect(nameMatch).toBe(true);
          }
        });
    });

    it('should respect the limit param', () => {
      return request(app.getHttpServer())
        .get('/api/geo/municipalities')
        .query({ limit: 2 })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeLessThanOrEqual(2);
        });
    });

    it('should return 400 when country is not a 2-char ISO code', () => {
      return request(app.getHttpServer())
        .get('/api/geo/municipalities')
        .query({ country: 'COL' })
        .expect(400);
    });

    it('should return 400 when country is only 1 character', () => {
      return request(app.getHttpServer())
        .get('/api/geo/municipalities')
        .query({ country: 'C' })
        .expect(400);
    });

    it('should return 400 when limit is less than 1', () => {
      return request(app.getHttpServer())
        .get('/api/geo/municipalities')
        .query({ limit: 0 })
        .expect(400);
    });

    it('should return 400 when limit exceeds 50', () => {
      return request(app.getHttpServer())
        .get('/api/geo/municipalities')
        .query({ limit: 51 })
        .expect(400);
    });

    it('should return 400 for unknown query params', () => {
      return request(app.getHttpServer())
        .get('/api/geo/municipalities')
        .query({ foo: 'bar' })
        .expect(400);
    });

    it('should return an empty array for a non-matching search', () => {
      return request(app.getHttpServer())
        .get('/api/geo/municipalities')
        .query({ q: 'xyznonexistent', country: 'CO' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual([]);
        });
    });

    it('should accept lowercase country ISO and still work', () => {
      return request(app.getHttpServer())
        .get('/api/geo/municipalities')
        .query({ country: 'co', limit: 3 })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  // ──────────────────────────────────────────────
  // 404 – rutas no existentes
  // ──────────────────────────────────────────────
  describe('Unknown routes', () => {
    it('should return 404 for a non-existing route', () => {
      return request(app.getHttpServer())
        .get('/api/geo/doesnotexist')
        .expect(404);
    });
  });
});
