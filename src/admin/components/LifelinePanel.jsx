/**
 * LifelinePanel.jsx — Admin lifeline controls.
 * 3 lifelines:
 *   1. Ask the Audience — 2-phase:
 *        Phase 1: "Start Poll" → opens 30-s voting popup on all audience screens
 *        Phase 2: "Collect & Show Results" → gathers votes, shows bar chart
 *   2. Change the Question — opens ChangeQModal
 *   3. Ask the Expert — admin types expert message, shown on player screen
 */

import { useState, useEffect, useRef } from 'react'
import { ref, onValue }                 from 'firebase/database'
import { db }                           from '../../firebase/config.js'
import {
  triggerAskAudience, hideAudiencePoll,
  startAudiencePoll, stopAudiencePoll,
  triggerAskExpert, hideExpertOverlay,
} from '../../firebase/gameState.js'
import { collectVotePercentages } from '../../hooks/useAudienceVote.js'
import ChangeQModal from './ChangeQModal.jsx'

const BTN = 'px-3 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 disabled:opacity-40'
const POLL_DURATION = 30   // seconds — must match AudiencePollModal

export default function LifelinePanel({ gameState }) {
  const {
    lifelineAskAudienceUsed, lifelineChangeQUsed, lifelineAskExpertUsed,
    showAudiencePoll, showExpertOverlay,
    audiencePollActive, pollStartedAt,
    phase, currentLevel,
    questionId: currentQuestionId,
  } = gameState

  const [collecting,    setCollecting]    = useState(false)
  const [expertMsg,     setExpertMsg]     = useState('')
  const [showChangeQ,   setShowChangeQ]   = useState(false)
  const [pollSecsLeft,  setPollSecsLeft]  = useState(0)
  const [liveVoteCount, setLiveVoteCount] = useState(0)
  // Admin-only local results — shown in panel without pushing to audience screen
  const [localResults,  setLocalResults]  = useState(null)   // { A, B, C, D } or null
  const [viewingLocal,  setViewingLocal]  = useState(false)  // loading state
  // Ref to handleCollectAndShow so the countdown useEffect can call it
  // without a stale closure (functions defined below use current state).
  const collectRef = useRef(null)

  const isQuestion = phase === 'question'

  // ── Countdown display + auto-collect when timer hits 0 ────────────────────
  useEffect(() => {
    if (!audiencePollActive || !pollStartedAt) { setPollSecsLeft(0); return }
    const tick = () => {
      const left = Math.max(0, POLL_DURATION - Math.floor((Date.now() - pollStartedAt) / 1000))
      setPollSecsLeft(left)
      if (left === 0) {
        clearInterval(id)
        // Auto-collect: call through ref so we always get the latest function
        if (collectRef.current) collectRef.current()
      }
    }
    const id = setInterval(tick, 500)
    tick()   // fire immediately so UI shows correct value straight away
    return () => clearInterval(id)
  }, [audiencePollActive, pollStartedAt])

  // ── Live vote count during active poll ────────────────────────────────────
  useEffect(() => {
    if (!audiencePollActive || !currentQuestionId) { setLiveVoteCount(0); return }
    const votesRef = ref(db, `audienceVotes/${currentQuestionId}`)
    const unsub = onValue(votesRef, (snap) => {
      setLiveVoteCount(snap.exists() ? Object.keys(snap.val()).length : 0)
    })
    return () => unsub()
  }, [audiencePollActive, currentQuestionId])

  // Phase 1: open the voting window on all audience screens
  async function handleStartPoll() {
    setLocalResults(null)   // clear any previous local preview
    await startAudiencePoll()
  }

  // Admin-only: collect votes and show in admin panel ONLY (no audience screen change)
  async function handleViewLocalResults() {
    if (viewingLocal) return
    setViewingLocal(true)
    try {
      const p = await collectVotePercentages(currentQuestionId)
      setLocalResults(p)
    } finally {
      setViewingLocal(false)
    }
  }

  // Phase 2: close the window, collect votes, push results to ALL screens
  async function handleCollectAndShow() {
    if (collecting) return   // prevent double-fire from auto + manual click
    setCollecting(true)
    try {
      const p = await collectVotePercentages(currentQuestionId)
      setLocalResults(p)   // show locally immediately
      // Single atomic write: stop poll + mark used + show results all at once
      await triggerAskAudience(p.A, p.B, p.C, p.D)
    } finally {
      setCollecting(false)
    }
  }
  // Keep ref in sync so the countdown useEffect can invoke latest version
  collectRef.current = handleCollectAndShow

  async function handleExpert() {
    if (!expertMsg.trim()) return
    await triggerAskExpert(expertMsg.trim())
  }

  return (
    <div className="bg-navy-800/60 border border-white/5 rounded-xl p-4 space-y-4">
      <h3 className="text-xs uppercase tracking-widest text-gray-500">Lifelines</h3>

      {/* ── 1. Ask the Audience ── */}
      <div className={`rounded-lg border p-3 space-y-2
        ${lifelineAskAudienceUsed && !audiencePollActive && !showAudiencePoll
          ? 'border-white/5 opacity-50'
          : 'border-blue-800/40 bg-blue-900/10'}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-blue-300">📊 Ask the Audience</span>
          {lifelineAskAudienceUsed && !audiencePollActive && !showAudiencePoll &&
            <span className="text-[10px] text-gray-500 uppercase">Used</span>}
        </div>

        {/* Phase 0: poll not started yet, lifeline available */}
        {!lifelineAskAudienceUsed && !audiencePollActive && !showAudiencePoll && (
          <div className="space-y-2">
            <p className="text-[11px] text-gray-500">
              Audience screens पर 30-second voting popup खुलेगा। वोट collect होने के बाद results दिखाएँ।
            </p>
            <button
              onClick={handleStartPoll}
              disabled={!isQuestion}
              className={`${BTN} w-full bg-blue-700 hover:bg-blue-600 text-white`}
            >
              📊 Poll शुरू करें (30 sec)
            </button>
          </div>
        )}

        {/* Phase 1 active: countdown + live count + collect button */}
        {audiencePollActive && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400">
                ⏳ Voting चल रहा है…
                <span className="ml-2 text-blue-400 font-semibold">🗳️ {liveVoteCount} votes</span>
              </span>
              <span className={`text-sm font-bold tabular-nums ${pollSecsLeft <= 8 ? 'text-red-400' : pollSecsLeft <= 15 ? 'text-yellow-400' : 'text-green-400'}`}>
                {pollSecsLeft}s
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-navy-900 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${pollSecsLeft <= 8 ? 'bg-red-500' : pollSecsLeft <= 15 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${(pollSecsLeft / POLL_DURATION) * 100}%`, transition: 'width 0.5s linear' }}
              />
            </div>

            {/* Admin-only local preview — does NOT push to audience */}
            {localResults && !showAudiencePoll && (
              <div className="space-y-1 pt-1 border-t border-white/5">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Admin Preview (not shown to audience)</p>
                {[
                  { lbl: 'A', color: 'bg-blue-500'   },
                  { lbl: 'B', color: 'bg-yellow-500' },
                  { lbl: 'C', color: 'bg-green-500'  },
                  { lbl: 'D', color: 'bg-red-500'    },
                ].map(({ lbl, color }) => (
                  <div key={lbl} className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-400 w-4">{lbl}</span>
                    <div className="flex-1 bg-navy-900 rounded-full h-2.5 overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${localResults[lbl] ?? 0}%` }} />
                    </div>
                    <span className="text-[11px] text-gray-300 tabular-nums w-8 text-right">{localResults[lbl] ?? 0}%</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              {/* Admin-only peek — no audience effect */}
              {!localResults && (
                <button
                  onClick={handleViewLocalResults}
                  disabled={viewingLocal || liveVoteCount === 0}
                  className={`${BTN} bg-indigo-800 hover:bg-indigo-700 text-white`}
                  title="Admin को results दिखाएँ, audience screen पर नहीं"
                >
                  {viewingLocal ? '⏳' : '👁 Preview'}
                </button>
              )}
              <button
                onClick={handleCollectAndShow}
                disabled={collecting}
                className={`${BTN} flex-1 bg-blue-700 hover:bg-blue-600 text-white`}
              >
                {collecting ? '⏳ Collecting…' : '✅ Collect & Show (All)'}
              </button>
              <button
                onClick={stopAudiencePoll}
                disabled={collecting}
                className={`${BTN} bg-gray-700 hover:bg-gray-600 text-white`}
              >
                रद्द
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: results pushed to all screens (showAudiencePoll === true in Firebase) */}
        {showAudiencePoll && (
          <div className="space-y-2">
            {[
              { lbl: 'A', pct: gameState.audiencePollA, color: 'bg-blue-500'   },
              { lbl: 'B', pct: gameState.audiencePollB, color: 'bg-yellow-500' },
              { lbl: 'C', pct: gameState.audiencePollC, color: 'bg-green-500'  },
              { lbl: 'D', pct: gameState.audiencePollD, color: 'bg-red-500'    },
            ].map(({ lbl, pct, color }) => (
              <div key={lbl} className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gray-400 w-4">{lbl}</span>
                <div className="flex-1 bg-navy-900 rounded-full h-3 overflow-hidden">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${pct ?? 0}%` }} />
                </div>
                <span className="text-[11px] text-gray-300 tabular-nums w-8 text-right">{pct ?? 0}%</span>
              </div>
            ))}
            <button
              onClick={hideAudiencePoll}
              className={`${BTN} w-full bg-gray-700 hover:bg-gray-600 text-white mt-1`}
            >
              Hide Results (All Screens)
            </button>
          </div>
        )}

        {/* Poll used + no active state: show "View Results" button to re-read from Firebase */}
        {lifelineAskAudienceUsed && !audiencePollActive && !showAudiencePoll && (
          <div className="space-y-2">
            {localResults ? (
              <>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Results (Admin Only)</p>
                {[
                  { lbl: 'A', color: 'bg-blue-500'   },
                  { lbl: 'B', color: 'bg-yellow-500' },
                  { lbl: 'C', color: 'bg-green-500'  },
                  { lbl: 'D', color: 'bg-red-500'    },
                ].map(({ lbl, color }) => (
                  <div key={lbl} className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-400 w-4">{lbl}</span>
                    <div className="flex-1 bg-navy-900 rounded-full h-2.5 overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${localResults[lbl] ?? 0}%` }} />
                    </div>
                    <span className="text-[11px] text-gray-300 tabular-nums w-8 text-right">{localResults[lbl] ?? 0}%</span>
                  </div>
                ))}
                <div className="flex gap-2">
                  <button
                    onClick={handleViewLocalResults}
                    disabled={viewingLocal}
                    className={`${BTN} flex-1 bg-indigo-800 hover:bg-indigo-700 text-white`}
                  >
                    🔄 Refresh
                  </button>
                  <button
                    onClick={async () => { const p = localResults; await triggerAskAudience(p.A, p.B, p.C, p.D) }}
                    className={`${BTN} flex-1 bg-blue-700 hover:bg-blue-600 text-white`}
                  >
                    📺 Show to Audience
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={handleViewLocalResults}
                disabled={viewingLocal}
                className={`${BTN} w-full bg-indigo-800 hover:bg-indigo-700 text-white`}
              >
                {viewingLocal ? '⏳ Loading…' : '📊 View Results'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── 2. Change the Question ── */}
      <div className={`rounded-lg border p-3
        ${lifelineChangeQUsed ? 'border-white/5 opacity-50' : 'border-yellow-800/40 bg-yellow-900/10'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-yellow-300">🔄 Change the Question</span>
          {lifelineChangeQUsed && <span className="text-[10px] text-gray-500 uppercase">Used</span>}
        </div>
        {!lifelineChangeQUsed && (
          <button
            onClick={() => setShowChangeQ(true)}
            disabled={!isQuestion}
            className={`${BTN} w-full bg-yellow-700 hover:bg-yellow-600 text-white`}
          >
            प्रश्न बदलें
          </button>
        )}
      </div>

      {/* ── 3. Ask the Expert ── */}
      <div className={`rounded-lg border p-3 space-y-2
        ${lifelineAskExpertUsed ? 'border-white/5 opacity-50' : 'border-green-800/40 bg-green-900/10'}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-green-300">🧑‍🏫 Ask the Expert</span>
          {lifelineAskExpertUsed && <span className="text-[10px] text-gray-500 uppercase">Used</span>}
        </div>

        {!lifelineAskExpertUsed && (
          <>
            <textarea
              value={expertMsg}
              onChange={e => setExpertMsg(e.target.value)}
              disabled={!isQuestion}
              placeholder="विशेषज्ञ का सुझाव लिखें…"
              rows={3}
              className="w-full bg-navy-900 border border-white/10 rounded-lg px-2 py-1.5
                         text-xs text-white placeholder-gray-600 font-devanagari
                         focus:outline-none focus:border-green-400 resize-none disabled:opacity-30"
            />
            <div className="flex gap-2">
              <button
                onClick={handleExpert}
                disabled={!isQuestion || !expertMsg.trim()}
                className={`${BTN} flex-1 bg-green-700 hover:bg-green-600 text-white`}
              >
                📡 Show Expert
              </button>
              {showExpertOverlay && (
                <button
                  onClick={hideExpertOverlay}
                  className={`${BTN} bg-gray-700 hover:bg-gray-600 text-white`}
                >
                  Hide
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Change Question Modal */}
      {showChangeQ && (
        <ChangeQModal
          level={currentLevel}
          onClose={() => setShowChangeQ(false)}
        />
      )}
    </div>
  )
}
