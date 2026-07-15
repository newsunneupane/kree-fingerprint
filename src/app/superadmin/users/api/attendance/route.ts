import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Attendance from '@/models/Attendance';

export async function GET() {
    try {
        await connectDB();
        const users = await User.find({ status: 'Active' });
        
        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);

        const roster = await Promise.all(users.map(async (user) => {
            const latestScan = await Attendance.findOne({
                deviceUserId: user.deviceUserId,
                timestamp: { $gte: startOfDay }
            }).sort({ timestamp: -1 });

            return {
                id: user._id,
                name: user.name,
                deviceUserId: user.deviceUserId,
                lastScanTime: latestScan ? latestScan.timestamp : null,
                currentStatus: latestScan ? latestScan.type : 'Absent'
            };
        }));

        return NextResponse.json(roster);
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to compile status feed' }, { status: 500 });
    }
}