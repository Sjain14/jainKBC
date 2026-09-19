/**
 * AudiencePollModal.jsx — Full-lifecycle audience poll popup.
 *
 * Three phases, all in one component:
 *   Phase A (voting open):  Select option → Submit button activates → submit writes to Firebase
 *   Phase B (voted/expired): Confirmation shown, timer still visible
 *   Phase C (results):      Animated percentage bars when showAudiencePoll === true
 *
 * Mounted/unmounted by QuestionScreen based on: audiencePollActive || showAudiencePoll
 */

import { useEffect, useState } from 'react'
import { motion }              from 'framer-motion'
import { useAudienceVote }     from '../../hooks/useAudienceVote.js'

const POLL_DURATION = 30   // seconds

const BAR_COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444']

const OPTION_COLORS = {
  A: {
    idle:    'border-blue-500/50   bg-blue-900/25   text-blue-200   hover:bg-blue-800/40',
    pending: 'border-blue-400      bg-blue-700/60   text-white      ring-2 ring-blue-300/70',
    voted:   'border-blue-500/30   bg-blue-900/15   text-blue-400/50',
  },
  B: {
    idle:    'border-yellow-500/50 bg-yellow-900/25 text-yellow-200 hover:bg-yellow-800/40',
    pending: 'border-yellow-400    bg-yellow-700/60 text-white      ring-2 ring-yellow-300/70',
    voted:   'border-yellow-500/30 bg-yellow-900/15 text-yellow-400/50',
  },
  C: {
    idle:    'border-green-500/50  bg-green-900/25  text-green-200  hover:bg-green-800/40',
    pending: 'border-green-400     bg-green-700/60  text-white      ring-2 ring-green-300/70',
    voted:   'border-green-500/30  bg-green-900/15  text-green-400/50',
  },
  D: {
    idle:    'border-red-500/50    bg-red-900/25    text-red-200    hover:bg-red-800/40',
    pending: 'border-red-400       bg-red-700/60    text-white      ring-2 ring-red-300/70',
    voted:   'border-red-500/30    bg-red-900/15    text-red-400/50',
  },
}

