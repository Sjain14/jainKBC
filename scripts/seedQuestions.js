/**
 * seedQuestions.js — loads questions.json into Firebase RTDB.
 * Run: node scripts/seedQuestions.js
 *
 * Requires: GOOGLE_APPLICATION_CREDENTIALS env var pointing to service account JSON
 *           OR set databaseURL + serviceAccount directly below.
 *
 * Usage:
 *   1. Download service account JSON from Firebase Console → Project Settings → Service Accounts
 *   2. Set env: $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccount.json"
 *   3. Set FIREBASE_DATABASE_URL below
 *   4. Run: node scripts/seedQuestions.js
 */

import { readFileSync } from 'fs'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

// ── Load questions data ──────────────────────────────────────────────────
const questionsPath = join(__dirname, '../src/data/questions.json')
const questionsData = JSON.parse(readFileSync(questionsPath, 'utf-8'))

// ── Firebase Admin ───────────────────────────────────────────────────────
// Dynamic import so we don't need firebase-admin in main dependencies
const {
  initializeApp,
  getApps,
  applicationDefault,
} = await import('firebase-admin').catch(() => {
  console.error('❌ firebase-admin not found. Run: npm install firebase-admin --save-dev')
  process.exit(1)
})
const { getDatabase } = await import('firebase-admin/database')

const FIREBASE_DATABASE_URL = process.env.VITE_FIREBASE_DATABASE_URL
  || 'https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com'

if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
    databaseURL: FIREBASE_DATABASE_URL,
  })
}

const db = getDatabase()

// ── Seed ─────────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Starting seed…')
  let totalWritten = 0

  for (const [levelKey, questions] of Object.entries(questionsData)) {
    // levelKey = "level_1", "level_2", … or "backup"
    const levelRef = db.ref(`questions/${levelKey}`)

    for (const q of questions) {
      const { id, ...data } = q
      await levelRef.child(id).set({ ...data, used: false })
      console.log(`  ✓ ${levelKey}/${id} — ${q.text.slice(0, 40)}…`)
      totalWritten++
    }
  }

  // Seed initial gameState if it doesn't exist
  const gsRef = db.ref('gameState')
  const snap = await gsRef.once('value')
  if (!snap.exists()) {
    await gsRef.set({
      phase: 'idle',
      currentLevel: 0,
      contestantName: '',
      questionId: '',
      questionText: '',
      optionA: '', optionB: '', optionC: '', optionD: '',
      correctOption: '',
      selectedOption: '',
      showCorrectAnswer: false,
      timerEnabled: false,
      timerRunning: false,
      timerSeconds: 45,
      timerStartedAt: 0,
      lifelineAskAudienceUsed: false,
      lifelineChangeQUsed: false,
      lifelineAskExpertUsed: false,
      audiencePollA: 0, audiencePollB: 0, audiencePollC: 0, audiencePollD: 0,
      showAudiencePoll: false,
      showExpertOverlay: false,
      expertMessage: '',
      safeHavenLevel: 0,
      safeHavenTitle: '',
      currentLevelTitle: '',
      gamePaused: false,
      updatedAt: 0,
    })
    console.log('  ✓ Initial gameState written')
  } else {
    console.log('  ℹ gameState already exists — skipped')
  }

  console.log(`\n✅ Seed complete! ${totalWritten} questions written.`)
  process.exit(0)
}

seed().catch(err => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
