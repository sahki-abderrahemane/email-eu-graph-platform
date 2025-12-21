'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target,
    Link2,
    Search,
    ArrowRight,
    CheckCircle2,
    XCircle,
    Info,
    Sparkles,
    History,
    Zap,
    Users,
    FlaskConical,
    Activity,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';

type PredictionType = 'department' | 'link';
type PredictionMode = 'real' | 'unseen' | 'simulate';

interface PredictionResultItem {
    id?: string;
    type: PredictionType;
    input: string;
    prediction: string;
    confidence: number;
    timestamp: Date;
}

const getDeptName = (dept: number) => `Department ID: ${dept}`;

// Inline Styles
const styles = {
    header: { marginBottom: '2rem' },
    title: { fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' },
    subtitle: { color: 'var(--text-secondary)', marginTop: '0.25rem' },
    tabs: {
        display: 'inline-flex',
        background: 'var(--bg-secondary)',
        padding: '0.25rem',
        borderRadius: '0.75rem',
        marginBottom: '1rem',
        border: '1px solid var(--border-subtle)',
    },
    subTabs: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        padding: '0 0.25rem',
    },
    tab: (active: boolean) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.25rem',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: active ? 'white' : 'var(--text-secondary)',
        background: active ? 'var(--primary)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
    }),
    subTab: (active: boolean) => ({
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: active ? 'var(--primary-light)' : 'var(--text-muted)',
        background: active ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
        border: active ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
        cursor: 'pointer',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        transition: 'all 0.2s',
    }),
    card: {
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '1rem',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        transition: 'all 0.3s ease',
    },
    inputGroup: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        alignItems: 'center',
    },
    inputWrapper: {
        flex: 1,
        position: 'relative' as const,
    },
    inputIcon: {
        position: 'absolute' as const,
        left: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--text-muted)',
        width: '20px',
        height: '20px',
    },
    input: {
        width: '100%',
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-light)',
        borderRadius: '0.75rem',
        padding: '0.75rem 1rem 0.75rem 3rem',
        color: 'var(--text-primary)',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.2s ease',
    },
    textArea: {
        width: '100%',
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-light)',
        borderRadius: '0.75rem',
        padding: '0.75rem 1rem',
        color: 'var(--text-primary)',
        fontSize: '0.875rem',
        minHeight: '80px',
        outline: 'none',
        resize: 'none' as const,
        transition: 'all 0.2s ease',
    },
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
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
    }),
    resultBox: (type: 'success' | 'warning' | 'neutral' | 'info') => ({
        background: 'var(--bg-hover)',
        border: `1px solid var(--border-subtle)`,
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '1rem',
    }),
    badge: (type: 'success' | 'warning' | 'info') => ({
        padding: '0.25rem 0.75rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        background: 'var(--nav-active-bg)',
        color: type === 'success' ? 'var(--color-success)' : type === 'warning' ? 'var(--color-error)' : 'var(--color-info)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
    }),
    probBarContainer: {
        height: '8px',
        background: 'var(--bg-tertiary)',
        borderRadius: '999px',
        overflow: 'hidden',
        marginTop: '0.5rem',
    },
    probBar: (width: number) => ({
        height: '100%',
        width: `${width}%`,
        background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
        borderRadius: '999px',
        transition: 'width 0.5s ease',
    }),
};

