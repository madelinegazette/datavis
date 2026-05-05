export function ErrorBanner({ message, onDismiss }) {
  if (!message) return null
  return (
    <div className="flex items-center gap-3 bg-dracula-red/10 border border-dracula-red/40 rounded-lg px-4 py-3 text-sm text-dracula-red">
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="text-dracula-red/60 hover:text-dracula-red text-lg leading-none">×</button>
      )}
    </div>
  )
}
