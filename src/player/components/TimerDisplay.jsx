import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useTimer } from '../../hooks/useTimer.js'
import { timerExpired } from '../../firebase/gameState.js'

export default function TimerDisplay({ gameState, soundManager }) {
  const { remaining, pct, urgent } = useTimer(gameState)
  const tickingRef  = useRef(false)
  const expiredRef  = useRef(false)

  // Call timerExpired() once when countdown hits 0
  useEffect(() => {
    if (gameState.timerRunning && remaining === 0 && !expiredRef.current) {
      expiredRef.current = true
      timerExpired()
    }
    if (gameState.timerRunning && remaining > 0) {
      expiredRef.current = false
    }
  }, [remaining, gameState.timerRunning])

  // Play/stop tick sound when urgent
  useEffect(() => {
    if (!soundManager) return
    if (urgent && gameState.timerRunning && !tickingRef.current) {
      tickingRef.current = true
      soundManager.play('timer-tick')
    } else if (!urgent || !gameState.timerRunning) {
      if (tickingRef.current) {
        tickingRef.current = false
        soundManager.stop('timer-tick')
      }
    }
  }, [urgent, gameState.timerRunning])

  if (!gameState.timerEnabled) return null

  // Colour transitions: green → yellow → red
  const colour = remaining > 20 ? '#22c55e' : remaining > 10 ? '#eab308' : '#ef4444'

  // SVG ring params
  const R   = 44
  const C   = 2 * Math.PI * R
  const dashOffset = C * (1 - pct)

  return (
    <motion.div
      className="flex flex-col items-center gap-1"
      animate={urgent && gameState.timerRunning ? { scale: [1, 1.04, 1] } : { scale: 1 }}
      transition={{ duration: 0.5, repeat: urgent ? Infinity : 0 }}
    >
      <div className="relative w-24 h-24">
        {/* Background ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={R} fill="none" stroke="#1e293b" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={R} fill="none"
            stroke={colour}
            strokeWidth="8"
            strokeDasharray={C}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.25s linear, stroke 0.5s' }}
          />
        </svg>

        {/* Number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-2xl font-bold font-mono"
            style={{ color: colour }}
          >
            {remaining}
          </span>
        </div>
      </div>
      <span className="text-[10px] uppercase tracking-widest text-gray-500">seconds</span>
    </motion.div>
  )
}
