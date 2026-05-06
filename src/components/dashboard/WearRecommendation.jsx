export function WearRecommendation({ items }) {
  if (!items || items.length === 0) return null

  return (
    <div className="px-4 py-3 border-b border-dracula-line">
      <div className="text-xs font-mono uppercase tracking-[0.15em] text-dracula-comment mb-2">
        Bring
      </div>
      <div className="flex flex-col gap-1">
        {items.map((item, i) => (
          <div
            key={i}
            className={`text-xs font-mono ${item.urgent ? 'text-dracula-red' : 'text-dracula-fg'}`}
          >
            — {item.text}
          </div>
        ))}
      </div>
    </div>
  )
}
