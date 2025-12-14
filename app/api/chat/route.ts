import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import connectToDatabase from '@/lib/db';
import Entry from '@/models/Entry';



export async function POST(req: Request) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        await connectToDatabase();

        let queryEmbedding;
        let answer;
        let results = [];

        const useMock = process.env.USE_MOCK_AI === 'true';

        if (useMock) {
            queryEmbedding = Array.from({ length: 1536 }, () => Math.random());
        } else {
            try {
                // 1. Generate embedding for the query
                const embeddingResponse = await openai.embeddings.create({
                    model: 'text-embedding-3-small',
                    input: query,
                });
                queryEmbedding = embeddingResponse.data[0].embedding;
            } catch (error: any) {
                if (error?.status === 429) {
                    console.log('OpenAI Quota Exceeded, using mock embedding');
                    queryEmbedding = Array.from({ length: 1536 }, () => Math.random());
                } else {
                    throw error;
                }
            }
        }

        // 2. Vector Search in MongoDB (Only runs if we have a valid embedding)
        // If we are strictly checking for results, Vector Search might yield nothing with random embeddings
        // But the pipeline should not error out unless the index is missing.
        try {
            results = await Entry.aggregate([
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
        } catch (dbError) {
            console.error("Vector search failed (likely missing index), continuing without context", dbError);
            results = [];
        }

        // 3. Construct Context
        const context = results.map((r: any) =>
            `Date: ${new Date(r.createdAt).toLocaleDateString()}\nMood: ${r.mood}\nEntry: ${r.content}`
        ).join('\n\n');

        // 4. RAG with OpenAI OR Mock Response
        if (useMock || !process.env.OPENAI_API_KEY) {
            answer = "I am a Mock AI. Sorry but my api limit has been exceeded.";
        } else {
            try {
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
                answer = completion.choices[0].message.content;
            } catch (error: any) {
                if (error?.status === 429) {
                    answer = "OpenAI API Quota Exceeded. This is a fallback response.";
                } else {
                    throw error;
                }
            }
        }

        return NextResponse.json({ answer, context: results });
    } catch (error) {
        console.error('Error in chat route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
