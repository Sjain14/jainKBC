/**
 * useConnectionStatus.js — watches Firebase .info/connected
 * Returns true when the client has an active RTDB connection.
 */

import { useEffect, useState } from 'react'
import { ref, onValue }        from 'firebase/database'
import { db }                  from '../firebase/config.js'

export function useConnectionStatus() {
  const [connected, setConnected] = useState(true)

  useEffect(() => {
    const connRef = ref(db, '.info/connected')
    const unsub = onValue(connRef, (snap) => {
      setConnected(snap.val() === true)
    })
    return () => unsub()
  }, [])

  return connected
}
