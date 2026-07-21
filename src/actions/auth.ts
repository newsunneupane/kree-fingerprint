'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SignJWT } from 'jose'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export async function login(prevState: { error: string } | undefined, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!process.env.JWT_SECRET) {
    return { error: 'Server configuration error: JWT_SECRET not set.' }
  }

  try {
    await dbConnect()
  } catch {
    return { error: 'Database connection failed. Please try again.' }
  }

  let user
  try {
    user = await User.findOne({ email })
  } catch {
    return { error: 'Database query failed. Please try again.' }
  }
  if (!user) {
    return { error: 'Invalid credentials' }
  }

  let isValid: boolean
  try {
    isValid = await bcrypt.compare(password, user.password)
  } catch {
    return { error: 'Authentication failed. Please try again.' }
  }
  if (!isValid) {
    return { error: 'Invalid credentials' }
  }

  let token: string
  try {
    const encodedKey = new TextEncoder().encode(process.env.JWT_SECRET)
    token = await new SignJWT({ userId: user._id.toString(), role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(encodedKey)
  } catch {
    return { error: 'Failed to create session. Please try again.' }
  }

  try {
    const cookieStore = await cookies()
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      sameSite: 'lax',
      path: '/',
    })
  } catch {
    return { error: 'Failed to set session cookie.' }
  }

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
