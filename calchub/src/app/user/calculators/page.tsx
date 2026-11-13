'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserLayout } from '@/components/layout/UserLayout'
import { Search, Calculator } from 'lucide-react'
import { cn } from '@/lib/utils'

const SECTIONS = [
  {
    id: 'finance', name: 'Finance', emoji: '🏦', color: '#4f83e3',
    calcs: [
      { id: 'emi',               name: 'EMI Calculator',          desc: 'Loan EMI calculation' },
      { id: 'sip',               name: 'SIP Calculator',          desc: 'SIP returns' },
      { id: 'compound_interest', name: 'Compound Interest',       desc: 'CI with formula' },
      { id: 'simple_interest',   name: 'Simple Interest',         desc: 'SI calculation' },
      { id: 'gst',               name: 'GST Calculator',          desc: 'Add/remove GST' },
      { id: 'fd',                name: 'FD Calculator',           desc: 'Fixed deposit returns' },
      { id: 'ppf',               name: 'PPF Calculator',          desc: 'PPF maturity amount' },
      { id: 'income_tax',        name: 'Income Tax Calculator',   desc: 'Tax liability' },
      { id: 'roi',               name: 'ROI Calculator',          desc: 'Return on investment' },
      { id: 'cagr',              name: 'CAGR Calculator',         desc: 'Compound annual growth' },
    ],
  },
  {
    id: 'health', name: 'Health', emoji: '⚕️', color: '#22c55e',
    calcs: [
      { id: 'bmi',          name: 'BMI Calculator',         desc: 'Body mass index' },
      { id: 'bmr',          name: 'BMR Calculator',         desc: 'Basal metabolic rate' },
      { id: 'tdee',         name: 'TDEE Calculator',        desc: 'Daily calorie needs' },
      { id: 'ideal_weight', name: 'Ideal Weight',           desc: 'Ideal body weight' },
      { id: 'body_fat',     name: 'Body Fat Calculator',    desc: 'Body fat percentage' },
      { id: 'water',        name: 'Water Intake',           desc: 'Daily water requirement' },
      { id: 'heart_rate',   name: 'Heart Rate Zones',       desc: 'Target heart rate' },
      { id: 'due_date',     name: 'Pregnancy Due Date',     desc: 'Expected delivery date' },
      { id: 'age_calc',     name: 'Age Calculator',         desc: 'Exact age calculation' },
    ],
  },
  {
    id: 'math', name: 'Mathematics', emoji: '🧮', color: '#f59e0b',
    calcs: [
      { id: 'percentage',  name: 'Percentage Calculator', desc: 'Percentage of any number' },
      { id: 'quadratic',   name: 'Quadratic Equation',   desc: 'Solve ax²+bx+c=0' },
      { id: 'area_calc',   name: 'Area Calculator',      desc: 'Area of shapes' },
      { id: 'volume_calc', name: 'Volume Calculator',    desc: 'Volume of 3D shapes' },
      { id: 'statistics',  name: 'Statistics',           desc: 'Mean, median, mode, SD' },
      { id: 'pythagorean', name: 'Pythagorean Theorem',  desc: 'Right triangle sides' },
      { id: 'lcm_gcd',     name: 'LCM & GCD',            desc: 'LCM and HCF calculator' },
      { id: 'factorial',   name: 'Factorial',             desc: 'n! calculation' },
      { id: 'fraction',    name: 'Fraction Calculator',  desc: 'Add, subtract fractions' },
    ],
  },
  {
    id: 'physics', name: 'Physics', emoji: '⚡', color: '#f472b6',
    calcs: [
      { id: 'ohms_law',         name: "Ohm's Law",           desc: 'V=IR calculator' },
      { id: 'projectile',       name: 'Projectile Motion',   desc: 'Range, height, time' },
      { id: 'kinetic_energy',   name: 'Kinetic Energy',      desc: 'KE = ½mv²' },
      { id: 'simple_pendulum',  name: 'Simple Pendulum',     desc: 'Period of pendulum' },
      { id: 'speed',            name: 'Speed Calculator',    desc: 'Speed, distance, time' },
      { id: 'force',            name: 'Force Calculator',    desc: 'F = ma' },
      { id: 'pressure',         name: 'Pressure Calculator', desc: 'P = F/A' },
    ],
  },
  {
    id: 'chemistry', name: 'Chemistry', emoji: '🧪', color: '#a78bfa',
    calcs: [
      { id: 'ph',          name: 'pH Calculator',       desc: 'pH of a solution' },
      { id: 'molarity',    name: 'Molarity',            desc: 'Concentration of solution' },
      { id: 'molar_mass',  name: 'Molar Mass',          desc: 'Molecular weight' },
      { id: 'ideal_gas',   name: 'Ideal Gas Law',       desc: 'PV = nRT' },
      { id: 'half_life',   name: 'Half-Life',           desc: 'Radioactive decay' },
      { id: 'dilution',    name: 'Dilution Calculator', desc: 'C₁V₁ = C₂V₂' },
    ],
  },
  {
    id: 'education', name: 'Education', emoji: '🎓', color: '#2dd4bf',
    calcs: [
      { id: 'marks_pct',  name: 'Marks to Percentage', desc: 'Convert marks to %' },
      { id: 'cgpa',       name: 'CGPA Calculator',     desc: 'CGPA from grades' },
      { id: 'cgpa_pct',   name: 'CGPA to Percentage',  desc: 'CGPA × 9.5' },
      { id: 'gpa',        name: 'GPA Calculator',      desc: 'Grade point average' },
      { id: 'attendance', name: 'Attendance Calculator', desc: 'Attendance percentage' },
    ],
  },
]

