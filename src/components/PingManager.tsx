import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NetworkInterface, Profile, PingTarget, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { getSubnetDetails } from '../utils';
import { Play, Square, Plus, List, ArrowRightLeft, Activity, ExternalLink, Terminal, Trash2 } from 'lucide-react';

interface PingManagerProps {
    iface: NetworkInterface;
    currentProfile?: Profile;
    language: Language;
    targets: PingTarget[];
    setTargets: React.Dispatch<React.SetStateAction<PingTarget[]>>;
}

export const PingManager: React.FC<PingManagerProps> = ({ iface, language, targets, setTargets }) => {
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
    const [mode, setMode] = useState<'list' | 'range'>('list');
    const [isRunning, setIsRunning] = useState(false);
    const [manualIp, setManualIp] = useState('');

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

                // Parse output
                let status: PingTarget['status'] = 'unknown';
                let lat = 0;
                let msg = '';

                if (result.success) {
                    const stdout = result.stdout;
                    msg = stdout.trim();

                    if (stdout.includes('unreachable')) status = 'unreachable';
                    else if (stdout.includes('timed out')) status = 'timeout';
                    else {
                        // Success path
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
                        if (newHistory.length > 20) newHistory.shift();

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

        // Auto-start automatically if not already running
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
    };

    const removeTarget = (ip: string) => {
        setTargets(prev => prev.filter(t => t.ip !== ip));
        if (targets.length <= 1) stopPing();
    };

    const openCmdPing = async (ip: string) => {
        if (window.electronAPI) {
            await window.electronAPI.openExternalCmd({ targetIp: ip });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-500 shadow-emerald-500/50';
            case 'timeout': return 'bg-amber-500 shadow-amber-500/50';
            case 'unreachable':
            case 'net_unreachable': return 'bg-rose-500 shadow-rose-500/50';
            default: return 'bg-theme-bg-tertiary';
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">

            {/* Configuration Panel */}
            <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-xl p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-theme-bg-tertiary text-theme-brand-primary rounded-lg">
                            <Activity size={20} />
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

            {/* Results Table */}
            <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[300px]">
                <div className="p-4 border-b border-theme-border-secondary flex items-center justify-between bg-theme-bg-tertiary">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-theme-text-primary">{t.pingResults}</h4>
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
                        <button onClick={clearAll} className="px-3 py-1.5 text-theme-text-muted hover:bg-theme-bg-hover rounded-lg text-xs transition-colors">
                            {t.clearAll}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-theme-text-muted uppercase bg-theme-bg-tertiary border-b border-theme-border-secondary">
                            <tr>
                                <th className="px-4 py-3 font-medium w-36">{t.ipAddress}</th>
                                <th className="px-4 py-3 font-medium w-24 text-center">{t.status}</th>
                                <th className="px-4 py-3 font-medium text-center">{t.liveHistory}</th>
                                <th className="px-4 py-3 font-medium text-right w-24">{t.latency}</th>
                                <th className="px-4 py-3 font-medium text-right w-20">{t.packetLoss}</th>
                                <th className="px-4 py-3 font-medium text-right w-20">{t.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y border-theme-border-primary">
                            {targets.map((target, idx) => (
                                <tr key={idx} className="hover:bg-theme-bg-hover transition-colors">
                                    <td className="px-4 py-3 font-mono font-medium text-theme-text-primary">{target.ip}</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className={`inline-flex items-center justify-center w-3 h-3 rounded-full shadow-sm ${getStatusColor(target.status)} ${target.status === 'active' ? 'animate-pulse' : ''}`} title={target.status} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-end gap-0.5 h-6 opacity-80 justify-center">
                                            {target.history.length === 0 ? (
                                                <span className="text-xs text-theme-text-muted italic">{t.waiting}</span>
                                            ) : (
                                                target.history.map((val, i) => {
                                                    if (val === -1) return <div key={i} className="w-1.5 h-6 bg-rose-200 dark:bg-rose-900 rounded-sm" title={t.timeout} />;
                                                    const color = val < 20 ? 'bg-emerald-400' : val < 100 ? 'bg-yellow-400' : 'bg-orange-400';
                                                    return <div key={i} className={`w-1.5 h-6 rounded-sm ${color}`} title={`${val}ms`} />;
                                                })
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="font-mono font-bold text-theme-text-primary text-base">
                                                {target.stats.lastLatency} ms
                                            </span>
                                            <span className="text-[10px] text-theme-text-muted uppercase">Avg: {target.stats.avg}ms</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={`${target.stats.loss > 0 ? 'text-rose-500 font-bold' : 'text-theme-text-muted'}`}>
                                            {target.stats.loss}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
