
import React, { useState, useEffect } from 'react';
import { NetworkInterface, Language, ScannedDevice, Profile } from '../types';
import { TRANSLATIONS } from '../constants';
import { useToast } from '../context/ToastContext';
import { getVendor, mergeVendorData } from '../mac-vendors';
import { Radar, Globe, ArrowRight, Activity, DownloadCloud, ArrowUpDown, Copy, Check, Shield, Plus, Loader2, Square, Sparkles, AlertCircle, Shuffle, RefreshCw } from 'lucide-react';

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
    currentProfile?: Profile | null;
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
        className={`w-10 text-center bg-transparent border-b focus:outline-none text-sm font-mono transition-colors ${locked
            ? 'text-theme-text-muted border-transparent cursor-not-allowed'
            : 'text-theme-text-primary border-theme-border-secondary focus:border-theme-brand-primary'
            }`}
        placeholder="0"
    />
);

export const NetworkScanner: React.FC<NetworkScannerProps> = ({ iface, language, scannedDevices, setScannedDevices, isScanning, setIsScanning, progress, setProgress, onDiagnose, onScanPorts, onSaveToProfile, onSaveAllToProfile, currentProfile, profiles = [], referenceProfileId, setReferenceProfileId }) => {
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
    const { success } = useToast();
    const [dbUpdated, setDbUpdated] = useState(false);
    const [copiedIp, setCopiedIp] = useState<string | null>(null);
    const [scanProgressInfo, setScanProgressInfo] = useState({ current: 0, total: 0 });

    // Resolve the actual reference profile object
    const referenceProfile = profiles.find(p => p.id === referenceProfileId) || null;

    const [startOctets, setStartOctets] = useState<string[]>(['', '', '', '']);
    const [endOctets, setEndOctets] = useState<string[]>(['', '', '', '']);
    const [lockedIndices, setLockedIndices] = useState<boolean[]>([false, false, false, false]);

    // Sort State
    const [sortAsc, setSortAsc] = useState(true);

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
        const ipParts = iface.currentIp.split('.');
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
    }, [iface]);

    const handleOctetChange = (type: 'start' | 'end', index: number, val: string) => {
        if (val !== '' && (!/^\d+$/.test(val) || parseInt(val) > 255)) return;
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

    const handleScan = async () => {
        setIsScanning(true);
        setScannedDevices([]);
        setProgress(10);

        const startIp = startOctets.join('.');
        const endIp = endOctets.join('.');

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
                        hostname: '',
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

        const headers = [t.csvIpAddress || "IP Address", t.csvMacAddress || "MAC Address", t.csvVendor || "Vendor"];
        const rows = scannedDevices.map((d: ScannedDevice) => [d.ip, d.mac, d.vendor]);

        const csvContent = [
            headers.join(","),
            ...rows.map((r: string[]) => r.join(","))
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
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
            <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-xl p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-bold text-theme-text-primary flex items-center gap-2">
                            <Radar className="text-theme-brand-primary" />
                            {t.networkScanner}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-theme-text-muted">
                                {t.subnetMaskLocked.replace('$mask', iface.netmask)}
                            </p>
                            {dbUpdated ? (
                                <button
                                    onClick={handleUpdateOUI}
                                    className="text-[10px] bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white px-1.5 py-0.5 rounded flex items-center gap-1 transition-all border border-emerald-500/20"
                                    title={t.refreshList || "Actualizar Base de Datos MAC"}
                                >
                                    <DownloadCloud size={10} /> {t.ieeeOuiLoaded}
                                </button>
                            ) : (
                                <button
                                    onClick={handleUpdateOUI}
                                    className="text-[10px] bg-theme-bg-tertiary text-theme-text-muted hover:text-theme-brand-primary px-1.5 py-0.5 rounded flex items-center gap-1 transition-all border border-theme-border-primary animate-pulse"
                                >
                                    <RefreshCw size={10} className="animate-spin" /> {t.loading}
                                </button>
                            )}
                        </div>
                        {/* Reference profile selector */}
                        {profiles.length > 0 && (
                            <div className="flex items-center gap-2 mt-3">
                                <span className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest whitespace-nowrap">
                                    {t.availableProfiles}:
                                </span>
                                <select
                                    value={referenceProfileId}
                                    onChange={(e) => setReferenceProfileId(e.target.value)}
                                    disabled={isScanning}
                                    className="flex-1 max-w-[200px] bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg px-2 py-1 text-xs font-semibold text-theme-text-primary focus:ring-1 focus:ring-theme-brand-primary/50 focus:border-theme-brand-primary outline-none transition-all disabled:opacity-60 cursor-pointer"
                                >
                                    <option value="">{t.noProfileSelected || '— No profile —'}</option>
                                    {profiles.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}{p.id === currentProfile?.id ? ' ✓' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 scanner-form w-full lg:w-auto">
                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 bg-theme-bg-tertiary p-3 rounded-lg border border-theme-border-secondary w-full">
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] font-black text-theme-text-muted uppercase mr-2 shrink-0">{t.rangeStart}</span>
                                <div className="flex items-center">
                                    {startOctets.map((val, i) => (
                                        <React.Fragment key={`s-${i}`}>
                                            <OctetInput value={val} index={i} type="start" locked={lockedIndices[i]} disabled={isScanning} onChange={handleOctetChange} />
                                            {i < 3 && <span className="text-theme-text-muted">.</span>}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                            <ArrowRight size={16} className="text-theme-text-muted shrink-0 rotate-90 sm:rotate-0" />
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] font-black text-theme-text-muted uppercase mr-2 shrink-0">{t.rangeEnd}</span>
                                <div className="flex items-center">
                                    {endOctets.map((val, i) => (
                                        <React.Fragment key={`e-${i}`}>
                                            <OctetInput value={val} index={i} type="end" locked={lockedIndices[i]} disabled={isScanning} onChange={handleOctetChange} />
                                            {i < 3 && <span className="text-theme-text-muted">.</span>}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {isScanning && (
                            <div className="text-[10px] font-bold text-theme-brand-primary uppercase tracking-widest flex items-center gap-2 px-1">
                                <Loader2 size={12} className="animate-spin" />
                                {t.hostsScanned.replace('$current', scanProgressInfo.current.toString()).replace('$total', scanProgressInfo.total.toString())}
                            </div>
                        )}

                        {isScanning ? (
                            <button
                                onClick={handleStopScan}
                                className="scan-btn w-full py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Square size={16} fill="currentColor" />
                                {t.stopScan || "Stop Scan"}
                            </button>
                        ) : (
                            <button
                                onClick={handleScan}
                                className="scan-btn w-full py-2 bg-theme-brand-primary hover:bg-theme-brand-hover text-white rounded-lg font-bold text-sm shadow-lg shadow-theme-brand-primary/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Radar size={16} />
                                {t.startScan}
                            </button>
                        )}
                    </div>
                </div>
                {isScanning && (
                    <div className="mt-6 h-1.5 w-full bg-theme-bg-tertiary rounded-full overflow-hidden">
                        <div className="h-full bg-theme-brand-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                )}
            </div>

            {/* No active profile warning */}
            {!referenceProfile && scannedDevices.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px] font-semibold">
                    <AlertCircle size={14} />
                    <span>{t.noProfileWarning || 'No profile selected — all IPs will appear as new'}</span>
                </div>
            )}

            <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-xl overflow-hidden shadow-sm">
                {(() => {
                    const newCount = scannedDevices.filter(d => d.isNew).length;
                    const macChangedCount = scannedDevices.filter(d => d.macChanged).length;
                    const totalChanges = newCount + macChangedCount;
                    return (
                        <div className="p-4 border-b border-theme-border-secondary bg-theme-bg-tertiary flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="font-bold text-theme-text-secondary">{t.devicesFound}</h3>
                                <div className="h-4 w-px bg-theme-border-primary" />
                                {/* Differences counter */}
                                {scannedDevices.length > 0 && (
                                    <>
                                        {newCount > 0 && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/25 px-2 py-0.5 rounded-full">
                                                <Sparkles size={10} />
                                                {newCount} {t.newDevice || 'New'}
                                            </span>
                                        )}
                                        {macChangedCount > 0 && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold bg-orange-500/15 text-orange-500 border border-orange-500/25 px-2 py-0.5 rounded-full">
                                                <Shuffle size={10} />
                                                {macChangedCount} {t.macChanged || 'MAC Changed'}
                                            </span>
                                        )}
                                        {totalChanges === 0 && referenceProfile && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                                                <Check size={10} /> OK
                                            </span>
                                        )}
                                    </>
                                )}
                                <div className="h-4 w-px bg-theme-border-primary" />
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={exportToCSV}
                                        disabled={scannedDevices.length === 0}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-theme-bg-primary text-theme-text-secondary rounded-lg text-[10px] font-bold border border-theme-border-primary hover:border-theme-brand-primary/50 hover:text-theme-brand-primary transition-all disabled:opacity-50"
                                        title={t.export}
                                    >
                                        <DownloadCloud size={12} /> {t.export}
                                    </button>
                                    <button
                                        onClick={() => onSaveAllToProfile?.()}
                                        disabled={scannedDevices.length === 0}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-theme-brand-primary text-white rounded-lg text-[10px] font-bold hover:bg-theme-brand-hover transition-all shadow-md shadow-theme-brand-primary/10 disabled:opacity-50"
                                        title={t.saveAllShort || 'Save All'}
                                    >
                                        <Plus size={12} /> {t.saveAll}
                                    </button>
                                </div>
                            </div>
                            <span className="text-xs font-mono bg-theme-bg-primary px-2 py-1 rounded text-theme-text-muted">{scannedDevices.length}</span>
                        </div>
                    );
                })()}

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-theme-text-muted uppercase bg-theme-bg-tertiary border-b border-theme-border-secondary">
                            <tr>
                                <th className="px-6 py-3 cursor-pointer hover:text-theme-text-primary" onClick={toggleSort}>
                                    <div className="flex items-center gap-1">
                                        {t.ipAddress} <ArrowUpDown size={12} />
                                    </div>
                                </th>
                                <th className="px-6 py-3">{t.macAddress}</th>
                                <th className="px-6 py-3">{t.vendor}</th>
                                <th className="px-6 py-3 text-right">{t.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y border-theme-border-primary">
                            {scannedDevices.map((device: ScannedDevice, idx: number) => {
                                const isThisPc = device.ip === iface.currentIp;
                                return (
                                    <tr key={idx} className={`group hover:bg-theme-bg-hover transition-colors ${
                                        isThisPc ? 'bg-theme-brand-primary/10' :
                                        device.macChanged ? 'bg-orange-500/5' :
                                        device.isNew ? 'bg-amber-500/5' : ''
                                    }`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium text-theme-text-primary font-mono">{device.ip}</span>
                                                {isThisPc && (
                                                    <span className="text-[10px] bg-theme-brand-primary/20 text-theme-brand-primary px-1.5 py-0.5 rounded font-bold">
                                                        {t.thisPc}
                                                    </span>
                                                )}
                                                {device.isNew && (
                                                    <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest flex items-center gap-1 border border-amber-500/20 shadow-sm shadow-amber-500/10">
                                                        <Sparkles size={10} /> {t.newDevice || 'New'}
                                                    </span>
                                                )}
                                                {device.macChanged && (
                                                    <span className="text-[9px] bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest flex items-center gap-1 border border-orange-500/20 shadow-sm shadow-orange-500/10" title={`Saved: ${device.savedMac}`}>
                                                    <Shuffle size={10} /> {t.macChanged || 'MAC Changed'}
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => copyIp(device.ip)}
                                                    className="text-theme-text-muted hover:text-theme-brand-primary transition-colors opacity-0 group-hover:opacity-100"
                                                    title={t.copyLink}
                                                >
                                                    {copiedIp === device.ip ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">
                                            {device.macChanged ? (
                                                <div className="space-y-0.5">
                                                    <div className="text-orange-500 font-bold">{device.mac}</div>
                                                    <div className="text-theme-text-muted/60 line-through text-[10px]">{device.savedMac}</div>
                                                </div>
                                            ) : (
                                                <span className="text-theme-text-muted">{device.mac}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded bg-theme-bg-tertiary text-theme-brand-primary text-xs font-semibold">{device.vendor}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => onScanPorts(device.ip)} className="p-1.5 text-theme-text-muted hover:text-orange-500 hover:bg-orange-500/10 rounded transition-colors" title={t.portScanner}>
                                                    <Shield size={16} />
                                                </button>
                                                <button onClick={() => onDiagnose(device.ip)} className="p-1.5 text-theme-text-muted hover:text-emerald-500 hover:bg-emerald-500/10 rounded transition-colors" title={t.diagnose}>
                                                    <Activity size={16} />
                                                </button>
                                                <button onClick={() => window.open(`http://${device.ip}`, '_blank')} className="p-1.5 text-theme-text-muted hover:text-theme-brand-primary hover:bg-theme-bg-hover rounded transition-colors" title={t.openWeb}>
                                                    <Globe size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onSaveToProfile?.(device)}
                                                    className="p-1.5 text-theme-text-muted hover:text-theme-brand-primary hover:bg-theme-bg-hover rounded transition-colors"
                                                    title={t.saveToProfile}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {scannedDevices.length === 0 && !isScanning && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-theme-text-muted italic">{t.clickToScan}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
