import dbConnect from '@/lib/mongodb'
import Employee from '@/models/Employee'
import { verifySession } from '@/lib/dal'
import { addEmployee, getEmployeeUsers } from '../actions'
import { EmployeeRow } from './EmployeeRow'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

async function deleteEmployee(formData: FormData) {
  'use server'
  await dbConnect()
  const id = formData.get('id') as string
  await Employee.findByIdAndDelete(id)
  revalidatePath('/admin/employees')
}

async function registerFingerprint(formData: FormData) {
  'use server'
  await dbConnect()
  const deviceuserid = formData.get('deviceuserid') as string
  await Employee.findOneAndUpdate({ deviceuserid }, { fingerprintRegistered: true })
  revalidatePath('/admin/employees')
}

export default async function EmployeesPage() {
  await verifySession()
  await dbConnect()
  const employees = await Employee.find().sort({ name: 1 }).lean()
  const empIds = employees.map((e: any) => e._id.toString())
  const userMap: Record<string, string> = {}
  if (empIds.length > 0) {
    const users = await getEmployeeUsers(empIds)
    users.forEach((u: any) => { userMap[u.employeeId] = u.email })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Employee Management</h2>
      <p className="text-sm text-gray-500 mt-1">Add, edit, delete employees, create login credentials, and register fingerprints</p>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Employee</h3>
        <form action={addEmployee} className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Full Name</label>
            <input name="name" type="text" required placeholder="e.g. John Doe" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-gray-900 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Device ID</label>
            <input name="deviceuserid" type="text" required placeholder="e.g. 2" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-gray-900 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Department</label>
            <input name="department" type="text" placeholder="e.g. Engineering" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-gray-900 transition-all" />
          </div>
          <button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded-lg text-sm shadow-sm transition-all active:scale-[0.98] cursor-pointer">
            Add Employee
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">Employees ({employees.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-white">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Department</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Device ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Fingerprint</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Login</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((emp: any) => (
                <EmployeeRow
                  key={emp._id.toString()}
                  emp={JSON.parse(JSON.stringify(emp))}
                  loginEmail={userMap[emp._id.toString()] || null}
                  onDelete={deleteEmployee}
                  onRegisterFingerprint={registerFingerprint}
                />
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    No employees registered yet.
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
