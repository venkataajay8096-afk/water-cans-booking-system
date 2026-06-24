import React from 'react';
import { Calendar, Trash2, ShoppingBag, Clock, ArrowRight } from 'lucide-react';
import { translations } from '../data/translations';
import type { Language } from '../data/translations';

export interface OrderItem {
  orderId: string;
  plantId: string;
  plantNameEn: string;
  plantNameTe: string;
  customerName: string;
  customerPhone: string;
  coolingQty: number;
  normalQty: number;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  paymentMethod: 'cod' | 'upi';
  timestamp: string;
  status: 'pending' | 'confirmed';
}

interface OrderHistoryProps {
  orders: OrderItem[];
  language: Language;
  onReorder: (order: OrderItem) => void;
  onClearHistory: () => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  orders,
  language,
  onReorder,
  onClearHistory,
}) => {
  const t = translations[language];

  // Resolve Time Slot Text
  const getTimeSlotText = (slot: string) => {
    const translation = translations[language];
    if (slot === 'morning') return translation.slotMorning;
    if (slot === 'afternoon') return translation.slotAfternoon;
    if (slot === 'evening') return translation.slotEvening;
    return slot;
  };

  const getStatusBadge = (status: OrderItem['status']) => {
    if (status === 'confirmed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
          ● {t.statusConfirmed}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
        ● {t.statusPending}
      </span>
    );
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm p-12 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-md text-center max-w-lg mx-auto space-y-4">
        <div className="inline-flex p-4 bg-sky-50 dark:bg-sky-950/30 text-sky-500 rounded-full">
          <ShoppingBag size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t.noHistory}</h3>
        <p className="text-slate-400 dark:text-slate-400 text-sm max-w-xs mx-auto">
          Start booking pure water cans to view them in your dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Panel */}
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
          <span className="w-2.5 h-6 bg-sky-500 rounded-full mr-2.5 inline-block"></span>
          {t.historyTab} ({orders.length})
        </h2>
        <button
          onClick={onClearHistory}
          className="flex items-center space-x-1 text-xs text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 font-bold border border-rose-100 dark:border-rose-950/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-3 py-1.5 rounded-xl transition-all"
        >
          <Trash2 size={13} />
          <span>Clear All</span>
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const plantName = language === 'en' ? order.plantNameEn : order.plantNameTe;
          const totalAmount =
            order.coolingQty * (order.plantId === 'tirumala' ? 40 : order.plantId === 'venkateswara' ? 35 : 45) +
            order.normalQty * (order.plantId === 'tirumala' ? 25 : order.plantId === 'venkateswara' ? 20 : 30);

          return (
            <div
              key={order.orderId}
              className="bg-white dark:bg-slate-800/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden"
            >
              {/* Top Row: Plant info & Status */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3.5 border-b border-slate-100 dark:border-slate-700/60 gap-2">
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-base leading-snug">
                    {plantName}
                  </h3>
                  <div className="text-slate-400 dark:text-slate-400 text-xs mt-0.5 flex items-center space-x-2 font-mono">
                    <span>ID: #{order.orderId}</span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Clock size={11} className="mr-0.5" />
                      {new Date(order.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>

              {/* Middle Row: Items and Logistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 text-xs sm:text-sm">
                {/* Cans quantity grid */}
                <div className="space-y-1.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Ordered Items</span>
                  <div className="space-y-1">
                    {order.coolingQty > 0 && (
                      <div className="flex items-center text-slate-700 dark:text-slate-200">
                        <span className="mr-1.5 text-xs">❄️</span>
                        <span>{t.coolingCansLabel}:</span>
                        <strong className="ml-1 text-slate-800 dark:text-white font-bold">x{order.coolingQty}</strong>
                      </div>
                    )}
                    {order.normalQty > 0 && (
                      <div className="flex items-center text-slate-700 dark:text-slate-200">
                        <span className="mr-1.5 text-xs">💧</span>
                        <span>{t.normalCansLabel}:</span>
                        <strong className="ml-1 text-slate-800 dark:text-white font-bold">x{order.normalQty}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Logistics scheduling */}
                <div className="space-y-1 text-slate-500 dark:text-slate-400 text-xs">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Delivery Slot</span>
                  <div className="flex items-center text-slate-700 dark:text-slate-200 font-medium">
                    <Calendar size={12} className="mr-1.5 text-sky-500" />
                    <span>{order.deliveryDate}</span>
                  </div>
                  <div className="flex items-center text-slate-700 dark:text-slate-200 font-medium mt-1">
                    <Clock size={12} className="mr-1.5 text-sky-500" />
                    <span>{getTimeSlotText(order.deliveryTimeSlot)}</span>
                  </div>
                </div>

                {/* Address block */}
                <div className="col-span-1 sm:col-span-2 text-xs bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded-xl border border-slate-100/50 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                  <span className="font-semibold block text-slate-400 uppercase text-[9px] tracking-wider mb-1">Destination Address</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{order.deliveryAddress}</p>
                </div>
              </div>

              {/* Bottom Row: Reorder & Price */}
              <div className="flex justify-between items-center pt-3.5 border-t border-slate-100 dark:border-slate-700/60 mt-1">
                <div>
                  <span className="text-xs text-slate-400">{t.totalAmount}:</span>
                  <span className="ml-1.5 text-base font-extrabold text-sky-600 dark:text-sky-400 font-mono">₹{totalAmount}</span>
                </div>

                <button
                  onClick={() => onReorder(order)}
                  className="bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-950/70 text-sky-600 dark:text-sky-400 text-xs font-bold py-2 px-4 rounded-xl flex items-center space-x-1 transition-all border border-sky-100/50 dark:border-sky-950"
                >
                  <span>{t.reorderBtn}</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
