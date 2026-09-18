/**
 * QuestionScreen.jsx — Main game screen shown during 'question' and 'result' phases.
 * Layout (mobile-first):
 *   Mobile:  Stack — Prize Ladder (horizontal strip) → Question → Options → Timer/Lifelines
 *   Desktop: Prize Ladder sidebar left + main content right
 */

import { motion } from 'framer-motion'
import QuestionBox   from '../components/QuestionBox.jsx'
import OptionButton  from '../components/OptionButton.jsx'
import PrizeLadder   from '../components/PrizeLadder.jsx'
import LifelineBar   from '../components/LifelineBar.jsx'
import TimerDisplay  from '../components/TimerDisplay.jsx'
import AudiencePoll  from '../components/AudiencePoll.jsx'
import ExpertOverlay from '../components/ExpertOverlay.jsx'
import PausedOverlay from '../components/PausedOverlay.jsx'

const OPTION_LABELS = ['A', 'B', 'C', 'D']

export default function QuestionScreen({ gameState, soundManager }) {
  const {
    questionText, optionA, optionB, optionC, optionD,
    selectedOption, correctOption, showCorrectAnswer,
    currentLevel, currentLevelTitle, contestantName,
    timerEnabled,
    lifelineAskAudienceUsed, lifelineChangeQUsed, lifelineAskExpertUsed,
    showAudiencePoll, showExpertOverlay, expertMessage,
    gamePaused,
    audiencePollA, audiencePollB, audiencePollC, audiencePollD,
  } = gameState

  const options = [optionA, optionB, optionC, optionD]

  function getOptionState(label) {
    if (showCorrectAnswer) {
      if (label === correctOption) return 'correct'
      if (label === selectedOption && label !== correctOption) return 'wrong'
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

        {/* ─ Top bar: contestant name + level ─ */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="text-xs text-gray-500 uppercase tracking-widest font-sans">
            Level <span className="text-gold-400 font-bold text-sm">{currentLevel}</span>
          </div>
          {contestantName && (
            <div className="text-gold-300 font-devanagari text-sm font-semibold">
              {contestantName}
            </div>
          )}
          <div className="text-gold-400 font-bold text-sm font-devanagari">{currentLevelTitle}</div>
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

        {/* ─ Lifeline bar ─ */}
        <div className="mt-6 w-full">
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
