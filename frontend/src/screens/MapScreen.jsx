import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrder } from '../context/OrderContext'
import Map from '../components/Map'
import Bubbles from '../components/Bubbles'

export default function MapScreen() {
  const navigate = useNavigate()
  const { setPlant, selectedPlant } = useOrder()
  const [plants, setPlants] = useState([])

  const handleSelectPlant = (plant) => {
    setPlant(plant)
  }

  const handleProceed = () => {
    if (!selectedPlant) return
    navigate('/plant')
  }

  return (
    <div className="relative min-h-screen ocean-bg pt-20 pb-10 overflow-x-hidden">
      <Bubbles />

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6 screen-enter">
          <h1 className="text-3xl font-black text-white drop-shadow">📍 Nearby Water Plants</h1>
          <p className="text-white/70 text-sm mt-1 font-medium">
            GPS is detecting plants within 10 km of your location
          </p>
        </div>

        {/* Map component */}
        <div className="glass-white rounded-3xl p-5 shadow-2xl mb-5 border border-white/50 screen-enter">
          <Map
            plants={plants}
            setPlants={setPlants}
            selectedPlant={selectedPlant}
            onSelectPlant={handleSelectPlant}
          />
        </div>

        {/* Plant cards */}
        {plants.length > 0 && (
          <div className="space-y-3 screen-enter">
            <h2 className="text-white font-extrabold text-lg px-1">
              💧 {plants.length} Water Plants Found
            </h2>
            {plants.map((plant, idx) => (
              <div
                key={plant._id}
                onClick={() => handleSelectPlant(plant)}
                className={`animate-slide-in-bottom cursor-pointer rounded-2xl p-4 border-2 transition-all duration-200 glass-white
                  stagger-${Math.min(idx + 1, 6)} shadow-lg
                  ${selectedPlant?._id === plant._id
                    ? 'border-ocean-dark ring-2 ring-ocean-mid/30'
                    : 'border-white/60 hover:border-ocean-mid/60'}`}
              >
                <div className="flex justify-between items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-800">{plant.name}</span>
                      {selectedPlant?._id === plant._id && (
                        <span className="text-[10px] font-bold bg-ocean-dark text-white px-2 py-0.5 rounded-full">SELECTED</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{plant.address}</p>
                    <div className="flex flex-wrap gap-x-3 mt-1.5 text-xs font-semibold">
                      <span className="text-emerald-600">📍 {plant.distance} km</span>
                      <span className="text-amber-600">⭐ {plant.rating?.toFixed?.(1) || plant.rating}</span>
                      <span className="text-slate-500">{plant.phone}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-sky-700">❄️ ₹{plant.cooling_price}/can</p>
                    <p className="text-xs font-bold text-blue-600">💧 ₹{plant.normal_price}/can</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Proceed button */}
        {selectedPlant && (
          <div className="mt-6 animate-scale-in">
            <button
              onClick={handleProceed}
              id="map-proceed-btn"
              className="w-full bg-gradient-to-r from-ocean-dark to-ocean-mid text-white
                         font-black py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl
                         transition-all duration-300 flex items-center justify-center gap-2
                         text-base cursor-pointer btn-glow"
            >
              ✅ Book from {selectedPlant.name} →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
