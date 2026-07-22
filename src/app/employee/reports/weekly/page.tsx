import dbConnect from '@/lib/mongodb'
import AttendanceLog from '@/models/AttendanceLog'
import { verifySession, getCurrentEmployee } from '@/lib/dal'

export const dynamic = 'force-dynamic'

export default async function WeeklyReportPage() {
  await verifySession()
  await dbConnect()
  const employee = await getCurrentEmployee()

  const now = new Date()
  const dayOfWeek = now.getDay()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - dayOfWeek)
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  let logs: any[] = []
  if (employee) {
    logs = await AttendanceLog.find({
      deviceuserid: employee.deviceuserid,
      timestamp: { $gte: weekStart, $lte: weekEnd }
    }).sort({ timestamp: 1 }).lean()
  }

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dailyData: Record<string, any[]> = {}
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    dailyData[d.toISOString().split('T')[0]] = []
  }
  for (const log of logs) {
    const d = new Date(log.timestamp).toISOString().split('T')[0]
    if (dailyData[d]) dailyData[d].push(log)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Weekly Report</h2>
      <p className="text-sm text-gray-500 mt-1">
        {employee?.name} — {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Days Present</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{Object.values(dailyData).filter(d => d.length > 0).length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Punches</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{logs.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {(() => {
              let mins = 0
              for (const dayLogs of Object.values(dailyData)) {
                if (dayLogs.length >= 2) {
                  mins += (new Date(dayLogs[dayLogs.length - 1].timestamp).getTime() - new Date(dayLogs[0].timestamp).getTime()) / 60000
                }
              }
              return (mins / 60).toFixed(2)
            })()}h
          </p>
        </div>
      </div>

      {weekDays.map((dayName, i) => {
        const d = new Date(weekStart)
        d.setDate(weekStart.getDate() + i)
        const dateKey = d.toISOString().split('T')[0]
        const dayLogs = dailyData[dateKey] || []
        const isToday = dateKey === now.toISOString().split('T')[0]

        return (
          <div key={dateKey} className={`bg-white rounded-xl border ${isToday ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-200'} shadow-sm overflow-hidden mt-4`}>
            <div className={`px-6 py-3 ${isToday ? 'bg-gray-900' : 'bg-gray-50'} border-b border-gray-200 flex items-center justify-between`}>
              <h3 className={`text-sm font-semibold ${isToday ? 'text-white' : 'text-gray-900'}`}>
                {dayName} <span className="text-xs opacity-75">{new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                {isToday && <span className="ml-2 text-xs bg-white text-gray-900 px-2 py-0.5 rounded-full">Today</span>}
              </h3>
              <span className={`text-xs font-medium ${dayLogs.length > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                {dayLogs.length > 0 ? `${dayLogs.length} punch${dayLogs.length > 1 ? 'es' : ''}` : 'No records'}
              </span>
            </div>
            {dayLogs.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-gray-100">
                    {dayLogs.map((log: any) => (
                      <tr key={log._id.toString()} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-3 whitespace-nowrap text-gray-600 text-sm">
                          {new Date(log.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          {log.type === 'in' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Clock In</span>
                          ) : log.type === 'out' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">Clock Out</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-700 border border-gray-100">Scan</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}

      {logs.length === 0 && (
        <div className="mt-6 text-center text-sm text-gray-500 py-12">No attendance records this week.</div>
      )}
    </div>
  )
}