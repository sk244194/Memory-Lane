import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import connectToDatabase from '@/lib/db';
import Entry from '@/models/Entry';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
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

        // 2. Vector Search in MongoDB
        // Note: You MUST create a Vector Search Index in MongoDB Atlas for this to work.
        // Index definition:
        // {
        //   "fields": [
        //     {
        //       "numDimensions": 1536,
        //       "path": "embedding",
        //       "similarity": "cosine",
        //       "type": "vector"
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
