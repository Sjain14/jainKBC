/**
 * LifelinePanel.jsx — Admin lifeline controls.
 * 3 lifelines:
 *   1. Ask the Audience — admin enters simulated poll %, writes to Firebase
 *   2. Change the Question — opens ChangeQModal
 *   3. Ask the Expert — admin types expert message, shown on player screen
 */

import { useState } from 'react'
import {
  triggerAskAudience, hideAudiencePoll,
  triggerAskExpert, hideExpertOverlay,
} from '../../firebase/gameState.js'
import { collectVotePercentages } from '../../hooks/useAudienceVote.js'
import ChangeQModal from './ChangeQModal.jsx'

const BTN = 'px-3 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 disabled:opacity-40'

export default function LifelinePanel({ gameState }) {
  const {
    lifelineAskAudienceUsed, lifelineChangeQUsed, lifelineAskExpertUsed,
    showAudiencePoll, showExpertOverlay,
    phase, currentLevel,
    questionId: currentQuestionId,
  } = gameState

  const [collecting,  setCollecting]  = useState(false)
  const [expertMsg,   setExpertMsg]   = useState('')
  const [showChangeQ, setShowChangeQ] = useState(false)

  const isQuestion = phase === 'question'

  async function handleAskAudience() {
    setCollecting(true)
    try {
      const p = await collectVotePercentages(currentQuestionId)
      await triggerAskAudience(p.A, p.B, p.C, p.D)
    } finally {
      setCollecting(false)
    }
  }

  async function handleExpert() {
    if (!expertMsg.trim()) return
    await triggerAskExpert(expertMsg.trim())
  }

  return (
    <div className="bg-navy-800/60 border border-white/5 rounded-xl p-4 space-y-4">
      <h3 className="text-xs uppercase tracking-widest text-gray-500">Lifelines</h3>

      {/* ── 1. Ask the Audience ── */}
      <div className={`rounded-lg border p-3 space-y-2
        ${lifelineAskAudienceUsed ? 'border-white/5 opacity-50' : 'border-blue-800/40 bg-blue-900/10'}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-blue-300">📊 Ask the Audience</span>
          {lifelineAskAudienceUsed && <span className="text-[10px] text-gray-500 uppercase">Used</span>}
        </div>

        {!lifelineAskAudienceUsed && (
          <div className="space-y-2">
            <p className="text-[11px] text-gray-500">
              Player screens पर सभी वोट collect होते हैं। नीचे button दबाने पर real votes से poll दिखेगा।
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleAskAudience}
                disabled={!isQuestion || collecting}
                className={`${BTN} flex-1 bg-blue-700 hover:bg-blue-600 text-white`}
              >
                {collecting ? '⏳ Collecting…' : '📊 Collect & Show Poll'}
              </button>
              {showAudiencePoll && (
                <button
                  onClick={hideAudiencePoll}
                  className={`${BTN} bg-gray-700 hover:bg-gray-600 text-white`}
                >
                  Hide
                </button>
              )}
            </div>
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
