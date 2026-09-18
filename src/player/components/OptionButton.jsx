import { motion } from 'framer-motion'

const STATE_CLASSES = {
  idle:     'bg-[#0d2260] border-gold-600/30 text-white hover:bg-[#1a3580]',
  selected: 'bg-yellow-600/80 border-yellow-400 text-white shadow-[0_0_20px_rgba(217,119,6,0.5)]',
  correct:  'bg-green-700/80 border-green-400 text-white shadow-[0_0_20px_rgba(21,128,61,0.6)]',
  wrong:    'bg-red-800/80 border-red-400 text-white shadow-[0_0_20px_rgba(185,28,28,0.5)]',
}

const LABEL_CLASSES = {
  idle:     'bg-gold-600/20 text-gold-400 border-gold-600/30',
  selected: 'bg-yellow-500/30 text-yellow-200 border-yellow-500/50',
  correct:  'bg-green-600/30 text-green-200 border-green-500/50',
  wrong:    'bg-red-700/30 text-red-200 border-red-500/50',
}

export default function OptionButton({ label, text, state = 'idle' }) {
  return (
    <motion.div
      className={`relative flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4
        rounded-xl border-2 transition-colors duration-300 cursor-default select-none
        ${STATE_CLASSES[state]}`}
      initial={{ opacity: 0, x: label === 'A' || label === 'C' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      key={`${label}-${state}`}
      layout
    >
      {/* Label badge */}
      <span className={`shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center
        text-sm font-bold font-sans ${LABEL_CLASSES[state]}`}>
        {label}
      </span>

      {/* Option text */}
      <span className="font-devanagari text-sm sm:text-base leading-snug flex-1">
        {text}
      </span>

      {/* State icon */}
      {state === 'correct' && (
        <motion.span
          className="shrink-0 text-green-300 text-xl"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.6 }}
        >✓</motion.span>
      )}
      {state === 'wrong' && (
        <motion.span
          className="shrink-0 text-red-300 text-xl"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.6 }}
        >✗</motion.span>
      )}
    </motion.div>
  )
}
