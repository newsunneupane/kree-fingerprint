import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Attendance from '@/models/Attendance'; // Adjust to your model name

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    
    // 1. HARDWARE HANDSHAKE DETECTION
    // The ZKTeco device ALWAYS sends an 'SN' (Serial Number) query parameter.
    // Web dashboard requests will NOT have an 'SN' parameter.
    if (searchParams.has('SN')) {
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
    // If there is no 'SN' parameter, this is your web dashboard looking for JSON data.
    try {
        await connectDB();
        const logs = await Attendance.find({}).sort({ timestamp: -1 }); 
        
        return NextResponse.json(logs, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch attendance data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        
        // 1. Get the raw string text from the physical device
        const rawData = await request.text();
        console.log("Raw ZKTeco Punch Received:", rawData);

        // 2. Check if the incoming payload contains actual punch records
        if (rawData && rawData.length > 0) {
            // ZKTeco sends punches separated by newlines. Split them into rows.
            const rows = rawData.trim().split('\n');
            
            for (const row of rows) {
                // Split the columns (ZKTeco defaults to using Tabs '\t' or spaces)
                const columns = row.split(/\s+/); 
                
                // Ensure it's a valid log line (usually has at least a User ID and a Date)
                if (columns.length >= 2) {
                    const deviceUserId = columns[0];     // First column: User ID
                    const dateStr = columns[1];          // Second column: YYYY-MM-DD
                    const timeStr = columns[2];          // Third column: HH:MM:SS
                    
                    const punchTimestamp = new Date(`${dateStr}T${timeStr}`);

                    // 3. Save directly to your MongoDB collection
                    await Attendance.create({
                        deviceUserId: deviceUserId,
                        timestamp: punchTimestamp,
                        status: "Checked In", // Or dynamic based on columns[3]
                        source: "Device"
                    });
                }
            }
        }

        // 4. Respond with an explicit Windows CRLF 'OK' so the machine deletes its buffer
        return new NextResponse('OK\r\n', {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Connection': 'close'
            }
        });
    } catch (error: any) {
        console.error("Attendance log parser error:", error);
        return NextResponse.json({ error: 'Failed to process log' }, { status: 500 });
    }
}