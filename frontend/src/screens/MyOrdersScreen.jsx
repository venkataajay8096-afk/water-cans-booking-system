import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyOrders } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useOrder } from '../context/OrderContext'
import Bubbles from '../components/Bubbles'

const STATUS_COLORS = {
  placed:           'bg-sky-100 text-sky-700 border-sky-200',
  confirmed:        'bg-emerald-100 text-emerald-700 border-emerald-200',
  out_for_delivery: 'bg-amber-100 text-amber-700 border-amber-200',
  delivered:        'bg-green-100 text-green-700 border-green-200',
  cancelled:        'bg-red-100 text-red-700 border-red-200',
}

const STATUS_LABELS = {
  placed:           '📋 Placed',
  confirmed:        '✅ Confirmed',
  out_for_delivery: '🚚 Out for Delivery',
  delivered:        '📦 Delivered',
  cancelled:        '❌ Cancelled',
}

const TIME_LABELS = {
  morning:   '6 AM – 11 AM 🌅',
  afternoon: '11 AM – 4 PM ☀️',
  evening:   '4 PM – 9 PM 🌆',
}

export default function MyOrdersScreen() {
  const { isAuthenticated, demoMode } = useAuth()
  const { setPlacedOrder, setPlant, setCoolingQty, setNormalQty, setDeliveryAddress } = useOrder()
  const navigate = useNavigate()
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }

    if (demoMode) {
      try {
        const demoOrders = JSON.parse(localStorage.getItem('wc_demo_orders') || '[]')
        setOrders(demoOrders)
      } catch (err) {
        setOrders([])
      }
      setLoading(false)
    } else {
      getMyOrders()
        .then(({ data }) => setOrders(data.orders))
        .catch((err) => {
          // Network failure fallback to local demo orders
          if (!err.response || err.code === 'ERR_NETWORK' || err.code === 'ERR_CONNECTION_REFUSED') {
            try {
              const demoOrders = JSON.parse(localStorage.getItem('wc_demo_orders') || '[]')
              if (demoOrders.length > 0) {
                setOrders(demoOrders)
                setLoading(false)
                return
              }
            } catch {}
          }
          setError(err.response?.data?.error || 'Failed to load orders')
        })
        .finally(() => setLoading(false))
    }
  }, [isAuthenticated, demoMode])

  return (
    <div className="relative min-h-screen ocean-bg pt-20 pb-10 overflow-hidden">
      <Bubbles />

      <div className="relative z-10 max-w-2xl mx-auto px-4">
        <div className="text-center mb-6 screen-enter">
          <h1 className="text-3xl font-black text-white drop-shadow">📦 My Orders</h1>
          <p className="text-white/70 text-sm mt-1 font-medium">Your water can delivery history</p>
        </div>

        {loading && (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="skeleton h-32 rounded-3xl animate-pulse bg-white/10" />
            ))}
          </div>
        )}

        {error && (
          <div className="glass-white rounded-3xl p-8 text-center border border-white/50 screen-enter">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-slate-700 font-bold">{error}</p>
            <button onClick={() => window.location.reload()}
                    className="mt-4 text-ocean-dark font-bold hover:underline cursor-pointer">
              Try again →
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="glass-white rounded-3xl p-10 text-center border border-white/50 screen-enter">
            <div className="text-6xl mb-4 animate-water-drop">💧</div>
            <h3 className="text-xl font-extrabold text-slate-800">No orders yet</h3>
            <p className="text-slate-500 text-sm mt-2 font-medium">
              Your order history will appear here
            </p>
            <button onClick={() => navigate('/map')}
                    className="mt-5 bg-gradient-to-r from-ocean-dark to-ocean-mid text-white
                               font-black px-6 py-3 rounded-2xl shadow cursor-pointer
                               hover:shadow-lg transition-all btn-glow">
              🚰 Book Water Cans
            </button>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order, idx) => {
              const deliveryDateStr = new Date(order.delivery_date).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              })
              return (
                <div
                  key={order._id}
                  className={`glass-white rounded-3xl p-5 border border-white/50 shadow-lg
                              animate-slide-in-bottom stagger-${Math.min(idx + 1, 6)}`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-400">{order.order_id}</span>
                        {order.createdAt && (
                          <>
                            <span className="text-[10px] text-slate-300 font-bold">•</span>
                            <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                              Booked: {new Date(order.createdAt).toLocaleString('en-IN', {
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true
                              })}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="font-extrabold text-slate-800 text-sm mt-1">
                        {order.plant_id?.name || 'Water Plant'}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border shrink-0
                      ${STATUS_COLORS[order.order_status] || STATUS_COLORS.placed}`}>
                      {STATUS_LABELS[order.order_status] || order.order_status}
                    </span>
                  </div>

                  {/* Can details */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {order.cooling_cans > 0 && (
                      <div className="bg-sky-50 rounded-xl p-2.5 border border-sky-100">
                        <p className="text-xs font-bold text-sky-700">❄️ Cooling × {order.cooling_cans}</p>
                        <p className="text-sm font-black text-sky-800">₹{order.cooling_cans * order.cooling_price}</p>
                      </div>
                    )}
                    {order.normal_cans > 0 && (
                      <div className="bg-blue-50 rounded-xl p-2.5 border border-blue-100">
                        <p className="text-xs font-bold text-blue-700">💧 Normal × {order.normal_cans}</p>
                        <p className="text-sm font-black text-blue-800">₹{order.normal_cans * order.normal_price}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="text-xs text-slate-500 font-medium space-y-0.5">
                      <p>📅 {deliveryDateStr} · {TIME_LABELS[order.delivery_time] || order.delivery_time}</p>
                      <p>💳 {order.payment_method === 'upi' ? 'UPI' : 'Cash on Delivery'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Total</p>
                      <p className="font-black text-xl text-ocean-dark">₹{order.total_amount}</p>
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="flex gap-2 mt-3">
                    {/* Track button — show if not delivered/cancelled */}
                    {!['delivered','cancelled'].includes(order.order_status) && (
                      <button
                        onClick={() => {
                          setPlacedOrder(order)
                          if (order.plant_id) {
                            setPlant(order.plant_id)
                          }
                          setCoolingQty(order.cooling_cans || 0)
                          setNormalQty(order.normal_cans || 0)
                          setDeliveryAddress(order.delivery_address || '')
                          navigate('/track')
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5
                                   bg-emerald-50 hover:bg-emerald-100 border border-emerald-200
                                   text-emerald-700 text-xs font-bold py-2 rounded-xl
                                   transition-all cursor-pointer">
                        🚚 Track Live
                      </button>
                    )}

                    {/* WhatsApp contact */}
                    {order.plant_id?.whatsapp && (
                      <a
                        href={`https://wa.me/${order.plant_id.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(`Order ${order.order_id} — please update status`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5
                                   bg-green-50 hover:bg-green-100 border border-green-200
                                   text-green-700 text-xs font-bold py-2 rounded-xl
                                   transition-all cursor-pointer"
                      >
                        💬 WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
