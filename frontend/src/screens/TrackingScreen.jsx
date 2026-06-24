import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrder } from '../context/OrderContext'
import { useLocation } from '../context/LocationContext'   // ← correct import
import Bubbles from '../components/Bubbles'

/* ── helpers ──────────────────────────────────────────────────────────────── */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371, toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function lerp(a, b, t) {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t }
}

function etaStr(km) {
  const m = Math.ceil((km / 25) * 60)
  if (km < 0.08) return '🏠 Arriving now!'
  return m <= 1 ? '~1 min' : `~${m} min`
}

/* ── component ────────────────────────────────────────────────────────────── */
export default function TrackingScreen() {
  const navigate = useNavigate()
  const { selectedPlant, placedOrder, deliveryAddress, coolingQty, normalQty, totalAmount } = useOrder()
  const { coords, status: gpsStatus } = useLocation()          // ← correct hook

  const mapDivRef   = useRef(null)
  const mapRef      = useRef(null)
  const truckMarker = useRef(null)
  const routeLine   = useRef(null)
  const simTimer    = useRef(null)

  const [distKm,    setDistKm]    = useState(null)
  const [progress,  setProgress]  = useState(0)
  const [phase,     setPhase]     = useState('waiting')
  const [mapReady,  setMapReady]  = useState(false)

  /* ── wait for GPS before rendering map ──────────────────────────────────── */
  const gpsReady = coords && (coords.lat !== 0 || coords.lng !== 0)

  /* GPS position: use real coords, or fallback to a fixed default */
  const customerCoords = gpsReady
    ? coords
    : { lat: 17.3850, lng: 78.4867 }   // Hyderabad fallback

  /* Plant position: use selected plant, or offset from customer */
  const plantCoords = (selectedPlant?.location?.lat && selectedPlant?.location?.lat !== 0)
    ? selectedPlant.location
    : { lat: customerCoords.lat + 0.03, lng: customerCoords.lng + 0.03 }

  /* ── Build / rebuild Leaflet map ────────────────────────────────────────── */
  useEffect(() => {
    if (!mapDivRef.current) return

    let destroyed = false

    async function buildMap() {
      /* Load Leaflet CSS + JS once */
      if (!window.L) {
        const link = document.createElement('link')
        link.rel  = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
        await new Promise((res) => {
          const s = document.createElement('script')
          s.src   = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          s.onload = res
          document.head.appendChild(s)
        })
      }
      if (destroyed) return

      const L = window.L

      /* Remove any previous map instance */
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }

      const midLat = (plantCoords.lat + customerCoords.lat) / 2
      const midLng = (plantCoords.lng + customerCoords.lng) / 2

      const map = L.map(mapDivRef.current, {
        center:      [midLat, midLng],
        zoom:        13,
        zoomControl: true,
        scrollWheelZoom: false,
      })
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      /* ── 🏠 Customer / destination marker ─────────────────────────────── */
      const homeIcon = L.divIcon({
        className: '',
        iconSize:  [46, 56],
        iconAnchor:[23, 56],
        html: `<div style="position:relative;width:46px;height:56px">
          <svg width="46" height="56" viewBox="0 0 46 56" xmlns="http://www.w3.org/2000/svg">
            <path d="M23 2C23 2 4 21 4 33C4 44.5 12.7 54 23 54C33.3 54 42 44.5 42 33C42 21 23 2 23 2Z"
                  fill="#06D6A0" stroke="white" stroke-width="2.5"/>
            <text x="23" y="37" font-size="19" text-anchor="middle" dominant-baseline="middle">🏠</text>
          </svg>
        </div>`,
      })
      L.marker([customerCoords.lat, customerCoords.lng], { icon: homeIcon, zIndexOffset: 500 })
        .addTo(map)
        .bindPopup(`<b>📍 Your Delivery Address</b><br/><small>${deliveryAddress || 'Your GPS location'}</small>`)

      /* ── 💧 Plant / origin marker ─────────────────────────────────────── */
      const plantIcon = L.divIcon({
        className: '',
        iconSize:  [40, 40],
        iconAnchor:[20, 40],
        html: `<div style="width:40px;height:40px;background:linear-gradient(135deg,#0077B6,#00B4D8);
                    border:3px solid white;border-radius:50%;display:flex;align-items:center;
                    justify-content:center;font-size:20px;
                    box-shadow:0 4px 16px rgba(0,119,182,0.5)">💧</div>`,
      })
      L.marker([plantCoords.lat, plantCoords.lng], { icon: plantIcon })
        .addTo(map)
        .bindPopup(`<b>💧 ${selectedPlant?.name || 'Water Plant'}</b><br/><small>${selectedPlant?.address || ''}</small>`)

      /* ── 🚚 Truck marker (starts at plant) ────────────────────────────── */
      const mkTruckIcon = () => L.divIcon({
        className: '',
        iconSize:  [52, 52],
        iconAnchor:[26, 26],
        html: `<div style="width:52px;height:52px;background:linear-gradient(135deg,#0077B6,#00B4D8);
                    border:3px solid white;border-radius:50%;display:flex;align-items:center;
                    justify-content:center;font-size:26px;
                    box-shadow:0 4px 24px rgba(0,119,182,0.7);
                    animation:truckPulse 1.4s ease-in-out infinite">🚚</div>`,
      })
      const truck = L.marker([plantCoords.lat, plantCoords.lng], {
        icon: mkTruckIcon(), zIndexOffset: 1000,
      }).addTo(map)
      truck.bindPopup('<b>🚚 Delivery Boy</b><br/><small>En route to your location</small>')
      truckMarker.current = truck

      /* ── Dashed route line ────────────────────────────────────────────── */
      const line = L.polyline(
        [[plantCoords.lat, plantCoords.lng], [customerCoords.lat, customerCoords.lng]],
        { color: '#0077B6', weight: 4, opacity: 0.55, dashArray: '12, 8' }
      ).addTo(map)
      routeLine.current = line

      /* Fit map */
      try {
        map.fitBounds(
          L.latLngBounds([plantCoords.lat, plantCoords.lng], [customerCoords.lat, customerCoords.lng]),
          { padding: [60, 60], maxZoom: 15 }
        )
      } catch { map.setView([midLat, midLng], 13) }

      setMapReady(true)
    }

    buildMap()

    return () => {
      destroyed = true
      clearInterval(simTimer.current)
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpsReady])   // rebuild when GPS coords arrive

  /* ── Simulation: move truck plant → customer ────────────────────────────── */
  useEffect(() => {
    if (!mapReady) return

    clearInterval(simTimer.current)

    const STEPS    = 60
    const INTERVAL = 3000   // ms
    let   step     = 0

    const initialDist = haversine(plantCoords.lat, plantCoords.lng, customerCoords.lat, customerCoords.lng)
    setDistKm(initialDist)
    setPhase(initialDist > 15 ? 'waiting' : 'enroute')
    setProgress(0)

    simTimer.current = setInterval(() => {
      step++
      const t   = Math.min(step / STEPS, 1)
      const pos = lerp(plantCoords, customerCoords, t)

      if (truckMarker.current) truckMarker.current.setLatLng([pos.lat, pos.lng])
      if (routeLine.current)   routeLine.current.setLatLngs([[pos.lat, pos.lng], [customerCoords.lat, customerCoords.lng]])

      const rem = haversine(pos.lat, pos.lng, customerCoords.lat, customerCoords.lng)
      setDistKm(rem)
      setProgress(t)

      if      (t < 0.05)       setPhase('waiting')
      else if (rem > 0.5)      setPhase('enroute')
      else if (rem > 0.08)     setPhase('nearby')
      else                     setPhase('delivered')

      if (t >= 1) clearInterval(simTimer.current)
    }, INTERVAL)

    return () => clearInterval(simTimer.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady])

  /* ── Phase config ─────────────────────────────────────────────────────── */
  const PHASE = {
    waiting:   { bg: 'bg-amber-50 border-amber-200',   dot: 'bg-amber-400 animate-pulse',   msg: '⏳ Delivery boy is being assigned…' },
    enroute:   { bg: 'bg-sky-50 border-sky-200',       dot: 'bg-sky-500 animate-ping',       msg: '🚚 On the way to your address!' },
    nearby:    { bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500 animate-bounce', msg: '🔔 Almost there — be ready!' },
    delivered: { bg: 'bg-green-50 border-green-200',   dot: 'bg-green-500',                  msg: '✅ Delivered! Enjoy your water 💧' },
  }
  const p = PHASE[phase] || PHASE.waiting
  const totalDist = haversine(plantCoords.lat, plantCoords.lng, customerCoords.lat, customerCoords.lng)

  return (
    <div className="relative min-h-screen ocean-bg pt-20 pb-10 overflow-hidden">
      <Bubbles />

      <div className="relative z-10 max-w-2xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-4 screen-enter">
          <button onClick={() => navigate(-1)}
                  className="text-white/60 hover:text-white text-sm font-semibold
                             flex items-center gap-1 mb-2 cursor-pointer mx-auto transition-colors">
            ← Back
          </button>
          <h1 className="text-3xl font-black text-white drop-shadow">🚚 Live Tracking</h1>
          {placedOrder?.order_id && (
            <p className="text-white/60 text-xs mt-1 font-mono">{placedOrder.order_id}</p>
          )}
        </div>

        <div className="space-y-4">

          {/* GPS loading state */}
          {!gpsReady && (
            <div className="glass-white rounded-2xl px-4 py-3 border border-white/50
                            flex items-center gap-3 screen-enter">
              <div className="w-4 h-4 rounded-full bg-blue-400 animate-ping shrink-0" />
              <span className="text-slate-600 font-semibold text-sm">
                {gpsStatus === 'detecting' ? 'Getting your GPS location…' : 'Locating your address…'}
              </span>
            </div>
          )}

          {/* Status banner */}
          <div className={`glass-white rounded-2xl px-4 py-3 border flex items-center
                           justify-between gap-3 screen-enter ${p.bg}`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${p.dot} shrink-0`} />
              <span className="font-bold text-sm text-slate-700">{p.msg}</span>
            </div>
            {distKm !== null && phase !== 'delivered' && (
              <div className="text-right shrink-0">
                <p className="font-black text-lg leading-none text-slate-800">
                  {distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(1)} km`}
                </p>
                <p className="text-[11px] text-slate-400 font-semibold">{etaStr(distKm)}</p>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="glass-white rounded-2xl p-4 border border-white/50 screen-enter">
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
              <span>💧 {selectedPlant?.name || 'Plant'}</span>
              <span>🏠 Your Address</span>
            </div>
            <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-[3000ms]
                           bg-gradient-to-r from-ocean-dark to-ocean-mid"
                style={{ width: `${Math.max(4, Math.round(progress * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
              <span>Start</span>
              <span className="font-bold text-slate-500">{Math.round(progress * 100)}% complete</span>
              <span>Destination</span>
            </div>
            {/* Truck emoji slider */}
            <div className="relative h-6 mt-1">
              <div
                className="absolute text-lg transition-all duration-[3000ms] -translate-x-1/2"
                style={{ left: `${Math.max(4, Math.round(progress * 100))}%` }}
              >
                🚚
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="glass-white rounded-3xl overflow-hidden border border-white/50 shadow-2xl screen-enter">

            {/* Too-far overlay */}
            {totalDist > 15 && progress < 0.05 && (
              <div className="relative z-20 bg-amber-50 border-b border-amber-100 px-4 py-3
                              flex items-center gap-3">
                <span className="text-2xl">⏳</span>
                <div>
                  <p className="font-bold text-amber-800 text-sm">Plant is {totalDist.toFixed(1)} km away</p>
                  <p className="text-amber-600 text-xs font-medium">Tracking starts when the delivery boy sets out</p>
                </div>
              </div>
            )}

            {/* Map container */}
            <div style={{ height: '360px', position: 'relative' }}>
              {!mapReady && (
                <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center gap-3 z-10">
                  <div className="text-5xl animate-bounce">🚚</div>
                  <p className="text-slate-500 font-semibold text-sm">Loading live map…</p>
                </div>
              )}
              <div ref={mapDivRef} style={{ width: '100%', height: '100%' }} />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 px-4 py-3 border-t border-slate-100
                            text-xs font-semibold text-slate-500 bg-slate-50">
              <span className="flex items-center gap-1"><span>🚚</span> Delivery Boy</span>
              <span className="flex items-center gap-1"><span>🏠</span> Your Address</span>
              <span className="flex items-center gap-1"><span>💧</span> Water Plant</span>
              <span className="ml-auto text-[10px] text-slate-400">Live simulation</span>
            </div>
          </div>

          {/* Delivery address */}
          <div className="glass-white rounded-3xl p-5 border border-white/50 shadow-lg screen-enter">
            <h3 className="font-extrabold text-slate-600 text-xs uppercase tracking-widest mb-3">
              📍 Delivery Address
            </h3>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl shrink-0">🏠</div>
              <div>
                <p className="font-bold text-slate-800 text-sm leading-snug">
                  {deliveryAddress || (gpsReady ? 'Your current GPS location' : 'Getting location…')}
                </p>
                {coords && (
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Order summary — show whatever we have */}
          <div className="glass-white rounded-3xl p-5 border border-white/50 shadow-lg screen-enter">
            <h3 className="font-extrabold text-slate-600 text-xs uppercase tracking-widest mb-3">
              📦 Order Summary
            </h3>
            <div className="space-y-2 text-sm">
              {selectedPlant && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Plant</span>
                  <span className="font-bold text-slate-800">{selectedPlant.name}</span>
                </div>
              )}
              {placedOrder?.createdAt && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Booked At</span>
                  <span className="font-bold text-slate-700">
                    {new Date(placedOrder.createdAt).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true
                    })}
                  </span>
                </div>
              )}
              {(placedOrder?.cooling_cans ?? coolingQty) > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">❄️ Cooling Cans</span>
                  <span className="font-bold text-sky-700">× {placedOrder?.cooling_cans ?? coolingQty}</span>
                </div>
              )}
              {(placedOrder?.normal_cans ?? normalQty) > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">💧 Normal Cans</span>
                  <span className="font-bold text-blue-700">× {placedOrder?.normal_cans ?? normalQty}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <span className="font-black text-slate-800">Total</span>
                <span className="font-black text-xl text-ocean-dark">₹{placedOrder?.total_amount ?? totalAmount ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Call plant */}
          {selectedPlant?.phone && (
            <a
              href={`tel:${selectedPlant.phone.replace(/[^\d+]/g, '')}`}
              className="w-full py-3 rounded-2xl bg-white/15 border border-white/30 text-white
                         font-bold text-sm hover:bg-white/25 transition-all cursor-pointer
                         flex items-center justify-center gap-2 text-center"
            >
              📞 Call {selectedPlant.name}
            </a>
          )}
        </div>
      </div>

      <style>{`
        @keyframes truckPulse {
          0%,100%{ box-shadow:0 4px 20px rgba(0,119,182,0.6); transform:scale(1); }
          50%     { box-shadow:0 4px 36px rgba(0,180,216,0.9); transform:scale(1.1); }
        }
      `}</style>
    </div>
  )
}
