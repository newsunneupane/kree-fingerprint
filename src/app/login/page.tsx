'use client'

import { useActionState } from 'react'
import { login } from '@/actions/auth'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">FP</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Fingerprint Attendance</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <form action={action} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              placeholder="admin@fingerprint.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {pending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          Admin: admin@fingerprint.com / admin123
        </p>
      </div>
    </div>
  )
}
