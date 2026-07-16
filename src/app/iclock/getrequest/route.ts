import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // The \r\n is strictly required by ZKTeco hardware to know the message is finished
    const body = 'OK\r\n';
    
    return new NextResponse(body, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
            'Content-Length': body.length.toString(),
            'Connection': 'close' // Forces the machine to close the GET and start the POST
        }
    });
}