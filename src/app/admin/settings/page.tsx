'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const defaultSettings = {
  officeStart: '09:00',
  officeEnd: '18:00',
  weeklyHoliday1: 'saturday',
  weeklyHoliday2: 'sunday',
  timezone: 'Asia/Kathmandu',
}

export default function SettingsPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      <p className="text-sm text-gray-500 mt-1">Configure office time, weekly holiday, and timezone</p>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-4 py-3 mt-4">
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Office Time</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input name="officeStart" type="time" defaultValue={defaultSettings.officeStart} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input name="officeEnd" type="time" defaultValue={defaultSettings.officeEnd} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Holiday</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Holiday</label>
              <select name="weeklyHoliday1" defaultValue={defaultSettings.weeklyHoliday1} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white">
                {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map(d => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Second Holiday</label>
              <select name="weeklyHoliday2" defaultValue={defaultSettings.weeklyHoliday2} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white">
                {['none', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map(d => (
                  <option key={d} value={d}>{d === 'none' ? 'None' : d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Timezone</h3>
          <select name="timezone" defaultValue={defaultSettings.timezone} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white">
            <option value="Asia/Kathmandu">Asia/Kathmandu (UTC+05:45)</option>
            <option value="Asia/Kolkata">Asia/Kolkata (UTC+05:30)</option>
            <option value="Asia/Dubai">Asia/Dubai (UTC+04:00)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
