import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ProjectsModule } from './projects/projects.module.js'
import { AuthModule } from './auth/auth.module.js'
import { ContactModule } from './contact/contact.module.js'
import { UploadsModule } from './uploads/uploads.module.js'
import { validateEnvironment } from './environment.js'
import { PublishingModule } from './publishing/publishing.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    ProjectsModule,
    AuthModule,
    ContactModule,
    UploadsModule,
    PublishingModule,
  ],
})
export class AppModule {}
