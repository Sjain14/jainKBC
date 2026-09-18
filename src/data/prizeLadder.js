/**
 * prizeLadder.js — 7-level prize ladder configuration
 * safeHaven: true = safe haven level (contestant keeps this title even if they lose)
 */

export const PRIZE_LADDER = [
  { level: 1, title: 'दर्शनार्थी', timer: true,  safeHaven: false },
  { level: 2, title: 'श्रावक',     timer: true,  safeHaven: false },
  { level: 3, title: 'स्वाध्यायी', timer: true,  safeHaven: true  },
  { level: 4, title: 'आत्मार्थी',  timer: false, safeHaven: false },
  { level: 5, title: 'मोक्षमार्गी',timer: false, safeHaven: false },
  { level: 6, title: 'ज्ञानी',     timer: false, safeHaven: false },
  { level: 7, title: 'ज्ञानवान',   timer: false, safeHaven: true  },
]

export const SAFE_HAVEN_LEVELS = [3, 7]

export function getLevelConfig(level) {
  return PRIZE_LADDER.find(l => l.level === level) ?? null
}
