import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('municipios')
export class Municipality {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'departamento_id', type: 'integer' })
  departmentId: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'latitude', type: 'varchar', length: 50, nullable: true })
  latitude?: string;

  @Column({ name: 'longitude', type: 'varchar', length: 50, nullable: true })
  longitude?: string;

  @Column({ name: 'timezone', type: 'varchar', length: 50, nullable: true })
  timezone?: string;

  @Column({ name: 'codigo_dane', type: 'varchar', length: 10, nullable: true })
  daneCode?: string;

  @Column({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt?: Date;

  @Column({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt?: Date;
}
