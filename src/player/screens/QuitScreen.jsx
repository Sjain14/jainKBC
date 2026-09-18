import { motion } from 'framer-motion'

export default function QuitScreen({ gameState }) {
  const { contestantName, safeHavenTitle, currentLevel } = gameState

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      {/* Orange glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_40%,_#2d1600_0%,_#020818_80%)] pointer-events-none" />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-8xl">🚪</div>

        <h1 className="text-4xl sm:text-6xl font-bold text-orange-400 font-devanagari">
          खेल छोड़ा
        </h1>

        {contestantName && (
          <p className="text-xl text-gray-300 font-devanagari">
            {contestantName}
          </p>
        )}

        <div className="bg-navy-800/80 border border-orange-800/30 rounded-2xl px-8 py-5 mt-2">
          {safeHavenTitle ? (
            <>
              <p className="text-gray-400 text-sm mb-2 font-devanagari">Safe Haven स्तर प्राप्त</p>
              <p className="text-4xl font-bold text-gold-400 font-devanagari">{safeHavenTitle}</p>
            </>
          ) : (
            <p className="text-gray-400 text-sm font-devanagari">कोई Safe Haven नहीं था</p>
          )}
        </div>

        <p className="text-gray-600 text-sm font-devanagari mt-2">
          Level {currentLevel} से quit किया
        </p>

        <p className="text-gold-600/60 text-sm font-devanagari mt-6 italic">
          "साहस से खेले — धर्म से जिए"
        </p>
      </motion.div>
    </div>
  )
}
