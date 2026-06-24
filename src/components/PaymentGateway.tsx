import React from 'react';
import { DollarSign, QrCode, ShieldCheck, Info } from 'lucide-react';
import { translations } from '../data/translations';
import type { Language } from '../data/translations';
import type { WaterPlant } from '../data/mockPlants';

interface PaymentGatewayProps {
  language: Language;
  plant: WaterPlant;
  amount: number;
  paymentMethod: 'cod' | 'upi';
  setPaymentMethod: (method: 'cod' | 'upi') => void;
}

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  language,
  plant,
  amount,
  paymentMethod,
  setPaymentMethod,
}) => {
  const t = translations[language];

  // UPI URL payload format:
  // upi://pay?pa=recipient@upi&pn=RecipientName&am=Amount&cu=INR
  const upiUrl = `upi://pay?pa=${plant.upiId}&pn=${encodeURIComponent(
    language === 'en' ? plant.nameEn : plant.nameTe
  )}&am=${amount}&cu=INR`;

  // QR Code generation URL using open-source api.qrserver.com - updated size to 300x300
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    upiUrl
  )}&color=0284c7&margin=10`;

  // Floating money coins generator function when option is active
  const renderCoins = () => {
    const coinsCount = 14;
    const coins = Array.from({ length: coinsCount });
    const symbols = ['🪙', '₹', '💵', '💸'];

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {coins.map((_, i) => {
          const left = Math.floor(Math.random() * 85) + 5;
          const delay = (Math.random() * 2.0).toFixed(1);
          const duration = (2.0 + Math.random() * 1.2).toFixed(1);
          const symbol = symbols[i % symbols.length];
          const fontSize = Math.floor(Math.random() * 8) + 12; // 12px to 20px

          return (
            <div
              key={i}
              className="coin-particle"
              style={{
                left: `${left}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                fontSize: `${fontSize}px`,
                textShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              {symbol}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-md">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center mb-6">
        <span className="w-2.5 h-6 bg-sky-500 rounded-full mr-2.5 inline-block"></span>
        {t.paymentMethod}
      </h2>

      {/* Methods Toggle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Cash On Delivery Option */}
        <div
          onClick={() => setPaymentMethod('cod')}
          className={`p-5 rounded-3xl border-2 cursor-pointer flex items-center space-x-4 transition-all duration-300 relative overflow-hidden ${
            paymentMethod === 'cod'
              ? 'border-sky-500 bg-sky-50/40 dark:bg-sky-950/20'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          {/* Render floating money particles if selected */}
          {paymentMethod === 'cod' && renderCoins()}

          <div
            className={`p-3 rounded-xl relative z-10 ${
              paymentMethod === 'cod'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            } transition-colors`}
          >
            <DollarSign size={20} />
          </div>
          <div className="relative z-10">
            <h3 className="font-bold text-slate-800 dark:text-white text-base">
              {t.cod}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Pay with cash upon delivery
            </p>
          </div>
        </div>

        {/* UPI Option */}
        <div
          onClick={() => setPaymentMethod('upi')}
          className={`p-5 rounded-3xl border-2 cursor-pointer flex items-center space-x-4 transition-all duration-300 relative overflow-hidden ${
            paymentMethod === 'upi'
              ? 'border-sky-500 bg-sky-50/40 dark:bg-sky-950/20'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          {/* Render floating money particles if selected */}
          {paymentMethod === 'upi' && renderCoins()}

          <div
            className={`p-3 rounded-xl relative z-10 ${
              paymentMethod === 'upi'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            } transition-colors`}
          >
            <QrCode size={20} />
          </div>
          <div className="relative z-10">
            <h3 className="font-bold text-slate-800 dark:text-white text-base">
              {t.upi}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Pay using any UPI application
            </p>
          </div>
        </div>
      </div>

      {/* UPI QR Display Block */}
      {paymentMethod === 'upi' && (
        <div className="mt-6 p-6 bg-sky-500/5 dark:bg-slate-900/40 border border-sky-100/50 dark:border-slate-700/50 rounded-3xl flex flex-col items-center">
          {/* Instructions */}
          <div className="flex items-start space-x-2.5 mb-5 text-xs text-slate-600 dark:text-slate-400 max-w-sm">
            <Info size={16} className="text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <p>{t.upiPayInstruction}</p>
          </div>

          {/* QR Code Container - updated to render QR at 300px */}
          <div className="relative p-3 bg-white dark:bg-white rounded-3xl border border-sky-100/80 dark:border-slate-700 shadow-md w-[320px] h-[320px] flex items-center justify-center group overflow-hidden">
            {/* Corner styling guides */}
            <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-sky-500 rounded-tl-md"></div>
            <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-sky-500 rounded-tr-md"></div>
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-sky-500 rounded-bl-md"></div>
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-sky-500 rounded-br-md"></div>
            
            <img
              src={qrCodeUrl}
              alt="UPI QR Code"
              className="w-[300px] h-[300px] object-contain rounded-2xl group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>

          <div className="mt-4 flex items-center space-x-1.5 text-xs text-slate-400 dark:text-slate-500">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Secure UPI Transaction</span>
          </div>

          {/* UPI Apps Icons Row */}
          <div className="mt-4 flex items-center justify-center space-x-4">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Supported Apps</span>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-950 px-2 py-0.5 rounded-lg">GPay</span>
              <span className="text-[10px] font-extrabold bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-950 px-2 py-0.5 rounded-lg">PhonePe</span>
              <span className="text-[10px] font-extrabold bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-950 px-2 py-0.5 rounded-lg">Paytm</span>
            </div>
          </div>
          
          <div className="mt-4 text-[11px] text-slate-500 dark:text-slate-400 bg-sky-100/20 dark:bg-slate-800/40 border border-sky-100/30 px-4 py-2 rounded-xl max-w-sm text-center">
            {t.upiVerifyTip}
          </div>
        </div>
      )}
    </div>
  );
};
