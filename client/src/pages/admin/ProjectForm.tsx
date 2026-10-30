import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { admin } from '../../api'
import type { AdminProject, ProjectPayload } from '../../api'
import type { Attachment, ProcessSection } from '../../data/projects'

const SECTION_KEYS = ['briefing', 'bocetos', 'decisiones', 'resultado'] as const
const CATEGORIES = ['branding', 'ilustracion', 'editorial', 'otros'] as const

interface FormState {
  slug: string
  title: string
  year: number
  category: string
  kind: 'result' | 'process'
  cover: string | null
  tools: string // csv en el form, array en el API
  summaryEs: string
  summaryEn: string
  bodyEs: string
  bodyEn: string
  sections: { key: ProcessSection['key']; image: string | null; es: string; en: string }[]
  attachments: Attachment[]
  featured: boolean
  published: boolean
  sortOrder: number
}

const empty: FormState = {
  slug: '',
  title: '',
  year: new Date().getFullYear(),
  category: 'branding',
  kind: 'result',
  cover: null,
  tools: '',
  summaryEs: '',
  summaryEn: '',
  bodyEs: '',
  bodyEn: '',
  sections: SECTION_KEYS.map((key) => ({ key, image: null, es: '', en: '' })),
  attachments: [],
  featured: false,
  published: true,
  sortOrder: 0,
}

