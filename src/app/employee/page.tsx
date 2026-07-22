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

export default async function EmployeeDashboard() {
  const session = await verifySession()
  if (!session) return null

  await dbConnect()
  const employee = await getCurrentEmployee()

  const serverNow = new Date()
  const nepalNow = new Date(serverNow.getTime() + (5 * 60 + 45) * 60000)
  const startOfToday = new Date(Date.UTC(nepalNow.getUTCFullYear(), nepalNow.getUTCMonth(), nepalNow.getUTCDate(), 0, 0, 0))
  const endOfToday = new Date(Date.UTC(nepalNow.getUTCFullYear(), nepalNow.getUTCMonth(), nepalNow.getUTCDate(), 23, 59, 59))

  let lastPunch = null
  let todayPunches: any[] = []
  if (employee) {
    lastPunch = await AttendanceLog.findOne({ deviceuserid: employee.deviceuserid }).sort({ timestamp: -1 }).lean()
    todayPunches = await AttendanceLog.find({
      deviceuserid: employee.deviceuserid,
      timestamp: { $gte: startOfToday, $lte: endOfToday }
    }).sort({ timestamp: -1 }).lean()
  }

  const clockInfo = getClockStatus(lastPunch?.type, todayPunches.length)

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
        {employee ? `Welcome, ${employee.name}` : 'Employee Dashboard'}
      </h2>
      <p className="text-sm text-gray-500 mt-1">Here is your attendance overview.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Today's Punches</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{todayPunches.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Last Punch</p>
          <p className="text-lg font-bold text-gray-900 mt-2">
            {lastPunch ? new Date(lastPunch.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }) : 'N/A'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Status</p>
          <p className={`text-2xl font-bold mt-2 ${clockInfo.color}`}>{clockInfo.status}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">Quick Access</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
          <a href="/employee/today" className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <span className="text-3xl">📋</span>
            <span className="text-sm font-medium text-gray-700">Today</span>
          </a>
          <a href="/employee/reports/daily" className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <span className="text-3xl">📅</span>
            <span className="text-sm font-medium text-gray-700">Daily Report</span>
          </a>
          <a href="/employee/reports/weekly" className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <span className="text-3xl">📆</span>
            <span className="text-sm font-medium text-gray-700">Weekly Report</span>
          </a>
          <a href="/employee/reports/monthly" className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <span className="text-3xl">📊</span>
            <span className="text-sm font-medium text-gray-700">Monthly Report</span>
          </a>
          <a href="/employee/history" className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <span className="text-3xl">📜</span>
            <span className="text-sm font-medium text-gray-700">History</span>
          </a>
          <a href="/employee/leave" className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <span className="text-3xl">🏖</span>
            <span className="text-sm font-medium text-gray-700">Leave</span>
          </a>
        </div>
      </div>
    </div>
  )
}
