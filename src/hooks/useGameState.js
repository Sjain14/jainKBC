/**
 * useGameState.js — real-time listener on /gameState
 * Both admin and player use this hook; both get the same data.
 * Player screen: read-only. Admin: uses write helpers from gameState.js.
 */

import { useEffect, useState } from 'react'
import { ref, onValue }        from 'firebase/database'
import { db }                  from '../firebase/config.js'
import { INITIAL_GAME_STATE }  from '../firebase/gameState.js'

export function useGameState() {
  const [gameState, setGameState] = useState(INITIAL_GAME_STATE)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    const gsRef = ref(db, 'gameState')

    const unsub = onValue(
      gsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setGameState({ ...INITIAL_GAME_STATE, ...snapshot.val() })
        } else {
          // First run — gameState node doesn't exist yet
          setGameState(INITIAL_GAME_STATE)
        }
        setLoading(false)
      },
      (err) => {
        console.error('[useGameState] Firebase error:', err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsub()
  }, [])

  return { gameState, loading, error }
}
