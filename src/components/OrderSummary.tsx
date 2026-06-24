import React, { useState } from 'react';
import { MessageSquare, ArrowLeft, Check, Calendar, MapPin, Clock, CreditCard } from 'lucide-react';
import { translations } from '../data/translations';
import type { Language } from '../data/translations';
import type { WaterPlant } from '../data/mockPlants';

interface OrderSummaryProps {
  orderId: string;
  plant: WaterPlant;
  language: Language;
  customerName: string;
  customerPhone: string;
  coolingQty: number;
  normalQty: number;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  paymentMethod: 'cod' | 'upi';
  onReset: () => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  orderId,
  plant,
  language,
  customerName,
  customerPhone,
  coolingQty,
  normalQty,
  deliveryAddress,
  deliveryDate,
  deliveryTimeSlot,
  paymentMethod,
  onReset,
}) => {
  const t = translations[language];
  const [copied, setCopied] = useState(false);

  const coolingTotal = coolingQty * plant.coolingPrice;
  const normalTotal = normalQty * plant.normalPrice;
  const grandTotal = coolingTotal + normalTotal;

  // Resolve Time Slot Text
  const getTimeSlotText = (slot: string, lang: Language) => {
    const translation = translations[lang];
    if (slot === 'morning') return translation.slotMorning;
    if (slot === 'afternoon') return translation.slotAfternoon;
    if (slot === 'evening') return translation.slotEvening;
    return slot;
  };

  const getSlotLabel = (slot: string) => {
    if (slot === 'morning') return '6:00 AM - 12:00 PM';
    if (slot === 'afternoon') return '12:00 PM - 6:00 PM';
    if (slot === 'evening') return '6:00 PM - 9:00 PM';
    return slot;
  };

  // Compile WhatsApp Message
  const getWhatsAppMessage = () => {
    const payModeText = paymentMethod === 'upi' ? "UPI" : "Cash on Delivery";
    const plantName = language === 'en' ? plant.nameEn : plant.nameTe;
    const ownerLine = plant.ownerName ? `Owner: ${plant.ownerName}\n` : '';
    const addressLine = plant.address ? `Plant Address: ${plant.address}\n` : '';

    const coolingLine = coolingQty > 0 
      ? `Cooling Cans: ${coolingQty} x ₹${plant.coolingPrice} = ₹${coolingTotal}\n` 
      : '';
    const normalLine = normalQty > 0 
      ? `Normal Cans: ${normalQty} x ₹${plant.normalPrice} = ₹${normalTotal}\n` 
      : '';

    return `Water Can Order - ${orderId}
Plant: ${plantName}
${ownerLine}${addressLine}${coolingLine}${normalLine}Total: ₹${grandTotal}
Delivery: ${deliveryDate} [${getSlotLabel(deliveryTimeSlot)}]
Address: ${deliveryAddress}
Payment: ${payModeText}`;
  };

  const handleSendWhatsApp = () => {
    const message = getWhatsAppMessage();
    const cleanPhone = plant.phone.replace(/[^0-9+]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopyInvoice = () => {
    navigator.clipboard.writeText(getWhatsAppMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to draw falling blue/white confetti particles
  const renderConfetti = () => {
    const particlesArray = Array.from({ length: 45 });
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {particlesArray.map((_, i) => {
          const size = Math.floor(6 + Math.random() * 8);
          const left = Math.floor(Math.random() * 100);
          const delay = (Math.random() * 4).toFixed(1);
          const duration = (3.5 + Math.random() * 2).toFixed(1);
          
          // alternating colors: sky-blue, indigo, light-cyan, white
          const colors = ['#0077B6', '#00b4d8', '#90e0ef', '#ffffff', '#38bdf8'];
          const color = colors[i % colors.length];
          const isCircle = Math.random() > 0.5;

          return (
            <div
              key={i}
              className="confetti-particle"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                backgroundColor: color,
                borderRadius: isCircle ? '50%' : '2px',
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                transform: `rotate(${Math.floor(Math.random() * 360)}deg)`,
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 relative overflow-hidden pb-6">
      {/* Falling blue/white confetti layered background */}
      {renderConfetti()}

      {/* Success Card Header */}
      <div className="bg-gradient-to-br from-sky-500 to-sky-600 dark:from-sky-700 dark:to-sky-900 text-white p-8 rounded-3xl text-center shadow-xl relative overflow-hidden z-10">
        {/* Decorative background blur blobs */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

        {/* Drawing SVG Checkmark and Radial Splash Burst */}
        <div className="relative inline-flex items-center justify-center mb-5 mt-2">
          {/* Radial Splash Burst Ring */}
          <div className="absolute w-24 h-24 bg-white/20 rounded-full pointer-events-none"></div>

          {/* SVG Animated Checkmark container */}
          <div className="relative p-4 bg-white/15 backdrop-blur-md rounded-full shadow-inner z-10 border border-white/10">
            <svg
              className="w-12 h-12 text-sky-100"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                className="animate-draw-checkmark"
                d="M20 6L9 17l-5-5"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight">{t.orderSuccess}</h1>
        <p className="text-sky-100 text-xs sm:text-sm mt-2 max-w-md mx-auto leading-relaxed">
          {t.successMsg}
        </p>

        {/* Order ID Banner */}
        <div className="mt-5 inline-flex items-center space-x-2.5 bg-white/15 backdrop-blur-md px-4.5 py-1.5 rounded-full border border-white/10 text-sm font-semibold tracking-wider font-mono">
          <span>{t.orderId}:</span>
          <span>#{orderId}</span>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-md space-y-5 relative z-10">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700/60">
          <h3 className="font-bold text-slate-800 dark:text-white">Order Receipt Summary</h3>
          <button
            onClick={handleCopyInvoice}
            className="flex items-center space-x-1.5 text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 font-bold cursor-pointer"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Check size={14} className="opacity-0" />}
            <span>{copied ? "Copied!" : "Copy Receipt"}</span>
          </button>
        </div>

        {/* Cans quantities list */}
        <div className="space-y-3">
          {coolingQty > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center text-slate-600 dark:text-slate-300">
                <span className="w-5 text-center text-xs mr-2">❄️</span>
                {t.coolingCansLabel} <strong className="ml-1 text-slate-800 dark:text-white font-semibold">x{coolingQty}</strong>
              </span>
              <span className="font-semibold text-slate-800 dark:text-white">₹{coolingTotal}</span>
            </div>
          )}
          {normalQty > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center text-slate-600 dark:text-slate-300">
                <span className="w-5 text-center text-xs mr-2">💧</span>
                {t.normalCansLabel} <strong className="ml-1 text-slate-800 dark:text-white font-semibold">x{normalQty}</strong>
              </span>
              <span className="font-semibold text-slate-800 dark:text-white">₹{normalTotal}</span>
            </div>
          )}
        </div>

        <div className="h-[1px] bg-slate-100 dark:bg-slate-700/60" />

        {/* Logistics Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Customer Details */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800">
            <span className="text-slate-400 font-semibold uppercase tracking-wider block">Customer Details</span>
            <div className="text-slate-800 dark:text-slate-200 font-medium">
              <div className="font-bold">{customerName}</div>
              <div className="text-slate-500 font-mono mt-0.5">{customerPhone}</div>
            </div>
          </div>

          {/* Plant Details with predicted info */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800">
            <span className="text-slate-400 font-semibold uppercase tracking-wider block">Provider Plant</span>
            <div className="text-slate-800 dark:text-slate-200 font-medium">
              <div className="font-bold">{language === 'en' ? plant.nameEn : plant.nameTe}</div>
              <div className="text-slate-500 font-mono mt-0.5">{plant.phone}</div>
              {plant.ownerName && (
                <div className="text-xs text-sky-600 dark:text-sky-400 mt-1 font-semibold">Owner: {plant.ownerName}</div>
              )}
              {plant.address && (
                <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{plant.address}</div>
              )}
              {plant.openTime && plant.closeTime && (
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">⏰ {plant.openTime} – {plant.closeTime}</div>
              )}
            </div>
          </div>

          {/* Logistics Address */}
          <div className="space-y-1.5 col-span-1 sm:col-span-2 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/30 p-3.5 rounded-xl border border-slate-100/50 dark:border-slate-800">
            <div className="flex items-center space-x-1.5 text-slate-400 font-semibold uppercase tracking-wider">
              <MapPin size={12} className="text-sky-500" />
              <span>{t.addressLabel}</span>
            </div>
            <p className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed mt-0.5">{deliveryAddress}</p>
          </div>

          {/* Delivery Schedule & Payment */}
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
            <Calendar size={14} className="text-sky-500" />
            <span><strong>{t.dateLabel}:</strong> {deliveryDate}</span>
          </div>

          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
            <Clock size={14} className="text-sky-500" />
            <span><strong>Time:</strong> {getTimeSlotText(deliveryTimeSlot, language)}</span>
          </div>

          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 col-span-1 sm:col-span-2">
            <CreditCard size={14} className="text-sky-500" />
            <span>
              <strong>{t.paymentMethod}:</strong>{' '}
              {paymentMethod === 'upi' ? (
                <span className="text-sky-600 dark:text-sky-400 font-semibold">UPI Online</span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-semibold">Cash On Delivery</span>
              )}
            </span>
          </div>
        </div>

        <div className="h-[1px] bg-slate-100 dark:bg-slate-700/60" />

        {/* Invoice Total */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold">{t.grandTotal}</span>
          <span className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono">₹{grandTotal}</span>
        </div>
      </div>

      {/* Buttons Block */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 relative z-10">
        <button
          onClick={handleSendWhatsApp}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 text-base cursor-pointer"
        >
          <MessageSquare size={20} className="fill-white/10" />
          <span>{t.sendWhatsAppBtn}</span>
        </button>

        <button
          onClick={onReset}
          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-4 px-6 rounded-2xl shadow hover:shadow-md transition-all duration-300 flex items-center justify-center space-x-1 cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>{t.backToHome}</span>
        </button>
      </div>
    </div>
  );
};
