# 💧 Neeru Delivery — Water Can Booking System

Full-stack water can booking platform with GPS detection, Google Maps, WhatsApp notifications, animated UI, and complete order management.

---

## 🏗️ Project Structure

```
water-cans-booking-system/
├── backend/              # Node.js + Express + MongoDB
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API route handlers
│   ├── middleware/       # JWT auth middleware
│   ├── utils/            # Haversine + order ID helpers
│   ├── server.js         # Main Express server
│   ├── Procfile          # Railway deployment
│   └── .env.example      # Environment variable template
│
└── frontend/             # React 18 + Tailwind CSS v3
    ├── src/
    │   ├── api/          # Axios API client
    │   ├── context/      # Auth, Order, Location contexts
    │   ├── components/   # Navbar, Map, WaveAnimation, Bubbles
    │   ├── screens/      # All 9 screens
    │   ├── App.jsx       # React Router setup
    │   ├── main.jsx      # Entry point
    │   └── index.css     # Tailwind + all custom animations
    ├── vercel.json       # Vercel SPA routing
    └── .env.example      # Environment variable template
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Git

---

### 1. Clone & Setup

```bash
git clone <your-repo-url>
cd "water cans booking system"
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

**Create `.env` file** (copy from `.env.example`):
```bash
cp .env.example .env
```

Edit `backend/.env`:
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/watercandb
JWT_SECRET=your_super_secret_key_min_32_chars
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
GOOGLE_MAPS_API_KEY=your_google_maps_key
PORT=5000
```

**Start the backend:**
```bash
npm run dev       # development (nodemon)
npm start         # production
```

The API runs at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

**Create `.env` file:**
```bash
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

**Start the frontend:**
```bash
npm run dev
```

Opens at: `http://localhost:5173`

---

## 🗃️ Database (MongoDB Atlas)

### Free Tier Setup
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free M0 cluster
3. Create database user with read/write access
4. Add your IP to the Network Access allowlist (or `0.0.0.0/0` for all)
5. Get connection string from **Connect → Drivers → Node.js**
6. Paste into `backend/.env` as `MONGODB_URI`

### Auto-Seeding
The backend **automatically seeds 3 demo plants** on first start:
- Tirumala Water Plant (₹40/₹25)
- Sri Venkateswara Waters (₹35/₹20)
- Balaji Pure Waters (₹45/₹30)

---

## 📱 API Endpoints

| Method | Endpoint                    | Auth | Description              |
|--------|-----------------------------|------|--------------------------|
| POST   | `/api/auth/register`        | —    | Register + get JWT       |
| POST   | `/api/auth/login`           | —    | Login + get JWT          |
| GET    | `/api/auth/me`              | ✅   | Get current user         |
| GET    | `/api/plants/nearby`        | —    | Nearby plants by GPS     |
| GET    | `/api/plants/:id`           | —    | Plant details            |
| POST   | `/api/plants`               | Admin| Add plant                |
| POST   | `/api/orders`               | ✅   | Place order              |
| GET    | `/api/orders/my-orders`     | ✅   | User order history       |
| GET    | `/api/orders/:id`           | ✅   | Single order             |
| PUT    | `/api/orders/:id/status`    | ✅   | Update order status      |
| POST   | `/api/whatsapp/send`        | ✅   | Send WhatsApp message    |
| POST   | `/api/whatsapp/preview`     | ✅   | Preview WhatsApp message |

---

## 🎨 Animation Features

All animations are pure CSS — no external animation libraries:

| Animation         | Effect                                          |
|-------------------|-------------------------------------------------|
| `waveMove`        | 3 SVG wave layers at 4s/6s/8s speeds           |
| `bubbleRise`      | 22 bubbles rising from bottom to top           |
| `floatUpDown`     | Water cans oscillating 300px+ images           |
| `gradientShift`   | Ocean color gradient cycling 8s                |
| `rippleExpand`    | Circle expanding outward on can hover          |
| `iceRotate`       | Ice crystals orbiting cooling can               |
| `slideInBottom`   | Plant cards sliding in with stagger delay      |
| `drawCheckmark`   | SVG stroke-dashoffset reveal on success        |
| `splashBurst`     | Radial ring burst on order success             |
| `confettiFall`    | Blue/white/cyan pieces falling from top        |
| `pulseGlow`       | Glowing pulse on CTA buttons                   |

