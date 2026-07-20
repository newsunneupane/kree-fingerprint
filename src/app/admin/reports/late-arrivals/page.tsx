import dbConnect from '@/lib/mongodb'
import AttendanceLog from '@/models/AttendanceLog'
import Employee from '@/models/Employee'
import { verifySession } from '@/lib/dal'

export const dynamic = 'force-dynamic'

export default async function LateArrivalsPage() {
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

  const lateArrivals: any[] = []
  const seenDates = new Set()
  for (const log of logs) {
    const dateKey = `${log.deviceuserid}-${new Date(log.timestamp).toISOString().split('T')[0]}`
    if (!seenDates.has(dateKey)) {
      seenDates.add(dateKey)
      const hour = new Date(log.timestamp).getUTCHours()
      const minutes = new Date(log.timestamp).getUTCMinutes()
      if (hour > 9 || (hour === 9 && minutes > 15)) {
        lateArrivals.push({
          employeeName: empMap[log.deviceuserid] || `ID: ${log.deviceuserid}`,
          date: new Date(log.timestamp).toLocaleDateString('en-US', { timeZone: 'Asia/Kathmandu' }),
          time: `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
        })
      }
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Late Arrivals Report</h2>
      <p className="text-sm text-gray-500 mt-1">{now.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Employee</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Arrival Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lateArrivals.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{item.employeeName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{item.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100">{item.time}</span>
                  </td>
                </tr>
              ))}
              {lateArrivals.length === 0 && <tr><td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-500">No late arrivals this month.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
