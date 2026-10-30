import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Project } from './project.entity.js'
import { ProjectsController } from './projects.controller.js'
import { ProjectsService } from './projects.service.js'
import { AuthModule } from '../auth/auth.module.js'

@Module({
  imports: [TypeOrmModule.forFeature([Project]), AuthModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
