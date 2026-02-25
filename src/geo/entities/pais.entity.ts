import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('paises')
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'iso2', type: 'char', length: 2 })
  iso2: string;

  @Column({ name: 'iso3', type: 'char', length: 3 })
  iso3: string;
}
