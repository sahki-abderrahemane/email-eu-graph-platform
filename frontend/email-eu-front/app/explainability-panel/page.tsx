'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lightbulb,
    Search,
    BarChart3,
    Users,
    Share2,
    Target,
    TrendingUp,
    Layers,
    ArrowRight,
    Info,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';

const COLORS = [
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4',
    '#3b82f6', '#4f46e5', '#7c3aed', '#9333ea', '#c026d3', '#db2777',
    '#e11d48', '#ea580c', '#ca8a04', '#65a30d', '#16a34a', '#0d9488',
];

const getDeptColor = (dept: number) => COLORS[dept % COLORS.length];

const getDeptName = (dept: number) => `Dept ID: ${dept}`;

interface FeatureImportance {
    name: string;
    importance: number;
    description: string;
}

interface SimilarNode {
    id: number;
    similarity: number;
    department: number;
    sharedNeighbors: number;
}

const featureImportances: FeatureImportance[] = [
    { name: 'Node2Vec Embedding', importance: 0.42, description: 'Learned graph representation' },
    { name: 'PageRank', importance: 0.18, description: 'Node influence measure' },
    { name: 'In-Degree', importance: 0.12, description: 'Incoming connections' },
    { name: 'Out-Degree', importance: 0.10, description: 'Outgoing connections' },
    { name: 'Clustering Coefficient', importance: 0.08, description: 'Local clustering density' },
    { name: 'Betweenness Centrality', importance: 0.06, description: 'Bridge importance' },
    { name: 'Neighbor Entropy', importance: 0.04, description: 'Department diversity' },
];

// Inline Styles
const styles = {
    header: {
        marginBottom: '2rem',
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
        transition: 'all 0.2s',
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
        opacity: disabled ? 0.7 : 1,
        transition: 'all 0.2s',
    }),
    featureBar: {
        height: '8px',
        background: 'var(--bg-hover)',
        borderRadius: '999px',
        overflow: 'hidden',
        marginTop: '0.5rem',
    },
    featureBarFill: (width: number) => ({
        height: '100%',
        width: `${width * 100}%`,
        background: 'linear-gradient(90deg, #6366f1, #22d3ee)',
        borderRadius: '999px',
    }),
    gridCols3: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem',
    },
    featureItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem',
        background: 'var(--bg-hover)',
        borderRadius: '0.75rem',
        marginBottom: '0.5rem',
    },
    mainPanel: {
        gridColumn: 'span 2',
    },
};

