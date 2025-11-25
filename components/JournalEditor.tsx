'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2 } from 'lucide-react';

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
            const res = await fetch('/api/journal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Dear Diary...</h2>

            <div className="mb-4 flex gap-2 flex-wrap">
                {moods.map((m) => (
                    <button
                        key={m}
                        onClick={() => setMood(m)}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${mood === m
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {m}
                    </button>
                ))}
            </div>

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="How are you feeling today?"
                className="w-full h-40 bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
            />

            <div className="flex justify-between items-center">
                <span className="text-sm text-green-600">{message}</span>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold disabled:opacity-50 hover:bg-blue-700"
                >
                    {isSaving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                    Save Memory
                </motion.button>
            </div>
        </div>
    );
}
