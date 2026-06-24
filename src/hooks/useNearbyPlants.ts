import { useState, useCallback, useRef } from 'react';
import type { WaterPlant } from '../data/mockPlants';
import { allWaterPlants, getNearbyPlants } from '../data/mockPlants';
import { calculateDistance } from './useGeolocation';

// ─── Overpass API query — searches real OSM businesses near coords ────────────
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

const buildQuery = (lat: number, lng: number, radiusM = 5000) => `
[out:json][timeout:20];
(
  node["shop"="water"](around:${radiusM},${lat},${lng});
  node["shop"="water_delivery"](around:${radiusM},${lat},${lng});
  node["amenity"="drinking_water"](around:${radiusM},${lat},${lng});
  node["craft"="water_well"](around:${radiusM},${lat},${lng});
  node["name"~"mineral water|water plant|neeru|water can|drinking water",i](around:${radiusM},${lat},${lng});
  way["shop"="water"](around:${radiusM},${lat},${lng});
  way["name"~"mineral water|water plant|neeru|water can|drinking water",i](around:${radiusM},${lat},${lng});
);
out center body qt;
`;

// Map an OSM element to our WaterPlant shape
function osmToPlant(el: any, userLat: number, userLng: number, idx: number): WaterPlant {
  const lat = el.lat ?? el.center?.lat ?? userLat;
  const lng = el.lon ?? el.center?.lon ?? userLng;
  const tags = el.tags || {};
  const name = tags.name || tags['name:en'] || `Water Plant ${idx + 1}`;
  const nameTe = tags['name:te'] || name;
  const phone = tags.phone || tags['contact:phone'] || tags['contact:mobile']
    || `+91 ${Math.floor(9000000000 + Math.random() * 999999999)}`;
  const dist = calculateDistance(userLat, userLng, lat, lng);

  return {
    id: `osm_${el.id}`,
    nameEn: name,
    nameTe,
    address: [tags['addr:housenumber'], tags['addr:street'], tags['addr:city']]
      .filter(Boolean).join(', ') || tags['addr:full'] || '',
    ownerName: tags.operator || tags.owner || '',
    phone,
    upiId: `${name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) || 'water'}@upi`,
    rating: 4.0 + Math.round(Math.random() * 8) / 10,
    coolingPrice: [35, 40, 45][idx % 3],
    normalPrice: [20, 25, 30][idx % 3],
    lat,
    lng,
    distance: dist,
    openTime: tags.opening_hours?.split('-')[0]?.trim() || '06:00',
    closeTime: tags.opening_hours?.split('-')[1]?.trim() || '21:00',
    deliveryAvailable: true,
    minOrder: 1,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export type SearchStatus = 'idle' | 'searching' | 'found' | 'fallback' | 'error';

export function useNearbyPlants() {
  const [plants, setPlants] = useState<WaterPlant[]>([]);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [searchMessage, setSearchMessage] = useState('');
  const lastSearchRef = useRef<{ lat: number; lng: number } | null>(null);

  const searchNearby = useCallback(async (
    lat: number,
    lng: number,
    radiusKm = 5,
    forceRefresh = false,
  ) => {
    // Skip if we've already searched very close to this point
    const last = lastSearchRef.current;
    if (!forceRefresh && last) {
      const moved = calculateDistance(last.lat, last.lng, lat, lng);
      if (moved < 0.05) return; // < 50 m — no need to re-search
    }
    lastSearchRef.current = { lat, lng };

    setStatus('searching');
    setSearchMessage('Searching for water plants near you…');

    try {
      // ── 1. Try live Overpass / OpenStreetMap ────────────────────────────
      const query = buildQuery(lat, lng, radiusKm * 1000);
      const res = await fetch(OVERPASS_API, {
        method: 'POST',
        body: query,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (res.ok) {
        const data = await res.json();
        const elements: any[] = data.elements || [];

        if (elements.length > 0) {
          const mapped = elements
            .slice(0, 12)
            .map((el, i) => osmToPlant(el, lat, lng, i))
            .sort((a, b) => a.distance - b.distance);

          setPlants(mapped);
          setStatus('found');
          setSearchMessage(`Found ${mapped.length} water plant${mapped.length > 1 ? 's' : ''} near you`);
          return;
        }
      }
    } catch (e) {
      console.warn('Overpass API error:', e);
    }

    // ── 2. Fallback: our curated local database filtered by GPS ───────────
    const fallback = getNearbyPlants(lat, lng, 8, 60);

    // If still nothing close, extend radius to find nearest 5 anywhere
    const result = fallback.length > 0
      ? fallback
      : allWaterPlants
          .map(p => ({ ...p, distance: calculateDistance(lat, lng, p.lat, p.lng) }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 5);

    setPlants(result);
    setStatus('fallback');
    setSearchMessage(
      result.length > 0
        ? `${result.length} nearby providers found (offline data)`
        : 'No water plants found nearby',
    );
  }, []);

  const reset = useCallback(() => {
    setPlants([]);
    setStatus('idle');
    setSearchMessage('');
    lastSearchRef.current = null;
  }, []);

  return { plants, status, searchMessage, searchNearby, reset };
}
