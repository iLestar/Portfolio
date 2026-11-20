import { resolve } from 'node:path'

export function uploadsDirectory() {
  return resolve(process.env.UPLOADS_DIR || 'uploads')
}
