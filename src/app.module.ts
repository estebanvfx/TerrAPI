import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeoModule } from './geo/geo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.development.local, .env.development, .env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        //NOTE: la db ya existe, no queremos que se sincronice ni que se borre nada
        synchronize: false, // Set to true only in development

        extra: {
          max: 20, // máximo de conexiones
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 30000,
        },

        maxQueryExecutionTime: 1000,
      }),
    }),
    GeoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
