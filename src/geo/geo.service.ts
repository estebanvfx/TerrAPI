import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Municipality } from './entities/municipio.entity';
import { Department } from './entities/departamento.entity';
import { Country } from './entities/pais.entity';

@Injectable()
export class GeoService {
  constructor(private readonly dataSource: DataSource) {}
  //NOTE: Este método es solo para pruebas, no se expone en el controlador ni se documenta en la API, ya que no es eficiente para producción. Se deja aquí solo como referencia de cómo hacer consultas con TypeORM usando QueryBuilder.
  //PD: ESTO ME MATO LA PC XD, HICE UNA CONSULTA SIN FILTRO Y ME QUEDÉ SIN MEMORIA RAM, ASÍ QUE LO COMENTÉ PARA EVITAR PROBLEMAS, PERO LO DEJO AQUÍ PORQUE ES UN EJEMPLO DE CONSULTA CON JOINs USANDO TYPEORM.
  async findAllMunicipalities() {
    const rows = await this.dataSource
      .createQueryBuilder()
      .select('m.id', 'id')
      .addSelect('m.name', 'town')
      .addSelect('d.name', 'department')
      .addSelect('c.name', 'country')
      .from(Municipality, 'm')
      .innerJoin(Department, 'd', 'd.id = m.departmentId')
      .innerJoin(Country, 'c', 'c.id = d.countryId')
      .orderBy('m.name', 'ASC')
      .getRawMany<{
        id: number;
        town: string;
        department: string;
        country: string;
      }>();

    return rows.map((r) => ({
      id: r.id,
      town: r.town,
      department: r.department,
      country: r.country,
      full_name: `${r.town}, ${r.department}, ${r.country}`,
    }));
  }

  async searchMunicipalitiesByCountry(
    countryIso?: string,
    query?: string,
    limit?: number,
  ) {
    // Normalizar parámetros UNA VEZ para mejor rendimiento
    const normalizedCountryIso = countryIso?.toUpperCase().trim();
    const normalizedQuery = query?.trim();
    const finalLimit = limit ? Math.min(Math.max(limit, 1), 100) : 50;

    const qb = this.dataSource
      .createQueryBuilder()
      .select('m.id', 'id')
      .addSelect('m.name', 'town')
      .addSelect('d.name', 'department')
      .addSelect('c.name', 'country')
      .from(Municipality, 'm')
      .innerJoin(Department, 'd', 'd.id = m.departmentId')
      .innerJoin(Country, 'c', 'c.id = d.countryId');

    // Usar índice en iso2 (case-sensitive, ya normalizado)
    if (normalizedCountryIso) {
      qb.where('c.iso2 = :iso', { iso: normalizedCountryIso });
    }

    // Búsqueda insensible a mayúsculas/minúsculas y tildes.
    if (normalizedQuery) {
      qb.andWhere(
        '(unaccent(LOWER(m.name)) LIKE unaccent(LOWER(:q)) OR unaccent(LOWER(d.name)) LIKE unaccent(LOWER(:q)))',
        {
          q: `%${normalizedQuery}%`,
        },
      );
    }

    qb.orderBy('m.name', 'ASC').limit(finalLimit);

    const rows = await qb.getRawMany<{
      id: number;
      town: string;
      department: string;
      country: string;
    }>();

    return rows.map((r) => ({
      id: r.id,
      town: r.town,
      department: r.department,
      country: r.country,
      full_name: `${r.town}, ${r.department}, ${r.country}`,
    }));
  }

  async searchCountries(q?: string, limit?: number) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('c.id', 'id')
      .addSelect('c.name', 'name')
      .addSelect('c.iso2', 'iso2')
      .from(Country, 'c');

    if (q?.trim()) {
      qb.where('unaccent(LOWER(c.name)) LIKE unaccent(LOWER(:q))', {
        q: `%${q.trim()}%`,
      });
    }

    if (limit) {
      qb.orderBy('c.name', 'ASC').limit(Math.min(Math.max(limit, 1), 50));
    }

    return qb.getRawMany();
  }
}
