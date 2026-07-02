import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NetworkInterface, Profile, PingTarget, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { getSubnetDetails } from '../utils';
import { Play, Square, Plus, List, ArrowRightLeft, Activity, ExternalLink, Terminal, Trash2, Maximize2, Minimize2, Bell, BellOff, ChevronDown, ChevronUp, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface PingManagerProps {
    iface: NetworkInterface;
    currentProfile?: Profile;
    language: Language;
    targets: PingTarget[];
    setTargets: React.Dispatch<React.SetStateAction<PingTarget[]>>;
}

// ─── Real-time Latency Chart ──────────────────────────────────────────────────
const LatencyChart: React.FC<{ target: PingTarget }> = ({ target }) => {
    const history = target.history;
    const W = 400;
    const H = 120;
    const PAD = { top: 10, right: 16, bottom: 24, left: 40 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    const validVals = history.filter(v => v > 0);
    const maxVal = validVals.length > 0 ? Math.max(50, Math.ceil(Math.max(...validVals) * 1.25)) : 100;
    const len = Math.max(history.length, 20);
    const step = chartW / Math.max(len - 1, 1);

    // Build polyline path
    const buildPath = () => {
        const pts: string[] = [];
        history.forEach((val, i) => {
            const x = PAD.left + i * step;
            const y = val <= 0
                ? PAD.top + chartH           // drop to bottom for timeouts
                : PAD.top + chartH - Math.min((val / maxVal) * chartH, chartH);
            pts.push(`${x},${y}`);
        });
        return pts.join(' ');
    };

    // Build area fill path
    const buildAreaPath = () => {
        if (history.length < 2) return '';
        const pts: string[] = [];
        history.forEach((val, i) => {
            const x = PAD.left + i * step;
            const y = val <= 0
                ? PAD.top + chartH
                : PAD.top + chartH - Math.min((val / maxVal) * chartH, chartH);
            pts.push(`${x},${y}`);
        });
        const firstX = PAD.left;
        const lastX = PAD.left + (history.length - 1) * step;
        const bottomY = PAD.top + chartH;
        return `${firstX},${bottomY} ${pts.join(' ')} ${lastX},${bottomY}`;
    };

    // Y-axis labels
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
        val: Math.round(maxVal * f),
        y: PAD.top + chartH - f * chartH,
    }));

    const lastVal = history[history.length - 1];
    const lastX = PAD.left + (history.length - 1) * step;
    const lastY = lastVal <= 0
        ? PAD.top + chartH
        : PAD.top + chartH - Math.min((lastVal / maxVal) * chartH, chartH);

    const getLatencyColor = (ms: number) => {
        if (ms <= 0) return '#f43f5e';
        if (ms < 30) return '#10b981';
        if (ms < 80) return '#f59e0b';
        return '#f43f5e';
    };
    const lineColor = lastVal > 0 ? getLatencyColor(lastVal) : '#f43f5e';

    return (
        <div className="w-full overflow-x-auto">
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ minWidth: 260 }}>
                {/* Background grid */}
                {yTicks.map((tick, i) => (
                    <g key={i}>
                        <line
                            x1={PAD.left} y1={tick.y}
                            x2={W - PAD.right} y2={tick.y}
                            stroke="currentColor" strokeWidth="0.5"
                            className="text-theme-border-secondary"
                            strokeDasharray={i === 0 ? 'none' : '3,4'}
                        />
                        <text
                            x={PAD.left - 4} y={tick.y + 4}
                            textAnchor="end" fontSize="9"
                            className="fill-theme-text-muted" fill="currentColor"
                            style={{ fontFamily: 'monospace' }}
                        >
                            {tick.val}
                        </text>
                    </g>
                ))}

                {/* Latency zones (background bands) */}
                <rect x={PAD.left} y={PAD.top} width={chartW}
                    height={chartH * 0.25} fill="#10b981" opacity={0.04} />
                <rect x={PAD.left} y={PAD.top + chartH * 0.25} width={chartW}
                    height={chartH * 0.25} fill="#f59e0b" opacity={0.04} />
                <rect x={PAD.left} y={PAD.top + chartH * 0.5} width={chartW}
                    height={chartH * 0.5} fill="#f43f5e" opacity={0.04} />

                {/* Area fill */}
                {history.length >= 2 && (
                    <polygon
                        points={buildAreaPath()}
                        fill={lineColor}
                        opacity={0.08}
                    />
                )}

                {/* Polyline */}
                {history.length >= 2 && (
                    <polyline
                        points={buildPath()}
                        fill="none"
                        stroke={lineColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}

                {/* Timeout markers */}
                {history.map((val, i) => {
                    if (val > 0) return null;
                    const x = PAD.left + i * step;
                    return (
                        <line key={`to-${i}`}
                            x1={x} y1={PAD.top}
                            x2={x} y2={PAD.top + chartH}
                            stroke="#f43f5e" strokeWidth="1" opacity={0.4}
                            strokeDasharray="2,3"
                        />
                    );
                })}

                {/* Data points */}
                {history.map((val, i) => {
                    if (val <= 0) return null;
                    const x = PAD.left + i * step;
                    const y = PAD.top + chartH - Math.min((val / maxVal) * chartH, chartH);
                    const isLast = i === history.length - 1;
                    return (
                        <circle key={i} cx={x} cy={y}
                            r={isLast ? 4 : 2}
                            fill={getLatencyColor(val)}
                            opacity={isLast ? 1 : 0.5}
                        />
                    );
                })}

                {/* Animated pulse on last point */}
                {lastVal > 0 && (
                    <>
                        <circle cx={lastX} cy={lastY} r="8" fill={lineColor} opacity="0.15">
                            <animate attributeName="r" from="4" to="12" dur="1.5s" repeatCount="indefinite" />
                            <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                        <circle cx={lastX} cy={lastY} r="4" fill={lineColor} />
                    </>
                )}

                {/* X-axis label (sample count) */}
                <text x={PAD.left} y={H - 4} fontSize="8" fill="currentColor"
                    className="fill-theme-text-muted">0</text>
                <text x={W - PAD.right} y={H - 4} fontSize="8" fill="currentColor"
                    className="fill-theme-text-muted" textAnchor="end">{history.length}s</text>
                <text x={W / 2} y={H - 4} fontSize="8" fill="currentColor"
                    className="fill-theme-text-muted" textAnchor="middle">ms</text>
            </svg>
        </div>
    );
};

