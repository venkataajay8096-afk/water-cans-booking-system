import { useEffect, useRef, useState, useCallback } from 'react'
import { useLocation as useLocationCtx } from '../context/LocationContext'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE'

const FALLBACK_PLANTS = [
  {
    _id: '6678222c1f9a2e3b4c5d6e71', name: 'Tirumala Water Plant', owner_name: 'Ravi Kumar',
    phone: '+91 98765 43210', whatsapp: '+919876543210',
    address: 'Near your location',
    location: { lat: 0, lng: 0 },
    cooling_price: 30, normal_price: 15, rating: 4.5, total_reviews: 128, distance: 0.8,
  },
  {
    _id: '6678222c1f9a2e3b4c5d6e72', name: 'Sri Venkateswara Waters', owner_name: 'Suresh Babu',
    phone: '+91 87654 32109', whatsapp: '+918765432109',
    address: 'Near your location',
    location: { lat: 0, lng: 0 },
    cooling_price: 30, normal_price: 15, rating: 4.2, total_reviews: 89, distance: 1.2,
  },
  {
    _id: '6678222c1f9a2e3b4c5d6e73', name: 'Balaji Pure Waters', owner_name: 'Venkatesh Reddy',
    phone: '+91 76543 21098', whatsapp: '+917654321098',
    address: 'Near your location',
    location: { lat: 0, lng: 0 },
    cooling_price: 30, normal_price: 15, rating: 4.8, total_reviews: 213, distance: 2.1,
  },
]

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371, toR = (d) => (d * Math.PI) / 180
  const dLat = toR(lat2 - lat1), dLon = toR(lon2 - lon1)
  const a = Math.sin(dLat/2)**2 + Math.cos(toR(lat1))*Math.cos(toR(lat2))*Math.sin(dLon/2)**2
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(2))
}

