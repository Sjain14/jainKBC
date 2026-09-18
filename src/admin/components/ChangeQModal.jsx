/**
 * ChangeQModal.jsx — popup to swap current question with a level-matched backup.
 *
 * Used in two contexts:
 *   1. Lifeline "Change the Question" — contestant's lifeline, marks lifelineChangeQUsed
 *   2. Admin Override (host-only)     — silent swap, does NOT consume the lifeline
 *
 * Props:
 *   level         — current game level (1-7)
 *   gameState     — full game state object
 *   onClose       — callback to close modal
 *   adminOverride — if true: skips markChangeQUsed(), shows red heading
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
    if (q.used) return
    setSelecting(q.id)
    try {
      const row = PRIZE_LADDER.find(r => r.level === level)
      await markBackupUsed(q.id)
      if (!adminOverride) await markChangeQUsed()  // lifeline used; admin override leaves it intact
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

  const borderColor = adminOverride ? 'border-red-600/40'  : 'border-gold-600/30'
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
            <button
              key={q.id}
              onClick={() => handleSelect(q)}
              disabled={!!selecting}
              className="w-full text-left bg-navy-900 hover:bg-navy-700 border border-white/10
                         hover:border-gold-500/40 rounded-xl px-4 py-3 transition-all disabled:opacity-50"
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

          {/* Used backups — shown dimmed for host reference */}
          {used.length > 0 && (
            <>
              <p className="text-xs text-gray-600 uppercase tracking-widest pt-2 pb-1 border-t border-white/5">
                पहले उपयोग हो चुके ({used.length})
              </p>
              {used.map(q => (
                <div
                  key={q.id}
                  className="w-full text-left bg-navy-900/40 border border-white/5 rounded-xl px-4 py-3 opacity-50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] bg-gray-700 text-gray-400 px-2 py-0.5 rounded uppercase tracking-wide">Used</span>
                  </div>
                  <p className="text-gray-500 font-devanagari text-sm line-through leading-relaxed">{q.text}</p>
                </div>
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
