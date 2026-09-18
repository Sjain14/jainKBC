/**
 * GameControls.jsx — All game flow buttons in the admin center column.
 * Handles: Start Game, Load Question, Select Options, Reveal, Next Level,
 *          Game Over, Quit, Winner, Reset.
 */

import { useState } from 'react'
import {
  resetGameState, setContestantName, loadQuestion, selectOption,
  revealAnswer, advanceToResult, declareWinner, gameOver, quitGame,
  saveGameResult, setSelectedSet,
} from '../../firebase/gameState.js'
import { getRemainingSeconds } from '../../hooks/useTimer.js'
import { pauseTimer, resumeTimer } from '../../firebase/gameState.js'
import { getPrimaryQuestion, markQuestionUsed } from '../../firebase/questions.js'
import { PRIZE_LADDER } from '../../data/prizeLadder.js'
const BTN = 'px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed'
const OPTION_LABELS = ['A', 'B', 'C', 'D']

const SET_LABELS = {
  1: 'Set 1 — बच्चे (8-12 वर्ष)',
  2: 'Set 2 — किशोर (13-17 वर्ष)',
  3: 'Set 3 — युवा (18-25 वर्ष)',
  4: 'Set 4 — युवा (26-35 वर्ष)',
  5: 'Set 5 — प्रौढ़ (36-45 वर्ष)',
  6: 'Set 6 — प्रौढ़ (46-55 वर्ष)',
  7: 'Set 7 — वरिष्ठ (56-65 वर्ष)',
  8: 'Set 8 — वरिष्ठ (66+ वर्ष)',
}

