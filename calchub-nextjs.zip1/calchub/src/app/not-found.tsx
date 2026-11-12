import Link from 'next/link'
import { Calculator } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-5 text-center">
      <div>
        <div className="text-7xl mb-6">🧮</div>
        <h1 className="text-4xl font-sans font-extrabold gradient-text mb-3">404</h1>
        <p className="text-tx font-sans font-bold text-lg mb-2">Page Not Found</p>
        <p className="text-mu text-sm mb-8 max-w-sm mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary">
            <Calculator className="w-4 h-4" /> Go to CalcHub
          </Link>
          <Link href="/user/dashboard" className="btn-secondary">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
