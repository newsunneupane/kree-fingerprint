import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Attendance from '@/models/Attendance'; // Adjust based on your model name

// 1. GET Handshake for the ZKTeco Machine
export async function GET(request: Request) {
    // Force the machine into Real-Time Push mode using Windows CRLF line endings
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