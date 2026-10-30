import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Message } from './message.entity.js'
import { ContactController } from './contact.controller.js'
import { AuthModule } from '../auth/auth.module.js'

@Module({
  imports: [TypeOrmModule.forFeature([Message]), AuthModule],
  controllers: [ContactController],
})
export class ContactModule {}
