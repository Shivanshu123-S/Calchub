'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth'
import { toast } from 'sonner'

export function useAuth() {
  const router = useRouter()
  const supabase = createClient()
  const { user, profile, isLoading, setUser, setProfile, setLoading, reset } = useAuthStore()

  // ── Bootstrap session on mount ──────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setProfile(data)
        } else {
          setProfile(null)
        }
        setLoading(false)
        if (event === 'SIGNED_OUT') router.push('/auth/login')
      }
    )
    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line

  // ── Login ───────────────────────────────────
  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }

  // ── Register ────────────────────────────────
  async function register(email: string, password: string, fullName: string) {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw new Error(error.message)
  }

  // ── OAuth (Google, GitHub) ───────────────────
  async function loginWithOAuth(provider: 'google' | 'github') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw new Error(error.message)
  }

  // ── Logout ───────────────────────────────────
  async function logout() {
    await supabase.auth.signOut()
    reset()
    router.push('/')
    toast.success('Logged out successfully')
  }

  // ── Forgot password ──────────────────────────
  async function forgotPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) throw new Error(error.message)
  }

  // ── Update password ──────────────────────────
  async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw new Error(error.message)
  }

  // ── Update profile ───────────────────────────
  async function updateProfile(updates: Partial<{ full_name: string; avatar_url: string; preferences: Record<string, unknown> }>) {
    if (!user) return
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    setProfile(data)
    return data
  }

  return {
    user, profile, isLoading,
    isAdmin: profile?.role === 'admin',
    isPro:   ['pro', 'lifetime'].includes(profile?.plan ?? ''),
    login, register, loginWithOAuth, logout,
    forgotPassword, updatePassword, updateProfile,
  }
}
