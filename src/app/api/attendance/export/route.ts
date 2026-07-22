import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'

export const dynamic = 'force-dynamic'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('session')?.value
  if (!cookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = await decrypt(cookie)
  if (!session?.userId) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'monthly'
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''

  const query = new URLSearchParams({ type })
  if (from) query.set('from', from)
  if (to) query.set('to', to)

  const backendRes = await fetch(`${API_URL}/api/attendance/export?${query.toString()}`, {
    headers: { Authorization: `Bearer ${cookie}` },
  })

  if (!backendRes.ok) {
    const err = await backendRes.json().catch(() => ({ error: 'Export failed' }))
    return NextResponse.json(err, { status: backendRes.status })
  }

  const buffer = await backendRes.arrayBuffer()

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': backendRes.headers.get('Content-Disposition') || `attachment; filename=attendance-${type}-${new Date().toISOString().split('T')[0]}.xlsx`,
    },
  })
}
