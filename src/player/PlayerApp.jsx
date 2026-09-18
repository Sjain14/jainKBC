/**
 * PlayerApp.jsx — Read-only audience/player screen.
 * Listens to /gameState and routes to the correct screen.
 * Handles sound transitions between phases.
 */

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameState }    from '../hooks/useGameState.js'
import { useSoundManager } from '../hooks/useSoundManager.js'
import IdleScreen          from './screens/IdleScreen.jsx'
import QuestionScreen      from './screens/QuestionScreen.jsx'
import GameOverScreen      from './screens/GameOverScreen.jsx'
import WinnerScreen        from './screens/WinnerScreen.jsx'
import QuitScreen          from './screens/QuitScreen.jsx'

export default function PlayerApp() {
  const { gameState, loading } = useGameState()
  const { play, stop, stopAll, fadeOut } = useSoundManager()
  const prevPhase = useRef(null)

  // ── Sound transitions on phase change ──────────────────────────────────
  useEffect(() => {
    if (loading) return
    const phase = gameState.phase
    if (phase === prevPhase.current) return
    prevPhase.current = phase

    stopAll()
    if (phase === 'idle')     play('idle-bg')
    if (phase === 'question') play('question-bg')
    if (phase === 'winner')   play('winner')
    if (phase === 'gameover') play('wrong')
  }, [gameState.phase, loading])

  // ── Timer tick sound (last 10s) ─────────────────────────────────────────
  const tickingRef = useRef(false)
  useEffect(() => {
    if (!gameState.timerEnabled) return
    if (gameState.timerRunning && !tickingRef.current) {
      // Will be triggered by TimerDisplay's urgent state
    }
  }, [gameState.timerEnabled, gameState.timerRunning])

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="text-gold-400 text-xl font-devanagari animate-pulse">
          लोड हो रहा है…
        </div>
      </div>
    )
  }

  const { phase } = gameState

  return (
    <div className="min-h-screen bg-navy-950 overflow-hidden relative">
      {/* Ambient radial background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,_#071240_0%,_#020818_100%)] pointer-events-none" />

      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.div key="idle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }} className="relative z-10"
          >
            <IdleScreen gameState={gameState} />
          </motion.div>
        )}

        {(phase === 'question' || phase === 'result') && (
          <motion.div key="question"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }} className="relative z-10"
          >
            <QuestionScreen gameState={gameState} soundManager={{ play, stop, fadeOut }} />
          </motion.div>
        )}

        {phase === 'gameover' && (
          <motion.div key="gameover"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }} className="relative z-10"
          >
            <GameOverScreen gameState={gameState} />
          </motion.div>
        )}

        {phase === 'winner' && (
          <motion.div key="winner"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }} className="relative z-10"
          >
            <WinnerScreen gameState={gameState} />
          </motion.div>
        )}

        {phase === 'quit' && (
          <motion.div key="quit"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }} className="relative z-10"
          >
            <QuitScreen gameState={gameState} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
