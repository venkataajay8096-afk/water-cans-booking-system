export default function WaveAnimation() {
  // SVG wave path — two copies side by side so we can slide infinitely
  const wavePath =
    'M0,56 C150,100 350,0 500,56 C650,112 850,12 1000,56 C1150,100 1350,0 1500,56 L1500,120 L0,120 Z'

  return (
    <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none z-10"
         style={{ height: '140px' }}>
      {/* Wave 1 — fastest, most opaque, darkest blue */}
      <svg
        className="wave-layer wave-1"
        viewBox="0 0 1500 120"
        preserveAspectRatio="none"
        style={{ height: '120px' }}
      >
        <path d={wavePath} />
        <path d={wavePath} transform="translate(750,0)" />
      </svg>

      {/* Wave 2 — medium speed, lighter blue */}
      <svg
        className="wave-layer wave-2"
        viewBox="0 0 1500 120"
        preserveAspectRatio="none"
        style={{ height: '120px', bottom: '10px' }}
      >
        <path d="M0,70 C200,20 400,110 600,70 C800,30 1000,90 1200,70 C1400,50 1500,80 1500,70 L1500,120 L0,120 Z" />
        <path d="M0,70 C200,20 400,110 600,70 C800,30 1000,90 1200,70 C1400,50 1500,80 1500,70 L1500,120 L0,120 Z"
              transform="translate(750,0)" />
      </svg>

      {/* Wave 3 — slowest, most transparent, lightest */}
      <svg
        className="wave-layer wave-3"
        viewBox="0 0 1500 120"
        preserveAspectRatio="none"
        style={{ height: '120px', bottom: '20px' }}
      >
        <path d="M0,40 C100,80 300,10 500,40 C700,70 900,20 1100,40 C1300,60 1400,30 1500,40 L1500,120 L0,120 Z" />
        <path d="M0,40 C100,80 300,10 500,40 C700,70 900,20 1100,40 C1300,60 1400,30 1500,40 L1500,120 L0,120 Z"
              transform="translate(750,0)" />
      </svg>
    </div>
  )
}
