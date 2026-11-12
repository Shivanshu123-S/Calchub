'use client'

import { useEffect, useState, useCallback } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { createClient } from '@/lib/supabase/client'
import { timeAgo, debounce } from '@/lib/utils'
import type { Profile, UserRole, UserPlan } from '@/types'
import { Search, Ban, CheckCircle, Shield, ChevronDown, Loader2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const PER_PAGE = 20
const ROLES: UserRole[] = ['user', 'moderator', 'admin']
const PLANS: UserPlan[] = ['free', 'pro', 'lifetime']

export default function AdminUsersPage() {
  const supabase = createClient()
  const [users,   setUsers]   = useState<Profile[]>([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState<'all' | 'admin' | 'pro' | 'banned'>('all')
  const [loading, setLoading] = useState(true)
  const [acting,  setActing]  = useState<string | null>(null)

  const load = useCallback(async (p = 1, q = '', f = filter) => {
    setLoading(true)
    let query = supabase.from('profiles').select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((p - 1) * PER_PAGE, p * PER_PAGE - 1)

    if (q)          query = query.ilike('email', `%${q}%`)
    if (f === 'admin')  query = query.eq('role', 'admin')
    if (f === 'pro')    query = query.in('plan', ['pro', 'lifetime'])
    if (f === 'banned') query = query.eq('is_banned', true)

    const { data, count } = await query
    setUsers(data ?? [])
    setTotal(count ?? 0)
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [])

  const debouncedSearch = useCallback(
    debounce((q: string) => { setPage(1); load(1, q, filter) }, 400), [load, filter]
  )

  async function updateUser(id: string, updates: Partial<Profile>) {
    setActing(id)
    const { error } = await supabase.from('profiles').update(updates).eq('id', id)
    if (error) { toast.error('Update failed'); setActing(null); return }
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u))
    toast.success('User updated')
    setActing(null)
  }

  async function toggleBan(user: Profile) {
    await updateUser(user.id, {
      is_banned: !user.is_banned,
      ban_reason: user.is_banned ? null : 'Banned by admin',
    })
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-sans font-extrabold mb-1 flex items-center gap-2">
          <Users className="w-6 h-6 text-acc" /> User Management
        </h1>
        <p className="text-sm text-mu">{total.toLocaleString()} total users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mu" />
          <input type="search" placeholder="Search by email…" className="field-input pl-10"
            onChange={e => { setSearch(e.target.value); debouncedSearch(e.target.value) }} />
        </div>
        <div className="flex gap-2">
          {(['all', 'admin', 'pro', 'banned'] as const).map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); load(1, search, f) }}
              className={cn(
                'btn-secondary btn-sm capitalize',
                filter === f && 'border-acc text-acc bg-acc/5'
              )}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-16" />)}
        </div>
      ) : (
        <>
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Plan</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className={cn('group', u.is_banned && 'opacity-60')}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-acc to-acc2
                                          flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {(u.full_name ?? u.email ?? 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-sans font-semibold">{u.full_name ?? '—'}</p>
                            <p className="text-xs text-mu">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role select */}
                      <td>
                        <div className="relative inline-block">
                          <select
                            value={u.role}
                            onChange={e => updateUser(u.id, { role: e.target.value as UserRole })}
                            disabled={acting === u.id}
                            className="appearance-none pl-2 pr-6 py-1 text-xs font-sans font-bold
                                       bg-card border border-b1 rounded-lg text-tx cursor-pointer
                                       hover:border-acc transition-all focus:outline-none"
                          >
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-mu pointer-events-none" />
                        </div>
                      </td>

                      {/* Plan select */}
                      <td>
                        <div className="relative inline-block">
                          <select
                            value={u.plan}
                            onChange={e => updateUser(u.id, { plan: e.target.value as UserPlan })}
                            disabled={acting === u.id}
                            className="appearance-none pl-2 pr-6 py-1 text-xs font-sans font-bold
                                       bg-card border border-b1 rounded-lg text-tx cursor-pointer
                                       hover:border-acc transition-all focus:outline-none"
                          >
                            {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-mu pointer-events-none" />
                        </div>
                      </td>

                      <td className="text-xs text-mu">{timeAgo(u.created_at)}</td>

                      <td>
                        {u.is_banned
                          ? <span className="badge badge-red">Banned</span>
                          : <span className="badge badge-green">Active</span>
                        }
                      </td>

                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {acting === u.id
                            ? <Loader2 className="w-4 h-4 text-mu animate-spin" />
                            : (
                              <button onClick={() => toggleBan(u)}
                                className={cn(
                                  'p-1.5 rounded-lg transition-all text-sm',
                                  u.is_banned
                                    ? 'text-mu hover:text-success hover:bg-success/5'
                                    : 'text-mu hover:text-danger hover:bg-danger/5'
                                )}
                                title={u.is_banned ? 'Unban user' : 'Ban user'}
                              >
                                {u.is_banned
                                  ? <CheckCircle className="w-4 h-4" />
                                  : <Ban className="w-4 h-4" />
                                }
                              </button>
                            )
                          }
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-5">
              <button disabled={page === 1}
                onClick={() => { setPage(p => p - 1); load(page - 1, search) }}
                className="btn-secondary btn-sm disabled:opacity-40">← Prev</button>
              <span className="text-sm text-mu font-mono">Page {page} of {totalPages}</span>
              <button disabled={page === totalPages}
                onClick={() => { setPage(p => p + 1); load(page + 1, search) }}
                className="btn-secondary btn-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  )
}
