import 'server-only'
import { cookies } from 'next/headers'
import { decrypt } from './session'
import { cache } from 'react'

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)
  if (!session?.userId) {
    return null
  }
  return { isAuth: true, userId: session.userId, role: session.role }
})

export async function getSession() {
  const cookie = (await cookies()).get('session')?.value
  if (!cookie) return null
  return decrypt(cookie)
}

export async function getCurrentEmployee() {
  const { default: dbConnect } = await import('@/lib/mongodb')
  const { default: User } = await import('@/models/User')
  const { default: Employee } = await import('@/models/Employee')

  await dbConnect()
  const session = await verifySession()
  if (!session) return null

  const user = await User.findById(session.userId).lean() as any
  if (!user || !user.employeeId) return null

  const employee = await Employee.findById(user.employeeId).lean() as any
  return employee
}
