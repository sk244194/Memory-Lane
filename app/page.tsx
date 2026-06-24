'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import JournalEditor from '@/components/JournalEditor';
import MemoryChat from '@/components/MemoryChat';
import EntryTimeline from '@/components/EntryTimeline';

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then((data) => {
        if (data.success) {
          setEmail(data.email);
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        router.push('/login');
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
    router.refresh();
  };

  // Prevent hydration mismatch
  if (!isMounted) return null;

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '32px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Nav */}
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }}></span>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>
              {email ? `Logged in as ${email}` : 'Loading session...'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              fontSize: '13px', fontWeight: 600, color: '#6b7280', backgroundColor: '#fff',
              border: '1px solid #e5e7eb', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fef2f2';
              e.currentTarget.style.color = '#dc2626';
              e.currentTarget.style.borderColor = '#fecaca';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.color = '#6b7280';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            Logout
          </button>
        </nav>

        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: 800, color: '#111827', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Memory Lane
          </h1>
          <p style={{ fontSize: '16px', color: '#6b7280', maxWidth: '500px', margin: '0 auto' }}>
            A journal that remembers. Write your thoughts, and let AI resurface your past.
          </p>
        </header>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
          <div>
            <JournalEditor />
            <EntryTimeline />
          </div>
          <div>
            <MemoryChat />
          </div>
        </div>
      </div>
    </main>
  );
}
