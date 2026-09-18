import { PRIZE_LADDER } from '../../data/prizeLadder.js'

export default function PrizeLadder({ currentLevel, safeHavenLevel }) {
  return (
    <div className="w-full h-full bg-navy-900/60 border-r border-white/5 flex flex-col justify-center px-4 py-6">
      <h3 className="text-[10px] uppercase tracking-widest text-gray-600 text-center mb-4 font-sans">
        स्तर सीढ़ी
      </h3>

      <div className="flex flex-col-reverse gap-1.5">
        {PRIZE_LADDER.map(row => {
          const isActive = row.level === currentLevel
          const isDone   = row.level < currentLevel
          const isSafe   = row.safeHaven
          const isGrand  = row.level === 7

          return (
            <div
              key={row.level}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300
                ${isActive
                  ? 'bg-gold-500/20 border border-gold-500/50'
                  : isDone
                    ? 'bg-green-900/20 border border-green-900/30'
                    : isGrand
                      ? 'bg-navy-800/40 border border-gold-800/20'
                      : 'border border-transparent'}`}
            >
              {/* Level number */}
              <span className={`text-xs font-mono w-4 shrink-0
                ${isActive ? 'text-gold-300 font-bold' : isDone ? 'text-green-600' : 'text-gray-600'}`}>
                {row.level}
              </span>

              {/* Safe haven shield */}
              {isSafe && <span className="text-[10px] shrink-0">🛡</span>}

              {/* Title */}
              <span className={`flex-1 text-xs font-devanagari
                ${isActive ? 'text-gold-300 font-bold' : isDone ? 'text-green-600' : isGrand ? 'text-gold-500' : 'text-gray-500'}`}>
                {row.title}
              </span>

              {/* Indicator */}
              {isActive && <span className="text-gold-400 text-xs shrink-0">◀</span>}
              {isDone    && <span className="text-green-600 text-xs shrink-0">✓</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
