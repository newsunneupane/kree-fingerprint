import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Attendance from '@/models/Attendance'; 

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    
    // ==========================================
    // 1. HARDWARE HANDSHAKE (ZKTeco Device)
    // ==========================================
    if (searchParams.has('SN')) {
        // GET=1 is the strict ADMS command to wake up the machine.
        // \r\n is the strict Windows line ending required by the hardware.
        const admsConfig = "GET=1\r\n" +
                           "ErrorDelay=30\r\n" +
                           "Delay=10\r\n" +
                           "TransTimes=00:00;14:00\r\n" +
                           "TransInterval=1\r\n" +
                           "TransFlag=1111000000\r\n" +
                           "Realtime=1\r\n" +
                           "Encrypt=0\r\n\r\n";

        return new NextResponse(admsConfig, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Connection': 'close'
            }
        });
    }

    // ==========================================
    // 2. DASHBOARD DATA FETCH (Web Browser)
    // ==========================================
    try {
        await connectDB();
        // Fetch newest logs first (limit to 100 to keep it fast)
        const logs = await Attendance.find({}).sort({ timestamp: -1 }).limit(100); 
        return NextResponse.json(logs, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch attendance data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    // ==========================================
    // 3. HARDWARE DATA UPLOAD (ZKTeco Device)
    // ==========================================
    try {
        await connectDB();
        
        // Read the raw text from the machine
        const rawData = await request.text();
        
        // 🚨 LOOK FOR THIS EMOJI IN YOUR VERCEL LOGS 🚨
        console.log("🔥 DEVICE POST RECEIVED! Raw Data:", rawData);

        if (rawData && rawData.trim().length > 0) {
            const rows = rawData.trim().split('\n');
            
            for (let row of rows) {
                row = row.trim();
                if (!row) continue; // Skip empty lines

                // ZKTeco separates columns by tabs or spaces
                const columns = row.split(/\s+/); 
                
                if (columns.length >= 3) {
                    const deviceUserId = columns[0]; // e.g., "1"
                    const dateStr = columns[1];      // e.g., "2026-07-17"
                    const timeStr = columns[2];      // e.g., "12:30:00"
                    
                    const punchTimestamp = new Date(`${dateStr}T${timeStr}`);

                    // Save directly to MongoDB
                    await Attendance.create({
                        deviceUserId: deviceUserId,
                        timestamp: punchTimestamp,
                        status: "Checked In", 
                        source: "Device"
                    });
                    
                    console.log(`✅ Saved punch to DB for User: ${deviceUserId}`);
                }
            }
        }

        // The machine strictly requires 'OK' to know the data was saved.
        return new NextResponse('OK\r\n', {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Connection': 'close'
            }
        });

    } catch (error: any) {
        console.error("❌ POST Error:", error);
        // Always return OK even on error so the machine doesn't freeze its buffer
        return new NextResponse('OK\r\n', { 
            status: 200, 
            headers: { 'Content-Type': 'text/plain' } 
        });
    }
}