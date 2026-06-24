import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'memory-lane-super-secret-key-2026';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
        return NextResponse.json({ success: true, email: decoded.email }, { status: 200 });
    } catch (error) {
        console.error('Me API error:', error);
        return NextResponse.json({ error: 'Invalid token or server error' }, { status: 401 });
    }
}
