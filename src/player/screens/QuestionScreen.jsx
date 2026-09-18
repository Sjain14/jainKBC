/**
 * QuestionScreen.jsx — Main game screen shown during 'question' and 'result' phases.
 * Layout (mobile-first):
 *   Mobile:  Stack — Prize Ladder (horizontal strip) → Question → Options → Timer/Lifelines
 *   Desktop: Prize Ladder sidebar left + main content right
 */

import { useState } from 'react'
import QuestionBox          from '../components/QuestionBox.jsx'
import OptionButton         from '../components/OptionButton.jsx'
import PrizeLadder          from '../components/PrizeLadder.jsx'
import LifelineBar          from '../components/LifelineBar.jsx'
import TimerDisplay         from '../components/TimerDisplay.jsx'
import AudiencePoll         from '../components/AudiencePoll.jsx'
import AudienceVoteButtons  from '../components/AudienceVoteButtons.jsx'
import ExpertOverlay        from '../components/ExpertOverlay.jsx'
import PausedOverlay        from '../components/PausedOverlay.jsx'
import ShareModal           from '../components/ShareModal.jsx'

const OPTION_LABELS = ['A', 'B', 'C', 'D']

export default function QuestionScreen({ gameState, soundManager }) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const {
    questionText, optionA, optionB, optionC, optionD,
    selectedOption, correctOption, showCorrectAnswer,
    currentLevel, currentLevelTitle, contestantName,
    questionId, timerEnabled,
    lifelineAskAudienceUsed, lifelineChangeQUsed, lifelineAskExpertUsed,
    showAudiencePoll, showExpertOverlay, expertMessage,
    gamePaused,
    audiencePollA, audiencePollB, audiencePollC, audiencePollD,
  } = gameState

  const options = [optionA, optionB, optionC, optionD]

  function getOptionState(label) {
    if (showCorrectAnswer) {
      if (label === correctOption) return 'correct'
      if (label === selectedOption) return 'wrong'
      return 'idle'
    }
    if (label === selectedOption) return 'selected'
    return 'idle'
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── PRIZE LADDER (Desktop: left sidebar | Mobile: hidden, show mini strip) ── */}
      <div className="hidden lg:flex lg:w-64 xl:w-72 shrink-0">
        <PrizeLadder currentLevel={currentLevel} safeHavenLevel={gameState.safeHavenLevel} />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col items-center justify-between px-4 sm:px-8 py-6 max-w-3xl mx-auto w-full">

        {/* ─ Top bar: logo + contestant name + level + share button ─ */}
        <div className="w-full flex items-center justify-between gap-2 mb-3 px-1 py-1">
          <div className="flex items-center gap-2">
            <img
              src="/jainKBC_logo.png"
              alt="Jain KBC"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow"
            />
            <div className="text-left">
              <div className="text-[11px] text-gray-400 uppercase tracking-wider font-sans leading-none">
                Level <span className="text-gold-400 font-bold text-xs sm:text-sm">{currentLevel}</span>
              </div>
              <div className="text-gold-400 font-bold text-xs sm:text-sm font-devanagari leading-tight">
                {currentLevelTitle}
              </div>
            </div>
          </div>

          {contestantName && (
            <div className="text-gold-300 font-devanagari text-xs sm:text-sm font-semibold truncate max-w-[120px] sm:max-w-[180px]">
              👤 {contestantName}
            </div>
          )}

          {/* Share/QR button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            title="शेयर करें / QR कोड"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 text-gold-400 hover:text-gold-300 text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="hidden sm:inline">QR / Share</span>
          </button>
        </div>

        {/* ─ Mobile prize strip ─ */}
        <div className="lg:hidden w-full mb-4">
          <MobilePrizeStrip currentLevel={currentLevel} />
        </div>

        {/* ─ Timer ─ */}
        {timerEnabled && (
          <div className="mb-4">
            <TimerDisplay gameState={gameState} soundManager={soundManager} />
          </div>
        )}

        {/* ─ Question box ─ */}
        <QuestionBox text={questionText} level={currentLevel} />

        {/* ─ Options grid ─ */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          {options.map((opt, i) => (
            <OptionButton
              key={OPTION_LABELS[i]}
              label={OPTION_LABELS[i]}
              text={opt}
              state={getOptionState(OPTION_LABELS[i])}
            />
          ))}
        </div>

        {/* ─ Audience vote buttons (only during active question, before lifeline used) ─ */}
        {gameState.phase === 'question' && !lifelineAskAudienceUsed && !showCorrectAnswer && (
          <AudienceVoteButtons questionId={questionId} />
        )}

        {/* ─ Lifeline bar ─ */}
        <div className="mt-4 w-full">
          <LifelineBar
            audienceUsed={lifelineAskAudienceUsed}
            changeQUsed={lifelineChangeQUsed}
            expertUsed={lifelineAskExpertUsed}
          />
        </div>
      </div>

      {/* ── Audience Poll Overlay ── */}
      {showAudiencePoll && (
        <AudiencePoll
          pollA={audiencePollA} pollB={audiencePollB}
          pollC={audiencePollC} pollD={audiencePollD}
        />
      )}

      {/* ── Expert Overlay ── */}
      {showExpertOverlay && (
        <ExpertOverlay message={expertMessage} />
      )}

      {/* ── Paused Overlay ── */}
      {gamePaused && <PausedOverlay />}

      {/* ── Share / QR Modal ── */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  )
}

// Small mobile prize strip showing levels as dots
function MobilePrizeStrip({ currentLevel }) {
  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap">
      {Array.from({ length: 7 }, (_, i) => i + 1).map(lvl => (
        <div
          key={lvl}
          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
            ${lvl === currentLevel
              ? 'bg-gold-500 text-navy-950 ring-2 ring-gold-300'
              : lvl < currentLevel
                ? 'bg-green-700/60 text-green-300'
                : 'bg-navy-700/60 text-gray-500'}`}
        >
          {lvl}
        </div>
      ))}
    </div>
  )
}
