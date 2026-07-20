import dbConnect from "@/lib/mongodb";
import AttendanceLog from "@/models/AttendanceLog";
import Employee from "@/models/Employee";
import { addEmployee } from "../actions";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await dbConnect();

  // Calculate Current Month's Boundaries
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
  const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));

  // Fetch all registered employees
  const employees = await Employee.find({}).sort({ name: 1 }).lean();
  
  // Fetch all logs for this month
  const monthlyLogs = await AttendanceLog.find({
    timestamp: { $gte: startOfMonth, $lte: endOfMonth }
  }).lean();

  // Count punches per employee for the month
  const monthlyPunchCounts: Record<string, number> = {};
  monthlyLogs.forEach((log) => {
    monthlyPunchCounts[log.deviceuserid] = (monthlyPunchCounts[log.deviceuserid] || 0) + 1;
  });

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Staff Management</h2>
        <p className="text-sm text-gray-500 mt-1">Register devices and view monthly scan totals.</p>
      </div>

      {/* --- Add Employee Form --- */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="mb-5 border-b border-gray-100 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">Register New Mapping</h2>
          <p className="text-xs text-gray-500 mt-1">Link a raw machine ID to a human employee name.</p>
        </div>
        
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
          <div>
            <button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded-lg text-sm shadow-sm transition-all active:scale-[0.98] cursor-pointer">
              Link Employee
            </button>
          </div>
        </form>
      </div>

      {/* --- Registered Users Monthly Table --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">Registered Directory (Monthly Stats)</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-white">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Employee Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Department</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Machine ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Scans This Month</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((emp: any) => {
                const monthlyScans = monthlyPunchCounts[emp.deviceuserid] || 0;
                return (
                  <tr key={emp._id.toString()} className="bg-white hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                      {emp.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {emp.department || "General"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-500">
                      {emp.deviceuserid}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {monthlyScans}
                    </td>
                  </tr>
                );
              })}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                    No employees registered yet. Use the form above to link your first device ID.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}