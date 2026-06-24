import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrder } from '../context/OrderContext'
import Bubbles from '../components/Bubbles'
import toast from 'react-hot-toast'

// Strip everything except digits and leading +
function cleanPhone(phone) {
  return (phone || '').replace(/[^\d+]/g, '')
}

export default function PlantDetailScreen() {
  const navigate = useNavigate()
  const { selectedPlant } = useOrder()
  const [copied, setCopied] = useState(false)

  if (!selectedPlant) {
    navigate('/map')
    return null
  }

  const plant = selectedPlant
  const rawPhone = cleanPhone(plant.phone)
  const waNumber = (plant.whatsapp || rawPhone).replace(/\D/g, '')


  const handleCopy = async () => {
    const num = plant.phone || rawPhone
    try {
      await navigator.clipboard.writeText(num)
      setCopied(true)
      toast.success(`Copied: ${num}`)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Could not copy')
    }
  }

  return (
    <div className="relative min-h-screen ocean-bg pt-20 pb-10 overflow-hidden">
      <Bubbles />

      <div className="relative z-10 max-w-2xl mx-auto px-4 screen-enter">
        {/* Back */}
        <button onClick={() => navigate('/map')}
                className="text-white/70 hover:text-white text-sm font-semibold
                           flex items-center gap-1 mb-4 cursor-pointer transition-colors">
          ← Back to Map
        </button>

        <div className="glass-white rounded-3xl overflow-hidden shadow-2xl border border-white/50">
          {/* Hero */}
          <div className="relative h-48 bg-gradient-to-br from-ocean-dark to-ocean-darkest overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1559825481-12a05cc00344?w=800&h=400&fit=crop&q=80"
              alt="Water Plant"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <h1 className="text-2xl font-black text-white drop-shadow">{plant.name}</h1>
              <p className="text-white/80 text-sm font-medium mt-1">{plant.address}</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Info grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: '📍', label: 'Distance', value: `${plant.distance} km` },
                { icon: '⭐', label: 'Rating',   value: `${plant.rating?.toFixed?.(1) || plant.rating} / 5` },
                { icon: '💬', label: 'Reviews',  value: `${plant.total_reviews || 0}+` },
              ].map((info) => (
                <div key={info.label}
                     className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                  <div className="text-2xl">{info.icon}</div>
                  <div className="font-extrabold text-slate-800 text-sm mt-1">{info.value}</div>
                  <div className="text-xs text-slate-500 font-medium">{info.label}</div>
                </div>
              ))}
            </div>

            {/* ── Contact Details ───────────────────────────────────────────── */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
              <h3 className="font-extrabold text-slate-700 text-sm">📞 Contact Details</h3>

              {/* Name & number row */}
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-slate-800 font-bold truncate">{plant.owner_name}</p>
                  <p className="text-slate-500 text-sm font-mono">{plant.phone}</p>
                </div>

                {/* Copy number button */}
                <button
                  onClick={handleCopy}
                  id="copy-phone-btn"
                  title="Copy phone number"
                  className="shrink-0 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs
                             font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                >
                  {copied ? '✅ Copied' : '📋 Copy'}
                </button>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2">
                {/* Call Now — triggers tel: link */}
                <a
                  href={rawPhone ? `tel:${rawPhone}` : '#'}
                  onClick={(e) => {
                    if (!rawPhone) {
                      e.preventDefault()
                      toast.error('No phone number available')
                    }
                  }}
                  id="call-now-btn"
                  className="flex items-center justify-center gap-2
                             bg-emerald-500 hover:bg-emerald-600 active:scale-95
                             text-white text-sm font-black py-3 rounded-xl
                             transition-all duration-200 cursor-pointer shadow-md text-center"
                >
                  📞 Call Now
                </a>

                {/* WhatsApp — always works */}
                <a
                  href={waNumber ? `https://wa.me/${waNumber}?text=Hi, I want to book water cans from ${plant.name}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="whatsapp-plant-btn"
                  className="flex items-center justify-center gap-2
                             bg-[#25D366] hover:bg-[#1fba57] active:scale-95
                             text-white text-sm font-black py-3 rounded-xl
                             transition-all duration-200 cursor-pointer shadow-md"
                >
                  💬 WhatsApp
                </a>
              </div>

              {/* Desktop hint */}
              <p className="text-[11px] text-slate-400 text-center font-medium">
                On desktop: use WhatsApp or copy the number
              </p>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-4 text-center">
                <div className="text-3xl mb-1">❄️</div>
                <p className="font-black text-sky-800 text-xl">₹{plant.cooling_price}</p>
                <p className="text-sky-600 text-xs font-semibold">per cooling can</p>
                <p className="text-slate-400 text-[10px] mt-1">20 litres · ice cold</p>
              </div>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 text-center">
                <div className="text-3xl mb-1">💧</div>
                <p className="font-black text-blue-800 text-xl">₹{plant.normal_price}</p>
                <p className="text-blue-600 text-xs font-semibold">per normal can</p>
                <p className="text-slate-400 text-[10px] mt-1">20 litres · drinking</p>
              </div>
            </div>

            {/* Book button */}
            <button
              onClick={() => navigate('/order')}
              id="book-plant-btn"
              className="w-full bg-gradient-to-r from-ocean-dark to-ocean-mid text-white
                         font-black py-4 rounded-2xl shadow-lg hover:shadow-xl
                         transition-all duration-300 cursor-pointer btn-glow text-base"
            >
              📋 Book Water Cans →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
