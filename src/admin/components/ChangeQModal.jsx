/**
 * ChangeQModal.jsx — popup to swap current question with a level-matched backup.
 *
 * Used in two contexts:
 *   1. Lifeline "Change the Question" — contestant's lifeline, marks lifelineChangeQUsed
 *   2. Admin Override (host-only)     — silent swap, does NOT consume the lifeline
 *
 * Props:
 *   level         — current game level (1-7)
 *   onClose       — callback to close modal
 *   adminOverride — if true: skips markChangeQUsed(), shows red heading
 *
 * Used backup questions are shown with an amber warning but remain selectable.
 */

import { useState, useEffect } from 'react'
import { getBackupQuestions, markBackupUsed } from '../../firebase/questions.js'
import { loadQuestion, markChangeQUsed }       from '../../firebase/gameState.js'
import { PRIZE_LADDER }                         from '../../data/prizeLadder.js'

export default function ChangeQModal({ level, onClose, adminOverride = false }) {
  const [backups,   setBackups]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [selecting, setSelecting] = useState(null)

  useEffect(() => {
    getBackupQuestions()
      .then(qs => setBackups(qs.filter(q => q.level === level)))
      .finally(() => setLoading(false))
  }, [level])

  async function handleSelect(q) {
    setSelecting(q.id)
    try {
      const row = PRIZE_LADDER.find(r => r.level === level)
      await markBackupUsed(q.id)
      if (!adminOverride) await markChangeQUsed()
      await loadQuestion(level, q, row?.title ?? '')
      onClose()
    } catch (err) {
      console.error(err)
      alert('Failed: ' + err.message)
      setSelecting(null)
    }
  }

  const available = backups.filter(q => !q.used)
  const used      = backups.filter(q =>  q.used)

  const borderColor  = adminOverride ? 'border-red-600/40'  : 'border-gold-600/30'
  const headingColor = adminOverride ? 'text-red-400'       : 'text-gold-400'
  const heading      = adminOverride
    ? `⚙️ Admin Override — Level ${level} प्रश्न बदलें`
    : `🔄 बैकअप प्रश्न — Level ${level} के लिए`
  const subtext      = adminOverride
    ? 'यह लाइफलाइन उपयोग नहीं होगी — केवल प्रश्न बदलेगा।'
    : 'ये प्रश्न सभी सेट के लिए उपलब्ध हैं। एक बार उपयोग होने पर हाइलाइट होंगे।'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className={`bg-navy-800 border ${borderColor} rounded-2xl p-5 w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl`}>

        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className={`${headingColor} font-bold text-lg font-devanagari`}>
            {heading}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
        </div>
        <p className="text-gray-500 text-xs mb-4">{subtext}</p>

        <div className="overflow-y-auto flex-1 space-y-2 pr-1">
          {loading && (
            <p className="text-gray-400 text-sm text-center py-4 animate-pulse">लोड हो रहा है…</p>
          )}

          {!loading && available.length === 0 && used.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">कोई बैकअप प्रश्न उपलब्ध नहीं।</p>
          )}

          {/* Available backups */}
          {available.map(q => (
            <QuestionCard
              key={q.id}
              q={q}
              selecting={selecting}
              onSelect={handleSelect}
            />
          ))}

          {/* Used backups — amber warning, still selectable */}
          {used.length > 0 && (
            <>
              <p className="text-xs text-gray-600 uppercase tracking-widest pt-2 pb-1 border-t border-white/5">
                पहले उपयोग हो चुके ({used.length})
              </p>
              {used.map(q => (
                <QuestionCard
                  key={q.id}
                  q={q}
                  selecting={selecting}
                  onSelect={handleSelect}
                  wasUsed
                />
              ))}
            </>
          )}
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

// ── Sub-component: one question card (available or previously-used) ──────────
function QuestionCard({ q, selecting, onSelect, wasUsed = false }) {
  return (
    <button
      onClick={() => onSelect(q)}
      disabled={!!selecting}
      className={`w-full text-left rounded-xl px-4 py-3 border transition-all disabled:opacity-60
        ${wasUsed
          ? 'bg-amber-950/30 border-amber-600/40 hover:bg-amber-900/40 hover:border-amber-500/60'
          : 'bg-navy-900 border-white/10 hover:bg-navy-700 hover:border-gold-500/40'
        }`}
    >
      {/* Used warning banner */}
      {wasUsed && (
        <div className="flex items-center gap-2 mb-2 bg-amber-900/40 border border-amber-600/30 rounded-lg px-2 py-1">
          <span className="text-amber-400 text-sm">⚠️</span>
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
            पहले उपयोग हो चुका है — फिर भी चुन सकते हैं
          </span>
        </div>
      )}

      <p className={`font-devanagari text-sm leading-relaxed mb-2 ${wasUsed ? 'text-amber-100/80' : 'text-white'}`}>
        {q.text}
      </p>

      <div className="grid grid-cols-2 gap-1">
        {['A','B','C','D'].map(opt => (
          <span key={opt} className={`text-[11px] font-devanagari ${wasUsed ? 'text-amber-200/60' : 'text-gray-400'}`}>
            <strong className={`mr-1 ${wasUsed ? 'text-amber-300/80' : 'text-gray-300'}`}>{opt}.</strong>
            {q[`option${opt}`]}
          </span>
        ))}
      </div>

      {selecting === q.id && (
        <p className="text-gold-400 text-xs mt-2 animate-pulse">लोड हो रहा है…</p>
      )}
    </button>
  )
}
