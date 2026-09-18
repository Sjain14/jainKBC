/**
 * useAdminAuth.js — Firebase email/password auth guard for admin panel.
 * Returns { user, loading, signIn, signOut, error }
 */

import { useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth'
import { auth } from '../firebase/config.js'

export function useAdminAuth() {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  async function signIn(email, password) {
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      setError('Invalid email or password. Please try again.')
      console.error('[useAdminAuth] signIn error:', err.code)
    }
  }

  async function signOut() {
    await fbSignOut(auth)
  }

  return { user, loading, error, signIn, signOut }
}