export default function GameControls({ gameState }) {
  const [nameInput,    setNameInput]    = useState('')
  const [settingName,  setSettingName]  = useState(false)
  const [loadingQ,     setLoadingQ]     = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmGameOver, setConfirmGameOver] = useState(false)
  const [confirmQuit,  setConfirmQuit]  = useState(false)

  const { phase, currentLevel, selectedOption, showCorrectAnswer,
    timerEnabled, timerRunning, timerSeconds, correctOption } = gameState

  // ── Helpers ──────────────────────────────────────────────────────────────

  async function handleLoadQuestion(level = currentLevel || 1) {
    setLoadingQ(true)
    try {
      const q = await getPrimaryQuestion(level, gameState.selectedSet ?? 1)
      if (!q) { alert(`Level ${level} के लिए कोई प्रश्न नहीं मिला।`); return }
      const row = PRIZE_LADDER.find(r => r.level === level)
      await markQuestionUsed(level, q.id)
      await loadQuestion(level, q, row?.title ?? '')
    } catch (err) {
      console.error(err)
      alert('Question load failed: ' + err.message)
    } finally {
      setLoadingQ(false)
    }
  }

  async function handleSelectOption(opt) {
    await selectOption(opt)
  }

  async function handleReveal() {
    await revealAnswer()
  }

  async function handleNextLevel() {
    const nextLevel = currentLevel + 1
    if (nextLevel > 7) return
    const prevRow   = PRIZE_LADDER.find(r => r.level === currentLevel)
    const safeLevel = prevRow?.safeHaven ? currentLevel : gameState.safeHavenLevel
    const safeTitle = PRIZE_LADDER.find(r => r.level === safeLevel)?.title ?? gameState.safeHavenTitle
    await advanceToResult(safeLevel, safeTitle)
    await handleLoadQuestion(nextLevel)
  }

  async function handleWinner() {
    await declareWinner()
    await saveGameResult({ ...gameState, phase: 'winner' })
  }

  async function handleGameOver() {
    await gameOver()
    await saveGameResult(gameState)
    setConfirmGameOver(false)
  }

  async function handleQuit() {
    await quitGame()
    await saveGameResult({ ...gameState, phase: 'quit' })
    setConfirmQuit(false)
  }

  async function handleReset() {
    await resetGameState()
    setConfirmReset(false)
    setNameInput('')
  }

  function handleTimerToggle() {
    if (timerRunning) {
      pauseTimer(getRemainingSeconds(gameState))
    } else {
      resumeTimer(timerSeconds)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="bg-navy-800/60 border border-white/5 rounded-xl p-4 space-y-4">
      <h3 className="text-xs uppercase tracking-widest text-gray-500">Game Controls</h3>

      {/* ── IDLE: Start game ── */}
      {phase === 'idle' && (
        <div className="space-y-3">
          {/* Set selector */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block uppercase tracking-widest">प्रश्न सेट चुनें</label>
            <select
              value={gameState.selectedSet ?? 1}
              onChange={e => setSelectedSet(Number(e.target.value))}
              className="w-full bg-navy-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                         focus:outline-none focus:border-gold-500 font-devanagari"
            >
              {Object.entries(SET_LABELS).map(([num, label]) => (
                <option key={num} value={num}>{label}</option>
              ))}
            </select>
          </div>
          {/* Contestant name */}
          <div className="flex gap-2">
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="प्रतिभागी का नाम"
              className="flex-1 bg-navy-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                         placeholder-gray-600 focus:outline-none focus:border-gold-500 font-devanagari"
            />
            <button
              disabled={settingName || !nameInput.trim()}
              onClick={async () => {
                setSettingName(true)
                await setContestantName(nameInput.trim())
                setSettingName(false)
              }}
              className={`${BTN} bg-gold-600 hover:bg-gold-500 text-navy-950`}
            >{settingName ? '…' : 'Set'}</button>
          </div>
          <button
            onClick={() => handleLoadQuestion(1)}
            disabled={loadingQ}
            className={`${BTN} w-full bg-blue-700 hover:bg-blue-600 text-white`}
          >
            {loadingQ ? '⏳ लोड हो रहा है…' : `🎮 Set ${gameState.selectedSet ?? 1} — Level 1 शुरू करें`}
          </button>
        </div>
      )}

      {/* ── QUESTION: Option buttons + actions ── */}
      {phase === 'question' && (
        <div className="space-y-3">
          {/* Option selector */}
          <div>
            <p className="text-xs text-gray-500 mb-2">उत्तर चुनें (contestant का उत्तर lock करें):</p>
            <div className="grid grid-cols-4 gap-2">
              {OPTION_LABELS.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleSelectOption(opt)}
                  disabled={showCorrectAnswer}
                  className={`${BTN} text-base font-bold
                    ${selectedOption === opt
                      ? 'bg-yellow-500 text-navy-950 ring-2 ring-yellow-300'
                      : 'bg-navy-700 hover:bg-navy-600 text-white'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Timer toggle */}
          {timerEnabled && (
            <button
              onClick={handleTimerToggle}
              className={`${BTN} w-full ${timerRunning
                ? 'bg-yellow-700 hover:bg-yellow-600 text-white'
                : 'bg-green-800 hover:bg-green-700 text-white'}`}
            >
              {timerRunning ? '⏸ Timer Pause करें  [P]' : '▶ Timer Resume करें  [P]'}
            </button>
          )}

          {/* Reveal */}
          <button
            onClick={handleReveal}
            disabled={!selectedOption || showCorrectAnswer}
            className={`${BTN} w-full bg-purple-700 hover:bg-purple-600 text-white`}
          >
            🔍 उत्तर Reveal करें  [R]
          </button>

          {/* After reveal: next level / winner / game over / quit */}
          {showCorrectAnswer && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              {selectedOption === correctOption ? (
                <>
                  {currentLevel < 7 ? (
                    <button
                      onClick={handleNextLevel}
                      className={`${BTN} col-span-2 bg-green-700 hover:bg-green-600 text-white`}
                    >
                      ✅ सही! Level {currentLevel + 1} पर जाएँ
                    </button>
                  ) : (
                    <button
                      onClick={handleWinner}
                      className={`${BTN} col-span-2 bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold`}
                    >
                      🏆 विजेता घोषित करें!
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmQuit(true)}
                    className={`${BTN} bg-orange-800 hover:bg-orange-700 text-white text-xs`}
                  >
                    🚪 Quit (Safe Haven लें)
                  </button>
                  <div />
                </>
              ) : (
                <>
                  <button
                    onClick={() => setConfirmGameOver(true)}
                    className={`${BTN} col-span-2 bg-red-800 hover:bg-red-700 text-white`}
                  >
                    ❌ Game Over
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── RESULT phase: loading next Q ── */}
      {phase === 'result' && (
        <p className="text-green-400 text-sm text-center animate-pulse">
          ✅ अगला प्रश्न लोड हो रहा है…
        </p>
      )}

      {/* ── END phases: reset ── */}
      {['gameover','winner','quit'].includes(phase) && (
        <div className="space-y-2">
          <p className="text-center text-gray-400 text-sm">
            {phase === 'winner'   && '🏆 विजेता!'}
            {phase === 'gameover' && '❌ Game Over'}
            {phase === 'quit'     && '🚪 Quit'}
          </p>
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className={`${BTN} w-full bg-gray-700 hover:bg-gray-600 text-white`}
            >
              🔄 नया खेल शुरू करें (Reset)
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleReset}  className={`${BTN} flex-1 bg-red-700 text-white`}>✓ हाँ, Reset</button>
              <button onClick={() => setConfirmReset(false)} className={`${BTN} flex-1 bg-gray-700 text-white`}>रद्द</button>
            </div>
          )}
        </div>
      )}

      {/* ── Confirm Game Over dialog ── */}
      {confirmGameOver && (
        <div className="bg-red-900/30 border border-red-700/40 rounded-lg p-3 space-y-2">
          <p className="text-red-300 text-sm text-center">क्या आप Game Over confirm करते हैं?</p>
          <div className="flex gap-2">
            <button onClick={handleGameOver} className={`${BTN} flex-1 bg-red-700 text-white`}>✓ Game Over</button>
            <button onClick={() => setConfirmGameOver(false)} className={`${BTN} flex-1 bg-gray-700 text-white`}>रद्द</button>
          </div>
        </div>
      )}

      {/* ── Confirm Quit dialog ── */}
      {confirmQuit && (
        <div className="bg-orange-900/30 border border-orange-700/40 rounded-lg p-3 space-y-2">
          <p className="text-orange-300 text-sm text-center">
            Quit करें? Safe Haven: {gameState.safeHavenTitle || 'कोई नहीं'}
          </p>
          <div className="flex gap-2">
            <button onClick={handleQuit}  className={`${BTN} flex-1 bg-orange-700 text-white`}>✓ Quit</button>
            <button onClick={() => setConfirmQuit(false)} className={`${BTN} flex-1 bg-gray-700 text-white`}>रद्द</button>
          </div>
        </div>
      )}

    </div>
  )
}
