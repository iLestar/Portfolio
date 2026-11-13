// Juan Guillermo's original monogram, preserving its letterforms.
export default function Monogram({ size = 40 }: { size?: number }) {
  return <span className="signature-jg" style={{ width: size, height: size }}>
    <img src="/brand/monograma-jg.png" alt="Monograma JG" style={{ width: size * 612 / 398, left: -size * 107 / 398, top: -size * 195 / 398 }} />
  </span>
}
