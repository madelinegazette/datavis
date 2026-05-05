import { useState } from 'react'
import { TripLogger } from './TripLogger'

export function QuickLogFAB() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-dracula-green text-dracula-bg text-2xl shadow-lg shadow-dracula-green/30 flex items-center justify-center active:scale-95 transition-transform"
        title="Log trip"
      >
        ✍️
      </button>
      <TripLogger open={open} onClose={() => setOpen(false)} />
    </>
  )
}
