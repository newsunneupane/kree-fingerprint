import dbConnect from '@/lib/mongodb'
import AttendanceLog from '@/models/AttendanceLog'
import { verifySession, getCurrentEmployee } from '@/lib/dal'

export const dynamic = 'force-dynamic'

export default async function MonthlyHoursPage() {
  await verifySession()
  await dbConnect()
  const employee = await getCurrentEmployee()

  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59))

  let daysPresent = 0
  let totalHours = '0.00'

  if (employee) {
    const logs = await AttendanceLog.find({
      deviceuserid: employee.deviceuserid,
      timestamp: { $gte: start, $lte: end }
    }).sort({ timestamp: 1 }).lean()

    const days = new Set<string>()
    const dailyGroup: Record<string, any[]> = {}
    for (const log of logs) {
      const d = new Date(log.timestamp).toISOString().split('T')[0]
      days.add(d)
      if (!dailyGroup[d]) dailyGroup[d] = []
      dailyGroup[d].push(log)
    }
    daysPresent = days.size

    let minutes = 0
    for (const dayLogs of Object.values(dailyGroup)) {
      if (dayLogs.length >= 2) {
        minutes += (new Date(dayLogs[dayLogs.length - 1].timestamp).getTime() - new Date(dayLogs[0].timestamp).getTime()) / 60000
      }
    }
    totalHours = (minutes / 60).toFixed(2)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Monthly Hours</h2>
      <p className="text-sm text-gray-500 mt-1">{employee?.name} — {now.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Days Present</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{daysPresent}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Hours</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{totalHours}h</p>
        </div>
      </div>
    </div>
  )
}
