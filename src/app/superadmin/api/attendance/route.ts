export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/Users';
import Attendance from '@/models/Attendance';

export async function GET() {
    try {
        await connectDB();
        const users = await User.find({ status: 'Active' });
        
        // Broaden the search window to 48 hours to guarantee timezone-shifted logs are caught
        const past48Hours = new Date();
        past48Hours.setHours(past48Hours.getHours() - 48);

        const roster = await Promise.all(users.map(async (user) => {
            // Convert to string safely to ensure exact match regardless of DB type schema
            const searchId = String(user.deviceUserId);

            // Fetch logs matching either string or number variant
            const userLogs = await Attendance.find({
                deviceUserId: { $in: [searchId, Number(searchId)] },
                timestamp: { $gte: past48Hours }
            }).sort({ timestamp: 1 });

            const totalScans = userLogs.length;
            const firstScan = totalScans > 0 ? userLogs[0] : null;
            const latestScan = totalScans > 0 ? userLogs[totalScans - 1] : null;

            const checkIns = userLogs.filter(log => log.type === 'Check-In').length;
            const checkOuts = userLogs.filter(log => log.type === 'Check-Out').length;

            return {
                id: user._id,
                name: user.name,
                deviceUserId: searchId,
                currentStatus: latestScan ? latestScan.type : 'Absent',
                firstInTime: firstScan ? firstScan.timestamp : null,
                lastScanTime: latestScan ? latestScan.timestamp : null,
                checkInsToday: checkIns,
                checkOutsToday: checkOuts
            };
        }));

        return NextResponse.json(roster);
    } catch (error: any) {
        console.error("Dashboard Aggregator Error:", error);
        return NextResponse.json({ error: 'Failed to compile status feed' }, { status: 500 });
    }
}