export default function PredictionsPage() {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<PredictionType>('department');
    const [mode, setMode] = useState<PredictionMode>('real');

    // Stats/History
    const [predictionHistory, setPredictionHistory] = useState<PredictionResultItem[]>([]);
    const [totalHistory, setTotalHistory] = useState(0);
    const [historyPage, setHistoryPage] = useState(1);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

    // Department states
    const [nodeId, setNodeId] = useState('');
    const [neighborIds, setNeighborIds] = useState('');
    const [isLoadingPredict, setIsLoadingPredict] = useState(false);
    const [departmentResult, setDepartmentResult] = useState<any>(null);
    const [unseenResult, setUnseenResult] = useState<any>(null);

    // Link states
    const [sourceNode, setSourceNode] = useState('');
    const [targetNode, setTargetNode] = useState('');
    const [linkResult, setLinkResult] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [mounted, isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (mounted && user) {
            fetchHistory();
        }
    }, [mounted, user, historyPage]);

    const fetchHistory = async () => {
        if (!user) return;
        setIsHistoryLoading(true);
        try {
            const limit = 5;
            const offset = (historyPage - 1) * limit;
            const data = await apiService.getPredictionHistory(user.id, limit, offset) as any;
            setPredictionHistory(data.history.map((h: any) => ({
                id: h._id,
                type: h.type,
                input: typeof h.input === 'string' ? h.input : JSON.stringify(h.input),
                prediction: typeof h.result === 'string' ? h.result : JSON.stringify(h.result),
                confidence: h.confidence,
                timestamp: new Date(h.createdAt)
            })));
            setTotalHistory(data.total);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setIsHistoryLoading(false);
        }
    };

    const addToHistory = async (type: PredictionType, input: string, prediction: string, confidence: number) => {
        if (!user) return;
        try {
            await apiService.savePrediction({
                userId: user.id,
                type,
                input,
                result: prediction,
                confidence
            });
            if (historyPage === 1) {
                fetchHistory();
            } else {
                setHistoryPage(1);
            }
        } catch (error) {
            console.error('Failed to save prediction:', error);
        }
    };

    const handleDepartmentPrediction = async () => {
        setIsLoadingPredict(true);
        setDepartmentResult(null);
        try {
            if (mode === 'real') {
                const result = await apiService.predictDepartment(parseInt(nodeId)) as any;
                setDepartmentResult({
                    ...result,
                    departmentName: getDeptName(result.predicted_department),
                    confidence: result.confidence * 100,
                    topPredictions: (result.top_k_departments || []).map((p: any) => ({
                        dept: p.department,
                        name: getDeptName(p.department),
                        prob: p.score * 100
                    }))
                });
                addToHistory('department', `Node ${nodeId}`, getDeptName(result.predicted_department), result.confidence * 100);
            } else if (mode === 'simulate') {
                const nids = neighborIds.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                const result = await apiService.simulateDepartment(nids) as any;
                setDepartmentResult({
                    ...result,
                    nodeId: 'VIRTUAL',
                    departmentName: getDeptName(result.predicted_department),
                    confidence: result.confidence * 100,
                    topPredictions: []
                });
                addToHistory('department', `Simulated Node`, getDeptName(result.predicted_department), result.confidence * 100);
            }
        } catch (error: any) {
            alert(error.message || "Prediction failed");
        } finally {
            setIsLoadingPredict(false);
        }
    };

    const handleUnseenEvaluation = async () => {
        setIsLoadingPredict(true);
        setUnseenResult(null);
        try {
            const result = await apiService.predictUnseen() as any;
            setUnseenResult(result);
            addToHistory('department', `Unseen Sample #${result.index}`, getDeptName(result.predicted_department), result.confidence * 100);
        } catch (error: any) {
            alert(error.message || "Evaluation failed");
        } finally {
            setIsLoadingPredict(false);
        }
    };

    const handleLinkPredict = async () => {
        setIsLoadingPredict(true);
        setLinkResult(null);
        try {
            let result: any;
            if (mode === 'real') {
                result = await apiService.predictLink(parseInt(sourceNode), parseInt(targetNode));
            } else {
                const nids = neighborIds.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                result = await apiService.simulateLink(nids, parseInt(targetNode));
            }

            const probability = result.score * 100;
            const willConnect = probability > 50;
            setLinkResult({
                source: result.source,
                target: result.target,
                probability,
                willConnect,
                metrics: result.metrics,
                message: result.message
            });
            addToHistory('link', `${sourceNode} → ${targetNode}`, willConnect ? 'Likely' : 'Unlikely', probability);
        } catch (error: any) {
            alert(error.message || "Link prediction failed");
        } finally {
            setIsLoadingPredict(false);
        }
    };

    if (!mounted || isLoading) return null;

    return (
        <Sidebar>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={styles.header}>
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 style={styles.title}>AI Predictive Engine</h1>
                        <p style={styles.subtitle}>Test existing nodes or simulate hypothetical network scenarios</p>
                    </motion.div>
                </div>

                <div style={styles.tabs}>
                    <button onClick={() => { setActiveTab('department'); setMode('real'); }} style={styles.tab(activeTab === 'department')}>
                        <Target size={16} /> Department
                    </button>
                    <button onClick={() => { setActiveTab('link'); setMode('real'); }} style={styles.tab(activeTab === 'link')}>
                        <Link2 size={16} /> Link Prediction
                    </button>
                </div>

                <div style={styles.subTabs}>
                    <button onClick={() => setMode('real')} style={styles.subTab(mode === 'real')}>Existing Data</button>
                    {activeTab === 'department' && (
                        <button onClick={() => setMode('unseen')} style={styles.subTab(mode === 'unseen')}>Model Evaluator</button>
                    )}
                    <button onClick={() => setMode('simulate')} style={styles.subTab(mode === 'simulate')}>What-If Simulator</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem' }}>
                    {/* Left Column: Inputs & Results */}
                    <div>
                        <AnimatePresence mode="wait">
                            {activeTab === 'department' && (
                                <motion.div key="dept-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.card}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--nav-active-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {mode === 'real' ? <Search size={20} color="var(--primary)" /> : mode === 'unseen' ? <FlaskConical size={20} color="var(--primary)" /> : <Zap size={20} color="var(--primary)" />}
                                        </div>
                                        <div>
                                            <h3 style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{mode === 'real' ? 'Classify Existing Node' : mode === 'unseen' ? 'Unseen Data Evaluator' : 'Simulate New Node'}</h3>
                                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                                {mode === 'real' ? 'Predict department for a node in the current graph.' : mode === 'unseen' ? 'Test model accuracy using data not seen during training.' : 'Define hypothetical neighbor connections to predict department.'}
                                            </p>
                                        </div>
                                    </div>

                                    {mode === 'real' && (
                                        <div style={styles.inputGroup}>
                                            <div style={styles.inputWrapper}>
                                                <Search style={styles.inputIcon} />
                                                <input type="number" value={nodeId} onChange={(e) => setNodeId(e.target.value)} placeholder="Enter Node ID (e.g. 52)" style={styles.input} />
                                            </div>
                                            <button onClick={handleDepartmentPrediction} disabled={isLoadingPredict || !nodeId} style={styles.btnPrimary(isLoadingPredict || !nodeId)}>
                                                {isLoadingPredict ? '...' : 'Predict'}
                                            </button>
                                        </div>
                                    )}

                                    {mode === 'unseen' && (
                                        <div style={{ textAlign: 'center', padding: '1rem', border: '1px dashed var(--border-light)', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>Click the button to fetch a random sample from the hidden test partition.</p>
                                            <button onClick={handleUnseenEvaluation} disabled={isLoadingPredict} style={{ ...styles.btnPrimary(isLoadingPredict), margin: '0 auto' }}>
                                                <FlaskConical size={18} /> {isLoadingPredict ? 'Analyzing...' : 'Fetch & Evaluate Random Sample'}
                                            </button>
                                        </div>
                                    )}

                                    {mode === 'simulate' && (
                                        <div>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>LIST HYPOTHETICAL NEIGHBORS (Commonly connected node IDs)</p>
                                            <textarea
                                                value={neighborIds}
                                                onChange={(e) => setNeighborIds(e.target.value)}
                                                placeholder="e.g. 5, 22, 104, 553"
                                                style={styles.textArea}
                                            />
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                                <button onClick={handleDepartmentPrediction} disabled={isLoadingPredict || !neighborIds} style={styles.btnPrimary(isLoadingPredict || !neighborIds)}>
                                                    Predict Simulated Department
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Dept Results */}
                                    <AnimatePresence>
                                        {departmentResult && mode !== 'unseen' && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                                <div style={styles.resultBox('neutral')}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                        <span style={{ color: 'var(--text-muted)' }}>PREDICTION RESULT</span>
                                                        <span style={styles.badge('success')}>{departmentResult.confidence.toFixed(1)}% Confidence</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <div style={{ width: 60, height: 60, borderRadius: 12, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.25rem' }}>
                                                            {departmentResult.predicted_department}
                                                        </div>
                                                        <div>
                                                            <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.125rem' }}>{departmentResult.departmentName}</p>
                                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Predicted via {departmentResult.method || 'Node Embeddings'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {unseenResult && mode === 'unseen' && (
                                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                                <div style={styles.resultBox(unseenResult.is_correct ? 'success' : 'warning')}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                        <span style={{ color: 'var(--text-muted)' }}>UNSEEN SAMPLE #{unseenResult.index}</span>
                                                        <span style={styles.badge(unseenResult.is_correct ? 'success' : 'warning')}>
                                                            {unseenResult.is_correct ? 'Correct Prediction' : 'Incorrect Prediction'}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                        <div style={{ padding: '0.75rem', background: 'var(--bg-hover)', borderRadius: '0.5rem' }}>
                                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ground Truth</p>
                                                            <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Dept {unseenResult.actual_department}</p>
                                                        </div>
                                                        <div style={{ padding: '0.75rem', background: 'var(--bg-hover)', borderRadius: '0.5rem' }}>
                                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Model Predicted</p>
                                                            <p style={{ fontSize: '1.125rem', fontWeight: 600, color: unseenResult.is_correct ? 'var(--color-success)' : 'var(--color-error)' }}>Dept {unseenResult.predicted_department}</p>
                                                        </div>
                                                    </div>
                                                    <div style={{ marginTop: '1rem' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                                            <span>Confidence Score</span>
                                                            <span>{(unseenResult.confidence * 100).toFixed(1)}%</span>
                                                        </div>
                                                        <div style={styles.probBarContainer}>
                                                            <div style={{ ...styles.probBar(unseenResult.confidence * 100), background: unseenResult.is_correct ? '#10b981' : '#f43f5e' }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}

                            {activeTab === 'link' && (
                                <motion.div key="link-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.card}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--nav-active-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Link2 size={20} color="var(--primary)" />
                                        </div>
                                        <div>
                                            <h3 style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{mode === 'real' ? 'Link Predictor' : 'Link Simulator'}</h3>
                                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                                {mode === 'real' ? 'Check if two existing employees are likely to communicate.' : 'Simulate a new employee and check link probability to an existing node.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {mode === 'simulate' && (
                                            <div style={{ marginBottom: '0.5rem' }}>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>NEW NODE'S NEIGHBORS (IDs)</p>
                                                <input type="text" value={neighborIds} onChange={(e) => setNeighborIds(e.target.value)} placeholder="e.g. 5, 10, 15" style={styles.input} />
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>{mode === 'real' ? 'SOURCE NODE' : 'TARGET NODE (Existing)'}</p>
                                                <div style={styles.inputWrapper}>
                                                    <Users style={styles.inputIcon} />
                                                    <input type="number" value={mode === 'real' ? sourceNode : targetNode} onChange={(e) => mode === 'real' ? setSourceNode(e.target.value) : setTargetNode(e.target.value)} placeholder="0-1004" style={styles.input} />
                                                </div>
                                            </div>
                                            {mode === 'real' && (
                                                <>
                                                    <ArrowRight color="var(--border-subtle)" />
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>TARGET NODE</p>
                                                        <div style={styles.inputWrapper}>
                                                            <Users style={styles.inputIcon} />
                                                            <input type="number" value={targetNode} onChange={(e) => setTargetNode(e.target.value)} placeholder="0-1004" style={styles.input} />
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <button onClick={handleLinkPredict} disabled={isLoadingPredict || !targetNode || (mode === 'real' && !sourceNode) || (mode === 'simulate' && !neighborIds)} style={{ ...styles.btnPrimary(isLoadingPredict), width: '100%' }}>
                                            <Zap size={18} /> {isLoadingPredict ? 'Analyzing...' : 'Predict Connection Probability'}
                                        </button>
                                    </div>

                                    {linkResult && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '1.5rem' }}>
                                            <div style={styles.resultBox(linkResult.willConnect ? 'success' : 'warning')}>
                                                {linkResult.message && (
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--primary)', textAlign: 'center', marginBottom: '0.5rem', fontWeight: 600 }}>{linkResult.message.toUpperCase()}</p>
                                                )}
                                                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>PROBABILITY OF CONNECTION</p>
                                                    <p style={{ fontSize: '2.5rem', fontWeight: 800, color: linkResult.willConnect ? 'var(--color-success)' : 'var(--color-error)' }}>{linkResult.probability.toFixed(1)}%</p>
                                                </div>
                                                <div style={styles.probBarContainer}>
                                                    <div style={{ ...styles.probBar(linkResult.probability), background: linkResult.willConnect ? '#10b981' : '#f43f5e' }} />
                                                </div>
                                            </div>
                                            {linkResult.metrics && (
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                                    {Object.entries(linkResult.metrics).slice(0, 4).map(([key, val]: [any, any]) => (
                                                        <div key={key} style={{ padding: '0.75rem', background: 'var(--bg-hover)', borderRadius: '0.5rem' }}>
                                                            <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{key.replace('_', ' ')}</p>
                                                            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{typeof val === 'number' ? val.toFixed(3) : val}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Column: History & Stats */}
                    <div>
                        <div style={styles.card}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                <History size={20} color="var(--primary)" />
                                <h3 style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Prediction History</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {predictionHistory.length > 0 ? predictionHistory.map((item, i) => (
                                    <div key={i} style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'var(--bg-hover)', borderLeft: `3px solid ${item.type === 'department' ? 'var(--primary)' : 'var(--accent-purple)'}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: item.type === 'department' ? 'var(--primary)' : 'var(--accent-purple)' }}>{item.type.toUpperCase()}</span>
                                            <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500 }}>{item.input}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.prediction}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>{item.confidence.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>No history yet.</div>
                                )}
                            </div>

                            {totalHistory > 5 && (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                                    <button
                                        onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                                        disabled={historyPage === 1 || isHistoryLoading}
                                        style={{ background: 'transparent', border: 'none', color: historyPage === 1 ? 'var(--text-muted)' : 'var(--primary)', cursor: historyPage === 1 ? 'default' : 'pointer' }}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {historyPage} / {Math.ceil(totalHistory / 5)}
                                    </span>
                                    <button
                                        onClick={() => setHistoryPage(p => Math.min(Math.ceil(totalHistory / 5), p + 1))}
                                        disabled={historyPage >= Math.ceil(totalHistory / 5) || isHistoryLoading}
                                        style={{ background: 'transparent', border: 'none', color: historyPage >= Math.ceil(totalHistory / 5) ? 'var(--text-muted)' : 'var(--primary)', cursor: historyPage >= Math.ceil(totalHistory / 5) ? 'default' : 'pointer' }}
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div style={{ ...styles.card, background: 'var(--nav-active-bg)', border: '1px solid var(--color-success)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                <Activity size={20} color="var(--color-success)" />
                                <h3 style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Model Performance</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-success)' }}>79.1%</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Department Accuracy</p>
                                </div>
                                <div style={{ height: '1px', background: 'var(--border-subtle)', width: '60%', margin: '0 auto' }} />
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>92.7%</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Link Prediction Accuracy</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Sidebar>
    );
}
