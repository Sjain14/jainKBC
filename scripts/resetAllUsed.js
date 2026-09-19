/**
 * resetAllUsed.js — marks ALL primary + backup questions as unused.
 *
 * Signs in with the admin email/password from .env (same credentials the
 * admin panel uses), gets a Firebase ID token, then uses it to batch-write
 * used=false to every question via the RTDB REST API.
 *
 * Usage:
 *   node scripts/resetAllUsed.js
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ── Load .env ──────────────────────────────────────────────────────────────
const __dir  = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dir, '../.env')
const envText = readFileSync(envPath, 'utf8')
const env = Object.fromEntries(
  envText.split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim()] })
)

const DB_URL  = env.VITE_FIREBASE_DATABASE_URL
const API_KEY = env.VITE_FIREBASE_API_KEY
const EMAIL   = env.VITE_ADMIN_UID          // admin email stored as VITE_ADMIN_UID
const PASS    = process.argv[2]             // pass password as CLI argument

if (!DB_URL || !API_KEY || !EMAIL) {
  console.error('❌  Missing .env values. Need: VITE_FIREBASE_DATABASE_URL, VITE_FIREBASE_API_KEY, VITE_ADMIN_UID')
  process.exit(1)
}
if (!PASS) {
  console.error('❌  Pass your admin password as an argument:')
  console.error('    node scripts/resetAllUsed.js <password>')
  process.exit(1)
}

// ── Step 1: sign in to get ID token ───────────────────────────────────────
async function getIdToken() {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: EMAIL, password: PASS, returnSecureToken: true }),
    }
  )
  const data = await res.json()
  if (!data.idToken) {
    throw new Error(`Sign-in failed: ${data.error?.message ?? JSON.stringify(data)}`)
  }
  return data.idToken
}

// ── Step 2: GET a node from RTDB ──────────────────────────────────────────
async function dbGet(path, token) {
  const res = await fetch(`${DB_URL}/${path}.json?auth=${token}`)
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${await res.text()}`)
  return res.json()
}

// ── Step 3: PATCH (partial update) a node ─────────────────────────────────
async function dbPatch(path, data, token) {
  const res = await fetch(`${DB_URL}/${path}.json?auth=${token}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`PATCH ${path} → ${res.status} ${await res.text()}`)
}

// ── Main ───────────────────────────────────────────────────────────────────
async function resetAll() {
  console.log('🔐  Signing in as admin…')
  const token = await getIdToken()
  console.log('✅  Signed in.')

  let total = 0

  // Level questions 1-7
  for (let lvl = 1; lvl <= 7; lvl++) {
    const data = await dbGet(`questions/level_${lvl}`, token)
    if (!data) { console.log(`   Level ${lvl}: no questions`); continue }

    const patch = {}
    Object.keys(data).forEach(id => { patch[`${id}/used`] = false })
    await dbPatch(`questions/level_${lvl}`, patch, token)
    const count = Object.keys(data).length
    total += count
    console.log(`   Level ${lvl}: reset ${count} questions`)
  }

  // Backup questions
  const backups = await dbGet('questions/backup', token)
  if (backups) {
    const patch = {}
    Object.keys(backups).forEach(id => { patch[`${id}/used`] = false })
    await dbPatch('questions/backup', patch, token)
    const count = Object.keys(backups).length
    total += count
    console.log(`   Backup: reset ${count} questions`)
  }

  console.log(`\n✅  Done — ${total} questions marked as unused.`)
}

resetAll().catch(err => {
  console.error('❌  Error:', err.message)
  process.exit(1)
})
