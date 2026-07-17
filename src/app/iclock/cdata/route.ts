import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AttendanceLog from "@/models/AttendanceLog";

export async function GET(req: NextRequest) {
  // Handshake for ZKTeco ADMS
  // The device pings this to check if the server is alive
  return new NextResponse("OK\n", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Connection": "keep-alive"
    }
  });
}

export async function POST(req: NextRequest) {
  await dbConnect();

  // ADMS sends URL params like ?SN=YOUR_DEVICE_SERIAL&table=ATTLOG
  const { searchParams } = new URL(req.url);
  const sn = searchParams.get("SN") || "UNKNOWN";
  const table = searchParams.get("table");

  // MUST read as text. ZKTeco sends raw tab-separated text, NOT JSON.
  const body = await req.text();

  if (table === "ATTLOG") {
    // Split by newlines (handles both \n and \r\n from hardware)
    const lines = body.split(/\r?\n/);
    const logsToInsert = [];

    for (const line of lines) {
      if (!line.trim()) continue;

      // ATTLOG format: USERID \t TIMESTAMP \t STATUS \t VERIFY_TYPE
      // Inside your POST function's loop:
const parts = line.split("\t");

if (parts.length >= 2) {
  const deviceuserid = parts[0].trim();
  const timestampStr = parts[1].trim(); 

  // Append +05:45 to explicitly set the timezone before parsing
  const dateString = timestampStr.replace(" ", "T") + "+05:45";

  logsToInsert.push({
    deviceuserid,
    timestamp: new Date(dateString), 
    sn,
    raw_data: line
  });
}
    }

    if (logsToInsert.length > 0) {
      await AttendanceLog.insertMany(logsToInsert);
    }
  }

  // Acknowledge receipt exactly as the legacy C++ network interface expects
  return new NextResponse("OK\n", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Connection": "keep-alive"
    }
  });
}