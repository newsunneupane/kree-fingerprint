import dbConnect from '@/lib/mongodb'
import AttendanceLog from '@/models/AttendanceLog'
import Employee from '@/models/Employee'
import { verifySession } from '@/lib/dal'

export const dynamic = 'force-dynamic'

export default async function MonthlySummaryPage() {
  await verifySession()
  await dbConnect()

  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59))

  const [logs, employees] = await Promise.all([
    AttendanceLog.find({ timestamp: { $gte: start, $lte: end } }).sort({ timestamp: 1 }).lean(),
    Employee.find().sort({ name: 1 }).lean(),
  ])

  const summary = employees.map((emp: any) => {
    const empLogs = logs.filter(l => l.deviceuserid === emp.deviceuserid)
    const daysPresent = new Set<string>()
    const dailyGroup: Record<string, any[]> = {}
    empLogs.forEach(l => {
      const d = new Date(l.timestamp).toISOString().split('T')[0]
      daysPresent.add(d)
      if (!dailyGroup[d]) dailyGroup[d] = []
      dailyGroup[d].push(l)
    })
    let totalMinutes = 0
    for (const dayLogs of Object.values(dailyGroup)) {
      if (dayLogs.length >= 2) {
        totalMinutes += (new Date(dayLogs[dayLogs.length - 1].timestamp).getTime() - new Date(dayLogs[0].timestamp).getTime()) / 60000
      }
    }
    return {
      name: emp.name,
      department: emp.department,
      daysPresent: daysPresent.size,
      totalHours: (totalMinutes / 60).toFixed(2),
      totalPunches: empLogs.length,
    }
  })

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Monthly Summary</h2>
      <p className="text-sm text-gray-500 mt-1">{now.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Employee</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Department</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Days</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Hours</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Punches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {summary.map((s, i) => (
                <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{s.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{s.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">{s.daysPresent}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">{s.totalHours}h</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">{s.totalPunches}</td>
                </tr>
              ))}
              {summary.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">No data this month.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
