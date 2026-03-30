import React, { useState, useEffect } from 'react';
import { NetworkInterface, Profile, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { TrafficMonitor } from './TrafficMonitor';
import { Activity, Globe, Clock, ShieldCheck, Zap, Cpu, Database } from 'lucide-react';

interface DashboardProps {
    interfaces: NetworkInterface[];
    selectedInterface?: NetworkInterface;
    currentProfile?: Profile;
    language: Language;
}

export const Dashboard: React.FC<DashboardProps> = ({ selectedInterface, currentProfile, language }) => {
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
    const [systemStats, setSystemStats] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            if (window.electronAPI) {
                const stats = await window.electronAPI.getSystemStats();
                setSystemStats(stats);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);

    const isConnected = selectedInterface?.status === 'Connected';


    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-700">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-theme-text-primary tracking-tight">{t.systemOverview}</h2>
                    <p className="text-theme-text-muted mt-1">{t.systemOverviewDesc}</p>
                </div>
                <div className="flex items-center gap-2 bg-theme-bg-tertiary px-4 py-2 rounded-xl border border-theme-border-primary">
                    <Clock size={16} className="text-theme-text-muted" />
                    <span className="text-sm font-medium text-theme-text-secondary">{new Date().toLocaleTimeString()}</span>
                </div>
            </div>

            {/* Primary Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-5 rounded-2xl bg-theme-bg-secondary shadow-lg border border-theme-border-primary">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 rounded-xl bg-theme-brand-primary text-white shadow-lg shadow-theme-brand-primary/30">
                            <Activity size={20} />
                        </div>
                        {isConnected && <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div><span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{t.live || 'Live'}</span></div>}
                    </div>
                    <p className="text-sm text-theme-text-muted font-medium">{t.interfaceStatus}</p>
                    <h3 className="text-2xl font-bold text-theme-text-primary truncate">
                        {selectedInterface?.status || t.noSelection}
                    </h3>
                </div>

                <div className="glass-card p-5 rounded-2xl bg-theme-bg-secondary shadow-lg border border-theme-border-primary">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                            <Globe size={20} />
                        </div>
                    </div>
                    <p className="text-sm text-theme-text-muted font-medium">{t.ipAddress}</p>
                    <h3 className="text-2xl font-bold font-mono text-theme-text-primary">
                        {selectedInterface?.currentIp || '0.0.0.0'}
                    </h3>
                </div>

                <div className="glass-card p-5 rounded-2xl bg-theme-bg-secondary shadow-lg border border-theme-border-primary">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/30">
                            <Cpu size={20} />
                        </div>
                    </div>
                    <p className="text-sm text-theme-text-muted font-medium">{t.cpuLoad}</p>
                    <h3 className="text-2xl font-bold text-theme-text-primary">
                        {systemStats ? '12%' : '...'}
                    </h3>
                </div>

                <div className="glass-card p-5 rounded-2xl bg-theme-bg-secondary shadow-lg border border-theme-border-primary">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 rounded-xl bg-rose-500 text-white shadow-lg shadow-rose-500/30">
                            <Database size={20} />
                        </div>
                    </div>
                    <p className="text-sm text-theme-text-muted font-medium">{t.memoryUsage}</p>
                    <h3 className="text-2xl font-bold text-theme-text-primary">
                        {systemStats ? `${Math.round((1 - systemStats.mem.free / systemStats.mem.total) * 100)}%` : '...'}
                    </h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Traffic Graph */}
                <div className="lg:col-span-2 space-y-6">
                    <TrafficMonitor isActive={isConnected} t={t} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-theme-bg-tertiary text-theme-brand-primary">
                                    <ShieldCheck size={20} />
                                </div>
                                <h4 className="font-semibold text-theme-text-primary">{t.securityScan}</h4>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-theme-text-muted">{t.firewall}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-emerald-500 font-semibold px-2 py-0.5 bg-emerald-500/10 rounded">{t.active}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-theme-text-muted">{t.protection}</span>
                                    <span className="text-theme-text-primary">{t.systemDefault}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-theme-bg-tertiary text-orange-500">
                                    <Zap size={20} />
                                </div>
                                <h4 className="font-semibold text-theme-text-primary">{t.quickTasks}</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button className="text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg bg-theme-bg-tertiary text-theme-text-secondary hover:bg-theme-bg-hover transition-colors">{t.flushDns}</button>
                                <button className="text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg bg-theme-bg-tertiary text-theme-text-secondary hover:bg-theme-bg-hover transition-colors">{t.renewIp}</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interface Details */}
                <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-2xl p-6 shadow-sm flex flex-col">
                    <h3 className="font-bold text-theme-text-primary mb-6 flex items-center justify-between">
                        <span>{t.networkDetails}</span>
                        <span className="text-[10px] px-2 py-1 bg-theme-brand-primary/10 text-theme-brand-primary rounded-full font-bold uppercase">PRO</span>
                    </h3>

                    <div className="space-y-6 flex-1">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest">{t.activeAdapter}</label>
                            <p className="text-sm font-medium text-theme-text-primary truncate">{selectedInterface?.name || '---'}</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest">{t.macAddress}</label>
                            <p className="text-sm font-mono text-theme-text-primary tracking-tighter">{selectedInterface?.macAddress || '---'}</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest">{t.gateway}</label>
                            <p className="text-sm font-mono text-theme-text-primary">{currentProfile?.config?.gateway || '---'}</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest">{t.dnsServers}</label>
                            <div className="space-y-1.5 mt-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-theme-brand-primary rounded-full"></div>
                                    <span className="text-xs font-mono text-theme-text-primary">{currentProfile?.config?.dnsPrimary || '8.8.8.8'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-theme-border-primary rounded-full"></div>
                                    <span className="text-xs font-mono text-theme-text-primary">{currentProfile?.config?.dnsSecondary || '1.1.1.1'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-theme-bg-tertiary rounded-xl border border-dashed border-theme-border-primary text-center">
                        <p className="text-[10px] font-medium text-theme-text-muted uppercase">{t.externalTrafficSpeed}</p>
                        <div className="flex justify-around mt-3">
                            <div className="text-center">
                                <p className="text-xs font-bold text-emerald-500">12.4 {t.mbps || 'MB/s'}</p>
                                <p className="text-[8px] text-theme-text-muted uppercase">{t.down}</p>
                            </div>
                            <div className="text-center border-l border-theme-border-primary pl-4">
                                <p className="text-xs font-bold text-theme-brand-primary">1.8 {t.mbps || 'MB/s'}</p>
                                <p className="text-[8px] text-theme-text-muted uppercase">{t.up}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
