import dbConnect from '@/lib/mongodb'
import LeaveRequest from '@/models/LeaveRequest'
import { getCurrentEmployee } from '@/lib/dal'
import LeaveForm from './LeaveForm'

export const dynamic = 'force-dynamic'

export default async function LeavePage() {
  const employee = await getCurrentEmployee()

  let leaves: any[] = []
  if (employee) {
    await dbConnect()
    leaves = await LeaveRequest.find({ employeeId: employee._id })
      .sort({ createdAt: -1 })
      .lean()
    leaves = JSON.parse(JSON.stringify(leaves))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Leave Request</h2>
        <p className="text-sm text-gray-500 mt-1">Submit a leave request for approval</p>
        <div className="mt-4">
          <LeaveForm />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">My Leave Requests</h3>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Type</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Dates</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Reason</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaves.map((leave: any) => (
                  <tr key={leave._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize text-gray-900 font-medium">{leave.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{leave.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        leave.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : leave.status === 'rejected'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(leave.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {leaves.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                      No leave requests yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}