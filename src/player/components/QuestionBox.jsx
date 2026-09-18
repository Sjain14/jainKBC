import { motion } from 'framer-motion'

export default function QuestionBox({ text, level: _level }) {
  return (
    <motion.div
      className="w-full bg-navy-800/70 border border-gold-600/30 rounded-2xl px-5 py-5 sm:px-8 sm:py-6 kbc-glow"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      key={text}
    >
      {/* Decorative top line */}
      <div className="w-16 h-0.5 bg-gradient-to-r from-gold-500 to-transparent rounded mx-auto mb-4" />

      <p className="text-white font-devanagari text-lg sm:text-xl md:text-2xl leading-relaxed text-center">
        {text}
      </p>

      <div className="w-16 h-0.5 bg-gradient-to-l from-gold-500 to-transparent rounded mx-auto mt-4" />
    </motion.div>
  )
}
