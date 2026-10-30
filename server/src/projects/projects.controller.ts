import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'
import { ProjectsService } from './projects.service.js'
import { CreateProjectDto, UpdateProjectDto } from './dto.js'
import { JwtAuthGuard } from '../auth/jwt.guard.js'

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  // ---- Público ----
  @Get()
  list() {
    return this.projects.findPublished()
  }

  @Get('featured')
  featured() {
    return this.projects.findFeatured()
  }

  // ---- Admin (JWT) — va antes de :slug para no colisionar ----
  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  listAll() {
    return this.projects.findAll()
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateProjectDto) {
    return this.projects.create(dto)
  }

  @Put('admin/:id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProjectDto) {
    return this.projects.update(id, dto)
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.projects.remove(id)
  }

  // ---- Público por slug (último: atrapa cualquier segmento) ----
  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.projects.findBySlug(slug)
  }
}
