import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Attendance from '@/models/Attendance';

// ZKTeco hardware handshake
// Realtime=1 is the magic switch that makes the POST happen immediately.
    const admsConfig = [
        "GET=1",
        "ErrorDelay=30",
        "Delay=10",
        "TransTimes=00:00;14:00",
        "TransInterval=1",
        "TransFlag=1111000000",
        "Realtime=1",
        "Encrypt=0"
    ].join('\n');

    return new NextResponse(admsConfig, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain'
        }
    });


// ZKTeco hardware data push
export async function POST(req: Request) {
    try {
        const rawData = await req.text();
        const lines = rawData.split(/\r?\n/).filter(line => line.trim() !== '');
        
        await connectDB();

        for (const line of lines) {
            if (line.startsWith('USER') || line.startsWith('OPLOG')) continue;

            const parts = line.split('\t');
            if (parts.length >= 2) {
                const deviceUserId = parts[0].trim();
                const timestamp = new Date(parts[1].trim());
                
                const statusCode = parts[2] ? parts[2].trim() : '0';
                const type = statusCode === '1' ? 'Check-Out' : 'Check-In';
                
                const existingLog = await Attendance.findOne({
                    deviceUserId,
                    timestamp
                });

                if (!existingLog) {
                    await Attendance.create({ deviceUserId, timestamp, type });
                    console.log(`✅ ADMS Logged: User ${deviceUserId} (${type})`);
                }
            }
        }

        return new NextResponse('OK', { 
            status: 200, 
            headers: { 'Content-Type': 'text/plain' } 
        });
        
    } catch (error) {
        console.error("❌ ADMS Processing Error:", error);
        return new NextResponse('ERROR', { status: 500 });
    }
}