import { useMemo } from 'react'

const BUBBLE_COUNT = 22

export default function Bubbles() {
  const bubbles = useMemo(() => {
    return Array.from({ length: BUBBLE_COUNT }, (_, i) => {
      const size   = 10 + Math.floor(Math.random() * 31)   // 10–40px
      const left   = Math.floor(Math.random() * 100)        // 0–100%
      const delay  = (Math.random() * 12).toFixed(1)        // 0–12s
      const dur    = (8 + Math.random() * 10).toFixed(1)    // 8–18s
      return { id: i, size, left, delay, dur }
    })
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="bubble"
          style={{
            width:             `${b.size}px`,
            height:            `${b.size}px`,
            left:              `${b.left}%`,
            bottom:            '-50px',
            animationDelay:    `${b.delay}s`,
            animationDuration: `${b.dur}s`,
          }}
        />
      ))}
    </div>
  )
}
