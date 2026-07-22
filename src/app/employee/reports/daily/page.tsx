import dbConnect from '@/lib/mongodb'
import AttendanceLog from '@/models/AttendanceLog'
import { verifySession, getCurrentEmployee } from '@/lib/dal'

export const dynamic = 'force-dynamic'

function getClockStatus(lastPunchType: string | undefined, todayPunchesCount: number) {
  if (lastPunchType === 'in') return { status: 'Clocked In', color: 'text-amber-600' }
  if (lastPunchType === 'out') return { status: 'Clocked Out', color: 'text-emerald-600' }
  return todayPunchesCount % 2 === 0
    ? { status: 'Clocked Out', color: 'text-emerald-600' }
    : { status: 'Clocked In', color: 'text-amber-600' }
}

export default async function DailyReportPage() {
  await verifySession()
  await dbConnect()
  const employee = await getCurrentEmployee()

  const serverNow = new Date()
  const nepalNow = new Date(serverNow.getTime() + (5 * 60 + 45) * 60000)
  const startOfToday = new Date(Date.UTC(nepalNow.getUTCFullYear(), nepalNow.getUTCMonth(), nepalNow.getUTCDate(), 0, 0, 0))
  const endOfToday = new Date(Date.UTC(nepalNow.getUTCFullYear(), nepalNow.getUTCMonth(), nepalNow.getUTCDate(), 23, 59, 59))

  let logs: any[] = []
  let firstPunch = null
  let lastPunch = null
  let totalHours = '0.00'

  if (employee) {
    logs = await AttendanceLog.find({
      deviceuserid: employee.deviceuserid,
      timestamp: { $gte: startOfToday, $lte: endOfToday }
    }).sort({ timestamp: 1 }).lean()

    if (logs.length > 0) {
      firstPunch = logs[0]
      lastPunch = logs[logs.length - 1]
      if (logs.length >= 2) {
        const ms = new Date(lastPunch.timestamp).getTime() - new Date(firstPunch.timestamp).getTime()
        totalHours = (ms / 3600000).toFixed(2)
      }
    }
  }

  const clockInfo = getClockStatus(lastPunch?.type, logs.length)

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Daily Report</h2>
      <p className="text-sm text-gray-500 mt-1">{employee?.name} — {nepalNow.toISOString().split('T')[0]}</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</p>
          <p className={`text-xl font-bold mt-1 ${clockInfo.color}`}>{clockInfo.status}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Punches</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{logs.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">First Punch</p>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {firstPunch ? new Date(firstPunch.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit' }) : '—'}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalHours}h</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">#</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Time</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log: any, i: number) => (
                <tr key={log._id.toString()} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">{i + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {new Date(log.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.type === 'in' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Clock In</span>
                    ) : log.type === 'out' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">Clock Out</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-100">Scan</span>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-500">
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