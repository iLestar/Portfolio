import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'
import { Message } from './message.entity.js'
import { JwtAuthGuard } from '../auth/jwt.guard.js'

class ContactDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string

  @IsEmail()
  @MaxLength(200)
  email: string

  @IsString()
  @MinLength(5)
  @MaxLength(5000)
  message: string
}

@Controller()
export class ContactController {
  constructor(
    @InjectRepository(Message)
    private readonly messages: Repository<Message>,
  ) {}

  // Público: el formulario de contacto guarda el mensaje en MySQL.
  @Post('contact')
  async send(@Body() dto: ContactDto) {
    await this.messages.save({ name: dto.name, email: dto.email, body: dto.message })
    return { ok: true }
  }

  // Admin: bandeja de mensajes recibidos.
  @Get('messages')
  @UseGuards(JwtAuthGuard)
  inbox() {
    return this.messages.find({ order: { createdAt: 'DESC' } })
  }
}
