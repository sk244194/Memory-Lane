import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUserModel } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'memory-lane-super-secret-key-2026';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Get dynamic User model from separate connection
        const User = await getUserModel();

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        await User.create({
            email,
            password: hashedPassword,
        });

        // Sign JWT token
        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });

        // Return token in the response body instead of setting cookies
        return NextResponse.json({ success: true, email, token }, { status: 201 });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
