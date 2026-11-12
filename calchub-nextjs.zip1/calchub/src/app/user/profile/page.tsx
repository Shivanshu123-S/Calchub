'use client'

import { UserLayout } from '@/components/layout/UserLayout'
import { useAuth } from '@/hooks/useAuth'
import { fmtDate, getInitials } from '@/lib/utils'
import { Calculator, Star, Clock, Zap, Mail, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { profile } = useAuth()

  const stats = [
    { label: 'Total Calculations', value: profile?.calc_count ?? 0, icon: Calculator },
    { label: 'Member Since',       value: profile?.created_at ? fmtDate(profile.created_at) : '—', icon: Calendar },
    { label: 'Current Plan',       value: profile?.plan ?? 'free', icon: Zap },
    { label: 'Role',               value: profile?.role ?? 'user',  icon: Star },
  ]

  return (
    <UserLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-sans font-extrabold mb-1">My Profile</h1>
        <p className="text-sm text-mu">Your CalcHub account overview</p>
      </div>

      <div className="max-w-2xl space-y-5">

        {/* Profile card */}
        <div className="card">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-acc to-acc2
                            flex items-center justify-center text-white text-2xl font-sans font-bold flex-shrink-0">
              {getInitials(profile?.full_name ?? profile?.email ?? '')}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-sans font-extrabold">{profile?.full_name ?? 'User'}</h2>
              <div className="flex items-center gap-1.5 text-sm text-mu mt-1">
                <Mail className="w-3.5 h-3.5" />
                {profile?.email}
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`badge capitalize ${profile?.plan === 'free' ? 'badge-gray' : 'badge-blue'}`}>
                  {profile?.plan} plan
                </span>
                <span className={`badge capitalize ${profile?.role === 'admin' ? 'badge-teal' : 'badge-gray'}`}>
                  {profile?.role}
                </span>
                {profile?.is_banned && <span className="badge badge-red">Banned</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="stat-card">
              <Icon className="w-4 h-4 text-acc mb-2" />
              <span className="text-lg font-sans font-extrabold capitalize gradient-text">{value}</span>
              <span className="stat-label">{label}</span>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="card space-y-2">
          <h3 className="font-sans font-extrabold mb-3">Quick Actions</h3>
          <Link href="/user/settings" className="flex items-center justify-between p-3
            rounded-[var(--r)] hover:bg-card2 transition-all group">
            <span className="text-sm font-sans font-semibold">Edit Profile & Settings</span>
            <span className="text-mu group-hover:text-acc transition-colors">→</span>
          </Link>
          <Link href="/user/history" className="flex items-center justify-between p-3
            rounded-[var(--r)] hover:bg-card2 transition-all group">
            <span className="text-sm font-sans font-semibold">View Calculation History</span>
            <span className="text-mu group-hover:text-acc transition-colors">→</span>
          </Link>
          <Link href="/user/favourites" className="flex items-center justify-between p-3
            rounded-[var(--r)] hover:bg-card2 transition-all group">
            <span className="text-sm font-sans font-semibold">Manage Favourites</span>
            <span className="text-mu group-hover:text-acc transition-colors">→</span>
          </Link>
          {profile?.plan === 'free' && (
            <Link href="/pricing" className="flex items-center justify-between p-3
              rounded-[var(--r)] bg-acc/5 border border-acc/20 hover:bg-acc/10 transition-all group">
              <span className="text-sm font-sans font-semibold text-acc">⚡ Upgrade to Pro</span>
              <span className="text-acc">→</span>
            </Link>
          )}
        </div>

      </div>
    </UserLayout>
  )
}
