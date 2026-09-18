import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { shareGame, openWhatsAppShare, copyShareText, SHARE_DATA } from '../../utils/shareUtils.js'

export default function ShareModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleNativeShare = async () => {
    await shareGame()
  }

  const handleCopy = async () => {
    const success = await copyShareText()
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
        {/* Backdrop click to close */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal content */}
        <motion.div
          className="relative z-10 w-full max-w-md bg-navy-900 border border-gold-500/40 rounded-3xl p-6 text-center shadow-2xl shadow-gold-500/10 overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <h3 className="text-gold-400 font-bold font-devanagari text-lg">
                शेयर करें (Share Quiz)
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>

          {/* QR Code & Logo preview */}
          <div className="flex flex-col items-center bg-navy-950/80 border border-gold-500/20 rounded-2xl p-4 mb-4">
            <div className="bg-white p-2.5 rounded-xl shadow-lg border border-gold-400/40 mb-2">
              <img
                src="/jainKBC_qr.svg"
                alt="Jain KBC QR Code"
                className="w-40 h-40 object-contain"
              />
            </div>
            <p className="text-gold-300 font-devanagari text-sm font-semibold">
              स्कैन करें और तुरंत खेलें!
            </p>
            <span className="text-[11px] text-gray-400 break-all font-mono mt-0.5">
              {SHARE_DATA.quizUrl}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5 mb-4">
            {/* Primary Phone Share Button */}
            <button
              onClick={handleNativeShare}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20 hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>फोन में शेयर करें (Share on Mobile)</span>
            </button>

            {/* Direct WhatsApp Button */}
            <button
              onClick={openWhatsAppShare}
              className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 active:scale-[0.98] transition-all"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>WhatsApp पर भेजें (WhatsApp Share)</span>
            </button>

            {/* Copy Link / Message */}
            <button
              onClick={handleCopy}
              className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium text-xs flex items-center justify-center gap-2 border border-white/10 transition-colors"
            >
              <span>{copied ? '✅ मैसेज कॉपी हो गया!' : '📋 पूरा मैसेज कॉपी करें (Copy Message)'}</span>
            </button>
          </div>

          {/* Linktree attribution & link */}
          <div className="pt-3 border-t border-white/10 text-left">
            <p className="text-[11px] text-gray-400 mb-1">
              माधवगंज परिवार सोशल मीडिया:
            </p>
            <a
              href={SHARE_DATA.linktreeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gold-400 hover:text-gold-300 underline flex items-center gap-1.5"
            >
              <span>🔗 {SHARE_DATA.linktreeUrl}</span>
              <span className="text-[10px] text-gray-500">(Instagram, Facebook)</span>
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
