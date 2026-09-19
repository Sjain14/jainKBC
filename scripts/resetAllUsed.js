/**
 * resetAllUsed.js — marks ALL primary + backup questions as unused.
 *
 * Usage:
 *   node scripts/resetAllUsed.js
 *
 * Requires a .env file at jain-kbc/.env with VITE_FIREBASE_DATABASE_URL set.
 */

import { initializeApp }  from 'firebase/app'
import { getDatabase, ref, get, update } from 'firebase/database'
import { readFileSync }   from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath }  from 'url'

// ── Load .env manually (no dotenv dependency needed) ──────────────────────
const __dir  = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dir, '../.env')
const envText = readFileSync(envPath, 'utf8')
const env = Object.fromEntries(
  envText.split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim()] })
)

const app = initializeApp({
  apiKey:            env.VITE_FIREBASE_API_KEY,
  authDomain:        env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL:       env.VITE_FIREBASE_DATABASE_URL,
  projectId:         env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             env.VITE_FIREBASE_APP_ID,
})
const db = getDatabase(app)

async function resetAll() {
  const updates = {}
  let total = 0

  // ── Level questions (levels 1-7) ──────────────────────────────────────────
  for (let lvl = 1; lvl <= 7; lvl++) {
    const snap = await get(ref(db, `questions/level_${lvl}`))
    if (snap.exists()) {
      Object.keys(snap.val()).forEach(id => {
        updates[`questions/level_${lvl}/${id}/used`] = false
        total++
      })
    }
  }

  // ── Backup questions ──────────────────────────────────────────────────────
  const backupSnap = await get(ref(db, 'questions/backup'))
  if (backupSnap.exists()) {
    Object.keys(backupSnap.val()).forEach(id => {
      updates[`questions/backup/${id}/used`] = false
      total++
    })
  }

  if (total === 0) {
    console.log('⚠️  No questions found in Firebase.')
    process.exit(0)
  }

  await update(ref(db), updates)
  console.log(`✅  Reset ${total} questions (all marked unused).`)
  process.exit(0)
}

resetAll().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
