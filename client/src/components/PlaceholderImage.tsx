// Bloque de imagen pendiente — honesto y visible: trama diagonal + etiqueta.
// Cuando lleguen las imágenes reales, esto se reemplaza por <img> optimizada.
export default function PlaceholderImage({
  label,
  ratio = '4 / 5',
}: {
  label: string
  ratio?: string
}) {
  return (
    <div className="ph-img" style={{ aspectRatio: ratio }} role="img" aria-label={label}>
      <span className="ph-img__label">{label}</span>
      <span className="ph-img__tag">[PENDIENTE · imagen]</span>
    </div>
  )
}
