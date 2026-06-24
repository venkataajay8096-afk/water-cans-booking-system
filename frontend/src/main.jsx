import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { OrderProvider } from './context/OrderContext'
import { LocationProvider } from './context/LocationContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <OrderProvider>
            <App />
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3500,
                style: {
                  background: '#0077B6',
                  color: '#fff',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: '600',
                  borderRadius: '12px',
                  padding: '12px 16px',
                },
                success: {
                  style: { background: '#06D6A0' },
                  iconTheme: { primary: '#fff', secondary: '#06D6A0' },
                },
                error: {
                  style: { background: '#ef4444' },
                },
              }}
            />
          </OrderProvider>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
