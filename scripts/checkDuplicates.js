import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)
const data = JSON.parse(readFileSync(join(__dirname, '../src/data/questions.json'), 'utf8'))

const allQ = []
for (const [levelKey, arr] of Object.entries(data)) {
  for (const q of arr) {
    allQ.push({ id: q.id, level: levelKey, set: q.set, text: q.text.trim() })
  }
}

let clean = true

// 1. Duplicate IDs
const ids = allQ.map(q => q.id)
const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i)
if (dupIds.length) {
  clean = false
  console.log('❌ DUPLICATE IDs:', dupIds)
} else {
  console.log('✅ All IDs unique (' + ids.length + ' total)')
}

// 2. Exact duplicate question text
const texts = allQ.map(q => q.text)
const dupTexts = allQ.filter((q, i) => texts.indexOf(q.text) !== i)
if (dupTexts.length) {
  clean = false
  console.log('\n❌ DUPLICATE QUESTION TEXTS:')
  dupTexts.forEach(q => console.log('  ' + q.id + ' [' + q.level + ' set=' + q.set + ']: ' + q.text.substring(0, 80)))
} else {
  console.log('✅ All question texts unique')
}

// 3. Near-duplicate texts (same first 40 chars, case+space normalised)
const shortTexts = {}
for (const q of allQ) {
  const key = q.text.substring(0, 40).toLowerCase().replace(/\s+/g, ' ')
  if (!shortTexts[key]) shortTexts[key] = []
  shortTexts[key].push(q.id + ' [set=' + q.set + ']')
}
const nearDups = Object.entries(shortTexts).filter(([, v]) => v.length > 1)
if (nearDups.length) {
  clean = false
  console.log('\n⚠️  NEAR-DUPLICATE TEXTS (first 40 chars match):')
  nearDups.forEach(([k, v]) => console.log('  "' + k + '" => ' + v.join(', ')))
} else {
  console.log('✅ No near-duplicate texts found')
}

// 4. Summary
console.log('\nQuestion count per level:')
for (const [levelKey, arr] of Object.entries(data)) {
  const sets = arr.map(q => q.set ?? 'backup').sort((a, b) => String(a).localeCompare(String(b)))
  console.log('  ' + levelKey + ': ' + arr.length + ' questions  (sets: ' + sets.join(', ') + ')')
}

console.log('\n' + (clean ? '✅ All clear — no duplicates.' : '❌ Issues found above — fix before seeding.'))