// ─── Expanded Detail Panel ────────────────────────────────────────────────────
const TargetDetailPanel: React.FC<{ target: PingTarget; t: any }> = ({ target, t }) => {
    const { stats } = target;
    const loss = stats.loss;
    const quality = loss === 0 ? 'good' : loss < 20 ? 'warning' : 'bad';

    const qualityColor = {
        good: 'text-emerald-500',
        warning: 'text-amber-500',
        bad: 'text-rose-500',
    }[quality];

    const qualityBg = {
        good: 'bg-emerald-500/10 border-emerald-500/20',
        warning: 'bg-amber-500/10 border-amber-500/20',
        bad: 'bg-rose-500/10 border-rose-500/20',
    }[quality];

    return (
        <div className="px-4 pb-4 pt-2 border-t border-theme-border-secondary bg-theme-bg-primary/50 animate-in slide-in-from-top-1 duration-200">
            {/* Chart */}
            <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-theme-text-muted">
                        {t.liveHistory || 'Live Latency Chart'} — {target.ip}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${qualityBg} ${qualityColor}`}>
                        {quality === 'good' ? (t.excellent || 'Excellent') : quality === 'warning' ? (t.degraded || 'Degraded') : (t.poor || 'Poor')}
                    </span>
                </div>
                {target.history.length === 0 ? (
                    <div className="h-[120px] flex items-center justify-center text-theme-text-muted text-xs italic">
                        {t.waiting || 'Waiting for data...'}
                    </div>
                ) : (
                    <LatencyChart target={target} />
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2">
                {[
                    { label: t.minLatency || 'Min', value: `${stats.min || 0}ms`, color: 'text-emerald-500' },
                    { label: t.avgLatency || 'Avg', value: `${stats.avg || 0}ms`, color: 'text-theme-brand-primary' },
                    { label: t.maxLatency || 'Max', value: `${stats.max || 0}ms`, color: 'text-amber-500' },
                    { label: t.packetLoss || 'Loss', value: `${stats.loss || 0}%`, color: loss > 0 ? 'text-rose-500' : 'text-theme-text-muted' },
                ].map((stat, i) => (
                    <div key={i} className="bg-theme-bg-secondary rounded-lg p-2 border border-theme-border-secondary text-center">
                        <div className={`text-sm font-bold font-mono ${stat.color}`}>{stat.value}</div>
                        <div className="text-[9px] uppercase text-theme-text-muted font-medium mt-0.5">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Sent/Received */}
            <div className="mt-2 flex gap-2 text-[10px] text-theme-text-muted">
                <span>{t.sent || 'Sent'}: <span className="font-mono text-theme-text-secondary">{stats.sent}</span></span>
                <span>·</span>
                <span>{t.received || 'Received'}: <span className="font-mono text-emerald-500">{stats.received}</span></span>
                <span>·</span>
                <span>{t.lost || 'Lost'}: <span className="font-mono text-rose-500">{stats.sent - stats.received}</span></span>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const PingManager: React.FC<PingManagerProps> = ({ iface, language, targets, setTargets }) => {
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
    const { success } = useToast();
    const [mode, setMode] = useState<'list' | 'range'>('list');
    const [isRunning, setIsRunning] = useState(false);
    const [manualIp, setManualIp] = useState('');
    const [isZenMode, setIsZenMode] = useState(false);
    const [soundAlerts, setSoundAlerts] = useState(false);
    const [expandedIp, setExpandedIp] = useState<string | null>(null);

    // Range State
    const [rangeStart, setRangeStart] = useState('');
    const [rangeEnd, setRangeEnd] = useState('');

    const currentIp = iface.currentIp;
    const currentMask = iface.netmask || '255.255.255.0';

    const subnetInfo = getSubnetDetails(currentIp, currentMask);
    const intervalRef = useRef<number | null>(null);

    const pingSingleTarget = async (ip: string) => {
        try {
            // --- Easter Eggs (Intercept before real ping) --- //
            if (ip === '127.0.0.1' || ip.toLowerCase() === 'localhost') {
                window.dispatchEvent(new CustomEvent('easter-egg', { detail: { id: 'localhost', name: t.eggLocalhostName } }));
                return { status: 'active', latency: 1, msg: t.eggLocalhostMsg };
            }
            if (ip === '4.1.8.0') {
                window.dispatchEvent(new CustomEvent('easter-egg', { detail: { id: 'teapot', name: t.eggTeapotName } }));
                return { status: 'timeout', latency: 0, msg: t.eggTeapotMsg };
            }
            if (ip === '1.3.3.7') {
                window.dispatchEvent(new CustomEvent('easter-egg', { detail: { id: 'egg7', name: t.eggPingName } }));
                return { status: 'active', latency: 1337, msg: t.eggEliteMsg };
            }
            // ------------------------------------------------ //

            if (window.electronAPI) {
                const result = await window.electronAPI.pingTarget({ ip });

                let status: PingTarget['status'] = 'unknown';
                let lat = 0;
                let msg = '';

                if (result.success) {
                    const stdout = result.stdout;
                    msg = stdout.trim();

                    if (stdout.includes('unreachable')) status = 'unreachable';
                    else if (stdout.includes('timed out')) status = 'timeout';
                    else {
                        status = 'active';
                        const timeMatch = stdout.match(/time[=<](\d+)/i);
                        if (timeMatch) {
                            lat = Math.max(1, parseInt(timeMatch[1]));
                        } else if (stdout.includes('<1ms')) {
                            lat = 1;
                        } else {
                            lat = 1;
                        }
                    }
                } else {
                    status = 'timeout';
                    msg = t.requestTimedOut;
                }

                return { status, latency: lat, msg };
            } else {
                // Simulate success path for dev/web mode
                return { status: 'active', latency: Math.floor(Math.random() * 10) + 1, msg: t.simulatedReply };
            }
        } catch (e) {
            return { status: 'unknown', latency: 0, msg: t.executionError };
        }
    };

    const runBatch = useCallback(() => {
        setTargets(currentTargets => {
            currentTargets.forEach(t => {
                pingSingleTarget(t.ip).then(res => {
                    setTargets(prev => prev.map(pt => {
                        if (pt.ip !== t.ip) return pt;

                        const newSent = pt.stats.sent + 1;
                        const newReceived = res.status === 'active' ? pt.stats.received + 1 : pt.stats.received;

                        let newMin = pt.stats.min;
                        if (res.status === 'active') {
                            if (pt.stats.min === 0) newMin = res.latency;
                            else newMin = Math.min(pt.stats.min, res.latency);
                        }

                        const newMax = Math.max(pt.stats.max, res.latency);
                        const newAvg = Math.floor(((pt.stats.avg * (newReceived - (res.status === 'active' ? 1 : 0))) + (res.status === 'active' ? res.latency : 0)) / (newReceived || 1));

                        const historyVal = res.status === 'active' ? res.latency : -1;
                        const newHistory = [...pt.history, historyVal];
                        if (newHistory.length > 50) newHistory.shift();

                        // Sound alert if coming back online
                        if (soundAlerts && (pt.status === 'timeout' || pt.status === 'unreachable') && res.status === 'active') {
                            try {
                                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                                const osc = ctx.createOscillator();
                                const gain = ctx.createGain();
                                osc.type = 'sine';
                                osc.frequency.setValueAtTime(880, ctx.currentTime);
                                osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
                                gain.gain.setValueAtTime(0, ctx.currentTime);
                                gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
                                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                                osc.connect(gain);
                                gain.connect(ctx.destination);
                                osc.start();
                                osc.stop(ctx.currentTime + 0.3);
                                success(`${pt.ip} is back online!`, `${res.latency}ms latency`);
                            } catch (e) {}
                        }

                        return {
                            ...pt,
                            status: res.status as any,
                            lastResponse: res.msg,
                            history: newHistory,
                            stats: {
                                sent: newSent,
                                received: newReceived,
                                min: newMin,
                                max: newMax,
                                avg: newAvg,
                                lastLatency: res.latency,
                                loss: Math.floor(((newSent - newReceived) / newSent) * 100)
                            }
                        };
                    }));
                });
            });

            return currentTargets;
        });
    }, [setTargets]);

    const startPing = useCallback(() => {
        setIsRunning(true);

        if (intervalRef.current) clearInterval(intervalRef.current);

        // Immediate run
        runBatch();

        intervalRef.current = window.setInterval(() => {
            runBatch();
        }, 2000);
    }, [runBatch]);

    const stopPing = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsRunning(false);
    };

    useEffect(() => {
        return () => stopPing();
    }, []);

    const addManualIp = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualIp) return;

        const targetExists = targets.some(t => t.ip === manualIp);

        if (!targetExists) {
            const newTarget: PingTarget = {
                ip: manualIp,
                status: 'unknown' as any,
                lastResponse: t.ready,
                history: [],
                stats: { sent: 0, received: 0, min: 0, max: 0, avg: 0, lastLatency: 0, loss: 0 }
            };
            setTargets(prev => [...prev, newTarget]);
        }

        setManualIp('');

        if (!isRunning) {
            startPing();
        }
    };

    const applyRange = () => {
        const start = rangeStart || `${currentIp.split('.').slice(0, 3).join('.')}.1`;
        const end = rangeEnd || `${currentIp.split('.').slice(0, 3).join('.')}.5`;

        const prefix = start.substring(0, start.lastIndexOf('.'));
        const startNum = parseInt(start.split('.').pop() || '1');
        const endNum = parseInt(end.split('.').pop() || '5');

        const newTargets: PingTarget[] = [];
        for (let i = startNum; i <= endNum && i < startNum + 20; i++) {
            newTargets.push({
                ip: `${prefix}.${i}`,
                status: 'unknown' as any,
                lastResponse: t.ready || 'Ready...',
                history: [],
                stats: { sent: 0, received: 0, min: 0, max: 0, avg: 0, lastLatency: 0, loss: 0 }
            });
        }
        setTargets(newTargets);
    };

    const clearAll = () => {
        stopPing();
        setTargets([]);
        setExpandedIp(null);
    };

    const removeTarget = (ip: string) => {
        setTargets(prev => prev.filter(t => t.ip !== ip));
        if (expandedIp === ip) setExpandedIp(null);
        if (targets.length <= 1) stopPing();
    };

    const openCmdPing = async (ip: string) => {
        if (window.electronAPI) {
            await window.electronAPI.openExternalCmd({ targetIp: ip });
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <Wifi size={13} className="text-emerald-500" />;
            case 'timeout':
                return <AlertTriangle size={13} className="text-amber-500" />;
            case 'unreachable':
            case 'net_unreachable':
                return <WifiOff size={13} className="text-rose-500" />;
            default:
                return <div className="w-3 h-3 rounded-full bg-theme-bg-tertiary border border-theme-border-primary" />;
        }
    };

    const getStatusDot = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-500 shadow-emerald-500/50';
            case 'timeout': return 'bg-amber-500 shadow-amber-500/50';
            case 'unreachable':
            case 'net_unreachable': return 'bg-rose-500 shadow-rose-500/50';
            default: return 'bg-theme-bg-tertiary';
        }
    };

    const getLatencyBadgeColor = (ms: number, status: string) => {
        if (status !== 'active') return 'text-theme-text-muted';
        if (ms < 30) return 'text-emerald-500';
        if (ms < 80) return 'text-amber-500';
        return 'text-rose-500';
    };

    // Mini sparkline for the table row
    const MiniSparkline: React.FC<{ history: number[] }> = ({ history }) => {
        if (history.length === 0) {
            return <span className="text-xs text-theme-text-muted italic">{t.waiting}</span>;
        }
        const validData = history.filter(v => v > 0);
        const maxVal = validData.length > 0 ? Math.max(20, ...validData) : 100;
        const w = 80;
        const h = 24;
        const len = Math.max(20, history.length);
        const step = w / (len - 1);

        const points = history.map((val, i) => {
            const x = i * step;
            if (val === -1) return `${x},${h}`;
            const y = Math.max(2, h - (val / maxVal) * (h * 0.85));
            return `${x},${y}`;
        }).join(' ');

        const lastVal = history[history.length - 1];
        const lastX = (history.length - 1) * step;
        const lastY = lastVal <= 0 ? h : Math.max(2, h - (lastVal / maxVal) * (h * 0.85));
        const dotColor = lastVal <= 0 ? '#f43f5e' : lastVal < 30 ? '#10b981' : lastVal < 80 ? '#f59e0b' : '#f43f5e';

        return (
            <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
                <polyline points={points} fill="none" stroke={dotColor} strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
                {lastVal > 0 && (
                    <circle cx={lastX} cy={lastY} r="2.5" fill={dotColor} />
                )}
            </svg>
        );
    };

    return (
        <div className={`space-y-6 animate-in slide-in-from-bottom-2 duration-500 ${isZenMode ? 'fixed inset-0 z-50 bg-theme-bg-primary p-6 m-0 h-screen w-screen overflow-hidden flex flex-col' : ''}`}>

            {/* Configuration Panel */}
            {!isZenMode && (
            <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-xl p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg transition-colors ${isRunning ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-theme-bg-tertiary text-theme-brand-primary'}`}>
                            <Activity size={20} className={isRunning ? 'animate-ekg' : ''} />
                        </div>
                        <div>
                            <h3 className="font-bold text-theme-text-primary">{t.pingTool}</h3>
                            <div className="flex items-center gap-2 text-xs text-theme-text-muted">
                                <span className="font-mono bg-theme-bg-tertiary px-1.5 py-0.5 rounded border border-theme-border-primary">
                                    {currentIp}/{currentMask}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex bg-theme-bg-tertiary p-1 rounded-lg self-start">
                        <button
                            onClick={() => { stopPing(); setMode('list'); }}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all ${mode === 'list' ? 'bg-theme-bg-primary text-theme-text-primary shadow-sm' : 'text-theme-text-muted hover:text-theme-text-primary'}`}
                        >
                            <List size={14} />
                            {t.manualList}
                        </button>
                        <button
                            onClick={() => { stopPing(); setMode('range'); }}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all ${mode === 'range' ? 'bg-theme-bg-primary text-theme-text-primary shadow-sm' : 'text-theme-text-muted hover:text-theme-text-primary'}`}
                        >
                            <ArrowRightLeft size={14} />
                            {t.ipRange}
                        </button>
                    </div>
                </div>

                {/* Input Area */}
                <div className="bg-theme-bg-tertiary rounded-lg p-4 border border-theme-border-secondary">
                    {mode === 'list' ? (
                        <form onSubmit={addManualIp} className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={manualIp}
                                    onChange={(e) => setManualIp(e.target.value)}
                                    placeholder={t.ipPlaceholder}
                                    className="w-full h-10 px-3 bg-theme-bg-primary border border-theme-border-primary rounded-lg text-sm font-mono focus:outline-none focus:border-theme-brand-primary text-theme-text-primary placeholder-theme-text-muted"
                                />
                            </div>
                            <button type="submit" disabled={!manualIp} className="h-10 px-4 bg-theme-brand-primary hover:bg-theme-brand-hover text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <Plus size={16} />
                                {t.addIp}
                            </button>
                        </form>
                    ) : (
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 w-full space-y-1">
                                <label className="text-xs font-medium text-theme-text-muted">{t.rangeStart}</label>
                                <input
                                    type="text"
                                    value={rangeStart}
                                    onChange={(e) => setRangeStart(e.target.value)}
                                    placeholder={subnetInfo.firstUsable}
                                    className="w-full h-10 px-3 bg-theme-bg-primary border border-theme-border-primary rounded-lg text-sm font-mono focus:outline-none focus:border-theme-brand-primary text-theme-text-primary"
                                />
                            </div>
                            <div className="flex-1 w-full space-y-1">
                                <label className="text-xs font-medium text-theme-text-muted">{t.rangeEnd}</label>
                                <input
                                    type="text"
                                    value={rangeEnd}
                                    onChange={(e) => setRangeEnd(e.target.value)}
                                    placeholder={subnetInfo.lastUsable}
                                    className="w-full h-10 px-3 bg-theme-bg-primary border border-theme-border-primary rounded-lg text-sm font-mono focus:outline-none focus:border-theme-brand-primary text-theme-text-primary"
                                />
                            </div>
                            <button onClick={applyRange} className="h-10 px-4 bg-theme-brand-primary hover:bg-theme-brand-hover text-white rounded-lg text-sm font-medium transition-colors">
                                {t.setRange}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            )}

            {/* Results Table */}
            <div className={`bg-theme-bg-secondary border border-theme-border-primary rounded-xl overflow-hidden shadow-sm flex flex-col ${isZenMode ? 'flex-1 h-full' : 'min-h-[300px]'}`}>
                <div className="p-4 border-b border-theme-border-secondary flex items-center justify-between bg-theme-bg-tertiary">
                    <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-theme-text-primary flex items-center gap-2">
                            {t.pingResults}
                            {isRunning && (
                                <Activity size={16} className="text-emerald-500 animate-ekg ml-1" />
                            )}
                        </h4>
                        <span className="text-xs bg-theme-bg-primary px-2 py-0.5 rounded-full text-theme-text-secondary">{targets.length}</span>
                    </div>
                    <div className="flex gap-2">
                        {isRunning ? (
                            <button onClick={stopPing} className="px-3 py-1.5 bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-transparent hover:border-rose-200">
                                <Square size={12} fill="currentColor" />
                                {t.stopPing}
                            </button>
                        ) : (
                            <button onClick={startPing} disabled={targets.length === 0} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-transparent hover:border-emerald-500/30 disabled:opacity-50">
                                <Play size={12} fill="currentColor" />
                                {t.startPing}
                            </button>
                        )}
                        <div className="w-px h-4 bg-theme-border-secondary mx-1" />
                        <button onClick={() => setSoundAlerts(!soundAlerts)} className={`p-1.5 rounded-lg transition-colors ${soundAlerts ? 'text-emerald-500 bg-emerald-500/10' : 'text-theme-text-muted hover:bg-theme-bg-hover'}`} title="Sound Alerts on Recovery">
                            {soundAlerts ? <Bell size={14} /> : <BellOff size={14} />}
                        </button>
                        <button onClick={() => setIsZenMode(!isZenMode)} className={`p-1.5 rounded-lg transition-colors ${isZenMode ? 'text-theme-brand-primary bg-theme-brand-primary/10' : 'text-theme-text-muted hover:bg-theme-bg-hover'}`} title="Zen Mode">
                            {isZenMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                        </button>
                        <button onClick={clearAll} className="px-3 py-1.5 text-theme-text-muted hover:bg-theme-bg-hover rounded-lg text-xs transition-colors ml-1">
                            {t.clearAll}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto overflow-y-auto">
                    {targets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-theme-text-muted gap-3">
                            <Activity size={32} className="opacity-20" />
                            <p className="text-sm">{t.ipPlaceholder || 'Add an IP to start monitoring'}</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-theme-text-muted uppercase bg-theme-bg-tertiary border-b border-theme-border-secondary sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 font-medium w-8"></th>
                                    <th className="px-4 py-3 font-medium w-36">{t.ipAddress}</th>
                                    <th className="px-4 py-3 font-medium w-20 text-center">{t.status}</th>
                                    <th className="px-4 py-3 font-medium text-center">Ping</th>
                                    <th className="px-4 py-3 font-medium text-right w-24">{t.latency}</th>
                                    <th className="px-4 py-3 font-medium text-right w-20">{t.packetLoss}</th>
                                    <th className="px-4 py-3 font-medium text-right w-24">{t.actions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y border-theme-border-primary">
                                {targets.map((target, idx) => (
                                    <React.Fragment key={idx}>
                                        <tr
                                            className={`hover:bg-theme-bg-hover transition-colors cursor-pointer ${expandedIp === target.ip ? 'bg-theme-bg-hover' : ''}`}
                                            onClick={() => setExpandedIp(expandedIp === target.ip ? null : target.ip)}
                                        >
                                            {/* Expand toggle */}
                                            <td className="px-2 py-3 text-center">
                                                <span className="text-theme-text-muted opacity-50">
                                                    {expandedIp === target.ip
                                                        ? <ChevronUp size={14} />
                                                        : <ChevronDown size={14} />
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono font-medium text-theme-text-primary">{target.ip}</td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${getStatusDot(target.status)} ${target.status === 'active' ? 'animate-pulse' : ''}`} />
                                                    {getStatusIcon(target.status)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center">
                                                    <MiniSparkline history={target.history} />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className={`font-mono font-bold text-base ${getLatencyBadgeColor(target.stats.lastLatency, target.status)}`}>
                                                        {target.status === 'active' ? `${target.stats.lastLatency} ms` : '—'}
                                                    </span>
                                                    <span className="text-[10px] text-theme-text-muted uppercase">Ø {target.stats.avg}ms</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={`${target.stats.loss > 0 ? 'text-rose-500 font-bold' : 'text-theme-text-muted'}`}>
                                                    {target.stats.loss}%
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                                                <div className="flex gap-1 justify-end">
                                                    <button
                                                        onClick={() => openCmdPing(target.ip)}
                                                        className="p-1.5 text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-hover rounded transition-colors"
                                                        title={t.openInCmd}
                                                    >
                                                        <Terminal size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => window.open(`http://${target.ip}`, '_blank')}
                                                        className="p-1.5 text-theme-text-muted hover:text-theme-brand-primary hover:bg-theme-bg-hover rounded transition-colors"
                                                        title={t.openWeb}
                                                    >
                                                        <ExternalLink size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => removeTarget(target.ip)}
                                                        className="p-1.5 text-theme-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors"
                                                        title={t.remove}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {/* Expanded real-time latency panel */}
                                        {expandedIp === target.ip && (
                                            <tr>
                                                <td colSpan={7} className="p-0">
                                                    <TargetDetailPanel target={target} t={t} />
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};
