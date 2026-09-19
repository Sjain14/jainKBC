/**
 * useAnonymousAuth.js — silently signs every audience device in anonymously.
 *
 * Firebase Anonymous Auth gives each device a stable, server-issued UID stored
 * in IndexedDB (not localStorage), so it survives page refresh and browser
 * close/reopen. It is the industry gold standard for one-vote-per-device
 * anonymous polls when login is not required.
 *
 * Usage:
 *   const { uid, ready } = useAnonymousAuth()
 *   // ready === false while Firebase is resolving the session
 *   // ready === true once uid is confirmed
 */

import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { auth } from '../firebase/config.js'

export function useAnonymousAuth() {
  const [uid,   setUid]   = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // onAuthStateChanged fires immediately with the persisted user (if any)
    // or with null on first visit. We only call signInAnonymously when there
    // is no current user — subsequent calls reuse the existing session.
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid)
        setReady(true)
      } else {
        try {
          const credential = await signInAnonymously(auth)
          setUid(credential.user.uid)
          setReady(true)
        } catch (err) {
          // Anonymous auth not enabled in Firebase Console, or network error.
          // Fall back gracefully — voting will be dormant until auth resolves.
          console.warn('[useAnonymousAuth] signInAnonymously failed:', err.message)
          setReady(false)
        }
      }
    })
    return () => unsub()
  }, [])

  return { uid, ready }
}
