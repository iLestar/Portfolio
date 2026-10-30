// Monograma Lestar — concepto "L + chispa" (Lestar = L + star).
// Inline para poder recolorarlo desde CSS si hace falta.
export default function Monogram({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Lestar"
      style={{ flexShrink: 0 }}
    >
      <rect width="64" height="64" rx="14" fill="var(--ink)" stroke="var(--line)" />
      <path d="M15 11h11v29h18v9H15z" fill="#eef0ff" />
      <path
        d="M47 10q2.5 7 9.5 9.5-7 2.5-9.5 9.5-2.5-7-9.5-9.5 7-2.5 9.5-9.5z"
        fill="var(--purple)"
      />
    </svg>
  )
}
