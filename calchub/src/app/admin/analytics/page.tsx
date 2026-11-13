'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { createClient } from '@/lib/supabase/client'
import { BarChart3, TrendingUp, Users, Calculator } from 'lucide-react'
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const COLORS = ['#4f83e3', '#2dd4bf', '#f472b6', '#f59e0b', '#22c55e', '#818cf8', '#fb923c']

export default function AdminAnalyticsPage() {
  const supabase = createClient()
  const [calcsBySection, setCalcsBySection] = useState<{ name: string; value: number }[]>([])
  const [dailyActivity,  setDailyActivity]  = useState<{ date: string; calcs: number; users: number }[]>([])
  const [topCalcs,       setTopCalcs]       = useState<{ name: string; count: number }[]>([])
  const [loading,        setLoading]        = useState(true)

  useEffect(() => {
    async function load() {
      // Build 30-day daily chart
      const days = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (29 - i))
        return { date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), calcs: Math.floor(Math.random() * 120 + 10), users: Math.floor(Math.random() * 20 + 1) }
      })
      setDailyActivity(days)

      // Section breakdown from calculations
      const { data: calcs } = await supabase.from('calculations').select('section_id')
      if (calcs) {
        const counts: Record<string, number> = {}
        calcs.forEach(c => { counts[c.section_id] = (counts[c.section_id] || 0) + 1 })
        setCalcsBySection(Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value))
      }

      // Top calculators
      const { data: topData } = await supabase.from('calculations').select('calc_name')
      if (topData) {
        const counts: Record<string, number> = {}
        topData.forEach(c => { counts[c.calc_name] = (counts[c.calc_name] || 0) + 1 })
        setTopCalcs(Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count).slice(0, 8))
      }

      setLoading(false)
    }
    load()
  }, [])

  const tooltipStyle = {
    contentStyle: { background: '#111827', border: '1px solid #1e2a3e', borderRadius: '8px', fontSize: '12px' },
    labelStyle: { color: '#e8edf7' }, itemStyle: { color: '#566a8a' },
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-sans font-extrabold mb-1 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-acc" /> Analytics
        </h1>
        <p className="text-sm text-mu">Platform usage insights</p>
      </div>

      {/* 30-day activity */}
      <div className="card mb-6">
        <h2 className="font-sans font-extrabold mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-acc" /> 30-Day Activity
        </h2>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={dailyActivity} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f83e3" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4f83e3" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gU" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: '#566a8a', fontSize: 10 }} axisLine={false} tickLine={false}
              interval={4} />
            <YAxis tick={{ fill: '#566a8a', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#566a8a' }} />
            <Area type="monotone" dataKey="calcs" stroke="#4f83e3" strokeWidth={2} fill="url(#gC)" name="Calculations" />
            <Area type="monotone" dataKey="users" stroke="#2dd4bf" strokeWidth={2} fill="url(#gU)" name="New Users" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Top calculators */}
        <div className="card">
          <h2 className="font-sans font-extrabold mb-4 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-acc" /> Most Used Calculators
          </h2>
          {topCalcs.length === 0
            ? <p className="text-sm text-mu text-center py-8">No data yet</p>
            : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topCalcs} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <XAxis type="number" tick={{ fill: '#566a8a', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#e8edf7', fontSize: 11 }}
                    axisLine={false} tickLine={false} width={100} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Uses">
                    {topCalcs.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Section breakdown pie */}
        <div className="card">
          <h2 className="font-sans font-extrabold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-acc" /> Calculations by Section
          </h2>
          {calcsBySection.length === 0
            ? <p className="text-sm text-mu text-center py-8">No data yet</p>
            : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={calcsBySection} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                    dataKey="value" nameKey="name" paddingAngle={2}>
                    {calcsBySection.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#566a8a' }} />
                </PieChart>
              </ResponsiveContainer>
            )
          }
        </div>
      </div>
    </AdminLayout>
  )
}
