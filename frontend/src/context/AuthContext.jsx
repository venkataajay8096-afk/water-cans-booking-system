import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// ─── Demo users (work without any backend) ────────────────────────────────────
const DEMO_USERS = [
  {
    _id:    'demo_user_1',
    name:   'Demo User',
    phone:  '9999999999',
    email:  'demo@neeru.app',
    role:   'user',
  },
]

const DEMO_PASSWORD = 'demo123'

function saveDemoSession(user) {
  const fakeToken = btoa(JSON.stringify({ id: user._id, demo: true, exp: Date.now() + 30 * 86400000 }))
  localStorage.setItem('wc_token', fakeToken)
  localStorage.setItem('wc_user', JSON.stringify(user))
  localStorage.setItem('wc_demo_mode', 'true')
  return fakeToken
}

function isDemoToken(token) {
  try {
    const payload = JSON.parse(atob(token))
    return payload.demo === true
  } catch { return false }
}

// ─── Context ──────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('wc_user')) } catch { return null }
  })
  const [token,   setToken]   = useState(() => localStorage.getItem('wc_token') || null)
  const [loading, setLoading] = useState(false)
  const [demoMode, setDemoMode] = useState(() => localStorage.getItem('wc_demo_mode') === 'true')
  const [backendOnline, setBackendOnline] = useState(null) // null = unknown

  // Check if backend is reachable — polls every 5s until online
  useEffect(() => {
    let intervalId = null

    const check = async () => {
      try {
        const res = await fetch(
          (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/health',
          { signal: AbortSignal.timeout(3000) }
        )
        const online = res.ok
        setBackendOnline(online)
        // Stop polling once online
        if (online && intervalId) {
          clearInterval(intervalId)
          intervalId = null
        }
      } catch {
        setBackendOnline(false)
      }
    }

    check() // immediate first check
    intervalId = setInterval(check, 5000) // re-check every 5s

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [])

  // Verify token on mount (only for real accounts)
  useEffect(() => {
    if (!token) return
    if (isDemoToken(token)) return // demo sessions don't need verification

    import('../api/axios').then(({ getMe }) => {
      getMe()
        .then((res) => setUser(res.data.user))
        .catch(() => logout())
    }).catch(() => {})
  }, [])

  // ── Demo Login ──────────────────────────────────────────────────────────────
  const demoLogin = () => {
    const demoUser = DEMO_USERS[0]
    const tk = saveDemoSession(demoUser)
    setToken(tk)
    setUser(demoUser)
    setDemoMode(true)
    return { success: true, user: demoUser }
  }

  // ── Real Login (calls backend) ──────────────────────────────────────────────
  const login = async (phone, password) => {
    // Try demo credentials first
    if (phone === '9999999999' && password === DEMO_PASSWORD) {
      return demoLogin()
    }
    const demoUser = DEMO_USERS.find(u => u.phone === phone)
    if (demoUser && password === DEMO_PASSWORD) {
      return demoLogin()
    }

    setLoading(true)
    try {
      const { default: API } = await import('../api/axios')
      const { data } = await API.post('/api/auth/login', { phone, password })
      localStorage.setItem('wc_token', data.token)
      localStorage.setItem('wc_user', JSON.stringify(data.user))
      localStorage.removeItem('wc_demo_mode')
      setToken(data.token)
      setUser(data.user)
      setDemoMode(false)
      return { success: true, user: data.user }
    } catch (err) {
      const msg = err.response?.data?.error || err.message
      // If backend is down, suggest demo
      if (!err.response || err.code === 'ERR_NETWORK' || err.code === 'ERR_CONNECTION_REFUSED') {
        return {
          success: false,
          error: 'Cannot reach server. Use Demo Login to explore the app, or start the backend.',
          backendDown: true,
        }
      }
      return { success: false, error: msg || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  // ── Register ────────────────────────────────────────────────────────────────
  const register = async (formData) => {
    setLoading(true)
    try {
      const { default: API } = await import('../api/axios')
      const { data } = await API.post('/api/auth/register', formData)
      localStorage.setItem('wc_token', data.token)
      localStorage.setItem('wc_user', JSON.stringify(data.user))
      localStorage.removeItem('wc_demo_mode')
      setToken(data.token)
      setUser(data.user)
      setDemoMode(false)
      return { success: true, user: data.user }
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        return {
          success: false,
          error: 'Cannot reach server. Use Demo Login to explore the app, or start the backend.',
          backendDown: true,
        }
      }
      return { success: false, error: err.response?.data?.error || 'Registration failed' }
    } finally {
      setLoading(false)
    }
  }

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('wc_token')
    localStorage.removeItem('wc_user')
    localStorage.removeItem('wc_demo_mode')
    setToken(null)
    setUser(null)
    setDemoMode(false)
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading, demoMode, backendOnline,
      login, register, logout, demoLogin,
      isAuthenticated: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
