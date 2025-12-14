import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import connectToDatabase from '@/lib/db';
import Entry from '@/models/Entry';


export async function POST(req: Request) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });


    try {
        const { content, mood } = await req.json();

        if (!content || !mood) {
            return NextResponse.json({ error: 'Content and mood are required' }, { status: 400 });
        }

        await connectToDatabase();

        let embedding;

        if (process.env.USE_MOCK_AI === 'true') {
            console.log('Using Mock AI for embedding');
            // Generate a random vector of 1536 dimensions (standard OpenAI size)
            embedding = Array.from({ length: 1536 }, () => Math.random());
        } else {
            try {
                // Generate embedding
                const embeddingResponse = await openai.embeddings.create({
                    model: 'text-embedding-3-small',
                    input: content,
                });
                embedding = embeddingResponse.data[0].embedding;
            } catch (error: any) {
                if (error?.status === 429) {
                    console.log('OpenAI Quota Exceeded, falling back to mock embedding');
                    embedding = Array.from({ length: 1536 }, () => Math.random());
                } else {
                    throw error;
                }
            }
        }

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
