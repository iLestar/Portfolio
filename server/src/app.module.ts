import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProjectsModule } from './projects/projects.module.js'
import { AuthModule } from './auth/auth.module.js'
import { ContactModule } from './contact/contact.module.js'
import { UploadsModule } from './uploads/uploads.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USER', 'lestar'),
        password: config.get<string>('DB_PASSWORD', 'lestar_dev'),
        database: config.get<string>('DB_NAME', 'portfolio'),
        autoLoadEntities: true,
        // synchronize crea/ajusta tablas automáticamente.
        // Cómodo en desarrollo; en producción se apaga y se usan migraciones.
        synchronize: true,
      }),
    }),
    ProjectsModule,
    AuthModule,
    ContactModule,
    UploadsModule,
  ],
})
export class AppModule {}
