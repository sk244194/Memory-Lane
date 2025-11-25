import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import connectToDatabase from '@/lib/db';
import Entry from '@/models/Entry';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { content, mood } = await req.json();

        if (!content || !mood) {
            return NextResponse.json({ error: 'Content and mood are required' }, { status: 400 });
        }

        await connectToDatabase();

        // Generate embedding
        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: content,
        });

        const embedding = embeddingResponse.data[0].embedding;

        // Save to MongoDB
        const entry = await Entry.create({
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

export async function GET() {
    try {
        await connectToDatabase();
        const entries = await Entry.find().sort({ createdAt: -1 }).limit(10);
        return NextResponse.json({ success: true, data: entries });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
