/**
 * AudienceVoteButtons.jsx — shown on the player screen so every device can vote.
 * Appears when phase === 'question' and the audience lifeline has NOT been used yet.
 * Once a device votes, its choice is highlighted and voting is locked for that question.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useAudienceVote }         from '../../hooks/useAudienceVote.js'

const OPTION_COLORS = {
  A: { base: 'border-blue-600/50 bg-blue-900/20 hover:bg-blue-800/40 text-blue-300',   voted: 'border-blue-400 bg-blue-700/60 text-white ring-2 ring-blue-400/50' },
  B: { base: 'border-yellow-600/50 bg-yellow-900/20 hover:bg-yellow-800/40 text-yellow-300', voted: 'border-yellow-400 bg-yellow-700/60 text-white ring-2 ring-yellow-400/50' },
  C: { base: 'border-green-600/50 bg-green-900/20 hover:bg-green-800/40 text-green-300',  voted: 'border-green-400 bg-green-700/60 text-white ring-2 ring-green-400/50' },
  D: { base: 'border-red-600/50 bg-red-900/20 hover:bg-red-800/40 text-red-300',    voted: 'border-red-400 bg-red-700/60 text-white ring-2 ring-red-400/50' },
}

export default function AudienceVoteButtons({ questionId, uid }) {
  const { myVote, voteCounts, totalVotes, castVote, hasVoted } = useAudienceVote(questionId, uid)

  if (!questionId) return null

  return (
    <AnimatePresence>
      <motion.div
        className="w-full mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-center text-xs text-gray-500 uppercase tracking-widest mb-3">
          {hasVoted ? `✅ आपने vote किया — कुल ${totalVotes} वोट` : '📊 अपना उत्तर चुनें (Audience Vote)'}
        </p>

        <div className="grid grid-cols-4 gap-2">
          {['A', 'B', 'C', 'D'].map(opt => {
            const isMyVote = myVote === opt
            const colors   = isMyVote ? OPTION_COLORS[opt].voted : OPTION_COLORS[opt].base
            const count    = voteCounts[opt] ?? 0
            const pct      = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : null

            return (
              <motion.button
                key={opt}
                onClick={() => castVote(opt)}
                disabled={hasVoted}
                whileTap={{ scale: hasVoted ? 1 : 0.95 }}
                className={`relative flex flex-col items-center justify-center gap-1 py-3 px-2
                            rounded-xl border text-sm font-bold transition-all
                            disabled:cursor-default ${colors}`}
              >
                <span className="text-lg">{opt}</span>
                {hasVoted && (
                  <span className="text-[10px] font-normal opacity-80">
                    {pct !== null ? `${pct}%` : '—'}
                  </span>
                )}
                {isMyVote && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gold-500 text-navy-950
                                   text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    ✓
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
