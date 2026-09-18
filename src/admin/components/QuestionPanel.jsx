const LABELS = ['A', 'B', 'C', 'D']
const OPTION_KEYS = ['optionA', 'optionB', 'optionC', 'optionD']

const STATE_COLORS = {
  selected: 'border-yellow-400 bg-yellow-500/10 text-yellow-200',
  correct:  'border-green-400 bg-green-500/10 text-green-200',
  wrong:    'border-red-400 bg-red-500/10 text-red-200',
  idle:     'border-white/10 text-gray-300 hover:border-white/20',
}

export default function QuestionPanel({ gameState }) {
  const {
    phase, questionText, optionA, optionB, optionC, optionD,
    selectedOption, correctOption, showCorrectAnswer, currentLevel,
    currentLevelTitle,
  } = gameState

  if (phase === 'idle' || !questionText) {
    return (
      <div className="bg-navy-800/60 border border-white/5 rounded-xl p-6 text-center text-gray-500 text-sm">
        प्रश्न लोड नहीं हुआ — नीचे "Load Question" दबाएँ
      </div>
    )
  }

  const options = [optionA, optionB, optionC, optionD]

  function getState(label) {
    if (showCorrectAnswer) {
      if (label === correctOption) return 'correct'
      if (label === selectedOption && label !== correctOption) return 'wrong'
    } else if (label === selectedOption) {
      return 'selected'
    }
    return 'idle'
  }

  return (
    <div className="bg-navy-800/60 border border-white/5 rounded-xl p-4 space-y-4">
      {/* Level badge + title */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-gray-500">
          Level {currentLevel}
        </span>
        <span className="text-xs font-bold text-gold-400 font-devanagari">{currentLevelTitle}</span>
      </div>

      {/* Question text */}
      <p className="text-white font-devanagari text-base leading-relaxed bg-navy-900/60 rounded-lg px-4 py-3 border border-white/5">
        {questionText}
      </p>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt, i) => {
          const label = LABELS[i]
          const state = getState(label)
          return (
            <div
              key={label}
              className={`flex items-start gap-2 px-3 py-2 rounded-lg border text-sm transition-all
                ${STATE_COLORS[state]}`}
            >
              <span className="font-bold text-xs w-4 shrink-0 mt-0.5">{label}.</span>
              <span className="font-devanagari leading-snug">{opt}</span>
            </div>
          )
        })}
      </div>

      {/* Correct answer reveal */}
      {showCorrectAnswer && (
        <div className="text-xs text-green-400 bg-green-900/20 border border-green-800/30 rounded px-3 py-1.5 text-center">
          ✓ सही उत्तर: <strong>{correctOption}</strong>
        </div>
      )}

      {/* Keyboard hint */}
      <p className="text-[10px] text-gray-600 text-center">
        Keyboard: <kbd className="bg-white/10 rounded px-1">1</kbd>
        <kbd className="bg-white/10 rounded px-1 ml-1">2</kbd>
        <kbd className="bg-white/10 rounded px-1 ml-1">3</kbd>
        <kbd className="bg-white/10 rounded px-1 ml-1">4</kbd>
        &nbsp;= A B C D &nbsp;|&nbsp;
        <kbd className="bg-white/10 rounded px-1">R</kbd> = Reveal
      </p>
    </div>
  )
}
