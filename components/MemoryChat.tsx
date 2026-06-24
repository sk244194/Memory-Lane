'use client';

import { useState, useRef, useEffect } from 'react';

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
            const token = localStorage.getItem('token');
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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
        <div style={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            height: '600px',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid #f3f4f6'
            }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>Talk to your Past</h2>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="custom-scrollbar" style={{
                flex: 1,
                overflowY: 'auto',
                marginBottom: '16px',
                paddingRight: '4px',
            }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '120px', fontSize: '14px' }}>
                        <p>Ask me: &quot;When was I most happy?&quot; or &quot;What did I learn last week?&quot;</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            marginBottom: '12px',
                        }}
                    >
                        <div
                            style={{
                                maxWidth: '80%',
                                padding: '10px 14px',
                                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                fontSize: '13px',
                                lineHeight: 1.5,
                                backgroundColor: msg.role === 'user' ? '#3b82f6' : '#f3f4f6',
                                color: msg.role === 'user' ? '#fff' : '#374151',
                            }}
                        >
                            {msg.content}
                        </div>

                        {msg.context && msg.context.length > 0 && (
                            <div style={{
                                marginTop: '6px',
                                fontSize: '11px',
                                color: '#9ca3af',
                                backgroundColor: '#f9fafb',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                maxWidth: '80%',
                                border: '1px solid #e5e7eb'
                            }}>
                                <div style={{ color: '#3b82f6', fontWeight: 600, marginBottom: '4px' }}>
                                    Resurfaced Memories:
                                </div>
                                {msg.context.map((c: any, i: number) => (
                                    <div key={i} style={{
                                        marginBottom: '3px',
                                        paddingLeft: '8px',
                                        borderLeft: '2px solid rgba(59,130,246,0.3)'
                                    }}>
                                        <span style={{ color: '#9ca3af' }}>{new Date(c.createdAt).toLocaleDateString()}: </span>
                                        <span style={{ fontStyle: 'italic', color: '#6b7280' }}>{c.content}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '4px' }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#3b82f6', animation: 'bounce 1s infinite' }} />
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#3b82f6', animation: 'bounce 1s infinite 0.15s' }} />
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#3b82f6', animation: 'bounce 1s infinite 0.3s' }} />
                    </div>
                )}
            </div>

            {/* Input */}
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask your journal..."
                    style={{
                        width: '100%',
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '12px 48px 12px 16px',
                        fontSize: '14px',
                        color: '#374151',
                        fontFamily: 'inherit',
                    }}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading}
                    style={{
                        position: 'absolute',
                        right: '6px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        backgroundColor: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#2563eb'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; }}
                >
                    ➤
                </button>
            </div>
        </div>
    );
}
