import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // The \n is strictly required by the ZKTeco firmware to close the connection
    return new NextResponse('OK\n', {
        status: 200,
        headers: {
            'Content-Type': 'text/plain'
        }
    });
}