import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

export default function WinnerScreen({ gameState }) {
  const { contestantName } = gameState
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    const end = Date.now() + 4000
    const colors = ['#c9a84c', '#f5d98b', '#ffffff', '#e8c05a', '#ffd700']

    ;(function frame() {
      confetti({ particleCount: 6, angle: 60,  spread: 55, origin: { x: 0 }, colors })
      confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 }, colors })
      if (Date.now() < end) requestAnimationFrame(frame)
    })()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      {/* Gold radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_40%,_#1a1000_0%,_#020818_80%)] pointer-events-none" />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-5"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
      >
        {/* Trophy */}
        <motion.div
          className="text-8xl sm:text-[120px]"
          animate={{ rotate: [-5, 5, -5], scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >🏆</motion.div>

        <motion.h1
          className="text-4xl sm:text-6xl font-bold text-gold-400 font-devanagari leading-tight"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          ज्ञानवान बने!
        </motion.h1>

        {contestantName && (
          <motion.p
            className="text-2xl sm:text-3xl text-white font-devanagari"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            🎉 {contestantName} 🎉
          </motion.p>
        )}

        {/* Title badge */}
        <motion.div
          className="mt-2 bg-gold-500/15 border-2 border-gold-500/50 rounded-3xl px-10 py-6 kbc-glow"
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, type: 'spring' }}
        >
          <p className="text-gray-400 text-sm font-devanagari mb-2">अर्जित उपाधि</p>
          <p className="text-5xl sm:text-6xl font-bold text-gold-300 font-devanagari">ज्ञानवान</p>
          <p className="text-gold-600 text-sm mt-2 font-devanagari">सर्वोच्च ज्ञान स्तर</p>
        </motion.div>

        <motion.p
          className="text-gold-600/70 text-base sm:text-lg font-devanagari mt-4 italic"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          "ज्ञान ही सबसे बड़ा धन है"
        </motion.p>
      </motion.div>
    </div>
  )
}
