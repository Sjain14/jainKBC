/**
 * AudiencePollModal.jsx — Popup shown on audience screens during the active
 * 30-second voting window triggered by the admin's "Ask the Audience" lifeline.
 *
 * - Shows a 30-second countdown derived from pollStartedAt (server epoch ms)
 * - Lets each device vote once via useAudienceVote
 * - Locks when time is up or after voting
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAudienceVote } from '../../hooks/useAudienceVote.js'

const POLL_DURATION = 30   // seconds

const OPTION_COLORS = {
  A: {
    base:  'border-blue-500/60 bg-blue-900/30 hover:bg-blue-800/50 text-blue-200',
    voted: 'border-blue-400 bg-blue-600/70 text-white ring-2 ring-blue-300/60',
    locked:'border-blue-500/30 bg-blue-900/15 text-blue-400/60',
  },
  B: {
    base:  'border-yellow-500/60 bg-yellow-900/30 hover:bg-yellow-800/50 text-yellow-200',
    voted: 'border-yellow-400 bg-yellow-600/70 text-white ring-2 ring-yellow-300/60',
    locked:'border-yellow-500/30 bg-yellow-900/15 text-yellow-400/60',
  },
  C: {
    base:  'border-green-500/60 bg-green-900/30 hover:bg-green-800/50 text-green-200',
    voted: 'border-green-400 bg-green-600/70 text-white ring-2 ring-green-300/60',
    locked:'border-green-500/30 bg-green-900/15 text-green-400/60',
  },
  D: {
    base:  'border-red-500/60 bg-red-900/30 hover:bg-red-800/50 text-red-200',
    voted: 'border-red-400 bg-red-600/70 text-white ring-2 ring-red-300/60',
    locked:'border-red-500/30 bg-red-900/15 text-red-400/60',
  },
}

export default function AudiencePollModal({ questionId, pollStartedAt, optionA, optionB, optionC, optionD }) {
  const { myVote, voteCounts, totalVotes, castVote, hasVoted } = useAudienceVote(questionId)

  // ── Countdown ──────────────────────────────────────────────────────────────
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, POLL_DURATION - Math.floor((Date.now() - pollStartedAt) / 1000))
  )

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - pollStartedAt) / 1000)
      setSecondsLeft(Math.max(0, POLL_DURATION - elapsed))
    }, 500)
    return () => clearInterval(id)
  }, [pollStartedAt])

  const timeUp   = secondsLeft <= 0
  const canVote  = !hasVoted && !timeUp
  const options  = { A: optionA, B: optionB, C: optionC, D: optionD }

  // ── Timer ring colour ──────────────────────────────────────────────────────
  const timerPct    = (secondsLeft / POLL_DURATION) * 100
  const timerColor  = secondsLeft > 15 ? '#22c55e' : secondsLeft > 8 ? '#f59e0b' : '#ef4444'

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-sm bg-navy-900 border border-blue-700/50 rounded-2xl p-5 shadow-2xl"
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ type: 'spring', bounce: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-blue-300 font-bold text-base font-devanagari">
            📊 दर्शक सहायता — Vote करें!
          </h3>

          {/* Countdown ring */}
          <div className="relative w-12 h-12 shrink-0">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={timerColor}
                strokeWidth="3"
                strokeDasharray={`${timerPct} 100`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.5s linear, stroke 0.5s' }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
              {secondsLeft}
            </span>
          </div>
        </div>

        {/* Status text */}
        <p className="text-center text-xs text-gray-400 mb-4 font-devanagari">
          {timeUp
            ? '⏰ समय समाप्त!'
            : hasVoted
              ? `✅ आपने "${myVote}" को vote किया — कुल ${totalVotes} वोट`
              : 'नीचे अपना जवाब चुनें और submit करें'}
        </p>

        {/* Vote buttons */}
        <div className="grid grid-cols-2 gap-3">
          {['A', 'B', 'C', 'D'].map(opt => {
            const isMyVote = myVote === opt
            const colKey   = isMyVote ? 'voted' : canVote ? 'base' : 'locked'
            const colors   = OPTION_COLORS[opt][colKey]
            const pct      = totalVotes > 0 ? Math.round(((voteCounts[opt] ?? 0) / totalVotes) * 100) : null

            return (
              <motion.button
                key={opt}
                onClick={() => canVote && castVote(opt)}
                disabled={!canVote}
                whileTap={{ scale: canVote ? 0.95 : 1 }}
                className={`relative flex flex-col items-start gap-1 p-3 rounded-xl border
                            text-sm font-semibold transition-all disabled:cursor-default ${colors}`}
              >
                <span className="text-xs text-gray-400 font-normal leading-none">{opt}</span>
                <span className="font-devanagari text-[13px] leading-snug line-clamp-2">
                  {options[opt]}
                </span>
                {(hasVoted || timeUp) && pct !== null && (
                  <span className="text-[10px] font-normal opacity-70 mt-0.5">{pct}%</span>
                )}
                {isMyVote && (
                  <span className="absolute top-1.5 right-1.5 bg-gold-500 text-navy-950
                                   text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    ✓
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
