import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SYSTEM = `You are CalcHub Solver — an expert AI assistant for math, finance, science, and health calculations. CalcHub has 318+ free calculators.

RESPONSE RULES:
1. Reply in Hinglish (Hindi + English mix) — conversational and clear
2. Always show the formula first, then step-by-step working
3. Put the final answer on its own line: **Answer:** [value with units]
4. Number each step clearly under: **Steps:**
5. At the very end, if a CalcHub calculator exists, add: CALCULATOR: calculator_id | Calculator Name

Keep answers accurate, complete, and concise. Never fabricate numbers.`

export async function POST(req: NextRequest) {
  try {
    // Rate limit: check auth (optional — allow guests too)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await req.json()
    const { messages } = body as { messages: Array<{ role: string; content: string }> }

    if (!messages?.length) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: SYSTEM,
        messages: messages.slice(-10),
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      return NextResponse.json({ error: err.error?.message ?? 'AI error' }, { status: 500 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text ?? ''

    // Log usage (non-blocking)
    if (user) {
      supabase.from('analytics_events').insert({
        event_type: 'calc_run', user_id: user.id,
        meta: { source: 'ai_solver', message_count: messages.length },
      }).then(() => {})
    }

    return NextResponse.json({ text })
  } catch (err) {
    console.error('AI route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
