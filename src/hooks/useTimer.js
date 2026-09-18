/**
 * useTimer.js — client-side countdown timer for the PLAYER screen.
 *
 * Strategy: drift-corrected countdown.
 *   - timerStartedAt (epoch ms) and timerSeconds (snapshot at start) come
 *     from gameState (Firebase).
 *   - Every 250ms, remaining = timerSeconds - (now - timerStartedAt) / 1000
 *   - This stays accurate even if the tab is throttled.
 *
 * Returns:
 *   remaining  — integer seconds left (clamped ≥ 0)
 *   pct        — 0-1 progress fraction (for animated ring)
 *   urgent     — true when remaining ≤ 10 (triggers red pulse)
 */

import { useEffect, useState } from 'react'

export function useTimer(gameState) {
  const [remaining, setRemaining] = useState(45)

  const {
    timerEnabled,
    timerRunning,
    timerSeconds,
    timerStartedAt,
  } = gameState

  useEffect(() => {
    if (!timerEnabled || !timerRunning) {
      setRemaining(timerSeconds)
      return
    }

    const tick = () => {
      const elapsed  = (Date.now() - timerStartedAt) / 1000
      const left     = Math.max(0, Math.floor(timerSeconds - elapsed))
      setRemaining(left)
    }

    tick() // immediate update
    const interval = setInterval(tick, 250)
    return () => clearInterval(interval)
  }, [timerEnabled, timerRunning, timerSeconds, timerStartedAt])

  // Ring always shows progress out of 45 seconds (the full timer duration)
  const pct = timerEnabled ? remaining / 45 : 1
  const urgent = timerEnabled && remaining <= 10

  return { remaining, pct, urgent }
}

/**
 * getRemainingSeconds — utility used by the ADMIN to compute actual
 * remaining seconds before pausing.
 */
export function getRemainingSeconds(gameState) {
  if (!gameState.timerEnabled || !gameState.timerRunning) {
    return gameState.timerSeconds
  }
  const elapsed = (Date.now() - gameState.timerStartedAt) / 1000
  return Math.max(0, Math.floor(gameState.timerSeconds - elapsed))
}
