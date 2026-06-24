import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrder } from '../context/OrderContext'
import { useAuth } from '../context/AuthContext'
import { useLocation as useLocationCtx } from '../context/LocationContext'
import toast from 'react-hot-toast'
import Bubbles from '../components/Bubbles'

const COOLING_IMG = '/cooling_can.png'
const NORMAL_IMG  = '/normal_can.png'

const TIME_SLOTS = [
  { id: 'morning',   label: 'Morning',   sub: '6 AM – 11 AM', emoji: '🌅' },
  { id: 'afternoon', label: 'Afternoon', sub: '11 AM – 4 PM',  emoji: '☀️' },
  { id: 'evening',   label: 'Evening',   sub: '4 PM – 9 PM',   emoji: '🌆' },
]

export default function OrderFormScreen() {
  const navigate   = useNavigate()
  const {
    selectedPlant, coolingQty, normalQty, totalAmount,
    setCoolingQty, setNormalQty, deliveryDate, setDeliveryDate,
    deliveryTime, setDeliveryTime, deliveryAddress, setDeliveryAddress,
  } = useOrder()
  const { user }    = useAuth()
  const { address: gpsAddress } = useLocationCtx()
  const [customerName,  setCustomerName]  = useState(user?.name  || '')
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '')
  const [priceKey, setPriceKey] = useState(0)
  const prevTotal = useRef(totalAmount)

  useEffect(() => {
    if (!selectedPlant) navigate('/map')
  }, [selectedPlant])

  useEffect(() => {
    if (gpsAddress && !deliveryAddress) setDeliveryAddress(gpsAddress)
  }, [gpsAddress])

  useEffect(() => {
    if (totalAmount !== prevTotal.current) {
      setPriceKey(k => k + 1)
      prevTotal.current = totalAmount
    }
  }, [totalAmount])

  // Init default date (tomorrow)
  useEffect(() => {
    if (!deliveryDate) {
      const d = new Date(); d.setDate(d.getDate() + 1)
      setDeliveryDate(d.toISOString().split('T')[0])
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (coolingQty === 0 && normalQty === 0) {
      toast.error('Please select at least one can')
      return
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error('Please enter your name and phone')
      return
    }
    if (!deliveryAddress.trim()) {
      toast.error('Please enter your delivery address')
      return
    }
    navigate('/payment')
  }

  if (!selectedPlant) return null
  const plant = selectedPlant
  const minDate = new Date(); minDate.setDate(minDate.getDate() + 1)

  return (
    <div className="relative min-h-screen ocean-bg pt-20 pb-10 overflow-hidden">
      <Bubbles />

      <div className="relative z-10 max-w-2xl mx-auto px-4">
        <div className="text-center mb-6 screen-enter">
          <h1 className="text-3xl font-black text-white drop-shadow">🛒 Configure Order</h1>
          <p className="text-white/70 text-sm mt-1">from <span className="font-bold text-white">{plant.name}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── Large Can Cards ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4 screen-enter">
            {/* Cooling */}
            <div className={`glass-white rounded-3xl p-4 border-2 flex flex-col items-center transition-all duration-300
                ${coolingQty > 0 ? 'border-sky-400 shadow-lg shadow-sky-200/50' : 'border-white/60'}`}>
              {/* Ice crystals */}
              {coolingQty > 0 && (
                <div className="relative w-full flex justify-center">
                  <div className="ice-orbit" style={{ top: '150px', left: '50%' }}>
                    {['❄️','🧊','❄️','🧊','❄️'].map((c, i) => (
                      <span key={i} className="ice-crystal text-sm">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="can-wrap w-full">
                <img src={COOLING_IMG} alt="Cooling Can"
                     className="w-full rounded-2xl shadow-lg animate-float-cool"
                     style={{ height: '300px', objectFit: 'cover' }} />
              </div>
              <p className="font-extrabold text-slate-800 text-sm mt-3">❄️ Cooling Can</p>
              <p className="text-sky-600 font-black text-lg">₹{plant.cooling_price}/can</p>
              <div className="flex items-center gap-3 mt-2">
                <button type="button" onClick={() => setCoolingQty(coolingQty - 1)}
                        disabled={coolingQty === 0}
                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-red-100 hover:text-red-600
                                   font-black text-lg border border-slate-200 disabled:opacity-40
                                   flex items-center justify-center cursor-pointer transition-all active:scale-90">
                  −
                </button>
                <span className="font-black text-2xl text-slate-800 w-8 text-center">{coolingQty}</span>
                <button type="button" onClick={() => setCoolingQty(coolingQty + 1)}
                        className="w-10 h-10 rounded-full bg-sky-500 hover:bg-sky-600 text-white
                                   font-black text-lg shadow flex items-center justify-center
                                   cursor-pointer transition-all active:scale-90">
                  +
                </button>
              </div>
            </div>

            {/* Normal */}
            <div className={`glass-white rounded-3xl p-4 border-2 flex flex-col items-center transition-all duration-300
                ${normalQty > 0 ? 'border-blue-400 shadow-lg shadow-blue-200/50' : 'border-white/60'}`}>
              <div className="can-wrap w-full">
                <img src={NORMAL_IMG} alt="Normal Can"
                     className="w-full rounded-2xl shadow-lg animate-float-norm"
                     style={{ height: '300px', objectFit: 'cover' }} />
              </div>
              <p className="font-extrabold text-slate-800 text-sm mt-3">💧 Normal Can</p>
              <p className="text-blue-600 font-black text-lg">₹{plant.normal_price}/can</p>
              <div className="flex items-center gap-3 mt-2">
                <button type="button" onClick={() => setNormalQty(normalQty - 1)}
                        disabled={normalQty === 0}
                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-red-100 hover:text-red-600
                                   font-black text-lg border border-slate-200 disabled:opacity-40
                                   flex items-center justify-center cursor-pointer transition-all active:scale-90">
                  −
                </button>
                <span className="font-black text-2xl text-slate-800 w-8 text-center">{normalQty}</span>
                <button type="button" onClick={() => setNormalQty(normalQty + 1)}
                        className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white
                                   font-black text-lg shadow flex items-center justify-center
                                   cursor-pointer transition-all active:scale-90">
                  +
                </button>
              </div>
            </div>
          </div>

          {/* ── Live Price Ticker ──────────────────────────────────────────── */}
          {(coolingQty > 0 || normalQty > 0) && (
            <div className="animate-scale-in bg-gradient-to-r from-ocean-dark to-ocean-mid rounded-2xl p-4 text-white">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5 text-sm">
                  {coolingQty > 0 && <p>❄️ {coolingQty} × ₹{plant.cooling_price} = ₹{coolingQty * plant.cooling_price}</p>}
                  {normalQty  > 0 && <p>💧 {normalQty}  × ₹{plant.normal_price}  = ₹{normalQty * plant.normal_price}</p>}
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-70 uppercase tracking-wider">Total</p>
                  <p key={priceKey} className="text-3xl font-black price-flash">₹{totalAmount}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Customer Details ───────────────────────────────────────────── */}
          <div className="glass-white rounded-3xl p-5 border border-white/50 shadow-lg space-y-4 screen-enter">
            <h3 className="font-extrabold text-slate-800">👤 Your Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-wider">Full Name *</label>
                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                       placeholder="Your name" required
                       className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50
                                  text-slate-800 text-sm font-medium focus:outline-none focus:border-ocean-dark transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-wider">Mobile Number *</label>
                <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                       placeholder="10-digit mobile" required maxLength={10}
                       className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50
                                  text-slate-800 text-sm font-medium focus:outline-none focus:border-ocean-dark transition-all" />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-wider">Delivery Address *</label>
              <textarea value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)}
                        placeholder="House no., Street, Landmark, Area…" required rows={3}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50
                                   text-slate-800 text-sm font-medium focus:outline-none focus:border-ocean-dark
                                   transition-all resize-none" />
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-wider">📅 Delivery Date *</label>
                <input type="date" value={deliveryDate}
                       min={minDate.toISOString().split('T')[0]}
                       onChange={e => setDeliveryDate(e.target.value)} required
                       className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50
                                  text-slate-800 text-sm font-medium focus:outline-none focus:border-ocean-dark
                                  transition-all cursor-pointer" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-wider">⏰ Time Slot *</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {TIME_SLOTS.map(slot => (
                    <button key={slot.id} type="button"
                            onClick={() => setDeliveryTime(slot.id)}
                            className={`px-2 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer
                              ${deliveryTime === slot.id
                                ? 'bg-ocean-dark text-white border-ocean-dark shadow'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-ocean-mid'}`}>
                      <div>{slot.emoji}</div>
                      <div>{slot.label}</div>
                      <div className="text-[9px] opacity-70">{slot.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" id="order-proceed-btn"
                  className="w-full bg-gradient-to-r from-ocean-dark to-ocean-mid text-white
                             font-black py-4 rounded-2xl shadow-xl hover:shadow-2xl
                             transition-all duration-300 cursor-pointer btn-glow text-base">
            💳 Proceed to Payment →
          </button>
        </form>
      </div>
    </div>
  )
}
