/**
 * questions.js — Firebase RTDB helpers for question bank management.
 * Questions live at /questions/level_{N}/{questionId}
 * Fields: text, optionA, optionB, optionC, optionD, correctOption, isPrimary, used
 * isPrimary=true  → default question shown when level starts
 * isPrimary=false → backup questions (shown in Change Question modal)
 * used=true       → already used this session; skip in listings
 */

import { ref, get, update, push, query, orderByChild, equalTo } from 'firebase/database'
import { db } from './config.js'

const levelRef = (level) => ref(db, `questions/level_${level}`)

/**
 * Get all questions for a level.
 * Returns array of { id, ...fields }
 */
export async function getQuestionsByLevel(level) {
  const snap = await get(levelRef(level))
  if (!snap.exists()) return []
  return Object.entries(snap.val()).map(([id, val]) => ({ id, ...val }))
}

/**
 * Get the primary (isPrimary=true, used=false) question for a level.
 * Returns the first match, or null.
 */
export async function getPrimaryQuestion(level) {
  const all = await getQuestionsByLevel(level)
  return all.find(q => q.isPrimary && !q.used) ?? all.find(q => q.isPrimary) ?? null
}

/**
 * Get backup (isPrimary=false, used=false) questions for a level.
 * Returns array sorted by text.
 */
export async function getBackupQuestions(level) {
  const all = await getQuestionsByLevel(level)
  return all.filter(q => !q.isPrimary && !q.used)
}

/**
 * Mark a question as used so it won't appear again.
 */
export async function markQuestionUsed(level, questionId) {
  await update(ref(db, `questions/level_${level}/${questionId}`), { used: true })
}

/**
 * Reset all questions in a level (clear used flags).
 * Useful for re-running the event.
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
 * Reset ALL question used flags across all levels.
 */
export async function resetAllQuestions() {
  for (let lvl = 1; lvl <= 7; lvl++) {
    await resetLevelQuestions(lvl)
  }
}

/**
 * Add a new question to a level programmatically.
 * (Used by admin panel quick-add if needed)
 */
export async function addQuestion(level, questionData) {
  const newRef = push(levelRef(level))
  await update(newRef, { ...questionData, used: false })
  return newRef.key
}
