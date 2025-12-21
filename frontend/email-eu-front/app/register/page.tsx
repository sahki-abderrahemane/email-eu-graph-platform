'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, User, Network, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

// Inline Styles for guaranteed consistency
const styles = {
    page: {
        minHeight: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        position: 'relative' as const,
        overflow: 'hidden',
    },
    bgEffects: {
        position: 'absolute' as const,
        inset: 0,
        pointerEvents: 'none' as const,
        overflow: 'hidden',
    },
    bgBlob1: {
        position: 'absolute' as const,
        top: '-10%',
        left: '-10%',
        width: '300px',
        height: '300px',
        background: 'rgba(168, 85, 247, 0.15)',
        borderRadius: '50%',
        filter: 'blur(80px)',
    },
    bgBlob2: {
        position: 'absolute' as const,
        bottom: '-10%',
        right: '-10%',
        width: '350px',
        height: '350px',
        background: 'rgba(99, 102, 241, 0.12)',
        borderRadius: '50%',
        filter: 'blur(80px)',
    },
    container: {
        width: '100%',
        maxWidth: '440px',
        position: 'relative' as const,
        zIndex: 10,
    },
    header: {
        textAlign: 'center' as const,
        marginBottom: '2rem',
    },
    logoLink: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        textDecoration: 'none',
    },
    logoIcon: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
    },
    logoText: {
        fontSize: '1.5rem',
        fontWeight: 700,
        background: 'linear-gradient(135deg, #818cf8 0%, #22d3ee 50%, #a855f7 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    title: {
        fontSize: '1.875rem',
        fontWeight: 700,
        color: '#f8fafc',
        marginBottom: '0.5rem',
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: '0.95rem',
    },
    card: {
        background: '#16161f',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '20px',
        padding: '2.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    },
    errorAlert: {
        marginBottom: '1.5rem',
        padding: '1rem',
        borderRadius: '12px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    errorText: {
        color: '#f87171',
        fontSize: '0.875rem',
    },
    formGroup: {
        marginBottom: '1.25rem',
    },
    label: {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#94a3b8',
        marginBottom: '0.5rem',
    },
    inputWrapper: {
        position: 'relative' as const,
        display: 'flex',
        alignItems: 'center',
    },
    inputIcon: {
        position: 'absolute' as const,
        left: '1rem',
        width: '20px',
        height: '20px',
        color: '#64748b',
    },
    input: {
        width: '100%',
        padding: '0.875rem 1rem 0.875rem 3rem',
        background: '#12121a',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '12px',
        color: '#f8fafc',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    togglePassword: {
        position: 'absolute' as const,
        right: '1rem',
        color: '#64748b',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
    },
    requirementList: {
        marginTop: '0.75rem',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '0.5rem',
    },
    requirementItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.75rem',
    },
    requirementIconDefault: {
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    requirementIconMet: {
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        background: 'rgba(16, 185, 129, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    matchIcon: {
        position: 'absolute' as const,
        right: '1rem',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButton: {
        width: '100%',
        padding: '0.875rem',
        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontWeight: 600,
        fontSize: '1rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        marginTop: '1.5rem',
        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        margin: '1.5rem 0',
    },
    dividerLine: {
        height: '1px',
        flex: 1,
        background: 'rgba(255, 255, 255, 0.06)',
    },
    dividerText: {
        color: '#64748b',
        fontSize: '0.875rem',
    },
    loginText: {
        textAlign: 'center' as const,
        color: '#94a3b8',
        fontSize: '0.95rem',
    },
    loginLink: {
        color: '#818cf8',
        fontWeight: 500,
        textDecoration: 'none',
        marginLeft: '0.375rem',
    },
    footer: {
        textAlign: 'center' as const,
        marginTop: '2rem',
        color: '#64748b',
        fontSize: '0.875rem',
    },
    footerLink: {
        color: '#94a3b8',
        textDecoration: 'none',
        margin: '0 0.25rem',
    },
};

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, isAuthenticated, error, clearError } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    const passwordRequirements = [
        { text: 'At least 6 characters', met: password.length >= 6 },
        { text: 'Contains a number', met: /\d/.test(password) },
        { text: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');
        clearError();

        if (!name || !email || !password || !confirmPassword) {
            setLocalError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setLocalError('Password must be at least 6 characters');
            return;
        }

        setIsSubmitting(true);
        try {
            await register(name, email, password);
        } catch (err: any) {
            setLocalError(err.message || 'Registration failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={styles.page}>
            {/* Background Effects */}
            <div style={styles.bgEffects}>
                <div style={styles.bgBlob1}></div>
                <div style={styles.bgBlob2}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={styles.container}
            >
                {/* Logo & Header */}
                <div style={styles.header}>
                    <Link href="/" style={styles.logoLink}>
                        <div style={styles.logoIcon}>
                            <Network style={{ width: 28, height: 28, color: 'white' }} />
                        </div>
                        <span style={styles.logoText}>GraphInsight</span>
                    </Link>
                    <h1 style={styles.title}>Create Account</h1>
                    <p style={styles.subtitle}>Join us to unlock powerful network analytics</p>
                </div>

                {/* Register Card */}
                <div style={styles.card}>
                    {(localError || error) && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={styles.errorAlert}
                        >
                            <AlertCircle style={{ width: 20, height: 20, color: '#f87171' }} />
                            <p style={styles.errorText}>{localError || error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Name Field */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Full Name</label>
                            <div style={styles.inputWrapper}>
                                <User style={styles.inputIcon} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    style={styles.input}
                                    autoComplete="name"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email Address</label>
                            <div style={styles.inputWrapper}>
                                <Mail style={styles.inputIcon} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    style={styles.input}
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Password</label>
                            <div style={styles.inputWrapper}>
                                <Lock style={styles.inputIcon} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    style={{ ...styles.input, paddingRight: '3rem' }}
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={styles.togglePassword}
                                >
                                    {showPassword ? (
                                        <EyeOff style={{ width: 20, height: 20 }} />
                                    ) : (
                                        <Eye style={{ width: 20, height: 20 }} />
                                    )}
                                </button>
                            </div>

                            {/* Password Requirements */}
                            {password.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    style={styles.requirementList}
                                >
                                    {passwordRequirements.map((req, index) => (
                                        <div key={index} style={styles.requirementItem}>
                                            <div style={req.met ? styles.requirementIconMet : styles.requirementIconDefault}>
                                                {req.met && <Check style={{ width: 10, height: 10, color: '#10b981' }} />}
                                            </div>
                                            <span style={{ color: req.met ? '#10b981' : '#64748b' }}>{req.text}</span>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Confirm Password</label>
                            <div style={styles.inputWrapper}>
                                <Lock style={styles.inputIcon} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    style={styles.input}
                                    autoComplete="new-password"
                                    required
                                />
                                {confirmPassword.length > 0 && (
                                    <div style={{
                                        ...styles.matchIcon,
                                        background: password === confirmPassword ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                                    }}>
                                        {password === confirmPassword ? (
                                            <Check style={{ width: 12, height: 12, color: '#10b981' }} />
                                        ) : (
                                            <AlertCircle style={{ width: 12, height: 12, color: '#f87171' }} />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                ...styles.submitButton,
                                opacity: isSubmitting ? 0.7 : 1,
                                cursor: isSubmitting ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isSubmitting ? (
                                <div style={{
                                    width: 20,
                                    height: 20,
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    borderTopColor: 'white',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight style={{ width: 20, height: 20 }} />
                                </>
                            )}
                        </motion.button>
                        <style jsx global>{`
                            @keyframes spin {
                                to { transform: rotate(360deg); }
                            }
                        `}</style>
                    </form>

                    {/* Divider */}
                    <div style={styles.divider}>
                        <div style={styles.dividerLine}></div>
                        <span style={styles.dividerText}>or</span>
                        <div style={styles.dividerLine}></div>
                    </div>

                    {/* Login Link */}
                    <p style={styles.loginText}>
                        Already have an account?{' '}
                        <Link href="/login" style={styles.loginLink}>
                            Sign in
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p style={styles.footer}>
                    By creating an account, you agree to our{' '}
                    <Link href="/terms" style={styles.footerLink}>Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" style={styles.footerLink}>Privacy Policy</Link>
                </p>
            </motion.div>
        </div>
    );
}
