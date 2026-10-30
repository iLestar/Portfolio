import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { Request } from 'express'

// Guard simple: exige "Authorization: Bearer <jwt>" con el secreto del .env.
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>()
    const header = req.headers.authorization ?? ''
    const [type, token] = header.split(' ')
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Falta el token de administrador')
    }
    try {
      await this.jwt.verifyAsync(token)
      return true
    } catch {
      throw new UnauthorizedException('Token inválido o expirado')
    }
  }
}
