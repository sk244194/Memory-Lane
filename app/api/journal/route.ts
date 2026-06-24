import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import OpenAI from 'openai';
import connectToDatabase from '@/lib/db';
import Entry from '@/models/Entry';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const JWT_SECRET = process.env.JWT_SECRET || 'memory-lane-super-secret-key-2026';

async function getEmailFromRequest(req: Request) {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
        return decoded.email;
    } catch (e) {
        return null;
    }
}

export async function POST(req: Request) {
    try {
        const email = await getEmailFromRequest(req);
        if (!email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content, mood } = await req.json();

        if (!content || !mood) {
            return NextResponse.json({ error: 'Content and mood are required' }, { status: 400 });
        }

        await connectToDatabase();

        // Generate embedding (best-effort — save entry even if this fails)
        let embedding: number[] = [];
        try {
            const embeddingResponse = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: content,
            });
            embedding = embeddingResponse.data[0].embedding;
        } catch (embeddingError) {
            console.error('Embedding generation failed (entry will still be saved):', embeddingError);
        }

        // Save to MongoDB with user's email
        const entry = await Entry.create({
            email,
            content,
            mood,
            embedding,
        });

        return NextResponse.json({ success: true, data: entry }, { status: 201 });
    } catch (error) {
        console.error('Error saving journal entry:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const email = await getEmailFromRequest(req);
        if (!email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();
        const entries = await Entry.find({ email }).sort({ createdAt: -1 }).limit(10);
        return NextResponse.json({ success: true, data: entries });
    } catch (error) {
        console.error('Error getting journal entries:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
