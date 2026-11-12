import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ── Class name merger ──────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Number formatting ──────────────────────────
export function fmt(value: number, decimals = 2): string {
  if (Math.abs(value) >= 1e7) return (value / 1e7).toFixed(2) + ' Cr'
  if (Math.abs(value) >= 1e5) return (value / 1e5).toFixed(2) + ' L'
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value)
}

export function fmtINR(value: number): string {
  return '₹' + fmt(value, 0)
}

export function fmtPct(value: number, decimals = 2): string {
  return value.toFixed(decimals) + '%'
}

// ── Date helpers ───────────────────────────────
export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const secs = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (secs < 60)   return 'just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  if (secs < 604800) return `${Math.floor(secs / 86400)}d ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// ── String helpers ─────────────────────────────
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function truncate(s: string, len = 60): string {
  return s.length > len ? s.slice(0, len) + '…' : s
}

// ── Misc ───────────────────────────────────────
export function generateSessionId(): string {
  return crypto.randomUUID()
}

export function getInitials(name: string | null): string {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T, delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
