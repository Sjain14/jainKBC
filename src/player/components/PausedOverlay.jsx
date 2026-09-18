import { motion } from 'framer-motion'

export default function PausedOverlay() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/70 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="flex flex-col items-center gap-4"
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-6xl">⏸</span>
        <p className="text-gold-400 text-2xl font-bold font-devanagari">खेल रोका गया</p>
        <p className="text-gray-500 text-sm">Host द्वारा pause किया गया है…</p>
      </motion.div>
    </motion.div>
  )
}
