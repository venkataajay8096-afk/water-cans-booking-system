import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const LocationContext = createContext(null)

export const LocationProvider = ({ children }) => {
  const [coords,   setCoords]   = useState(null)   // { lat, lng }
  const [address,  setAddress]  = useState('')
  const [accuracy, setAccuracy] = useState(null)
  const [status,   setStatus]   = useState('idle') // idle | detecting | found | denied | error

  const detect = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error')
      return
    }
    setStatus('detecting')

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setCoords({ lat, lng })
        setAccuracy(Math.round(pos.coords.accuracy))
        setStatus('found')

        // Reverse geocode via Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          )
          const data = await res.json()
          const { road, suburb, city, town, village, state } = data.address || {}
          const readable = [road, suburb, city || town || village, state]
            .filter(Boolean)
            .join(', ')
          setAddress(readable)
        } catch {
          setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
        }
      },
      (err) => {
        console.warn('GPS error:', err.message)
        setStatus(err.code === 1 ? 'denied' : 'error')
        // Default fallback to Tirupati
        setCoords({ lat: 13.6288, lng: 79.4192 })
        setAddress('Tirupati, Andhra Pradesh (default)')
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    )
  }, [])

  // Auto-detect on mount
  useEffect(() => { detect() }, [detect])

  return (
    <LocationContext.Provider value={{ coords, address, accuracy, status, detect }}>
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = () => {
  const ctx = useContext(LocationContext)
  if (!ctx) throw new Error('useLocation must be used inside LocationProvider')
  return ctx
}
