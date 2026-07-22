import dbConnect from '@/lib/mongodb'
import AttendanceLog from '@/models/AttendanceLog'
import { verifySession, getCurrentEmployee } from '@/lib/dal'

export const dynamic = 'force-dynamic'

export default async function MonthlyReportPage() {
  await verifySession()
  await dbConnect()
  const employee = await getCurrentEmployee()

  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59))

  let logs: any[] = []
  if (employee) {
    logs = await AttendanceLog.find({
      deviceuserid: employee.deviceuserid,
      timestamp: { $gte: start, $lte: end }
    }).sort({ timestamp: 1 }).lean()
  }

  const dailyData: Record<string, any[]> = {}
  for (const log of logs) {
    const d = new Date(log.timestamp).toISOString().split('T')[0]
    if (!dailyData[d]) dailyData[d] = []
    dailyData[d].push(log)
  }

  const sortedDates = Object.keys(dailyData).sort()
  let totalDaysWorked = 0
  let totalMinutes = 0
  let totalPunches = logs.length

  for (const date of sortedDates) {
    const dayLogs = dailyData[date]
    if (dayLogs.length > 0) totalDaysWorked++
    if (dayLogs.length >= 2) {
      totalMinutes += (new Date(dayLogs[dayLogs.length - 1].timestamp).getTime() - new Date(dayLogs[0].timestamp).getTime()) / 60000
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Monthly Report</h2>
      <p className="text-sm text-gray-500 mt-1">
        {employee?.name} — {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Days Present</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalDaysWorked}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{(totalMinutes / 60).toFixed(2)}h</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Punches</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalPunches}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Hours/Day</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {totalDaysWorked > 0 ? ((totalMinutes / 60) / totalDaysWorked).toFixed(2) : '0.00'}h
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Day</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Punches</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">First Scan</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Last Scan</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedDates.map(date => {
                const dayLogs = dailyData[date]
                const dt = new Date(date + 'T00:00:00')
                const dayName = dt.toLocaleDateString('en-US', { weekday: 'short' })
                const firstScan = dayLogs[0]
                const lastScan = dayLogs[dayLogs.length - 1]
                const hours = dayLogs.length >= 2
                  ? ((new Date(lastScan.timestamp).getTime() - new Date(firstScan.timestamp).getTime()) / 3600000).toFixed(2)
                  : '—'
                const isToday = date === now.toISOString().split('T')[0]

                return (
                  <tr key={date} className={`hover:bg-gray-50/80 transition-colors ${isToday ? 'bg-gray-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                      {dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {isToday && <span className="ml-2 text-xs text-gray-500">(Today)</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dayName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold">
                        {dayLogs.length}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                      {new Date(firstScan.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                      {new Date(lastScan.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{hours}</td>
                  </tr>
                )
              })}
              {sortedDates.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    No attendance records this month.
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