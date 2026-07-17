import dbConnect from "@/lib/mongodb";
import AttendanceLog from "@/models/AttendanceLog";

// Forces the route to render dynamically on every request
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await dbConnect();

  // Fetch the latest 50 logs, sorted by newest first
  const logs = await AttendanceLog.find({})
    .sort({ timestamp: -1 })
    .limit(50)
    .lean();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Biometric Attendance Logs</h1>
      
      <div className="overflow-x-auto shadow-sm rounded-lg border">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-4 font-semibold text-gray-700">Device SN</th>
              <th className="p-4 font-semibold text-gray-700">User ID</th>
              <th className="p-4 font-semibold text-gray-700">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log: any) => (
              <tr key={log._id.toString()} className="border-b hover:bg-gray-50">
                <td className="p-4 font-mono text-sm text-gray-500">{log.sn}</td>
                <td className="p-4 font-semibold">{log.deviceuserid}</td>
                <td className="p-4 text-gray-600">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">
                  No attendance logs received yet. Check device connection.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}