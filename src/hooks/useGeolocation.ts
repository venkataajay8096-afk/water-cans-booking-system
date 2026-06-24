import { useState, useRef, useCallback } from 'react';

export interface Coordinates {
  lat: number;
  lng: number;
  accuracy?: number; // in metres
}

// Haversine formula to calculate distance in km
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// ─── Real Reverse Geocoding via OpenStreetMap Nominatim (free, no key needed) ──
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) throw new Error('Geocode failed');
    const data = await res.json();

    // Build a concise address string from Nominatim parts
    const a = data.address || {};
    const parts = [
      a.house_number,
      a.road || a.pedestrian || a.footway,
      a.neighbourhood || a.suburb || a.village,
      a.city || a.town || a.county,
      a.state,
      a.postcode,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

export function useGeolocation() {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState<boolean>(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const lastGeocodedRef = useRef<{ lat: number; lng: number } | null>(null);

  // Stop watching
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsWatching(false);
    }
  }, []);

  // Start real-time location watching
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    // Clear previous watcher if any
    stopWatching();
    setLoading(true);
    setError(null);

    const onSuccess = async (position: GeolocationPosition) => {
      const { latitude: lat, longitude: lng, accuracy: acc } = position.coords;
      const coords: Coordinates = { lat, lng, accuracy: Math.round(acc) };

      setCoordinates(coords);
      setAccuracy(Math.round(acc));
      setLoading(false);
      setIsWatching(true);

      // Only reverse-geocode if moved more than ~20 m from last geocoded point
      const last = lastGeocodedRef.current;
      const movedFar =
        !last ||
        calculateDistance(last.lat, last.lng, lat, lng) > 0.02;

      if (movedFar) {
        lastGeocodedRef.current = { lat, lng };
        const realAddress = await reverseGeocode(lat, lng);
        setAddress(realAddress);
      }
    };

    const onError = (err: GeolocationPositionError) => {
      console.warn('Geolocation error:', err.message);
      setError(err.message || 'Unable to retrieve location');
      setLoading(false);
      setIsWatching(false);
    };

    const options: PositionOptions = {
      enableHighAccuracy: true, // Use GPS chip (not just WiFi/cell)
      timeout: 15000,
      maximumAge: 0,            // Always get a fresh reading
    };

    // First: get immediate single fix so the map doesn't wait
    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

    // Then: watch continuously for real-time updates
    const id = navigator.geolocation.watchPosition(onSuccess, onError, options);
    watchIdRef.current = id;
  }, [stopWatching]);

  return {
    coordinates,
    address,
    loading,
    error,
    accuracy,
    isWatching,
    detectLocation,
    stopWatching,
    setAddress,
  };
}
