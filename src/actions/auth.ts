'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { encrypt } from '@/lib/session'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export async function login(prevState: { error: string } | undefined, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  await dbConnect()
  const user = await User.findOne({ email })
  if (!user) {
    return { error: 'Invalid credentials' }
  }

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    return { error: 'Invalid credentials' }
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt({
    userId: user._id.toString(),
    role: user.role,
    expiresAt,
  })

  const cookieStore = await cookies()
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })

  if (user.role === 'admin') {
    redirect('/admin')
  } else {
    redirect('/employee')
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  redirect('/login')
}
