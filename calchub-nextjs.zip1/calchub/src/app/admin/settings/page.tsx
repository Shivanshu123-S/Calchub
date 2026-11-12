'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { createClient } from '@/lib/supabase/client'
import type { SiteSettings } from '@/types'
import { Settings, Save, Loader2, AlertTriangle, Megaphone } from 'lucide-react'
import { toast } from 'sonner'

const DEFAULT: SiteSettings = {
  maintenance_mode:    { enabled: false, message: '' },
  registration_open:   true,
  max_free_saves:      10,
  max_pro_saves:       1000,
  featured_calculators: ['emi', 'bmi', 'sip', 'gst', 'cgpa'],
  announcement:        { text: '', link: '', active: false },
}

export default function AdminSettingsPage() {
  const supabase = createClient()
  const [cfg,    setCfg]    = useState<SiteSettings>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('site_settings').select('key, value')
      if (data) {
        const merged = { ...DEFAULT }
        data.forEach(({ key, value }) => { (merged as Record<string, unknown>)[key] = value })
        setCfg(merged)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function save() {
    setSaving(true)
    const entries = Object.entries(cfg).map(([key, value]) => ({ key, value }))
    for (const { key, value } of entries) {
      await supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' })
    }
    toast.success('Settings saved!')
    setSaving(false)
  }

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-acc animate-spin" /></div>
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-sans font-extrabold mb-1 flex items-center gap-2">
            <Settings className="w-6 h-6 text-acc" /> Site Settings
          </h1>
          <p className="text-sm text-mu">Global configuration for CalcHub</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save All
        </button>
      </div>

      <div className="max-w-2xl space-y-5">

        {/* Maintenance mode */}
        <div className="card border-warn/20 bg-warn/5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-warn" />
            <h2 className="font-sans font-extrabold text-warn">Maintenance Mode</h2>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-sans font-semibold">Enable maintenance mode</p>
              <p className="text-xs text-mu">Site will be unavailable to regular users</p>
            </div>
            <button
              onClick={() => setCfg(c => ({ ...c, maintenance_mode: { ...c.maintenance_mode, enabled: !c.maintenance_mode.enabled } }))}
              className={`relative w-11 h-6 rounded-full transition-all ${cfg.maintenance_mode.enabled ? 'bg-warn' : 'bg-b2'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${cfg.maintenance_mode.enabled ? 'translate-x-5' : ''}`} />
            </button>
          </div>
          <div>
            <label className="field-label">Maintenance message</label>
            <input value={cfg.maintenance_mode.message}
              onChange={e => setCfg(c => ({ ...c, maintenance_mode: { ...c.maintenance_mode, message: e.target.value } }))}
              placeholder="We'll be back shortly!" className="field-input" />
          </div>
        </div>

        {/* Registration */}
        <div className="card">
          <h2 className="font-sans font-extrabold mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-acc" /> Registration & Limits
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-sans font-semibold">Open registration</p>
                <p className="text-xs text-mu">Allow new users to register</p>
              </div>
              <button
                onClick={() => setCfg(c => ({ ...c, registration_open: !c.registration_open }))}
                className={`relative w-11 h-6 rounded-full transition-all ${cfg.registration_open ? 'bg-success' : 'bg-b2'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${cfg.registration_open ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Max free saves</label>
                <input type="number" value={cfg.max_free_saves}
                  onChange={e => setCfg(c => ({ ...c, max_free_saves: parseInt(e.target.value) || 0 }))}
                  className="field-input" />
              </div>
              <div>
                <label className="field-label">Max Pro saves</label>
                <input type="number" value={cfg.max_pro_saves}
                  onChange={e => setCfg(c => ({ ...c, max_pro_saves: parseInt(e.target.value) || 0 }))}
                  className="field-input" />
              </div>
            </div>
          </div>
        </div>

        {/* Announcement banner */}
        <div className="card">
          <h2 className="font-sans font-extrabold mb-4 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-acc" /> Site Announcement
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-sans font-semibold">Show announcement banner</p>
                <p className="text-xs text-mu">Displays at the top of every page</p>
              </div>
              <button
                onClick={() => setCfg(c => ({ ...c, announcement: { ...c.announcement, active: !c.announcement.active } }))}
                className={`relative w-11 h-6 rounded-full transition-all ${cfg.announcement.active ? 'bg-acc' : 'bg-b2'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${cfg.announcement.active ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            <div>
              <label className="field-label">Announcement text</label>
              <input value={cfg.announcement.text}
                onChange={e => setCfg(c => ({ ...c, announcement: { ...c.announcement, text: e.target.value } }))}
                placeholder="🎉 New calculators added! Check them out." className="field-input" />
            </div>
            <div>
              <label className="field-label">Link (optional)</label>
              <input value={cfg.announcement.link}
                onChange={e => setCfg(c => ({ ...c, announcement: { ...c.announcement, link: e.target.value } }))}
                placeholder="/calculators" className="field-input" />
            </div>
          </div>
        </div>

        {/* Featured calculators */}
        <div className="card">
          <h2 className="font-sans font-extrabold mb-2">Featured Calculators</h2>
          <p className="text-xs text-mu mb-4">Comma-separated calculator IDs shown on homepage</p>
          <input
            value={cfg.featured_calculators.join(', ')}
            onChange={e => setCfg(c => ({ ...c, featured_calculators: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
            placeholder="emi, bmi, sip, gst, cgpa"
            className="field-input"
          />
        </div>

        <button onClick={save} disabled={saving} className="btn-primary w-full justify-center">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save All Settings'}
        </button>
      </div>
    </AdminLayout>
  )
}
