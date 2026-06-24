import { useState, useEffect } from 'react';
import { Droplet, Sparkles, History, ArrowLeft, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

// Data & Config
import type { WaterPlant } from './data/mockPlants';
import { mockPlants, allWaterPlants } from './data/mockPlants';
import type { Language } from './data/translations';
import { translations } from './data/translations';
import { useGeolocation } from './hooks/useGeolocation';
import { useNearbyPlants } from './hooks/useNearbyPlants';

// Components
import { LanguageSelector } from './components/LanguageSelector';
import { WaterPlantMap } from './components/WaterPlantMap';
import { WaterPlantList } from './components/WaterPlantList';
import { BookingForm } from './components/BookingForm';
import { PaymentGateway } from './components/PaymentGateway';
import { OrderSummary } from './components/OrderSummary';
import { OrderHistory } from './components/OrderHistory';
import type { OrderItem } from './components/OrderHistory';

type Screen = 'home' | 'map' | 'plants' | 'order' | 'pay' | 'confirm';

function App() {
  // --- Persistent States (LocalStorage) ---
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('water_can_language') as Language) || 'en';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('water_can_darkmode') === 'true';
  });

  const [orderHistory, setOrderHistory] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem('water_can_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const [customerName, setCustomerName] = useState<string>(() => {
    return localStorage.getItem('water_can_cust_name') || '';
  });

  const [customerPhone, setCustomerPhone] = useState<string>(() => {
    return localStorage.getItem('water_can_cust_phone') || '';
  });

  const [deliveryAddress, setDeliveryAddress] = useState<string>(() => {
    return localStorage.getItem('water_can_cust_address') || '';
  });

  // --- Navigation & Screens State ---
  const [screen, setScreen] = useState<Screen>('home');
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // --- Core Logistics States ---
  const [plantsList, setPlantsList] = useState<WaterPlant[]>(mockPlants);
  const [selectedPlant, setSelectedPlant] = useState<WaterPlant | null>(mockPlants[0]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Cans Configuration
  const [coolingQty, setCoolingQty] = useState<number>(1);
  const [normalQty, setNormalQty] = useState<number>(0);

  // Time & Pay settings
  const [deliveryDate, setDeliveryDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState<string>('morning');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [activeOrder, setActiveOrder] = useState<OrderItem | null>(null);

  const {
    coordinates,
    address: gpsAddress,
    loading: isDetectingLocation,
    accuracy: gpsAccuracy,
    isWatching: isWatchingLocation,
    detectLocation,
    stopWatching,
  } = useGeolocation();

  const {
    plants: nearbySearchResults,
    status: nearbyStatus,
    searchMessage: nearbySearchMsg,
    searchNearby,
  } = useNearbyPlants();

  // Stop watching when user leaves map screen
  useEffect(() => {
    if (screen !== 'map') stopWatching();
  }, [screen, stopWatching]);

  // Sync translation language
  useEffect(() => {
    localStorage.setItem('water_can_language', language);
  }, [language]);

  // Sync theme overrides
  useEffect(() => {
    localStorage.setItem('water_can_darkmode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Sync order history log
  useEffect(() => {
    localStorage.setItem('water_can_bookings', JSON.stringify(orderHistory));
  }, [orderHistory]);

  // When GPS fixes, trigger real nearby search (Overpass API → fallback mock)
  useEffect(() => {
    if (coordinates) {
      setUserCoords({ lat: coordinates.lat, lng: coordinates.lng });
      searchNearby(coordinates.lat, coordinates.lng, 5);
    }
  }, [coordinates, searchNearby]);

  // Update plantsList whenever search results arrive
  useEffect(() => {
    if (nearbySearchResults.length > 0) {
      setPlantsList(nearbySearchResults);
      setSelectedPlant(nearbySearchResults[0]);
    }
  }, [nearbySearchResults]);

  // Populate address on Geolocation autocomplete triggers
  useEffect(() => {
    if (gpsAddress) {
      setDeliveryAddress(gpsAddress);
    }
  }, [gpsAddress]);

  // Start checkout flow - triggers location permission and shifts to map
  const handleStartBookingFlow = () => {
    detectLocation();
    setScreen('map');
    setShowHistory(false);
  };

  const handleSelectPlant = (plant: WaterPlant) => {
    setSelectedPlant(plant);
  };

  const handleReorder = (pastOrder: OrderItem) => {
    const plant = allWaterPlants.find((p) => p.id === pastOrder.plantId) || allWaterPlants[0];
    setSelectedPlant(plant);
    setCoolingQty(pastOrder.coolingQty);
    setNormalQty(pastOrder.normalQty);
    setCustomerName(pastOrder.customerName);
    setCustomerPhone(pastOrder.customerPhone);
    setDeliveryAddress(pastOrder.deliveryAddress);
    setDeliveryDate(pastOrder.deliveryDate);
    setDeliveryTimeSlot(pastOrder.deliveryTimeSlot);
    setPaymentMethod(pastOrder.paymentMethod);
    setActiveOrder(null);
    setShowHistory(false);
    setScreen('order');
  };

  // Navigates from Form to Pay screen
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const t = translations[language];

    if (coolingQty === 0 && normalQty === 0) {
      alert(t.selectCansAlert);
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Please enter your name and 10-digit mobile number.");
      return;
    }
    if (customerPhone.trim().length !== 10 || isNaN(Number(customerPhone))) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!deliveryAddress.trim()) {
      alert(t.enterAddressAlert);
      return;
    }
    if (!deliveryDate || !deliveryTimeSlot) {
      alert(t.selectDateTimeAlert);
      return;
    }

    setScreen('pay');
  };

  // Final Order placement click
  const handleConfirmOrder = () => {
    if (!selectedPlant) return;

    // Cache customer particulars
    localStorage.setItem('water_can_cust_name', customerName);
    localStorage.setItem('water_can_cust_phone', customerPhone);
    localStorage.setItem('water_can_cust_address', deliveryAddress);

    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const newOrderId = `WC-${dateCode}-${randCode}`;

    const newOrder: OrderItem = {
      orderId: newOrderId,
      plantId: selectedPlant.id,
      plantNameEn: selectedPlant.nameEn,
      plantNameTe: selectedPlant.nameTe,
      customerName,
      customerPhone,
      coolingQty,
      normalQty,
      deliveryAddress,
      deliveryDate,
      deliveryTimeSlot,
      paymentMethod,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    setOrderHistory((prev) => [newOrder, ...prev]);
    setActiveOrder(newOrder);
    setScreen('confirm');

    // Fire canvas-confetti particles
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.65 },
      colors: ['#0077B6', '#00b4d8', '#90e0ef', '#bae6fd', '#34d399'],
    });
  };

  const handleOrderConfirmed = () => {
    if (!activeOrder) return;
    setOrderHistory((prev) =>
      prev.map((ord) =>
        ord.orderId === activeOrder.orderId ? { ...ord, status: 'confirmed' } : ord
      )
    );
    setActiveOrder((prev) => (prev ? { ...prev, status: 'confirmed' } : null));
  };

  const handleResetApp = () => {
    handleOrderConfirmed();
    setActiveOrder(null);
    setScreen('home');
    setCoolingQty(1);
    setNormalQty(0);
  };

  const tState = translations[language];

  // Helper to draw floating bubble divs dynamically (25+ bubbles, random sizes 10px-40px)
  const renderBubbles = () => {
    const bubblesArray = Array.from({ length: 28 });
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {bubblesArray.map((_, i) => {
          const size = Math.floor(10 + Math.random() * 30); // 10px to 40px
          const left = Math.floor(Math.random() * 100);
          const delay = (Math.random() * 10).toFixed(1);
          const duration = (8 + Math.random() * 12).toFixed(1);
          return (
            <div
              key={i}
              className="bubble-rising"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            />
          );
        })}
      </div>
    );
  };

  // Render Step Progress Bar
  const renderProgressSteps = () => {
    if (screen === 'home' || screen === 'confirm') return null;

    const steps = [
      { id: 'map', label: language === 'en' ? 'Map' : 'మ్యాప్' },
      { id: 'plants', label: language === 'en' ? 'Providers' : 'ప్లాంట్లు' },
      { id: 'order', label: language === 'en' ? 'Details' : 'వివరాలు' },
      { id: 'pay', label: language === 'en' ? 'Payment' : 'చెల్లింపు' },
    ];

    const currentIdx = steps.findIndex((s) => s.id === screen);

    return (
      <div className="max-w-2xl mx-auto mb-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-5 rounded-3xl border border-slate-100/50 dark:border-slate-800/80 shadow-sm relative z-20">
        <div className="flex justify-between items-center relative">
          {/* Progress bar background line */}
          <div className="absolute left-6 right-6 top-1/2 transform -translate-y-1/2 h-[3px] bg-slate-200 dark:bg-slate-700/80 -z-10 rounded-full" />
          
          {/* Active progress bar line */}
          <div
            className="absolute left-6 top-1/2 transform -translate-y-1/2 h-[3px] bg-gradient-to-r from-[#0077B6] to-[#00b4d8] -z-10 rounded-full transition-all duration-500"
            style={{ width: `${(currentIdx / (steps.length - 1)) * 88}%` }}
          />

          {steps.map((s, idx) => {
            const isCompleted = idx < currentIdx;
            const isActive = idx === currentIdx;

            return (
              <div key={s.id} className="flex flex-col items-center space-y-1.5 flex-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    // Prevent skipping forward without validation
                    if (idx < currentIdx) {
                      setScreen(s.id as Screen);
                    }
                  }}
                  disabled={idx >= currentIdx}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gradient-to-br from-[#0077B6] to-[#00b4d8] text-white border-transparent cursor-pointer shadow-md shadow-[#0077b6]/20'
                      : isActive
                      ? 'bg-white dark:bg-slate-800 text-[#0077B6] border-[#0077B6] ring-4 ring-sky-500/10 shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </button>
                <span
                  className={`text-[10px] font-bold tracking-wider uppercase ${
                    isActive
                      ? 'text-[#0077B6] dark:text-sky-400 font-extrabold'
                      : isCompleted
                      ? 'text-slate-600 dark:text-slate-300'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col justify-between ocean-bg transition-colors duration-300">
      {/* Background Bubble Particle layers */}
      {renderBubbles()}

      {/* App Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 py-4 px-4 sticky top-0 z-50 transition-colors duration-300 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div
            onClick={() => { if (screen !== 'confirm') { setScreen('home'); setShowHistory(false); } }}
            className="flex items-center space-x-2.5 cursor-pointer"
          >
            <div className="p-2 bg-gradient-to-br from-[#0077B6] to-[#00b4d8] rounded-xl text-white shadow-md shadow-[#0077b6]/20">
              <Droplet size={20} className="fill-white/10" />
            </div>
            <span className="font-extrabold tracking-tight text-lg text-slate-800 dark:text-white">
              {tState.appName}
            </span>
          </div>

          <div className="flex items-center space-x-3.5">
            {screen !== 'confirm' && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  showHistory
                    ? 'bg-[#0077B6] text-white border-[#0077B6]'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                } cursor-pointer`}
                title="View Booking History"
              >
                <History size={15} />
                <span className="hidden sm:inline">My Bookings</span>
              </button>
            )}

            <LanguageSelector
              language={language}
              setLanguage={setLanguage}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-6 z-10 relative">
        {/* Wizard Progress steps */}
        {!showHistory && renderProgressSteps()}

        {showHistory ? (
          /* History View overlay tab */
          <div className="animate-slide-in-bottom bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100/50 dark:border-slate-800/80 shadow-md">
            <button
              onClick={() => setShowHistory(false)}
              className="mb-4 inline-flex items-center space-x-1 text-xs text-sky-600 dark:text-sky-400 font-bold hover:underline"
            >
              <ArrowLeft size={14} />
              <span>Back to Booking</span>
            </button>
            <OrderHistory
              orders={orderHistory}
              language={language}
              onReorder={handleReorder}
              onClearHistory={() => setOrderHistory([])}
            />
          </div>
        ) : (
          /* Screen Transition Wizard */
          <div className="w-full">
            {screen === 'home' && (
              /* SCREEN 1: Home/Hero Section */
              <div className="max-w-2xl mx-auto text-center space-y-6 py-8 md:py-12">

                {/* ── Hero Glass Card ──────────────────────────────── */}
                <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-3xl p-8 shadow-xl space-y-5">

                  {/* Badge */}
                  <div className="inline-flex items-center space-x-2 bg-white/20 border border-white/40 px-4 py-1.5 rounded-full">
                    <Sparkles size={13} className="text-white" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Pure Hydration, Right to Your Door</span>
                  </div>

                  {/* Heading */}
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight text-white drop-shadow">
                    Fresh Water,<br className="hidden sm:inline" /> Delivered{' '}
                    <span className="text-yellow-300">Fast</span>
                  </h1>

                  {/* Subtext */}
                  <p className="text-white/90 text-sm sm:text-base max-w-md mx-auto leading-relaxed font-medium">
                    Choose from nearby drinking water plants. Detect your location, configure 20L regular or ice-cold cans, and order directly on WhatsApp.
                  </p>

                  {/* Book Now button */}
                  <div className="pt-2">
                    <button
                      onClick={handleStartBookingFlow}
                      className="bg-white text-[#0077B6] hover:bg-yellow-300 hover:text-slate-900 font-extrabold py-4 px-12 rounded-2xl shadow-lg transition-colors text-base sm:text-lg cursor-pointer"
                    >
                      🚰 Book Now
                    </button>
                  </div>
                </div>

                {/* ── Can Cards ──────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                  {/* Cooling Can */}
                  <div className="flex flex-col items-center space-y-2">
                    <img
                      src="https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=600&h=800&q=80"
                      alt="Ice Cans Preview"
                      className="w-full h-48 object-cover rounded-2xl shadow-lg border-2 border-white/30"
                    />
                    <div className="bg-white/20 backdrop-blur border border-white/30 px-4 py-1.5 rounded-xl w-full text-center">
                      <span className="text-sm font-black text-white uppercase tracking-wide">Cooling Cans ❄️</span>
                    </div>
                  </div>

                  {/* Normal Can */}
                  <div className="flex flex-col items-center space-y-2">
                    <img
                      src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=600&h=800&q=80"
                      alt="Normal Cans Preview"
                      className="w-full h-48 object-cover rounded-2xl shadow-lg border-2 border-white/30"
                    />
                    <div className="bg-white/20 backdrop-blur border border-white/30 px-4 py-1.5 rounded-xl w-full text-center">
                      <span className="text-sm font-black text-white uppercase tracking-wide">Normal Cans 💧</span>
                    </div>
                  </div>
                </div>
              </div>
            )}



            {screen === 'map' && (

              /* SCREEN 2: Google Maps interactive location page */
              <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100/50 dark:border-slate-800/80 shadow-md">
                <div className="flex justify-between items-center px-1">
                  <button
                    onClick={() => setScreen('home')}
                    className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center hover:underline bg-white/50 dark:bg-slate-700/50 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700 cursor-pointer"
                  >
                    <ArrowLeft size={14} className="mr-1" />
                    Back
                  </button>
                  <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
                    {language === 'en' ? 'Select Location on Map' : 'స్థానం మ్యాప్‌లో చూడండి'}
                  </h2>
                  <div className="w-10"></div>
                </div>

                {/* ── Nearby Search Status Banner ────────────────────────── */}
                {nearbyStatus === 'searching' && (
                  <div className="flex items-center space-x-3 px-4 py-2.5 bg-sky-500/10 border border-sky-300/30 rounded-2xl text-xs font-bold text-sky-700 dark:text-sky-400">
                    <Loader2 size={14} className="animate-spin shrink-0" />
                    <span>🔍 Searching for water plants near your location…</span>
                  </div>
                )}
                {(nearbyStatus === 'found' || nearbyStatus === 'fallback') && (
                  <div className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold border ${
                    nearbyStatus === 'found'
                      ? 'bg-emerald-500/10 border-emerald-300/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-amber-500/10 border-amber-300/30 text-amber-700 dark:text-amber-400'
                  }`}>
                    <span>{nearbyStatus === 'found' ? '✅' : '📦'}</span>
                    <span>{nearbySearchMsg}</span>
                  </div>
                )}

                <WaterPlantMap
                  plants={plantsList}
                  setPlants={setPlantsList}
                  selectedPlant={selectedPlant}
                  onSelectPlant={handleSelectPlant}
                  userCoords={userCoords}
                  setUserCoords={setUserCoords}
                  language={language}
                  onProceedToPlants={() => setScreen('plants')}
                  isDetectingLocation={isDetectingLocation}
                  gpsAccuracy={gpsAccuracy}
                  isWatchingLocation={isWatchingLocation}
                />
              </div>
            )}

            {screen === 'plants' && (
              /* SCREEN 3: Plant Cards grid listing (Separated card rendering) */
              <div className="max-w-4xl mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100/50 dark:border-slate-800/80 shadow-md">
                <WaterPlantList
                  plants={plantsList}
                  selectedPlant={selectedPlant}
                  onSelectPlant={handleSelectPlant}
                  language={language}
                  onBack={() => setScreen('map')}
                  onNext={() => setScreen('order')}
                />
              </div>
            )}

            {screen === 'order' && selectedPlant && (
              /* SCREEN 4: Booking Form Counters, Date/Time & Address */
              <div className="max-w-2xl mx-auto">
                <BookingForm
                  plant={selectedPlant}
                  language={language}
                  customerName={customerName}
                  setCustomerName={setCustomerName}
                  customerPhone={customerPhone}
                  setCustomerPhone={setCustomerPhone}
                  coolingQty={coolingQty}
                  setCoolingQty={setCoolingQty}
                  normalQty={normalQty}
                  setNormalQty={setNormalQty}
                  deliveryAddress={deliveryAddress}
                  setDeliveryAddress={setDeliveryAddress}
                  deliveryDate={deliveryDate}
                  setDeliveryDate={setDeliveryDate}
                  deliveryTimeSlot={deliveryTimeSlot}
                  setDeliveryTimeSlot={setDeliveryTimeSlot}
                  onDetectLocation={detectLocation}
                  isDetectingLocation={isDetectingLocation}
                  onSubmit={handleProceedToPayment}
                  onBack={() => setScreen('plants')}
                />
              </div>
            )}

            {screen === 'pay' && selectedPlant && (
              /* SCREEN 5: Payment Selector Screen */
              <div className="max-w-2xl mx-auto space-y-6">
                <PaymentGateway
                  language={language}
                  plant={selectedPlant}
                  amount={coolingQty * selectedPlant.coolingPrice + normalQty * selectedPlant.normalPrice}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                />

                <div className="flex space-x-4">
                  <button
                    onClick={() => setScreen('order')}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-4 px-6 rounded-2xl shadow-sm transition-all text-sm cursor-pointer text-center"
                  >
                    Back to Details
                  </button>
                  <button
                    onClick={handleConfirmOrder}
                    className="flex-2 bg-gradient-to-r from-sky-500 via-blue-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 text-base cursor-pointer"
                  >
                    <Sparkles size={16} />
                    <span>Confirm Order</span>
                  </button>
                </div>
              </div>
            )}

            {screen === 'confirm' && activeOrder && (
              /* SCREEN 6: Confirmation Summary & WhatsApp trigger */
              <OrderSummary
                orderId={activeOrder.orderId}
                plant={allWaterPlants.find((p) => p.id === activeOrder.plantId) || allWaterPlants[0]}
                language={language}
                customerName={activeOrder.customerName}
                customerPhone={activeOrder.customerPhone}
                coolingQty={activeOrder.coolingQty}
                normalQty={activeOrder.normalQty}
                deliveryAddress={activeOrder.deliveryAddress}
                deliveryDate={activeOrder.deliveryDate}
                deliveryTimeSlot={activeOrder.deliveryTimeSlot}
                paymentMethod={activeOrder.paymentMethod}
                onReset={handleResetApp}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer copyright */}
      <footer className="w-full text-center py-6 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mt-12 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>&copy; 2026 Neeru Delivery. All rights reserved.</span>
          <div className="flex space-x-3">
            <span className="hover:underline cursor-pointer">Bilingual (Telugu/English)</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Privacy & Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
