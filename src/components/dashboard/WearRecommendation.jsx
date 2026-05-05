export function WearRecommendation({ items }) {
  if (!items || items.length === 0) return null

  return (
    <div className="px-4 py-3 border-b border-dracula-line">
      <div className="text-xs text-dracula-comment font-mono uppercase tracking-wider mb-2">
        What to bring
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border ${
              item.urgent
                ? 'bg-dracula-red/10 border-dracula-red/40 text-dracula-red'
                : 'bg-dracula-line/20 border-dracula-line text-dracula-fg'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.text}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
