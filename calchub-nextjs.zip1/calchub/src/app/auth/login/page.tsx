'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, Calculator } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const schema = z.object({
  email:    z.string().email('Valid email required'),
  password: z.string().min(6, 'Min 6 characters'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router       = useRouter()
  const params       = useSearchParams()
  const redirect     = params.get('redirect') || '/user/dashboard'
  const { login, loginWithOAuth } = useAuth()
  const [showPass, setShowPass]   = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    try {
      await login(data.email, data.password)
      toast.success('Welcome back!')
      router.push(redirect)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed')
    }
  }

  async function handleOAuth(provider: 'google' | 'github') {
    setOauthLoading(provider)
    try { await loginWithOAuth(provider) }
    catch (err) { toast.error(err instanceof Error ? err.message : 'OAuth failed') }
    finally { setOauthLoading(null) }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px]
                        bg-acc/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Calculator className="w-7 h-7 text-acc" />
            <span className="text-2xl font-sans font-extrabold gradient-text">CalcHub</span>
          </div>
          <p className="text-mu text-sm">Every Calculator. One Place.</p>
        </div>

        {/* Card */}
        <div className="card border-b1 shadow-lg">
          <h1 className="text-xl font-sans font-extrabold mb-1">Welcome back</h1>
          <p className="text-sm text-mu mb-6">Login to your CalcHub account</p>

          {/* OAuth buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(['google', 'github'] as const).map(p => (
              <button
                key={p}
                onClick={() => handleOAuth(p)}
                disabled={!!oauthLoading}
                className="btn-secondary text-sm py-2.5 capitalize disabled:opacity-50"
              >
                {oauthLoading === p
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <span>{p === 'google' ? '🌐' : '🐙'}</span>
                }
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-b1" />
            <span className="text-xs text-mu font-mono">or continue with email</span>
            <div className="flex-1 h-px bg-b1" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="field-label">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className={cn('field-input', errors.email && 'border-danger')}
                autoComplete="email"
              />
              {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="field-label mb-0">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-acc hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={cn('field-input pr-10', errors.password && 'border-danger')}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mu hover:text-tx"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-sm"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isSubmitting ? 'Logging in…' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-mu mt-5">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-acc hover:underline font-semibold">
              Register free
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-mu mt-4">
          <Link href="/" className="hover:text-tx">← Back to CalcHub</Link>
        </p>
      </div>
    </div>
  )
}
