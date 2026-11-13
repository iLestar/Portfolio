import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { admin } from '../../api'
import type { ProjectPayload } from '../../api'
import { CATEGORIES } from '../../data/projects'
import type { Category } from '../../data/projects'
import { useI18n } from '../../i18n'

const blank = (): ProjectPayload => ({
  slug: '', title: '', year: new Date().getFullYear(), category: 'editorial', categories: ['editorial'],
  kind: 'result', cover: null, tools: [], summaryEs: '', summaryEn: '', bodyEs: '', bodyEn: '',
  creditsEs: '', creditsEn: '', contributors: [], sections: null, attachments: [], gallery: [], documentUrl: null,
  featured: false, published: false, sortOrder: 0,
})
const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120)
const IMAGE_TYPES = '.jpg,.jpeg,.png,.webp,.gif,.avif'

export default function ProjectForm() {
  const { id } = useParams()
  const { t } = useI18n()
  const [f, setF] = useState<ProjectPayload>(blank)
  const [savedId, setSavedId] = useState<number | null>(id ? Number(id) : null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [loading, setLoading] = useState(Boolean(id))
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState('')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [tools, setTools] = useState('')

  useEffect(() => {
    let active = true
    if (!id) { setF(blank()); setSavedId(null); setTools(''); setDirty(false); setLoading(false); return }
    setLoading(true); setLoadFailed(false)
    admin.list().then((rows) => {
      const p = rows.find((row) => row.id === Number(id))
      if (!p) throw new Error('No se encontró este proyecto.')
      if (!active) return
      setSavedId(p.id)
      setTools(p.tools.join(', '))
      setF({
        ...blank(), ...p, category: p.category, categories: p.categories ?? [p.category],
        cover: p.cover ?? null, summaryEs: p.summary.es, summaryEn: p.summary.en,
        bodyEs: p.body?.es ?? '', bodyEn: p.body?.en ?? '', creditsEs: p.credits?.es ?? '', creditsEn: p.credits?.en ?? '',
        sections: p.sections?.map((s) => ({ key: s.key, image: s.image ?? null, es: s.body.es, en: s.body.en })) ?? null,
      })
      setDirty(false)
    }).catch((e) => { if (active) { setLoadFailed(true); setError(String(e)) } }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  function set<K extends keyof ProjectPayload>(key: K, value: ProjectPayload[K]) {
    setF((prev) => ({ ...prev, [key]: value })); setDirty(true); setNotice('')
  }

  async function upload(files: FileList | null, kind: 'cover' | 'gallery' | 'pdf' | 'attachment') {
    if (!files?.length) return
    setError(''); setNotice('')
    try {
      for (const file of Array.from(files)) {
        if (file.size > 100 * 1024 * 1024) throw new Error(`${file.name}: el máximo es 100 MB por archivo.`)
        if ((kind === 'cover' || kind === 'gallery') && !/\.(jpe?g|png|webp|gif|avif)$/i.test(file.name)) throw new Error('Selecciona una imagen JPG, PNG, WebP, GIF o AVIF.')
        if (kind === 'pdf' && !/\.pdf$/i.test(file.name)) throw new Error('Selecciona un PDF para el visor.')
        setBusy(file.name)
        const { url, name } = await admin.upload(file)
        setF((prev) => {
          if (kind === 'cover') return { ...prev, cover: url }
          if (kind === 'pdf') return { ...prev, documentUrl: url }
          if (kind === 'attachment') return { ...prev, attachments: [...(prev.attachments ?? []), { url, name }] }
          return { ...prev, gallery: [...(prev.gallery ?? []), { url, es: file.name.replace(/\.[^.]+$/, ''), en: '' }] }
        })
        setDirty(true)
      }
    } catch (e) { setError(String(e)) } finally { setBusy('') }
  }

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy || saving) return
    if (slugify(f.title).length < 2) { setError('El nombre debe generar un enlace con al menos dos letras o números.'); return }
    const button = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const published = button?.value === 'publish'
    setSaving(true); setError(''); setNotice('')
    try {
      const dto = { ...f, published, slug: f.slug || slugify(f.title), tools: tools.split(',').map((s) => s.trim()).filter(Boolean), category: f.categories?.[0] ?? f.category }
      const p = savedId ? await admin.update(savedId, dto) : await admin.create(dto)
      setSavedId(p.id); setF((prev) => ({ ...prev, slug: p.slug, published, summaryEn: p.summary.en, bodyEn: p.body?.en ?? '', creditsEn: p.credits?.en ?? '', gallery: p.gallery ?? [] }))
      setDirty(false)
      setNotice(`${published ? 'Proyecto publicado.' : 'Borrador guardado.'} ${p.translationStatus === 'reviewed' ? 'Traducción al inglés revisada.' : p.translationStatus === 'complete' ? 'Traducción al inglés lista.' : `Traducción pendiente: ${p.translationError ?? 'Vuelve a guardar para reintentar.'} Tu texto en español está guardado.`}`)
      if (!id) window.history.replaceState(null, '', `/admin/panel/editar/${p.id}`)
    } catch (e) { setError(String(e)) } finally { setSaving(false) }
  }

  function move(index: number, direction: number) {
    const rows = [...(f.gallery ?? [])]
    const other = index + direction
    if (other < 0 || other >= rows.length) return
    ;[rows[index], rows[other]] = [rows[other], rows[index]]
    set('gallery', rows)
  }

  if (loading) return <section className="wrap page"><p role="status">Cargando proyecto…</p></section>
  if (loadFailed) return <section className="wrap page"><p role="alert">{error || 'No se pudo cargar el proyecto.'}</p><Link to="/admin/panel">Volver al panel</Link></section>

  return <section className="wrap page editor">
    <header className="editor__header">
      <div><p className="mono editor__eyebrow">ESTUDIO / PROYECTOS</p><h1>{savedId ? 'Dale forma a tu proyecto' : 'Un nuevo proyecto'}</h1><p>Cuenta qué hiciste, muestra las piezas y acredita al equipo. Empieza en español.</p></div>
      <Link to="/admin/panel" onClick={(e) => { if (dirty && !confirm('Tienes cambios sin guardar. ¿Salir del editor?')) e.preventDefault() }}>← Panel</Link>
    </header>
    <p className="editor__required">Los campos con * son obligatorios. Puedes guardar el resto vacío como borrador.</p>
    <form onSubmit={save} className="editor__form">
      <fieldset disabled={saving || Boolean(busy)} className="editor__fields">
        <section className="editor__section">
          <div className="editor__section-head"><span className="mono">01 / PRESENTACIÓN</span><h2>Lo esencial</h2><p>La portada y el resumen serán la primera mirada al proyecto.</p></div>
          <div className="editor__section-body">
            <label className="form__field">Nombre del proyecto *<input value={f.title} minLength={2} maxLength={200} required onChange={(e) => { set('title', e.target.value); set('slug', slugify(e.target.value)) }} /></label>
            <div className="admin-form__row"><label className="form__field">Año *<input type="number" min={1990} max={2100} required value={f.year} onChange={(e) => set('year', Number(e.target.value))} /></label><label className="form__field">Enlace del proyecto<input value={f.slug ? `/proyectos/${f.slug}` : ''} readOnly placeholder="Se genera al escribir el nombre" /><small>Se genera automáticamente a partir del nombre. Si ya existe, se añade un número al guardar.</small></label></div>
            <fieldset className="editor__categories"><legend>Disciplinas * · elige al menos una</legend>{CATEGORIES.map((category) => <label key={category} className="editor__choice"><input type="checkbox" checked={f.categories?.includes(category) ?? false} onChange={(e) => { const next = e.target.checked ? [...(f.categories ?? []), category] : f.categories?.filter((c) => c !== category); if (next?.length) set('categories', next as Category[]) }} />{t.projects.categories[category]}</label>)}</fieldset>
            <label className="form__field">Herramientas<input value={tools} placeholder="InDesign, Photoshop, Illustrator" onChange={(e) => { setTools(e.target.value); setDirty(true) }} /><small>Separadas por comas. Las disciplinas describen el trabajo; aquí van las aplicaciones.</small></label>
            <label className="form__field">Portada{f.cover && <img className="editor__cover" src={f.cover} alt="Portada seleccionada" />}<input type="file" accept={IMAGE_TYPES} onChange={(e) => { void upload(e.target.files, 'cover'); e.target.value = '' }} /></label>
            {f.cover && <button type="button" className="admin-bar__link" onClick={() => set('cover', null)}>Quitar portada</button>}
            <label className="form__field">Resumen en español<textarea rows={3} value={f.summaryEs} onChange={(e) => set('summaryEs', e.target.value)} placeholder="¿Qué es el proyecto y qué buscaba resolver?" /></label>
            <label className="form__field">La historia y tu aporte<textarea rows={7} value={f.bodyEs ?? ''} onChange={(e) => set('bodyEs', e.target.value)} placeholder="Contexto, decisiones de diseño y tu participación. Puedes desarrollar el caso con libertad." /></label>
          </div>
        </section>
        <section className="editor__section">
          <div className="editor__section-head"><span className="mono">02 / SELECCIÓN VISUAL</span><h2>Deja hablar a las piezas</h2><p>Sube varias imágenes, ordénalas y explica qué hiciste en cada una. Para Musea, destaca aquí tus páginas.</p></div>
          <div className="editor__section-body"><label className="editor__upload">Añadir imágenes · JPG, PNG, WebP, GIF, AVIF<input type="file" multiple accept={IMAGE_TYPES} onChange={(e) => { void upload(e.target.files, 'gallery'); e.target.value = '' }} /><small>Máximo 100 MB por archivo. Las páginas se muestran completas, sin recortarlas.</small></label>
            {!f.gallery?.length && <p className="editor__empty">Tu selección aparecerá aquí. Puedes empezar por la portada y después añadir los detalles.</p>}
            {f.gallery?.map((image, index) => <article className="editor__image" key={image.url}><img src={image.url} alt={`Pieza ${index + 1}`} /><div><label className="form__field">Descripción / crédito de esta pieza<textarea maxLength={2000} rows={3} value={image.es} onChange={(e) => set('gallery', f.gallery?.map((row, i) => i === index ? { ...row, es: e.target.value, en: '' } : row))} /></label><div className="editor__image-actions"><button type="button" disabled={index === 0} onClick={() => move(index, -1)}>↑ Subir</button><button type="button" disabled={index === (f.gallery?.length ?? 0) - 1} onClick={() => move(index, 1)}>↓ Bajar</button><button type="button" onClick={() => set('cover', image.url)}>Usar de portada</button><button type="button" onClick={() => set('gallery', f.gallery?.filter((_, i) => i !== index))}>Quitar</button></div></div></article>)}
          </div>
        </section>
        <section className="editor__section">
          <div className="editor__section-head"><span className="mono">03 / PUBLICACIÓN Y ARCHIVOS</span><h2>El trabajo completo</h2><p>El PDF se podrá explorar dentro de la ficha. Los editables solo se ofrecen si los añades como descarga.</p></div>
          <div className="editor__section-body"><label className="form__field">PDF para el visor<input type="file" accept=".pdf" onChange={(e) => { void upload(e.target.files, 'pdf'); e.target.value = '' }} /></label>{f.documentUrl && <p><a href={f.documentUrl} target="_blank" rel="noopener">Revisar PDF ↗</a> · <button type="button" onClick={() => set('documentUrl', null)}>Quitar del visor</button></p>}
            <label className="form__field">Descargas adicionales (opcional)<input type="file" multiple accept=".pdf,.indd,.idml,.ai,.psd,.zip" onChange={(e) => { void upload(e.target.files, 'attachment'); e.target.value = '' }} /></label>
            {f.attachments?.map((a, i) => <div key={a.url} className="editor__file"><span>{a.name}</span><button type="button" onClick={() => set('attachments', f.attachments?.filter((_, j) => i !== j) ?? [])}>Quitar</button></div>)}
          </div>
        </section>
        <section className="editor__section">
          <div className="editor__section-head"><span className="mono">04 / CRÉDITOS</span><h2>Las personas detrás</h2><p>Indica el equipo y las responsabilidades. Puede ser un proyecto académico, personal o para un cliente.</p></div>
          <div className="editor__section-body">
            <div className="editor__contributors">
              <h3>Integrantes del equipo</h3>
              <p>Añade tu nombre y el de tus compañeros. El enlace a Instagram, Behance u otro perfil es opcional.</p>
              {f.contributors?.map((person, index) => <div className="editor__contributor" key={index}>
                <label className="form__field">Nombre *<input required maxLength={200} value={person.name} onChange={(e) => set('contributors', f.contributors?.map((row, i) => i === index ? { ...row, name: e.target.value } : row))} /></label>
                <label className="form__field">Enlace al perfil (opcional)<input type="url" maxLength={1000} placeholder="https://www.instagram.com/usuario/" value={person.url ?? ''} onChange={(e) => set('contributors', f.contributors?.map((row, i) => i === index ? { ...row, url: e.target.value || null } : row))} /></label>
                <button type="button" className="admin-bar__link danger" aria-label={`Quitar integrante ${index + 1}`} onClick={() => set('contributors', f.contributors?.filter((_, i) => i !== index))}>Quitar</button>
              </div>)}
              <button type="button" className="btn btn--ghost" disabled={(f.contributors?.length ?? 0) >= 50} onClick={() => set('contributors', [...(f.contributors ?? []), { name: '', url: null }])}>+ Añadir integrante</button>
            </div>
            <label className="form__field">Contexto y participación<textarea rows={6} maxLength={10000} value={f.creditsEs ?? ''} onChange={(e) => set('creditsEs', e.target.value)} placeholder="Proyecto académico en equipo de tres. Mi aporte: portada, páginas maestras…" /><small>Explica aquí las responsabilidades. Los nombres y enlaces se muestran por separado.</small></label>
            <label className="editor__choice"><input type="checkbox" checked={f.featured} onChange={(e) => set('featured', e.target.checked)} />Destacar en la página de inicio al publicarlo</label>
            <details><summary>Opciones adicionales</summary><label className="form__field">Orden en el listado<input type="number" value={f.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} /></label><label className="form__field">Traducción del resumen (opcional)<textarea value={f.summaryEn} onChange={(e) => set('summaryEn', e.target.value)} /></label><label className="form__field">Traducción del texto (opcional)<textarea value={f.bodyEn ?? ''} onChange={(e) => set('bodyEn', e.target.value)} /></label><label className="form__field">Traducción de créditos (opcional)<textarea value={f.creditsEn ?? ''} onChange={(e) => set('creditsEn', e.target.value)} /></label></details>
          </div>
        </section>
      </fieldset>
      <footer className="editor__save"><span role="status">{busy ? `Subiendo ${busy}…` : saving ? 'Guardando…' : dirty ? 'Cambios sin guardar' : f.published ? 'Publicado' : 'Borrador'}</span><div>{savedId && !dirty && <Link className="btn btn--ghost" to={`/admin/panel/vista-previa/${savedId}`} target="_blank">Vista previa ↗</Link>}<button className="btn btn--ghost" type="submit" value="draft" disabled={saving || Boolean(busy)}>Guardar borrador</button><button className="btn btn--primary" type="submit" value="publish" disabled={saving || Boolean(busy)}>Publicar proyecto</button></div></footer>
      {notice && <p role="status" className="editor__notice">{notice}</p>}{error && <p role="alert" className="form__error">{error}</p>}
    </form>
  </section>
}
