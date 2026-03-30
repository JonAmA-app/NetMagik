
import React, { useState, useEffect } from 'react';
import { Language, SystemStats } from '../types';
import { TRANSLATIONS } from '../constants';
import { useToast } from '../context/ToastContext';
import { RefreshCw, HardDrive, Shield, Laptop, MemoryStick, Cpu } from 'lucide-react';

interface SystemHealthProps {
    language: Language;
    eggsActive?: boolean;
}

export const SystemHealth: React.FC<SystemHealthProps> = ({ language, eggsActive }) => {
    const { success, error: toastError } = useToast();
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [togglingFw, setTogglingFw] = useState(false);
    const [checkingDisk, setCheckingDisk] = useState<string | null>(null);
    const [diskCheckProgress, setDiskCheckProgress] = useState(0);
    const [diskCheckResult, setDiskCheckResult] = useState<{ success: boolean; output: string } | null>(null);
    const [showDiskModal, setShowDiskModal] = useState(false);

    const fetchStats = async () => {
        setLoading(true);
        try {
            if (window.electronAPI) {
                const data = await window.electronAPI.getSystemStats();
                setStats(data);
            } else {
                // NO SIMULATION - Only Real Data
                setStats(null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Only fetch once on mount
    useEffect(() => {
        fetchStats();
    }, []);



    const toggleFirewall = async () => {
        // If managed by 3rd party, show error or info instead of toggle
        if (stats?.os.firewallProvider && !stats.os.firewallProvider.includes('Defender') && !stats.os.firewallProvider.includes('Default')) {
            alert(`${t.managedBy}: ${stats.os.firewallProvider}`);
            return;
        }

        setTogglingFw(true);
        const action = stats?.os.firewallStatus === 'Active' ? 'disable' : 'enable';
        try {
            if (window.electronAPI) {
                await window.electronAPI.toggleFirewall({ action });
                fetchStats();
            }
        } catch (e: any) {
            alert(e.message.includes('ADMIN') ? t.adminRequired : 'Failed to toggle firewall');
        } finally {
            setTogglingFw(false);
        }
    };


    const handleDiskCheck = async (driveLetter: string) => {
        setCheckingDisk(driveLetter);
        setDiskCheckProgress(0);
        setDiskCheckResult(null);
        setShowDiskModal(true);

        // Progress simulation
        const progressInterval = setInterval(() => {
            setDiskCheckProgress(prev => {
                if (prev >= 90) return prev;
                return prev + Math.floor(Math.random() * 5) + 2;
            });
        }, 1000);

        try {
            if (window.electronAPI) {
                const drive = driveLetter.split(':')[0];
                const res = await window.electronAPI.checkDiskErrors(drive);
                clearInterval(progressInterval);
                setDiskCheckProgress(100);
                setDiskCheckResult(res);
                if (res.success) {
                    success(t.diskCheckResult, `${driveLetter}: ${t.diskCheckSuccess}`);
                } else {
                    toastError(t.diskCheckResult, res.output);
                }
            }
        } catch (e: any) {
            clearInterval(progressInterval);
            setDiskCheckResult({ success: false, output: e.message });
        } finally {
            setCheckingDisk(null);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes > 1000000000000) return (bytes / 1024 / 1024 / 1024 / 1024).toFixed(1) + ' TB';
        return (bytes / 1024 / 1024 / 1024).toFixed(1) + ' GB';
    };

    if (!stats && !window.electronAPI) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400">
                <p>{t.systemStatsAppOnly}</p>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex items-center justify-center h-64 text-theme-text-muted gap-2">
                <RefreshCw className="animate-spin" /> {t.loading}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-2 duration-500 max-w-5xl mx-auto h-full overflow-y-auto pb-8 custom-scrollbar">

            {/* Header - Identity - Compact */}
            <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-xl p-4 shadow-sm flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-theme-brand-primary/10 text-theme-brand-primary rounded-lg">
                        <Laptop size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-theme-text-primary leading-tight">{stats.os.computerName}</h2>
                        <div className="flex items-center gap-2 text-xs text-theme-text-muted">
                            <span className="font-semibold">{stats.os.distro}</span>
                            <span className="text-theme-border-primary">|</span>
                            <span>{stats.os.arch}</span>
                            <span className="text-theme-border-primary">|</span>
                            <span>Build {stats.os.release.split('.').pop()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 items-center">
                    {stats.os.hostname !== stats.os.computerName && (
                        <span className="text-[10px] text-amber-600 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                            {t.pendingRename}: {stats.os.hostname}
                        </span>
                    )}
                    <button onClick={fetchStats} disabled={loading} className="p-2 bg-theme-bg-tertiary rounded-lg hover:bg-theme-bg-hover transition-colors text-theme-text-muted">
                        <RefreshCw size={16} className={loading ? 'animate-spin text-theme-brand-primary' : ''} />
                    </button>
                </div>
            </div>

            {/* Vertical Stack of Information Cards */}
            <div className="flex flex-col gap-4">

                {/* CPU Card */}
                <div className="bg-theme-bg-secondary p-5 rounded-xl border border-theme-border-primary shadow-sm">
                    <h3 className="font-bold text-theme-text-primary mb-3 flex items-center gap-2 text-xs uppercase tracking-wide">
                        <Cpu size={16} className="text-theme-brand-primary" />
                        {t.processor}
                    </h3>
                    <div className="flex justify-between items-center">
                        <div className="text-sm font-semibold text-theme-text-secondary">
                            {stats.cpu.model}
                        </div>
                        <div className="text-xs bg-theme-brand-primary/10 text-theme-brand-primary px-2 py-1 rounded font-medium whitespace-nowrap">
                            {stats.cpu.cores} {t.cores}
                        </div>
                    </div>
                </div>

                {/* RAM Card */}
                <div className="bg-theme-bg-secondary p-5 rounded-xl border border-theme-border-primary shadow-sm">
                    <h3 className="font-bold text-theme-text-primary mb-4 flex items-center gap-2 text-xs uppercase tracking-wide">
                        <MemoryStick size={16} className="text-purple-500" />
                        {t.memoryRam}
                    </h3>

                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-2xl font-bold text-theme-text-primary">
                                {formatBytes(stats.mem.total)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-theme-text-muted mt-1">
                                <span className="bg-purple-500/10 text-purple-500 px-1.5 py-0.5 rounded font-mono">{stats.mem.type}</span>
                                <span>{stats.mem.speed > 0 ? `${stats.mem.speed} MHz` : ''}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-theme-text-muted uppercase tracking-wide mb-1">{t.slots}</div>
                            <div className="flex gap-1 justify-end">
                                {Array.from({ length: stats.mem.slotsTotal || 2 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-3 h-6 rounded-sm border ${i < (stats.mem.slotsUsed || 1) ? 'bg-purple-500 border-purple-600' : 'bg-theme-bg-tertiary border-theme-border-primary'}`}
                                        title={i < (stats.mem.slotsUsed) ? t.occupied : t.free}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-theme-bg-secondary p-5 rounded-xl border border-theme-border-primary shadow-sm">
                    <h3 className="font-bold text-theme-text-primary mb-3 flex items-center gap-2 text-xs uppercase tracking-wide">
                        <HardDrive size={16} className="text-theme-brand-primary" />
                        {t.storage}
                    </h3>

                    <div className="space-y-6">
                        {stats.storage.map((disk, idx) => {
                            const used = disk.total - disk.free;
                            const freePercent = (disk.free / disk.total) * 100;
                            const winFilesSize = disk.windowsSize || 0;
                            const userAppsSize = Math.max(0, used - winFilesSize);

                            const userAppsPercent = (userAppsSize / disk.total) * 100;
                            const winFilesPercent = (winFilesSize / disk.total) * 100;

                            return (
                                <div key={idx} className="p-4 rounded-xl bg-theme-bg-tertiary border border-theme-border-secondary space-y-4 shadow-inner">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="font-bold text-lg text-theme-text-primary">{disk.drive}</div>
                                            <div>
                                                <div className="text-xs font-bold text-theme-text-secondary">{disk.label || t.localDisk}</div>
                                                <div className="text-[10px] text-theme-text-muted font-mono">{disk.model || disk.type}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-emerald-500">{formatBytes(disk.free)} {t.freeSpace}</div>
                                            <div className="text-[10px] text-theme-text-muted font-medium mb-1">{formatBytes(disk.total)} {t.totalSpace}</div>
                                            <button
                                                onClick={() => handleDiskCheck(disk.drive)}
                                                disabled={!!checkingDisk}
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${checkingDisk === disk.drive ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-theme-bg-secondary border-theme-border-primary text-theme-text-muted hover:border-theme-brand-primary hover:text-theme-brand-primary'}`}
                                            >
                                                {checkingDisk === disk.drive ? t.diskCheckRunning : t.diskCheck}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Stacked Progress Bar */}
                                    <div className="h-1.5 w-full bg-theme-bg-primary rounded-full overflow-hidden flex border border-theme-border-primary/50">
                                        <div className="h-full bg-theme-brand-primary" style={{ width: `${userAppsPercent}%` }} title={t.appsUserData} />
                                        <div className="h-full bg-amber-500/80" style={{ width: `${winFilesPercent}%` }} title={t.windowsSystem} />
                                        <div className="h-full" style={{ width: `${freePercent}%` }} />
                                    </div>

                                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold uppercase tracking-wider">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-theme-brand-primary" />
                                            <span className="text-theme-text-muted">{t.appsUserData}:</span>
                                            <span className="text-theme-text-primary">{formatBytes(userAppsSize)}</span>
                                        </div>
                                        {winFilesSize > 0 && (
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/80" />
                                                <span className="text-theme-text-muted">{t.windowsSystem}:</span>
                                                <span className="text-theme-text-primary">{formatBytes(winFilesSize)}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-theme-text-muted/30" />
                                            <span className="text-theme-text-muted">{t.freeSpace}:</span>
                                            <span className="text-theme-text-primary">{formatBytes(disk.free)} ({freePercent.toFixed(1)}%)</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Security Card */}
                <div className="bg-theme-bg-secondary p-5 rounded-xl border border-theme-border-primary shadow-sm">
                    <h3 className="font-bold text-theme-text-primary mb-3 flex items-center gap-2 text-xs uppercase tracking-wide">
                        <Shield size={16} className="text-emerald-500" />
                        {t.securityTitle}
                    </h3>
                    <div className="flex justify-between items-center bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                        <div>
                            <span className="block text-xs font-bold text-emerald-500">{t.firewall}: {stats.os.firewallStatus === 'Active' ? t.active : t.inactive}</span>
                            <span className="text-[10px] text-emerald-500/70">{stats.os.firewallProvider}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {(!stats.os.firewallProvider || stats.os.firewallProvider.includes('Defender')) && (
                                <button onClick={toggleFirewall} disabled={togglingFw} className="text-[10px] bg-theme-bg-secondary border border-emerald-500/30 px-2 py-1 rounded text-emerald-500 font-medium hover:bg-emerald-500/10 transition-colors">
                                    {stats.os.firewallStatus === 'Active' ? t.turnOff : t.turnOn}
                                </button>
                            )}
                        </div>
                    </div>
                </div>


            </div>

            {/* Disk Check Floating Panel (non-blocking) */}
            {showDiskModal && (
                <div className={`fixed ${eggsActive ? 'bottom-32' : 'bottom-6'} right-6 z-[100] w-96 animate-in slide-in-from-bottom-4 fade-in duration-400`}>
                    <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
                        {/* Header bar */}
                        <div className={`px-4 py-3 flex items-center justify-between gap-3 border-b border-theme-border-primary/60 ${diskCheckResult ? (diskCheckResult.success ? 'bg-emerald-500/10' : 'bg-rose-500/10') : 'bg-theme-brand-primary/10'}`}>
                            <div className="flex items-center gap-3">
                                <HardDrive size={18} className={`${diskCheckResult ? (diskCheckResult.success ? 'text-emerald-500' : 'text-rose-500') : 'text-theme-brand-primary animate-pulse'}`} />
                                <div>
                                    <p className="text-xs font-bold text-theme-text-primary leading-tight">{t.diskCheckResult} ({checkingDisk || '---'})</p>
                                    <p className="text-[10px] text-theme-text-muted">
                                        {!diskCheckResult ? t.diskCheckRunning : t.diskCheckReady}
                                    </p>
                                </div>
                            </div>
                            {diskCheckResult && (
                                <button
                                    onClick={() => setShowDiskModal(false)}
                                    className="p-1 rounded-lg hover:bg-theme-bg-hover text-theme-text-muted hover:text-theme-text-primary transition-colors flex-shrink-0"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                </button>
                            )}
                        </div>

                        {/* Body */}
                        <div className="p-4 space-y-3">
                            {!diskCheckResult ? (
                                <>
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-theme-text-muted">{t.diskCheckEstimated}</span>
                                        <span className="text-theme-brand-primary">{diskCheckProgress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-theme-bg-tertiary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-theme-brand-primary transition-all duration-700 ease-out rounded-full"
                                            style={{ width: `${diskCheckProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-[9px] text-theme-text-muted italic">{t.diskCheckDetails}</p>
                                </>
                            ) : (
                                <div className="bg-theme-bg-tertiary rounded-xl p-3 border border-theme-border-secondary max-h-36 overflow-y-auto custom-scrollbar">
                                    <div className="text-[10px] font-mono text-theme-text-secondary whitespace-pre-wrap leading-relaxed">
                                        {diskCheckResult.output?.toLowerCase().includes('no errors found') || diskCheckResult.output?.toLowerCase().includes('noterrorsfound') || diskCheckResult.output?.trim() === ''
                                            ? <div className="flex items-center gap-2 text-emerald-500 font-bold"><HardDrive size={14} /> {t.checkDiskNoErrors}</div>
                                            : diskCheckResult.output}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
