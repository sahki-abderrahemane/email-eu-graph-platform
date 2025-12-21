'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Network,
    Target,
    Users,
    Lightbulb,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    User,
    Sun,
    Moon,
    Monitor
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Graph Explorer', href: '/graph-explorer', icon: Network },
    { name: 'Predictions', href: '/predictions', icon: Target },
    { name: 'Community Analyzer', href: '/community-analyzer', icon: Users },
    { name: 'Explainability', href: '/explainability-panel', icon: Lightbulb },
];

interface SidebarProps {
    children: React.ReactNode;
}

const styles = {
    container: {
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
    },
    desktopSidebar: (isCollapsed: boolean) => ({
        position: 'fixed' as const,
        left: 0,
        top: 0,
        height: '100%',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        zIndex: 40,
        display: 'flex',
        width: isCollapsed ? '80px' : '280px',
        flexDirection: 'column' as const,
        transition: 'width 0.3s ease, background-color 0.3s ease',
    }),
    logoSection: {
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logoContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        textDecoration: 'none',
    },
    logoIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)',
    },
    logoText: {
        fontSize: '1.25rem',
        fontWeight: 700,
        background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--secondary) 50%, var(--accent-purple) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden',
    },
    nav: {
        flex: 1,
        padding: '1rem',
        overflowY: 'auto' as const,
    },
    navItem: (isActive: boolean) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderRadius: '0.75rem',
        marginBottom: '0.25rem',
        textDecoration: 'none',
        transition: 'all 0.2s',
        background: isActive ? 'var(--nav-active-bg)' : 'transparent',
        color: isActive ? 'var(--nav-active-text)' : 'var(--text-secondary)',
        position: 'relative' as const,
        cursor: 'pointer',
    }),
    activeIndicator: {
        position: 'absolute' as const,
        left: 0,
        top: 0,
        bottom: 0,
        width: '4px',
        background: 'var(--primary)',
        borderTopRightRadius: '4px',
        borderBottomRightRadius: '4px',
    },
    bottomSection: {
        padding: '1rem',
        borderTop: '1px solid var(--border-subtle)',
    },
    userProfile: (isCollapsed: boolean) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem',
        borderRadius: '0.75rem',
        background: 'var(--bg-hover)',
        marginBottom: '0.5rem',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
    }),
    userAvatar: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userInfo: {
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
    },
    userName: {
        fontSize: '0.875rem',
        fontWeight: 500,
        color: 'var(--text-primary)',
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    userEmail: {
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    logoutBtn: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem',
        borderRadius: '0.75rem',
        color: 'var(--text-secondary)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    themeSwitcher: (isCollapsed: boolean) => ({
        display: 'flex',
        alignItems: 'center',
        padding: '0.25rem',
        background: 'var(--bg-hover)',
        borderRadius: '0.75rem',
        marginBottom: '0.75rem',
        gap: '0.25rem',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        flexWrap: isCollapsed ? 'wrap' : 'nowrap' as any,
    }),
    themeBtn: (active: boolean) => ({
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.5rem',
        borderRadius: '0.5rem',
        background: active ? 'var(--primary)' : 'transparent',
        color: active ? 'white' : 'var(--text-muted)',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
    }),
    collapseBtn: {
        position: 'absolute' as const,
        right: '-12px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        zIndex: 50,
    },
    mainContent: (isCollapsed: boolean, isMobile: boolean) => ({
        flex: 1,
        marginLeft: isMobile ? 0 : (isCollapsed ? '80px' : '280px'),
        paddingTop: isMobile ? '64px' : 0,
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh',
    }),
    contentPadding: {
        padding: '2rem',
        minHeight: '100%',
    },
    mobileHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        height: '64px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
    },
    menuBtn: {
        background: 'var(--bg-hover)',
        border: 'none',
        borderRadius: '8px',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-primary)',
        cursor: 'pointer',
    },
    mobileMenu: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        bottom: 0,
        width: '280px',
        background: 'var(--bg-secondary)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column' as const,
        boxShadow: '10px 0 30px rgba(0,0,0,0.5)',
    },
    overlay: {
        position: 'fixed' as const,
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 45,
    },
};