// Aplana el modelo anidado del API al modelo plano del formulario.
function toForm(p: AdminProject): FormState {
  return {
    slug: p.slug,
    title: p.title,
    year: p.year,
    category: p.category,
    kind: p.kind,
    cover: p.cover ?? null,
    tools: p.tools.join(', '),
    summaryEs: p.summary.es,
    summaryEn: p.summary.en,
    bodyEs: p.body?.es ?? '',
    bodyEn: p.body?.en ?? '',
    sections: SECTION_KEYS.map((key) => {
      const s = p.sections?.find((x) => x.key === key)
      return {
        key,
        image: s?.image ?? null,
        es: s?.body.es ?? '',
        en: s?.body.en ?? '',
      }
    }),
    attachments: p.attachments ?? [],
    featured: p.featured,
    published: p.published,
    sortOrder: p.sortOrder,
  }
}

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// Formulario de creación/edición — el panel completo de un proyecto.
export default function ProjectForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const [f, setF] = useState<FormState>(empty)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState('')

  useEffect(() => {
    if (!editing) return
    admin
      .list()
      .then((all) => {
        const p = all.find((x) => x.id === Number(id))
        if (p) setF(toForm(p))
      })
      .catch((e) => setError(String(e)))
  }, [id, editing])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setF((prev) => ({ ...prev, [key]: value }))

  async function uploadImage(file: File, apply: (url: string) => void) {
    setUploading(file.name)
    try {
      const { url } = await admin.upload(file)
      apply(url)
    } catch (e) {
      setError(`Subida falló: ${e}`)
    } finally {
      setUploading('')
    }
  }

  // Adjunta cualquier archivo permitido (PDF, INDD, AI, PSD, ZIP)
  // y lo agrega a la lista con su nombre original como etiqueta.
  async function uploadAttachment(file: File) {
    setUploading(file.name)
    try {
      const { url, name } = await admin.upload(file)
      set('attachments', [...f.attachments, { url, name }])
    } catch (e) {
      setError(`Subida falló: ${e}`)
    } finally {
      setUploading('')
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload: ProjectPayload = {
      slug: f.slug || slugify(f.title),
      title: f.title,
      year: f.year,
      category: f.category,
      kind: f.kind,
      cover: f.cover,
      tools: f.tools.split(',').map((x) => x.trim()).filter(Boolean),
      summaryEs: f.summaryEs,
      summaryEn: f.summaryEn,
      bodyEs: f.bodyEs || null,
      bodyEn: f.bodyEn || null,
      // Las secciones solo viajan si la ficha es de proceso
      sections: f.kind === 'process' ? f.sections : null,
      attachments: f.attachments.length ? f.attachments : null,
      featured: f.featured,
      published: f.published,
      sortOrder: f.sortOrder,
    }
    try {
      if (editing) await admin.update(Number(id), payload)
      else await admin.create(payload)
      navigate('/admin/panel')
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  const img = (url: string | null, label: string) =>
    url ? (
      <img className="admin-thumb" src={url} alt={label} />
    ) : (
      <span className="mono">sin imagen</span>
    )

  return (
    <section className="wrap page">
      <header className="page__head">
        <h1 className="page__title">{editing ? 'Editar' : 'Nuevo'} proyecto</h1>
        <button className="mono admin-bar__link" onClick={() => navigate('/admin/panel')}>
          ← Volver
        </button>
      </header>

      <form className="form admin-form" onSubmit={onSubmit}>
        <div className="admin-form__row">
          <label className="form__field">
            <span className="mono">Título *</span>
            <input
              value={f.title}
              onChange={(e) => {
                set('title', e.target.value)
                if (!editing) set('slug', slugify(e.target.value))
              }}
              required
            />
          </label>
          <label className="form__field">
            <span className="mono">Slug (URL)</span>
            <input
              value={f.slug}
              onChange={(e) => set('slug', slugify(e.target.value))}
              required
            />
          </label>
        </div>

        <div className="admin-form__row">
          <label className="form__field">
            <span className="mono">Año *</span>
            <input
              type="number"
              value={f.year}
              onChange={(e) => set('year', Number(e.target.value))}
              required
            />
          </label>
          <label className="form__field">
            <span className="mono">Categoría *</span>
            <select value={f.category} onChange={(e) => set('category', e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="form__field">
            <span className="mono">Tipo de ficha *</span>
            <select
              value={f.kind}
              onChange={(e) => set('kind', e.target.value as FormState['kind'])}
            >
              <option value="result">Resultado final</option>
              <option value="process">Proceso completo</option>
            </select>
          </label>
          <label className="form__field">
            <span className="mono">Orden</span>
            <input
              type="number"
              value={f.sortOrder}
              onChange={(e) => set('sortOrder', Number(e.target.value))}
            />
          </label>
        </div>

        <label className="form__field">
          <span className="mono">Herramientas (separadas por coma)</span>
          <input
            value={f.tools}
            onChange={(e) => set('tools', e.target.value)}
            placeholder="Illustrator, Photoshop"
          />
        </label>

        <div className="form__field">
          <span className="mono">Portada</span>
          <div className="admin-img-row">
            {img(f.cover, 'Portada')}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) uploadImage(file, (url) => set('cover', url))
              }}
            />
            {f.cover && (
              <button type="button" className="mono admin-bar__link danger" onClick={() => set('cover', null)}>
                Quitar
              </button>
            )}
          </div>
        </div>

        <label className="form__field">
          <span className="mono">Resumen ES *</span>
          <textarea rows={2} value={f.summaryEs} onChange={(e) => set('summaryEs', e.target.value)} required />
        </label>
        <label className="form__field">
          <span className="mono">Resumen EN *</span>
          <textarea rows={2} value={f.summaryEn} onChange={(e) => set('summaryEn', e.target.value)} required />
        </label>
        <label className="form__field">
          <span className="mono">Texto largo ES</span>
          <textarea rows={4} value={f.bodyEs} onChange={(e) => set('bodyEs', e.target.value)} />
        </label>
        <label className="form__field">
          <span className="mono">Texto largo EN</span>
          <textarea rows={4} value={f.bodyEn} onChange={(e) => set('bodyEn', e.target.value)} />
        </label>

        {f.kind === 'process' && (
          <fieldset className="admin-sections">
            <legend className="mono">Secciones del proceso</legend>
            {f.sections.map((s, i) => (
              <div key={s.key} className="admin-section">
                <h3 className="mono">{s.key}</h3>
                <div className="admin-img-row">
                  {img(s.image, s.key)}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      uploadImage(file, (url) =>
                        set('sections', f.sections.map((x, j) => (j === i ? { ...x, image: url } : x))),
                      )
                    }}
                  />
                </div>
                <label className="form__field">
                  <span className="mono">ES</span>
                  <textarea
                    rows={2}
                    value={s.es}
                    onChange={(e) =>
                      set('sections', f.sections.map((x, j) => (j === i ? { ...x, es: e.target.value } : x)))
                    }
                  />
                </label>
                <label className="form__field">
                  <span className="mono">EN</span>
                  <textarea
                    rows={2}
                    value={s.en}
                    onChange={(e) =>
                      set('sections', f.sections.map((x, j) => (j === i ? { ...x, en: e.target.value } : x)))
                    }
                  />
                </label>
              </div>
            ))}
          </fieldset>
        )}

        <fieldset className="admin-sections">
          <legend className="mono">Archivos adjuntos (PDF, INDD, AI, PSD, ZIP)</legend>
          {f.attachments.map((a, i) => (
            <div key={a.url} className="admin-img-row">
              <span className="mono">{a.name}</span>
              <button
                type="button"
                className="mono admin-bar__link danger"
                onClick={() => set('attachments', f.attachments.filter((_, j) => j !== i))}
              >
                Quitar
              </button>
            </div>
          ))}
          <input
            type="file"
            accept=".pdf,.indd,.idml,.ai,.psd,.zip"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) uploadAttachment(file)
              e.target.value = ''
            }}
          />
        </fieldset>

        <div className="admin-form__checks">
          <label className="mono">
            <input type="checkbox" checked={f.featured} onChange={(e) => set('featured', e.target.checked)} /> Destacado (home)
          </label>
          <label className="mono">
            <input type="checkbox" checked={f.published} onChange={(e) => set('published', e.target.checked)} /> Publicado
          </label>
        </div>

        {uploading && <p className="mono">Subiendo {uploading}…</p>}
        {error && <p className="form__error mono">{error}</p>}

        <button className="btn btn--primary" disabled={saving}>
          {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear proyecto'}
        </button>
      </form>
    </section>
  )
}
