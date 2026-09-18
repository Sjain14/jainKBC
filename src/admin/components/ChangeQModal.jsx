/**
 * ChangeQModal.jsx — popup to swap current question with a backup.
 * Shows all backup (isPrimary=false, used=false) questions for the current level.
 * Admin selects one → loadQuestion fires → modal closes.
 */

import { useState, useEffect } from 'react'
import { getBackupQuestions, markQuestionUsed } from '../../firebase/questions.js'
import { loadQuestion, markChangeQUsed }        from '../../firebase/gameState.js'
import { PRIZE_LADDER }                          from '../../data/prizeLadder.js'

export default function ChangeQModal({ level, gameState, onClose }) {
  const [backups,   setBackups]  = useState([])
  const [loading,   setLoading]  = useState(true)
  const [selecting, setSelecting] = useState(null)

  useEffect(() => {
    getBackupQuestions(level)
      .then(qs => setBackups(qs))
      .finally(() => setLoading(false))
  }, [level])

  async function handleSelect(q) {
    setSelecting(q.id)
    try {
      const row = PRIZE_LADDER.find(r => r.level === level)
      await markQuestionUsed(level, q.id)
      await markChangeQUsed()
      await loadQuestion(level, q, row?.title ?? '')
      onClose()
    } catch (err) {
      console.error(err)
      alert('Failed: ' + err.message)
      setSelecting(null)
    }
  }

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-navy-800 border border-gold-600/30 rounded-2xl p-5 w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gold-400 font-bold text-lg font-devanagari">
            🔄 प्रश्न बदलें — Level {level}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl leading-none"
          >×</button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 space-y-2 pr-1">
          {loading && (
            <p className="text-gray-400 text-sm text-center py-4 animate-pulse">लोड हो रहा है…</p>
          )}

          {!loading && backups.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">
              इस level के लिए कोई backup प्रश्न उपलब्ध नहीं।
            </p>
          )}

          {backups.map(q => (
            <button
              key={q.id}
              onClick={() => handleSelect(q)}
              disabled={!!selecting}
              className="w-full text-left bg-navy-900 hover:bg-navy-700 border border-white/10
                         hover:border-gold-500/40 rounded-xl px-4 py-3 transition-all
                         disabled:opacity-50"
            >
              <p className="text-white font-devanagari text-sm leading-relaxed mb-2">{q.text}</p>
              <div className="grid grid-cols-2 gap-1">
                {['A','B','C','D'].map(opt => (
                  <span key={opt} className="text-[11px] text-gray-400 font-devanagari">
                    <strong className="text-gray-300 mr-1">{opt}.</strong>
                    {q[`option${opt}`]}
                  </span>
                ))}
              </div>
              {selecting === q.id && (
                <p className="text-gold-400 text-xs mt-1 animate-pulse">लोड हो रहा है…</p>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2 text-sm font-semibold transition-all"
        >
          रद्द करें
        </button>
      </div>
    </div>
  )
}
