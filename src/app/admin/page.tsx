import dbConnect from '@/lib/mongodb'
import AttendanceLog from '@/models/AttendanceLog'
import Employee from '@/models/Employee'
import LeaveRequest from '@/models/LeaveRequest'
import { verifySession } from '@/lib/dal'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  await verifySession()
  await dbConnect()

  const serverNow = new Date()
  const nepalNow = new Date(serverNow.getTime() + (5 * 60 + 45) * 60000)
  const startOfToday = new Date(Date.UTC(nepalNow.getUTCFullYear(), nepalNow.getUTCMonth(), nepalNow.getUTCDate(), 0, 0, 0))
  const endOfToday = new Date(Date.UTC(nepalNow.getUTCFullYear(), nepalNow.getUTCMonth(), nepalNow.getUTCDate(), 23, 59, 59))

  const [logs, employees, pendingLeaves] = await Promise.all([
    AttendanceLog.find({ timestamp: { $gte: startOfToday, $lte: endOfToday } }).sort({ timestamp: -1 }).lean(),
    Employee.find().lean(),
    LeaveRequest.countDocuments({ status: 'pending' }),
  ])

  const userIds = [...new Set(logs.map(l => l.deviceuserid))]
  const employeeMap: Record<string, string> = {}
  employees.forEach((e: any) => { employeeMap[e.deviceuserid] = e.name })
  const unmapped = logs.filter(l => !employeeMap[l.deviceuserid]).length

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h2>
      <p className="text-sm text-gray-500 mt-1">{nepalNow.toISOString().split('T')[0]}</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Scans</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{logs.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Staff</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{userIds.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Registered</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{employees.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Leaves</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">{pendingLeaves}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">Today's Activity Feed</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-white">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Employee</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log: any) => {
                const isMapped = !!employeeMap[log.deviceuserid]
                return (
                  <tr key={log._id.toString()} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isMapped ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Verified</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">Unmapped</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                      {isMapped ? employeeMap[log.deviceuserid] : `ID: ${log.deviceuserid}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {new Date(log.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                )
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-500">
                    No activity yet today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
