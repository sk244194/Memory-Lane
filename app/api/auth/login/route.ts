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

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Sign JWT token
        const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        // Return token in the response body instead of setting cookies
        return NextResponse.json({ success: true, email: user.email, token }, { status: 200 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
