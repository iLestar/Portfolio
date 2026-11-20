import { copyFile, mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { randomUUID } from 'node:crypto'

export interface JsonData<T> { nextId: number; items: T[] }

// Un solo proceso de API: cola de escrituras y reemplazo atómico del archivo.
export class JsonFile<T extends { id: number }> {
  private queue: Promise<unknown> = Promise.resolve()
  constructor(readonly path: string) {}

  async read(): Promise<JsonData<T>> {
    const data = JSON.parse(await readFile(this.path, 'utf8')) as JsonData<T>
    if (!Array.isArray(data.items) || !Number.isSafeInteger(data.nextId) || data.nextId < 1 || data.items.some((item) => !Number.isSafeInteger(item.id) || item.id < 1 || item.id >= data.nextId) || new Set(data.items.map((item) => item.id)).size !== data.items.length) {
      throw new Error(`Archivo JSON inválido: ${this.path}. Restaura su respaldo antes de continuar.`)
    }
    return data
  }

  update<R>(change: (data: JsonData<T>) => R | Promise<R>, afterWrite?: (data: JsonData<T>) => Promise<void>): Promise<R> {
    const operation = this.queue.then(async () => {
      const data = await this.read()
      const result = await change(data)
      await writeJson(this.path, data, true)
      await afterWrite?.(data)
      return result
    })
    this.queue = operation.catch(() => {})
    return operation
  }
}

export async function writeJson(path: string, value: unknown, backup = false) {
  await mkdir(dirname(path), { recursive: true })
  const temporary = `${path}.${randomUUID()}.tmp`
  try {
    await writeFile(temporary, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 })
    if (backup) await copyFile(path, `${path}.bak`)
    await rename(temporary, path)
  } finally {
    await unlink(temporary).catch((error: NodeJS.ErrnoException) => { if (error.code !== 'ENOENT') throw error })
  }
}
