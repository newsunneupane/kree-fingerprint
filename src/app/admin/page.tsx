import dbConnect from "@/lib/mongodb";
import AttendanceLog from "@/models/AttendanceLog";
import Employee from "@/models/Employee";
import { addEmployee } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await dbConnect();

  // 1. Fetch data
  const logs = await AttendanceLog.find({}).sort({ timestamp: -1 }).limit(50).lean();
  const userIds = [...new Set(logs.map((log) => log.deviceuserid))];
  const employees = await Employee.find({ deviceuserid: { $in: userIds } }).lean();
  
  const employeeMap: Record<string, string> = {};
  employees.forEach((emp: any) => {
    employeeMap[emp.deviceuserid] = emp.name;
  });

  // Calculate quick stats for the UI cards
  const totalRegistered = employees.length;
  const unmappedScans = logs.filter(log => !employeeMap[log.deviceuserid]).length;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* --- Top Navigation Header --- */}
      <header className="bg-white border-b border-gray-200 px-8 py-6 mb-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Attendance Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Real-time biometric sync overview</p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              System Online
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 space-y-8">
        
        {/* --- Metric Cards Row --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Recent Scans</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{logs.length}</p>
            <p className="text-xs text-gray-400 mt-2">Latest 50 local punches</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Employees</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{totalRegistered}</p>
            <p className="text-xs text-gray-400 mt-2">Mapped in this view</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Unmapped Scans</p>
            <p className={`text-4xl font-bold mt-2 ${unmappedScans > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
              {unmappedScans}
            </p>
            <p className="text-xs text-gray-400 mt-2">Requires registration</p>
          </div>
        </div>

        {/* --- Add Employee Form Section --- */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="mb-5 border-b border-gray-100 pb-4">
            <h2 className="text-lg font-semibold text-gray-900">Register New Mapping</h2>
            <p className="text-xs text-gray-500 mt-1">Link a raw machine ID to a human employee name.</p>
          </div>
          
          <form action={addEmployee} className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Full Name</label>
              <input 
                name="name" 
                type="text" 
                required
                placeholder="e.g. John Doe"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Device ID</label>
              <input 
                name="deviceuserid" 
                type="text" 
                required
                placeholder="e.g. 2"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Department</label>
              <input 
                name="department" 
                type="text" 
                placeholder="e.g. Engineering"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div>
              <button 
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded-lg text-sm shadow-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                Link Employee
              </button>
            </div>
          </form>
        </div>

        {/* --- Attendance Logs Table Section --- */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Live Activity Feed</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-white">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Employee</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Device SN</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log: any) => {
                  const isMapped = !!employeeMap[log.deviceuserid];
                  const employeeName = isMapped ? employeeMap[log.deviceuserid] : `ID: ${log.deviceuserid}`;

                  return (
                    <tr key={log._id.toString()} className="bg-white hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isMapped ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                            Unmapped
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`font-semibold ${isMapped ? 'text-gray-900' : 'text-amber-700'}`}>
                            {employeeName}
                          </span>
                          {!isMapped && (
                            <span className="text-[11px] text-gray-500 mt-0.5">Needs registration</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-500">
                        {log.sn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600 font-medium">
                        {new Date(log.timestamp).toLocaleString("en-US", {
                          timeZone: "UTC", // Preserves the exact machine time
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  );
                })}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                      No biometric scans found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}