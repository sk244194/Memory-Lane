'use client';

import { useState } from 'react';

export default function JournalEditor() {
    const [content, setContent] = useState('');
    const [mood, setMood] = useState('Neutral');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    const moods = ['Happy', 'Sad', 'Anxious', 'Excited', 'Neutral', 'Angry'];

    const handleSave = async () => {
        if (!content.trim()) return;
        setIsSaving(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/journal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content, mood }),
            });

            if (res.ok) {
                setMessage('Entry saved to Memory Lane!');
                setContent('');
                setMood('Neutral');
            } else {
                setMessage('Failed to save entry.');
            }
        } catch (error) {
            setMessage('An error occurred.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', marginBottom: '16px' }}>
                Dear Diary...
            </h2>

            {/* Mood Selector */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {moods.map((m) => (
                    <button
                        key={m}
                        onClick={() => setMood(m)}
                        style={{
                            padding: '5px 14px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: 500,
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            backgroundColor: mood === m ? '#3b82f6' : '#f3f4f6',
                            color: mood === m ? '#fff' : '#4b5563',
                        }}
                    >
                        {m}
                    </button>
                ))}
            </div>

            {/* Textarea */}
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="How are you feeling today?"
                style={{
                    width: '100%',
                    height: '140px',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '14px',
                    fontSize: '14px',
                    color: '#374151',
                    resize: 'none',
                    marginBottom: '16px',
                    fontFamily: 'inherit',
                }}
            />

            {/* Save Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#16a34a' }}>{message}</span>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#3b82f6',
                        color: '#fff',
                        padding: '9px 20px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        opacity: isSaving ? 0.6 : 1,
                        transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => { if (!isSaving) e.currentTarget.style.backgroundColor = '#2563eb'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; }}
                >
                    💾 {isSaving ? 'Saving...' : 'Save Memory'}
                </button>
            </div>
        </div>
    );
}
