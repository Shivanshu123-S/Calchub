import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code     = searchParams.get('code')
  const next     = searchParams.get('next') ?? '/user/dashboard'
  const error    = searchParams.get('error')
  const errorDesc = searchParams.get('error_description')

  if (error) {
    console.error('OAuth error:', error, errorDesc)
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(errorDesc ?? error)}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('Code exchange error:', exchangeError)
  }

  return NextResponse.redirect(`${origin}/auth/login?error=Authentication+failed`)
}
