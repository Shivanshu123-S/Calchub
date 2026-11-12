'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const schema = z.object({ email: z.string().email('Valid email required') })
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    try {
      await forgotPassword(data.email)
      setSent(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reset email')
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="card shadow-lg">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-acc/10 border border-acc/20
                              flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-acc" />
              </div>
              <h2 className="text-xl font-sans font-extrabold mb-2">Check your inbox</h2>
              <p className="text-sm text-mu mb-6">
                If that email is registered, you&apos;ll receive a password reset link shortly.
              </p>
              <Link href="/auth/login" className="btn-primary w-full justify-center">
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-sm text-mu hover:text-tx mb-5">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </Link>
              <h1 className="text-xl font-sans font-extrabold mb-1">Forgot password?</h1>
              <p className="text-sm text-mu mb-6">Enter your email and we&apos;ll send a reset link.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="field-label">Email</label>
                  <input {...register('email')} type="email" placeholder="you@example.com"
                    className={`field-input ${errors.email ? 'border-danger' : ''}`} />
                  {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-sm">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
