import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'

export default function IdleScreen({ gameState }) {
  const playUrl = typeof window !== 'undefined'
    ? window.location.origin + '/play'
    : '/play'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 text-center">
      {/* Top glow ring */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(ellipse, #c9a84c 0%, transparent 70%)' }}
        animate={{ opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Trophy icon */}
      <motion.div
        className="text-7xl sm:text-9xl mb-4"
        animate={{ scale: [1, 1.05, 1], rotate: [-2, 2, -2] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        🏆
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-3xl sm:text-5xl md:text-6xl font-bold text-gold-400 font-devanagari leading-tight mb-2"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
      >
        कौन बनेगा ज्ञानवान
      </motion.h1>

      <motion.p
        className="text-gold-600 text-base sm:text-xl font-devanagari mb-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        माधवगंज परिवार दशलक्षण महापर्व
      </motion.p>

      <motion.p
        className="text-gray-500 text-sm mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        Host: Sahaj Jain
      </motion.p>

      {/* Tagline */}
      <motion.div
        className="bg-gold-500/10 border border-gold-500/30 rounded-2xl px-8 py-4 mb-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9 }}
      >
        <p className="text-gold-300 text-lg sm:text-2xl font-bold font-devanagari">
          बनें ज्ञानवान!
        </p>
        <p className="text-gray-400 text-xs mt-1">7 स्तर · 3 Lifelines · दशलक्षण पर आधारित</p>
      </motion.div>

      {/* Waiting indicator */}
      <motion.div
        className="flex items-center gap-2 text-gray-500 text-sm"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
        खेल शुरू होने की प्रतीक्षा में…
      </motion.div>

      {/* QR code (small, bottom) */}
      <div className="mt-8 flex flex-col items-center gap-2 opacity-40 hover:opacity-80 transition-opacity">
        <QRCodeSVG value={playUrl} size={80} bgColor="transparent" fgColor="#c9a84c" />
        <p className="text-[10px] text-gray-600">{playUrl}</p>
      </div>
    </div>
  )
}
