'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { UserLayout } from '@/components/layout/UserLayout'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type { Favourite } from '@/types'
import { Star, Trash2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

export default function FavouritesPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const [favs, setFavs] = useState<Favourite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    supabase.from('favourites').select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setFavs(data ?? []); setLoading(false) })
  }, [profile?.id])

  async function remove(id: string) {
    await supabase.from('favourites').delete().eq('id', id)
    setFavs(prev => prev.filter(f => f.id !== id))
    toast.success('Removed from favourites')
  }

  return (
    <UserLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-sans font-extrabold mb-1 flex items-center gap-2">
          <Star className="w-6 h-6 text-acc" /> Favourites
        </h1>
        <p className="text-sm text-mu">{favs.length} saved calculators</p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-24" />)}
        </div>
      ) : favs.length === 0 ? (
        <div className="card text-center py-16">
          <Star className="w-10 h-10 text-mu mx-auto mb-3" />
          <p className="font-sans font-bold text-mu mb-2">No favourites yet</p>
          <p className="text-xs text-mu mb-4">Star any calculator to save it here for quick access</p>
          <Link href="/user/calculators" className="btn-primary btn-sm inline-flex">
            Browse Calculators
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favs.map(f => (
            <div key={f.id} className="card-hover flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-lg bg-acc/10 border border-acc/20
                              flex items-center justify-center text-xl flex-shrink-0">
                🧮
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans font-bold text-sm truncate capitalize">
                  {f.calc_id.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-mu capitalize">{f.section_id}</p>
              </div>
              <div className="flex items-center gap-1">
                <Link href={`/calculators/${f.section_id}/${f.calc_id}`}
                  className="p-1.5 rounded-lg text-mu hover:text-acc hover:bg-acc/5 transition-all">
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button onClick={() => remove(f.id)}
                  className="p-1.5 rounded-lg text-mu hover:text-danger hover:bg-danger/5 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </UserLayout>
  )
}
