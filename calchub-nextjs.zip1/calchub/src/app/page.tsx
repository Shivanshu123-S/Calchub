import Link from 'next/link'
import { Calculator, Zap, Shield, Star, ArrowRight, Check } from 'lucide-react'

const FEATURES = [
  { icon: '🧮', title: '318+ Calculators', desc: 'Finance, Math, Physics, Chemistry, Health & more' },
  { icon: '🤖', title: 'AI Solver',         desc: 'Ask any calculation in plain English, get step-by-step answer' },
  { icon: '📱', title: 'Works Everywhere',  desc: 'Mobile, tablet, desktop — any device, any browser' },
  { icon: '⚡', title: 'Instant Results',   desc: 'No loading, no signup required for basic use' },
  { icon: '🔒', title: 'Save History',      desc: 'Login to save calculations and access from anywhere' },
  { icon: '🌙', title: 'Dark & Light Mode', desc: 'Easy on your eyes, day or night' },
]

const SECTIONS = [
  { emoji: '🏦', name: 'Finance',     count: 28, color: '#4f83e3' },
  { emoji: '⚕️', name: 'Health',      count: 15, color: '#22c55e' },
  { emoji: '🧮', name: 'Mathematics', count: 22, color: '#f59e0b' },
  { emoji: '⚡', name: 'Physics',     count: 18, color: '#f472b6' },
  { emoji: '🧪', name: 'Chemistry',   count: 12, color: '#a78bfa' },
  { emoji: '🎓', name: 'Education',   count: 10, color: '#2dd4bf' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg text-tx">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md border-b border-b1">
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-acc" />
            <span className="text-lg font-sans font-extrabold gradient-text">CalcHub</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login"    className="btn-ghost btn-sm hidden sm:flex">Login</Link>
            <Link href="/auth/register" className="btn-primary btn-sm">Get Started Free</Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-20 px-5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px]
                          bg-acc/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                          bg-acc/10 border border-acc/20 text-acc text-xs font-sans font-bold mb-6">
            <Zap className="w-3.5 h-3.5" /> 318+ Free Calculators
          </div>
          <h1 className="text-4xl sm:text-6xl font-sans font-extrabold leading-tight
                         tracking-tight mb-5 gradient-text">
            Every Calculator.<br />One Place.
          </h1>
          <p className="text-mu text-lg mb-8 max-w-xl mx-auto">
            Finance, Math, Physics, Health — 318+ calculators with step-by-step solutions.
            Powered by AI. Completely free.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register" className="btn-primary btn-lg">
              Start Calculating Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/auth/login" className="btn-secondary btn-lg">
              Login to Account
            </Link>
          </div>
          <p className="text-mu text-xs mt-4">No credit card · No signup required for basic use</p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-10 px-5 border-y border-b1">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { val: '318+', label: 'Calculators' },
            { val: '15',   label: 'Departments' },
            { val: '100%', label: 'Free Forever' },
            { val: '0ms',  label: 'Signup Needed' },
          ].map(({ val, label }) => (
            <div key={label}>
              <div className="text-2xl font-sans font-extrabold gradient-text">{val}</div>
              <div className="text-xs text-mu font-sans font-bold uppercase tracking-wider mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Calculator Sections ── */}
      <section className="py-16 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-sans font-extrabold mb-2">Browse by Department</h2>
            <p className="text-mu text-sm">Every field covered, every formula ready</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {SECTIONS.map(({ emoji, name, count, color }) => (
              <Link key={name} href={`/auth/register`}
                className="card-hover text-center py-6 px-3 group">
                <div className="text-3xl mb-3">{emoji}</div>
                <div className="font-sans font-bold text-sm text-tx">{name}</div>
                <div className="text-xs mt-1" style={{ color }}>{count} calculators</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 px-5 bg-sf border-y border-b1">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-sans font-extrabold mb-2">Everything You Need</h2>
            <p className="text-mu text-sm">Built for students, professionals, and everyone in between</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="card flex items-start gap-4">
                <span className="text-2xl flex-shrink-0">{icon}</span>
                <div>
                  <h3 className="font-sans font-bold text-sm text-tx mb-1">{title}</h3>
                  <p className="text-xs text-mu leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Solver highlight ── */}
      <section className="py-16 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl p-8 sm:p-12
                          bg-gradient-to-br from-acc/10 to-acc2/5 border border-acc/20">
            <div className="absolute right-8 top-8 text-8xl opacity-10 pointer-events-none">🧠</div>
            <div className="relative z-10 max-w-lg">
              <div className="badge badge-blue mb-4">✨ AI Powered</div>
              <h2 className="text-2xl sm:text-3xl font-sans font-extrabold mb-3">
                Ask CalcHub Solver Anything
              </h2>
              <p className="text-mu text-sm mb-6 leading-relaxed">
                Type in plain language — &ldquo;EMI for 5 lakh loan at 9% for 5 years&rdquo; —
                and get the answer with full step-by-step working instantly.
              </p>
              <ul className="space-y-2 mb-6">
                {['Hindi + English support', 'Step-by-step solutions', 'Direct calculator links'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/auth/register" className="btn-primary inline-flex">
                Try AI Solver Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-5 text-center border-t border-b1">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-sans font-extrabold mb-3">
            Ready to Calculate Smarter?
          </h2>
          <p className="text-mu text-sm mb-7">
            Join thousands of students and professionals using CalcHub every day.
          </p>
          <Link href="/auth/register" className="btn-primary btn-lg">
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-b1 py-8 px-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row
                        items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-acc" />
            <span className="font-sans font-extrabold gradient-text">CalcHub</span>
            <span className="text-mu text-xs ml-1">© 2026</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-mu">
            <Link href="/auth/login"    className="hover:text-tx transition-colors">Login</Link>
            <Link href="/auth/register" className="hover:text-tx transition-colors">Register</Link>
            <Link href="/admin/dashboard" className="hover:text-tx transition-colors flex items-center gap-1">
              <Shield className="w-3 h-3" /> Admin
            </Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
