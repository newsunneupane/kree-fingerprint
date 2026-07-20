import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { verifySession, getCurrentEmployee } from '@/lib/dal'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const session = await verifySession()
  if (!session) return null

  await dbConnect()
  const [user, employee] = await Promise.all([
    User.findById(session.userId).select('-password').lean() as any,
    getCurrentEmployee(),
  ])

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
          <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">{user?.name?.[0] || 'U'}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user?.name || 'User'}</h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-sm font-medium text-gray-900">{user?.email}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-sm text-gray-500">Role</span>
            <span className="text-sm font-medium capitalize text-gray-900">{user?.role}</span>
          </div>
          {employee && (
            <>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Department</span>
                <span className="text-sm font-medium text-gray-900">{employee.department || 'General'}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Device ID</span>
                <span className="text-sm font-medium text-gray-900">{employee.deviceuserid}</span>
              </div>
            </>
          )}
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-sm text-gray-500">Member Since</span>
            <span className="text-sm font-medium text-gray-900">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
