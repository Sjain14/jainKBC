import { motion } from 'framer-motion'

export default function GameOverScreen({ gameState }) {
  const { contestantName, safeHavenTitle, currentLevel } = gameState

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      {/* Red glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_40%,_#3b0000_0%,_#020818_80%)] pointer-events-none" />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
      >
        <div className="text-8xl">❌</div>

        <h1 className="text-4xl sm:text-6xl font-bold text-red-400 font-devanagari">
          गलत उत्तर!
        </h1>

        {contestantName && (
          <p className="text-xl text-gray-300 font-devanagari">
            {contestantName} — खेल समाप्त
          </p>
        )}

        <div className="bg-navy-800/80 border border-white/10 rounded-2xl px-8 py-5 mt-2">
          {safeHavenTitle ? (
            <>
              <p className="text-gray-400 text-sm mb-2 font-devanagari">आपका Safe Haven स्तर</p>
              <p className="text-3xl font-bold text-gold-400 font-devanagari">{safeHavenTitle}</p>
              <p className="text-xs text-gray-500 mt-1">आप इस स्तर तक पहुँचे थे</p>
            </>
          ) : (
            <p className="text-gray-400 text-sm font-devanagari">कोई Safe Haven नहीं था</p>
          )}
        </div>

        <p className="text-gray-600 text-sm font-devanagari mt-4">
          Level {currentLevel} तक पहुँचे
        </p>
      </motion.div>
    </div>
  )
}
