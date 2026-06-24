import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Star, Phone } from 'lucide-react';
import type { WaterPlant } from '../data/mockPlants';

// ─── Google Maps API Key ───────────────────────────────────────────────────────
const GOOGLE_MAPS_API_KEY = "YOUR_API_KEY_HERE";

// ─── Fallback Plants ──────────────────────────────────────────────────────────
const FALLBACK_PLANTS: WaterPlant[] = [
  {
    id: 'p1',
    nameEn: 'Tirumala Water Plant',
    nameTe: 'తిరుమల వాటర్ ప్లాంట్',
    address: 'Tirumala Hills, Tirupati, AP',
    lat: 13.6534,
    lng: 79.3925,
    distance: 0.8,
    rating: 4.5,
    phone: '+91 98765 43210',
    coolingPrice: 40,
    normalPrice: 25,
    upiId: 'tirumalawater@upi',
    ownerName: 'Ravi Kumar',
    openTime: '05:30',
    closeTime: '21:30',
    deliveryAvailable: true,
    minOrder: 1,
  },
  {
    id: 'p2',
    nameEn: 'Sri Venkateswara Waters',
    nameTe: 'శ్రీ వెంకటేశ్వర వాటర్స్',
    address: 'Balaji Nagar, Tirupati, AP',
    lat: 13.6318,
    lng: 79.4215,
    distance: 1.2,
    rating: 4.2,
    phone: '+91 87654 32109',
    coolingPrice: 35,
    normalPrice: 20,
    upiId: 'venkateswarawater@gpay',
    ownerName: 'Suresh Babu',
    openTime: '06:00',
    closeTime: '21:00',
    deliveryAvailable: true,
    minOrder: 1,
  },
  {
    id: 'p3',
    nameEn: 'Balaji Pure Waters',
    nameTe: 'బాలాజీ ప్యూర్ వాటర్స్',
    address: 'Karakambadi Road, Tirupati, AP',
    lat: 13.6182,
    lng: 79.4089,
    distance: 2.1,
    rating: 4.8,
    phone: '+91 76543 21098',
    coolingPrice: 45,
    normalPrice: 30,
    upiId: 'balajiwater@phonepe',
    ownerName: 'Venkatesh Reddy',
    openTime: '06:00',
    closeTime: '22:00',
    deliveryAvailable: true,
    minOrder: 1,
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface WaterPlantMapProps {
  plants: WaterPlant[];
  setPlants: React.Dispatch<React.SetStateAction<WaterPlant[]>>;
  selectedPlant: WaterPlant | null;
  onSelectPlant: (plant: WaterPlant) => void;
  userCoords: { lat: number; lng: number } | null;
  setUserCoords: React.Dispatch<React.SetStateAction<{ lat: number; lng: number } | null>>;
  language: 'en' | 'te';
  onProceedToPlants: () => void;
  isDetectingLocation: boolean;
  gpsAccuracy: number | null;
  isWatchingLocation: boolean;
}

declare const google: any;

// ─── Load Google Maps script ──────────────────────────────────────────────────
function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.maps) { resolve(); return; }
    if (document.getElementById('gmap-script')) {
      // Already loading — wait for it
      const check = setInterval(() => {
        if ((window as any).google?.maps) { clearInterval(check); resolve(); }
      }, 100);
      return;
    }
    const script = document.createElement('script');
    script.id = 'gmap-script';
    script.src = GOOGLE_MAPS_API_KEY === "YOUR_API_KEY_HERE"
      ? '' // won't load — will use fallback
      : `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    if (!script.src) { reject(new Error('No API key')); return; }
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
}

// ─── Distance helper ──────────────────────────────────────────────────────────
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
}

// ─────────────────────────────────────────────────────────────────────────────

export const WaterPlantMap: React.FC<WaterPlantMapProps> = ({
  plants,
  setPlants,
  selectedPlant,
  onSelectPlant,
  userCoords,
  setUserCoords,
  language,
}) => {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  const [gpsStatus, setGpsStatus] = useState<'detecting' | 'found' | 'denied' | 'error'>('detecting');
  const [mapReady, setMapReady] = useState(false);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'found' | 'fallback'>('idle');
  const [useGoogleMaps, setUseGoogleMaps] = useState(false);

  // ── Init map (Leaflet fallback if no Google Maps API key) ─────────────────
  const initGoogleMap = useCallback(async (lat: number, lng: number) => {
    if (!mapDivRef.current) return;
    const center = { lat, lng };
    const map = new google.maps.Map(mapDivRef.current, {
      center,
      zoom: 14,
      styles: [
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#00B4D8' }] },
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { elementType: 'geometry', stylers: [{ color: '#f0f9ff' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#1e293b' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
      ],
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
    });
    mapRef.current = map;
    infoWindowRef.current = new google.maps.InfoWindow();

    // User marker
    userMarkerRef.current = new google.maps.Marker({
      position: center,
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#10b981',
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 3,
      },
      title: 'You are here',
      zIndex: 1000,
    });

    setMapReady(true);
  }, []);

  // ── Add animated markers ──────────────────────────────────────────────────
  const addPlantMarkers = useCallback((plantList: WaterPlant[], map: any) => {
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (!google?.maps) return;

    plantList.forEach(plant => {
      const name = language === 'te' ? plant.nameTe : plant.nameEn;
      const marker = new google.maps.Marker({
        position: { lat: plant.lat, lng: plant.lng },
        map,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 2 C18 2 4 16 4 26 C4 34.837 10.268 42 18 42 C25.732 42 32 34.837 32 26 C32 16 18 2 18 2Z"
                fill="#00B4D8" stroke="white" stroke-width="2"/>
              <circle cx="13" cy="22" r="4" fill="rgba(255,255,255,0.35)"/>
              <circle cx="22" cy="28" r="2" fill="rgba(255,255,255,0.25)"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(36, 44),
          anchor: new google.maps.Point(18, 44),
        },
        title: name,
        animation: google.maps.Animation.DROP,
      });

      marker.addListener('click', () => {
        infoWindowRef.current.setContent(`
          <div style="font-family:'Outfit',system-ui;padding:8px;min-width:200px">
            <h3 style="margin:0 0 4px;font-weight:800;font-size:14px;color:#1e293b">💧 ${name}</h3>
            <p style="margin:0 0 2px;font-size:12px;color:#475569">${plant.address}</p>
            <p style="margin:0 0 6px;font-size:12px;color:#0077B6;font-weight:700">
              ${plant.distance} km • ⭐ ${plant.rating.toFixed(1)} • ${plant.phone}
            </p>
            <p style="margin:0 0 8px;font-size:12px;color:#475569">
              ❄️ ₹${plant.coolingPrice}/can &nbsp;•&nbsp; 💧 ₹${plant.normalPrice}/can
            </p>
            <button onclick="window.__selectPlant('${plant.id}')"
              style="width:100%;background:#0077B6;color:white;border:none;padding:8px 12px;
                     border-radius:8px;font-weight:700;font-size:13px;cursor:pointer">
              📋 Book This Plant
            </button>
          </div>
        `);
        infoWindowRef.current.open(map, marker);
        onSelectPlant(plant);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds
    const bounds = new google.maps.LatLngBounds();
    plantList.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
    if (userCoords) bounds.extend({ lat: userCoords.lat, lng: userCoords.lng });
    map.fitBounds(bounds, { padding: 60 });
  }, [onSelectPlant, userCoords, language]);

  // ── Add Leaflet markers ───────────────────────────────────────────────────
  const addLeafletMarkers = useCallback((
    plantList: WaterPlant[], map: any, userLat: number, userLng: number, L: any
  ) => {
    plantList.forEach(plant => {
      const name = language === 'te' ? plant.nameTe : plant.nameEn;
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:36px;height:44px;cursor:pointer;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.3))">
          <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 2 C18 2 4 16 4 26 C4 34.837 10.268 42 18 42 C25.732 42 32 34.837 32 26 C32 16 18 2 18 2Z"
                  fill="#00B4D8" stroke="white" stroke-width="2"/>
            <circle cx="13" cy="22" r="4" fill="rgba(255,255,255,0.35)"/>
          </svg>
        </div>`,
        iconSize: [36, 44], iconAnchor: [18, 44], popupAnchor: [0, -46],
      });

      L.marker([plant.lat, plant.lng], { icon }).addTo(map).bindPopup(`
        <div style="font-family:'Outfit',system-ui;padding:8px;min-width:190px">
          <h3 style="margin:0 0 4px;font-weight:800;font-size:14px;color:#1e293b">💧 ${name}</h3>
          <p style="margin:0 0 4px;font-size:12px;color:#0077B6;font-weight:700">
            ${plant.distance} km • ⭐ ${plant.rating.toFixed(1)}
          </p>
          <p style="margin:0 0 8px;font-size:12px;color:#475569">
            ❄️ ₹${plant.coolingPrice}/can &nbsp;•&nbsp; 💧 ₹${plant.normalPrice}/can
          </p>
        </div>
      `).on('click', () => onSelectPlant(plant));
    });

    const bounds: [number,number][] = [
      [userLat, userLng],
      ...plantList.map(p => [p.lat, p.lng] as [number,number]),
    ];
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [onSelectPlant, language]);

  // ── Load Fallback Plants ──────────────────────────────────────────────────
  const loadFallbackPlants = useCallback((lat: number, lng: number, map?: any) => {
    const shifted = FALLBACK_PLANTS.map((p, i) => ({
      ...p,
      lat: lat + [0.005, -0.006, 0.009][i],
      lng: lng + [0.005, -0.005, -0.010][i],
      distance: haversine(lat, lng,
        lat + [0.005, -0.006, 0.009][i],
        lng + [0.005, -0.005, -0.010][i]),
    }));
    setPlants(shifted);
    setSearchStatus('fallback');
    onSelectPlant(shifted[0]);
    if (map) addPlantMarkers(shifted, map);
  }, [onSelectPlant, setPlants, addPlantMarkers]);

  // ── Google Places nearby search ───────────────────────────────────────────
  const searchWithGooglePlaces = useCallback((lat: number, lng: number, map: any) => {
    if (!google?.maps?.places) { loadFallbackPlants(lat, lng); return; }
    setSearchStatus('searching');
    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch(
      {
        location: { lat, lng },
        radius: 5000,
        keyword: 'water plant drinking water',
        type: 'establishment',
      },
      (results: any[], status: string) => {
        if (status === 'OK' && results.length > 0) {
          const mapped: WaterPlant[] = results.slice(0, 6).map((r, i) => ({
            id: r.place_id,
            nameEn: r.name,
            nameTe: r.name,
            address: r.vicinity || '',
            lat: r.geometry.location.lat(),
            lng: r.geometry.location.lng(),
            distance: haversine(lat, lng, r.geometry.location.lat(), r.geometry.location.lng()),
            rating: r.rating || (4.0 + Math.random() * 0.8),
            phone: `+91 ${Math.floor(9000000000 + Math.random() * 999999999)}`,
            coolingPrice: [35, 40, 45, 38, 42, 48][i % 6],
            normalPrice: [20, 25, 30, 22, 28, 32][i % 6],
            upiId: `${r.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12)}@upi`,
            ownerName: 'Local Owner',
            openTime: '06:00',
            closeTime: '21:00',
            deliveryAvailable: true,
            minOrder: 1,
          })).sort((a, b) => a.distance - b.distance);

          setPlants(mapped);
          setSearchStatus('found');
          onSelectPlant(mapped[0]);
          addPlantMarkers(mapped, map);
        } else {
          loadFallbackPlants(lat, lng, map);
        }
      }
    );
  }, [onSelectPlant, loadFallbackPlants, setPlants, addPlantMarkers]);

  // ── Load Leaflet as fallback (no Google Maps key) ─────────────────────────
  const initLeafletMap = useCallback(async (lat: number, lng: number) => {
    if (!mapDivRef.current) return;

    // Load Leaflet CSS + JS
    if (!(window as any).L) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);

      await new Promise<void>(resolve => {
        const js = document.createElement('script');
        js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        js.onload = () => resolve();
        document.head.appendChild(js);
      });
    }

    const L = (window as any).L;
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }

    const map = L.map(mapDivRef.current, { center: [lat, lng], zoom: 14, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;

    // User marker
    const userIcon = L.divIcon({
      className: '',
      html: `<div style="position:relative;width:20px;height:20px">
        <div style="width:20px;height:20px;background:#10b981;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(16,185,129,0.25)"></div>
        <div class="marker-pulse-ring" style="width:20px;height:20px;position:absolute;top:0;left:0;border-radius:50%;background:rgba(16,185,129,0.3);animation:markerPulse 1.5s infinite"></div>
      </div>`,
      iconSize: [20, 20], iconAnchor: [10, 10],
    });
    L.marker([lat, lng], { icon: userIcon }).addTo(map).bindPopup('<b>📍 You are here</b>');

    setMapReady(true);

    // Fetch nearby from Overpass
    setSearchStatus('searching');
    try {
      const query = `[out:json][timeout:20];(
        node["shop"="water"](around:5000,${lat},${lng});
        node["amenity"="drinking_water"](around:5000,${lat},${lng});
        node["name"~"water|neeru|drinking",i](around:5000,${lat},${lng});
      );out center body qt;`;
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST', body: query,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const data = await res.json();
      const elements = data.elements || [];
      if (elements.length > 0) {
        const mapped: WaterPlant[] = elements.slice(0, 6).map((el: any, i: number) => {
          const elLat = el.lat ?? el.center?.lat ?? lat;
          const elLng = el.lon ?? el.center?.lon ?? lng;
          const tags = el.tags || {};
          const name = tags.name || `Water Plant ${i + 1}`;
          return {
            id: `osm_${el.id}`,
            nameEn: name,
            nameTe: tags['name:te'] || name,
            address: [tags['addr:street'], tags['addr:city']].filter(Boolean).join(', ') || 'Nearby',
            lat: elLat, lng: elLng,
            distance: haversine(lat, lng, elLat, elLng),
            rating: 4.0 + Math.random() * 0.8,
            phone: `+91 ${Math.floor(9000000000 + Math.random() * 999999999)}`,
            coolingPrice: [35, 40, 45, 38][i % 4],
            normalPrice: [20, 25, 30, 22][i % 4],
            upiId: `${name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12)}@upi`,
            ownerName: tags.operator || 'Local Owner',
            openTime: '06:00',
            closeTime: '21:00',
            deliveryAvailable: true,
            minOrder: 1,
          };
        }).sort((a: WaterPlant, b: WaterPlant) => a.distance - b.distance);
        setPlants(mapped);
        setSearchStatus('found');
        onSelectPlant(mapped[0]);
        addLeafletMarkers(mapped, map, lat, lng, L);
        return;
      }
    } catch { /* fall through */ }

    const fallback = FALLBACK_PLANTS.map((p, i) => ({
      ...p,
      lat: lat + [0.005, -0.006, 0.009][i],
      lng: lng + [0.005, -0.005, -0.010][i],
      distance: haversine(lat, lng,
        lat + [0.005, -0.006, 0.009][i],
        lng + [0.005, -0.005, -0.010][i]),
    }));
    setPlants(fallback);
    setSearchStatus('fallback');
    onSelectPlant(fallback[0]);
    addLeafletMarkers(fallback, map, lat, lng, L);
  }, [onSelectPlant, setPlants, addLeafletMarkers, loadFallbackPlants]);

  // ── GPS Detection ─────────────────────────────────────────────────────────
  useEffect(() => {
    // Global handler for Google Maps InfoWindow button
    (window as any).__selectPlant = (plantId: string) => {
      const plant = plants.find(p => p.id === plantId);
      if (plant) onSelectPlant(plant);
    };

    if (!navigator.geolocation) {
      setGpsStatus('error');
      const defaultLat = 13.6288, defaultLng = 79.4192;
      setUserCoords({ lat: defaultLat, lng: defaultLng });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoords({ lat, lng });
        setGpsStatus('found');

        if (GOOGLE_MAPS_API_KEY !== "YOUR_API_KEY_HERE") {
          try {
            await loadGoogleMaps();
            setUseGoogleMaps(true);
            await initGoogleMap(lat, lng);
          } catch {
            await initLeafletMap(lat, lng);
          }
        } else {
          await initLeafletMap(lat, lng);
        }
      },
      async () => {
        setGpsStatus('denied');
        const defaultLat = 13.6288, defaultLng = 79.4192;
        setUserCoords({ lat: defaultLat, lng: defaultLng });
        await initLeafletMap(defaultLat, defaultLng);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => {
      if (mapRef.current) {
        if (useGoogleMaps) { /* Google Maps — no manual destroy needed */ }
        else if (mapRef.current.remove) mapRef.current.remove();
      }
    };
  }, [plants, onSelectPlant, setUserCoords, useGoogleMaps, initGoogleMap, initLeafletMap]);

  // When map is ready + Google Maps, do Places search
  useEffect(() => {
    if (mapReady && useGoogleMaps && userCoords && mapRef.current) {
      searchWithGooglePlaces(userCoords.lat, userCoords.lng, mapRef.current);
    }
  }, [mapReady, useGoogleMaps, userCoords, searchWithGooglePlaces]);

  return (
    <div className="w-full space-y-4">
      {/* GPS Status bar */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold border ${
        gpsStatus === 'found'
          ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-700'
          : gpsStatus === 'detecting'
          ? 'bg-sky-500/15 border-sky-400/40 text-sky-700'
          : 'bg-amber-500/15 border-amber-400/40 text-amber-700'
      } animate-fade-slide`}>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {gpsStatus === 'found' && (
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              gpsStatus === 'found' ? 'bg-emerald-500' :
              gpsStatus === 'detecting' ? 'bg-sky-500' : 'bg-amber-500'
            }`} />
          </span>
          <span>
            {gpsStatus === 'detecting' && '🛰️ Detecting your location…'}
            {gpsStatus === 'found' && '✅ GPS Location Found — Searching Nearby Plants'}
            {gpsStatus === 'denied' && '📍 Using default location (Tirupati) — GPS denied'}
            {gpsStatus === 'error' && '⚠️ GPS not available — Showing nearby plants'}
          </span>
        </div>
        {searchStatus === 'found' && (
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">
            {plants.length} plants found
          </span>
        )}
        {searchStatus === 'fallback' && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-lg">
            Sample data
          </span>
        )}
      </div>

      {/* Map container */}
      <div className="w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-sky-200/40 relative">
        {/* Skeleton while loading */}
        {!mapReady && (
          <div className="absolute inset-0 z-10 map-skeleton flex flex-col items-center justify-center gap-3">
            <div className="animate-water-drop text-5xl">💧</div>
            <p className="text-slate-500 font-semibold text-sm">Loading map…</p>
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-sky-400 animate-bounce"
                     style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={mapDivRef} className="w-full h-full" />
      </div>

      {/* Search status banner */}
      {searchStatus === 'searching' && (
        <div className="flex items-center gap-3 px-4 py-3 bg-sky-500/10 border border-sky-300/30 rounded-2xl text-sm font-semibold text-sky-700 animate-fade-slide">
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-sky-500 animate-bounce"
                   style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <span>🔍 Searching for water plants near you…</span>
        </div>
      )}

      {/* Plant cards (slide in with stagger) */}
      {plants.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
            <MapPin size={14} className="text-sky-500" />
            {searchStatus === 'found' ? `${plants.length} Water Plants Found` : 'Nearby Water Plants'}
          </h3>
          <div className="grid gap-3">
            {plants.map((plant, idx) => {
              const name = language === 'te' ? plant.nameTe : plant.nameEn;
              return (
                <div
                  key={plant.id}
                  onClick={() => onSelectPlant(plant)}
                  className={`animate-slide-in-bottom slide-delay-${Math.min(idx + 1, 6)} cursor-pointer rounded-2xl p-4 border-2 transition-all duration-200 ${
                    selectedPlant?.id === plant.id
                      ? 'border-sky-500 bg-sky-50/80 shadow-lg shadow-sky-200/40'
                      : 'border-slate-200/60 bg-white/80 hover:border-sky-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-800 text-sm">{name}</span>
                        {selectedPlant?.id === plant.id && (
                          <span className="text-[10px] font-bold bg-sky-500 text-white px-2 py-0.5 rounded-full">SELECTED</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{plant.address}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs">
                        <span className="font-bold text-emerald-600">📍 {plant.distance} km</span>
                        <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                          <Star size={11} className="fill-amber-400 stroke-amber-400" />{plant.rating.toFixed(1)}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Phone size={10} />{plant.phone}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] font-bold text-sky-700">❄️ ₹{plant.coolingPrice}/can</p>
                      <p className="text-[11px] font-bold text-blue-600">💧 ₹{plant.normalPrice}/can</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
