'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createLeaveRequest } from './actions'

export default function LeaveForm() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      await createLeaveRequest(new FormData(e.currentTarget))
      setSuccess(true)
      formRef.current?.reset()
      setTimeout(() => { setSuccess(false); router.refresh() }, 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-4 py-3">
          Leave request submitted successfully!
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
            <select name="type" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white">
              <option value="sick">Sick Leave</option>
              <option value="casual">Casual Leave</option>
              <option value="annual">Annual Leave</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input name="department" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500" value="General" readOnly />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input name="startDate" type="date" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input name="endDate" type="date" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <textarea name="reason" required rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none" placeholder="Please provide a reason for your leave..." />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
        >
          {submitting ? 'Submitting...' : 'Submit Leave Request'}
        </button>
      </form>
    </>
  )
}
