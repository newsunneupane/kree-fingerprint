import dbConnect from '@/lib/mongodb'
import LeaveRequest from '@/models/LeaveRequest'
import Employee from '@/models/Employee'
import { verifySession } from '@/lib/dal'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

async function updateLeaveStatus(formData: FormData) {
  'use server'
  await dbConnect()
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  await LeaveRequest.findByIdAndUpdate(id, { status })
  revalidatePath('/admin/leaves')
}

async function deleteLeave(formData: FormData) {
  'use server'
  await dbConnect()
  const id = formData.get('id') as string
  await LeaveRequest.findByIdAndDelete(id)
  revalidatePath('/admin/leaves')
}

export default async function LeavesPage() {
  await verifySession()
  await dbConnect()

  const [leaves, employees] = await Promise.all([
    LeaveRequest.find().sort({ createdAt: -1 }).lean(),
    Employee.find().lean(),
  ])

  const empMap: Record<string, any> = {}
  employees.forEach((e: any) => { empMap[e._id.toString()] = e })

  const pending = leaves.filter(l => l.status === 'pending')
  const approved = leaves.filter(l => l.status === 'approved')
  const rejected = leaves.filter(l => l.status === 'rejected')

  const Section = ({ title, items, color }: { title: string; items: any[]; color: string }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className={`px-6 py-4 border-b border-gray-200 flex items-center gap-2`}>
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <h3 className="text-lg font-semibold text-gray-900">{title} ({items.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Employee</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Type</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Dates</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Reason</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((leave: any) => {
              const emp = empMap[leave.employeeId?.toString() || '']
              return (
                <tr key={leave._id.toString()} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{emp?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm capitalize text-gray-600">{leave.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{leave.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      {leave.status === 'pending' && (
                        <>
                          <form action={updateLeaveStatus}>
                            <input type="hidden" name="id" value={leave._id.toString()} />
                            <input type="hidden" name="status" value="approved" />
                            <button type="submit" className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md hover:bg-emerald-100 cursor-pointer">Approve</button>
                          </form>
                          <form action={updateLeaveStatus}>
                            <input type="hidden" name="id" value={leave._id.toString()} />
                            <input type="hidden" name="status" value="rejected" />
                            <button type="submit" className="text-xs bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-md hover:bg-red-100 cursor-pointer">Reject</button>
                          </form>
                        </>
                      )}
                      <form action={deleteLeave}>
                        <input type="hidden" name="id" value={leave._id.toString()} />
                        <button type="submit" className="text-xs text-gray-500 border border-gray-200 px-2.5 py-1 rounded-md hover:bg-gray-100 cursor-pointer">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              )
            })}
            {items.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No {title.toLowerCase()}.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Leave Management</h2>
      <Section title="Pending" items={pending} color="bg-amber-500" />
      <Section title="Approved" items={approved} color="bg-emerald-500" />
      <Section title="Rejected" items={rejected} color="bg-red-500" />
    </div>
  )
}
