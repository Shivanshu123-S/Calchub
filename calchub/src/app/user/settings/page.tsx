'use client'

import { useState } from 'react'
import { UserLayout } from '@/components/layout/UserLayout'
import { useAuth } from '@/hooks/useAuth'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, User, Lock, Bell, Palette, Trash2 } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Min 2 characters'),
})
const passwordSchema = z.object({
  new_password: z.string().min(8, 'Min 8 characters'),
  confirm:      z.string(),
}).refine(d => d.new_password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })

type ProfileForm   = z.infer<typeof profileSchema>
type PasswordForm  = z.infer<typeof passwordSchema>

const TABS = ['Profile', 'Security', 'Notifications', 'Appearance'] as const
type Tab = typeof TABS[number]

export default function SettingsPage() {
  const { profile, updateProfile, updatePassword } = useAuth()
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('Profile')
  const [deleting, setDeleting] = useState(false)

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: profile?.full_name ?? '' },
  })

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

  async function onProfileSave(data: ProfileForm) {
    try {
      await updateProfile(data)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  async function onPasswordSave(data: PasswordForm) {
    try {
      await updatePassword(data.new_password)
      toast.success('Password updated!')
      passwordForm.reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password')
    }
  }

  async function deleteAccount() {
    if (!confirm('Are you sure? This cannot be undone.')) return
    setDeleting(true)
    try {
      await supabase.from('profiles').delete().eq('id', profile!.id)
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch {
      toast.error('Failed to delete account')
      setDeleting(false)
    }
  }

  return (
    <UserLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-sans font-extrabold mb-1">Settings</h1>
        <p className="text-sm text-mu">Manage your account preferences</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 border-b border-b1 overflow-x-auto no-scrollbar">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2.5 text-sm font-sans font-semibold whitespace-nowrap border-b-2 transition-all',
              tab === t
                ? 'border-acc text-acc'
                : 'border-transparent text-mu hover:text-tx'
            )}>
            {t}
          </button>
        ))}
      </div>

      <div className="max-w-xl">

        {/* ── Profile tab ── */}
        {tab === 'Profile' && (
          <div className="card space-y-5">
            <h2 className="font-sans font-extrabold flex items-center gap-2">
              <User className="w-4 h-4 text-acc" /> Profile Information
            </h2>

            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-acc to-acc2
                              flex items-center justify-center text-white text-xl font-bold">
                {getInitials(profile?.full_name ?? '')}
              </div>
              <div>
                <p className="text-sm font-sans font-semibold">{profile?.email}</p>
                <span className="badge badge-blue capitalize mt-1">{profile?.plan}</span>
              </div>
            </div>

            <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="space-y-4">
              <div>
                <label className="field-label">Full name</label>
                <input {...profileForm.register('full_name')} className="field-input" />
                {profileForm.formState.errors.full_name && (
                  <p className="text-xs text-danger mt-1">{profileForm.formState.errors.full_name.message}</p>
                )}
              </div>
              <div>
                <label className="field-label">Email</label>
                <input value={profile?.email ?? ''} disabled
                  className="field-input opacity-50 cursor-not-allowed" />
                <p className="text-xs text-mu mt-1">Email cannot be changed here.</p>
              </div>
              <button type="submit" disabled={profileForm.formState.isSubmitting} className="btn-primary">
                {profileForm.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Save changes
              </button>
            </form>

            <hr className="border-b1" />

            {/* Danger zone */}
            <div>
              <h3 className="text-sm font-sans font-bold text-danger mb-2 flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Danger Zone
              </h3>
              <p className="text-xs text-mu mb-3">Permanently delete your account and all data.</p>
              <button onClick={deleteAccount} disabled={deleting}
                className="btn-danger btn-sm">
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete my account
              </button>
            </div>
          </div>
        )}

        {/* ── Security tab ── */}
        {tab === 'Security' && (
          <div className="card space-y-5">
            <h2 className="font-sans font-extrabold flex items-center gap-2">
              <Lock className="w-4 h-4 text-acc" /> Change Password
            </h2>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSave)} className="space-y-4">
              <div>
                <label className="field-label">New password</label>
                <input {...passwordForm.register('new_password')} type="password"
                  placeholder="Min 8 characters" className="field-input" />
                {passwordForm.formState.errors.new_password && (
                  <p className="text-xs text-danger mt-1">{passwordForm.formState.errors.new_password.message}</p>
                )}
              </div>
              <div>
                <label className="field-label">Confirm new password</label>
                <input {...passwordForm.register('confirm')} type="password"
                  placeholder="Re-enter password" className="field-input" />
                {passwordForm.formState.errors.confirm && (
                  <p className="text-xs text-danger mt-1">{passwordForm.formState.errors.confirm.message}</p>
                )}
              </div>
              <button type="submit" disabled={passwordForm.formState.isSubmitting} className="btn-primary">
                {passwordForm.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Update password
              </button>
            </form>
          </div>
        )}

        {/* ── Notifications tab ── */}
        {tab === 'Notifications' && (
          <div className="card space-y-5">
            <h2 className="font-sans font-extrabold flex items-center gap-2">
              <Bell className="w-4 h-4 text-acc" /> Notification Preferences
            </h2>
            {[
              { key: 'notifications_email', label: 'Email notifications', desc: 'Receive updates and tips by email' },
              { key: 'notifications_push',  label: 'Push notifications',  desc: 'Browser push notifications' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-sans font-semibold">{label}</p>
                  <p className="text-xs text-mu">{desc}</p>
                </div>
                <button
                  onClick={async () => {
                    const val = !(profile?.preferences as Record<string, boolean>)[key]
                    await updateProfile({ preferences: { ...profile?.preferences, [key]: val } })
                    toast.success('Updated!')
                  }}
                  className={cn(
                    'relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0',
                    (profile?.preferences as Record<string, boolean>)?.[key]
                      ? 'bg-acc' : 'bg-b2'
                  )}
                >
                  <span className={cn(
                    'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200',
                    (profile?.preferences as Record<string, boolean>)?.[key] ? 'translate-x-5' : ''
                  )} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Appearance tab ── */}
        {tab === 'Appearance' && (
          <div className="card space-y-5">
            <h2 className="font-sans font-extrabold flex items-center gap-2">
              <Palette className="w-4 h-4 text-acc" /> Appearance
            </h2>
            <div>
              <label className="field-label mb-3">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {(['dark', 'light', 'system'] as const).map(t => (
                  <button key={t} onClick={() => updateProfile({ preferences: { ...profile?.preferences, theme: t } })}
                    className={cn(
                      'card py-3 text-sm font-sans font-semibold capitalize transition-all',
                      profile?.preferences?.theme === t ? 'border-acc text-acc' : 'text-mu hover:text-tx'
                    )}>
                    {t === 'dark' ? '🌙' : t === 'light' ? '☀️' : '💻'} {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  )
}
