'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Calculator, BarChart3,
  Settings, LogOut, Menu, X, Megaphone,
  Shield, Bell, ChevronRight, AlertTriangle,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn, getInitials } from '@/lib/utils'

const NAV = [
  { href: '/admin/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/users',       label: 'Users',       icon: Users },
  { href: '/admin/calculators', label: 'Calculators', icon: Calculator },
  { href: '/admin/analytics',   label: 'Analytics',   icon: BarChart3 },
  { href: '/admin/banners',     label: 'Banners',     icon: Megaphone },
  { href: '/admin/settings',    label: 'Settings',    icon: Settings },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { profile, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg flex">

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden"
             onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Admin Sidebar ── */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 flex flex-col',
        'bg-sf border-r border-b1 transition-transform duration-200',
        'lg:translate-x-0 lg:static lg:z-auto',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo + admin badge */}
        <div className="flex items-center justify-between p-5 border-b border-b1">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-acc" />
            <div>
              <span className="text-base font-sans font-extrabold gradient-text">CalcHub</span>
              <span className="ml-2 badge badge-blue text-xs">Admin</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-mu hover:text-tx">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin profile */}
        <div className="p-4 border-b border-b1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-acc to-acc2
                            flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {getInitials(profile?.full_name ?? '')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-sans font-bold truncate">{profile?.full_name}</p>
              <p className="text-xs text-mu truncate">Administrator</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
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

        {/* Warning stripe */}
        <div className="mx-3 mb-3 p-3 rounded-[var(--r)] bg-warn/5 border border-warn/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warn flex-shrink-0" />
            <p className="text-xs text-warn font-sans font-semibold">Admin area — handle with care</p>
          </div>
        </div>

        {/* Back to site + logout */}
        <div className="p-3 border-t border-b1 space-y-1">
          <Link href="/"
            className="flex items-center gap-3 w-full px-3 py-2 rounded-[var(--r)]
                       text-sm font-sans text-mu hover:text-tx hover:bg-card transition-all">
            <Calculator className="w-4 h-4" />
            Back to CalcHub
          </Link>
          <button onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-[var(--r)]
                       text-sm font-sans text-mu hover:text-danger hover:bg-danger/5 transition-all">
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-sf/90 backdrop-blur-md border-b border-b1
                           flex items-center justify-between px-5 py-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-mu hover:text-tx">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:flex items-center gap-2 text-sm text-mu">
            <Shield className="w-4 h-4 text-acc" />
            <span className="font-mono">Admin Panel</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button className="relative w-9 h-9 rounded-[var(--r)] bg-card border border-b1
                               flex items-center justify-center text-mu hover:text-tx transition-all">
              <Bell className="w-4 h-4" />
            </button>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-acc to-acc2
                            flex items-center justify-center text-white text-sm font-bold">
              {getInitials(profile?.full_name ?? '')}
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-7 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
