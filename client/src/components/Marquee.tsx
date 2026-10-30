// Cinta cinética — el texto se duplica y la animación CSS lo recorre en loop.
// prefers-reduced-motion lo detiene (ver base.css).
export default function Marquee({ text }: { text: string }) {
  const chunk = text.repeat(6)
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        <span className="marquee__chunk">{chunk}</span>
        <span className="marquee__chunk">{chunk}</span>
      </div>
    </div>
  )
}
