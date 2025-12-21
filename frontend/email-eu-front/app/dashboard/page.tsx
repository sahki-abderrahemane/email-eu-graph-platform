'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target,
    Users,
    Share2,
    Activity,
    RefreshCw,
    BarChart2,
    Calendar,
    Download,
    Zap,
    Maximize2,
    Move
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import apiService from '@/lib/api';

// Mock data for initial render (while fetching)
const initialNetworkStats = {
    nodes: 0,
    edges: 0,
    departments: 0,
    avgDegree: 0,
    density: 0,
    avgClustering: 0,
    diameter: 0,
    components: 0,
};

const initialDepartmentData: any[] = [];

// Inline Styles
const styles = {
    header: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '1rem',
        marginBottom: '2rem',
    },
    headerRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap' as const,
        gap: '1rem',
    },
    title: {
        fontSize: '1.875rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
    },
    subtitle: {
        color: 'var(--text-secondary)',
        marginTop: '0.25rem',
    },
    refreshBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.625rem 1rem',
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '0.75rem',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem',
    },
    statCard: {
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '1.25rem',
        padding: '1.5rem',
        position: 'relative' as const,
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: 'var(--shadow-premium)',
    },
    statHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statLabel: {
        color: 'var(--text-secondary)',
        fontSize: '0.875rem',
        fontWeight: 500,
        marginBottom: '0.5rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
    },
    statValue: {
        fontSize: '2.25rem',
        fontWeight: 800,
        color: 'var(--text-primary)',
        letterSpacing: '-0.02em',
    },
    statIcon: (color: string) => ({
        width: '56px',
        height: '56px',
        borderRadius: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        boxShadow: `0 8px 16px -4px ${color}44`,
        color: 'white',
    }),
    trend: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        marginTop: '0.5rem',
        fontSize: '0.875rem',
        color: 'var(--color-success)',
    },
    chartsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem',
    },
    chartCard: {
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '1rem',
        padding: '1.5rem',
        height: '100%',
        minHeight: '320px',
        display: 'flex',
        flexDirection: 'column' as const,
    },
    chartHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    chartTitle: {
        fontSize: '1.125rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
    },
    barChartContainer: {
        flex: 1,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: '0.5rem',
        height: '200px',
    },
    bar: (height: number) => ({
        flex: 1,
        background: 'linear-gradient(to top, #6366f1, #818cf8)',
        borderRadius: '4px 4px 0 0',
        height: `${height}%`,
        minWidth: '20px',
        transition: 'height 1s ease',
    }),
    pieChartContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        height: '100%',
    },
    legend: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '0.75rem',
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dot: (color: string) => ({
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: color,
        display: 'inline-block',
        marginRight: '0.5rem',
    }),
    activityList: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '1rem',
    },
    activityItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem',
        background: 'var(--bg-hover)',
        borderRadius: '0.75rem',
        border: '1px solid var(--border-subtle)',
    },
    activityLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    activityIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '0.5rem',
        background: 'var(--nav-active-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--nav-active-text)',
    },
    activityAction: {
        fontSize: '0.95rem',
        fontWeight: 500,
        color: 'var(--text-primary)',
        marginBottom: '0.125rem',
    },
    activityNode: {
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
    },
    activityRight: {
        textAlign: 'right' as const,
    },
    activityResult: {
        fontSize: '0.9rem',
        fontWeight: 500,
        color: 'var(--color-success)',
        marginBottom: '0.125rem',
    },
    activityTime: {
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
    },
    miniStatGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginTop: '1.5rem',
    },
    miniStatCard: {
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '1rem',
        padding: '1.5rem',
        textAlign: 'center' as const,
        boxShadow: 'var(--shadow-card)',
    },
    scatterContainer: {
        width: '100%',
        height: '300px',
        position: 'relative' as const,
        background: 'var(--bg-primary)',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
    },
    point: (x: number, y: number, color: string) => ({
        position: 'absolute' as const,
        left: `${x}%`,
        bottom: `${y}%`,
        width: '4px',
        height: '4px',
        borderRadius: '50%',
        backgroundColor: color,
        transform: 'translate(-50%, 50%)',
    }),
};

const COLORS = [
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4',
    '#3b82f6', '#4f46e5', '#7c3aed', '#9333ea', '#c026d3', '#db2777',
    '#e11d48', '#ea580c', '#ca8a04', '#65a30d', '#16a34a', '#0d9488',
];

