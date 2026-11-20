import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { ProjectsModule } from '../projects/projects.module.js'
import { PublishingController } from './publishing.controller.js'
import { PublishingService } from './publishing.service.js'

@Module({ imports: [AuthModule, ProjectsModule], controllers: [PublishingController], providers: [PublishingService] })
export class PublishingModule {}
