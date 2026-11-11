import { Calculator } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <Calculator className="w-8 h-8 text-acc animate-pulse mx-auto mb-3" />
        <p className="text-sm text-mu font-mono">Loading…</p>
      </div>
    </div>
  )
}