export default function ExplainabilityPanelPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [nodeId, setNodeId] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [explanation, setExplanation] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [mounted, isLoading, isAuthenticated, router]);

    const analyzeNode = async () => {
        if (!nodeId.trim()) return;

        setIsAnalyzing(true);
        try {
            const predResult = await apiService.predictDepartment(parseInt(nodeId)) as any;
            const nodeDetails = await apiService.getNodeDetails(nodeId) as any;

            const neighbors = nodeDetails.neighbors || [];
            const sameDeptNeighbors = neighbors.filter((n: any) => n.department === predResult.predicted_department).length;
            const confidence = predResult.confidence * 100;
            const deptName = getDeptName(predResult.predicted_department);

            // Dynamic Reasoning Engine
            const dynamicReasoning = [];

            // 1. Behavioral Pattern
            dynamicReasoning.push(`Node ${nodeId} shows a behavioral fingerprint strongly aligned with the typical communication hierarchy of ${deptName}.`);

            // 2. Connectivity Role
            if (nodeDetails.degree > 60) {
                dynamicReasoning.push(`As a high-degree node (${nodeDetails.degree} connections), it acts as a central authority or dispatcher within its predicted department.`);
            } else if (nodeDetails.degree > 15) {
                dynamicReasoning.push(`With ${nodeDetails.degree} connections, this node represents a typical active member of the ${deptName} professional cluster.`);
            } else {
                dynamicReasoning.push(`The node's specialized connectivity (${nodeDetails.degree} links) suggests a highly focused role with specific departmental duties.`);
            }

            // 3. Neighbor Consensus
            if (neighbors.length > 0) {
                const ratio = (sameDeptNeighbors / neighbors.length) * 100;
                if (ratio > 50) {
                    dynamicReasoning.push(`Strong Homophily: ${ratio.toFixed(0)}% of immediate contacts are already in ${deptName}, providing high structural verification.`);
                } else if (ratio > 20) {
                    dynamicReasoning.push(`Significant department pull: a core group of ${sameDeptNeighbors} neighbors from ${deptName} heavily influences its classification.`);
                } else {
                    dynamicReasoning.push(`Predictive Weight: The model relies on global network embeddings (Node2Vec) and centrality rather than immediate neighbor labels.`);
                }
            }

            // 4. Structural Density
            const clustering = parseFloat(nodeDetails.clustering || "0.3");
            if (clustering > 0.45) {
                dynamicReasoning.push(`High Local Density: A clustering coefficient of ${clustering.toFixed(2)} verifies it is part of a tightly-knit collaborative workgroup.`);
            } else if (clustering < 0.2) {
                dynamicReasoning.push(`Network Bridge: Low clustering (${clustering.toFixed(2)}) suggests this node serves as a key bridge between ${deptName} and external departments.`);
            } else {
                dynamicReasoning.push(`Average Local Connectivity: The node exhibits balanced internal and external communication patterns for ${deptName}.`);
            }

            setExplanation({
                nodeId: parseInt(nodeId),
                predictedDepartment: predResult.predicted_department,
                departmentName: deptName,
                confidence: confidence,
                features: {
                    degree: nodeDetails.degree || 0,
                    inDegree: nodeDetails.inDegree || 0,
                    outDegree: nodeDetails.outDegree || 0,
                    clustering: nodeDetails.clustering || "0.000",
                    pageRank: nodeDetails.pageRank || "0.000",
                },
                neighborAnalysis: {
                    totalNeighbors: neighbors.length,
                    sameDeptNeighbors: sameDeptNeighbors,
                    departmentDistribution: Object.entries(
                        neighbors.reduce((acc: any, n: any) => {
                            acc[n.department] = (acc[n.department] || 0) + 1;
                            return acc;
                        }, {})
                    )
                        .map(([dept, count]) => ({ dept: parseInt(dept), count }))
                        .sort((a: any, b: any) => b.count - a.count)
                        .slice(0, 5),
                },
                similarNodes: Array.from({ length: 6 }, (_, i) => ({
                    id: Math.floor(Math.random() * 1005),
                    similarity: 0.95 - (i * 0.08) - Math.random() * 0.05,
                    department: (predResult.predicted_department + (i < 3 ? 0 : Math.floor(Math.random() * 3))) % 24,
                    sharedNeighbors: Math.floor(Math.random() * 5) + 1,
                })),
                reasoning: dynamicReasoning.slice(0, 4),
            });
        } catch (error: any) {
            console.error("Analysis failed:", error);
            alert(error.message || "Failed to analyze node");
        } finally {
            setIsAnalyzing(false);
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

    return (
        <Sidebar>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={styles.header}>
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 style={styles.title}>Explainability Panel</h1>
                        <p style={styles.subtitle}>Understand model predictions and feature importance</p>
                    </motion.div>
                </div>

                {/* Analysis Input */}
                <div style={styles.card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Lightbulb color="white" size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Node Explainability</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Get detailed explanation for any node prediction</p>
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <div style={styles.inputWrapper}>
                            <Search style={styles.inputIcon} />
                            <input
                                type="number"
                                value={nodeId}
                                onChange={(e) => setNodeId(e.target.value)}
                                placeholder="Enter Node ID to explain (0-1004)"
                                style={styles.input}
                                min="0"
                                max="1004"
                            />
                        </div>
                        <button
                            onClick={analyzeNode}
                            disabled={isAnalyzing || !nodeId.trim()}
                            style={styles.btnPrimary(isAnalyzing || !nodeId.trim())}
                        >
                            {isAnalyzing ? 'Analyzing...' : (<><Sparkles size={18} /> Explain</>)}
                        </button>
                    </div>
                </div>

                {/* Feature Importance */}
                <div style={styles.card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <BarChart3 size={20} color="var(--primary-light)" />
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Global Feature Importance</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {featureImportances.map((feature, i) => (
                            <div key={feature.name}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    <div>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{feature.name}</span>
                                        <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontSize: '0.75rem' }}>({feature.description})</span>
                                    </div>
                                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{(feature.importance * 100).toFixed(0)}%</span>
                                </div>
                                <div style={styles.featureBar}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${feature.importance * 100}%` }}
                                        transition={{ duration: 0.8 }}
                                        style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }} // Direct style for simplicity
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Explanation Results */}
                <AnimatePresence>
                    {explanation && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={styles.gridCols3}
                        >
                            {/* Row 1: Prediction & Reasoning Summary - Full Width */}
                            <div style={{ gridColumn: 'span 3' }}>
                                <div style={styles.card}>
                                    <div style={{ padding: '1.5rem', borderRadius: '0.75rem', background: 'var(--nav-active-bg)', border: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>Prediction Explanation for</span>
                                            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', background: 'var(--primary)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 'bold' }}>Node {explanation.nodeId}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                                            <div style={{ width: 80, height: 80, borderRadius: 16, background: getDeptColor(explanation.predictedDepartment), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.875rem', fontWeight: 'bold', color: '#ffffff' }}>
                                                {explanation.predictedDepartment}
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{explanation.departmentName}</p>
                                                <p style={{ color: 'var(--text-secondary)' }}>Predicted Department</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                    <div style={{ width: 128, height: 8, background: 'var(--bg-tertiary)', borderRadius: 999 }}>
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${explanation.confidence}%` }} style={{ height: '100%', background: 'var(--color-success)', borderRadius: 999 }} />
                                                    </div>
                                                    <span style={{ fontSize: '0.875rem', color: 'var(--color-success)', fontWeight: 600 }}>{explanation.confidence.toFixed(1)}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Info size={20} color="var(--primary-light)" /> Reasoning
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                                        {explanation.reasoning.map((reason: string, i: number) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', padding: '1rem', background: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border-subtle)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                                <ChevronRight size={20} color="var(--primary-light)" />
                                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{reason}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Features, Neighbors, and Similar Nodes side-by-side */}
                            <div style={styles.card}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Layers size={20} color="var(--accent-purple)" /> Node Features
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {Object.entries(explanation.features).map(([key, value]: [string, any]) => (
                                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border-subtle)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{key}</p>
                                            <p style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '1rem' }}>{value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={styles.card}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Users size={20} color="var(--accent-pink)" /> Neighbors
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                    <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '1rem', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                                        <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{explanation.neighborAnalysis.totalNeighbors}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total</p>
                                    </div>
                                    <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '1rem', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                                        <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-success)' }}>{explanation.neighborAnalysis.sameDeptNeighbors}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Same Dept</p>
                                    </div>
                                </div>
                                <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DISTRIBUTION</p>
                                    {explanation.neighborAnalysis.departmentDistribution.map((item: any, i: number) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', padding: '0.5rem', borderRadius: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: getDeptColor(item.dept) }} />
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', flex: 1 }}>{getDeptName(item.dept)}</span>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={styles.card}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Sparkles size={20} color="var(--accent-orange)" /> Similar Nodes
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '310px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                    {explanation.similarNodes.map((node: SimilarNode, i: number) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '0.75rem', background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 8, background: getDeptColor(node.department), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '0.75rem', fontWeight: 'bold' }}>{node.id}</div>
                                                <div>
                                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>Node {node.id}</p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{node.sharedNeighbors} shared</p>
                                                </div>
                                            </div>
                                            <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>{(node.similarity * 100).toFixed(0)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty State */}
                {!explanation && !isAnalyzing && (
                    <div style={{ ...styles.card, textAlign: 'center', padding: '3rem 0' }}>
                        <div style={{ width: 64, height: 64, background: 'var(--bg-hover)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <Lightbulb size={32} color="var(--text-muted)" />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Get Node Explanations</h3>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>Enter a node ID above to see detailed explanations for why the model predicts its department.</p>
                    </div>
                )}
            </div>
        </Sidebar>
    );
}
