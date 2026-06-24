import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrder } from '../context/OrderContext'
import { useAuth } from '../context/AuthContext'
import { placeOrder } from '../api/axios'
import toast from 'react-hot-toast'
import Bubbles from '../components/Bubbles'

// Floating coin particle component
function CoinParticle({ style }) {
  return (
    <div className="coin-particle" style={style}>
      💰
    </div>
  )
}

// UPI config
const UPI_VPA = 'watercan@upi'
const MERCHANT_NAME = 'Neeru Delivery'

export default function PaymentScreen() {
  const navigate = useNavigate()
  const { selectedPlant, coolingQty, normalQty, totalAmount,
          deliveryDate, deliveryTime, deliveryAddress,
          paymentMethod, setPaymentMethod, setPlacedOrder, createDemoOrder } = useOrder()
  const { user, demoMode } = useAuth()
  const [placing, setPlacing] = useState(false)
  const [coins, setCoins]     = useState([])
  const coinTimer = useRef(null)

  const upiLink = `upi://pay?pa=${UPI_VPA}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${totalAmount}&cu=INR`
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`

  useEffect(() => {
    if (!selectedPlant) navigate('/map')
  }, [selectedPlant])

  // Spawn coin particles on mount
  useEffect(() => {
    const spawnCoin = () => {
      const id = Date.now()
      const newCoin = {
        id,
        style: {
          left: `${10 + Math.random() * 80}%`,
          bottom: `${10 + Math.random() * 30}%`,
          animationDuration: `${1.5 + Math.random() * 1}s`,
          animationDelay: `${Math.random() * 0.5}s`,
          fontSize: `${20 + Math.random() * 16}px`,
        },
      }
      setCoins(prev => [...prev.slice(-8), newCoin])
    }
    coinTimer.current = setInterval(spawnCoin, 800)
    return () => clearInterval(coinTimer.current)
  }, [])

  const handleConfirm = async () => {
    if (!selectedPlant) return
    setPlacing(true)

    // Bypass backend completely in demo mode
    if (demoMode) {
      setTimeout(() => {
        createDemoOrder()
        toast.success('Demo order created! 🎉')
        navigate('/whatsapp')
        setPlacing(false)
      }, 800)
      return
    }

    try {
      const { data } = await placeOrder({
        plant_id:         selectedPlant._id,
        cooling_cans:     coolingQty,
        normal_cans:      normalQty,
        delivery_date:    deliveryDate,
        delivery_time:    deliveryTime,
        delivery_address: deliveryAddress,
        payment_method:   paymentMethod,
      })
      setPlacedOrder(data.order)

      // Backup cache real order locally
      try {
        const existing = JSON.parse(localStorage.getItem('wc_demo_orders') || '[]')
        if (!existing.some(o => o._id === data.order._id || o.order_id === data.order.order_id)) {
          localStorage.setItem('wc_demo_orders', JSON.stringify([data.order, ...existing]))
        }
      } catch {}

      toast.success('Order placed! 🎉')
      navigate('/whatsapp')
    } catch (err) {
      // Backend unavailable — use demo order
      if (!err.response || err.code === 'ERR_NETWORK' || err.code === 'ERR_CONNECTION_REFUSED') {
        createDemoOrder()
        toast.success('Demo order created! 🎉')
        navigate('/whatsapp')
      } else {
        toast.error(err.response?.data?.error || 'Failed to place order')
      }
    } finally {
      setPlacing(false)
    }
  }

  if (!selectedPlant) return null
  const plant = selectedPlant

  return (
    <div className="relative min-h-screen ocean-bg pt-20 pb-10 overflow-hidden">
      <Bubbles />
      {/* Floating coins */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {coins.map(c => <CoinParticle key={c.id} style={c.style} />)}
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4">
        <div className="text-center mb-6 screen-enter">
          <h1 className="text-3xl font-black text-white drop-shadow">💳 Payment</h1>
          <p className="text-white/70 text-sm mt-1">Choose your payment method</p>
        </div>

        <div className="space-y-4">
          {/* Order summary card */}
          <div className="glass-white rounded-3xl p-5 border border-white/50 shadow-lg screen-enter">
            <h3 className="font-extrabold text-slate-700 text-sm uppercase tracking-wider mb-3">Order Summary</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Plant</span>
                <span className="font-bold text-slate-800">{plant.name}</span>
              </div>
              {coolingQty > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">❄️ Cooling Cans × {coolingQty}</span>
                  <span className="font-bold text-sky-700">₹{coolingQty * plant.cooling_price}</span>
                </div>
              )}
              {normalQty > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">💧 Normal Cans × {normalQty}</span>
                  <span className="font-bold text-blue-700">₹{normalQty * plant.normal_price}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between">
                <span className="font-black text-slate-800">Total Amount</span>
                <span className="font-black text-xl text-ocean-dark">₹{totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Payment method selector */}
          <div className="glass-white rounded-3xl p-5 border border-white/50 shadow-lg space-y-4 screen-enter">
            <h3 className="font-extrabold text-slate-700">Select Payment Method</h3>

            {/* UPI */}
            <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all
              ${paymentMethod === 'upi' ? 'border-ocean-dark bg-sky-50' : 'border-slate-200 hover:border-sky-200'}`}>
              <input type="radio" name="payment" value="upi"
                     checked={paymentMethod === 'upi'}
                     onChange={() => setPaymentMethod('upi')}
                     className="mt-1 accent-ocean-dark cursor-pointer" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">📱</span>
                  <span className="font-extrabold text-slate-800">UPI Payment</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Recommended</span>
                </div>
                {paymentMethod === 'upi' && (
                  <div className="flex flex-col items-center gap-2 animate-scale-in">
                    <img
                      src={qrImageUrl}
                      alt="UPI QR Code"
                      className="qr-glow rounded-2xl border-4 border-ocean-mid/30"
                      style={{ width: '250px', height: '250px' }}
                    />
                    {/* Pay via App Button (Direct Deep Link) */}
                    <a
                      href={upiLink}
                      className="w-full max-w-[250px] py-3 px-4 rounded-xl
                                 bg-gradient-to-r from-ocean-dark to-ocean-mid
                                 text-white font-extrabold text-sm text-center
                                 flex items-center justify-center gap-2 shadow-md
                                 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all mt-1"
                    >
                      📱 Pay via UPI App (GPay/PhonePe)
                    </a>
                    <p className="text-[11px] text-slate-500 font-medium text-center mt-1">
                      Scan QR code or click the button above<br />
                      <span className="font-bold text-slate-700">UPI ID: {UPI_VPA}</span>
                    </p>
                    <p className="text-lg font-black text-ocean-dark">₹{totalAmount}</p>
                  </div>
                )}
              </div>
            </label>

            {/* Cash */}
            <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all
              ${paymentMethod === 'cod' ? 'border-ocean-dark bg-amber-50' : 'border-slate-200 hover:border-amber-200'}`}>
              <input type="radio" name="payment" value="cod"
                     checked={paymentMethod === 'cod'}
                     onChange={() => setPaymentMethod('cod')}
                     className="accent-ocean-dark cursor-pointer" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">💵</span>
                  <span className="font-extrabold text-slate-800">Cash on Delivery</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Pay ₹{totalAmount} in cash when cans arrive
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 screen-enter">
            <button onClick={() => navigate('/order')}
                    className="flex-1 bg-white/20 text-white font-bold py-4 rounded-2xl
                               hover:bg-white/30 transition-all cursor-pointer text-sm border border-white/30">
              ← Back
            </button>
            <button onClick={handleConfirm}
                    id="confirm-order-btn"
                    disabled={placing}
                    className="flex-[2] bg-gradient-to-r from-success to-emerald-400
                               text-white font-black py-4 px-6 rounded-2xl shadow-xl
                               hover:shadow-2xl transition-all duration-300 cursor-pointer
                               disabled:opacity-60 btn-glow text-sm">
              {placing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Placing Order…
                </span>
              ) : '✅ Confirm Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
