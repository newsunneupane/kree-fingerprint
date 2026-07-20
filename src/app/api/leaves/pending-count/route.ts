import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import LeaveRequest from '@/models/LeaveRequest'

export const dynamic = 'force-dynamic'

export async function GET() {
  await dbConnect()
  const count = await LeaveRequest.countDocuments({ status: 'pending' })
  return NextResponse.json({ count })
}
