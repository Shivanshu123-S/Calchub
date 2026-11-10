import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types'

interface AuthState {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isLoading: true,
      setUser:    (user)    => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      reset: () => set({ user: null, profile: null, isLoading: false }),
    }),
    {
      name: 'calchub-auth',
      partialize: (state) => ({ profile: state.profile }),
    }
  )
)

// ── Computed selectors ─────────────────────────
export const useIsAdmin = () =>
  useAuthStore(s => s.profile?.role === 'admin')

export const useIsPro = () =>
  useAuthStore(s => ['pro', 'lifetime'].includes(s.profile?.plan ?? 'free'))

export const useUserPlan = () =>
  useAuthStore(s => s.profile?.plan ?? 'free')
