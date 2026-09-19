/**
 * useAudienceVote.js — real-time audience voting hook for the player screen.
 *
 * Voter identity: Firebase Anonymous Auth UID (passed in as `uid`).
 * Vote path:      /audienceVotes/{questionId}/{uid} = 'A'|'B'|'C'|'D'
 * Dedup:          two-layer —
 *   1. App layer:  submitVote() guards on hasVoted
 *   2. DB layer:   RTDB Security Rules enforce write-once per uid (see database.rules.json)
 *
 * Two-step UX:
 *   - setPendingVote(opt)  → highlights a selection, does NOT write to Firebase
 *   - submitVote()         → writes pendingVote to Firebase (one-time, irreversible)
 */

import { useState, useEffect, useCallback } from 'react'
import { ref, set, onValue, get }           from 'firebase/database'
import { db }                               from '../firebase/config.js'

/**
 * Hook for the PLAYER screen.
 * @param {string|null} questionId  — current question ID from gameState
 * @param {string|null} uid         — Firebase Anonymous Auth UID from useAnonymousAuth
 * Returns { myVote, pendingVote, setPendingVote, submitVote, voteCounts, totalVotes, hasVoted }
 */
export function useAudienceVote(questionId, uid) {
  const [myVote,      setMyVote]      = useState(null)
  const [pendingVote, setPendingVote] = useState(null)
  const [voteCounts,  setVoteCounts]  = useState({ A: 0, B: 0, C: 0, D: 0 })
  const [voteError,   setVoteError]   = useState(null)

  // ── Restore "already voted" state from localStorage (fast UI hint on page refresh) ──
  useEffect(() => {
    if (!questionId) return
    const stored = localStorage.getItem(`kbc_vote_${questionId}`)
    setMyVote(stored ?? null)
    setPendingVote(null)   // clear pending on question change
  }, [questionId])

  // ── Listen to all votes for this question in real time ──
  useEffect(() => {
    if (!questionId) return
    const votesRef = ref(db, `audienceVotes/${questionId}`)
    const unsub = onValue(votesRef, (snap) => {
      const counts = { A: 0, B: 0, C: 0, D: 0 }
      if (snap.exists()) {
        Object.values(snap.val()).forEach(v => {
          if (counts[v] !== undefined) counts[v]++
        })
      }
      setVoteCounts(counts)
    })
    return () => unsub()
  }, [questionId])

  // ── Write a specific option to Firebase (internal helper) ──
  const writeVote = useCallback(async (option) => {
    if (!uid || !questionId || myVote) return
    setVoteError(null)
    try {
      await set(ref(db, `audienceVotes/${questionId}/${uid}`), option)
      localStorage.setItem(`kbc_vote_${questionId}`, option)
      setMyVote(option)
    } catch (err) {
      console.error('[useAudienceVote] writeVote rejected:', err.code, err.message)
      if (err.code === 'PERMISSION_DENIED') {
        setVoteError('permission_denied')
      } else {
        setVoteError('network_error')
      }
    }
  }, [uid, questionId, myVote])

  // submitVote: commits the currently selected pendingVote to Firebase
  const submitVote = useCallback(async () => {
    if (!pendingVote) return
    await writeVote(pendingVote)
  }, [pendingVote, writeVote])

  // castVote: single-step select+submit (used by passive AudienceVoteButtons)
  const castVote = useCallback(async (option) => {
    setPendingVote(option)
    await writeVote(option)
  }, [writeVote])

  const totalVotes = Object.values(voteCounts).reduce((s, v) => s + v, 0)

  return {
    myVote,
    pendingVote,
    setPendingVote,
    submitVote,
    castVote,
    voteCounts,
    totalVotes,
    hasVoted: !!myVote,
    voteError,
  }
}

/**
 * Utility used by ADMIN to collect current votes and compute percentages.
 * Returns { A, B, C, D } as integers summing to 100.
 * Falls back to equal distribution if no votes were cast.
 */
export async function collectVotePercentages(questionId) {
  const snap = await get(ref(db, `audienceVotes/${questionId}`))
  const counts = { A: 0, B: 0, C: 0, D: 0 }
  if (snap.exists()) {
    Object.values(snap.val()).forEach(v => {
      if (counts[v] !== undefined) counts[v]++
    })
  }
  const total = Object.values(counts).reduce((s, v) => s + v, 0)
  if (total === 0) return { A: 25, B: 25, C: 25, D: 25 }

  const pct = {}
  let sum = 0
  ;['A', 'B', 'C'].forEach(k => {
    pct[k] = Math.round((counts[k] / total) * 100)
    sum += pct[k]
  })
  pct['D'] = 100 - sum   // ensures A+B+C+D === 100 exactly
  return pct
}
