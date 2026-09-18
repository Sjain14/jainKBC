import { PRIZE_LADDER } from '../../data/prizeLadder.js'

export default function PrizeLadderMini({ gameState }) {
  const { currentLevel, safeHavenLevel } = gameState

  return (
    <div className="bg-navy-800/60 border border-white/5 rounded-xl p-3">
      <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3 font-sans">Prize Ladder</h3>

      <div className="flex flex-col-reverse gap-1">
        {PRIZE_LADDER.map(row => {
          const isActive = row.level === currentLevel
          const isDone   = row.level < currentLevel
          const isSafe   = row.level === safeHavenLevel
          const isGrand  = row.level === 7

          return (
            <div
              key={row.level}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all
                ${isActive  ? 'bg-gold-500/20 border border-gold-500/50 text-gold-300 font-bold' :
                  isDone    ? 'bg-green-900/20 text-green-600' :
                  isGrand   ? 'bg-navy-700/60 text-gold-400' :
                              'text-gray-500 hover:bg-white/5'}`}
            >
              <span className="font-mono w-4 shrink-0">{row.level}</span>
              <span className="font-devanagari flex-1 text-center text-[11px]">{row.title}</span>
              <span className="text-[10px] w-4 text-right">
                {isActive && '▶'}
                {isDone   && '✓'}
                {isSafe && !isActive && !isDone && '🛡'}
              </span>
            </div>
          )
        })}
      </div>

      {safeHavenLevel > 0 && (
        <div className="mt-3 text-[10px] text-green-500 bg-green-900/20 rounded px-2 py-1 text-center font-devanagari">
          🛡 Safe Haven: {PRIZE_LADDER.find(r => r.level === safeHavenLevel)?.title}
        </div>
      )}
    </div>
  )
}
