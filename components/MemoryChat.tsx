'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, BookOpen } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    context?: any[];
}

export default function MemoryChat() {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!query.trim()) return;

        const userMsg: Message = { role: 'user', content: query };
        setMessages((prev) => [...prev, userMsg]);
        setQuery('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMsg.content }),
            });

            const data = await res.json();

            if (data.answer) {
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: data.answer, context: data.context },
                ]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg h-[600px] flex flex-col">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <h2 className="text-xl font-bold text-gray-800">Talk to your Past</h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-20">
                        <p>Ask me: "When was I most happy?" or "What did I learn last week?"</p>
                    </div>
                )}

                <AnimatePresence>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                            <div
                                className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                                    }`}
                            >
                                {msg.content}
                            </div>

                            {msg.context && msg.context.length > 0 && (
                                <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg max-w-[80%] border border-gray-200">
                                    <div className="flex items-center gap-1 mb-1 text-blue-600">
                                        <BookOpen className="w-3 h-3" />
                                        <span>Resurfaced Memories:</span>
                                    </div>
                                    {msg.context.map((c: any, i: number) => (
                                        <div key={i} className="mb-1 last:mb-0 pl-2 border-l-2 border-blue-500/30">
                                            <span className="text-gray-500">{new Date(c.createdAt).toLocaleDateString()}: </span>
                                            <span className="italic opacity-70 line-clamp-1 text-gray-600">{c.content}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
                    </div>
                )}
            </div>

            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask your journal..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-12 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
