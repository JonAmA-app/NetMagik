
import React, { useState, useEffect } from 'react';
import { NetworkInterface, Language, ScannedDevice, Profile } from '../types';
import { TRANSLATIONS } from '../constants';
import { useToast } from '../context/ToastContext';
import { getVendor, mergeVendorData } from '../mac-vendors';
import { Radar, Globe, ArrowRight, Activity, DownloadCloud, ArrowUpDown, Copy, Check, Shield, Plus, Loader2, Square, Sparkles, AlertCircle, Shuffle, RefreshCw, Power } from 'lucide-react';

interface NetworkScannerProps {
    iface: NetworkInterface;
    language: Language;
    scannedDevices: ScannedDevice[];
    setScannedDevices: (devices: ScannedDevice[]) => void;
    isScanning: boolean;
    setIsScanning: (val: boolean) => void;
    progress: number;
    setProgress: (val: number) => void;
    onDiagnose: (ip: string) => void;
    onScanPorts: (ip: string) => void;
    onSaveToProfile?: (device: ScannedDevice) => void;
    onSaveAllToProfile?: () => void;
    onAddCamera?: (cam: any) => void;
    profiles?: Profile[]; // All available profiles for reference selection
    referenceProfileId: string;
    setReferenceProfileId: (id: string) => void;
}

