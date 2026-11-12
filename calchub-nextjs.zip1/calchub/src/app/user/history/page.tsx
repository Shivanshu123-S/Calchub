'use client'

import { useEffect, useState, useCallback } from 'react'
import { UserLayout } from '@/components/layout/UserLayout'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { timeAgo, debounce } from '@/lib/utils'
import type { Calculation } from '@/types'
import { Search, Trash2, Bookmark, BookmarkCheck, Loader2, History } from 'lucide-react'
import { toast } from 'sonner'

const PER_PAGE = 15

export default function HistoryPage() {
  const { profile } = useAuth()
  const supabase = createClient()

  const [items,    setItems]    = useState<Calculation[]>([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [search,   setSearch]   = useState('')
  const [loading,  setLoading]  = useState(true)

  const load = useCallback(async (p = 1, q = '') => {
    if (!profile?.id) return
    setLoading(true)
    let query = supabase.from('calculations').select('*', { count: 'exact' })
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .range((p - 1) * PER_PAGE, p * PER_PAGE - 1)
    if (q) query = query.ilike('calc_name', `%${q}%`)

    const { data, count } = await query
    setItems(data ?? [])
    setTotal(count ?? 0)
    setLoading(false)
  }, [profile?.id])

  useEffect(() => { load(1, search) }, [profile?.id])

  const debouncedSearch = useCallback(
    debounce((q: string) => { setPage(1); load(1, q) }, 400),
    [load]
  )

  async function toggleSave(id: string, saved: boolean) {
    await supabase.from('calculations').update({ is_saved: !saved }).eq('id', id)
    setItems(prev => prev.map(c => c.id === id ? { ...c, is_saved: !saved } : c))
    toast.success(saved ? 'Removed from saved' : 'Saved!')
  }

  async function deleteCalc(id: string) {
    await supabase.from('calculations').delete().eq('id', id)
    setItems(prev => prev.filter(c => c.id !== id))
    setTotal(t => t - 1)
    toast.success('Deleted')
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <UserLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-sans font-extrabold mb-1 flex items-center gap-2">
          <History className="w-6 h-6 text-acc" /> Calculation History
        </h1>
        <p className="text-sm text-mu">{total} total calculations</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mu" />
        <input
          type="search"
          placeholder="Search by calculator name…"
          className="field-input pl-10"
          onChange={e => { setSearch(e.target.value); debouncedSearch(e.target.value) }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-14" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="card text-center py-16">
          <History className="w-10 h-10 text-mu mx-auto mb-3" />
          <p className="font-sans font-bold text-mu">No calculations found</p>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden p-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Calculator</th>
                  <th>Category</th>
                  <th>When</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(c => (
                  <tr key={c.id} className="group">
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🧮</span>
                        <div>
                          <p className="font-sans font-semibold text-sm text-tx">{c.calc_name}</p>
                          {c.label && <p className="text-xs text-mu">{c.label}</p>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-blue capitalize">{c.section_id}</span>
                    </td>
                    <td className="text-mu text-xs">{timeAgo(c.created_at)}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleSave(c.id, c.is_saved)}
                          className={`p-1.5 rounded-lg transition-all hover:bg-card
                            ${c.is_saved ? 'text-acc' : 'text-mu hover:text-acc'}`}
                          title={c.is_saved ? 'Unsave' : 'Save'}
                        >
                          {c.is_saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteCalc(c.id)}
                          className="p-1.5 rounded-lg text-mu hover:text-danger hover:bg-danger/5 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                disabled={page === 1}
                onClick={() => { setPage(p => p - 1); load(page - 1, search) }}
                className="btn-secondary btn-sm disabled:opacity-40"
              >← Prev</button>
              <span className="text-sm text-mu font-mono">Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => { setPage(p => p + 1); load(page + 1, search) }}
                className="btn-secondary btn-sm disabled:opacity-40"
              >Next →</button>
            </div>
          )}
        </>
      )}
    </UserLayout>
  )
}
