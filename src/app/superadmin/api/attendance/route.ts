import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Attendance from '@/models/Attendance'; // Adjust to your model name

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    
    // 1. HARDWARE HANDSHAKE DETECTION
    // If the URL has query parameters (like SN or options), it's the ZKTeco device!
    if (searchParams.toString().length > 0) {
        const admsConfig = [
            "GET=1",
            "ErrorDelay=30",
            "Delay=10",
            "TransTimes=00:00;14:00",
            "TransInterval=1",
            "TransFlag=1111000000",
            "Realtime=1",
            "Encrypt=0"
        ].join('\r\n') + '\r\n\r\n';

        return new NextResponse(admsConfig, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Content-Length': admsConfig.length.toString(),
                'Connection': 'close'
            }
        });
    }

    // 2. DASHBOARD CONSUMPTION DETECTION
    // If there are no query params, it's your web dashboard requesting logs to display!
    try {
        await connectDB();
        // Fetch logs sorted by newest first
        const logs = await Attendance.find({}).sort({ timestamp: -1 }); 
        
        return NextResponse.json(logs, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch attendance data' }, { status: 500 });
    }
}

// Keep your POST handler exactly the same below...

// 2. POST Handler to capture the incoming fingerprint scan data
export async function POST(request: Request) {
    try {
        await connectDB();
        
        // Read the raw text payload from the ZKTeco machine
        const rawData = await request.text();
        
        // Log it to Vercel so you can inspect the incoming text format
        console.log("Raw ZKTeco Punch Received:", rawData);

        // TODO: Parse rawData string here (e.g., extract deviceUserId, timestamp)
        // const newPunch = await Attendance.create({ ... parsedData });

        return new NextResponse('OK\r\n', {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Connection': 'close'
            }
        });
    } catch (error: any) {
        console.error("Attendance log error:", error);
        return NextResponse.json({ error: 'Failed to process log' }, { status: 500 });
    }
}