export default function Sidebar({ children }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) setIsCollapsed(false);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div style={styles.container}>
            {/* Desktop Sidebar */}
            {!isMobile && (
                <aside style={styles.desktopSidebar(isCollapsed)}>
                    <div style={styles.logoSection}>
                        <Link href="/dashboard" style={styles.logoContainer}>
                            <div style={styles.logoIcon}>
                                <Network style={{ width: 24, height: 24, color: 'white' }} />
                            </div>
                            {!isCollapsed && (
                                <span style={styles.logoText}>GraphInsight</span>
                            )}
                        </Link>
                    </div>

                    <nav style={styles.nav}>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    style={styles.navItem(isActive)}
                                >
                                    {isActive && <div style={styles.activeIndicator} />}
                                    <Icon style={{ width: 20, height: 20, flexShrink: 0 }} />
                                    {!isCollapsed && (
                                        <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                                            {item.name}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div style={styles.bottomSection}>
                        <Link
                            href="/settings"
                            style={styles.navItem(pathname === '/settings')}
                        >
                            <Settings style={{ width: 20, height: 20 }} />
                            {!isCollapsed && <span style={{ fontWeight: 500 }}>Settings</span>}
                        </Link>

                        {/* Theme Switcher */}
                        <div style={styles.themeSwitcher(isCollapsed)}>
                            {[
                                { id: 'light', icon: Sun },
                                { id: 'dark', icon: Moon },
                                { id: 'system', icon: Monitor },
                            ].map((opt: any) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setTheme(opt.id as any)}
                                    style={styles.themeBtn(theme === opt.id)}
                                    title={opt.id}
                                >
                                    <opt.icon size={16} />
                                </button>
                            ))}
                        </div>

                        <div style={styles.userProfile(isCollapsed)}>
                            <div style={styles.userAvatar}>
                                <User style={{ width: 20, height: 20, color: 'white' }} />
                            </div>
                            {!isCollapsed && user && (
                                <div style={styles.userInfo}>
                                    <p style={styles.userName}>{user.name}</p>
                                    <p style={styles.userEmail}>{user.email}</p>
                                </div>
                            )}
                        </div>

                        <button onClick={logout} style={styles.logoutBtn}>
                            <LogOut style={{ width: 20, height: 20 }} />
                            {!isCollapsed && <span style={{ fontWeight: 500 }}>Logout</span>}
                        </button>
                    </div>

                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        style={styles.collapseBtn}
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </aside>
            )}

            {/* Mobile Header */}
            {isMobile && (
                <div style={styles.mobileHeader}>
                    <Link href="/dashboard" style={styles.logoContainer}>
                        <div style={{ ...styles.logoIcon, width: 36, height: 36 }}>
                            <Network style={{ width: 20, height: 20, color: 'white' }} />
                        </div>
                        <span style={{ ...styles.logoText, fontSize: '1.125rem' }}>GraphInsight</span>
                    </Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        style={styles.menuBtn}
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            )}

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobile && isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={styles.overlay}
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                            style={styles.mobileMenu}
                        >
                            <div style={{ ...styles.logoSection, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <Link href="/dashboard" style={styles.logoContainer}>
                                    <div style={styles.logoIcon}>
                                        <Network style={{ width: 24, height: 24, color: 'white' }} />
                                    </div>
                                    <span style={styles.logoText}>GraphInsight</span>
                                </Link>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    style={styles.menuBtn}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <nav style={styles.nav}>
                                {navItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        style={styles.navItem(pathname === item.href)}
                                    >
                                        <item.icon size={20} />
                                        <span style={{ fontWeight: 500 }}>{item.name}</span>
                                    </Link>
                                ))}
                                <Link
                                    href="/settings"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    style={styles.navItem(pathname === '/settings')}
                                >
                                    <Settings size={20} />
                                    <span style={{ fontWeight: 500 }}>Settings</span>
                                </Link>
                            </nav>

                            <div style={styles.bottomSection}>
                                {/* Mobile Theme Switcher */}
                                <div style={{ ...styles.themeSwitcher(false), marginBottom: '1rem' }}>
                                    {[
                                        { id: 'light', icon: Sun, label: 'Light' },
                                        { id: 'dark', icon: Moon, label: 'Dark' },
                                        { id: 'system', icon: Monitor, label: 'System' },
                                    ].map((opt: any) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setTheme(opt.id as any)}
                                            style={{ ...styles.themeBtn(theme === opt.id), gap: '0.5rem', padding: '0.75rem' }}
                                        >
                                            <opt.icon size={18} />
                                            <span style={{ fontSize: '0.875rem' }}>{opt.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <button onClick={logout} style={styles.logoutBtn}>
                                    <LogOut size={20} />
                                    <span style={{ fontWeight: 500 }}>Logout</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <main style={styles.mainContent(isCollapsed, isMobile)}>
                <div style={styles.contentPadding}>
                    {children}
                </div>
            </main>
        </div>
    );
}
