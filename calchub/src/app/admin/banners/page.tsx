'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { createClient } from '@/lib/supabase/client'
import type { Banner, BannerAudience } from '@/types'
import { Plus, Trash2, Eye, EyeOff, Loader2, Megaphone, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'

const schema = z.object({
  title:      z.string().min(1, 'Required'),
  subtitle:   z.string().optional(),
  cta_text:   z.string().optional(),
  cta_link:   z.string().optional(),
  emoji:      z.string().default('🧮'),
  bg_color_1: z.string().default('#4f83e3'),
  bg_color_2: z.string().default('#2dd4bf'),
  show_to:    z.enum(['all', 'free', 'pro', 'guest']).default('all'),
  calc_id:    z.string().optional(),
})
type BannerForm = z.infer<typeof schema>

export default function AdminBannersPage() {
  const supabase = createClient()
  const [banners,  setBanners]  = useState<Banner[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving,   setSaving]   = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BannerForm>({
    resolver: zodResolver(schema),
    defaultValues: { emoji: '🧮', bg_color_1: '#4f83e3', bg_color_2: '#2dd4bf', show_to: 'all' },
  })

  async function load() {
    const { data } = await supabase.from('banners').select('*').order('priority', { ascending: false })
    setBanners(data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function onSubmit(data: BannerForm) {
    setSaving(true)
    const { error } = await supabase.from('banners').insert([{ ...data, is_active: true, priority: 0 }])
    if (error) { toast.error('Failed to create banner'); setSaving(false); return }
    toast.success('Banner created!')
    reset()
    setShowForm(false)
    load()
    setSaving(false)
  }

  async function toggleActive(banner: Banner) {
    await supabase.from('banners').update({ is_active: !banner.is_active }).eq('id', banner.id)
    setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, is_active: !banner.is_active } : b))
    toast.success(banner.is_active ? 'Banner hidden' : 'Banner activated')
  }

  async function deleteBanner(id: string) {
    if (!confirm('Delete this banner?')) return
    await supabase.from('banners').delete().eq('id', id)
    setBanners(prev => prev.filter(b => b.id !== id))
    toast.success('Deleted')
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-sans font-extrabold mb-1 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-acc" /> Banner Management
          </h1>
          <p className="text-sm text-mu">{banners.length} banners</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary btn-sm">
          <Plus className="w-4 h-4" /> New Banner
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card mb-6 border-acc/20">
          <h2 className="font-sans font-extrabold mb-4">Create New Banner</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">Title *</label>
              <input {...register('title')} placeholder="🎉 New Feature!" className="field-input" />
              {errors.title && <p className="text-xs text-danger mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="field-label">Subtitle</label>
              <input {...register('subtitle')} placeholder="Short description" className="field-input" />
            </div>
            <div>
              <label className="field-label">CTA Button Text</label>
              <input {...register('cta_text')} placeholder="Try Now" className="field-input" />
            </div>
            <div>
              <label className="field-label">CTA Link</label>
              <input {...register('cta_link')} placeholder="/calculators/finance/emi" className="field-input" />
            </div>
            <div>
              <label className="field-label">Emoji</label>
              <input {...register('emoji')} placeholder="🧮" className="field-input" />
            </div>
            <div>
              <label className="field-label">Show To</label>
              <select {...register('show_to')} className="field-input">
                <option value="all">All users</option>
                <option value="guest">Guests only</option>
                <option value="free">Free users</option>
                <option value="pro">Pro users</option>
              </select>
            </div>
            <div>
              <label className="field-label">Color 1</label>
              <div className="flex gap-2">
                <input {...register('bg_color_1')} type="color" className="w-12 h-10 rounded-lg border border-b1 cursor-pointer bg-transparent" />
                <input {...register('bg_color_1')} placeholder="#4f83e3" className="field-input flex-1" />
              </div>
            </div>
            <div>
              <label className="field-label">Color 2</label>
              <div className="flex gap-2">
                <input {...register('bg_color_2')} type="color" className="w-12 h-10 rounded-lg border border-b1 cursor-pointer bg-transparent" />
                <input {...register('bg_color_2')} placeholder="#2dd4bf" className="field-input flex-1" />
              </div>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Banner
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Banner list */}
      {loading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-20" />)}</div>
      ) : banners.length === 0 ? (
        <div className="card text-center py-16">
          <Megaphone className="w-10 h-10 text-mu mx-auto mb-3" />
          <p className="text-mu font-sans font-semibold">No banners yet. Create one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map(b => (
            <div key={b.id} className={cn('card flex items-center gap-4', !b.is_active && 'opacity-60')}>
              <GripVertical className="w-4 h-4 text-mu cursor-grab flex-shrink-0" />

              {/* Preview */}
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${b.bg_color_1}, ${b.bg_color_2})` }}>
                {b.emoji}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-sans font-bold text-sm">{b.title}</p>
                  <span className="badge badge-gray text-xs">{b.show_to}</span>
                  {b.is_active
                    ? <span className="badge badge-green text-xs">Active</span>
                    : <span className="badge badge-gray text-xs">Hidden</span>
                  }
                </div>
                {b.subtitle && <p className="text-xs text-mu truncate">{b.subtitle}</p>}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toggleActive(b)}
                  className="p-1.5 rounded-lg text-mu hover:text-tx hover:bg-card transition-all"
                  title={b.is_active ? 'Hide' : 'Show'}>
                  {b.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => deleteBanner(b.id)}
                  className="p-1.5 rounded-lg text-mu hover:text-danger hover:bg-danger/5 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
