
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Calculator, Box, Hash, Grid } from 'lucide-react';
import { ipToInt, intToIp } from '../utils';

interface SubnetCalculatorProps {
    language: Language;
}

export const SubnetCalculator: React.FC<SubnetCalculatorProps> = ({ language }) => {
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
    const [ip, setIp] = useState('192.168.1.10');
    const [cidr, setCidr] = useState(24);
    const [mask, setMask] = useState('255.255.255.0');
    const [calculated, setCalculated] = useState<any>(null);

    useEffect(() => {
        calculateSubnet();
    }, [ip, cidr]);

    const calculateSubnet = () => {
        const ipInt = ipToInt(ip);
        const maskInt = ~((1 << (32 - cidr)) - 1);

        // Safety check for basic IP format
        if (ip.split('.').length !== 4) return;

        const networkInt = ipInt & maskInt;
        const broadcastInt = networkInt | ~maskInt;
        const firstUsable = networkInt + 1;
        const lastUsable = broadcastInt - 1;
        const numHosts = Math.pow(2, 32 - cidr) - 2;

        const ipBin = ipInt >>> 0;
        const maskBin = maskInt >>> 0;
        const netBin = networkInt >>> 0;

        setMask(intToIp(maskInt));
        setCalculated({
            network: intToIp(networkInt),
            broadcast: intToIp(broadcastInt),
            first: intToIp(firstUsable),
            last: intToIp(lastUsable),
            hosts: numHosts > 0 ? numHosts : 0,
            class: getClass(ipInt),
            type: isPrivate(ipInt) ? 'Private' : 'Public',
            binary: {
                ip: toBinStr(ipBin),
                mask: toBinStr(maskBin),
                network: toBinStr(netBin)
            }
        });
    };

    const getClass = (ip: number) => {
        const first = (ip >>> 24) & 0xFF;
        if (first < 128) return 'A';
        if (first < 192) return 'B';
        if (first < 224) return 'C';
        if (first < 240) return 'D (Multicast)';
        return 'E (Experimental)';
    };

    const isPrivate = (ip: number) => {
        const first = (ip >>> 24) & 0xFF;
        const second = (ip >>> 16) & 0xFF;
        if (first === 10) return true;
        if (first === 172 && second >= 16 && second <= 31) return true;
        if (first === 192 && second === 168) return true;
        return false;
    };

    const toBinStr = (num: number) => {
        let bin = (num >>> 0).toString(2).padStart(32, '0');
        // Insert dots
        return bin.match(/.{1,8}/g)?.join('.') || bin;
    };

    // Helper to render colored bits
    const renderBinary = (binStr: string, type: 'ip' | 'mask' | 'net') => {
        const octets = binStr.split('.');
        return (
            <div className="flex gap-1 font-mono text-xs sm:text-sm">
                {octets.map((oct, i) => (
                    <React.Fragment key={i}>
                        <div className="flex">
                            {oct.split('').map((bit, j) => {
                                // Highlight network vs host bits
                                const globalIndex = i * 8 + j;
                                const isNetBit = globalIndex < cidr;

                                let colorClass = 'text-theme-text-muted';
                                if (type === 'mask') colorClass = isNetBit ? 'text-theme-brand-primary font-bold' : 'text-theme-text-tertiary';
                                if (type === 'ip' || type === 'net') colorClass = isNetBit ? 'text-theme-brand-primary font-bold' : 'text-theme-text-secondary';

                                return <span key={j} className={colorClass}>{bit}</span>;
                            })}
                        </div>
                        {i < 3 && <span className="text-theme-text-muted">.</span>}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
            <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-bold text-theme-text-primary flex items-center gap-2">
                            <Calculator className="text-theme-brand-primary" />
                            {t.subnetCalculator}
                        </h2>
                        <p className="text-sm text-theme-text-muted mt-1">{t.calculatorDesc}</p>
                    </div>

                    <div className="flex items-center gap-2 bg-theme-bg-tertiary p-2 rounded-lg">
                        <input
                            type="text"
                            value={ip}
                            onChange={(e) => setIp(e.target.value)}
                            className="bg-transparent border-b border-theme-border-primary focus:border-theme-brand-primary outline-none w-32 text-center font-mono text-theme-text-primary"
                        />
                        <span className="text-theme-text-muted">/</span>
                        <select
                            value={cidr}
                            onChange={(e) => setCidr(parseInt(e.target.value))}
                            className="bg-transparent border-b border-theme-border-primary focus:border-theme-brand-primary outline-none w-16 text-center font-mono text-theme-text-primary cursor-pointer"
                        >
                            {Array.from({ length: 32 }, (_, i) => i + 1).map(n => (
                                <option key={n} value={n} className="bg-theme-bg-secondary text-theme-text-primary">
                                    {n}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {calculated && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-theme-bg-primary p-4 rounded-lg border border-theme-border-secondary text-center">
                            <span className="text-xs font-bold text-theme-text-muted uppercase tracking-wider">{t.networkAddress}</span>
                            <div className="font-mono text-lg font-bold text-theme-brand-primary mt-1">{calculated.network}</div>
                        </div>
                        <div className="bg-theme-bg-primary p-4 rounded-lg border border-theme-border-secondary text-center">
                            <span className="text-xs font-bold text-theme-text-muted uppercase tracking-wider">{t.broadcast}</span>
                            <div className="font-mono text-lg font-bold text-indigo-500 mt-1">{calculated.broadcast}</div>
                        </div>
                        <div className="bg-theme-bg-primary p-4 rounded-lg border border-theme-border-secondary text-center">
                            <span className="text-xs font-bold text-theme-text-muted uppercase tracking-wider">{t.subnetMask}</span>
                            <div className="font-mono text-lg font-bold text-emerald-500 mt-1">{mask}</div>
                        </div>
                        <div className="bg-theme-bg-primary p-4 rounded-lg border border-theme-border-secondary text-center">
                            <span className="text-xs font-bold text-theme-text-muted uppercase tracking-wider">{t.totalHosts}</span>
                            <div className="font-mono text-lg font-bold text-theme-text-primary mt-1">{calculated.hosts.toLocaleString()}</div>
                        </div>
                    </div>
                )}
            </div>

            {calculated && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-theme-bg-secondary border border-theme-border-primary rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-theme-text-primary mb-4 flex items-center gap-2">
                            <Hash size={18} className="text-theme-text-muted" />
                            {t.binaryView}
                        </h3>

                        <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-theme-text-muted">{t.ipAddress}</span>
                                {renderBinary(calculated.binary.ip, 'ip')}
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-theme-text-muted">{t.subnetMask}</span>
                                {renderBinary(calculated.binary.mask, 'mask')}
                            </div>
                            <div className="w-full h-px bg-theme-border-primary my-2"></div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-theme-text-muted">{t.networkPortion}</span>
                                {renderBinary(calculated.binary.network, 'net')}
                            </div>
                        </div>
                    </div>

                    <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-theme-text-primary mb-4 flex items-center gap-2">
                            <Grid size={18} className="text-theme-text-muted" />
                            {t.rangeAndClass}
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-theme-text-muted">{t.class}</span>
                                <span className="font-bold text-theme-text-primary">{calculated.class}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-theme-text-muted">{t.type}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${calculated.type === 'Private' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-theme-brand-primary/10 text-theme-brand-primary'}`}>
                                    {calculated.type === 'Private' ? t.private : t.public}
                                </span>
                            </div>
                            <div className="pt-4 mt-2 border-t border-theme-border-primary">
                                <span className="text-xs font-bold text-theme-text-muted uppercase tracking-wider block mb-2">{t.usableRange}</span>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-sm font-mono text-theme-text-secondary">
                                        <Box size={14} className="text-emerald-500" />
                                        {calculated.first}
                                    </div>
                                    <div className="ml-1.5 border-l-2 border-dashed border-theme-border-primary h-4"></div>
                                    <div className="flex items-center gap-2 text-sm font-mono text-theme-text-secondary">
                                        <Box size={14} className="text-orange-500" />
                                        {calculated.last}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
