import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { AppModule } from './app.module.js'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  // Todas las rutas bajo /api (el proxy de Vite ya apunta ahí).
  app.setGlobalPrefix('api')
  app.enableCors()
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  )

  // Las imágenes que sube el admin se sirven en /uploads/*
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' })

  const port = Number(process.env.PORT ?? 3000)
  await app.listen(port)
  console.log(`API lista en http://localhost:${port}/api`)
}
bootstrap()
