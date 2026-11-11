'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Calculator, History, Star,
  Settings, LogOut, Menu, X, Bell, User,
  ChevronRight, Sparkles,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn, getInitials } from '@/lib/utils'

const NAV = [
  { href: '/user/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/user/calculators', label: 'Calculators', icon: Calculator },
  { href: '/user/history',     label: 'History',     icon: History },
  { href: '/user/favourites',  label: 'Favourites',  icon: Star },
  { href: '/user/settings',    label: 'Settings',    icon: Settings },
]

export function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname      = usePathname()
  const { profile, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg flex">

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden"
             onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-sf border-r border-b1',
        'flex flex-col transition-transform duration-200',
        'lg:translate-x-0 lg:static lg:z-auto',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-b1">
          <Link href="/" className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-acc" />
            <span className="text-lg font-sans font-extrabold gradient-text">CalcHub</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-mu hover:text-tx">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile mini */}
        <div className="p-4 border-b border-b1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-acc to-acc2
                            flex items-center justify-center text-white text-sm font-sans font-bold flex-shrink-0">
              {getInitials(profile?.full_name ?? profile?.email ?? '')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-sans font-bold truncate">{profile?.full_name ?? 'User'}</p>
              <p className="text-xs text-mu truncate">{profile?.email}</p>
            </div>
            <span className={cn(
              'badge text-xs capitalize flex-shrink-0',
              profile?.plan === 'free' ? 'badge-gray' : 'badge-blue'
            )}>
              {profile?.plan ?? 'free'}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-[var(--r)] text-sm',
                  'font-sans font-semibold transition-all duration-150',
                  active
                    ? 'bg-acc/10 text-acc border border-acc/20'
                    : 'text-mu hover:text-tx hover:bg-card'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Upgrade banner (free users only) */}
        {profile?.plan === 'free' && (
          <div className="m-3 p-3 rounded-[var(--r)] bg-gradient-to-br from-acc/10 to-acc2/5
                          border border-acc/20">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-acc" />
              <span className="text-xs font-sans font-bold text-acc">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-mu mb-2">Unlimited saves, PDF export & more.</p>
            <Link href="/pricing" className="btn-primary btn-sm w-full justify-center text-xs">
              View Plans
            </Link>
          </div>
        )}

        {/* Logout */}
        <div className="p-3 border-t border-b1">
          <button onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[var(--r)]
                       text-sm font-sans font-semibold text-mu hover:text-danger hover:bg-danger/5
                       transition-all duration-150">
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-sf/90 backdrop-blur-md border-b border-b1
                           flex items-center justify-between px-5 py-3">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-mu hover:text-tx">
            <Menu className="w-5 h-5" />
          </button>

          {/* Page title — filled by child pages via context if needed */}
          <div className="flex-1 lg:flex-none" />

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button className="relative w-9 h-9 rounded-[var(--r)] bg-card border border-b1
                               flex items-center justify-center text-mu hover:text-tx
                               hover:border-b2 transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-acc2
                               ring-2 ring-sf" />
            </button>
            {/* Profile */}
            <Link href="/user/profile"
              className="w-9 h-9 rounded-full bg-gradient-to-br from-acc to-acc2
                         flex items-center justify-center text-white text-sm font-bold">
              {getInitials(profile?.full_name ?? '')}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 lg:p-7 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
