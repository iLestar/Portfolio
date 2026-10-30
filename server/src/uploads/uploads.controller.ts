import {
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
const ALLOWED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'])

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
      limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB tope
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase()
        cb(null, ALLOWED.has(ext))
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/${file.filename}` }
  }
}
