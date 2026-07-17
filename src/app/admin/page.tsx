import dbConnect from "@/lib/mongodb";
import AttendanceLog from "@/models/AttendanceLog";
import Employee from "@/models/Employee";
import { addEmployee } from "./actions"; // Import our new action

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

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Biometric Attendance Portal</h1>
        <p className="text-sm text-gray-500">Manage device registrations and track real-time punches.</p>
      </div>

      {/* --- Add Employee Form Section --- */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Register New Employee Mapping</h2>
        
        <form action={addEmployee} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
            <input 
              name="name" 
              type="text" 
              required
              placeholder="e.g. John Doe"
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Device User ID (from machine)</label>
            <input 
              name="deviceuserid" 
              type="text" 
              required
              placeholder="e.g. 2"
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
            <input 
              name="department" 
              type="text" 
              placeholder="e.g. Engineering"
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
          
          <div>
            <button 
              type="submit"
              className="w-full bg-gray-950 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors cursor-pointer"
            >
              Link Employee
            </button>
          </div>
        </form>
      </div>

      {/* --- Attendance Logs Table Section --- */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Live Activity Feed</h2>
        <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Device SN</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Employee Name</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => {
                const employeeName = employeeMap[log.deviceuserid] || `Unregistered (ID: ${log.deviceuserid})`;

                return (
                  <tr key={log._id.toString()} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono text-sm text-gray-400">{log.sn}</td>
                    <td className={`p-4 font-medium ${employeeMap[log.deviceuserid] ? 'text-gray-900' : 'text-amber-600 font-normal'}`}>
                      {employeeName}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-sm text-gray-400">
                    No attendance logs received yet. Check device connection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}