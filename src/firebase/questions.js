/**
 * questions.js — Firebase RTDB helpers for question bank management.
 *
 * Structure:
 *   /questions/level_{N}/{questionId}  — set questions (set: 1-8, isPrimary: true, ageGroup: string)
 *   /questions/backup/{questionId}     — global backup questions (set: 'backup')
 *
 * Fields: text, optionA-D, correctOption, description, isPrimary, set, ageGroup, used
 */

import { ref, get, update, push } from 'firebase/database'
import { db } from './config.js'

const levelRef  = (level) => ref(db, `questions/level_${level}`)
const backupRef = ()      => ref(db, 'questions/backup')

/**
 * Get all questions for a level.
 */
export async function getQuestionsByLevel(level) {
  const snap = await get(levelRef(level))
  if (!snap.exists()) return []
  return Object.entries(snap.val()).map(([id, val]) => ({ id, ...val }))
}

/**
 * Get the primary question for a level filtered by set number.
 * Falls back to any unused primary if the set's question is already used.
 */
export async function getPrimaryQuestion(level, set = 1) {
  const all = await getQuestionsByLevel(level)
  // First try: exact set match, unused
  const exact = all.find(q => q.isPrimary && q.set === set && !q.used)
  if (exact) return exact
  // Fallback: same set even if used (re-run scenario)
  const setMatch = all.find(q => q.isPrimary && q.set === set)
  if (setMatch) return setMatch
  // Last resort: any primary
  return all.find(q => q.isPrimary) ?? null
}

/**
 * Get all global backup questions (from /questions/backup).
 * Returns all of them — used ones are flagged but still returned so host can see used status.
 */
export async function getBackupQuestions() {
  const snap = await get(backupRef())
  if (!snap.exists()) return []
  return Object.entries(snap.val()).map(([id, val]) => ({ id, ...val }))
}

/**
 * Mark a level question as used.
 */
export async function markQuestionUsed(level, questionId) {
  await update(ref(db, `questions/level_${level}/${questionId}`), { used: true })
}

/**
 * Mark a backup question as used.
 */
export async function markBackupUsed(questionId) {
  await update(ref(db, `questions/backup/${questionId}`), { used: true })
}

/**
 * Reset all questions in a level (clear used flags).
 */
export async function resetLevelQuestions(level) {
  const all = await getQuestionsByLevel(level)
  const updates = {}
  all.forEach(q => {
    updates[`questions/level_${level}/${q.id}/used`] = false
  })
  await update(ref(db), updates)
}

/**
 * Reset all backup questions.
 */
export async function resetBackupQuestions() {
  const all = await getBackupQuestions()
  const updates = {}
  all.forEach(q => {
    updates[`questions/backup/${q.id}/used`] = false
  })
  await update(ref(db), updates)
}

/**
 * Reset ALL question used flags across all levels + backups.
 */
export async function resetAllQuestions() {
  for (let lvl = 1; lvl <= 7; lvl++) {
    await resetLevelQuestions(lvl)
  }
  await resetBackupQuestions()
}

/**
 * Add a new question to a level programmatically.
 */
export async function addQuestion(level, questionData) {
  const newRef = push(levelRef(level))
  await update(newRef, { ...questionData, used: false })
  return newRef.key
}

/**
 * Read level_1 questions and derive the list of available age groups and their set numbers.
 * Returns an array ordered by first set number, e.g.:
 *   [
 *     { ageGroup: '10 साल तक के बच्चे', sets: [1, 2] },
 *     { ageGroup: '10 से 13 साल के बच्चे', sets: [3, 4] },
 *     { ageGroup: '13 से 18 साल के बच्चे', sets: [5, 6, 7, 8] },
 *   ]
 * Only level_1 is queried — all levels have the same set/ageGroup distribution.
 */
export async function getAvailableSets() {
  const questions = await getQuestionsByLevel(1)
  // Collect unique (set, ageGroup) pairs from primary questions only
  const map = new Map() // set number → ageGroup label
  for (const q of questions) {
    if (q.isPrimary && typeof q.set === 'number' && q.ageGroup) {
      if (!map.has(q.set)) map.set(q.set, q.ageGroup)
    }
  }
  // Group sets by ageGroup label, preserving order by set number
  const sortedSets = [...map.entries()].sort((a, b) => a[0] - b[0])
  const groupMap = new Map() // ageGroup label → [setNums]
  for (const [setNum, label] of sortedSets) {
    if (!groupMap.has(label)) groupMap.set(label, [])
    groupMap.get(label).push(setNum)
  }
  return [...groupMap.entries()].map(([ageGroup, sets]) => ({ ageGroup, sets }))
}
