'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Download,
    RefreshCw,
    X,
    ChevronDown,
    Info,
    Users,
    Share2,
    Target,
    Box
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import { useTheme } from '@/lib/theme-context';
import apiService from '@/lib/api';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';

// Register cola layout
if (typeof window !== 'undefined') {
    try {
        if (!(cytoscape.prototype as any).hasExtension?.('cola')) {
            cytoscape.use(cola);
        }
    } catch (e) {
        console.warn('Cola registration failed, might be already registered');
    }
}

const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });
// Mock data for demonstration
const mockNodes = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    label: `Node ${i}`,
    department: Math.floor(Math.random() * 10),
    degree: Math.floor(Math.random() * 50) + 5,
    pageRank: Math.random() * 0.01,
}));

const COLORS = [
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4',
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6',
    '#0ea5e9', '#6d28d9', '#be185d', '#047857', '#b91c1c', '#7c2d12',
    '#4d7c0f', '#1d4ed8', '#5b21b6', '#a21caf', '#334155', '#475569',
    '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9', '#f8fafc',
    '#7f1d1d', '#713f12', '#14532d', '#164e63', '#1e3a8a', '#312e81'
];

const getDeptColor = (dept: number) => COLORS[dept % COLORS.length];

interface NodeData {
    id: number;
    label: string;
    department: number;
    degree: number;
    pageRank: number;
}

