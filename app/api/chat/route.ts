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

        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        await connectToDatabase();

        // 1. Generate embedding for the query
        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: query,
        });

        const queryEmbedding = embeddingResponse.data[0].embedding;

        // 2. Vector Search in MongoDB (filtered by user's email)
        // Note: For filtering to work, you MUST update your Vector Search Index definition in Atlas
        // to include the 'email' field as a filter type:
        // {
        //   "fields": [
        //     {
        //       "numDimensions": 1536,
        //       "path": "embedding",
        //       "similarity": "cosine",
        //       "type": "vector"
        //     },
        //     {
        //       "path": "email",
        //       "type": "filter"
        //     }
        //   ]
        // }
        const results = await Entry.aggregate([
            {
                $vectorSearch: {
                    index: "vector_index", // Ensure your index is named 'vector_index'
                    path: "embedding",
                    queryVector: queryEmbedding,
                    numCandidates: 100,
                    limit: 5,
                    filter: { email: { $eq: email } },
                },
            },
            {
                $project: {
                    _id: 0,
                    content: 1,
                    mood: 1,
                    createdAt: 1,
                    score: { $meta: "vectorSearchScore" },
                },
            },
        ]);

        // 3. Construct Context
        const context = results.map((r: any) =>
            `Date: ${new Date(r.createdAt).toLocaleDateString()}\nMood: ${r.mood}\nEntry: ${r.content}`
        ).join('\n\n');

        // 4. RAG with OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful assistant that has access to the user's past journal entries. 
          Use the following context to answer the user's question or reflect on their past.
          If the context doesn't help, just answer generally but mention you don't recall that specific memory.
          
          Context:
          ${context}`
                },
                {
                    role: 'user',
                    content: query
                }
            ],
        });

        const answer = completion.choices[0].message.content;

        return NextResponse.json({ answer, context: results });
    } catch (error) {
        console.error('Error in chat route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
