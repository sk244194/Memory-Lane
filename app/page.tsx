'use client';

import JournalEditor from '@/components/JournalEditor';
import MemoryChat from '@/components/MemoryChat';
import EntryTimeline from '@/components/EntryTimeline';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">
            Memory Lane
          </h1>
          <p className="text-gray-600 text-lg">
            A journal that remembers. Write your thoughts, and let AI resurface your past.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
            <JournalEditor />
            <EntryTimeline />
          </section>

          <section>
            <MemoryChat />
          </section>
        </div>
      </div>
    </main>
  );
}
