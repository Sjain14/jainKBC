import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../hooks/useAdminAuth.js'

export default function AdminLogin() {
  const { user, signIn, loading, error } = useAdminAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    await signIn(email, password)
    setSubmitting(false)
  }

  if (user) return <Navigate to="/admin" replace />

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-gold-400 text-xl animate-pulse">लोड हो रहा है…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0d2266_0%,_#020818_70%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo / title */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="text-3xl font-bold text-gold-400 font-devanagari leading-tight">
            कौन बनेगा ज्ञानवान
          </h1>
          <p className="text-gold-600 text-sm mt-1 font-devanagari">
            माधवगंज परिवार दशलक्षण महापर्व
          </p>
          <p className="text-gray-500 text-xs mt-3 uppercase tracking-widest">Admin Panel</p>
        </div>

        {/* Login card */}
        <form
          onSubmit={handleSubmit}
          className="bg-navy-800 border border-gold-600/30 rounded-2xl p-8 shadow-2xl"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="admin@example.com"
                className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2.5
                           text-white placeholder-gray-600 text-sm
                           focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/40
                           transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2.5
                           text-white placeholder-gray-600 text-sm
                           focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/40
                           transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-50
                         text-navy-950 font-bold py-3 rounded-lg
                         transition-all duration-200 active:scale-95
                         text-sm uppercase tracking-wider mt-2"
            >
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </div>
        </form>

        <p className="text-center text-gray-600 text-xs mt-6">
          Player view: <span className="text-gold-700">/play</span>
        </p>
      </div>
    </div>
  )
}
