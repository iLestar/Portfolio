import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { JwtAuthGuard } from '../auth/jwt.guard.js'

const UPLOADS_DIR = join(process.cwd(), 'uploads')
// Imágenes (portadas, secciones) + adjuntos de proyecto (PDF, fuentes de diseño).
// Un .indd/.ai/.psd no se puede previsualizar en el navegador: se ofrece descargable.
const ALLOWED = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif',
  '.pdf', '.indd', '.idml', '.ai', '.psd', '.zip',
])

// POST /api/upload (admin) → { url: "/uploads/<archivo>" }
// Los archivos se sirven estáticos desde server/uploads (ver main.ts).
@Controller('upload')
export class UploadsController {
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true })
          cb(null, UPLOADS_DIR)
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase()
          cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`)
        },
      }),
      limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB tope (un .indd pesa)
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase()
        // Rechazar con 400 legible: cb(null, false) dejaría file=undefined
        // y el endpoint explotaría con un 500 crudo.
        if (!ALLOWED.has(ext)) {
          cb(new BadRequestException(`Tipo de archivo no permitido: ${ext || '(sin extensión)'}`), false)
          return
        }
        cb(null, true)
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se recibió archivo')
    // name = nombre original: el admin lo usa como etiqueta del adjunto.
    return { url: `/uploads/${file.filename}`, name: file.originalname }
  }
}
