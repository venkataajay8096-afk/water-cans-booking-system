import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrder } from '../context/OrderContext'
import confetti from 'canvas-confetti'
import Bubbles from '../components/Bubbles'

function ConfettiPiece({ style }) {
  return <div className="confetti-piece" style={style} />
}

export default function SuccessScreen() {
  const navigate    = useNavigate()
  const { placedOrder, selectedPlant, coolingQty, normalQty, totalAmount,
          deliveryDate, deliveryTime, paymentMethod, resetOrder } = useOrder()
  const [confettiPieces, setConfettiPieces] = useState([])
  const firedRef = useRef(false)

  useEffect(() => {
    if (!placedOrder) { navigate('/'); return }
    if (firedRef.current) return
    firedRef.current = true

    // Canvas confetti burst
    confetti({
      particleCount: 200,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#ffffff', '#06D6A0'],
    })
    setTimeout(() => {
      confetti({
        particleCount: 120,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors: ['#0077B6', '#90E0EF', '#ffffff'],
      })
      confetti({
        particleCount: 120,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors: ['#0077B6', '#90E0EF', '#ffffff'],
      })
    }, 400)

    // CSS confetti pieces
    const pieces = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      style: {
        left:              `${Math.random() * 100}%`,
        width:             `${8 + Math.random() * 12}px`,
        height:            `${8 + Math.random() * 12}px`,
        backgroundColor:   ['#0077B6','#00B4D8','#90E0EF','#ffffff','#06D6A0','#fbbf24'][i % 6],
        borderRadius:      Math.random() > 0.5 ? '50%' : '2px',
        animationDuration: `${2 + Math.random() * 2}s`,
        animationDelay:    `${Math.random() * 1}s`,
      },
    }))
    setConfettiPieces(pieces)
  }, [])

  const handleDone = () => {
    resetOrder()
    navigate('/')
  }

  const handleViewOrders = () => {
    resetOrder()
    navigate('/orders')
  }

  const handleTrack = () => navigate('/track')

  if (!placedOrder) return null

  const deliveryDateStr = deliveryDate
    ? new Date(deliveryDate).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : ''

  const timeLabels = {
    morning:   '6:00 AM – 11:00 AM 🌅',
    afternoon: '11:00 AM – 4:00 PM ☀️',
    evening:   '4:00 PM – 9:00 PM 🌆',
  }

  return (
    <div className="relative min-h-screen ocean-bg pt-20 pb-10 overflow-hidden">
      <Bubbles />
      {/* CSS confetti */}
      <div className="pointer-events-none">
        {confettiPieces.map(c => <ConfettiPiece key={c.id} style={c.style} />)}
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 screen-enter">
        {/* Success animation */}
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center w-32 h-32 mx-auto mb-4">
            {/* Splash rings */}
            <div className="absolute inset-0 rounded-full border-4 border-success/50 animate-splash-burst" />
            <div className="absolute inset-0 rounded-full border-2 border-ocean-mid/60"
                 style={{ animation: 'splashBurst 1.2s ease-out 0.2s forwards' }} />

            {/* Circle */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-emerald-400
                            flex items-center justify-center shadow-2xl shadow-success/40">
              {/* SVG Checkmark drawing itself */}
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path
                  d="M10 24 L20 34 L38 16"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  className="checkmark-path"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-black text-white drop-shadow">Order Placed! 🎉</h1>
          <p className="text-white/70 text-sm mt-2 font-medium">
            Your water cans are confirmed
          </p>
          <div className="inline-block glass border border-white/30 px-4 py-1.5 rounded-full mt-2">
            <span className="text-white font-mono font-bold text-sm">{placedOrder.order_id}</span>
          </div>
        </div>

        {/* Order summary card */}
        <div className="glass-white rounded-3xl p-5 border border-white/50 shadow-2xl space-y-3 animate-scale-in">
          {/* Plant */}
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-dark to-ocean-mid
                            flex items-center justify-center text-white text-xl">
              💧
            </div>
            <div>
              <p className="font-extrabold text-slate-800">{selectedPlant?.name}</p>
              <p className="text-xs text-slate-500">{selectedPlant?.phone}</p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2 text-sm">
            {coolingQty > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">❄️ Cooling Cans × {coolingQty}</span>
                <span className="font-bold text-sky-700">₹{coolingQty * (selectedPlant?.cooling_price || 0)}</span>
              </div>
            )}
            {normalQty > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">💧 Normal Cans × {normalQty}</span>
                <span className="font-bold text-blue-700">₹{normalQty * (selectedPlant?.normal_price || 0)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-slate-100">
              <span className="font-black text-slate-800">Total Paid</span>
              <span className="font-black text-xl text-success">₹{totalAmount}</span>
            </div>
          </div>

          {/* Delivery details */}
          <div className="bg-slate-50 rounded-2xl p-3 space-y-1.5 border border-slate-100">
            <div className="flex gap-2 text-sm">
              <span>📅</span>
              <span className="text-slate-600 font-medium">{deliveryDateStr}</span>
            </div>
            <div className="flex gap-2 text-sm">
              <span>⏰</span>
              <span className="text-slate-600 font-medium">{timeLabels[deliveryTime] || deliveryTime}</span>
            </div>
            <div className="flex gap-2 text-sm">
              <span>💳</span>
              <span className="text-slate-600 font-medium">
                {paymentMethod === 'upi' ? 'UPI Payment' : 'Cash on Delivery'}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-1">
            {/* Track button — prominent */}
            <button onClick={handleTrack}
                    id="track-order-btn"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500
                               hover:from-emerald-600 hover:to-teal-600
                               text-white font-black text-sm shadow-lg hover:shadow-xl
                               transition-all cursor-pointer flex items-center justify-center gap-2">
              🚚 Track My Delivery (Live)
            </button>
            <div className="flex gap-2">
              <button onClick={handleViewOrders}
                      className="flex-1 py-3 rounded-xl border-2 border-ocean-mid/40 text-ocean-dark
                                 font-bold text-sm hover:bg-sky-50 transition-all cursor-pointer">
                📦 My Orders
              </button>
              <button onClick={handleDone}
                      id="success-done-btn"
                      className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-ocean-dark to-ocean-mid
                                 text-white font-black text-sm shadow-lg hover:shadow-xl
                                 transition-all cursor-pointer btn-glow">
                🚰 Book More →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
