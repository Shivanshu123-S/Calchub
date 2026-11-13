'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff, Check } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const schema = z.object({
  password: z.string().min(8, 'Min 8 characters'),
  confirm:  z.string(),
}).refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })
type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const { updatePassword } = useAuth()
  const [showPass, setShowPass] = useState(false)
  const [done, setDone] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    try {
      await updatePassword(data.password)
      setDone(true)
      setTimeout(() => router.push('/user/dashboard'), 2000)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reset password')
    }
  }

  if (done) return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="card max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-full bg-success/15 border border-success/30
                        flex items-center justify-center mx-auto mb-4">
          <Check className="w-7 h-7 text-success" />
        </div>
        <h2 className="font-sans font-extrabold text-xl mb-2">Password Updated!</h2>
        <p className="text-sm text-mu">Redirecting to dashboard…</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="card max-w-sm w-full shadow-lg">
        <h1 className="text-xl font-sans font-extrabold mb-1">Set New Password</h1>
        <p className="text-sm text-mu mb-6">Choose a strong password for your account.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="field-label">New password</label>
            <div className="relative">
              <input {...register('password')} type={showPass ? 'text' : 'password'}
                placeholder="Min 8 characters" className="field-input pr-10" />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mu hover:text-tx">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="field-label">Confirm password</label>
            <input {...register('confirm')} type="password"
              placeholder="Re-enter password" className="field-input" />
            {errors.confirm && <p className="text-xs text-danger mt-1">{errors.confirm.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
