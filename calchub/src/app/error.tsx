'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-5 text-center">
      <div className="card max-w-md w-full">
        <AlertTriangle className="w-10 h-10 text-danger mx-auto mb-4" />
        <h2 className="text-xl font-sans font-extrabold mb-2">Something went wrong</h2>
        <p className="text-sm text-mu mb-6">{error.message || 'An unexpected error occurred.'}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary">Try Again</button>
          <a href="/" className="btn-secondary">Go Home</a>
        </div>
      </div>
    </div>
  )
}
