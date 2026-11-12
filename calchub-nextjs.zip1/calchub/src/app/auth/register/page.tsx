'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, Calculator, Check } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email:     z.string().email('Valid email required'),
  password:  z.string().min(8, 'Min 8 characters'),
  confirm:   z.string(),
}).refine(d => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
})
type FormData = z.infer<typeof schema>

const PERKS = [
  'Save unlimited calculation history',
  'Favourite calculators for quick access',
  'AI Solver with full context',
  'Export results as PDF',
]

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser, loginWithOAuth } = useAuth()
  const [showPass, setShowPass] = useState(false)
  const [done, setDone]         = useState(false)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const password = watch('password', '')
  const strength = !password ? 0
    : [/.{8,}/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(r => r.test(password)).length

  async function onSubmit(data: FormData) {
    try {
      await registerUser(data.email, data.password, data.full_name)
      setDone(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed')
    }
  }

  if (done) return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center card">
        <div className="w-14 h-14 rounded-full bg-success/15 border border-success/30
                        flex items-center justify-center mx-auto mb-4">
          <Check className="w-7 h-7 text-success" />
        </div>
        <h2 className="text-xl font-sans font-extrabold mb-2">Check your email</h2>
        <p className="text-sm text-mu mb-6">
          We sent a confirmation link to your email. Click it to activate your account.
        </p>
        <Link href="/auth/login" className="btn-primary w-full justify-center">
          Go to Login
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px]
                        bg-acc2/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-4xl relative z-10 grid lg:grid-cols-2 gap-8 items-center">

        {/* Left — perks */}
        <div className="hidden lg:block">
          <div className="inline-flex items-center gap-2 mb-4">
            <Calculator className="w-7 h-7 text-acc" />
            <span className="text-2xl font-sans font-extrabold gradient-text">CalcHub</span>
          </div>
          <h2 className="text-3xl font-sans font-extrabold mb-3 leading-tight">
            Your free account includes everything
          </h2>
          <p className="text-mu text-sm mb-8">
            318+ calculators, AI Solver, history & more — all free.
          </p>
          <ul className="space-y-3">
            {PERKS.map(p => (
              <li key={p} className="flex items-center gap-3 text-sm">
                <span className="w-5 h-5 rounded-full bg-success/15 border border-success/30
                                 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-success" />
                </span>
                <span className="text-tx">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — form */}
        <div className="card shadow-lg">
          <h1 className="text-xl font-sans font-extrabold mb-1">Create account</h1>
          <p className="text-sm text-mu mb-6">Free forever. No credit card.</p>

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(['google', 'github'] as const).map(p => (
              <button key={p} onClick={() => loginWithOAuth(p)}
                className="btn-secondary text-sm py-2.5 capitalize">
                <span>{p === 'google' ? '🌐' : '🐙'}</span>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-b1" />
            <span className="text-xs text-mu font-mono">or with email</span>
            <div className="flex-1 h-px bg-b1" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="field-label">Full name</label>
              <input {...register('full_name')} placeholder="Raj Kumar"
                className={cn('field-input', errors.full_name && 'border-danger')} />
              {errors.full_name && <p className="mt-1 text-xs text-danger">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="field-label">Email</label>
              <input {...register('email')} type="email" placeholder="you@example.com"
                className={cn('field-input', errors.email && 'border-danger')} />
              {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
            </div>

            <div>
              <label className="field-label">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPass ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  className={cn('field-input pr-10', errors.password && 'border-danger')} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mu hover:text-tx">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {password && (
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={cn(
                      'h-1 flex-1 rounded-full transition-all duration-300',
                      i <= strength
                        ? strength <= 1 ? 'bg-danger'
                          : strength <= 2 ? 'bg-warn'
                          : strength <= 3 ? 'bg-acc'
                          : 'bg-success'
                        : 'bg-b2'
                    )} />
                  ))}
                  <span className="text-xs text-mu ml-1">
                    {['', 'Weak', 'Fair', 'Good', 'Strong'][strength]}
                  </span>
                </div>
              )}
              {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
            </div>

            <div>
              <label className="field-label">Confirm password</label>
              <input {...register('confirm')} type="password" placeholder="Re-enter password"
                className={cn('field-input', errors.confirm && 'border-danger')} />
              {errors.confirm && <p className="mt-1 text-xs text-danger">{errors.confirm.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-sm">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Creating account…' : 'Create free account'}
            </button>
          </form>

          <p className="text-center text-sm text-mu mt-5">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-acc hover:underline font-semibold">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