// Helper for octet inputs
const OctetInput = ({
    value, index, type, locked, disabled, onChange
}: {
    value: string, index: number, type: 'start' | 'end', locked: boolean, disabled: boolean,
    onChange: (type: 'start' | 'end', index: number, val: string) => void
}) => (
    <input
        type="text"
        value={value}
        onChange={(e) => onChange(type, index, e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && (e.currentTarget.closest('.scanner-form')?.querySelector('.scan-btn') as HTMLButtonElement | null)?.click()}
        disabled={locked || disabled}
        className={`w-8 text-center bg-transparent border-b focus:outline-none text-xs font-mono transition-colors ${locked
            ? 'text-theme-text-muted border-transparent cursor-not-allowed'
            : 'text-theme-text-primary border-theme-border-secondary focus:border-theme-brand-primary'
            }`}
        placeholder="0"
    />
);

export const NetworkScanner: React.FC<NetworkScannerProps> = ({ iface, language, scannedDevices, setScannedDevices, isScanning, setIsScanning, progress, setProgress, onDiagnose, onScanPorts, onSaveToProfile, onSaveAllToProfile, profiles = [], referenceProfileId, setReferenceProfileId }) => {
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
    const { success, error } = useToast();
    const [dbUpdated, setDbUpdated] = useState(false);
    const [copiedIp, setCopiedIp] = useState<string | null>(null);
    const [scanProgressInfo, setScanProgressInfo] = useState({ current: 0, total: 0 });

    // Resolve the actual reference profile object
    const referenceProfile = profiles.find(p => p.id === referenceProfileId) || null;

    const [startOctets, setStartOctets] = useState<string[]>(['', '', '', '']);
    const [endOctets, setEndOctets] = useState<string[]>(['', '', '', '']);
    const [lockedIndices, setLockedIndices] = useState<boolean[]>([false, false, false, false]);
    const [manualEdit, setManualEdit] = useState(false);
    const [selectedBaseIp, setSelectedBaseIp] = useState(iface.currentIp);

    // Sort State
    const [sortAsc, setSortAsc] = useState(true);
    const [filter, setFilter] = useState<'all' | 'new' | 'changed'>('all');

    useEffect(() => {
        if (window.electronAPI) {
            const progressHandler = (data: { current: number, total: number }) => {
                setScanProgressInfo(data);
                const p = Math.floor((data.current / data.total) * 100);
                setProgress(p);
            };

            window.electronAPI.onScanRangeProgress(progressHandler);

            const fetchOUI = async () => {
                try {
                    const result = await window.electronAPI.fetchOuiDatabase();
                    if (result.success && result.data) {
                        mergeVendorData(result.data);
                        setDbUpdated(true);
                    }
                } catch (e) { }
            };

            if (!dbUpdated) {
                fetchOUI();
            }

            return () => {
                window.electronAPI.removeListeners('scan-range-progress');
            };
        }
    }, [dbUpdated, setProgress]);

    const handleUpdateOUI = async () => {
        if (window.electronAPI) {
            setDbUpdated(false);
            try {
                const result = await window.electronAPI.fetchOuiDatabase();
                if (result.success && result.data) {
                    mergeVendorData(result.data);
                    setDbUpdated(true);
                    success(t.ieeeOuiLoaded);
                }
            } catch (e) { }
        }
    };

    useEffect(() => {
        if (manualEdit) return;

        const baseIp = selectedBaseIp || iface.currentIp;
        const ipParts = baseIp.split('.');
        if (ipParts.length !== 4) return;
        const maskParts = iface.netmask ? iface.netmask.split('.') : ['255', '255', '255', '0'];

        let ipNum = 0;
        let maskNum = 0;
        for (let i = 0; i < 4; i++) {
            ipNum = (ipNum << 8) | parseInt(ipParts[i], 10);
            maskNum = (maskNum << 8) | parseInt(maskParts[i], 10);
        }
        ipNum >>>= 0;
        maskNum >>>= 0;

        const networkNum = (ipNum & maskNum) >>> 0;
        const broadcastNum = ((networkNum | (~maskNum)) & 0xFFFFFFFF) >>> 0;
        const startIpNum = (networkNum + 1) >>> 0;
        const endIpNum = (broadcastNum - 1) >>> 0;

        const startParts = [
            (startIpNum >>> 24) & 255,
            (startIpNum >>> 16) & 255,
            (startIpNum >>> 8) & 255,
            startIpNum & 255
        ].map(String);

        const endParts = [
            (endIpNum >>> 24) & 255,
            (endIpNum >>> 16) & 255,
            (endIpNum >>> 8) & 255,
            endIpNum & 255
        ].map(String);

        setLockedIndices(maskParts.map(m => m === '255'));
        setStartOctets(startParts);
        setEndOctets(endParts);
    }, [iface, selectedBaseIp, manualEdit]);

    useEffect(() => {
        // Reset manual edit when switching interface completely
        setManualEdit(false);
        setSelectedBaseIp(iface.currentIp);
    }, [iface.id]);

    const handleOctetChange = (type: 'start' | 'end', index: number, val: string) => {
        if (val !== '' && (!/^\d+$/.test(val) || parseInt(val) > 255)) return;
        setManualEdit(true);
        if (type === 'start') {
            const newOctets = [...startOctets];
            newOctets[index] = val;
            setStartOctets(newOctets);
        } else {
            const newOctets = [...endOctets];
            newOctets[index] = val;
            setEndOctets(newOctets);
        }
    };

    const applyPreset = (start: string, end: string) => {
        setStartOctets(start.split('.'));
        setEndOctets(end.split('.'));
        setLockedIndices([false, false, false, false]);
        setManualEdit(true);
    };

    const handleScan = async () => {
        // --- Validate range before scanning ---
        const hasEmptyOctets = startOctets.some(o => o === '') || endOctets.some(o => o === '');
        if (hasEmptyOctets) {
            error(t.invalidRange || 'Invalid range: all octets must be filled');
            return;
        }

        const startIp = startOctets.join('.');
        const endIp = endOctets.join('.');

        if (startIp === '0.0.0.0' || startIp.startsWith('169.254.')) {
            error(t.unreachable || 'Cannot scan on a disconnected (0.0.0.0) or APIPA (169.254.x.x) network');
            return;
        }

        const ipRegex = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
        if (!ipRegex.test(startIp) || !ipRegex.test(endIp)) {
            error(t.invalidRange || 'Invalid IP range');
            return;
        }

        const ipToInt = (ip: string) => ip.split('.').reduce((acc, o) => (acc << 8) + parseInt(o, 10), 0) >>> 0;
        const startNum = ipToInt(startIp);
        const endNum = ipToInt(endIp);

        if (endNum < startNum) {
            error(t.rangeInverted || 'Start IP must be lower than End IP');
            return;
        }

        if ((endNum - startNum) > 2048) {
            error(t.rangeTooLarge || 'Range too large (max 2048 hosts). Narrow your range.');
            return;
        }

        setIsScanning(true);
        setScannedDevices([]);
        setProgress(10);
        setFilter('all');

        try {
            if (window.electronAPI) {
                setScanProgressInfo({ current: 0, total: 1 }); // Reset
                const results: any[] = await window.electronAPI.scanRange({ startIp, endIp });
                setProgress(100);

                // Build lookup maps from the reference profile's saved devices
                const profileDevices = referenceProfile?.devices || [];
                // Map of IP -> saved MAC (for detecting MAC changes)
                const savedByIp = new Map<string, string>(
                    profileDevices.filter((d: any) => d.ip && d.mac).map((d: any) => [d.ip, d.mac])
                );

                const devices: ScannedDevice[] = results.map((res: any) => {
                    const scannedMac = (res.mac || '').toUpperCase();
                    const savedMac = savedByIp.has(res.ip) ? (savedByIp.get(res.ip) || '').toUpperCase() : null;

                    let isNew = false;
                    let macChanged = false;
                    let savedMacVal: string | undefined = undefined;

                    if (!referenceProfile) {
                        // No active profile → mark all as new (no reference)
                        isNew = true;
                    } else if (savedMac === null) {
                        // IP not found in profile → new device
                        isNew = true;
                    } else if (scannedMac && savedMac && scannedMac !== savedMac) {
                        // IP found but MAC is different → MAC changed
                        macChanged = true;
                        savedMacVal = savedMac;
                    }
                    // else: IP found and MAC matches → known device, not new

                    return {
                        ip: res.ip,
                        mac: res.mac,
                        vendor: getVendor(res.mac),
                        hostname: res.hostname || '',
                        status: 'online' as const,
                        type: 'Unknown' as const,
                        isNew,
                        macChanged,
                        savedMac: savedMacVal,
                    };
                });
                setScannedDevices(devices);

                success(t.networkScanner, `${devices.length} ${t.devicesFound}`);
            } else {
                setTimeout(() => {
                    setProgress(100);
                    setScannedDevices([
                        { ip: '192.168.1.1', mac: '00:11:32:44:55:66', vendor: 'Synology', hostname: '', status: 'online', type: 'Unknown' },
                        { ip: iface.currentIp, mac: iface.macAddress, vendor: 'Intel', hostname: '', status: 'online', type: 'Unknown' },
                    ]);
                }, 2000);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setTimeout(() => setIsScanning(false), 500);
        }
    };

    const handleStopScan = () => {
        if (window.electronAPI && isScanning) {
            window.electronAPI.stopScanRange();
        }
    };

    const toggleSort = () => {
        const sorted = [...scannedDevices].sort((a, b) => {
            const ipA = a.ip.split('.').map(Number);
            const ipB = b.ip.split('.').map(Number);
            for (let i = 0; i < 4; i++) {
                if (ipA[i] !== ipB[i]) return sortAsc ? ipA[i] - ipB[i] : ipB[i] - ipA[i];
            }
            return 0;
        });
        setScannedDevices(sorted);
        setSortAsc(!sortAsc);
    };

    const copyIp = (ip: string) => {
        navigator.clipboard.writeText(ip);
        setCopiedIp(ip);
        setTimeout(() => setCopiedIp(null), 1500);
    };

    const exportToCSV = () => {
        if (scannedDevices.length === 0) return;

        const headers = [t.csvIpAddress || "IP Address", t.csvMacAddress || "MAC Address", "Hostname", t.csvVendor || "Vendor"];
        const rows = scannedDevices.map((d: ScannedDevice) => [d.ip, d.mac, d.hostname || '', d.vendor]);

        const csvContent = [
            headers.join(","),
            ...rows.map((r: string[]) => r.map(col => `"${col}"`).join(",")) // Escaped with quotes
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `network_scan_${iface.name}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section with Radar Effect */}
            <div className="relative overflow-hidden rounded-3xl bg-theme-bg-secondary border border-theme-border-primary p-8 shadow-2xl group/scanner">
                {/* Background Radar Animation */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-theme-brand-primary/5 rounded-full blur-3xl group-hover/scanner:bg-theme-brand-primary/10 transition-all duration-1000" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-theme-brand-primary/5 rounded-full blur-3xl" />
                
                {/* Visual Radar Sonar Effect */}
                {isScanning && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <div className="w-[1200px] h-[1200px] border border-theme-brand-primary/20 rounded-full animate-ping duration-[5000ms] opacity-30" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-theme-brand-primary/10 rounded-full animate-ping duration-[3000ms] opacity-20" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-theme-brand-primary/5 rounded-full animate-ping duration-[1500ms] opacity-10" />
                    </div>
                )}
                
                <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div className="space-y-4 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-brand-primary/10 border border-theme-brand-primary/20 text-theme-brand-primary text-[10px] font-bold uppercase tracking-wider">
                            <Activity size={12} className="animate-pulse" />
                            {t.networkDiscovery || "Network Discovery"}
                        </div>
                        <h2 className="text-4xl font-black text-theme-text-primary tracking-tight flex items-center gap-4">
                            <div className="relative">
                                <Radar className={`text-theme-brand-primary ${isScanning ? 'animate-spin duration-[4000ms]' : 'animate-pulse'}`} size={40} />
                                <div className="absolute inset-0 bg-theme-brand-primary/20 blur-xl rounded-full scale-150 animate-pulse" />
                            </div>
                            {t.networkScanner}
                        </h2>
                        <p className="text-theme-text-muted text-sm leading-relaxed">
                            {t.subnetMaskLocked.replace('$mask', iface.netmask)} — {t.scannerDescription || "Identify and monitor all devices within your local network infrastructure."}
                        </p>
                        
                        <div className="flex items-center gap-3 pt-2">
                            {dbUpdated ? (
                                <button
                                    onClick={handleUpdateOUI}
                                    className="neo-button inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px] font-bold"
                                >
                                    <DownloadCloud size={14} /> {t.ieeeOuiLoaded}
                                </button>
                            ) : (
                                <button
                                    onClick={handleUpdateOUI}
                                    className="neo-button inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-theme-bg-tertiary text-theme-text-muted border border-theme-border-primary text-[11px] font-bold"
                                >
                                    <RefreshCw size={14} className="animate-spin" /> {t.loading}
                                </button>
                            )}
                            
                            {profiles.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest">{t.reference}:</span>
                                    <select
                                        value={referenceProfileId}
                                        onChange={(e) => setReferenceProfileId(e.target.value)}
                                        disabled={isScanning}
                                        className="bg-theme-bg-tertiary border border-theme-border-secondary rounded-xl px-4 py-2 text-xs font-bold text-theme-text-primary focus:ring-2 focus:ring-theme-brand-primary/30 outline-none transition-all cursor-pointer shadow-sm hover:border-theme-brand-primary/50"
                                    >
                                        <option value="" className="bg-theme-bg-secondary text-theme-text-primary">{t.noProfileSelected || 'No profile'}</option>
                                        {profiles.map((p) => (
                                            <option key={p.id} value={p.id} className="bg-theme-bg-secondary text-theme-text-primary">{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Scan Control Card */}
                    <div className="w-full lg:w-96 glass-card p-6 rounded-3xl space-y-6">
                        {iface.allIps && iface.allIps.length > 1 && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-theme-text-muted uppercase tracking-widest ml-1">{t.selectIpRange}:</label>
                                <select
                                    value={selectedBaseIp}
                                    onChange={(e) => { setSelectedBaseIp(e.target.value); setManualEdit(false); }}
                                    disabled={isScanning}
                                    className="w-full bg-theme-bg-tertiary border border-theme-border-secondary rounded-2xl px-4 py-3 text-sm font-mono text-theme-text-primary outline-none focus:border-theme-brand-primary transition-all cursor-pointer"
                                >
                                    {iface.allIps.map(ip => <option key={ip} value={ip} className="bg-theme-bg-secondary text-theme-text-primary">{ip}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex flex-col gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-[10px] font-black text-theme-text-muted uppercase tracking-widest">{t.rangeStart}</span>
                                        <span className="text-[10px] font-black text-theme-text-muted uppercase tracking-widest">{t.rangeEnd}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-1 p-2.5 bg-theme-bg-primary/50 rounded-2xl border border-theme-border-primary/30">
                                        <div className="flex items-center">
                                            {startOctets.map((val, i) => (
                                                <React.Fragment key={`s-${i}`}>
                                                    <OctetInput value={val} index={i} type="start" locked={lockedIndices[i]} disabled={isScanning} onChange={handleOctetChange} />
                                                    {i < 3 && <span className="text-theme-text-muted/30 font-mono text-[10px]">.</span>}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                        <ArrowRight size={12} className="text-theme-text-muted/50 shrink-0" />
                                        <div className="flex items-center">
                                            {endOctets.map((val, i) => (
                                                <React.Fragment key={`e-${i}`}>
                                                    <OctetInput value={val} index={i} type="end" locked={lockedIndices[i]} disabled={isScanning} onChange={handleOctetChange} />
                                                    {i < 3 && <span className="text-theme-text-muted/30 font-mono text-[10px]">.</span>}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                                    {[{ label: '1.x', s: '192.168.1.1', e: '192.168.1.254' }, { label: '0.x', s: '192.168.0.1', e: '192.168.0.254' }].map(p => (
                                        <button
                                            key={p.label}
                                            onClick={() => applyPreset(p.s, p.e)}
                                            disabled={isScanning}
                                            className="px-2.5 py-1 rounded-lg bg-theme-bg-primary border border-theme-border-primary text-[10px] font-bold text-theme-text-muted hover:text-theme-brand-primary hover:border-theme-brand-primary transition-all whitespace-nowrap"
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                                {manualEdit && (
                                    <button onClick={() => setManualEdit(false)} disabled={isScanning} className="text-[10px] font-bold text-theme-brand-primary flex items-center gap-1">
                                        <RefreshCw size={10} /> {t.resetRange}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="relative group/btn">

                            {isScanning ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 relative z-10">
                                    <button
                                        onClick={handleStopScan}
                                        className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-rose-500/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                    >
                                        <Square size={16} fill="currentColor" className="animate-pulse" />
                                        {t.stopScan}
                                    </button>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-theme-brand-primary">
                                            <span className="flex items-center gap-2"><Loader2 size={12} className="animate-spin" /> {t.scanning}...</span>
                                            <span>{scanProgressInfo.current} / {scanProgressInfo.total}</span>
                                        </div>
                                        <div className="h-2 w-full bg-theme-bg-primary rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-theme-brand-primary to-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative z-10">
                                    <div className="absolute inset-0 -m-1 rounded-[1.25rem] bg-gradient-to-r from-theme-brand-primary via-theme-brand-hover to-theme-brand-primary opacity-0 group-hover/btn:opacity-30 blur-sm transition-opacity pointer-events-none" />
                                    <button
                                        onClick={handleScan}
                                        className="w-full py-4 bg-theme-brand-primary hover:bg-theme-brand-hover text-white rounded-2xl font-black text-sm shadow-xl shadow-theme-brand-primary/30 transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
                                    >
                                        <Radar size={20} className="group-hover:rotate-45 transition-transform duration-500" />
                                        {t.startScan}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* No active profile warning */}
            {!referenceProfile && scannedDevices.length > 0 && (
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-500 text-xs font-bold animate-in slide-in-from-left-2">
                    <AlertCircle size={18} />
                    <span>{t.noProfileWarning}</span>
                </div>
            )}

            {/* Results Section */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                    <div className="flex items-center gap-4">
                        <h3 className="text-xl font-black text-theme-text-primary tracking-tight">{t.devicesFound}</h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all select-none ${
                                    filter === 'all'
                                        ? 'bg-theme-text-muted text-theme-bg-secondary border-transparent font-black shadow-sm'
                                        : 'bg-theme-bg-secondary border-theme-border-primary text-theme-text-muted hover:border-theme-text-secondary'
                                }`}
                                title={t.all || 'All'}
                            >
                                {scannedDevices.length} {t.all || 'ALL'}
                            </button>
                            {scannedDevices.some(d => d.isNew) && (
                                <button
                                    onClick={() => setFilter(filter === 'new' ? 'all' : 'new')}
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all select-none ${
                                        filter === 'new'
                                            ? 'bg-amber-500 text-white border-transparent scale-105 shadow-md shadow-amber-500/20'
                                            : 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20'
                                    }`}
                                >
                                    <Sparkles size={10} /> {scannedDevices.filter(d => d.isNew).length} {t.newDevice?.toUpperCase() || 'NEW'}
                                </button>
                            )}
                            {scannedDevices.some(d => d.macChanged) && (
                                <button
                                    onClick={() => setFilter(filter === 'changed' ? 'all' : 'changed')}
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all select-none ${
                                        filter === 'changed'
                                            ? 'bg-orange-500 text-white border-transparent scale-105 shadow-md shadow-orange-500/20'
                                            : 'bg-orange-500/10 border-orange-500/20 text-orange-500 hover:bg-orange-500/20'
                                    }`}
                                >
                                    <Shuffle size={10} /> {scannedDevices.filter(d => d.macChanged).length} {t.macChanged?.toUpperCase() || 'CHANGED'}
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={exportToCSV}
                            disabled={scannedDevices.length === 0}
                            className="neo-button inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-theme-bg-secondary text-theme-text-secondary border border-theme-border-primary text-[11px] font-bold hover:text-theme-brand-primary hover:border-theme-brand-primary disabled:opacity-50"
                        >
                            <DownloadCloud size={14} /> {t.export}
                        </button>
                        <button
                            onClick={() => onSaveAllToProfile?.()}
                            disabled={scannedDevices.length === 0}
                            className="neo-button inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-theme-brand-primary text-white text-[11px] font-bold shadow-lg shadow-theme-brand-primary/20 disabled:opacity-50"
                        >
                            <Plus size={14} /> {t.saveAll}
                        </button>
                    </div>
                </div>

                <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-[2rem] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="bg-theme-bg-tertiary/50 border-b border-theme-border-primary">
                                    <th className="px-8 py-5 cursor-pointer group" onClick={toggleSort}>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-theme-text-muted uppercase tracking-widest group-hover:text-theme-brand-primary transition-colors">
                                            {t.ipAddress} <ArrowUpDown size={12} className={sortAsc ? 'rotate-180' : ''} />
                                        </div>
                                    </th>
                                    <th className="px-8 py-5 text-[10px] font-black text-theme-text-muted uppercase tracking-widest">{t.macAddress}</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-theme-text-muted uppercase tracking-widest">{t.vendor}</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-theme-text-muted uppercase tracking-widest">{t.actions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-theme-border-primary/30">
                                {scannedDevices.filter((d: ScannedDevice) => {
                                    if (filter === 'new') return d.isNew;
                                    if (filter === 'changed') return d.macChanged;
                                    return true;
                                }).map((device: ScannedDevice, idx: number) => {
                                    const isThisPc = device.ip === iface.currentIp;
                                    return (
                                        <tr 
                                            key={idx} 
                                            style={{ animationDelay: `${idx * 50}ms` }}
                                            className={`group/row animate-in slide-in-from-left-4 duration-500 fill-mode-both transition-all hover:bg-theme-brand-primary/[0.03] ${
                                            isThisPc ? 'bg-theme-brand-primary/[0.05]' : 
                                            device.macChanged ? 'bg-orange-500/[0.05]' : 
                                            device.isNew ? 'bg-amber-500/[0.05]' : ''
                                        }`}>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono font-bold text-theme-text-primary text-base tracking-tight">{device.ip}</span>
                                                            {isThisPc && (
                                                                <span className="text-[9px] font-black bg-theme-brand-primary/20 text-theme-brand-primary px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                                                    {t.thisPc}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {device.hostname && (
                                                            <span className="text-[11px] font-medium text-theme-text-muted mt-0.5 truncate max-w-[200px]" title={device.hostname}>
                                                                {device.hostname}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                                        <button onClick={() => copyIp(device.ip)} className="p-1.5 rounded-lg hover:bg-theme-bg-tertiary text-theme-text-muted hover:text-theme-brand-primary transition-all">
                                                            {copiedIp === device.ip ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <div className={`font-mono text-xs font-bold tracking-widest ${device.macChanged ? 'text-orange-500' : 'text-theme-text-muted opacity-80'}`}>
                                                        {device.mac}
                                                    </div>
                                                    {device.macChanged && (
                                                        <div className="text-[10px] font-bold text-theme-text-muted/40 line-through tracking-widest uppercase">
                                                            Was: {device.savedMac}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-theme-bg-tertiary/50 border border-theme-border-primary/50 text-[11px] font-bold text-theme-brand-primary">
                                                    {device.vendor}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-40 group-hover/row:opacity-100 transition-all transform translate-x-2 group-hover/row:translate-x-0">
                                                    <button onClick={() => onScanPorts(device.ip)} className="p-2 text-theme-text-muted hover:text-orange-500 hover:bg-orange-500/10 rounded-xl transition-all" title={t.portScanner}>
                                                        <Shield size={18} />
                                                    </button>
                                                    <button onClick={() => onDiagnose(device.ip)} className="p-2 text-theme-text-muted hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all" title={t.diagnose}>
                                                        <Activity size={18} />
                                                    </button>
                                                    {device.mac && device.mac !== 'Unknown' && (
                                                        <button 
                                                            onClick={async () => {
                                                                try {
                                                                    const res = await window.electronAPI.wakeOnLan({ mac: device.mac });
                                                                    if (res.success) {
                                                                        success(t.wakeOnLan || 'Wake-on-LAN', `Magic Packet sent to ${device.mac}`);
                                                                    } else {
                                                                        error(t.wakeOnLan || 'Wake-on-LAN', res.error || 'Failed');
                                                                    }
                                                                } catch (e: any) {
                                                                    error(t.wakeOnLan || 'Wake-on-LAN', e.message);
                                                                }
                                                            }} 
                                                            className="p-2 text-theme-text-muted hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all" 
                                                            title={t.wakeOnLan || "Wake-on-LAN"}
                                                        >
                                                            <Power size={18} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => window.open(`http://${device.ip}`, '_blank')} className="p-2 text-theme-text-muted hover:text-sky-500 hover:bg-sky-500/10 rounded-xl transition-all" title={t.openWeb}>
                                                        <Globe size={18} />
                                                    </button>
                                                    <div className="w-px h-4 bg-theme-border-primary mx-1" />
                                                    <button onClick={() => onSaveToProfile?.(device)} className="p-2 bg-theme-brand-primary/10 text-theme-brand-primary hover:bg-theme-brand-primary hover:text-white rounded-xl transition-all shadow-sm" title={t.saveToProfile}>
                                                        <Plus size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {scannedDevices.length === 0 && !isScanning && (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center space-y-4">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-theme-bg-tertiary text-theme-text-muted/30 mb-2">
                                                <Radar size={32} />
                                            </div>
                                            <p className="text-theme-text-muted font-bold text-lg italic">{t.clickToScan}</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
