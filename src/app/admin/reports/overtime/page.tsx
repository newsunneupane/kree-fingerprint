import dbConnect from '@/lib/mongodb'
import AttendanceLog from '@/models/AttendanceLog'
import Employee from '@/models/Employee'
import { verifySession } from '@/lib/dal'

export const dynamic = 'force-dynamic'

export default async function OvertimePage() {
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

  const overtime: any[] = []
  for (const [uid, dates] of Object.entries(dailyLogs)) {
    for (const [date, dayLogs] of Object.entries(dates)) {
      if (dayLogs.length >= 2) {
        const last = dayLogs[dayLogs.length - 1]
        const hour = new Date(last.timestamp).getUTCHours()
        const min = new Date(last.timestamp).getUTCMinutes()
        if (hour > 18) {
          overtime.push({
            employeeName: empMap[uid] || `ID: ${uid}`,
            date: new Date(last.timestamp).toLocaleDateString('en-US', { timeZone: 'Asia/Kathmandu' }),
            hours: ((hour - 18) * 60 + min) / 60,
          })
        }
      }
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Overtime Report</h2>
      <p className="text-sm text-gray-500 mt-1">{now.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Employee</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Overtime (hrs)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {overtime.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{item.employeeName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{item.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-blue-600">{item.hours.toFixed(2)}h</td>
                </tr>
              ))}
              {overtime.length === 0 && <tr><td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-500">No overtime this month.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
