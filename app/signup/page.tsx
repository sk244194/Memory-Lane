'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password || !confirmPassword) {
            setError('All fields are required.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok && data.success && data.token) {
                localStorage.setItem('token', data.token);
                router.push('/');
                router.refresh();
            } else {
                setError(data.error || 'Registration failed. Please try again.');
            }
        } catch (err) {
            console.error('Signup error:', err);
            setError('Failed to connect to the authentication server.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        padding: '12px 14px',
        fontSize: '14px',
        color: '#374151',
        fontFamily: 'inherit',
    };

    return (
        <main style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>
                <div style={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '20px',
                    padding: '36px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginBottom: '6px', letterSpacing: '-0.01em' }}>
                            Start Your Journey
                        </h1>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>
                            Create a secure account on Memory Lane to preserve your moments.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#dc2626',
                                fontSize: '13px',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                marginBottom: '20px',
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                style={inputStyle}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={inputStyle}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                style={inputStyle}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                backgroundColor: '#111827',
                                color: '#fff',
                                padding: '12px',
                                borderRadius: '10px',
                                fontSize: '14px',
                                fontWeight: 600,
                                border: 'none',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.6 : 1,
                                transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#1f2937'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#111827'; }}
                        >
                            {isLoading ? 'Creating account...' : 'Register Account'}
                        </button>
                    </form>

                    <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
                        <p style={{ fontSize: '13px', color: '#6b7280' }}>
                            Already have an account?{' '}
                            <Link href="/login" style={{ color: '#111827', fontWeight: 600, textDecoration: 'none' }}>
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
