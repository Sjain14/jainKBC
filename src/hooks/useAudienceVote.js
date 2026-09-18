/**
 * useAudienceVote.js — real-time audience voting hook for the player screen.
 *
 * Each device gets a random token in localStorage.
 * Vote is written to /audienceVotes/{questionId}/{token} = 'A'|'B'|'C'|'D'
 * Votes are keyed by questionId so they reset automatically per question.
 */

import { useState, useEffect, useCallback } from 'react'
import { ref, set, onValue, get }           from 'firebase/database'
import { db }                               from '../firebase/config.js'

function getVoterToken() {
  let token = localStorage.getItem('kbc_voter_token')
  if (!token) {
    token = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('kbc_voter_token', token)
  }
  return token
}

/**
 * Hook for the PLAYER screen.
 * Returns { myVote, totalVotes, voteCounts, castVote, hasVoted }
 */
export function useAudienceVote(questionId) {
  const [myVote,     setMyVote]     = useState(null)
  const [voteCounts, setVoteCounts] = useState({ A: 0, B: 0, C: 0, D: 0 })
  // Stable token — getVoterToken reads/writes localStorage, memoize so it
  // isn't called on every render (React StrictMode double-invokes render)
  const token = useState(() => getVoterToken())[0]

  // Load my previous vote for this question from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`kbc_vote_${questionId}`)
    setMyVote(stored ?? null)
  }, [questionId])

  // Listen to all votes for this question in real time
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

  const castVote = useCallback(async (option) => {
    if (!questionId || myVote) return  // one vote per question
    await set(ref(db, `audienceVotes/${questionId}/${token}`), option)
    localStorage.setItem(`kbc_vote_${questionId}`, option)
    setMyVote(option)
  }, [questionId, myVote, token])

  const totalVotes = Object.values(voteCounts).reduce((s, v) => s + v, 0)

  return { myVote, voteCounts, totalVotes, castVote, hasVoted: !!myVote }
}

/**
 * Utility used by ADMIN to collect current votes and compute percentages.
 * Returns { A, B, C, D } as integers summing to 100.
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
  pct['D'] = 100 - sum
  return pct
}