const getDeptColor = (dept: number) => COLORS[dept % COLORS.length];

const ScatterPlot = ({ data, title, subtitle }: { data: any, title: string, subtitle: string }) => {
    if (!data || !data.points) return <div style={{ ...styles.scatterContainer, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading projection...</div>;

    // Normalize points to 0-100%
    const xs = data.points.map((p: any) => p.x);
    const ys = data.points.map((p: any) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    return (
        <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
                <div>
                    <h3 style={styles.chartTitle}>{title}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subtitle}</p>
                </div>
            </div>
            <div style={styles.scatterContainer}>
                {data.points.map((p: any, i: number) => (
                    <div
                        key={i}
                        style={styles.point(
                            ((p.x - minX) / rangeX) * 90 + 5,
                            ((p.y - minY) / rangeY) * 90 + 5,
                            getDeptColor(p.dept)
                        )}
                        title={`Node ${p.node_id} (Dept ${p.dept})`}
                    />
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.625rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                <span>Dimension 1</span>
                <span>Dimension 2</span>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, trend, color }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, boxShadow: '0 12px 40px -12px rgba(0,0,0,0.3)' }}
        style={styles.statCard}
    >
        <div style={styles.statHeader}>
            <div>
                <p style={styles.statLabel}>{label}</p>
                <p style={styles.statValue}>{value}</p>
                {trend && (
                    <div style={styles.trend}>
                        <Activity style={{ width: 14, height: 14 }} />
                        <span style={{ fontWeight: 600 }}>{trend}</span>
                    </div>
                )}
            </div>
            <div style={styles.statIcon(color)}>
                <Icon size={28} />
            </div>
        </div>
    </motion.div>
);

export default function DashboardPage() {
    const { isAuthenticated, isLoading: authLoading, user, token } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    // State for data
    const [networkStats, setNetworkStats] = useState(initialNetworkStats);
    const [departmentData, setDepartmentData] = useState(initialDepartmentData);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [pcaData, setPcaData] = useState<any>(null);
    const [tsneData, setTsneData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [mounted, authLoading, isAuthenticated, router]);

    // Fetch data
    const fetchData = useCallback(async (bypassCache = false) => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const [statsData, activityData] = await Promise.all([
                apiService.getGraphStats(bypassCache) as any,
                apiService.getGraphActivity(bypassCache) as any
            ]);

            if (statsData) {
                setNetworkStats(statsData.stats);
                setDepartmentData(statsData.departments);
            }
            if (activityData) {
                setRecentActivity(activityData);
            }

            // Fetch Embedding Vizzes (Background)
            apiService.getEmbeddingsVisualization('pca').then(data => setPcaData(data)).catch(e => console.error(e));
            apiService.getEmbeddingsVisualization('tsne').then(data => setTsneData(data)).catch(e => console.error(e));

        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, token]);

    useEffect(() => {
        if (mounted && isAuthenticated) {
            fetchData();
        }
    }, [mounted, isAuthenticated, fetchData]);

    if (!mounted || authLoading || loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: 48, height: 48, border: '4px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <Sidebar>
            <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
                {/* Header */}
                <div style={styles.header}>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={styles.headerRow}
                    >
                        <div>
                            <h1 style={styles.title}>
                                Welcome back, {user?.name?.split(' ')[0]}! 👋
                            </h1>
                            <p style={styles.subtitle}>Here's what's happening with your network today.</p>
                        </div>
                        <button style={styles.refreshBtn} onClick={() => fetchData(true)}>
                            <RefreshCw style={{ width: 16, height: 16 }} />
                            Refresh Data
                        </button>
                    </motion.div>
                </div>

                {/* Stats Grid */}
                <div style={styles.statsGrid}>
                    <StatCard icon={Users} label="Total Users" value={networkStats.nodes.toLocaleString()} trend="+12% this month" color="#6366f1" />
                    <StatCard icon={Share2} label="Network Edges" value={networkStats.edges.toLocaleString()} trend="+5.4% growth" color="#22d3ee" />
                    <StatCard icon={Target} label="Departments" value={networkStats.departments} color="#a855f7" />
                    <StatCard icon={Activity} label="Avg Connectivity" value={(networkStats.avgDegree || 0).toFixed(2)} color="#10b981" />
                </div>

                {/* Charts Row */}
                <div style={styles.chartsGrid}>
                    {/* Degree Distribution */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={styles.chartCard}
                    >
                        <div style={styles.chartHeader}>
                            <h3 style={styles.chartTitle}>Degree Distribution</h3>
                        </div>
                        <div style={styles.barChartContainer}>
                            {[20, 45, 85, 60, 95, 70, 55, 40, 25, 15, 10, 5].map((height, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                                    style={styles.bar(height)}
                                />
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <span>Low</span>
                            <span>Degree</span>
                            <span>High</span>
                        </div>
                    </motion.div>

                    {/* Department Distribution */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        style={styles.chartCard}
                    >
                        <div style={styles.chartHeader}>
                            <h3 style={styles.chartTitle}>Department Distribution</h3>
                            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'var(--nav-active-bg)', color: 'var(--nav-active-text)', borderRadius: '999px' }}>{networkStats.departments} Depts</span>
                        </div>
                        <div style={styles.pieChartContainer}>
                            <div style={{ width: '140px', height: '140px', borderRadius: '50%', border: '20px solid var(--bg-tertiary)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {/* Simplified CSS Pie Chart representation for stability */}
                                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '20px solid var(--primary)', borderRightColor: 'transparent', borderBottomColor: 'transparent', transform: 'rotate(45deg)' }}></div>
                                <div style={{ textAlign: 'center', zIndex: 10 }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{networkStats.nodes}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nodes</div>
                                </div>
                            </div>
                            <div style={styles.legend}>
                                {departmentData.slice(0, 4).map((dept: any, i: number) => (
                                    <div key={i} style={styles.legendItem}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span style={styles.dot(dept.color)}></span>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{dept.name}</span>
                                        </div>
                                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{dept.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Additional Stats */}
                <div style={styles.miniStatGrid}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={styles.miniStatCard}
                    >
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Network Density</p>
                        <p style={{ fontSize: '2rem', fontWeight: 700, backgroundImage: 'linear-gradient(to right, var(--primary-light), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {(networkStats.density * 100).toFixed(2)}%
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        style={styles.miniStatCard}
                    >
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Avg Clustering</p>
                        <p style={{ fontSize: '2rem', fontWeight: 700, backgroundImage: 'linear-gradient(to right, var(--primary-light), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {networkStats.avgClustering.toFixed(3)}
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        style={styles.miniStatCard}
                    >
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Graph Diameter</p>
                        <p style={{ fontSize: '2rem', fontWeight: 700, backgroundImage: 'linear-gradient(to right, var(--primary-light), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {networkStats.diameter}
                        </p>
                    </motion.div>
                </div>

                {/* Embedding Visualizations */}
                <div style={{ marginTop: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'var(--nav-active-bg)', color: 'var(--accent-purple)' }}>
                            <Move size={20} />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Embedding Projections</h2>
                    </div>
                    <div style={styles.chartsGrid}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <ScatterPlot
                                data={pcaData}
                                title="Node2Vec - PCA"
                                subtitle="Linear dimensionality reduction of 128D node embeddings"
                            />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <ScatterPlot
                                data={tsneData}
                                title="Node2Vec - t-SNE"
                                subtitle="Non-linear manifold visualization preserving local clusters"
                            />
                        </motion.div>
                    </div>
                </div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{ ...styles.chartCard, marginTop: '1.5rem', height: 'auto', minHeight: 'auto' }}
                >
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>Recent Activity</h3>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => fetchData()}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    background: 'var(--bg-hover)',
                                    border: '1px solid var(--border-subtle)',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer'
                                }}
                            >
                                <RefreshCw size={16} />
                                Refresh
                            </button>
                        </div>
                    </div>
                    <div style={styles.activityList}>
                        {recentActivity.map((activity, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + i * 0.1 }}
                                style={styles.activityItem}
                            >
                                <div style={styles.activityLeft}>
                                    <div style={styles.activityIcon}>
                                        <Zap style={{ width: 20, height: 20 }} />
                                    </div>
                                    <div>
                                        <p style={styles.activityAction}>{activity.action}</p>
                                        <p style={styles.activityNode}>{activity.node}</p>
                                    </div>
                                </div>
                                <div style={styles.activityRight}>
                                    <p style={styles.activityResult}>{activity.result}</p>
                                    <p style={styles.activityTime}>{activity.time}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </Sidebar>
    );
}
