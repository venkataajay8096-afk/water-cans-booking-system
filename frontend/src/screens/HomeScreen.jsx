import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Bubbles from '../components/Bubbles'
import WaveAnimation from '../components/WaveAnimation'

const COOLING_IMG = 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&h=800&fit=crop&q=85'
const NORMAL_IMG  = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=800&fit=crop&q=85'

export default function HomeScreen() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const handleBook = () => {
    if (isAuthenticated) navigate('/map')
    else navigate('/login')
  }

  return (
    <div className="relative min-h-screen ocean-bg flex flex-col overflow-hidden">
      {/* Animated background bubbles */}
      <Bubbles />

      {/* Hero Section — full screen */}
      <section className="relative flex-1 flex flex-col items-center justify-center
                           min-h-screen px-4 pt-24 pb-40 text-center z-10">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass border border-white/30
                         px-5 py-2 rounded-full mb-6 animate-fade-slide">
          <span className="text-lg">💧</span>
          <span className="text-white text-xs font-bold uppercase tracking-widest">
            Pure Hydration, Right to Your Door
          </span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white
                        tracking-tight leading-tight drop-shadow-xl mb-4 animate-fade-slide"
            style={{ animationDelay: '0.1s' }}>
          Fresh Water,<br />
          <span className="text-yellow-300">Delivered Fast</span>
        </h1>

        <p className="text-white/85 text-base sm:text-lg max-w-md mx-auto mb-8
                       font-medium leading-relaxed animate-fade-slide"
           style={{ animationDelay: '0.2s' }}>
          GPS-powered delivery from your nearest water plants.
          Cooling &amp; Normal 20L cans, order in 60 seconds.
        </p>

        {/* CTA button */}
        <button
          onClick={handleBook}
          id="book-now-btn"
          className="btn-glow bg-white text-ocean-dark hover:bg-yellow-300 hover:text-slate-900
                     font-black text-lg px-12 py-5 rounded-2xl shadow-2xl
                     transition-all duration-300 cursor-pointer animate-scale-in
                     active:scale-95"
          style={{ animationDelay: '0.3s' }}
        >
          🚰 Book Water Cans Now
        </button>

        <p className="text-white/60 text-sm mt-4 font-medium animate-fade-slide"
           style={{ animationDelay: '0.4s' }}>
          {isAuthenticated ? 'Select your location on the map →' : 'Free registration · No spam'}
        </p>

        {/* ── Large Can Images ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-6 max-w-xl mx-auto mt-12 w-full
                         animate-fade-slide" style={{ animationDelay: '0.5s' }}>

          {/* Cooling Can */}
          <div className="relative flex flex-col items-center gap-3">
            {/* Ice crystal orbit */}
            <div className="relative can-wrap">
              <div className="ice-orbit" style={{ top: '50%', left: '50%' }}>
                {['❄️','🧊','❄️','🧊','❄️'].map((c, i) => (
                  <span key={i} className="ice-crystal">{c}</span>
                ))}
              </div>
              <img
                src={COOLING_IMG}
                alt="Cooling Water Can"
                className="w-full rounded-2xl shadow-2xl border-2 border-white/30 animate-float-cool"
                style={{ minHeight: '300px', objectFit: 'cover' }}
              />
            </div>
            <div className="glass border border-white/30 px-4 py-2 rounded-xl w-full text-center">
              <p className="text-white font-black text-sm">❄️ Cooling Cans</p>
              <p className="text-ocean-light text-xs font-semibold">Starting ₹35/can</p>
            </div>
          </div>

          {/* Normal Can */}
          <div className="flex flex-col items-center gap-3">
            <div className="can-wrap">
              <img
                src={NORMAL_IMG}
                alt="Normal Water Can"
                className="w-full rounded-2xl shadow-2xl border-2 border-white/30 animate-float-norm"
                style={{ minHeight: '300px', objectFit: 'cover' }}
              />
            </div>
            <div className="glass border border-white/30 px-4 py-2 rounded-xl w-full text-center">
              <p className="text-white font-black text-sm">💧 Normal Cans</p>
              <p className="text-ocean-light text-xs font-semibold">Starting ₹20/can</p>
            </div>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-10 animate-fade-slide"
             style={{ animationDelay: '0.6s' }}>
          {[
            '📍 GPS Location Detection',
            '⚡ 60-Min Delivery',
            '💳 UPI & Cash',
            '📱 WhatsApp Confirmation',
          ].map((f) => (
            <span key={f}
                  className="glass border border-white/20 text-white text-xs font-semibold
                             px-4 py-2 rounded-full">
              {f}
            </span>
          ))}
        </div>
      </section>

      {/* Animated waves at bottom */}
      <WaveAnimation />
    </div>
  )
}
