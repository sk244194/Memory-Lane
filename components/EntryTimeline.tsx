'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface Entry {
    _id: string;
    content: string;
    mood: string;
    createdAt: string;
}

export default function EntryTimeline() {
    const [entries, setEntries] = useState<Entry[]>([]);

    useEffect(() => {
        fetch('/api/journal')
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setEntries(data.data);
                }
            });
    }, []);

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg mt-8">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
                <Clock className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-bold text-gray-800">Recent Memories</h2>
            </div>

            <div className="space-y-4">
                {entries.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No memories yet.</p>
                )}

                {entries.map((entry, i) => (
                    <motion.div
                        key={entry._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs text-gray-500">
                                {new Date(entry.createdAt).toLocaleDateString()} • {new Date(entry.createdAt).toLocaleTimeString()}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-600">
                                {entry.mood}
                            </span>
                        </div>
                        <p className="text-gray-700 text-sm line-clamp-2">{entry.content}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
