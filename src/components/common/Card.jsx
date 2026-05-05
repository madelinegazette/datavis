export function Card({ children, className = '', onClick, accentColor }) {
  const base = 'bg-dracula-line/20 border border-dracula-line rounded-xl p-4 transition-all'
  const interactive = onClick ? 'cursor-pointer active:scale-[0.98] hover:border-dracula-comment' : ''
  const style = accentColor ? { borderLeftColor: accentColor, borderLeftWidth: 3 } : {}

  return (
    <div className={`${base} ${interactive} ${className}`} style={style} onClick={onClick}>
      {children}
    </div>
  )
}
