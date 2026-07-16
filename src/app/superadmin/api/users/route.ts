import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/Users';

// 1. GET: Fetch all users (sorted by newest first)
export async function GET() {
    try {
        await connectDB();
        const users = await User.find({}).sort({ createdAt: -1 });
        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

// 2. POST: Create a new user
export async function POST(req: Request) {
    try {
        await connectDB();
        const { name, email, deviceUserId } = await req.json();

        if (!name || !email || !deviceUserId) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const newUser = await User.create({ name, email, deviceUserId });
        return NextResponse.json(newUser, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Email or Device ID already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}

// 3. PUT: Update an existing user's details
export async function PUT(req: Request) {
    try {
        await connectDB();
        const { id, name, email, deviceUserId, status } = await req.json();

        if (!id || !name || !email || !deviceUserId || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { name, email, deviceUserId, status },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(updatedUser);
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Email or Device ID already registered to another user' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}