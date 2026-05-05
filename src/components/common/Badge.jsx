export function Badge({ children, color = '#bd93f9', small = false }) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-mono font-medium ${small ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}`}
      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
    >
      {children}
    </span>
  )
}
