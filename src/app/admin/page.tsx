import dbConnect from "@/lib/mongodb";
import AttendanceLog from "@/models/AttendanceLog";
import Employee from "@/models/Employee";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await dbConnect();

  // 1. Lock the server time to Nepal (+05:45) so Vercel's Washington servers 
  // don't show the wrong "Today" during the time difference.
  const serverNow = new Date();
  const nepalNow = new Date(serverNow.getTime() + (5 * 60 + 45) * 60000);

  // 2. Calculate boundaries using Nepal's current calendar date, formatted as UTC 
  // to match how the raw ZKTeco machine saves timestamps in MongoDB.
  const startOfToday = new Date(Date.UTC(nepalNow.getUTCFullYear(), nepalNow.getUTCMonth(), nepalNow.getUTCDate(), 0, 0, 0));
  const endOfToday = new Date(Date.UTC(nepalNow.getUTCFullYear(), nepalNow.getUTCMonth(), nepalNow.getUTCDate(), 23, 59, 59));

  // Fetch ONLY today's logs
  const logs = await AttendanceLog.find({ 
    timestamp: { $gte: startOfToday, $lte: endOfToday } 
  }).sort({ timestamp: -1 }).lean();

  const userIds = [...new Set(logs.map((log) => log.deviceuserid))];
  const employees = await Employee.find({ deviceuserid: { $in: userIds } }).lean();
  
  const employeeMap: Record<string, string> = {};
  employees.forEach((emp: any) => {
    employeeMap[emp.deviceuserid] = emp.name;
  });

  const unmappedScans = logs.filter(log => !employeeMap[log.deviceuserid]).length;

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Today's Overview</h2>
        <p className="text-sm text-gray-500 mt-1">Live punch data for {nepalNow.toISOString().split('T')[0]}</p>
      </div>

      {/* --- Metric Cards Row --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Scans Today</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{logs.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Staff Today</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{userIds.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Unmapped Scans</p>
          <p className={`text-4xl font-bold mt-2 ${unmappedScans > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
            {unmappedScans}
          </p>
        </div>
      </div>

      {/* --- Today's Logs Table --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Today's Live Activity Feed</h2>
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
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Verified</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">Unmapped</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                      {employeeName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-500">
                      {log.sn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600 font-medium">
                      {new Date(log.timestamp).toLocaleString("en-US", { timeZone: "UTC", hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                    No biometric scans recorded yet today.
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