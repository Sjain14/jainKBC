/**
 * QuestionBank.jsx — Right panel showing all questions for current level.
 * Read-only reference for admin. Shows primary + backups with used status.
 */

import { useState, useEffect } from 'react'
import { getQuestionsByLevel } from '../../firebase/questions.js'

export default function QuestionBank({ gameState }) {
  const { currentLevel, phase } = gameState
  const [questions, setQuestions] = useState([])
  const [loading,   setLoading]   = useState(false)
  const [open,      setOpen]      = useState(false)

  useEffect(() => {
    if (!open || !currentLevel) return
    setLoading(true)
    getQuestionsByLevel(currentLevel)
      .then(qs => setQuestions(qs.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))))
      .finally(() => setLoading(false))
  }, [open, currentLevel, gameState.questionId]) // refresh when question changes

  if (!currentLevel || phase === 'idle') return null

  return (
    <div className="bg-navy-800/60 border border-white/5 rounded-xl overflow-hidden">
      {/* Accordion header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-xs uppercase tracking-widest text-gray-500">
          Question Bank — L{currentLevel}
        </span>
        <span className="text-gray-500 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-1.5 max-h-72 overflow-y-auto">
          {loading && (
            <p className="text-xs text-gray-500 text-center py-2 animate-pulse">लोड हो रहा है…</p>
          )}
          {questions.map(q => (
            <div
              key={q.id}
              className={`rounded-lg px-3 py-2 border text-xs
                ${q.id === gameState.questionId
                  ? 'border-gold-500/40 bg-gold-500/5 text-gold-300'
                  : q.used
                    ? 'border-white/5 text-gray-600 line-through'
                    : 'border-white/8 text-gray-400'}`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                {q.isPrimary && (
                  <span className="bg-blue-800/60 text-blue-300 text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wide">Primary</span>
                )}
                {q.id === gameState.questionId && (
                  <span className="bg-gold-600/40 text-gold-300 text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wide">Current</span>
                )}
                {q.used && (
                  <span className="bg-gray-700/40 text-gray-500 text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wide">Used</span>
                )}
              </div>
              <p className="font-devanagari leading-snug">{q.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
