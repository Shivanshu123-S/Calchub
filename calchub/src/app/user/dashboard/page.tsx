'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { UserLayout } from '@/components/layout/UserLayout'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { timeAgo, fmtDate } from '@/lib/utils'
import type { Calculation, Favourite } from '@/types'
import {
  Calculator, Star, History, TrendingUp,
  ArrowRight, Sparkles, Clock, Zap,
} from 'lucide-react'

export default function UserDashboard() {
  const { profile } = useAuth()
  const supabase = createClient()

  const [recentCalcs, setRecentCalcs] = useState<Calculation[]>([])
  const [favCount,    setFavCount]    = useState(0)
  const [totalCalcs,  setTotalCalcs]  = useState(0)
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    async function load() {
      const [{ data: recent }, { count: favs }, { count: total }] = await Promise.all([
        supabase.from('calculations').select('*')
          .eq('user_id', profile!.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('favourites').select('*', { count: 'exact', head: true })
          .eq('user_id', profile!.id),
        supabase.from('calculations').select('*', { count: 'exact', head: true })
          .eq('user_id', profile!.id),
      ])
      setRecentCalcs(recent ?? [])
      setFavCount(favs ?? 0)
      setTotalCalcs(total ?? 0)
      setLoading(false)
    }
    load()
  }, [profile?.id])

  const stats = [
    { label: 'Total Calculations', value: totalCalcs, icon: Calculator, color: 'text-acc' },
    { label: 'Favourites',         value: favCount,   icon: Star,       color: 'text-acc2' },
    { label: 'Member Since',       value: profile?.created_at ? fmtDate(profile.created_at) : '—', icon: Clock, color: 'text-mu', isDate: true },
    { label: 'Current Plan',       value: profile?.plan ?? 'free', icon: Zap, color: 'text-warn', isPlan: true },
  ]

  const quickLinks = [
    { label: 'EMI Calculator',  href: '/calculators/finance/emi',  emoji: '🏦' },
    { label: 'BMI Calculator',  href: '/calculators/health/bmi',   emoji: '⚕️' },
    { label: 'SIP Calculator',  href: '/calculators/finance/sip',  emoji: '📈' },
    { label: 'GST Calculator',  href: '/calculators/finance/gst',  emoji: '🧾' },
    { label: 'CGPA Calculator', href: '/calculators/education/cgpa', emoji: '🎓' },
    { label: 'All Calculators', href: '/user/calculators',          emoji: '🔢' },
  ]

  return (
    <UserLayout>
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-sans font-extrabold mb-1">
          Welcome back, {profile?.full_name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="text-sm text-mu">Here&apos;s your CalcHub overview.</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {stats.map(({ label, value, icon: Icon, color, isDate, isPlan }) => (
          <div key={label} className="stat-card">
            <Icon className={`w-5 h-5 ${color} mb-2`} />
            {isDate || isPlan
              ? <span className={`text-lg font-sans font-extrabold capitalize ${color}`}>{value}</span>
              : <span className="stat-value">{value}</span>
            }
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Quick access */}
        <div className="lg:col-span-2">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-acc" /> Quick Access
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-7">
            {quickLinks.map(({ label, href, emoji }) => (
              <Link key={href} href={href}
                className="card-hover flex items-center gap-3 p-4">
                <span className="text-xl">{emoji}</span>
                <span className="text-sm font-sans font-semibold text-tx leading-tight">{label}</span>
              </Link>
            ))}
          </div>

          {/* AI Solver promo */}
          <div className="relative overflow-hidden rounded-[var(--rlg)] p-5
                          bg-gradient-to-br from-acc/10 to-acc2/5 border border-acc/20">
            <div className="absolute right-4 top-4 opacity-10 text-6xl pointer-events-none">🧠</div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-acc" />
              <span className="font-sans font-extrabold text-acc text-sm">AI Solver</span>
            </div>
            <p className="text-sm text-tx mb-3 max-w-sm">
              Ask any calculation in plain English — EMI, SIP, GST, BMI — get step-by-step answers instantly.
            </p>
            <Link href="/?ai=open" className="btn-primary btn-sm inline-flex">
              Open AI Solver <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Recent history */}
        <div>
          <h2 className="section-title mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-acc" /> Recent Calculations
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-16" />)}
            </div>
          ) : recentCalcs.length === 0 ? (
            <div className="card text-center py-8">
              <Calculator className="w-8 h-8 text-mu mx-auto mb-2" />
              <p className="text-sm text-mu">No calculations yet.</p>
              <Link href="/user/calculators" className="text-acc text-sm hover:underline mt-1 inline-block">
                Try one now →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentCalcs.map(c => (
                <div key={c.id} className="card py-3 px-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-acc/10 border border-acc/20
                                  flex items-center justify-center text-sm flex-shrink-0">
                    🧮
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-sans font-semibold truncate">{c.calc_name}</p>
                    <p className="text-xs text-mu">{timeAgo(c.created_at)}</p>
                  </div>
                </div>
              ))}
              <Link href="/user/history"
                className="flex items-center gap-1.5 text-sm text-acc hover:underline pt-1">
                View all history <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade CTA for free users */}
      {profile?.plan === 'free' && (
        <div className="mt-7 card flex items-center gap-4">
          <div className="text-3xl">⚡</div>
          <div className="flex-1">
            <p className="font-sans font-extrabold mb-0.5">Unlock Pro features</p>
            <p className="text-sm text-mu">PDF export, unlimited history, priority AI, and more.</p>
          </div>
          <Link href="/pricing" className="btn-primary btn-sm flex-shrink-0">
            Upgrade <TrendingUp className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </UserLayout>
  )
}
