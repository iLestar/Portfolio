import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { compareSync } from 'bcryptjs'
import { IsString, MinLength } from 'class-validator'

class LoginDto {
  @IsString()
  @MinLength(1)
  user: string

  @IsString()
  @MinLength(1)
  password: string
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // POST /api/auth/login → { token }
  // ADMIN_PASSWORD admite texto plano en dev o hash bcrypt (empieza por $2).
  @Post('login')
  login(@Body() dto: LoginDto) {
    const user = this.config.get<string>('ADMIN_USER', 'let')
    const pass = this.config.get<string>('ADMIN_PASSWORD', 'cambia_esto')

    const passwordOk = pass.startsWith('$2')
      ? compareSync(dto.password, pass)
      : dto.password === pass

    if (dto.user !== user || !passwordOk) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos')
    }
    return { token: this.jwt.sign({ sub: user, role: 'admin' }) }
  }
}
