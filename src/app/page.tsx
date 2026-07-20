import { redirect } from 'next/navigation'
import { getSession } from '@/lib/dal'

export default async function Home() {
  const session = await getSession()
  if (session?.userId) {
    if (session.role === 'admin') redirect('/admin')
    redirect('/employee')
  }
  redirect('/login')
}
