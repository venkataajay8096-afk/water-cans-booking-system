import React from 'react';
import { Star, MapPin, Phone, Check, ArrowLeft, ArrowRight, User, Clock, MessageSquare, Thermometer } from 'lucide-react';
import type { WaterPlant } from '../data/mockPlants';
import type { Language } from '../data/translations';
import { translations } from '../data/translations';

interface WaterPlantListProps {
  plants: WaterPlant[];
  selectedPlant: WaterPlant | null;
  onSelectPlant: (plant: WaterPlant) => void;
  language: Language;
  onBack: () => void;
  onNext: () => void;
}

export const WaterPlantList: React.FC<WaterPlantListProps> = ({
  plants,
  selectedPlant,
  onSelectPlant,
  language,
  onBack,
  onNext,
}) => {
  const t = translations[language];

  // Quick WhatsApp ping before formal booking
  const handleQuickWhatsApp = (plant: WaterPlant, e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanPhone = plant.phone.replace(/[^0-9+]/g, '');
    const msg = language === 'te'
      ? `నమస్కారం ${plant.ownerName || plant.nameEn} గారూ, నేను ${plant.nameTe} నుండి వాటర్ క్యాన్లు బుక్ చేయాలి.`
      : `Hello ${plant.ownerName || plant.nameEn}, I would like to book water cans from ${plant.nameEn}.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
        <button
          onClick={onBack}
          className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center hover:underline bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer"
        >
          <ArrowLeft size={14} className="mr-1.5" />
          <span>Back to Map</span>
        </button>
        <div className="text-center">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
            {language === 'en' ? 'Nearby Water Plants' : 'సమీప వాటర్ ప్లాంట్లు'}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {language === 'en'
              ? `${plants.length} plant${plants.length !== 1 ? 's' : ''} predicted from your GPS`
              : `మీ GPS ద్వారా ${plants.length} ప్లాంట్లు అంచనా వేయబడ్డాయి`}
          </p>
        </div>
        <div className="w-24"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {plants.map((plant) => {
          const isSelected = selectedPlant?.id === plant.id;
          const plantName = language === 'en' ? plant.nameEn : plant.nameTe;

          return (
            <div
              key={plant.id}
              onClick={() => onSelectPlant(plant)}
              className={`rounded-3xl border-2 cursor-pointer flex flex-col transition-all duration-300 relative overflow-hidden group hover:-translate-y-1.5 shadow-sm hover:shadow-lg ${
                isSelected
                  ? 'border-[#0077B6] bg-sky-50/50 dark:bg-sky-950/20 ring-4 ring-sky-500/10'
                  : 'border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-800/50 hover:border-sky-300 dark:hover:border-sky-700/80'
              }`}
            >
              {/* Selection checkmark badge */}
              {isSelected && (
                <div className="absolute top-0 right-0 bg-[#0077B6] text-white rounded-bl-2xl px-2.5 py-1.5 shadow-sm z-10">
                  <Check size={14} className="stroke-[3px]" />
                </div>
              )}

              {/* Distance badge top-left */}
              <div className="absolute top-3 left-3 bg-sky-500/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-xl shadow flex items-center space-x-1 z-10">
                <MapPin size={10} />
                <span>{plant.distance} km away</span>
              </div>

              {/* Card body */}
              <div className="p-5 pt-10 space-y-3 flex-1">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white group-hover:text-[#0077B6] dark:group-hover:text-sky-400 transition-colors leading-snug pr-8">
                  {plantName}
                </h3>

                {/* Owner predicted from GPS */}
                {plant.ownerName && (
                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 space-x-1.5">
                    <User size={11} className="text-sky-500 shrink-0" />
                    <span className="font-semibold">{plant.ownerName}</span>
                  </div>
                )}

                {/* Address predicted from GPS */}
                {plant.address && (
                  <div className="flex items-start text-[10px] text-slate-400 dark:text-slate-500 space-x-1.5 leading-snug">
                    <MapPin size={10} className="text-slate-300 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{plant.address}</span>
                  </div>
                )}

                {/* Rating row */}
                <div className="flex items-center space-x-2">
                  <span className="flex items-center text-[11px] font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-lg">
                    <Star size={10} className="fill-amber-400 stroke-amber-400 mr-1" />
                    {plant.rating}
                  </span>
                  {plant.openTime && plant.closeTime && (
                    <span className="flex items-center text-[10px] text-slate-400 space-x-1">
                      <Clock size={10} className="text-emerald-500" />
                      <span>{plant.openTime} – {plant.closeTime}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Price summary */}
              <div className="px-5 pt-3 pb-0 border-t border-slate-100 dark:border-slate-700/60 flex justify-between items-center text-xs">
                <div>
                  <div className="text-slate-400 flex items-center space-x-1">
                    <Thermometer size={9} className="text-sky-400" />
                    <span>{t.coolingPrice}</span>
                  </div>
                  <div className="font-black text-sm text-slate-800 dark:text-slate-200 mt-0.5">₹{plant.coolingPrice}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400">💧 {t.normalPrice}</div>
                  <div className="font-black text-sm text-slate-800 dark:text-slate-200 mt-0.5">₹{plant.normalPrice}</div>
                </div>
              </div>

              {/* Predicted Phone + Quick WhatsApp */}
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center text-[11px] text-slate-500 dark:text-slate-400 font-mono space-x-1.5">
                  <Phone size={11} className="text-[#0077B6] shrink-0" />
                  <span>{plant.phone}</span>
                </div>
                <button
                  onClick={(e) => handleQuickWhatsApp(plant, e)}
                  className="flex items-center space-x-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded-xl shadow transition-all cursor-pointer"
                  title={`WhatsApp ${plant.ownerName || plant.nameEn}`}
                >
                  <MessageSquare size={11} />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Select CTA buttons */}
      <div className="pt-4 flex justify-between items-center">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {selectedPlant
            ? (language === 'en'
                ? `✓ ${selectedPlant.nameEn} selected`
                : `✓ ${selectedPlant.nameTe} ఎంచుకోబడింది`)
            : (language === 'en' ? 'Tap a plant card to select' : 'ఒక ప్లాంట్ కార్డ్ క్లిక్ చేయండి')}
        </p>
        <button
          onClick={onNext}
          disabled={!selectedPlant}
          className="bg-gradient-to-r from-[#0077B6] to-[#00b4d8] hover:from-[#0096C7] hover:to-[#90E0EF] text-white font-extrabold py-3.5 px-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-sm flex items-center space-x-1.5 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <span>{language === 'en' ? 'Configure Cans & Delivery' : 'క్యాన్లు & డెలివరీ సెట్ చేయండి'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