// Inline Styles
const styles = {
    header: { marginBottom: '1.5rem', display: 'flex', flexDirection: 'column' as const, gap: '1rem' },
    title: { fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' },
    subtitle: { color: 'var(--text-secondary)', marginTop: '0.25rem' },
    controls: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' as const },
    inputWrapper: { position: 'relative' as const },
    inputIcon: { position: 'absolute' as const, left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '1rem', height: '1rem' },
    input: { padding: '0.5rem 1rem 0.5rem 2.5rem', width: '100%', maxWidth: '16rem', background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: '0.5rem', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' },
    btnSecondary: (active: boolean = false) => ({ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: active ? '1px solid var(--primary)' : '1px solid var(--border-subtle)', background: active ? 'rgba(99,102,241,0.1)' : 'transparent', color: active ? 'var(--primary-light)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem' }),
    dropdown: { position: 'absolute' as const, right: 0, top: '100%', marginTop: '0.5rem', width: '16rem', background: 'var(--bg-card)', backdropFilter: 'blur(10px)', borderRadius: '0.75rem', padding: '1rem', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)', zIndex: 50 },
    card: { background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: 'var(--shadow-premium)' },
    vizContainer: { background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '1.25rem', overflow: 'hidden', position: 'relative' as const, height: '700px', boxShadow: 'var(--shadow-premium)' },
    zoomControls: { position: 'absolute' as const, top: '1.5rem', right: '1.5rem', display: 'flex', flexDirection: 'column' as const, gap: '0.75rem', zIndex: 10 },
    zoomBtn: {
        width: '2.75rem',
        height: '2.75rem',
        borderRadius: '0.75rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-card)',
        transition: 'all 0.2s ease',
    },
    legend: { position: 'absolute' as const, bottom: '1.5rem', left: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '1.25rem', borderRadius: '1rem', boxShadow: 'var(--shadow-premium)', opacity: 0.95 },
    detailItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem', background: 'var(--bg-hover)', borderRadius: '0.75rem', marginBottom: '0.75rem' },
    btnPrimary: { width: '100%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%)', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.875rem 1.5rem', fontWeight: 600, cursor: 'pointer', marginTop: '1rem', transition: 'all 0.3s ease' },
    statBox: { textAlign: 'center' as const, padding: '1rem', background: 'var(--bg-hover)', borderRadius: '0.75rem', flex: 1 }
};

export default function GraphExplorerPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
    const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const canvasRef = useRef<HTMLDivElement>(null);

    // Data state
    const [nodes, setNodes] = useState<any[]>([]);
    const [edges, setEdges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEdges, setShowEdges] = useState(true);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [mounted, isLoading, isAuthenticated, router]);


    // Fetch graph data
    const fetchData = useCallback(async (bypassCache: boolean = false) => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const [nodesData, edgesData] = await Promise.all([
                apiService.getNodes(bypassCache),
                apiService.getEdges(bypassCache)
            ]);
            setNodes(nodesData);
            setEdges(edgesData);
        } catch (error) {
            console.error("Failed to fetch graph explorer data", error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (mounted && isAuthenticated) {
            fetchData();
        }
    }, [mounted, isAuthenticated, fetchData]);

    // Filter nodes
    const filteredNodes = nodes.filter(node => {
        const matchesSearch = (node.label || `Node ${node.id}`).toLowerCase().includes(searchQuery.toLowerCase()) ||
            node.id.toString().includes(searchQuery);
        const matchesDepartment = selectedDepartments.length === 0 ||
            selectedDepartments.includes(node.department);
        return matchesSearch && matchesDepartment;
    });

    const toggleDepartment = (dept: number) => {
        setSelectedDepartments(prev =>
            prev.includes(dept)
                ? prev.filter(d => d !== dept)
                : [...prev, dept]
        );
    };

    // Derived state for stats and viz
    const totalDepartments = useMemo(() => {
        if (nodes.length === 0) return 0;
        return new Set(nodes.map(n => n.department)).size;
    }, [nodes]);

    const nodeDegrees = useMemo(() => {
        const degreeMap = new Map<number, number>();
        edges.forEach(edge => {
            degreeMap.set(edge.source, (degreeMap.get(edge.source) || 0) + 1);
            degreeMap.set(edge.target, (degreeMap.get(edge.target) || 0) + 1);
        });
        return degreeMap;
    }, [edges]);

    const departmentsList = useMemo(() => {
        const depts = Array.from(new Set(nodes.map(n => n.department))).sort((a, b) => a - b);
        return depts;
    }, [nodes]);

    // Prepare Cytoscape Elements
    const elements = useMemo(() => {
        const nodeElements = filteredNodes.map(node => {
            const degree = nodeDegrees.get(node.id) || 1;
            return {
                data: {
                    id: node.id.toString(),
                    label: node.id.toString(),
                    department: node.department,
                    degree: degree,
                    pageRank: node.pageRank || 0,
                    color: getDeptColor(node.department),
                    size: 15 + Math.log(degree + 1) * 5
                }
            };
        });

        // Limit edges for performance but show more than before
        const nodeSet = new Set(filteredNodes.map(n => n.id.toString()));
        const edgeElements = showEdges ? edges
            .filter(e => nodeSet.has(e.source.toString()) && nodeSet.has(e.target.toString()))
            .slice(0, 3000)
            .map(e => ({
                data: {
                    id: `e${e.source}-${e.target}`,
                    source: e.source.toString(),
                    target: e.target.toString()
                }
            })) : [];

        return [...nodeElements, ...edgeElements];
    }, [filteredNodes, edges, nodeDegrees, showEdges]);

    // Memoized Graph data for 3D
    const forceGraphData = useMemo(() => {
        const nodes3D = filteredNodes.map(n => ({
            id: n.id,
            label: `Node ${n.id}`,
            val: (nodeDegrees.get(n.id) || 1) * 0.5,
            color: getDeptColor(n.department),
            department: n.department,
            degree: nodeDegrees.get(n.id) || 0,
            pageRank: n.pageRank || 0,
        }));

        // Fast ID lookup
        const nodeSet = new Set(filteredNodes.map(n => n.id));

        const links3D = edges
            .filter(e => nodeSet.has(e.source) && nodeSet.has(e.target))
            .slice(0, 5000) // Limit to 5k edges in 3D for performance
            .map(e => ({
                source: e.source,
                target: e.target
            }));

        return { nodes: nodes3D, links: links3D };
    }, [filteredNodes, edges, nodeDegrees]);

    // Force engine tuning & centering
    useEffect(() => {
        if (viewMode === '3d' && fgRef.current) {
            const fg = fgRef.current;

            // Add centering force explicitly
            fg.d3Force('center', (window as any).d3?.forceCenter() || null);
            fg.d3Force('charge').strength(-120);
            fg.d3Force('link').distance(50);

            // Give it a small timeout to let the force engine start
            const timeout = setTimeout(() => {
                if (fgRef.current) {
                    fgRef.current.zoomToFit(600, 100);
                }
            }, 800);

            return () => clearTimeout(timeout);
        }
    }, [viewMode, forceGraphData, mounted]);
    const cyStylesheet: any[] = [
        {
            selector: 'node',
            style: {
                'label': 'data(label)',
                'background-color': 'data(color)',
                'width': 'data(size)',
                'height': 'data(size)',
                'color': '#cbd5e1',
                'font-size': '10px',
                'text-valign': 'bottom',
                'text-halign': 'center',
                'text-margin-y': '5px',
                'border-width': 2,
                'border-color': '#16161f',
                'overlay-padding': '6px',
                'z-index': 10
            }
        },
        {
            selector: 'edge',
            style: {
                'width': 1,
                'line-color': '#475569',
                'curve-style': 'haystack',
                'opacity': 0.3,
                'overlay-padding': '3px'
            }
        },
        {
            selector: 'node:selected',
            style: {
                'border-width': 4,
                'border-color': '#ffffff',
                'border-opacity': 0.8
            }
        }
    ];

    const cyRef = useRef<any | null>(null);
    const fgRef = useRef<any | null>(null); // Ref for ForceGraph3D

    const handleCyInit = useCallback((cy: any) => {
        cyRef.current = cy;
        cy.on('tap', 'node', (evt: any) => {
            const node = evt.target.data();
            setSelectedNode({
                id: parseInt(node.id),
                label: `Node ${node.id}`,
                department: node.department,
                degree: node.degree,
                pageRank: node.pageRank
            });
        });

        cy.on('tap', (evt: any) => {
            if (evt.target === cy) {
                setSelectedNode(null);
            }
        });
    }, []);

    // 3D Graph Handlers (Moved to top level to avoid hook errors)
    const handleNodeClick = useCallback((node: any) => {
        setSelectedNode({
            id: node.id,
            label: node.label,
            department: node.department,
            degree: node.degree,
            pageRank: node.pageRank
        });
    }, []);

    const linkColorCallback = useMemo(() => () => 'rgba(148, 163, 184, 0.45)', []);
    const linkParticleColorCallback = useMemo(() => () => '#818cf8', []);

    const handleZoomIn = () => {
        if (viewMode === '2d' && cyRef.current) {
            cyRef.current.zoom(cyRef.current.zoom() * 1.2);
        } else if (viewMode === '3d' && fgRef.current) {
            const cam = fgRef.current.camera();
            if (cam) {
                cam.position.z *= 0.8;
                cam.position.x *= 0.8;
                cam.position.y *= 0.8;
            }
        }
    };
    const handleZoomOut = () => {
        if (viewMode === '2d' && cyRef.current) {
            cyRef.current.zoom(cyRef.current.zoom() / 1.2);
        } else if (viewMode === '3d' && fgRef.current) {
            const cam = fgRef.current.camera();
            if (cam) {
                cam.position.z *= 1.2;
                cam.position.x *= 1.2;
                cam.position.y *= 1.2;
            }
        }
    };
    const handleResetZoom = () => {
        if (viewMode === '2d' && cyRef.current) {
            cyRef.current.fit();
        } else if (viewMode === '3d' && fgRef.current) {
            fgRef.current.zoomToFit(600, 100);
        }
    };

    const handleRerunLayout = () => {
        if (viewMode === '2d' && cyRef.current) {
            const layout = cyRef.current.layout({
                name: 'cola',
                infinite: false,
                fit: true,
                padding: 50,
                nodeSpacing: 40,
                edgeLength: 100,
                randomize: true,
                animate: true,
                maxSimulationTime: 3000
            } as any);
            layout.run();
        } else if (viewMode === '3d' && fgRef.current) {
            fgRef.current.d3ReheatSimulation();
        }
    };

    const handleCopyNodeData = () => {
        if (selectedNode) {
            const data = JSON.stringify(selectedNode, null, 2);
            navigator.clipboard.writeText(data);
            alert('Node data copied to clipboard!');
        }
    };

    const handleExport = () => {
        const dataStr = JSON.stringify({ nodes: filteredNodes, edges }, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = 'graph_data.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    if (!mounted || isLoading || loading) {
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
            <div style={{ maxWidth: '1400px', margin: '0 0' }}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                            <h1 style={styles.title}>Graph Explorer</h1>
                            <p style={styles.subtitle}>Interactive visualization of the email network</p>
                        </motion.div>

                        <div style={styles.controls}>
                            <div style={styles.inputWrapper}>
                                <Search style={styles.inputIcon} />
                                <input
                                    type="text"
                                    placeholder="Search nodes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={styles.input}
                                />
                            </div>

                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    style={styles.btnSecondary(isFilterOpen)}
                                >
                                    <Filter size={16} />
                                    Filter
                                    {selectedDepartments.length > 0 && (
                                        <span style={{ background: 'var(--primary)', color: 'white', fontSize: '0.75rem', padding: '0 0.375rem', borderRadius: '999px' }}>
                                            {selectedDepartments.length}
                                        </span>
                                    )}
                                    <ChevronDown size={16} style={{ transform: isFilterOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                                </button>

                                <AnimatePresence>
                                    {isFilterOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            style={styles.dropdown}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Departments</span>
                                                {selectedDepartments.length > 0 && (
                                                    <button onClick={() => setSelectedDepartments([])} style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>Clear all</button>
                                                )}
                                            </div>
                                            <div style={{ maxHeight: '12rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {departmentsList.map((dept) => (
                                                    <label key={dept} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.25rem' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedDepartments.includes(dept)}
                                                            onChange={() => toggleDepartment(dept)}
                                                            style={{ width: '1rem', height: '1rem', accentColor: 'var(--primary)' }}
                                                        />
                                                        <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: getDeptColor(dept) }}></div>
                                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Department {dept}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button onClick={handleExport} style={styles.btnSecondary(false)}>
                                <Download size={16} />
                                <span style={{ display: 'none', lg: { display: 'inline' } } as any}>Export</span>
                            </button>

                            <button
                                onClick={() => setViewMode(v => v === '2d' ? '3d' : '2d')}
                                style={styles.btnSecondary(viewMode === '3d')}
                                title="Toggle 3D Perspective"
                            >
                                <Box size={16} />
                                {viewMode === '3d' ? '3D Mode' : '2D Mode'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                {/* CSS Grid for Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem', width: '100%' }}>
                    {/* Graph Canvas */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={styles.vizContainer}
                    >
                        <div style={styles.zoomControls}>
                            <button onClick={handleZoomIn} title="Zoom In" style={styles.zoomBtn}><ZoomIn size={20} /></button>
                            <button onClick={handleZoomOut} title="Zoom Out" style={styles.zoomBtn}><ZoomOut size={20} /></button>
                            <button onClick={handleResetZoom} title="Fit Content" style={styles.zoomBtn}><Maximize2 size={20} /></button>
                            <button onClick={() => fetchData(true)} title="Reload Data" style={{ ...styles.zoomBtn, background: 'var(--nav-active-bg)' }}><RefreshCw size={20} /></button>
                            <button onClick={handleRerunLayout} title="Re-simulate Layout" style={styles.zoomBtn}><RefreshCw size={20} style={{ transform: 'rotate(180deg)' }} /></button>
                            <button onClick={() => setShowEdges(!showEdges)} title={showEdges ? "Hide Edges" : "Show Edges"} style={{ ...styles.zoomBtn, color: showEdges ? 'var(--primary)' : 'var(--text-muted)' }}><Share2 size={20} /></button>
                        </div>

                        <div style={{ height: '100%', background: 'var(--bg-primary)', position: 'relative' }}>
                            {viewMode === '2d' ? (
                                <CytoscapeComponent
                                    elements={elements}
                                    style={{ width: '100%', height: '100%' }}
                                    stylesheet={cyStylesheet}
                                    cy={handleCyInit}
                                    layout={{
                                        name: 'cola',
                                        infinite: false,
                                        fit: true,
                                        padding: 50,
                                        nodeSpacing: 40,
                                        edgeLength: 100,
                                        randomize: false,
                                        animate: true,
                                        maxSimulationTime: 3000
                                    } as any}
                                />
                            ) : (
                                <ForceGraph3D
                                    ref={fgRef}
                                    graphData={forceGraphData}
                                    nodeLabel="label"
                                    nodeColor="color"
                                    nodeVal="val"
                                    linkDirectionalArrowLength={3.5}
                                    linkDirectionalArrowRelPos={1}
                                    backgroundColor={isDark ? "#0a0a0f" : "#f8fafc"}
                                    onNodeClick={handleNodeClick}
                                    linkColor={linkColorCallback}
                                    linkWidth={1.2}
                                    linkDirectionalParticleColor={linkParticleColorCallback}
                                    linkDirectionalParticles={1}
                                    linkDirectionalParticleWidth={1.5}
                                    linkDirectionalParticleSpeed={0.005}
                                    enableNodeDrag={true}
                                    cooldownTicks={100}
                                    warmupTicks={10}
                                    numDimensions={3}
                                />
                            )}
                        </div>

                        <div style={styles.legend}>
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Department Legend</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '100px', overflowY: 'auto', maxWidth: '250px' }}>
                                {departmentsList.map((dept) => (
                                    <div key={dept} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: getDeptColor(dept) }}></div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{dept}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Node Details Panel */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={styles.card}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Node Details</h3>
                            {selectedNode && (
                                <button onClick={() => setSelectedNode(null)} style={{ padding: '0.25rem', borderRadius: '0.25rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {selectedNode ? (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: `${getDeptColor(selectedNode.department)}20`, borderRadius: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{ width: '3rem', height: '3rem', borderRadius: '0.5rem', background: `${getDeptColor(selectedNode.department)}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Target size={24} color={getDeptColor(selectedNode.department)} />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{selectedNode.label}</p>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ID: {selectedNode.id}</p>
                                    </div>
                                </div>

                                <div style={styles.detailItem}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Users size={16} color="var(--text-muted)" />
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Department</span>
                                    </div>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500, padding: '0.25rem 0.5rem', borderRadius: '0.25rem', background: `${getDeptColor(selectedNode.department)}20`, color: getDeptColor(selectedNode.department) }}>Dept {selectedNode.department}</span>
                                </div>
                                <div style={styles.detailItem}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Share2 size={16} color="var(--text-muted)" />
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Degree</span>
                                    </div>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{selectedNode.degree || nodeDegrees.get(selectedNode.id) || 0}</span>
                                </div>
                                <div style={styles.detailItem}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Info size={16} color="var(--text-muted)" />
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>PageRank</span>
                                    </div>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{(selectedNode.pageRank || Math.random() * 0.01).toFixed(6)}</span>
                                </div>

                                <button onClick={handleCopyNodeData} style={{ ...styles.btnSecondary(false), width: '100%', justifyContent: 'center', padding: '0.75rem' }}>Copy Data</button>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                    <Info size={32} color="var(--text-muted)" />
                                </div>
                                <p style={{ color: 'var(--text-secondary)' }}>Click on a node to view details</p>
                            </div>
                        )}

                        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Network Stats</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div style={styles.statBox}>
                                    <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--primary)' }}>{nodes.length}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Nodes</p>
                                </div>
                                <div style={styles.statBox}>
                                    <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--color-success)' }}>{totalDepartments}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Departments</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </Sidebar>
    );
}
