import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // The ZKTeco machine constantly polls this endpoint.
    // It expects nothing but raw text saying "OK".
    return new NextResponse('OK', {
        status: 200,
        headers: {
            'Content-Type': 'text/plain'
        }
    });
}