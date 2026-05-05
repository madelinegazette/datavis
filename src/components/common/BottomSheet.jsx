import { useEffect } from 'react'

export function BottomSheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="relative bg-dracula-bgDark border-t border-dracula-line rounded-t-2xl animate-slide-up max-h-[90vh] flex flex-col safe-bottom">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-dracula-line rounded-full" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-dracula-line flex-shrink-0">
            <h2 className="text-dracula-fg font-semibold text-lg">{title}</h2>
            <button onClick={onClose} className="text-dracula-comment hover:text-dracula-fg text-2xl leading-none">×</button>
          </div>
        )}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}
