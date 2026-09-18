/**
 * AdminApp.jsx — Main admin control panel.
 * Three-column layout (laptop-optimised, min 1024px):
 *   LEFT   : Prize Ladder + Contestant Info
 *   CENTER : Question Panel + Game Controls
 *   RIGHT  : Lifelines + Question Bank
 *
 * Keyboard shortcuts:
 *   1/2/3/4  — select option A/B/C/D
 *   R        — reveal answer
 *   N        — load next level
 *   P        — pause/resume timer
 *   Escape   — clear selected option
 */

import { useEffect, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminAuth }      from '../hooks/useAdminAuth.js'
import { useGameState }      from '../hooks/useGameState.js'
import { useConnectionStatus } from '../hooks/useConnectionStatus.js'
import StatusBar             from './components/StatusBar.jsx'
import PrizeLadderMini       from './components/PrizeLadderMini.jsx'
import QuestionPanel         from './components/QuestionPanel.jsx'
import GameControls          from './components/GameControls.jsx'
import LifelinePanel         from './components/LifelinePanel.jsx'
import QuestionBank          from './components/QuestionBank.jsx'
import { selectOption, pauseTimer, resumeTimer, revealAnswer } from '../firebase/gameState.js'
import { getRemainingSeconds } from '../hooks/useTimer.js'

export default function AdminApp() {
  const { user, loading: authLoading, signOut } = useAdminAuth()
  const { gameState, loading: gsLoading } = useGameState()
  const connected = useConnectionStatus()

  // ── Keyboard shortcuts — must be declared before any conditional return ──
  const handleKey = useCallback((e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return
    const phase = gameState.phase

    switch (e.key.toLowerCase()) {
      case '1': if (phase === 'question') selectOption('A'); break
      case '2': if (phase === 'question') selectOption('B'); break
      case '3': if (phase === 'question') selectOption('C'); break
      case '4': if (phase === 'question') selectOption('D'); break
      case 'r':
        if (phase === 'question' && gameState.selectedOption) {
          revealAnswer()
        }
        break
      case 'p':
        if (phase === 'question' && gameState.timerEnabled) {
          if (gameState.timerRunning) {
            pauseTimer(getRemainingSeconds(gameState))
          } else {
            resumeTimer(gameState.timerSeconds)
          }
        }
        break
      default: break
    }
  }, [gameState])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  // ── Redirect to login if not authenticated ──────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a1128] flex items-center justify-center">
        <p className="text-gold-400 animate-pulse">Checking auth…</p>
      </div>
    )
  }
  if (!user) return <Navigate to="/admin/login" replace />

  if (gsLoading) {
    return (
      <div className="min-h-screen bg-[#0a1128] flex items-center justify-center">
        <p className="text-gold-400 animate-pulse">Firebase से जुड़ रहे हैं…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a1128] text-white font-sans flex flex-col">
      {/* Top status bar */}
      <StatusBar
        gameState={gameState}
        connected={connected}
        user={user}
        onSignOut={signOut}
      />

      {/* 3-column grid */}
      <div className="flex-1 grid grid-cols-[260px_1fr_280px] gap-3 p-3 overflow-hidden">

        {/* ── LEFT: Prize Ladder + Info ── */}
        <aside className="flex flex-col gap-3 overflow-y-auto">
          <PrizeLadderMini gameState={gameState} />
        </aside>

        {/* ── CENTER: Question + Controls ── */}
        <main className="flex flex-col gap-3 overflow-y-auto">
          <QuestionPanel gameState={gameState} />
          <GameControls  gameState={gameState} />
        </main>

        {/* ── RIGHT: Lifelines + Question Bank ── */}
        <aside className="flex flex-col gap-3 overflow-y-auto">
          <LifelinePanel gameState={gameState} />
          <QuestionBank  gameState={gameState} />
        </aside>
      </div>

      {/* Keyboard shortcut help bar */}
      <div className="border-t border-white/5 bg-navy-950/60 px-4 py-1.5 flex gap-6 text-[11px] text-gray-500 flex-wrap">
        {[['1/2/3/4','Select A/B/C/D'],['R','Reveal Answer'],['P','Pause/Resume Timer']].map(([key, label]) => (
          <span key={key}>
            <kbd className="bg-white/10 text-gray-300 rounded px-1.5 py-0.5 font-mono text-[10px] mr-1">{key}</kbd>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
