import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        await connectDB();
        const { name, email, deviceUserId } = await req.json();

        if (!name || !email || !deviceUserId) {
            return NextResponse.json({ error: 'Missing core attributes' }, { status: 400 });
        }

        const newUser = await User.create({ name, email, deviceUserId });
        return NextResponse.json(newUser, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Error creating user' }, { status: 500 });
    }
}