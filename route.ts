import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await req.json()
    const { calc_id, section_id, calc_name, inputs, result, session_id } = body

    if (!calc_id || !section_id || !calc_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase.from('calculations').insert({
      user_id: user?.id ?? null,
      calc_id, section_id, calc_name,
      inputs: inputs ?? {},
      result: result ?? {},
      session_id: session_id ?? null,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Bump calc_count on profile
    if (user) {
      await supabase.rpc('increment', { table_name: 'profiles', column_name: 'calc_count', row_id: user.id })
        .catch(() => {}) // ignore if RPC not set up
    }

    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url     = new URL(req.url)
    const page    = parseInt(url.searchParams.get('page') ?? '1')
    const perPage = parseInt(url.searchParams.get('per_page') ?? '20')
    const saved   = url.searchParams.get('saved') === 'true'

    let query = supabase.from('calculations').select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1)

    if (saved) query = query.eq('is_saved', true)

    const { data, count, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data, total: count, page, per_page: perPage, total_pages: Math.ceil((count ?? 0) / perPage) })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
