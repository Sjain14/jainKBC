/**
 * seedQuestions.js — wipes old questions and loads new questions from questions.json into Firebase RTDB.
 * Supports both:
 *   1. Flat array format (question_research/compiled_sets/questions.json)
 *   2. Grouped level format (src/data/questions.json)
 *
 * Run: npm run seed (or node scripts/seedQuestions.js)
 */

import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

// Load .env if present manually without external dotenv dependency
const envPath = join(__dirname, '../.env')
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim()
        let val = trimmed.slice(eqIdx + 1).trim()
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1)
        }
        if (!process.env[key]) {
          process.env[key] = val
        }
      }
    }
  }
}

// ── Load questions data ──────────────────────────────────────────────────
// Prefer the compiled_sets/questions.json if present, or fallback to src/data/questions.json
const flatPath = join(__dirname, '../../question_research/compiled_sets/questions.json')
const groupedPath = join(__dirname, '../src/data/questions.json')

let rawQuestions
if (existsSync(flatPath)) {
  console.log(`📂 Reading questions from: ${flatPath}`)
  rawQuestions = JSON.parse(readFileSync(flatPath, 'utf-8'))
} else {
  console.log(`📂 Reading questions from: ${groupedPath}`)
  rawQuestions = JSON.parse(readFileSync(groupedPath, 'utf-8'))
}

// Helper to convert flat array to grouped format
function normalizeQuestions(data) {
  if (Array.isArray(data)) {
    console.log('🔄 Parsing flat array into levels & backups...')
    const grouped = {
      level_1: [], level_2: [], level_3: [], level_4: [],
      level_5: [], level_6: [], level_7: [], backup: []
    }
    let backupCounter = 1

    for (const q of data) {
      const level = parseInt(q.level, 10)
      const setVal = String(q.set || '').trim()

      if (setVal.toLowerCase().includes('backup')) {
        grouped.backup.push({
          id: `bk_q${backupCounter++}`,
          text: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctOption: q.correctAnswer,
          description: q.explanation || '',
          isPrimary: false,
          set: 'backup',
          level: level,
          used: false
        })
      } else {
        const match = setVal.match(/(\d+)/)
        const setNum = match ? parseInt(match[1], 10) : 1
        // Extract the age group label from inside the parentheses, e.g.
        // "5 (13 से 18 साल के बच्चे)" → "13 से 18 साल के बच्चे"
        // If no parentheses (plain number), use the raw setVal as the label.
        const parenMatch = setVal.match(/\(([^)]+)\)/)
        const ageGroup = parenMatch ? parenMatch[1].trim() : setVal
        const levelKey = `level_${level}`

        if (grouped[levelKey]) {
          grouped[levelKey].push({
            id: `l${level}_q${setNum}`,
            text: q.question,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctOption: q.correctAnswer,
            description: q.explanation || '',
            isPrimary: true,
            set: setNum,
            ageGroup,
            level: level,
            used: false
          })
        }
      }
    }
    return grouped
  }
  return data
}

const questionsData = normalizeQuestions(rawQuestions)

// ── Firebase Connection ──────────────────────────────────────────────────
// We support both firebase-admin (if service account is configured) and client SDK (with .env credentials)
const FIREBASE_DATABASE_URL = process.env.VITE_FIREBASE_DATABASE_URL || process.env.FIREBASE_DATABASE_URL

if (!FIREBASE_DATABASE_URL) {
  console.error('❌ Missing FIREBASE_DATABASE_URL or VITE_FIREBASE_DATABASE_URL in environment.')
  process.exit(1)
}

// ── Seed ─────────────────────────────────────────────────────────────────
async function seedWithClientSdk() {
  console.log('🔗 Connecting to Firebase via Client SDK...')
  const { initializeApp } = await import('firebase/app')
  const { getDatabase, ref, set, remove, get } = await import('firebase/database')
  const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth')

  const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: FIREBASE_DATABASE_URL,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
  }

  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)

  const adminEmail = process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_UID || 'admin@jain-kbc.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Sahaj@13579'

  if (adminEmail && adminPassword) {
    try {
      console.log(`🔐 Authenticating as admin (${adminEmail})...`)
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword)
      console.log('✅ Authenticated successfully.')
    } catch (authErr) {
      console.log('⚠️ Admin login failed:', authErr.message)
    }
  }

  const db = getDatabase(app)

  console.log('🗑️  Wiping old questions in Firebase (await db.ref("questions").remove())...')
  await remove(ref(db, 'questions'))
  console.log('✨ Old questions successfully deleted.')

  console.log('🌱 Starting upload of new questions…')
  let totalWritten = 0

  for (const [levelKey, questions] of Object.entries(questionsData)) {
    for (const q of questions) {
      const { id, ...data } = q
      await set(ref(db, `questions/${levelKey}/${id}`), { ...data, used: false })
      console.log(`  ✓ ${levelKey}/${id} — ${q.text.slice(0, 40)}…`)
      totalWritten++
    }
  }

  // Seed initial gameState if not present
  const gsRef = ref(db, 'gameState')
  const snap = await get(gsRef)
  if (!snap.exists()) {
    await set(gsRef, {
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
      selectedSet: 1,
      updatedAt: 0,
    })
    console.log('  ✓ Initial gameState written')
  }

  console.log(`\n🎉 Seed complete! ${totalWritten} questions successfully uploaded to Firebase RTDB.`)
  process.exit(0)
}

seedWithClientSdk().catch(async (err) => {
  console.log('⚠️ Client SDK seeding encountered:', err.message)
  console.log('Attempting Firebase Admin SDK fallback...')

  try {
    const { initializeApp: initAdmin, getApps, applicationDefault } = await import('firebase-admin')
    const { getDatabase: getAdminDatabase } = await import('firebase-admin/database')

    if (!getApps().length) {
      initAdmin({
        credential: applicationDefault(),
        databaseURL: FIREBASE_DATABASE_URL,
      })
    }
    const adminDb = getAdminDatabase()
    
    console.log('🗑️  Wiping old questions with Admin SDK (await adminDb.ref("questions").remove())...')
    await adminDb.ref('questions').remove()
    console.log('✨ Old questions successfully deleted.')

    let totalWritten = 0
    for (const [levelKey, questions] of Object.entries(questionsData)) {
      const levelRef = adminDb.ref(`questions/${levelKey}`)
      for (const q of questions) {
        const { id, ...data } = q
        await levelRef.child(id).set({ ...data, used: false })
        console.log(`  ✓ ${levelKey}/${id} — ${q.text.slice(0, 40)}…`)
        totalWritten++
      }
    }
    console.log(`\n🎉 Admin Seed complete! ${totalWritten} questions uploaded to Firebase RTDB.`)
    process.exit(0)
  } catch (adminErr) {
    console.error('❌ All seed methods failed:', adminErr)
    process.exit(1)
  }
})
