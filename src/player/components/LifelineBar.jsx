export default function LifelineBar({ audienceUsed, changeQUsed, expertUsed }) {
  const lifelines = [
    { icon: '📊', label: 'Audience',  used: audienceUsed },
    { icon: '🔄', label: 'Change Q',  used: changeQUsed  },
    { icon: '🧑‍🏫', label: 'Expert',   used: expertUsed   },
  ]

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-8">
      {lifelines.map(ll => (
        <div
          key={ll.label}
          className={`flex flex-col items-center gap-1 transition-all duration-300
            ${ll.used ? 'opacity-25 grayscale' : 'opacity-100'}`}
        >
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-2xl
            border-2 transition-all
            ${ll.used
              ? 'border-gray-700 bg-gray-800/40'
              : 'border-gold-600/50 bg-navy-800/60 shadow-gold-sm'}`}>
            {ll.icon}
          </div>
          <span className="text-[10px] text-gray-500 uppercase tracking-wide">{ll.label}</span>
        </div>
      ))}
    </div>
  )
}
