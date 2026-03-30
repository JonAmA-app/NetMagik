
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { useToast } from '../context/ToastContext';
import { Network, Scan, Lock, Unlock, PlayCircle, Plus, X, RotateCcw, Square } from 'lucide-react';
import { useRef } from 'react';
import { ConfirmModal } from './ConfirmModal';

interface PortScannerProps {
    language: Language;
    initialIp?: string;
}

const PORT_DESCRIPTIONS: Record<number, string> = {
    20: 'FTP Data', 21: 'FTP Control', 22: 'SSH', 23: 'Telnet', 25: 'SMTP', 53: 'DNS', 80: 'HTTPWeb', 110: 'POP3',
    143: 'IMAP', 443: 'HTTPS', 3306: 'MySQL', 3389: 'RDP', 5432: 'PostgreSQL', 5900: 'VNC', 6379: 'Redis',
    8080: 'HTTP-Alt', 8443: 'HTTPS-Alt', 554: 'RTSP', 5060: 'SIP', 27017: 'MongoDB'
};

const DEFAULT_PORTS = [21, 22, 23, 80, 443, 3389, 8080, 8443, 554, 5060];

export const PortScanner: React.FC<PortScannerProps> = ({ language, initialIp }) => {
    const { success } = useToast();

    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
    const [targetIp, setTargetIp] = useState(initialIp || (t.exampleIp || '192.168.1.1'));
    const [isScanning, setIsScanning] = useState(false);
    const stopScanningRef = useRef(false);
    const [scanResults, setScanResults] = useState<{ port: number, status: 'open' | 'closed' }[]>([]);

    const [selectedRange, setSelectedRange] = useState<'common' | 'wellKnown' | 'registered' | 'dynamic' | 'all'>('common');
    const [showResetModal, setShowResetModal] = useState(false);
    
    // Progress Tracking
    const [scanProgress, setScanProgress] = useState(0);
    const [currentScanningPort, setCurrentScanningPort] = useState<number | null>(null);
    const [estimatedTime, setEstimatedTime] = useState<string | null>(null);
    const startTimeRef = useRef<number>(0);

    // Port Management
    const [portsToScan, setPortsToScan] = useState<number[]>(() => {
        const saved = localStorage.getItem('NetMajik_common_ports');
        return saved ? JSON.parse(saved) : DEFAULT_PORTS;
    });
    const [newPortInput, setNewPortInput] = useState('');

    useEffect(() => {
        if (initialIp) {
            setTargetIp(initialIp);
        }
    }, [initialIp]);

    useEffect(() => {
        if (portsToScan) {
            localStorage.setItem('NetMajik_common_ports', JSON.stringify(portsToScan));
        }
    }, [portsToScan]);

    const addPort = () => {
        const p = parseInt(newPortInput);
        if (!isNaN(p) && p > 0 && p <= 65535 && !portsToScan.includes(p)) {
            setPortsToScan(prev => [...prev, p].sort((a, b) => a - b));
            setNewPortInput('');
        }
    };

    const removePort = (port: number) => {
        setPortsToScan(prev => prev.filter(p => p !== port));
    };

    const resetPorts = () => {
        setPortsToScan(DEFAULT_PORTS);
        setShowResetModal(false);
    };

    const handleScanPorts = async () => {
        setIsScanning(true);
        setScanResults([]);
        setScanProgress(0);
        setCurrentScanningPort(null);
        setEstimatedTime(null);
        stopScanningRef.current = false;
        startTimeRef.current = Date.now();

        let ports: number[] = [];
        if (selectedRange === 'common') {
            ports = portsToScan;
        } else if (selectedRange === 'wellKnown') {
            ports = Array.from({ length: 1023 }, (_, i) => i + 1);
        } else if (selectedRange === 'registered') {
            ports = Array.from({ length: 49151 - 1024 + 1 }, (_, i) => i + 1024);
        } else if (selectedRange === 'dynamic') {
            ports = Array.from({ length: 65535 - 49152 + 1 }, (_, i) => i + 49152);
        } else if (selectedRange === 'all') {
            ports = Array.from({ length: 65535 }, (_, i) => i + 1);
        }

        const results: { port: number, status: 'open' | 'closed' }[] = [];
        const isLargeScan = ports.length > 100;

        if (window.electronAPI) {
            // Sequential scan with UI updates
            for (let i = 0; i < ports.length; i++) {
                if (stopScanningRef.current) break;
                const port = ports[i];
                setCurrentScanningPort(port);
                setScanProgress(Math.round(((i + 1) / ports.length) * 100));
                
                // Calculate ETA
                if (i > 0 && i % 5 === 0) {
                   const elapsed = (Date.now() - startTimeRef.current) / 1000;
                   const perPort = elapsed / i;
                   const remaining = perPort * (ports.length - i);
                   if (remaining > 60) {
                      setEstimatedTime(`${Math.floor(remaining / 60)}m ${Math.round(remaining % 60)}s`);
                   } else {
                      setEstimatedTime(`${Math.round(remaining)}s`);
                   }
                }

                try {
                    const isOpen = await window.electronAPI.checkPort({ host: targetIp, port });
                    if (isOpen) {
                        results.push({ port, status: 'open' });
                        if (isLargeScan) setScanResults([...results]);
                    }

                    if (!isLargeScan) {
                        if (!isOpen) results.push({ port, status: 'closed' });
                        setScanResults([...results]);
                    }

                    // Yield to UI every 10 ports
                    if (i % 10 === 0) await new Promise(r => setTimeout(r, 0));
                } catch (e) { }
            }
        }
        setScanResults([...results]);
        setIsScanning(false);
        setScanProgress(100);
        setCurrentScanningPort(null);
        setEstimatedTime(null);

        success(`${t.portScanner} - ${targetIp}`, t.scanCompleted || `Scan completed for ${targetIp}`);
    };

    const stopScan = () => {
        stopScanningRef.current = true;
    };



    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-theme-text-primary flex items-center gap-2">
                    <Network className="text-theme-brand-primary" />
                    {t.portScanner}
                </h2>

                <div className="flex bg-theme-bg-tertiary p-1 rounded-lg">
                    <select
                        value={selectedRange}
                        onChange={(e) => setSelectedRange(e.target.value as any)}
                        className="bg-transparent text-theme-text-primary text-sm font-medium px-4 py-2 outline-none cursor-pointer"
                    >
                        <option value="common" className="bg-theme-bg-secondary">{t.rangeCommon}</option>
                        <option value="wellKnown" className="bg-theme-bg-secondary">{t.rangeWellKnown}</option>
                        <option value="registered" className="bg-theme-bg-secondary">{t.rangeRegistered}</option>
                        <option value="dynamic" className="bg-theme-bg-secondary">{t.rangeDynamic}</option>
                        <option value="all" className="bg-theme-bg-secondary">{t.rangeAll}</option>
                    </select>
                </div>
            </div>

            <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 mb-8 items-end">
                    <div className="flex-1 w-full">
                        <label className="text-xs font-bold text-theme-text-muted uppercase tracking-wider mb-1 block">{t.ipAddress}</label>
                        <input
                            type="text"
                            value={targetIp}
                            onChange={(e) => setTargetIp(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleScanPorts()}
                            className="w-full h-12 px-4 bg-theme-bg-primary border border-theme-border-primary rounded-xl text-base font-mono focus:outline-none focus:border-theme-brand-primary transition-all text-theme-text-primary"
                            placeholder={t.exampleIp || "192.168.1.1"}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleScanPorts}
                            disabled={isScanning || !targetIp}
                            className="h-12 px-8 bg-theme-brand-primary hover:bg-theme-brand-hover text-white rounded-xl font-bold shadow-lg shadow-theme-brand-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-w-[160px]"
                        >
                            {isScanning ? <Scan size={20} className="animate-spin" /> : <PlayCircle size={20} />}
                            {t.startScan}
                        </button>
                        {isScanning && (
                            <button
                                onClick={stopScan}
                                className="h-12 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Square size={18} fill="currentColor" />
                                {t.stopPing || 'Stop'}
                            </button>
                        )}
                    </div>
                </div>

                {selectedRange === 'common' && (
                    <div className="mb-8 p-4 bg-theme-bg-tertiary rounded-xl border border-theme-border-secondary">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-theme-text-muted uppercase tracking-widest">{t.rangeCommon}</h3>
                            <button onClick={() => setShowResetModal(true)} className="flex items-center gap-1.5 text-[10px] font-bold text-theme-brand-primary uppercase hover:opacity-80 transition-opacity">
                                <RotateCcw size={12} /> {t.resetDefaults || 'Reset'}
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {portsToScan.map(port => (
                                <div key={port} className="flex items-center gap-2 bg-theme-bg-primary px-3 py-1.5 rounded-lg border border-theme-border-primary group">
                                    <span className="text-sm font-mono font-bold text-theme-text-primary">{port}</span>
                                    <button onClick={() => removePort(port)} className="text-theme-text-muted hover:text-rose-500 transition-colors">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 max-w-xs">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={newPortInput}
                                    onChange={(e) => setNewPortInput(e.target.value.replace(/[^0-9]/g, ''))}
                                    onKeyDown={(e) => e.key === 'Enter' && addPort()}
                                    placeholder={t.addPort}
                                    className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border-primary rounded-lg text-sm focus:outline-none focus:border-theme-brand-primary text-theme-text-primary placeholder:text-theme-text-muted/40"
                                />
                            </div>
                            <button
                                onClick={addPort}
                                disabled={!newPortInput}
                                className="px-4 bg-theme-brand-primary hover:bg-theme-brand-hover text-white rounded-lg transition-all disabled:opacity-50 shadow-sm shadow-theme-brand-primary/10"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {scanResults.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {scanResults.map((item, idx) => (
                            <div key={idx} className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${item.status === 'open'
                                ? 'bg-emerald-500/10 border-emerald-500/50 shadow-sm'
                                : 'bg-theme-bg-tertiary border-theme-border-primary opacity-60'
                                }`}>
                                <span className="text-[10px] font-bold text-theme-text-primary uppercase">{item.port}</span>
                                <span className="text-[9px] font-bold text-theme-text-tertiary uppercase tracking-tighter -mt-1">{PORT_DESCRIPTIONS[item.port] || 'TCP'}</span>
                                <div className="flex items-center gap-1.5 mt-1">
                                    {item.status === 'open' ? <Unlock size={14} className="text-emerald-500" /> : <Lock size={14} className="text-theme-text-muted" />}
                                    <span className={`text-sm font-bold ${item.status === 'open' ? 'text-emerald-500' : 'text-theme-text-muted'}`}>
                                        {item.status === 'open' ? t.open : t.closed}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    !isScanning && (
                        <div className="text-center py-12 text-theme-text-muted border-2 border-dashed border-theme-border-primary rounded-xl">
                            <Network size={48} className="mx-auto mb-4 opacity-10" />
                            <p className="text-sm">{t.enterIpToScan}</p>
                        </div>
                    )
                )}
                {isScanning && (
                    <div className="mb-8">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <p className="text-[10px] font-black uppercase text-theme-text-muted tracking-widest">{t.scanning}...</p>
                                <p className="text-sm font-bold text-theme-text-primary">
                                    <span className="text-theme-brand-primary">{currentScanningPort || '---'}</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase text-theme-text-muted tracking-widest">{t.timeEstimated}</p>
                                <p className="text-sm font-bold text-theme-text-primary">{estimatedTime || t.calculating}</p>
                            </div>
                        </div>
                        <div className="h-2 w-full bg-theme-bg-tertiary rounded-full overflow-hidden border border-theme-border-primary/50">
                            <div 
                                className="h-full bg-theme-brand-primary transition-all duration-300 ease-out"
                                style={{ width: `${scanProgress}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-1">
                            <span className="text-[10px] font-bold text-theme-text-muted">{scanProgress}%</span>
                            <span className="text-[10px] font-bold text-theme-text-muted">{scanResults.filter(r => r.status === 'open').length} {t.open}</span>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={showResetModal}
                onClose={() => setShowResetModal(false)}
                onConfirm={resetPorts}
                title={t.resetDefaults}
                message={t.deleteConfirm}
                confirmLabel={t.apply}
                cancelLabel={t.cancel}
                variant="warning"
                t={t}
            />
        </div>
    );
};
