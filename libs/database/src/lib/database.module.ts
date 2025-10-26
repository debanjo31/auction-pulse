import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // 1. We import ConfigModule to read from a .env file.
    // We make it global so any module importing DatabaseModule
    // also gets access to the .env variables.
    ConfigModule.forRoot({
      isGlobal: true,
      // Point to the .env file at the root of the monorepo
      envFilePath: '.env',
    }),

    // 2. Use forRootAsync to dynamically configure TypeORM
    TypeOrmModule.forRootAsync({
      // 3. We must import ConfigModule here so we can inject ConfigService
      imports: [ConfigModule],
      // 4. Inject the ConfigService
      inject: [ConfigService],
      // 5. useFactory provides the configuration at runtime
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),

        // This is the key! It will automatically load all entities
        // that are registered with `TypeOrmModule.forFeature()`
        // in any module that imports this DatabaseModule.
        autoLoadEntities: true,

        // Set to false in production!
        synchronize: configService.get<boolean>('DB_SYNC', false),
      }),
    }),
  ],
  // 6. We MUST export TypeOrmModule so that other modules
  // can use TypeOrmModule.forFeature() and @InjectRepository()
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
