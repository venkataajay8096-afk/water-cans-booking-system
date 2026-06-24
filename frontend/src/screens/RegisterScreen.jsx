import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import Bubbles from '../components/Bubbles'

export default function RegisterScreen() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '', confirmPassword: '',
  })
  const [showPwd, setShowPwd] = useState(false)

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.password) {
      toast.error('Name, phone and password are required')
      return
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    const result = await register({
      name: form.name, phone: form.phone,
      email: form.email, password: form.password,
    })
    if (result.success) {
      toast.success(`Account created! Welcome, ${result.user.name.split(' ')[0]} 🎉`)
      navigate('/map')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="relative min-h-screen ocean-bg flex items-center justify-center px-4 py-20 overflow-hidden">
      <Bubbles />

      <div className="relative z-10 w-full max-w-md screen-enter">
        <div className="glass-white rounded-3xl p-8 shadow-2xl border border-white/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3 animate-water-drop">🚰</div>
            <h1 className="text-2xl font-black text-slate-800">Create Account</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Join thousands ordering water cans daily
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">
                Full Name *
              </label>
              <input
                type="text" name="name" id="reg-name"
                value={form.name} onChange={handleChange}
                placeholder="Enter your full name" required
                className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200
                           bg-slate-50 text-slate-800 font-medium text-sm
                           focus:outline-none focus:border-ocean-dark focus:bg-white transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">
                Mobile Number * (used for login)
              </label>
              <input
                type="tel" name="phone" id="reg-phone"
                value={form.phone} onChange={handleChange}
                placeholder="+91 98765 43210" required
                className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200
                           bg-slate-50 text-slate-800 font-medium text-sm
                           focus:outline-none focus:border-ocean-dark focus:bg-white transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">
                Email (optional)
              </label>
              <input
                type="email" name="email" id="reg-email"
                value={form.email} onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200
                           bg-slate-50 text-slate-800 font-medium text-sm
                           focus:outline-none focus:border-ocean-dark focus:bg-white transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'} name="password" id="reg-password"
                  value={form.password} onChange={handleChange}
                  placeholder="Min 6 characters" required
                  className="w-full px-4 py-3.5 pr-12 rounded-xl border-2 border-slate-200
                             bg-slate-50 text-slate-800 font-medium text-sm
                             focus:outline-none focus:border-ocean-dark focus:bg-white transition-all"
                />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-lg">
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">
                Confirm Password *
              </label>
              <input
                type="password" name="confirmPassword" id="reg-confirm"
                value={form.confirmPassword} onChange={handleChange}
                placeholder="Repeat your password" required
                className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200
                           bg-slate-50 text-slate-800 font-medium text-sm
                           focus:outline-none focus:border-ocean-dark focus:bg-white transition-all"
              />
            </div>

            {/* Submit */}
            <button
              type="submit" id="reg-submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-ocean-dark to-ocean-mid
                         hover:from-ocean-darkest hover:to-ocean-dark
                         text-white font-black py-4 rounded-xl shadow-lg
                         transition-all duration-300 mt-2 cursor-pointer
                         disabled:opacity-60 disabled:cursor-not-allowed btn-glow"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : '🎉 Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-ocean-dark font-bold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
