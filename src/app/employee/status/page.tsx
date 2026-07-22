import dbConnect from '@/lib/mongodb'
import AttendanceLog from '@/models/AttendanceLog'
import { verifySession, getCurrentEmployee } from '@/lib/dal'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function getClockStatus(lastPunchType: string | undefined, todayPunchesCount: number) {
  if (lastPunchType === 'in') return { status: 'Clocked In', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: '🔴' }
  if (lastPunchType === 'out') return { status: 'Clocked Out', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: '🟢' }
  return todayPunchesCount % 2 === 0
    ? { status: 'Clocked Out', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: '🟢' }
    : { status: 'Clocked In', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: '🔴' }
}

export default async function StatusPage() {
  await verifySession()
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
    }).sort({ timestamp: 1 }).lean()
  }

  const clockInfo = getClockStatus(lastPunch?.type, todayPunches.length)

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 text-center">My Attendance Status</h2>
      <p className="text-sm text-gray-500 mt-1 text-center">{employee?.name}</p>

      <div className={`mt-8 ${clockInfo.bg} ${clockInfo.border} border-2 rounded-xl p-8 text-center`}>
        <div className="text-7xl mb-4">{clockInfo.icon}</div>
        <p className={`text-3xl font-bold ${clockInfo.color}`}>{clockInfo.status}</p>
        {lastPunch && (
          <p className="text-sm text-gray-500 mt-2">
            Last scan: {new Date(lastPunch.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Today's Activity</h3>
        <div className="mt-3 space-y-2">
          {todayPunches.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No scans today. Use the fingerprint scanner at the office.</p>
          )}
          {todayPunches.map((punch: any) => (
            <div key={punch._id.toString()} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
              <span className="text-sm text-gray-600">
                {new Date(punch.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                punch.type === 'in'
                  ? 'bg-emerald-100 text-emerald-700'
                  : punch.type === 'out'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {punch.type === 'in' ? 'Clock In' : punch.type === 'out' ? 'Clock Out' : 'Scan'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400">
          Scanning is done via the ZKTeco biometric device at the office. Data syncs automatically.
        </p>
        <Link href="/employee/today" className="mt-3 inline-block text-sm text-gray-900 underline hover:text-gray-600">
          View full today&apos;s attendance
        </Link>
      </div>
    </div>
  )
}