'use client'

import { useState } from 'react'

export default function ClockOutPage() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleClockOut = async () => {
    setStatus('success')
    setTimeout(() => setStatus('idle'), 3000)
  }

  return (
    <div className="max-w-lg mx-auto text-center">
      <h2 className="text-2xl font-bold text-gray-900">Clock Out</h2>
      <p className="text-sm text-gray-500 mt-1">Use your fingerprint to clock out</p>

      <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">👋</span>
        </div>
        <p className="text-gray-600 mb-6">Place your finger on the biometric scanner to clock out</p>

        {status === 'success' && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-4 py-3 mb-4">
            Clocked out successfully!
          </div>
        )}

        <button
          onClick={handleClockOut}
          disabled={status === 'success'}
          className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-8 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
        >
          {status === 'success' ? 'Clocked Out ✓' : 'Simulate Clock Out'}
        </button>
      </div>
    </div>
  )
}
