import { motion } from 'framer-motion'

export default function ExpertOverlay({ message }) {
  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center px-4
                 bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-full max-w-lg bg-navy-800/95 border border-green-800/40 rounded-2xl p-6 shadow-2xl"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.35 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🧑‍🏫</span>
          <h3 className="text-green-300 font-bold text-lg font-devanagari">विशेषज्ञ की सलाह</h3>
        </div>
        <p className="text-white font-devanagari text-base leading-relaxed bg-navy-900/60 rounded-xl px-4 py-3">
          {message}
        </p>
      </motion.div>
    </motion.div>
  )
}
