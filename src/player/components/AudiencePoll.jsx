import { motion } from 'framer-motion'

const LABELS = ['A', 'B', 'C', 'D']
const BAR_COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444']

export default function AudiencePoll({ pollA, pollB, pollC, pollD }) {
  const values = [pollA, pollB, pollC, pollD]

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-end justify-center pb-8 px-4
                 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-full max-w-lg bg-navy-800/95 border border-blue-800/40 rounded-2xl p-6 shadow-2xl"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.3 }}
      >
        <h3 className="text-center text-blue-300 font-bold text-lg mb-5 font-devanagari">
          📊 दर्शक सहायता
        </h3>

        <div className="space-y-3">
          {LABELS.map((lbl, i) => (
            <div key={lbl} className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-300 w-5 shrink-0">{lbl}</span>
              <div className="flex-1 bg-navy-900/60 rounded-full h-7 overflow-hidden">
                <motion.div
                  className="h-full rounded-full flex items-center justify-end pr-3"
                  style={{ backgroundColor: BAR_COLORS[i] + '99' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${values[i]}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                >
                  <span className="text-xs font-bold text-white">{values[i]}%</span>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
