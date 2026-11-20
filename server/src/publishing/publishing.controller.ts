import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common'
import { IsUUID } from 'class-validator'
import { JwtAuthGuard } from '../auth/jwt.guard.js'
import { PublishingService } from './publishing.service.js'

class PublishDto { @IsUUID() revision: string }

@Controller('publishing')
@UseGuards(JwtAuthGuard)
export class PublishingController {
  constructor(private readonly publishing: PublishingService) {}
  @Get() status() { return this.publishing.status() }
  @Post('prepare') @HttpCode(202) prepare() { return this.publishing.prepare() }
  @Post('publish') @HttpCode(202) publish(@Body() dto: PublishDto) { return this.publishing.publish(dto.revision) }
  @Post('check') @HttpCode(202) check() { return this.publishing.check() }
}
