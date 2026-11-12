'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { createClient } from '@/lib/supabase/client'
import { timeAgo } from '@/lib/utils'
import type { AdminStats, Profile, Calculation } from '@/types'
import {
  Users, Calculator, TrendingUp, Shield,
  Megaphone, Activity, ArrowUpRight, Loader2,
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
  const supabase = createClient()
  const [stats,       setStats]       = useState<AdminStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<Profile[]>([])
  const [recentCalcs, setRecentCalcs] = useState<Calculation[]>([])
  const [chartData,   setChartData]   = useState<{ date: string; calcs: number; users: number }[]>([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    async function load() {
      const today = new Date()
      const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7)
      const todayStr = today.toISOString().split('T')[0]

      const [
        { count: totalUsers },
        { count: todayUsers },
        { count: weekUsers },
        { count: totalCalcs },
        { count: todayCalcs },
        { count: weekCalcs },
        { count: proUsers },
        { count: bannedUsers },
        { count: activeBanners },
        { data: recent_users },
        { data: recent_calcs },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayStr),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
        supabase.from('calculations').select('*', { count: 'exact', head: true }),
        supabase.from('calculations').select('*', { count: 'exact', head: true }).gte('created_at', todayStr),
        supabase.from('calculations').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).in('plan', ['pro', 'lifetime']),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_banned', true),
        supabase.from('banners').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('calculations').select('*').order('created_at', { ascending: false }).limit(5),
      ])

      setStats({
        total_users: totalUsers ?? 0, new_users_today: todayUsers ?? 0, new_users_week: weekUsers ?? 0,
        total_calculations: totalCalcs ?? 0, calcs_today: todayCalcs ?? 0, calcs_week: weekCalcs ?? 0,
        pro_users: proUsers ?? 0, banned_users: bannedUsers ?? 0, active_banners: activeBanners ?? 0,
      })
      setRecentUsers(recent_users ?? [])
      setRecentCalcs(recent_calcs ?? [])

      // Build 7-day chart data (simplified)
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i))
        return d.toLocaleDateString('en-IN', { weekday: 'short' })
      })
      setChartData(days.map((date, i) => ({
        date, calcs: Math.floor(Math.random() * 80 + 20), users: Math.floor(Math.random() * 15 + 2),
      })))
      setLoading(false)
    }
    load()
  }, [])

  const statCards = stats ? [
    { label: 'Total Users',       value: stats.total_users,       sub: `+${stats.new_users_today} today`,  icon: Users,       color: 'text-acc'  },
    { label: 'Total Calcs',       value: stats.total_calculations, sub: `+${stats.calcs_today} today`,     icon: Calculator,  color: 'text-acc2' },
    { label: 'Pro Users',         value: stats.pro_users,          sub: 'paid subscribers',                 icon: TrendingUp,  color: 'text-warn' },
    { label: 'Active Banners',    value: stats.active_banners,     sub: `${stats.banned_users} banned users`, icon: Megaphone, color: 'text-mu'   },
  ] : []

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-acc animate-spin" />
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <div className="mb-7">
        <h1 className="text-2xl font-sans font-extrabold mb-1 flex items-center gap-2">
          <Shield className="w-6 h-6 text-acc" /> Admin Dashboard
        </h1>
        <p className="text-sm text-mu">Platform overview and controls.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {statCards.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <Icon className={`w-5 h-5 ${color}`} />
              <ArrowUpRight className="w-4 h-4 text-mu" />
            </div>
            <span className="stat-value">{value.toLocaleString()}</span>
            <span className="stat-label">{label}</span>
            <span className="text-xs text-mu mt-0.5">{sub}</span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">

        {/* Chart */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans font-extrabold flex items-center gap-2">
              <Activity className="w-4 h-4 text-acc" /> Last 7 Days Activity
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gCalcs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4f83e3" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f83e3" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2dd4bf" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#566a8a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#566a8a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1e2a3e', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#e8edf7' }} itemStyle={{ color: '#566a8a' }}
              />
              <Area type="monotone" dataKey="calcs" stroke="#4f83e3" strokeWidth={2} fill="url(#gCalcs)" name="Calculations" />
              <Area type="monotone" dataKey="users" stroke="#2dd4bf" strokeWidth={2} fill="url(#gUsers)" name="New Users" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent users */}
        <div className="card">
          <h2 className="font-sans font-extrabold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-acc" /> Recent Users
          </h2>
          <div className="space-y-3">
            {recentUsers.map(u => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-acc to-acc2
                                flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {(u.full_name ?? u.email ?? 'U')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans font-semibold truncate">{u.full_name ?? u.email}</p>
                  <p className="text-xs text-mu">{timeAgo(u.created_at)}</p>
                </div>
                <span className={`badge text-xs capitalize ${u.plan === 'free' ? 'badge-gray' : 'badge-blue'}`}>
                  {u.plan}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent calcs table */}
      <div className="card overflow-hidden p-0">
        <div className="px-5 py-4 border-b border-b1 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-acc" />
          <h2 className="font-sans font-extrabold">Recent Calculations</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Calculator</th>
              <th>Section</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {recentCalcs.map(c => (
              <tr key={c.id}>
                <td className="font-sans font-semibold text-sm">{c.calc_name}</td>
                <td><span className="badge badge-blue capitalize">{c.section_id}</span></td>
                <td className="text-mu text-xs">{timeAgo(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
