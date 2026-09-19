/**
 * gameState.js — all Firebase RTDB writes for game state.
 * Rules:
 *  - ALL writes use update() with flat paths. Never set() on a parent node.
 *  - Player screen reads /gameState. It is NEVER given access to /questions.
 *  - correctOption lives in gameState but the player component only renders
 *    it when showCorrectAnswer === true.
 */

import { ref, update, push, serverTimestamp } from 'firebase/database'
import { db } from './config.js'

const gsRef = () => ref(db, 'gameState')

// ─── Canonical initial state ───────────────────────────────────────────────
export const INITIAL_GAME_STATE = {
  // Game lifecycle
  phase: 'idle',           // idle | question | result | gameover | winner | quit
  currentLevel: 0,         // 1-7
  contestantName: '',

  // Selected question set (1-3)
  selectedSet: 1,

  // Current question (written by admin when loading a question)
  questionId:          '',
  questionText:        '',
  optionA:             '',
  optionB:             '',
  optionC:             '',
  optionD:             '',
  correctOption:       '',      // 'A'|'B'|'C'|'D' — hidden from player until reveal
  questionDescription: '',      // host-only explanation shown in admin panel

  // Answer state
  selectedOption:    '',   // which option admin locked in
  showCorrectAnswer: false,

  // Timer (levels 1-3 only)
  timerEnabled:    false,
  timerRunning:    false,
  timerSeconds:    45,     // current/remaining seconds (snapshot)
  timerStartedAt:  0,      // epoch ms when timer last started (for drift correction)

  // Lifelines
  lifelineAskAudienceUsed: false,
  lifelineChangeQUsed:     false,
  lifelineAskExpertUsed:   false,
  audiencePollA: 0,
  audiencePollB: 0,
  audiencePollC: 0,
  audiencePollD: 0,
  showAudiencePoll:   false,
  audiencePollActive: false,   // true while the 30-s voting window is open
  pollStartedAt:      0,       // epoch ms when poll was started (for countdown)
  showExpertOverlay: false,
  expertMessage:     '',

  // Safe haven
  safeHavenLevel:  0,       // level number that is the current safe haven (3 or 7)
  safeHavenAmount: '',

  // Prize
  currentPrize: '',

  // Admin UI helpers (written to RTDB so player reflects them)
  gamePaused: false,

  updatedAt: 0,
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Reset entire game state to initial values */
export async function resetGameState() {
  await update(gsRef(), { ...INITIAL_GAME_STATE, updatedAt: Date.now() })
}

/** Set contestant name and switch to idle phase */
export async function setContestantName(name) {
  await update(gsRef(), { contestantName: name, updatedAt: Date.now() })
}

/** Load a question for the current level */
export async function loadQuestion(level, question, levelTitle) {
  const timerEnabled = level <= 3
  await update(gsRef(), {
    phase:               'question',
    currentLevel:        level,
    questionId:          question.id,
    questionText:        question.text,
    optionA:             question.optionA,
    optionB:             question.optionB,
    optionC:             question.optionC,
    optionD:             question.optionD,
    correctOption:       question.correctOption,
    questionDescription: question.description ?? '',
    selectedOption:      '',
    showCorrectAnswer:   false,
    showAudiencePoll:    false,
    audiencePollActive:  false,
    pollStartedAt:       0,
    showExpertOverlay:   false,
    expertMessage:       '',
    currentLevelTitle:   levelTitle,
    timerEnabled,
    timerRunning:        timerEnabled,
    timerSeconds:        45,
    timerStartedAt:      timerEnabled ? Date.now() : 0,
    gamePaused:          false,
    updatedAt:           Date.now(),
  })
}

/** Set selected question set (1-3) */
export async function setSelectedSet(set) {
  await update(gsRef(), { selectedSet: set, updatedAt: Date.now() })
}

/** Admin selects / locks an answer option */
export async function selectOption(option) {
  await update(gsRef(), {
    selectedOption: option,
    timerRunning:   false,            // auto-pause timer on lock
    timerStartedAt: 0,
    updatedAt:      Date.now(),
  })
}

/** Reveal the correct answer (changes option button colours on player screen) */
export async function revealAnswer() {
  await update(gsRef(), {
    showCorrectAnswer: true,
    timerRunning:      false,
    updatedAt:         Date.now(),
  })
}

/** Advance to result phase (between levels) */
export async function advanceToResult(safeHavenLevel, safeHavenTitle) {
  await update(gsRef(), {
    phase:          'result',
    safeHavenLevel,
    safeHavenTitle,
    updatedAt:      Date.now(),
  })
}

/** Declare winner (level 7 correct answer) */
export async function declareWinner() {
  await update(gsRef(), {
    phase:          'winner',
    safeHavenLevel: 7,
    safeHavenTitle: 'ज्ञानवान',
    timerRunning:   false,
    updatedAt:      Date.now(),
  })
}

/** Game over — wrong answer */
export async function gameOver() {
  await update(gsRef(), {
    phase:        'gameover',
    timerRunning: false,
    updatedAt:    Date.now(),
  })
}

/** Contestant quits (takes safe haven money) */
export async function quitGame() {
  await update(gsRef(), {
    phase:        'quit',
    timerRunning: false,
    updatedAt:    Date.now(),
  })
}

/** Pause the timer, storing how many seconds remain */
export async function pauseTimer(remainingSeconds) {
  await update(gsRef(), {
    timerRunning:   false,
    timerSeconds:   remainingSeconds,
    timerStartedAt: 0,
    gamePaused:     true,
    updatedAt:      Date.now(),
  })
}

/** Resume the timer from remaining seconds */
export async function resumeTimer(remainingSeconds) {
  await update(gsRef(), {
    timerRunning:   true,
    timerSeconds:   remainingSeconds,
    timerStartedAt: Date.now(),
    gamePaused:     false,
    updatedAt:      Date.now(),
  })
}

/** Timer expired */
export async function timerExpired() {
  await update(gsRef(), {
    timerRunning: false,
    timerSeconds: 0,
    updatedAt:    Date.now(),
  })
}

// ─── Lifeline writers ──────────────────────────────────────────────────────

/** Trigger Ask the Audience with collected poll percentages — shows results on player screen */
export async function triggerAskAudience(pollA, pollB, pollC, pollD) {
  await update(gsRef(), {
    lifelineAskAudienceUsed: true,
    audiencePollActive:      false,
    showAudiencePoll:        true,
    audiencePollA: pollA,
    audiencePollB: pollB,
    audiencePollC: pollC,
    audiencePollD: pollD,
    updatedAt:     Date.now(),
  })
}

/** Open the 30-second audience voting window (shows popup on audience screens) */
export async function startAudiencePoll() {
  await update(gsRef(), {
    lifelineAskAudienceUsed: true,   // mark used as soon as poll starts (not refundable)
    audiencePollActive:      true,
    pollStartedAt:           Date.now(),
    updatedAt:               Date.now(),
  })
}

/** Close the voting window (called by admin or auto after 30 s) */
export async function stopAudiencePoll() {
  await update(gsRef(), {
    audiencePollActive: false,
    updatedAt:          Date.now(),
  })
}

/** Hide the audience poll results overlay (called after admin closes it) */
export async function hideAudiencePoll() {
  await update(gsRef(), {
    showAudiencePoll: false,
    updatedAt:        Date.now(),
  })
}

/** Mark Change the Question lifeline as used */
export async function markChangeQUsed() {
  await update(gsRef(), {
    lifelineChangeQUsed: true,
    updatedAt:           Date.now(),
  })
}

/** Trigger Ask the Expert with a custom message */
export async function triggerAskExpert(message) {
  await update(gsRef(), {
    lifelineAskExpertUsed: true,
    showExpertOverlay:     true,
    expertMessage:         message,
    updatedAt:             Date.now(),
  })
}

/** Hide expert overlay */
export async function hideExpertOverlay() {
  await update(gsRef(), {
    showExpertOverlay: false,
    updatedAt:         Date.now(),
  })
}

// ─── Game result archival ──────────────────────────────────────────────────

/** Save a game result record to /gameResults for historical reference */
export async function saveGameResult(gameState) {
  const resultsRef = ref(db, 'gameResults')
  await push(resultsRef, {
    contestantName:    gameState.contestantName,
    finalLevel:        gameState.currentLevel,
    finalLevelTitle:   gameState.currentLevelTitle,
    safeHavenLevel:    gameState.safeHavenLevel,
    safeHavenTitle:    gameState.safeHavenTitle,
    phase:             gameState.phase,
    timestamp:         serverTimestamp(),
  })
}
