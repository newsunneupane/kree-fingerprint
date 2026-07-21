'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export async function login(prevState: { error: string } | undefined, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  let res
  try {
    res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  } catch {
    return { error: 'Unable to connect to server. Please try again.' }
  }

  if (!res.ok) {
    return { error: 'Invalid credentials' }
  }

  const data = await res.json()

  const cookieStore = await cookies()
  cookieStore.set('session', data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    sameSite: 'lax',
    path: '/',
  })

  if (data.user.role === 'admin') {
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
