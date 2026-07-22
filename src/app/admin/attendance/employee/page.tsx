'use client'

import { useState, useEffect } from 'react'
import { getEmployeeAttendance, getAllEmployees } from '@/actions/attendance'

type DailyData = Record<string, string[]>
type WeeklyData = Record<string, { count: number; date: string }>
type MonthlyChart = { date: string; punches: number; times: string[]; types: { time: string; type: string }[] }[]

export default function EmployeeAttendancePage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [data, setData] = useState<{
    employee: any; totalPunches: number; daysPresent: number
    daily: DailyData; weekly: WeeklyData; monthlyChart: MonthlyChart; today: string[]
  } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getAllEmployees().then(setEmployees)
  }, [])

  useEffect(() => {
    if (!selectedId) return
    const emp = employees.find(e => e._id === selectedId)
    if (!emp) return
    setLoading(true)
    getEmployeeAttendance(emp.deviceuserid).then(result => {
      setData(result as any)
      setLoading(false)
    })
  }, [selectedId, employees])

  const maxWeekly = Math.max(1, ...Object.values(data?.weekly || {}).map(w => w.count))
  const maxMonthly = Math.max(1, ...(data?.monthlyChart || []).map(m => m.punches))

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Employee Attendance</h2>
      <p className="text-sm text-gray-500 mt-1">View attendance details for individual employees</p>

      <div className="mt-6 max-w-md">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white"
        >
          <option value="">Choose an employee...</option>
          {employees.map((emp: any) => (
            <option key={emp._id} value={emp._id}>{emp.name} - {emp.department} (ID: {emp.deviceuserid})</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-500 mt-6">Loading attendance data...</p>}

      {data && !loading && (
        <div className="mt-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{data.employee?.name}</p>
              <p className="text-xs text-gray-500">{data.employee?.department}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Punches</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{data.totalPunches}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Days Present</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{data.daysPresent}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Today's Punches</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{data.today.length}</p>
            </div>
          </div>

          {/* Weekly Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Attendance</h3>
            <div className="flex items-end gap-2 h-40">
              {Object.entries(data.weekly).map(([day, info]) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-gray-700">{info.count}</span>
                  <div
                    className="w-full bg-gray-900 rounded-t transition-all duration-500"
                    style={{ height: `${(info.count / maxWeekly) * 120}px`, minHeight: info.count > 0 ? '4px' : '2px' }}
                  />
                  <span className="text-[10px] text-gray-500 mt-1">{day.slice(0, 3)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Punch Times */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Punch Times</h3>
            {data.today.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700">Today: {data.today.join(', ')}</p>
              </div>
            )}
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-2 text-xs font-bold uppercase text-gray-500">Date</th>
                    <th className="px-4 py-2 text-xs font-bold uppercase text-gray-500">Punches</th>
                    <th className="px-4 py-2 text-xs font-bold uppercase text-gray-500">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.monthlyChart.slice().reverse().map(day => (
                    <tr key={day.date} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold">
                          {day.punches}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        <div className="flex flex-wrap gap-1">
                          {(day.types || day.times.map((t: string) => ({ time: t, type: '' }))).map((entry: any, i: number) => (
                            <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                              entry.type === 'in'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : entry.type === 'out'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                  : 'bg-gray-50 text-gray-700 border border-gray-100'
                            }`}>
                              {entry.time}
                              {entry.type && <span className="font-semibold">{entry.type === 'in' ? 'IN' : 'OUT'}</span>}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data.monthlyChart.length === 0 && (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-500">No attendance data this month.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Bar Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Punch Count (This Month)</h3>
            <div className="flex items-end gap-1 h-48 overflow-x-auto pb-2">
              {data.monthlyChart.map(day => (
                <div key={day.date} className="flex flex-col items-center gap-1 min-w-[32px]">
                  <span className="text-[10px] font-medium text-gray-700">{day.punches}</span>
                  <div
                    className="w-full bg-blue-600 rounded-t transition-all duration-300"
                    style={{ height: `${(day.punches / maxMonthly) * 140}px`, minHeight: day.punches > 0 ? '4px' : '2px', maxWidth: '40px' }}
                  />
                  <span className="text-[9px] text-gray-500 rotate-45 origin-left whitespace-nowrap">
                    {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
              {data.monthlyChart.length === 0 && (
                <p className="text-sm text-gray-500 w-full text-center pt-12">No data this month.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {!selectedId && !loading && (
        <div className="mt-12 text-center text-gray-400">
          <p className="text-5xl mb-4">📊</p>
          <p>Select an employee above to view their attendance charts</p>
        </div>
      )}
    </div>
  )
}
