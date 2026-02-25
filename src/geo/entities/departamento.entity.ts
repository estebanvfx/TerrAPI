import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('departamentos')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'pais_id', type: 'integer' })
  countryId: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'iso2', type: 'varchar', length: 10, nullable: true })
  iso2?: string;

  @Column({ name: 'iso3166_2', type: 'varchar', length: 20, nullable: true })
  iso3166_2?: string;

  @Column({ name: 'native', type: 'varchar', length: 100, nullable: true })
  native?: string;

  @Column({ name: 'latitude', type: 'varchar', length: 50, nullable: true })
  latitude?: string;

  @Column({ name: 'longitude', type: 'varchar', length: 50, nullable: true })
  longitude?: string;

  @Column({ name: 'type', type: 'varchar', length: 50, nullable: true })
  type?: string;

  @Column({ name: 'timezone', type: 'varchar', length: 50, nullable: true })
  timezone?: string;
}
