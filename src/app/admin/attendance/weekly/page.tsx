import dbConnect from '@/lib/mongodb'
import AttendanceLog from '@/models/AttendanceLog'
import Employee from '@/models/Employee'
import { verifySession } from '@/lib/dal'

export const dynamic = 'force-dynamic'

export default async function WeeklyAttendancePage() {
  await verifySession()
  await dbConnect()

  const now = new Date()
  const dayOfWeek = now.getDay()
  const start = new Date(now)
  start.setDate(now.getDate() - dayOfWeek)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  const employees = await Employee.find().lean()
  const empMap: Record<string, any> = {}
  employees.forEach(e => { empMap[e.deviceuserid] = e })
  const logs = await AttendanceLog.find({ timestamp: { $gte: start, $lte: end } }).sort({ timestamp: -1 }).lean()

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Weekly Attendance</h2>
      <p className="text-sm text-gray-500 mt-1">{start.toLocaleDateString()} - {end.toLocaleDateString()}</p>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Employee</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log: any) => {
                const emp = empMap[log.deviceuserid]
                const dt = new Date(log.timestamp)
                return (
                  <tr key={log._id.toString()} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{emp?.name || `ID: ${log.deviceuserid}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{dt.toLocaleDateString('en-US', { timeZone: 'Asia/Kathmandu' })}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{dt.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                )
              })}
              {logs.length === 0 && <tr><td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-500">No records this week.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
