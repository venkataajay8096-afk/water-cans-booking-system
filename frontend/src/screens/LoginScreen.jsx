import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import Bubbles from '../components/Bubbles'

export default function LoginScreen() {
  const { login, demoLogin, loading, backendOnline } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ phone: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.phone || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    const result = await login(form.phone, form.password)
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name.split(' ')[0]}! 💧`)
      navigate('/map')
    } else if (result.backendDown) {
      toast.error('Server offline — click "Demo Login" to explore the app 👇', { duration: 5000 })
    } else {
      toast.error(result.error)
    }
  }

  const handleDemoLogin = async () => {
    setDemoLoading(true)
    await new Promise(r => setTimeout(r, 500)) // small delay for UX
    const result = demoLogin()
    setDemoLoading(false)
    if (result.success) {
      toast.success('🎉 Demo mode activated! Explore the full app.')
      navigate('/map')
    }
  }

  return (
    <div className="relative min-h-screen ocean-bg flex items-center justify-center px-4 py-20 overflow-hidden">
      <Bubbles />

      <div className="relative z-10 w-full max-w-md screen-enter">
        {/* Card */}
        <div className="glass-white rounded-3xl p-8 shadow-2xl border border-white/50">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-3 animate-water-drop">💧</div>
            <h1 className="text-2xl font-black text-slate-800">Welcome Back</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Login to order water cans
            </p>
          </div>

          {/* Backend offline banner */}
          {backendOnline === false && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2.5 animate-fade-slide">
              <span className="text-lg shrink-0 mt-0.5">⚠️</span>
              <div>
                <p className="text-amber-800 font-bold text-sm">Backend server is offline</p>
                <p className="text-amber-600 text-xs mt-0.5 font-medium">
                  Start it with <code className="bg-amber-100 px-1 rounded">cd backend &amp;&amp; npm run dev</code>,
                  or use Demo Login below to explore.
                </p>
              </div>
            </div>
          )}

          {/* ── Demo Login (always visible) ─────────────────────────────────── */}
          <button
            type="button"
            id="demo-login-btn"
            onClick={handleDemoLogin}
            disabled={demoLoading}
            className="w-full mb-5 bg-gradient-to-r from-emerald-500 to-teal-500
                       hover:from-emerald-600 hover:to-teal-600
                       text-white font-black py-3.5 rounded-xl shadow-lg
                       transition-all duration-300 cursor-pointer
                       disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {demoLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Starting demo…
              </>
            ) : (
              <>
                <span className="text-lg">🚀</span>
                Demo Login — No Account Needed
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              or login with account
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">
                Mobile Number
              </label>
              <input
                type="tel"
                name="phone"
                id="login-phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200
                           bg-slate-50 text-slate-800 font-medium text-sm
                           focus:outline-none focus:border-ocean-dark focus:bg-white transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  id="login-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3.5 pr-12 rounded-xl border-2 border-slate-200
                             bg-slate-50 text-slate-800 font-medium text-sm
                             focus:outline-none focus:border-ocean-dark focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-lg"
                >
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-ocean-dark to-ocean-mid
                         hover:from-ocean-darkest hover:to-ocean-dark
                         text-white font-black py-4 rounded-xl shadow-lg
                         transition-all duration-300 cursor-pointer
                         disabled:opacity-60 disabled:cursor-not-allowed btn-glow"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Logging in…
                </span>
              ) : '🚰 Login'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
            <p className="text-xs text-slate-500 font-medium text-center">
              Demo credentials: <span className="font-bold text-slate-700">9999999999</span> / <span className="font-bold text-slate-700">demo123</span>
            </p>
          </div>

          <p className="text-center text-sm text-slate-500 mt-4 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-ocean-dark font-bold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