export default function UserCalculatorsPage() {
  const [search,        setSearch]        = useState('')
  const [activeSection, setActiveSection] = useState('all')

  const filtered = SECTIONS.map(sec => ({
    ...sec,
    calcs: sec.calcs.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.desc.toLowerCase().includes(search.toLowerCase()) ||
      sec.name.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(sec =>
    (activeSection === 'all' || sec.id === activeSection) && sec.calcs.length > 0
  )

  const totalShown = filtered.reduce((sum, s) => sum + s.calcs.length, 0)

  return (
    <UserLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-sans font-extrabold mb-1 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-acc" /> All Calculators
        </h1>
        <p className="text-sm text-mu">318+ calculators across all departments</p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mu" />
        <input type="search" placeholder="Search calculators…"
          className="field-input pl-10"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Section filter pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-1">
        <button onClick={() => setActiveSection('all')}
          className={cn('px-3 py-1.5 rounded-full text-xs font-sans font-bold whitespace-nowrap border transition-all',
            activeSection === 'all' ? 'bg-acc/10 border-acc/30 text-acc' : 'bg-card border-b1 text-mu hover:text-tx')}>
          All
        </button>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={cn('px-3 py-1.5 rounded-full text-xs font-sans font-bold whitespace-nowrap border transition-all',
              activeSection === s.id ? 'border-acc/30 text-acc' : 'bg-card border-b1 text-mu hover:text-tx')}
            style={activeSection === s.id ? { background: `${s.color}18` } : {}}>
            {s.emoji} {s.name}
          </button>
        ))}
      </div>

      {/* Results count */}
      {search && (
        <p className="text-sm text-mu mb-4">{totalShown} results for &ldquo;{search}&rdquo;</p>
      )}

      {/* Calculator grid by section */}
      <div className="space-y-8">
        {filtered.map(sec => (
          <div key={sec.id}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{sec.emoji}</span>
              <h2 className="font-sans font-extrabold">{sec.name}</h2>
              <span className="badge badge-gray text-xs">{sec.calcs.length}</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {sec.calcs.map(calc => (
                <Link key={calc.id}
                  href={`/calculators/${sec.id}/${calc.id}`}
                  className="card-hover p-4 group">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: `${sec.color}18`, border: `1px solid ${sec.color}30` }}>
                      {sec.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-sans font-bold text-tx leading-tight mb-0.5">{calc.name}</p>
                      <p className="text-xs text-mu leading-relaxed">{calc.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="card text-center py-16">
            <Search className="w-10 h-10 text-mu mx-auto mb-3" />
            <p className="font-sans font-bold text-mu">No calculators found for &ldquo;{search}&rdquo;</p>
          </div>
        )}
      </div>
    </UserLayout>
  )
}
