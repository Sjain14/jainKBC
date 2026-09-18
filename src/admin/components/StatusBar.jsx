import { useConnectionStatus } from '../../hooks/useConnectionStatus.js'

const PHASE_LABELS = {
  idle:     { label: 'Idle',     color: 'text-gray-400' },
  question: { label: 'Question', color: 'text-blue-400' },
  result:   { label: 'Result',   color: 'text-green-400' },
  gameover: { label: 'Game Over',color: 'text-red-400'  },
  winner:   { label: 'Winner 🎉',color: 'text-gold-400' },
  quit:     { label: 'Quit',     color: 'text-yellow-400'},
}

export default function StatusBar({ gameState, user, onSignOut }) {
  const connected = useConnectionStatus()
  const phaseInfo = PHASE_LABELS[gameState.phase] ?? { label: gameState.phase, color: 'text-gray-400' }

  return (
    <header className="h-11 bg-navy-950/80 border-b border-white/5 flex items-center px-4 gap-4 shrink-0">
      {/* Logo + Title */}
      <div className="flex items-center gap-2">
        <img
          src="/jainKBC_logo.png"
          alt="Jain KBC Logo"
          className="w-6 h-6 object-contain"
        />
        <span className="text-gold-400 font-bold text-sm font-devanagari whitespace-nowrap">
          KBC Admin
        </span>
      </div>

      <div className="h-4 w-px bg-white/10" />

      {/* Connection */}
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`} />
        <span className="text-xs text-gray-400">{connected ? 'Live' : 'Offline'}</span>
      </div>

      {/* Phase */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-500">Phase:</span>
        <span className={`text-xs font-medium ${phaseInfo.color}`}>{phaseInfo.label}</span>
      </div>

      {/* Level */}
      {gameState.currentLevel > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Level:</span>
          <span className="text-xs font-bold text-white">{gameState.currentLevel}</span>
        </div>
      )}

      {/* Contestant */}
      {gameState.contestantName && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Contestant:</span>
          <span className="text-xs font-semibold text-gold-300 font-devanagari">{gameState.contestantName}</span>
        </div>
      )}

      {/* Timer indicator */}
      {gameState.timerEnabled && gameState.phase === 'question' && (
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-mono font-bold ${gameState.timerRunning ? 'text-green-400' : 'text-yellow-400'}`}>
            ⏱ {gameState.timerRunning ? 'Running' : 'Paused'}
          </span>
        </div>
      )}

      <div className="flex-1" />

      {/* User + sign out */}
      <span className="text-xs text-gray-500 hidden sm:block">{user?.email}</span>
      <button
        onClick={onSignOut}
        className="text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-900/20"
      >
        Sign Out
      </button>
    </header>
  )
}