---

## 🗺️ GPS & Maps

- **Auto GPS**: Requests location on app load via `navigator.geolocation`
- **Google Maps**: Loads if `VITE_GOOGLE_MAPS_API_KEY` is set
- **Leaflet Fallback**: Uses OpenStreetMap (free, no key needed)
- **Plant Search**: Backend API → Overpass OSM → Fallback mock data
- **Manual Search**: City name search via Nominatim geocoding (if GPS denied)

---

## 📲 WhatsApp Integration

Two modes:
1. **Twilio API** (if credentials set): Sends directly to plant owner's WhatsApp
2. **wa.me Link** (fallback): Opens WhatsApp with pre-filled message

Message format:
```
────────────────────
💧 Water Can Order
Order ID: ORD-20240621-1234
────────────────────
👤 Customer: John Doe | +91 98765 43210
────────────────────
❄️ Cooling Cans: 2 × ₹40 = ₹80
💧 Normal Cans:  1 × ₹25 = ₹25
💰 Grand Total: ₹105
────────────────────
📅 Delivery: 22 June 2024
⏰ Time: 6:00 AM – 11:00 AM
📍 Address: 12 Main St, Tirupati
💳 Payment: Cash on Delivery
────────────────────
```

---

## 🚢 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Push to GitHub → import in vercel.com
```
Set environment variables in Vercel dashboard:
- `VITE_API_URL` = your Railway backend URL
- `VITE_GOOGLE_MAPS_API_KEY` = your key

### Backend → Railway
1. Push `backend/` to GitHub
2. Create new project on [railway.app](https://railway.app)
3. Deploy from GitHub, set root directory to `backend`
4. Add all environment variables from `.env.example`
5. Railway auto-detects `Procfile` → runs `node server.js`

### Database → MongoDB Atlas
Free M0 tier is sufficient for development and light production.

---

## 🔑 API Keys Guide

| Service      | Where to Get                          | Used For                    |
|--------------|---------------------------------------|-----------------------------|
| MongoDB Atlas| mongodb.com/atlas → Free M0           | Database                    |
| JWT Secret   | Any random 32+ char string            | Auth token signing          |
| Google Maps  | console.cloud.google.com → Maps JS API| Map display + Places search |
| Twilio       | twilio.com → Free trial               | WhatsApp message sending    |

> **Note:** The app works without Google Maps (uses OpenStreetMap) and without Twilio (uses wa.me links). Only MongoDB URI and JWT Secret are required.

---

## 📱 Screens

| Route       | Screen                | Description                                    |
|-------------|----------------------|------------------------------------------------|
| `/`         | Home                 | Full-screen hero with ocean animation          |
| `/login`    | Login                | Phone + password auth                          |
| `/register` | Register             | Account creation                               |
| `/map`      | Map                  | GPS map + nearby plant cards                  |
| `/plant`    | Plant Detail         | Selected plant info, pricing, ratings          |
| `/order`    | Order Form           | Large can images + qty + delivery details      |
| `/payment`  | Payment              | UPI QR (300px) + Cash option + coin particles |
| `/whatsapp` | WhatsApp Confirm     | Message preview + send button                  |
| `/success`  | Order Success        | Checkmark animation + confetti burst           |
| `/orders`   | My Orders            | Order history with status badges               |

---

## 🛠️ Tech Stack

| Layer     | Technology               |
|-----------|--------------------------|
| Frontend  | React 18, React Router v6|
| Styling   | Tailwind CSS v3          |
| Animations| Pure CSS keyframes       |
| API       | Axios                    |
| Backend   | Node.js, Express 4       |
| Database  | MongoDB + Mongoose       |
| Auth      | JWT + bcryptjs           |
| Maps      | Google Maps / Leaflet    |
| WhatsApp  | Twilio / wa.me           |
| Hosting   | Vercel (FE) + Railway (BE)|

---

## 📞 Support

For issues or questions, contact via WhatsApp or create a GitHub issue.

© 2026 Neeru Delivery. All rights reserved.
