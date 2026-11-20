import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { resolve } from 'node:path'
import { JsonFile } from '../json-file.js'
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'
import type { Message } from './message.js'
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
  private readonly messages: JsonFile<Message>
  constructor(config: ConfigService) {
    this.messages = new JsonFile(resolve(config.get<string>('DATA_DIR', 'data'), 'messages.json'))
  }

  // Compatibilidad con clientes que envíen mensajes a la API.
  @Post('contact')
  async send(@Body() dto: ContactDto) {
    await this.messages.update((data) => {
      data.items.push({ id: data.nextId++, name: dto.name, email: dto.email, body: dto.message, read: false, createdAt: new Date().toISOString() })
    })
    return { ok: true }
  }

  // Admin: bandeja de mensajes recibidos.
  @Get('messages')
  @UseGuards(JwtAuthGuard)
  async inbox() {
    return (await this.messages.read()).items.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id)
  }
}
