import dbConnect from '@/lib/mongodb'
import AttendanceLog from '@/models/AttendanceLog'
import Employee from '@/models/Employee'
import { verifySession } from '@/lib/dal'

export const dynamic = 'force-dynamic'

export default async function EarlyLeavingPage() {
  await verifySession()
  await dbConnect()

  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59))

  const [logs, employees] = await Promise.all([
    AttendanceLog.find({ timestamp: { $gte: start, $lte: end } }).sort({ timestamp: 1 }).lean(),
    Employee.find().lean(),
  ])

  const empMap: Record<string, string> = {}
  employees.forEach((e: any) => { empMap[e.deviceuserid] = e.name })

  const dailyLogs: Record<string, Record<string, any[]>> = {}
  for (const log of logs) {
    if (!dailyLogs[log.deviceuserid]) dailyLogs[log.deviceuserid] = {}
    const dateKey = new Date(log.timestamp).toISOString().split('T')[0]
    if (!dailyLogs[log.deviceuserid][dateKey]) dailyLogs[log.deviceuserid][dateKey] = []
    dailyLogs[log.deviceuserid][dateKey].push(log)
  }

  const earlyLeavings: any[] = []
  for (const [uid, dates] of Object.entries(dailyLogs)) {
    for (const [date, dayLogs] of Object.entries(dates)) {
      if (dayLogs.length >= 2) {
        const last = dayLogs[dayLogs.length - 1]
        const hour = new Date(last.timestamp).getUTCHours()
        const min = new Date(last.timestamp).getUTCMinutes()
        if (hour < 17 || (hour === 17 && min < 30)) {
          earlyLeavings.push({
            employeeName: empMap[uid] || `ID: ${uid}`,
            date: new Date(last.timestamp).toLocaleDateString('en-US', { timeZone: 'Asia/Kathmandu' }),
            time: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
          })
        }
      }
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Early Leaving Report</h2>
      <p className="text-sm text-gray-500 mt-1">{now.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Employee</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Departure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {earlyLeavings.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{item.employeeName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{item.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">{item.time}</span>
                  </td>
                </tr>
              ))}
              {earlyLeavings.length === 0 && <tr><td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-500">No early leavings this month.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
