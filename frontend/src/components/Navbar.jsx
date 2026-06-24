import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50
                        bg-white/10 backdrop-blur-xl border-b border-white/20
                        shadow-lg shadow-ocean-darkest/20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ocean-dark to-ocean-mid
                          flex items-center justify-center text-xl shadow-md
                          group-hover:scale-110 transition-transform duration-200">
            💧
          </div>
          <div>
            <p className="font-black text-white text-lg leading-none tracking-tight">Neeru</p>
            <p className="text-ocean-light text-[10px] font-semibold uppercase tracking-widest">Delivery</p>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/orders"
                className="hidden sm:flex items-center gap-1.5 text-white/80 hover:text-white
                           text-sm font-semibold px-3 py-2 rounded-xl hover:bg-white/10 transition-all"
              >
                📦 My Orders
              </Link>
              <Link
                to="/track"
                className="hidden sm:flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200
                           text-sm font-bold px-3 py-2 rounded-xl hover:bg-white/10 transition-all"
              >
                🚚 Track
              </Link>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 glass rounded-xl px-3 py-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-ocean-dark to-ocean-mid
                                  flex items-center justify-center text-white text-xs font-black">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-white text-sm font-semibold">{user?.name?.split(' ')[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-white/70 hover:text-white text-sm font-semibold
                             px-3 py-2 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white/80 hover:text-white text-sm font-semibold
                           px-3 py-2 rounded-xl hover:bg-white/10 transition-all"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-ocean-dark hover:bg-ocean-lightest
                           text-sm font-extrabold px-4 py-2 rounded-xl
                           shadow-md hover:shadow-lg transition-all"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
