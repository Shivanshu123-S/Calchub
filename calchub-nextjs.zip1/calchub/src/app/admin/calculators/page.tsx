'use client'

import { useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { createClient } from '@/lib/supabase/client'
import { Search, Calculator, Star, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const ALL_CALCS = [
  { id: 'emi',               name: 'EMI Calculator',          section: 'finance',   emoji: '🏦' },
  { id: 'sip',               name: 'SIP Calculator',          section: 'finance',   emoji: '📈' },
  { id: 'gst',               name: 'GST Calculator',          section: 'finance',   emoji: '🧾' },
  { id: 'compound_interest', name: 'Compound Interest',       section: 'finance',   emoji: '💰' },
  { id: 'income_tax',        name: 'Income Tax',              section: 'finance',   emoji: '💵' },
  { id: 'bmi',               name: 'BMI Calculator',          section: 'health',    emoji: '⚕️' },
  { id: 'bmr',               name: 'BMR Calculator',          section: 'health',    emoji: '🔥' },
  { id: 'tdee',              name: 'TDEE Calculator',         section: 'health',    emoji: '⚡' },
  { id: 'percentage',        name: 'Percentage Calculator',   section: 'math',      emoji: '🧮' },
  { id: 'quadratic',         name: 'Quadratic Equation',      section: 'math',      emoji: '📐' },
  { id: 'cgpa',              name: 'CGPA Calculator',         section: 'education', emoji: '🎓' },
  { id: 'cgpa_pct',          name: 'CGPA to Percentage',      section: 'education', emoji: '📊' },
  { id: 'ohms_law',          name: "Ohm's Law",               section: 'physics',   emoji: '⚡' },
  { id: 'ph',                name: 'pH Calculator',           section: 'chemistry', emoji: '🧪' },
]

export default function AdminCalculatorsPage() {
  const supabase = createClient()
  const [search,   setSearch]   = useState('')
  const [featured, setFeatured] = useState<string[]>(['emi', 'bmi', 'sip', 'gst', 'cgpa'])
  const [saving,   setSaving]   = useState(false)

  const filtered = ALL_CALCS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.section.toLowerCase().includes(search.toLowerCase())
  )

  async function toggleFeatured(id: string) {
    setFeatured(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  async function saveFeatured() {
    setSaving(true)
    await supabase.from('site_settings')
      .upsert({ key: 'featured_calculators', value: featured }, { onConflict: 'key' })
    toast.success('Featured calculators saved!')
    setSaving(false)
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-sans font-extrabold mb-1 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-acc" /> Calculator Management
          </h1>
          <p className="text-sm text-mu">{ALL_CALCS.length} calculators · {featured.length} featured</p>
        </div>
        <button onClick={saveFeatured} disabled={saving} className="btn-primary btn-sm">
          <Star className="w-3.5 h-3.5" />
          {saving ? 'Saving…' : 'Save Featured'}
        </button>
      </div>

      {/* Featured strip */}
      <div className="card mb-6 bg-acc/5 border-acc/20">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-acc" />
          <h2 className="font-sans font-extrabold text-sm">Currently Featured on Homepage</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {featured.length === 0
            ? <p className="text-xs text-mu">No featured calculators</p>
            : featured.map(id => {
                const calc = ALL_CALCS.find(c => c.id === id)
                return (
                  <span key={id} className="badge badge-blue">
                    {calc?.emoji} {calc?.name ?? id}
                  </span>
                )
              })
          }
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mu" />
        <input type="search" placeholder="Search calculators…" className="field-input pl-10"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <table className="data-table">
          <thead>
            <tr>
              <th>Calculator</th>
              <th>Section</th>
              <th>ID</th>
              <th className="text-right">Featured</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(calc => (
              <tr key={calc.id} className={cn('group', featured.includes(calc.id) && 'bg-acc/3')}>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{calc.emoji}</span>
                    <span className="font-sans font-semibold text-sm">{calc.name}</span>
                  </div>
                </td>
                <td><span className="badge badge-gray capitalize">{calc.section}</span></td>
                <td><code className="text-xs text-mu font-mono">{calc.id}</code></td>
                <td className="text-right">
                  <button onClick={() => toggleFeatured(calc.id)}
                    className={cn(
                      'p-1.5 rounded-lg transition-all',
                      featured.includes(calc.id)
                        ? 'text-warn hover:bg-warn/5'
                        : 'text-mu hover:text-warn hover:bg-warn/5'
                    )}>
                    <Star className={cn('w-4 h-4', featured.includes(calc.id) && 'fill-current')} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
