
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { useToast } from '../context/ToastContext';
import {
    Download, Search, RefreshCw, Package, ArrowUpCircle, X,
    ChevronDown, ChevronUp, CheckCircle2, Clock, FileJson, FileText,
    LayoutGrid, List, Loader2, Check
} from 'lucide-react';

interface Program {
    name: string;
    version: string;
    vendor: string;
    installDate: string;
}

interface WingetUpdate {
    name: string;
    id: string;
    version: string;
    available: string;
}

interface InstalledProgramsProps {
    language: Language;
    eggsActive?: boolean;
}

interface UpdateStatus {
    id: string;
    name: string;
    progress: number;
    status: 'pending' | 'downloading' | 'extracting' | 'installing' | 'verifying' | 'completed' | 'failed' | 'processing' | 'waiting';
    error?: string;
}

export const InstalledPrograms: React.FC<InstalledProgramsProps> = ({ language, eggsActive }) => {
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
    const [programs, setPrograms] = useState<Program[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Winget states
    const [viewMode, setViewMode] = useState<'installed' | 'updates'>('installed');
    const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('list');
    const { success, error } = useToast();
    const [updates, setUpdates] = useState<WingetUpdate[]>([]);
    const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);

    // Detailed update states
    const [updateQueue, setUpdateQueue] = useState<UpdateStatus[]>([]);
    const [isQueueVisible, setIsQueueVisible] = useState(false);
    const [isQueueMinimized, setIsQueueMinimized] = useState(false);

    const [selectedUpdates, setSelectedUpdates] = useState<Record<string, boolean>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'non-windows'>('all');

    useEffect(() => {
        fetchPrograms();
        checkWingetUpdates();
    }, []);

    useEffect(() => {
        if (window.electronAPI) {
            const handler = (data: any) => {
                if (data.type === 'progress') {
                    setUpdateQueue(prev => prev.map(u => u.id === data.appId ? { ...u, status: data.status, progress: data.progress } : u));
                }
            };
            window.electronAPI.onWingetProgress(handler);
            return () => {
                window.electronAPI.removeListeners('winget-update-status');
            };
        }
    }, []);

    const fetchPrograms = async () => {
        setIsLoading(true);
        try {
            if (window.electronAPI) {
                const data = await window.electronAPI.getInstalledPrograms();
                setPrograms(data);
            }
        } catch (e) {
            console.error('Failed to fetch programs:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const checkWingetUpdates = async () => {
        setIsCheckingUpdates(true);
        try {
            if (window.electronAPI) {
                success(t.software, t.checkWingetUpdates);
                const results = await window.electronAPI.getWingetUpdates();
                if (results.success && results.updates) {
                    setUpdates(results.updates);
                }
            }
        } catch (e) {
            console.error('Winget update check failed', e);
        } finally {
            setIsCheckingUpdates(false);
        }
    };

    const handleUpdateApp = async (appId: string, appName: string) => {
        const newUpdate: UpdateStatus = { id: appId, name: appName, progress: 0, status: 'pending' };
        setUpdateQueue(prev => [...prev.filter(u => u.id !== appId), newUpdate]);
        setIsQueueVisible(true);
        setIsQueueMinimized(false);

        try {
            if (window.electronAPI) {
                const results = await window.electronAPI.updateWingetApp(appId);
                if (results.success) {
                    setUpdateQueue(prev => prev.map(u => u.id === appId ? { ...u, status: 'completed', progress: 100 } : u));
                    setUpdates(prev => prev.filter(u => u.id !== appId));
                } else {
                    setUpdateQueue(prev => prev.map(u => u.id === appId ? { ...u, status: 'failed', error: results.error } : u));
                }
            }
        } catch (e) {
            console.error('Update failed', e);
            setUpdateQueue(prev => prev.map(u => u.id === appId ? { ...u, status: 'failed', error: 'System Error' } : u));
        } finally {
            setSelectedUpdates(prev => { const n = { ...prev }; delete n[appId]; return n; });
        }
    };

    const handleUpdateSelected = async () => {
        const selectedToUpdate = updates.filter(u => selectedUpdates[u.id]);
        if (selectedToUpdate.length === 0) return;

        const newUpdates: UpdateStatus[] = selectedToUpdate.map(u => ({
            id: u.id,
            name: u.name,
            progress: 0,
            status: 'pending'
        }));

        setUpdateQueue(prev => {
            const existingIds = new Set(prev.map(u => u.id));
            return [...prev, ...newUpdates.filter(n => !existingIds.has(n.id))];
        });
        setIsQueueVisible(true);
        setIsQueueMinimized(false);

        for (const app of selectedToUpdate) {
            await handleUpdateApp(app.id, app.name);
        }

        success(t.programs, t.successfullyUpdated || `Selected updates completed`);
    };

    const toggleSelectAll = () => {
        if (Object.keys(selectedUpdates).length === filteredUpdates.length) {
            setSelectedUpdates({});
        } else {
            const all: Record<string, boolean> = {};
            filteredUpdates.forEach(u => all[u.id] = true);
            setSelectedUpdates(all);
        }
    };

    const handleExport = async (format: 'json' | 'csv') => {
        try {
            if (window.electronAPI) {
                const filteredPrograms = programs.filter(p =>
                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.vendor.toLowerCase().includes(searchTerm.toLowerCase())
                );
                const res = await window.electronAPI.exportPrograms({ programs: filteredPrograms, format });
                if (res.success) {
                    success(t.programs, t.exportSuccess || 'Export successful!');
                }
            }
        } catch (e) {
            error(t.programs, t.exportFailed || 'Export failed');
        }
    };

    const filteredPrograms = programs.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             p.vendor.toLowerCase().includes(searchTerm.toLowerCase());
        if (filter === 'non-windows') {
            const isMicrosoft = p.vendor.toLowerCase().includes('microsoft');
            return matchesSearch && !isMicrosoft;
        }
        return matchesSearch;
    });

    const filteredUpdates = updates.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-theme-text-primary flex items-center gap-3">
                        <Package className="text-theme-brand-primary" size={28} />
                        {t.programs}
                    </h2>
                    <p className="text-theme-text-muted text-sm mt-1">{t.programsDesc}</p>
                </div>

                <div className="flex bg-theme-bg-secondary p-1 rounded-xl border border-theme-border-primary">
                    <button
                        onClick={() => setViewMode('installed')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'installed' ? 'bg-theme-brand-primary text-white shadow-lg shadow-theme-brand-primary/20' : 'text-theme-text-muted hover:bg-theme-bg-hover hover:text-theme-text-primary'}`}
                    >
                        {t.installed}
                </button>
                    <button
                        onClick={() => setViewMode('updates')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all relative ${viewMode === 'updates' ? 'bg-theme-brand-primary text-white shadow-lg shadow-theme-brand-primary/20' : 'text-theme-text-muted hover:bg-theme-bg-hover hover:text-theme-text-primary'}`}
                    >
                        {t.updates}
                        {updates.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-theme-bg-primary font-bold">
                                {updates.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted" size={18} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t.searchPrograms}
                        className="w-full bg-theme-bg-secondary border border-theme-border-primary rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-theme-brand-primary/50 outline-none text-theme-text-primary transition-all"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setLayoutMode('grid')}
                        className={`p-2.5 rounded-xl border transition-all ${layoutMode === 'grid' ? 'bg-theme-brand-primary/10 border-theme-brand-primary text-theme-brand-primary' : 'bg-theme-bg-secondary border-theme-border-primary text-theme-text-muted hover:border-theme-text-muted'}`}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setLayoutMode('list')}
                        className={`p-2.5 rounded-xl border transition-all ${layoutMode === 'list' ? 'bg-theme-brand-primary/10 border-theme-brand-primary text-theme-brand-primary' : 'bg-theme-bg-secondary border-theme-border-primary text-theme-text-muted hover:border-theme-text-muted'}`}
                    >
                        <List size={20} />
                    </button>
                </div>

                {viewMode === 'installed' && (
                    <div className="flex bg-theme-bg-secondary p-1 rounded-xl border border-theme-border-primary">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-theme-brand-primary text-white' : 'text-theme-text-muted hover:text-theme-text-primary'}`}
                        >
                            {t.allPrograms}
                        </button>
                        <button
                            onClick={() => setFilter('non-windows')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'non-windows' ? 'bg-theme-brand-primary text-white' : 'text-theme-text-muted hover:text-theme-text-primary'}`}
                        >
                            {t.nonWindowsPrograms}
                        </button>
                    </div>
                )}

                <div className="h-8 w-[1px] bg-theme-border-primary mx-2" />

                <div className="flex items-center gap-2">
                    <button onClick={() => handleExport('json')} className="p-2.5 bg-theme-bg-secondary border border-theme-border-primary rounded-xl text-theme-text-muted hover:text-theme-text-primary transition-all flex items-center gap-2 text-sm font-bold">
                        <FileJson size={18} /> JSON
                    </button>
                    <button onClick={() => handleExport('csv')} className="p-2.5 bg-theme-bg-secondary border border-theme-border-primary rounded-xl text-theme-text-muted hover:text-theme-text-primary transition-all flex items-center gap-2 text-sm font-bold">
                        <FileText size={18} /> CSV
                    </button>
                </div>

                <button
                    onClick={() => viewMode === 'installed' ? fetchPrograms() : checkWingetUpdates()}
                    disabled={isLoading || isCheckingUpdates}
                    className="p-2.5 bg-theme-bg-secondary border border-theme-border-primary rounded-xl text-theme-brand-primary hover:bg-theme-brand-primary/10 transition-all disabled:opacity-50"
                >
                    <RefreshCw size={20} className={(isLoading || isCheckingUpdates) ? 'animate-spin' : ''} />
                </button>

                {viewMode === 'updates' && updates.length > 0 && (
                    <button
                        onClick={handleUpdateSelected}
                        disabled={Object.keys(selectedUpdates).length === 0}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        <ArrowUpCircle size={18} />
                        {t.updateSelected} ({Object.keys(selectedUpdates).length})
                    </button>
                )}
            </div>

            {/* List/Grid Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {viewMode === 'installed' ? (
                    isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-theme-text-muted">
                            <Loader2 className="animate-spin mb-4" size={48} />
                            <p className="font-medium">{t.scanningInstalledPrograms || t.loadingPrograms}</p>
                        </div>
                    ) : filteredPrograms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-theme-text-muted border-2 border-dashed border-theme-border-primary rounded-2xl">
                            <Package size={48} className="opacity-20 mb-4" />
                            <p>{t.noProgramsFound || 'No programs found'}</p>
                        </div>
                    ) : layoutMode === 'list' ? (
                        <div className="bg-theme-bg-secondary rounded-2xl border border-theme-border-primary overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-theme-bg-tertiary border-b border-theme-border-primary">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">{t.name}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">{t.version}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">{t.vendor}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">{t.installDate}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-theme-border-primary">
                                    {filteredPrograms.map((prog, idx) => (
                                        <tr key={idx} className="hover:bg-theme-bg-hover transition-colors group">
                                            <td className="px-6 py-4 font-bold text-theme-text-primary text-sm flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-theme-bg-tertiary flex items-center justify-center text-theme-brand-primary">
                                                    <Package size={16} />
                                                </div>
                                                {prog.name}
                                            </td>
                                            <td className="px-6 py-4 text-theme-text-muted text-xs font-mono">{prog.version}</td>
                                            <td className="px-6 py-4 text-theme-text-muted text-sm">{prog.vendor}</td>
                                            <td className="px-6 py-4 text-theme-text-muted text-xs font-medium">{prog.installDate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredPrograms.map((prog, idx) => (
                                <div key={idx} className="bg-theme-bg-secondary p-5 rounded-2xl border border-theme-border-primary hover:border-theme-brand-primary/50 transition-all hover:shadow-xl shadow-sm group">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-theme-bg-tertiary flex items-center justify-center text-theme-brand-primary group-hover:scale-110 transition-transform">
                                            <Package size={24} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-theme-text-primary truncate" title={prog.name}>{prog.name}</h4>
                                            <p className="text-theme-text-muted text-xs font-medium truncate">{prog.vendor}</p>
                                            <div className="flex items-center gap-3 mt-3">
                                                <span className="text-[10px] px-2 py-0.5 bg-theme-bg-tertiary rounded text-theme-text-muted font-mono">{prog.version}</span>
                                                <span className="text-[10px] text-theme-text-muted">{prog.installDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    /* Updates View */
                    isCheckingUpdates ? (
                        <div className="flex flex-col items-center justify-center h-64 text-theme-text-muted">
                            <Loader2 className="animate-spin mb-4" size={48} />
                            <p className="font-medium">{t.checkingUpdates || 'Checking for winget updates...'}</p>
                        </div>
                    ) : filteredUpdates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-theme-text-muted border-2 border-dashed border-theme-border-primary rounded-2xl">
                            <CheckCircle2 size={48} className="text-emerald-500/30 mb-4" />
                            <p className="text-lg font-bold">{t.everythingUpdated || 'Everything is up to date!'}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-4">
                                <button
                                    onClick={toggleSelectAll}
                                    className="text-xs font-bold text-theme-brand-primary hover:underline flex items-center gap-2"
                                >
                                    <CheckCircle2 size={14} />
                                    {Object.keys(selectedUpdates).length === filteredUpdates.length ? t.deselectAll : t.selectAll}
                                </button>
                                <span className="text-xs text-theme-text-muted">{filteredUpdates.length} {t.updatesAvailable || 'updates available'}</span>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {filteredUpdates.map((upd, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedUpdates(prev => ({ ...prev, [upd.id]: !prev[upd.id] }))}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${selectedUpdates[upd.id] ? 'bg-theme-brand-primary/10 border-theme-brand-primary shadow-md' : 'bg-theme-bg-secondary border-theme-border-primary hover:bg-theme-bg-hover'}`}
                                    >
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedUpdates[upd.id] ? 'bg-theme-brand-primary border-theme-brand-primary text-white' : 'border-theme-border-primary bg-theme-bg-tertiary'}`}>
                                            {selectedUpdates[upd.id] && <Check size={14} strokeWidth={3} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-theme-text-primary text-sm truncate">{upd.name}</h4>
                                                <span className="text-[10px] text-theme-text-muted font-mono bg-theme-bg-tertiary px-1.5 rounded">{upd.id}</span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] font-bold text-theme-text-muted uppercase tracking-wider">{t.current || 'Current'}:</span>
                                                    <span className="text-xs font-mono text-theme-text-muted">{upd.version}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <ArrowUpCircle size={12} className="text-emerald-500" />
                                                    <span className="text-[10px] font-bold text-theme-text-muted uppercase tracking-wider">{t.available || 'Available'}:</span>
                                                    <span className="text-xs font-mono text-emerald-500 font-bold">{upd.available}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleUpdateApp(upd.id, upd.name); }}
                                            className="p-2.5 bg-theme-brand-primary/10 text-theme-brand-primary rounded-xl hover:bg-theme-brand-primary hover:text-white transition-all group"
                                        >
                                            <Download size={20} className="group-hover:-translate-y-0.5 transition-transform" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* Floating Updates Queue Panel */}
            {isQueueVisible && (
                <div className={`fixed right-8 ${eggsActive ? 'bottom-32' : 'bottom-8'} w-96 bg-theme-bg-secondary border border-theme-border-primary rounded-2xl shadow-2xl transition-all duration-300 z-[100] overflow-hidden flex flex-col ${isQueueMinimized ? 'h-14' : 'h-[400px]'}`}>
                    <div className="p-4 bg-theme-bg-tertiary flex items-center justify-between border-b border-theme-border-primary">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <RefreshCw size={18} className={`text-theme-brand-primary ${updateQueue.some(u => u.status !== 'completed' && u.status !== 'failed') ? 'animate-spin' : ''}`} />
                                <span className="absolute -top-2 -right-2 bg-theme-brand-primary text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{updateQueue.length}</span>
                            </div>
                            <span className="font-bold text-sm text-theme-text-primary">{t.activeUpdates || 'Updates Queue'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setIsQueueMinimized(!isQueueMinimized)} className="p-1.5 text-theme-text-muted hover:bg-theme-bg-hover rounded-lg transition-colors">
                                {isQueueMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            <button onClick={() => setIsQueueVisible(false)} className="p-1.5 text-theme-text-muted hover:bg-rose-500 hover:text-white rounded-lg transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {!isQueueMinimized && (
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {updateQueue.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-theme-text-muted opacity-50 italic text-sm">
                                    <Clock size={32} className="mb-2" />
                                    No active updates
                                </div>
                            ) : (
                                updateQueue.slice().reverse().map((q) => (
                                    <div key={q.id} className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-theme-text-primary truncate max-w-[200px]">{q.name}</span>
                                            <span className={`capitalize font-bold ${q.status === 'completed' ? 'text-emerald-500' : q.status === 'failed' ? 'text-rose-500' : 'text-theme-brand-primary'}`}>
                                                {t[q.status] || q.status}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-theme-bg-tertiary rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${q.status === 'completed' ? 'bg-emerald-500' : q.status === 'failed' ? 'bg-rose-500' : 'bg-theme-brand-primary shadow-[0_0_8px_rgba(var(--brand-primary-rgb),0.5)]'}`}
                                                style={{ width: `${q.progress}%` }}
                                            />
                                        </div>
                                        {q.error && <p className="text-[10px] text-rose-500 font-medium italic mt-1 bg-rose-500/5 p-1 rounded">Error: {q.error}</p>}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
