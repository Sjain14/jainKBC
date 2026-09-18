import { useState } from 'react'
import { motion } from 'framer-motion'
import ShareModal from '../components/ShareModal.jsx'
import { shareGame, openWhatsAppShare, SHARE_DATA } from '../../utils/shareUtils.js'

export default function IdleScreen() {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  const handleShareClick = async () => {
    await shareGame()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 text-center relative z-10 max-w-4xl mx-auto">
      {/* Top ambient glow */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #c9a84c 0%, transparent 70%)' }}
        animate={{ opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Main Logo */}
      <motion.div
        className="mb-4 relative"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, type: 'spring' }}
      >
        <div className="relative inline-block">
          {/* Subtle glow behind logo */}
          <div className="absolute inset-0 bg-gold-500/20 rounded-full blur-xl filter" />
          <img
            src="/jainKBC_logo.png"
            alt="Jain KBC Logo"
            className="w-28 h-28 sm:w-36 sm:h-36 object-contain relative drop-shadow-[0_0_25px_rgba(201,168,76,0.5)] mx-auto"
          />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-3xl sm:text-5xl md:text-6xl font-bold text-gold-400 font-devanagari leading-tight mb-2 drop-shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
      >
        कौन बनेगा ज्ञानवान
      </motion.h1>

      <motion.p
        className="text-gold-500 text-base sm:text-xl font-devanagari mb-1 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        माधवगंज परिवार दशलक्षण महापर्व
      </motion.p>

      <motion.p
        className="text-gray-400 text-xs sm:text-sm mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Host: Sahaj Jain
      </motion.p>

      {/* Tagline Box */}
      <motion.div
        className="bg-gold-500/10 border border-gold-500/30 rounded-2xl px-6 sm:px-8 py-3.5 mb-6 max-w-md w-full backdrop-blur-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-gold-300 text-lg sm:text-2xl font-bold font-devanagari">
          बनें ज्ञानवान!
        </p>
        <p className="text-gray-300 text-xs sm:text-sm mt-1">7 स्तर · 3 Lifelines · दशलक्षण पर आधारित</p>
      </motion.div>

      {/* Waiting indicator */}
      <motion.div
        className="flex items-center gap-2 text-gray-400 text-sm mb-8 bg-navy-900/60 px-4 py-1.5 rounded-full border border-white/5"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
        खेल शुरू होने की प्रतीक्षा में…
      </motion.div>

      {/* ── QR CODE & SHARE SECTION ── */}
      <motion.div
        className="w-full max-w-sm bg-navy-900/90 border border-gold-500/30 rounded-3xl p-5 shadow-2xl shadow-gold-500/10 flex flex-col items-center backdrop-blur-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <p className="text-gold-300 font-devanagari font-semibold text-sm sm:text-base mb-3 flex items-center gap-1.5">
          <span>📲</span>
          <span>अपने फोन से खेलें — QR स्कैन करें</span>
        </p>

        {/* QR Code image */}
        <div className="bg-white p-3 rounded-2xl shadow-md border-2 border-gold-400/40 hover:scale-105 transition-transform duration-300 mb-3 cursor-pointer"
             onClick={() => setIsShareModalOpen(true)}
             title="क्लिक करके बड़ा करें या शेयर करें"
        >
          <img
            src="/jainKBC_qr.svg"
            alt="Jain KBC QR Code"
            className="w-36 h-36 sm:w-44 sm:h-44 object-contain"
          />
        </div>

        <p className="text-[11px] text-gray-400 font-mono mb-4 break-all select-all">
          {SHARE_DATA.quizUrl}
        </p>

        {/* Share Action Buttons */}
        <div className="w-full grid grid-cols-2 gap-2 mb-3">
          {/* Native phone share button */}
          <button
            onClick={handleShareClick}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-gold-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>शेयर करें</span>
          </button>

          {/* WhatsApp Direct Share */}
          <button
            onClick={openWhatsAppShare}
            className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-green-600/20 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            <span>WhatsApp</span>
          </button>
        </div>

        {/* Linktree attribution & link */}
        <a
          href={SHARE_DATA.linktreeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gold-400 hover:text-gold-300 underline font-devanagari flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity"
        >
          <span>🔗 माधवगंज परिवार सोशल मीडिया (Linktree)</span>
        </a>
      </motion.div>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  )
}