export default function Map({ plants, setPlants, selectedPlant, onSelectPlant }) {
  const mapDivRef    = useRef(null)
  const mapRef       = useRef(null)
  const markersRef   = useRef([])
  const infoWinRef   = useRef(null)
  const { coords, status: gpsStatus } = useLocationCtx()
  const [mapReady,   setMapReady]   = useState(false)
  const [searchSt,   setSearchSt]   = useState('idle')
  const [searchInput, setSearchInput] = useState('')
  const [useGoogle,  setUseGoogle]  = useState(false)

  // ── Load Google Maps ──────────────────────────────────────────────────────
  const loadGoogle = useCallback(() => new Promise((res, rej) => {
    if (window.google?.maps) { res(); return }
    if (document.getElementById('gmap-s')) {
      const t = setInterval(() => { if(window.google?.maps){ clearInterval(t); res() } }, 100)
      return
    }
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') {
      rej(new Error('No API key')); return
    }
    const s = document.createElement('script')
    s.id = 'gmap-s'
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
    s.async = true; s.onload = res; s.onerror = rej
    document.head.appendChild(s)
  }), [])

  // ── Leaflet fallback ──────────────────────────────────────────────────────
  const initLeaflet = useCallback(async (lat, lng) => {
    if (!mapDivRef.current) return
    if (!window.L) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
      await new Promise(r => {
        const s = document.createElement('script')
        s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        s.onload = r; document.head.appendChild(s)
      })
    }
    const L = window.L
    if (mapRef.current?.remove) { mapRef.current.remove() }
    const map = L.map(mapDivRef.current, { center: [lat, lng], zoom: 14, zoomControl: true })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19,
    }).addTo(map)

    // User marker
    const uIcon = L.divIcon({
      className: '', iconSize: [24, 24], iconAnchor: [12, 12],
      html: `<div style="position:relative;width:24px;height:24px">
        <div style="width:24px;height:24px;background:#10b981;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(16,185,129,0.25)"></div>
      </div>`,
    })
    L.marker([lat, lng], { icon: uIcon, zIndexOffset: 1000 })
      .addTo(map).bindPopup('<b>📍 You are here</b>').openPopup()

    mapRef.current = map
    setMapReady(true)
    return { map, L }
  }, [])

  const addLeafletPlantMarkers = useCallback((plantList, map, L, userLat, userLng) => {
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    plantList.forEach(plant => {
      const icon = L.divIcon({
        className: '', iconSize: [36, 44], iconAnchor: [18, 44], popupAnchor: [0, -46],
        html: `<div style="width:36px;height:44px;cursor:pointer;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.3))">
          <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 2C18 2 4 16 4 26C4 34.837 10.268 42 18 42C25.732 42 32 34.837 32 26C32 16 18 2 18 2Z"
                  fill="#00B4D8" stroke="white" stroke-width="2"/>
            <circle cx="13" cy="22" r="4" fill="rgba(255,255,255,0.4)"/>
          </svg>
        </div>`,
      })
      const m = L.marker([plant.location.lat, plant.location.lng], { icon })
        .addTo(map)
        .bindPopup(`<div style="font-family:Outfit,sans-serif;padding:6px;min-width:180px">
          <h4 style="margin:0 0 4px;font-weight:800;font-size:13px;color:#1e293b">💧 ${plant.name}</h4>
          <p style="margin:0 0 2px;font-size:11px;color:#0077B6;font-weight:700">${plant.distance} km • ⭐${plant.rating}</p>
          <p style="margin:0 0 6px;font-size:11px;color:#475569">❄️ ₹${plant.cooling_price}/can • 💧 ₹${plant.normal_price}/can</p>
        </div>`)
        .on('click', () => onSelectPlant(plant))
      markersRef.current.push(m)
    })
    const bounds = [[userLat, userLng], ...plantList.map(p => [p.location.lat, p.location.lng])]
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
  }, [onSelectPlant])

  // ── Init Google Map ───────────────────────────────────────────────────────
  const initGoogle = useCallback((lat, lng) => {
    if (!mapDivRef.current || !window.google?.maps) return
    const map = new google.maps.Map(mapDivRef.current, {
      center: { lat, lng }, zoom: 14,
      styles: [
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#00B4D8' }] },
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { elementType: 'geometry', stylers: [{ color: '#f0f9ff' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
      ],
      disableDefaultUI: true, zoomControl: true,
    })
    new google.maps.Marker({
      position: { lat, lng }, map,
      icon: { path: google.maps.SymbolPath.CIRCLE, scale: 10,
               fillColor: '#10b981', fillOpacity: 1, strokeColor: 'white', strokeWeight: 3 },
      zIndex: 1000, title: 'You are here',
    })
    infoWinRef.current = new google.maps.InfoWindow()
    mapRef.current = map
    setMapReady(true)
    return map
  }, [])

  const addGooglePlantMarkers = useCallback((plantList, map) => {
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []
    plantList.forEach(plant => {
      const svgStr = `<svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 2C18 2 4 16 4 26C4 34.837 10.268 42 18 42C25.732 42 32 34.837 32 26C32 16 18 2 18 2Z"
              fill="#00B4D8" stroke="white" stroke-width="2"/>
        <circle cx="13" cy="22" r="4" fill="rgba(255,255,255,0.4)"/>
      </svg>`
      const marker = new google.maps.Marker({
        position: { lat: plant.location.lat, lng: plant.location.lng },
        map,
        icon: { url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgStr)}`,
                scaledSize: new google.maps.Size(36, 44),
                anchor: new google.maps.Point(18, 44) },
        animation: google.maps.Animation.DROP,
        title: plant.name,
      })
      marker.addListener('click', () => {
        infoWinRef.current.setContent(`
          <div style="font-family:Outfit,sans-serif;padding:8px;min-width:190px">
            <h4 style="margin:0 0 4px;font-weight:800;font-size:13px;color:#1e293b">💧 ${plant.name}</h4>
            <p style="margin:0 0 2px;font-size:11px;color:#475569">${plant.address}</p>
            <p style="margin:0 0 2px;font-size:12px;color:#0077B6;font-weight:700">${plant.distance} km • ⭐${plant.rating}</p>
            <p style="margin:0 0 8px;font-size:11px;color:#475569">❄️ ₹${plant.cooling_price}/can • 💧 ₹${plant.normal_price}/can</p>
            <button onclick="window.__gmap_select('${plant._id}')"
              style="width:100%;background:#0077B6;color:white;border:none;padding:7px;border-radius:8px;font-weight:700;cursor:pointer;font-size:12px">
              📋 Book This Plant
            </button>
          </div>`)
        infoWinRef.current.open(map, marker)
        onSelectPlant(plant)
      })
      markersRef.current.push(marker)
    })
    const b = new google.maps.LatLngBounds()
    plantList.forEach(p => b.extend({ lat: p.location.lat, lng: p.location.lng }))
    map.fitBounds(b, { padding: 60 })
  }, [onSelectPlant])

  // ── Reverse geocode a lat/lng to a street address string ──────────────────
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      const data = await res.json()
      const { road, suburb, neighbourhood, city, town, village, state } = data.address || {}
      return [road || neighbourhood, suburb, city || town || village, state].filter(Boolean).join(', ')
    } catch { return `${lat.toFixed(4)}, ${lng.toFixed(4)}` }
  }, [])

  // ── Overpass API: search real water shops near GPS ─────────────────────────
  const searchOverpass = useCallback(async (lat, lng, radiusKm = 5) => {
    const r   = radiusKm * 1000
    const q   = `[out:json][timeout:12];(node["shop"~"water|beverages|convenience"](around:${r},${lat},${lng});node["amenity"~"water_point|vending_machine"](around:${r},${lat},${lng});node["name"~"water|aqua|can|jar|drinking|neeru|jal",i](around:${r},${lat},${lng}););out body;`
    const res  = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`)
    const json = await res.json()
    return json.elements || []
  }, [])

  // ── Fetch plants from backend → Overpass → sample fallback ────────────────
  const fetchPlants = useCallback(async (lat, lng, map, L) => {
    setSearchSt('searching')

    // 1. Try backend API
    try {
      const { getNearbyPlants } = await import('../api/axios')
      const { data } = await getNearbyPlants(lat, lng, 10)
      if (data.plants?.length > 0) {
        const enriched = data.plants.map(p => ({
          ...p,
          distance: haversine(lat, lng, p.location.lat, p.location.lng),
        })).sort((a, b) => a.distance - b.distance)
        setPlants(enriched)
        setSearchSt('found')
        onSelectPlant(enriched[0])
        if (L) addLeafletPlantMarkers(enriched, map, L, lat, lng)
        else    addGooglePlantMarkers(enriched, map)
        return
      }
    } catch { /* try Overpass next */ }

    // 2. Try Overpass API for REAL shops near user's GPS
    try {
      const elements = await searchOverpass(lat, lng, 5)
      if (elements.length > 0) {
        const realPlants = await Promise.all(
          elements.slice(0, 6).map(async (el, i) => {
            const elLat = el.lat, elLng = el.lon
            const addr  = await reverseGeocode(elLat, elLng)
            const dist  = haversine(lat, lng, elLat, elLng)
            const names = ['Waters & Co.', 'Aqua Point', 'Pure Can Depot', 'Jal Delivery', 'Neeru Waters', 'H2O Hub']
            return {
              _id:           `osm_${el.id || i}`,
              name:          el.tags?.name || names[i % names.length],
              owner_name:    el.tags?.['contact:person'] || 'Local Owner',
              phone:         el.tags?.phone || el.tags?.['contact:phone'] || '+91 98765 00' + String(100 + i).slice(-3),
              whatsapp:      (el.tags?.phone || '+919876500' + (100 + i)).replace(/\D/g, ''),
              address:       addr,
              location:      { lat: elLat, lng: elLng },
              cooling_price: 30,
              normal_price:  15,
              rating:        parseFloat((4.0 + Math.random() * 0.9).toFixed(1)),
              total_reviews: Math.floor(30 + Math.random() * 200),
              distance:      dist,
            }
          })
        )
        const sorted = realPlants.sort((a, b) => a.distance - b.distance)
        setPlants(sorted)
        setSearchSt('found')
        onSelectPlant(sorted[0])
        if (L) addLeafletPlantMarkers(sorted, map, L, lat, lng)
        else    addGooglePlantMarkers(sorted, map)
        return
      }
    } catch { /* fall through */ }

    // 3. Last resort: position sample plants at user's real GPS location
    const offsets = [[0.006, 0.007], [-0.008, 0.004], [0.003, -0.009]]
    const shifted = FALLBACK_PLANTS.map((p, i) => ({
      ...p,
      location: { lat: lat + offsets[i][0], lng: lng + offsets[i][1] },
      distance: haversine(lat, lng, lat + offsets[i][0], lng + offsets[i][1]),
    })).sort((a, b) => a.distance - b.distance)
    const withAddr = await Promise.all(
      shifted.map(async (p) => ({
        ...p,
        address: await reverseGeocode(p.location.lat, p.location.lng),
      }))
    )
    setPlants(withAddr)
    setSearchSt('fallback')
    onSelectPlant(withAddr[0])
    if (L) addLeafletPlantMarkers(withAddr, map, L, lat, lng)
    else    addGooglePlantMarkers(withAddr, map)
  }, [setPlants, onSelectPlant, addLeafletPlantMarkers, addGooglePlantMarkers, searchOverpass, reverseGeocode])

  // ── Main init on GPS ready ────────────────────────────────────────────────
  useEffect(() => {
    if (!coords || mapRef.current) return
    window.__gmap_select = (id) => {
      const p = plants.find(x => x._id === id)
      if (p) onSelectPlant(p)
    }
    ;(async () => {
      const { lat, lng } = coords
      try {
        await loadGoogle()
        setUseGoogle(true)
        const map = initGoogle(lat, lng)
        await fetchPlants(lat, lng, map, null)
      } catch {
        const result = await initLeaflet(lat, lng)
        if (result) await fetchPlants(lat, lng, result.map, result.L)
      }
    })()
  }, [coords])

  // ── Manual city search (GPS denied fallback) ──────────────────────────────
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchInput.trim()) return
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchInput)}&format=json&limit=1`)
      const data = await res.json()
      if (data[0]) {
        const lat = parseFloat(data[0].lat), lng = parseFloat(data[0].lon)
        if (mapRef.current?.setView) mapRef.current.setView([lat, lng], 14)
        else if (mapRef.current?.setCenter) mapRef.current.setCenter({ lat, lng })
        await fetchPlants(lat, lng, mapRef.current, window.L || null)
      }
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-4">
      {/* GPS status */}
      <div className={`flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-semibold border
        ${gpsStatus === 'found' ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-700'
        : gpsStatus === 'detecting' ? 'bg-sky-500/10 border-sky-400/30 text-sky-700'
        : 'bg-amber-500/10 border-amber-400/30 text-amber-700'} animate-fade-slide`}>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {gpsStatus === 'found' && (
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5
              ${gpsStatus === 'found' ? 'bg-emerald-500' : gpsStatus === 'detecting' ? 'bg-sky-500 animate-pulse' : 'bg-amber-500'}`} />
          </span>
          <span>
            {gpsStatus === 'detecting' && '🛰️ Detecting your GPS location…'}
            {gpsStatus === 'found'     && '✅ GPS found — showing nearby plants'}
            {gpsStatus === 'denied'    && '⚠️ GPS denied — using default location'}
            {gpsStatus === 'error'     && '⚠️ GPS unavailable — using default location'}
          </span>
        </div>
        {searchSt !== 'idle' && (
          <span className={`text-xs px-2 py-1 rounded-lg font-bold
            ${searchSt === 'found' ? 'bg-emerald-100 text-emerald-700'
            : searchSt === 'searching' ? 'bg-sky-100 text-sky-700'
            : 'bg-amber-100 text-amber-700'}`}>
            {searchSt === 'searching' ? '⏳ Searching…'
             : searchSt === 'found'    ? `${plants.length} plants found`
             : 'Sample data'}
          </span>
        )}
      </div>

      {/* Manual search (shown if GPS denied) */}
      {(gpsStatus === 'denied' || gpsStatus === 'error') && (
        <form onSubmit={handleSearch}
              className="flex gap-2 glass-white rounded-2xl p-2 shadow border border-slate-200/60 animate-fade-slide">
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search city: Hyderabad, Tirupati, Bangalore…"
            className="flex-1 px-3 py-2 bg-transparent text-slate-800 text-sm font-medium focus:outline-none"
          />
          <button type="submit"
                  className="bg-ocean-dark text-white text-sm font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-ocean-darkest transition-colors">
            Search
          </button>
        </form>
      )}

      {/* Map */}
      <div className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-sky-200/30">
        {!mapReady && (
          <div className="absolute inset-0 z-10 skeleton flex flex-col items-center justify-center gap-3">
            <div className="text-5xl animate-water-drop">💧</div>
            <p className="text-slate-500 font-semibold">Loading map…</p>
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-sky-400 animate-bounce-dot"
                     style={{ animationDelay: `${i*0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={mapDivRef} className="w-full h-full" />
      </div>
    </div>
  )
}
