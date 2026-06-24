import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, MapPin, Loader2, Calendar, Clock } from 'lucide-react';
import type { WaterPlant } from '../data/mockPlants';
import { translations } from '../data/translations';

interface BookingFormProps {
  plant: WaterPlant;
  language: 'en' | 'te';
  customerName: string;
  setCustomerName: (v: string) => void;
  customerPhone: string;
  setCustomerPhone: (v: string) => void;
  coolingQty: number;
  setCoolingQty: (v: number) => void;
  normalQty: number;
  setNormalQty: (v: number) => void;
  deliveryAddress: string;
  setDeliveryAddress: (v: string) => void;
  deliveryDate: string;
  setDeliveryDate: (v: string) => void;
  deliveryTimeSlot: string;
  setDeliveryTimeSlot: (v: string) => void;
  onDetectLocation: () => void;
  isDetectingLocation: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

const TIME_SLOTS = [
  { id: 'morning',   label: 'Morning',   sub: '6:00 AM – 11:00 AM', emoji: '🌅' },
  { id: 'afternoon', label: 'Afternoon', sub: '11:00 AM – 4:00 PM',  emoji: '☀️' },
  { id: 'evening',   label: 'Evening',   sub: '4:00 PM – 9:00 PM',   emoji: '🌆' },
];

export const BookingForm: React.FC<BookingFormProps> = ({
  plant, language,
  customerName, setCustomerName,
  customerPhone, setCustomerPhone,
  coolingQty, setCoolingQty,
  normalQty, setNormalQty,
  deliveryAddress, setDeliveryAddress,
  deliveryDate, setDeliveryDate,
  deliveryTimeSlot, setDeliveryTimeSlot,
  onDetectLocation, isDetectingLocation,
  onSubmit, onBack,
}) => {
  const t = translations[language];
  const [priceKey, setPriceKey] = useState(0);
  const prevTotal = useRef(0);

  const totalPrice = coolingQty * plant.coolingPrice + normalQty * plant.normalPrice;

  useEffect(() => {
    if (totalPrice !== prevTotal.current) {
      setPriceKey(k => k + 1);
      prevTotal.current = totalPrice;
    }
  }, [totalPrice]);

  const changeCooling = (delta: number) => {
    const next = Math.max(0, coolingQty + delta);
    setCoolingQty(next);
  };

  const changeNormal = (delta: number) => {
    const next = Math.max(0, normalQty + delta);
    setNormalQty(next);
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <form onSubmit={onSubmit} className="space-y-6 screen-transition">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack}
          className="p-2.5 rounded-xl bg-white/80 border border-slate-200 text-sky-600 hover:bg-sky-50 transition-all cursor-pointer">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">
            {language === 'te' ? 'మీ ఆర్డర్ సెట్ చేయండి' : 'Configure Your Order'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'te' ? 'ప్లాంట్:' : 'from'}{' '}
            <span className="font-bold text-sky-600">
              {language === 'te' ? plant.nameTe : plant.nameEn}
            </span>
          </p>
        </div>
      </div>

      {/* ── Water Can Selection — LARGE IMAGES ────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Cooling Can */}
        <div className={`relative rounded-3xl overflow-visible border-2 p-4 flex flex-col items-center transition-all duration-300 ${
          coolingQty > 0
            ? 'border-sky-500 bg-sky-50/90 shadow-lg shadow-sky-200/50'
            : 'border-slate-200/70 bg-white/80'
        }`}>
          {/* Ice crystal orbit */}
          {coolingQty > 0 && (
            <div className="ice-crystal-orbit" style={{ top: '80px', left: '50%' }}>
              {['❄️','🧊','❄️','🧊','❄️'].map((c, i) => (
                <span key={i} className="ice-crystal-particle" style={{ fontSize: '14px' }}>{c}</span>
              ))}
            </div>
          )}

          <div className="can-ripple-trigger">
            <img
              src="https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&h=800&fit=crop&q=80"
              alt="Cooling Can"
              className="w-full h-[300px] object-cover rounded-2xl shadow-lg animate-float-cooling"
              style={{ minHeight: '300px' }}
            />
          </div>

          <div className="mt-3 text-center">
            <p className="font-extrabold text-slate-800 text-sm">❄️ {t.coolingPrice}</p>
            <p className="text-sky-600 font-bold text-lg">₹{plant.coolingPrice}/{language === 'te' ? 'క్యాన్' : 'can'}</p>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <button type="button" onClick={() => changeCooling(-1)}
              disabled={coolingQty === 0}
              className="qty-btn w-10 h-10 rounded-full bg-slate-100 hover:bg-red-100 hover:text-red-600 font-black text-lg flex items-center justify-center border border-slate-200 disabled:opacity-40 cursor-pointer">
              −
            </button>
            <span className="font-black text-2xl text-slate-800 w-8 text-center">{coolingQty}</span>
            <button type="button" onClick={() => changeCooling(1)}
              className="qty-btn w-10 h-10 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-black text-lg flex items-center justify-center shadow cursor-pointer">
              +
            </button>
          </div>
        </div>

        {/* Normal Can */}
        <div className={`relative rounded-3xl overflow-visible border-2 p-4 flex flex-col items-center transition-all duration-300 ${
          normalQty > 0
            ? 'border-blue-500 bg-blue-50/90 shadow-lg shadow-blue-200/50'
            : 'border-slate-200/70 bg-white/80'
        }`}>
          <div className="can-ripple-trigger">
            <img
              src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=800&fit=crop&q=80"
              alt="Normal Can"
              className="w-full h-[300px] object-cover rounded-2xl shadow-lg animate-float-normal"
              style={{ minHeight: '300px' }}
            />
          </div>

          <div className="mt-3 text-center">
            <p className="font-extrabold text-slate-800 text-sm">💧 {t.normalPrice}</p>
            <p className="text-blue-600 font-bold text-lg">₹{plant.normalPrice}/{language === 'te' ? 'క్యాన్' : 'can'}</p>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <button type="button" onClick={() => changeNormal(-1)}
              disabled={normalQty === 0}
              className="qty-btn w-10 h-10 rounded-full bg-slate-100 hover:bg-red-100 hover:text-red-600 font-black text-lg flex items-center justify-center border border-slate-200 disabled:opacity-40 cursor-pointer">
              −
            </button>
            <span className="font-black text-2xl text-slate-800 w-8 text-center">{normalQty}</span>
            <button type="button" onClick={() => changeNormal(1)}
              className="qty-btn w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow cursor-pointer">
              +
            </button>
          </div>
        </div>
      </div>

      {/* ── Live Price Ticker ─────────────────────────────────────────────── */}
      {(coolingQty > 0 || normalQty > 0) && (
        <div className="animate-scale-in bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-4 text-white">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              {coolingQty > 0 && (
                <p className="text-sm opacity-90">❄️ {coolingQty} × ₹{plant.coolingPrice} = ₹{coolingQty * plant.coolingPrice}</p>
              )}
              {normalQty > 0 && (
                <p className="text-sm opacity-90">💧 {normalQty} × ₹{plant.normalPrice} = ₹{normalQty * plant.normalPrice}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80 uppercase tracking-wider">{language === 'te' ? 'మొత్తం' : 'Total'}</p>
              <p
                key={priceKey}
                className="text-3xl font-black price-flash"
              >
                ₹{totalPrice}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Customer Details ──────────────────────────────────────────────── */}
      <div className="bg-white/90 rounded-3xl border border-slate-200/60 p-5 space-y-4 shadow-sm">
        <h3 className="font-extrabold text-slate-800 text-base">👤 {language === 'te' ? 'మీ వివరాలు' : 'Your Details'}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 block">{t.customerNameLabel} *</label>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder={t.customerNamePlaceholder}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 block">{t.customerPhoneLabel} *</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder={t.customerPhonePlaceholder}
              required
              maxLength={10}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 transition-all"
            />
          </div>
        </div>

        {/* Delivery Address */}
        <div>
          <label className="text-xs font-bold text-slate-600 mb-1.5 block">{t.addressLabel} *</label>
          <div className="relative">
            <textarea
              value={deliveryAddress}
              onChange={e => setDeliveryAddress(e.target.value)}
              placeholder={t.addressPlaceholder}
              required
              rows={3}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 transition-all resize-none"
            />
            <button
              type="button"
              onClick={onDetectLocation}
              disabled={isDetectingLocation}
              title={t.useCurrentAddrBtn}
              className="absolute right-3 top-3 p-2 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-600 transition-all cursor-pointer"
            >
              {isDetectingLocation
                ? <Loader2 size={16} className="animate-spin" />
                : <MapPin size={16} />}
            </button>
          </div>
        </div>

        {/* Date + Time Slot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Calendar size={12} /> {t.dateLabel} *
            </label>
            <input
              type="date"
              value={deliveryDate}
              onChange={e => setDeliveryDate(e.target.value)}
              min={minDateStr}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 transition-all cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Clock size={12} /> {t.timeLabel} *
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {TIME_SLOTS.map(slot => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setDeliveryTimeSlot(slot.id)}
                  className={`px-2 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    deliveryTimeSlot === slot.id
                      ? 'bg-sky-500 text-white border-sky-500 shadow'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-sky-300'
                  }`}
                >
                  <div>{slot.emoji}</div>
                  <div>{slot.id === 'morning' ? (language === 'te' ? 'ఉదయం' : 'Morning') :
                        slot.id === 'afternoon' ? (language === 'te' ? 'మధ్యాహ్నం' : 'Afternoon') :
                        (language === 'te' ? 'సాయంత్రం' : 'Evening')}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Submit ────────────────────────────────────────────────────────── */}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-base cursor-pointer btn-glow"
      >
        <span>{language === 'te' ? 'చెల్లింపునకు వెళ్ళండి' : 'Proceed to Payment'}</span>
        <ArrowRight size={18} />
      </button>
    </form>
  );
};
