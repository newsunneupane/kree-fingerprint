import dbConnect from '@/lib/mongodb'
import Holiday from '@/models/Holiday'
import { verifySession } from '@/lib/dal'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

async function addHoliday(formData: FormData) {
  'use server'
  await dbConnect()
  const name = formData.get('name') as string
  const date = formData.get('date') as string
  await Holiday.create({ name, date: new Date(date) })
  revalidatePath('/admin/holidays')
}

async function deleteHoliday(formData: FormData) {
  'use server'
  await dbConnect()
  const id = formData.get('id') as string
  await Holiday.findByIdAndDelete(id)
  revalidatePath('/admin/holidays')
}

export default async function HolidaysPage() {
  await verifySession()
  await dbConnect()

  const holidays = await Holiday.find().sort({ date: 1 }).lean()

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Holiday Management</h2>
      <p className="text-sm text-gray-500 mt-1">Add and manage holidays</p>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Holiday</h3>
        <form action={addHoliday} className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Holiday Name</label>
            <input name="name" type="text" required placeholder="e.g. Dashain" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-gray-900 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Date</label>
            <input name="date" type="date" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-gray-900 transition-all" />
          </div>
          <button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded-lg text-sm shadow-sm transition-all cursor-pointer">
            Add Holiday
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">Holidays</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-white">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {holidays.map((h: any) => (
                <tr key={h._id.toString()} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{h.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {new Date(h.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <form action={deleteHoliday}>
                      <input type="hidden" name="id" value={h._id.toString()} />
                      <button type="submit" className="text-xs text-red-600 border border-red-200 px-2.5 py-1 rounded-md hover:bg-red-50 cursor-pointer">Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
              {holidays.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-500">No holidays added yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
