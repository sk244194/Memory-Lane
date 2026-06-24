'use client';

import { useEffect, useState } from 'react';

interface Entry {
    _id: string;
    content: string;
    mood: string;
    createdAt: string;
}

export default function EntryTimeline() {
    const [entries, setEntries] = useState<Entry[]>([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('/api/journal', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setEntries(data.data);
                }
            });
    }, []);

    return (
        <div style={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            marginTop: '24px'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid #f3f4f6'
            }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>Recent Memories</h2>
            </div>

            <div>
                {entries.length === 0 && (
                    <p style={{ color: '#9ca3af', textAlign: 'center', padding: '16px 0', fontSize: '14px', fontStyle: 'italic' }}>
                        No memories yet.
                    </p>
                )}

                {entries.map((entry) => (
                    <div
                        key={entry._id}
                        style={{
                            padding: '14px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            border: '1px solid #f3f4f6',
                            marginBottom: '10px',
                            transition: 'background-color 0.15s ease',
                            cursor: 'default',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                                {new Date(entry.createdAt).toLocaleDateString()} • {new Date(entry.createdAt).toLocaleTimeString()}
                            </span>
                            <span style={{
                                fontSize: '11px',
                                padding: '2px 10px',
                                borderRadius: '20px',
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                color: '#6b7280'
                            }}>
                                {entry.mood}
                            </span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {entry.content}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
