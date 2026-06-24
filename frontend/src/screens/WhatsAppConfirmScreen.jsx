import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrder } from '../context/OrderContext'
import { sendWhatsApp, previewWhatsApp } from '../api/axios'
import toast from 'react-hot-toast'
import Bubbles from '../components/Bubbles'

export default function WhatsAppConfirmScreen() {
  const navigate = useNavigate()
  const { placedOrder, selectedPlant } = useOrder()
  const [preview, setPreview] = useState('')
  const [waLink,  setWaLink]  = useState('')
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)

  useEffect(() => {
    if (!placedOrder) { navigate('/map'); return }
    // Load preview
    previewWhatsApp(placedOrder._id)
      .then(({ data }) => {
        setPreview(data.preview)
        setWaLink(data.wa_link)
      })
      .catch(() => {
        // Build fallback preview
        const plant = selectedPlant
        const lines = []
        if (placedOrder.cooling_cans > 0)
          lines.push(`❄️ Cooling Cans: ${placedOrder.cooling_cans} × ₹${placedOrder.cooling_price}`)
        if (placedOrder.normal_cans > 0)
          lines.push(`💧 Normal Cans: ${placedOrder.normal_cans} × ₹${placedOrder.normal_price}`)
        const bookedTime = placedOrder.createdAt
          ? new Date(placedOrder.createdAt).toLocaleString('en-IN', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true
            })
          : new Date().toLocaleString('en-IN', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true
            })
        const msg = `────────────────────\n💧 Water Can Order\nOrder: ${placedOrder.order_id}\nBooked: ${bookedTime}\n────────────────────\n${lines.join('\n')}\nTotal: ₹${placedOrder.total_amount}\nAddress: ${placedOrder.delivery_address}\n────────────────────`
        setPreview(msg)
        if (plant) {
          setWaLink(`https://wa.me/${plant.whatsapp?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`)
        }
      })
  }, [placedOrder])

  const handleSendClick = (e) => {
    if (!waLink) {
      e.preventDefault()
      toast.error('WhatsApp link is not ready')
      return
    }
    setSent(true)
    toast.success('Opening WhatsApp…')
    sendWhatsApp(placedOrder._id).catch(() => {})
    setTimeout(() => navigate('/success'), 1500)
  }

  const handleSkip = () => navigate('/success')

  return (
    <div className="relative min-h-screen ocean-bg pt-20 pb-10 overflow-hidden">
      <Bubbles />

      <div className="relative z-10 max-w-md mx-auto px-4 screen-enter">
        <div className="text-center mb-6">
          <div className="text-6xl mb-3 animate-bounce-dot">📱</div>
          <h1 className="text-3xl font-black text-white drop-shadow">Send WhatsApp</h1>
          <p className="text-white/70 text-sm mt-1 font-medium">
            Confirm your order with the plant owner via WhatsApp
          </p>
        </div>

        <div className="glass-white rounded-3xl p-5 border border-white/50 shadow-2xl space-y-4">
          {/* Order ID badge */}
          {placedOrder && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-extrabold text-slate-800 text-sm">Order Placed!</p>
                <p className="text-xs text-slate-500 font-mono">{placedOrder.order_id}</p>
              </div>
            </div>
          )}

          {/* Message preview */}
          <div>
            <h3 className="font-extrabold text-slate-700 text-sm mb-2 uppercase tracking-wider">
              📋 WhatsApp Message Preview
            </h3>
            <div className="bg-[#dcf8c6] rounded-2xl p-4 border border-green-200/60
                            font-mono text-xs text-slate-700 leading-relaxed
                            max-h-60 overflow-y-auto whitespace-pre-line">
              {preview || 'Loading preview…'}
            </div>
          </div>

          {/* Recipient */}
          {selectedPlant && (
            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3 border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
                {selectedPlant.name?.[0]}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{selectedPlant.name}</p>
                <p className="text-xs text-slate-500">{selectedPlant.phone}</p>
              </div>
              <div className="ml-auto">
                <span className="text-2xl">📱</span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button onClick={handleSkip}
                    className="flex-1 py-3 px-4 rounded-xl border-2 border-slate-200
                               text-slate-600 font-bold text-sm hover:bg-slate-50
                               transition-all cursor-pointer">
              Skip →
            </button>
            <a href={waLink || '#'}
               target="_blank"
               rel="noopener noreferrer"
               onClick={handleSendClick}
               id="whatsapp-send-btn"
               className="flex-[2] py-3 px-6 rounded-xl
                          bg-gradient-to-r from-green-500 to-green-600
                          hover:from-green-600 hover:to-green-700
                          text-white font-black text-sm shadow-lg
                          transition-all cursor-pointer text-center
                          disabled:opacity-60 flex items-center justify-center gap-2">
              {sent ? '✅ Sent!' : '📲 Send via WhatsApp'}
            </a>
          </div>

          {/* Open directly */}
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer"
               className="block text-center text-xs text-ocean-dark font-bold hover:underline">
              Or click here to open WhatsApp directly →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
