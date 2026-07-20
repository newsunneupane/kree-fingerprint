import dbConnect from '@/lib/mongodb'
import AttendanceLog from '@/models/AttendanceLog'
import { verifySession, getCurrentEmployee } from '@/lib/dal'

export const dynamic = 'force-dynamic'

export default async function TodayPage() {
  await verifySession()
  await dbConnect()
  const employee = await getCurrentEmployee()

  const serverNow = new Date()
  const nepalNow = new Date(serverNow.getTime() + (5 * 60 + 45) * 60000)
  const startOfToday = new Date(Date.UTC(nepalNow.getUTCFullYear(), nepalNow.getUTCMonth(), nepalNow.getUTCDate(), 0, 0, 0))
  const endOfToday = new Date(Date.UTC(nepalNow.getUTCFullYear(), nepalNow.getUTCMonth(), nepalNow.getUTCDate(), 23, 59, 59))

  const logs = employee ? await AttendanceLog.find({
    deviceuserid: employee.deviceuserid,
    timestamp: { $gte: startOfToday, $lte: endOfToday }
  }).sort({ timestamp: -1 }).lean() : []

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Today's Attendance</h2>
      <p className="text-sm text-gray-500 mt-1">{employee?.name} — {nepalNow.toISOString().split('T')[0]}</p>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Time</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log: any) => (
                <tr key={log._id.toString()} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {new Date(log.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Verified</span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center text-sm text-gray-500">
                    No attendance records for today.
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
