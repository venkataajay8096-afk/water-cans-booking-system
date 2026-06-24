import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'

// Screens
import HomeScreen          from './screens/HomeScreen'
import LoginScreen         from './screens/LoginScreen'
import RegisterScreen      from './screens/RegisterScreen'
import MapScreen           from './screens/MapScreen'
import PlantDetailScreen   from './screens/PlantDetailScreen'
import OrderFormScreen     from './screens/OrderFormScreen'
import PaymentScreen       from './screens/PaymentScreen'
import WhatsAppConfirmScreen from './screens/WhatsAppConfirmScreen'
import SuccessScreen       from './screens/SuccessScreen'
import MyOrdersScreen      from './screens/MyOrdersScreen'
import TrackingScreen      from './screens/TrackingScreen'

// Protected route wrapper
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"         element={<HomeScreen />} />
        <Route path="/login"    element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />

        {/* Protected */}
        <Route path="/map" element={<PrivateRoute><MapScreen /></PrivateRoute>} />
        <Route path="/plant" element={<PrivateRoute><PlantDetailScreen /></PrivateRoute>} />
        <Route path="/order" element={<PrivateRoute><OrderFormScreen /></PrivateRoute>} />
        <Route path="/payment" element={<PrivateRoute><PaymentScreen /></PrivateRoute>} />
        <Route path="/whatsapp" element={<PrivateRoute><WhatsAppConfirmScreen /></PrivateRoute>} />
        <Route path="/success" element={<PrivateRoute><SuccessScreen /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><MyOrdersScreen /></PrivateRoute>} />
        <Route path="/track" element={<PrivateRoute><TrackingScreen /></PrivateRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