export default function AudiencePollModal({
  questionId,
  uid,
  pollStartedAt,
  optionA, optionB, optionC, optionD,
  showAudiencePoll,
  audiencePollA, audiencePollB, audiencePollC, audiencePollD,
}) {
  const {
    myVote, pendingVote, setPendingVote,
    submitVote, hasVoted, totalVotes, voteError,
  } = useAudienceVote(questionId, uid)

  const [secondsLeft,  setSecondsLeft]  = useState(() =>
    Math.max(0, POLL_DURATION - Math.floor((Date.now() - (pollStartedAt || Date.now())) / 1000))
  )
  const [submitting, setSubmitting] = useState(false)

  // ── Countdown (recomputed every 500ms from server epoch — no stale closure) ──
  useEffect(() => {
    if (!pollStartedAt) return
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - pollStartedAt) / 1000)
      const left    = Math.max(0, POLL_DURATION - elapsed)
      setSecondsLeft(left)
      if (left === 0) clearInterval(id)
    }, 500)
    return () => clearInterval(id)
  }, [pollStartedAt])

  const timeUp  = secondsLeft <= 0
  const canVote = !hasVoted && !timeUp && !!uid

  // ── Timer ring ──
  const timerPct   = (secondsLeft / POLL_DURATION) * 100
  const timerColor = secondsLeft > 15 ? '#22c55e' : secondsLeft > 8 ? '#f59e0b' : '#ef4444'

  // ── Handle submit ──
  async function handleSubmit() {
    if (!canVote || !pendingVote || submitting) return
    setSubmitting(true)
    await submitVote()
    setSubmitting(false)
  }

  const options    = { A: optionA, B: optionB, C: optionC, D: optionD }
  const pollValues = [audiencePollA, audiencePollB, audiencePollC, audiencePollD]
  const LABELS     = ['A', 'B', 'C', 'D']

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
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

        {/* ── Header: title + countdown ring ── */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-blue-300 font-bold text-base font-devanagari leading-tight">
            {showAudiencePoll ? '📊 दर्शक सहायता — परिणाम' : '📊 दर्शक सहायता — Vote करें!'}
          </h3>

          {/* Only show timer during voting phase */}
          {!showAudiencePoll && (
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
          )}
        </div>

        {/* ════════════════════════════════════════════════
            PHASE C — Results (showAudiencePoll === true)
            ════════════════════════════════════════════════ */}
        {showAudiencePoll && (
          <div className="space-y-3">
            <p className="text-center text-xs text-gray-400 font-devanagari mb-2">
              {totalVotes} दर्शकों ने vote किया
            </p>
            {LABELS.map((lbl, i) => (
              <div key={lbl} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-300 w-5 shrink-0">{lbl}</span>
                <div className="flex-1 bg-navy-800/60 rounded-full h-7 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full flex items-center justify-end pr-3"
                    style={{ backgroundColor: BAR_COLORS[i] + '99' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pollValues[i] ?? 0}%` }}
                    transition={{ duration: 0.9, delay: i * 0.12, ease: 'easeOut' }}
                  >
                    <span className="text-xs font-bold text-white">{pollValues[i] ?? 0}%</span>
                  </motion.div>
                </div>
              </div>
            ))}
            {/* Highlight the option this device voted for */}
            {myVote && (
              <p className="text-center text-[11px] text-gray-500 pt-1 font-devanagari">
                आपने <span className="text-gold-400 font-bold">{myVote}</span> को vote किया था
              </p>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════
            PHASE A / B — Voting window
            ════════════════════════════════════════════════ */}
        {!showAudiencePoll && (
          <>
            {/* Status text */}
            <p className="text-center text-xs text-gray-400 mb-4 font-devanagari">
              {timeUp
                ? '⏰ समय समाप्त! परिणाम आ रहे हैं…'
                : hasVoted
                  ? `✅ आपने "${myVote}" submit किया — ${totalVotes} total votes`
                  : pendingVote
                    ? `"${pendingVote}" चुना — नीचे Submit करें`
                    : 'नीचे अपना जवाब चुनें'}
            </p>

            {/* Auth not ready */}
            {!uid && (
              <div className="flex items-center justify-center py-4">
                <div className="w-5 h-5 border-2 border-blue-400/40 border-t-blue-400 rounded-full animate-spin" />
                <span className="text-xs text-gray-500 ml-3">connecting…</span>
              </div>
            )}

            {/* Option buttons (2×2 grid) */}
            {uid && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {LABELS.map(opt => {
                  const isChosen = pendingVote === opt
                  const isVoted  = myVote === opt
                  const colorKey = isVoted ? 'voted' : isChosen ? 'pending' : 'idle'
                  const locked   = hasVoted || timeUp || !uid

                  return (
                    <motion.button
                      key={opt}
                      onClick={() => !locked && setPendingVote(opt)}
                      disabled={locked}
                      whileTap={{ scale: locked ? 1 : 0.95 }}
                      className={`relative flex flex-col items-start gap-1 p-3 rounded-xl border
                                  text-sm font-semibold transition-all disabled:cursor-default
                                  ${OPTION_COLORS[opt][colorKey]}`}
                    >
                      <span className="text-xs text-gray-400 font-normal leading-none">{opt}</span>
                      <span className="font-devanagari text-[13px] leading-snug line-clamp-2">
                        {options[opt]}
                      </span>
                      {(isChosen || isVoted) && (
                        <span className="absolute top-1.5 right-1.5 bg-gold-500 text-navy-950
                                         text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                          {isVoted ? '✓ voted' : '●'}
                        </span>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            )}

            {/* Submit button / confirmation */}
            {uid && !hasVoted && !timeUp && (
              <button
                onClick={handleSubmit}
                disabled={!pendingVote || submitting}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-navy-700
                           disabled:text-gray-500 text-white font-bold text-sm transition-all
                           active:scale-95 disabled:cursor-not-allowed"
              >
                {submitting
                  ? <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submit हो रहा है…
                    </span>
                  : '✅ Submit करें'}
              </button>
            )}

            {/* Error feedback */}
            {voteError === 'permission_denied' && (
              <p className="text-center text-xs text-red-400 mt-2 font-devanagari">
                ❌ Vote submit नहीं हुआ — Firebase rules check करें (Anonymous Auth चालू है?)
              </p>
            )}
            {voteError === 'network_error' && (
              <p className="text-center text-xs text-yellow-400 mt-2 font-devanagari">
                ⚠️ Network error — फिर से try करें
              </p>
            )}
          </>
        )}

      </motion.div>
    </motion.div>
  )
}
