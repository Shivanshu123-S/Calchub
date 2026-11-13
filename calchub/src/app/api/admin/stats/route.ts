import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check admin role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const service = createServiceClient()
    const today   = new Date().toISOString().split('T')[0]

    const [
      { count: totalUsers },
      { count: todayUsers },
      { count: totalCalcs },
      { count: todayCalcs },
      { count: proUsers },
    ] = await Promise.all([
      service.from('profiles').select('*', { count: 'exact', head: true }),
      service.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today),
      service.from('calculations').select('*', { count: 'exact', head: true }),
      service.from('calculations').select('*', { count: 'exact', head: true }).gte('created_at', today),
      service.from('profiles').select('*', { count: 'exact', head: true }).in('plan', ['pro', 'lifetime']),
    ])

    return NextResponse.json({
      total_users: totalUsers ?? 0,
      new_users_today: todayUsers ?? 0,
      total_calculations: totalCalcs ?? 0,
      calcs_today: todayCalcs ?? 0,
      pro_users: proUsers ?? 0,
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
