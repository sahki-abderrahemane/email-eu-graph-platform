'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Settings,
    User,
    Bell,
    Shield,
    Palette,
    Save,
    Check,
    Moon,
    Sun,
    Monitor
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import apiService from '@/lib/api';
import { useTheme } from '@/lib/theme-context';

type ThemeOption = 'dark' | 'light' | 'system';

// Inline Styles
const styles = {
    header: { marginBottom: '2rem' },
    title: { fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' },
    subtitle: { color: 'var(--text-secondary)', marginTop: '0.25rem' },
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
    },
    navButton: (active: boolean) => ({
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderRadius: '0.75rem',
        background: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
        color: active ? 'var(--primary-light)' : 'var(--text-secondary)',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left' as const,
        fontSize: '1rem',
        fontWeight: 500,
        marginBottom: '0.25rem',
        transition: 'all 0.2s',
    }),
    card: {
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '1rem',
        padding: '2rem',
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
    },
    sectionTitle: { fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem' },
    formGroup: { marginBottom: '1.5rem' },
    label: { display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' },
    input: {
        width: '100%',
        padding: '0.75rem 1rem',
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-light)',
        borderRadius: '0.5rem',
        color: 'var(--text-primary)',
        fontSize: '0.875rem',
        outline: 'none',
        transition: 'all 0.2s',
    },
    toggleRow: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-hover)', borderRadius: '0.75rem', marginBottom: '1rem'
    },
    toggle: (active: boolean) => ({
        width: '3rem', height: '1.5rem', borderRadius: '999px', background: active ? 'var(--primary)' : 'var(--text-muted)', position: 'relative' as const, cursor: 'pointer', border: 'none', transition: 'background 0.2s'
    }),
    toggleKnob: (active: boolean) => ({
        width: '1.25rem', height: '1.25rem', borderRadius: '50%', background: 'white', position: 'absolute' as const, top: '0.125rem', left: active ? 'calc(100% - 1.375rem)' : '0.125rem', transition: 'left 0.2s'
    }),
    themeBtn: (active: boolean) => ({
        padding: '1rem', borderRadius: '0.75rem', border: active ? '2px solid var(--primary)' : '2px solid var(--border-subtle)', background: active ? 'var(--nav-active-bg)' : 'var(--bg-hover)', cursor: 'pointer',
        display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '0.5rem', flex: 1, transition: 'all 0.2s'
    }),
    btnPrimary: (disabled: boolean) => ({
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '0.75rem',
        padding: '0.75rem 1.5rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.7 : 1,
        transition: 'all 0.2s',
    }),
    btnSecondary: {
        background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-secondary)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s'
    }
};

export default function SettingsPage() {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const { theme, setTheme } = useTheme();
    const [notifications, setNotifications] = useState({
        email: true,
        predictions: true,
        updates: false,
    });
    const [profile, setProfile] = useState({
        name: '',
        email: '',
    });

    useEffect(() => {
        setMounted(true);
        if (user) {
            setProfile({
                name: user.name || '',
                email: user.email || '',
            });
        }
    }, [user]);

    useEffect(() => {
        if (mounted && !isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [mounted, isLoading, isAuthenticated, router]);

    const handleSave = async () => {
        if (!user || !user.id) return;
        setIsSaving(true);
        try {
            await apiService.updateUser(user.id, {
                name: profile.name,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!mounted || isLoading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: 48, height: 48, border: '4px solid var(--border-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    return (
        <Sidebar>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* Header */}
                <div style={styles.header}>
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 style={styles.title}>Settings</h1>
                        <p style={styles.subtitle}>Manage your account and preferences</p>
                    </motion.div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lg: { flexDirection: 'row' } } as any}>
                    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem' }}>
                        {/* Tabs */}
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <nav>
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            style={styles.navButton(activeTab === tab.id)}
                                        >
                                            <Icon size={20} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </motion.div>

                        {/* Content */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.card}>
                            {activeTab === 'profile' && (
                                <div>
                                    <h2 style={styles.sectionTitle}>Profile Settings</h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
                                            {profile.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <button style={styles.btnSecondary}>Change Avatar</button>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>JPG, PNG or GIF. Max 2MB.</p>
                                        </div>
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Full Name</label>
                                        <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} style={styles.input} />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Email Address</label>
                                        <input type="email" value={profile.email} disabled style={{ ...styles.input, opacity: 0.5, cursor: 'not-allowed' }} />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Role</label>
                                        <input type="text" value={user?.role || 'User'} disabled style={{ ...styles.input, opacity: 0.5, cursor: 'not-allowed', textTransform: 'capitalize' }} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div>
                                    <h2 style={styles.sectionTitle}>Notification Preferences</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {[
                                            { id: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                                            { id: 'predictions', label: 'Prediction Alerts', desc: 'Get notified about prediction results' },
                                            { id: 'updates', label: 'Product Updates', desc: 'News about new features' }
                                        ].map((item: any) => (
                                            <div key={item.id} style={styles.toggleRow}>
                                                <div>
                                                    <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.label}</p>
                                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.desc}</p>
                                                </div>
                                                <button onClick={() => setNotifications({ ...notifications, [item.id]: !notifications[item.id as keyof typeof notifications] })} style={styles.toggle(notifications[item.id as keyof typeof notifications])}>
                                                    <div style={styles.toggleKnob(notifications[item.id as keyof typeof notifications])} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'appearance' && (
                                <div>
                                    <h2 style={styles.sectionTitle}>Appearance</h2>
                                    <label style={{ ...styles.label, marginBottom: '1rem' }}>Theme</label>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        {[
                                            { id: 'dark', label: 'Dark', icon: Moon },
                                            { id: 'light', label: 'Light', icon: Sun },
                                            { id: 'system', label: 'System', icon: Monitor },
                                        ].map((option) => (
                                            <button key={option.id} onClick={() => setTheme(option.id as ThemeOption)} style={styles.themeBtn(theme === option.id)}>
                                                <option.icon size={24} color={theme === option.id ? 'var(--primary)' : 'var(--text-muted)'} />
                                                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: theme === option.id ? 'var(--primary)' : 'var(--text-secondary)' }}>{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div>
                                    <h2 style={styles.sectionTitle}>Security Settings</h2>
                                    <div style={styles.formGroup}><label style={styles.label}>Current Password</label><input type="password" placeholder="••••••••" style={styles.input} /></div>
                                    <div style={styles.formGroup}><label style={styles.label}>New Password</label><input type="password" placeholder="••••••••" style={styles.input} /></div>
                                    <div style={styles.formGroup}><label style={styles.label}>Confirm New Password</label><input type="password" placeholder="••••••••" style={styles.input} /></div>
                                    <button style={{ ...styles.btnSecondary, marginBottom: '2rem' }}>Change Password</button>

                                    <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                                        <h3 style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Danger Zone</h3>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Once you delete your account, there is no going back.</p>
                                        <button style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', background: 'var(--bg-hover)', color: 'var(--color-error)', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>Delete Account</button>
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
                                {saved && (
                                    <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} style={{ color: 'var(--color-success)', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Check size={16} /> Saved!
                                    </motion.span>
                                )}
                                <button onClick={handleSave} disabled={isSaving} style={styles.btnPrimary(isSaving)}>
                                    {isSaving ? 'Saving...' : (<><Save size={18} /> Save Changes</>)}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </Sidebar>
    );
}
