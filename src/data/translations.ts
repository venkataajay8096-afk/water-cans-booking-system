export type Language = 'en' | 'te';

export const translations = {
  en: {
    appName: "Neeru Delivery",
    appSubtitle: "Pure water cans delivered to your doorstep",
    languageLabel: "తెలుగు",
    bookingTab: "Book Now",
    historyTab: "My Bookings",
    themeLight: "Light Mode",
    themeDark: "Dark Mode",
    
    // Geolocation
    detectingLocation: "Detecting your location...",
    locationDetected: "Location detected successfully!",
    locationError: "Location permission denied. Using default location.",
    gpsButton: "Use Current GPS",
    
    // Plant Selection
    nearbyPlants: "Nearby Water Plants",
    selectPlantTip: "Select a water plant to start booking",
    distance: "Distance",
    rating: "Rating",
    phone: "Phone",
    coolingPrice: "Cooling Can",
    normalPrice: "Normal Can",
    plantSelected: "Selected Plant",

    // Booking Form
    bookingFormTitle: "Booking Form",
    customerNameLabel: "Your Full Name",
    customerNamePlaceholder: "Enter your name",
    customerPhoneLabel: "WhatsApp Mobile Number",
    customerPhonePlaceholder: "Enter 10-digit mobile number",
    coolingCansLabel: "Cooling Cans (20L Ice Cold)",
    normalCansLabel: "Normal Cans (20L Regular)",
    coolingDesc: "Best for drinking, ice-chilled water",
    normalDesc: "Best for cooking and regular use",
    qty: "Qty",
    pricePerCan: "per can",
    deliveryDetails: "Delivery Details",
    addressLabel: "Delivery Address",
    addressPlaceholder: "Enter your full delivery address, door number, street, and landmarks...",
    useCurrentAddrBtn: "Auto-Fill GPS Address",
    dateLabel: "Delivery Date",
    timeLabel: "Delivery Time Slot",
    selectTimeSlot: "Select a time slot",
    totalAmount: "Total Amount",
    itemTotal: "Item Total",
    deliveryCharge: "Delivery Charges",
    free: "FREE",
    grandTotal: "Grand Total",
    
    // Time slots
    slotMorning: "Morning (8:00 AM - 12:00 PM)",
    slotAfternoon: "Afternoon (12:00 PM - 4:00 PM)",
    slotEvening: "Evening (4:00 PM - 8:00 PM)",

    // Payments
    paymentMethod: "Payment Method",
    cod: "Cash on Delivery (COD)",
    upi: "UPI (Pay via QR Code)",
    upiPayInstruction: "Scan this QR code using any UPI App (GPay, PhonePe, Paytm) to make the payment before sending the WhatsApp order.",
    upiVerifyTip: "Enter your UPI transaction reference number or screenshot details on WhatsApp after sending.",
    placeOrder: "Book and Send on WhatsApp",
    enterAddressAlert: "Please enter your delivery address.",
    selectDateTimeAlert: "Please select a delivery date and time slot.",
    selectCansAlert: "Please select at least 1 water can to place an order.",

    // Order Success
    orderSuccess: "Order Placed Successfully!",
    orderId: "Order ID",
    status: "Status",
    statusPending: "Pending WhatsApp Confirmation",
    statusConfirmed: "WhatsApp Message Sent",
    successMsg: "Your booking details are generated! To confirm your order, click the button below to send the details directly to the plant owner on WhatsApp.",
    sendWhatsAppBtn: "Send Order to WhatsApp",
    backToHome: "Book Another Can",

    // History
    noHistory: "No orders placed yet.",
    orderDate: "Ordered on",
    items: "Items",
    payment: "Payment",
    viewDetails: "View Details",
    statusLabel: "Order Status",
    reorderBtn: "Order Again"
  },
  te: {
    appName: "నీరు డెలివరీ",
    appSubtitle: "స్వచ్ఛమైన నీటి క్యాన్లు మీ ఇంటి వద్దకే",
    languageLabel: "English",
    bookingTab: "బుకింగ్ చేయండి",
    historyTab: "నా బుకింగ్స్",
    themeLight: "లైట్ మోడ్",
    themeDark: "డార్క్ మోడ్",
    
    // Geolocation
    detectingLocation: "మీ స్థానాన్ని గుర్తిస్తున్నాము...",
    locationDetected: "స్థానం విజయవంతంగా గుర్తించబడింది!",
    locationError: "స్థాన అనుమతి నిరాకరించబడింది. డిఫాల్ట్ స్థానాన్ని ఉపయోగిస్తున్నాము.",
    gpsButton: "ప్రస్తుత GPS ఉపయోగించండి",
    
    // Plant Selection
    nearbyPlants: "సమీప వాటర్ ప్లాంట్లు",
    selectPlantTip: "బుకింగ్ ప్రారంభించడానికి ఒక వాటర్ ప్లాంట్‌ను ఎంచుకోండి",
    distance: "దూరం",
    rating: "రేటింగ్",
    phone: "ఫోన్",
    coolingPrice: "చల్లటి క్యాన్",
    normalPrice: "సాధారణ క్యాన్",
    plantSelected: "ఎంచుకున్న ప్లాంట్",

    // Booking Form
    bookingFormTitle: "బుకింగ్ ఫారమ్",
    customerNameLabel: "మీ పూర్తి పేరు",
    customerNamePlaceholder: "మీ పేరును నమోదు చేయండి",
    customerPhoneLabel: "వాట్సాప్ మొబైల్ నంబర్",
    customerPhonePlaceholder: "10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి",
    coolingCansLabel: "చల్లటి నీటి క్యాన్లు (20లీటర్ల ఐస్ కోల్డ్)",
    normalCansLabel: "సాధారణ నీటి క్యాన్లు (20లీటర్ల రెగ్యులర్)",
    coolingDesc: "త్రాగడానికి అనువైనది, ఐస్ చల్లటి నీరు",
    normalDesc: "వంటకు మరియు సాధారణ వినియోగానికి అనువైనది",
    qty: "పరిమాణం",
    pricePerCan: "క్యాన్ ధర",
    deliveryDetails: "డెలివరీ వివరాలు",
    addressLabel: "డెలివరీ చిరునామా",
    addressPlaceholder: "మీ పూర్తి ఇంటి నంబర్, వీధి మరియు గుర్తులను ఇక్కడ నమోదు చేయండి...",
    useCurrentAddrBtn: "GPS చిరునామాను పూరించండి",
    dateLabel: "డెలివరీ తేదీ",
    timeLabel: "డెలివరీ సమయం",
    selectTimeSlot: "సమయాన్ని ఎంచుకోండి",
    totalAmount: "మొత్తం ధర",
    itemTotal: "వస్తువుల ధర",
    deliveryCharge: "డెలివరీ ఛార్జీలు",
    free: "ఉచితం",
    grandTotal: "మొత్తం చెల్లించవలసినది",
    
    // Time slots
    slotMorning: "ఉదయం (8:00 AM - 12:00 PM)",
    slotAfternoon: "మధ్యాహ్నం (12:00 PM - 4:00 PM)",
    slotEvening: "సాయంత్రం (4:00 PM - 8:00 PM)",

    // Payments
    paymentMethod: "చెల్లింపు విధానం",
    cod: "నగదు చెల్లింపు (COD)",
    upi: "యూపీఐ (QR కోడ్ ద్వారా చెల్లింపు)",
    upiPayInstruction: "ఆర్డర్‌ను వాట్సాప్‌లో పంపే ముందు పేమెంట్ పూర్తి చేయడానికి ఈ QR కోడ్‌ను ఏదైనా UPI యాప్ (GPay, PhonePe, Paytm) తో స్కాన్ చేయండి.",
    upiVerifyTip: "పంపిన తర్వాత వాట్సాప్‌లో మీ UPI లావాదేవీ నంబర్ లేదా స్క్రీన్‌షాట్ వివరాలను పంచుకోండి.",
    placeOrder: "బుక్ చేసి వాట్సాప్‌లో పంపండి",
    enterAddressAlert: "దయచేసి మీ డెలివరీ చిరునామాను నమోదు చేయండి.",
    selectDateTimeAlert: "దయచేసి డెలివరీ తేదీ మరియు సమయాన్ని ఎంచుకోండి.",
    selectCansAlert: "దయచేసి ఆర్డర్ చేయడానికి కనీసం 1 వాటర్ క్యాన్ ఎంచుకోండి.",

    // Order Success
    orderSuccess: "ఆర్డర్ విజయవంతంగా బుక్ చేయబడింది!",
    orderId: "ఆర్డర్ ఐడి",
    status: "స్థితి",
    statusPending: "వాట్సాప్ ధృవీకరణ పెండింగ్‌లో ఉంది",
    statusConfirmed: "వాట్సాప్ సందేశం పంపబడింది",
    successMsg: "మీ బుకింగ్ వివరాలు సిద్ధంగా ఉన్నాయి! మీ ఆర్డర్‌ను కన్ఫర్మ్ చేయడానికి, కింద ఉన్న బటన్‌ను క్లిక్ చేసి వాట్సాప్ ద్వారా ప్లాంట్ యజమానికి పంపండి.",
    sendWhatsAppBtn: "ఆర్డర్ వివరాలు వాట్సాప్‌లో పంపండి",
    backToHome: "మరో క్యాన్ బుక్ చేయండి",

    // History
    noHistory: "ఇంకా ఎలాంటి ఆర్డర్లు చేయలేదు.",
    orderDate: "ఆర్డర్ చేసిన తేదీ",
    items: "వస్తువులు",
    payment: "చెల్లింపు",
    viewDetails: "వివరాలు చూడండి",
    statusLabel: "ఆర్డర్ స్థితి",
    reorderBtn: "మళ్ళీ ఆర్డర్ చేయండి"
  }
};
