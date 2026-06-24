import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('wc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('wc_token')
      localStorage.removeItem('wc_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth endpoints ──────────────────────────────────────────────────────────
export const register = (data) => API.post('/api/auth/register', data)
export const login    = (data) => API.post('/api/auth/login', data)
export const getMe    = ()     => API.get('/api/auth/me')
export const updateProfile = (data) => API.put('/api/auth/update-profile', data)

// ── Plant endpoints ─────────────────────────────────────────────────────────
export const getNearbyPlants = (lat, lng, radius = 10) =>
  API.get(`/api/plants/nearby?lat=${lat}&lng=${lng}&radius=${radius}`)
export const getAllPlants = () => API.get('/api/plants')
export const getPlant    = (id) => API.get(`/api/plants/${id}`)

// ── Order endpoints ─────────────────────────────────────────────────────────
export const placeOrder  = (data) => API.post('/api/orders', data)
export const getMyOrders = ()     => API.get('/api/orders/my-orders')
export const getOrder    = (id)   => API.get(`/api/orders/${id}`)
export const updateOrderStatus = (id, data) => API.put(`/api/orders/${id}/status`, data)

// ── WhatsApp endpoints ──────────────────────────────────────────────────────
export const sendWhatsApp    = (order_id) => API.post('/api/whatsapp/send', { order_id })
export const previewWhatsApp = (order_id) => API.post('/api/whatsapp/preview', { order_id })

export default API
