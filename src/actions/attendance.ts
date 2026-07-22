'use server'

import dbConnect from '@/lib/mongodb'
import AttendanceLog from '@/models/AttendanceLog'
import Employee from '@/models/Employee'

export async function getEmployeeAttendance(deviceuserid: string) {
  await dbConnect()

  const now = new Date()
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0))
  const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59))

  const logs = await AttendanceLog.find({
    deviceuserid,
    timestamp: { $gte: startOfMonth, $lte: endOfMonth },
  }).sort({ timestamp: 1 }).lean()

  const emp = await Employee.findOne({ deviceuserid }).lean()

  const daily: Record<string, string[]> = {}
  const dailyTypes: Record<string, { time: string; type: string }[]> = {}
  for (const log of logs) {
    const d = new Date(log.timestamp).toISOString().split('T')[0]
    const t = new Date(log.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit' })
    if (!daily[d]) daily[d] = []
    if (!dailyTypes[d]) dailyTypes[d] = []
    daily[d].push(t)
    dailyTypes[d].push({ time: t, type: log.type || '' })
  }

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const weeklyData: Record<string, { count: number; date: string }> = {}
  const dayOfWeek = now.getDay()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - dayOfWeek)
  weekStart.setHours(0, 0, 0, 0)
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    const key = d.toISOString().split('T')[0]
    weeklyData[weekDays[i]] = { count: daily[key]?.length || 0, date: key }
  }

  const monthDays = Object.keys(daily).sort()
  const monthlyChart = monthDays.map(d => ({
    date: d,
    punches: daily[d].length,
    times: daily[d],
    types: dailyTypes[d] || [],
  }))

  const totalMinutes = Object.values(daily).reduce((sum, times) => {
    if (times.length >= 2) return sum + 0
    return sum
  }, 0)

  return {
    employee: emp ? { name: emp.name, department: emp.department, deviceuserid: emp.deviceuserid } : null,
    totalPunches: logs.length,
    daysPresent: Object.keys(daily).length,
    daily,
    weekly: weeklyData,
    monthlyChart,
    today: daily[new Date().toISOString().split('T')[0]] || [],
  }
}

export async function getAllEmployees() {
  await dbConnect()
  const employees = await Employee.find().sort({ name: 1 }).select('name deviceuserid department').lean()
  return employees.map(e => ({ ...e, _id: e._id.toString() }))
}
