
import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Route, Play, MapPin, Globe, Server, Home } from 'lucide-react';

interface TracerouteProps {
    language: Language;
}

interface Hop {
    id: number;
    ip: string;
    latency: number;
    hostname?: string;
    status: 'pending' | 'done' | 'timeout';
}

export const Traceroute: React.FC<TracerouteProps> = ({ language }) => {
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
    const [target, setTarget] = useState('8.8.8.8');
    const [isTracing, setIsTracing] = useState(false);
    const [hops, setHops] = useState<Hop[]>([]);

    React.useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.onTracerouteData((data) => {
                const lines = data.split('\n');
                lines.forEach(line => {
                    if (line.trim().match(/^\d+/)) {
                        const matchHop = line.match(/^\s*(\d+)\s+(.+)$/);
                        if (matchHop) {
                            const id = parseInt(matchHop[1], 10);
                            let ip = 'Unknown';
                            let latency = 0;
                            let hostname = '';
                            let status: 'pending' | 'done' | 'timeout' = 'done';

                            if (line.includes('Request timed out.') || line.includes('Tiempo de espera') || line.includes('timed out') || line.includes('*        *        *')) {
                                ip = 'Timeout';
                                status = 'timeout';
                            } else {
                                const times = [...line.matchAll(/(<|=| )(\d+)\s*ms/g)];
                                if (times.length > 0) {
                                    latency = parseInt(times[times.length - 1][2], 10);
                                }

                                const ipMatch = line.match(/(\d+\.\d+\.\d+\.\d+)/);
                                if (ipMatch) {
                                    ip = ipMatch[1];
                                }

                                const hostMatch = line.match(/\s+([a-zA-Z0-9.-]+)\s+\[/);
                                if (hostMatch) {
                                    hostname = hostMatch[1];
                                }
                            }

                            setHops(prev => {
                                const exist = prev.find(h => h.id === id);
                                if (exist) return prev;
                                return [...prev, { id, ip, latency, hostname, status }];
                            });
                        }
                    }
                });
            });
        }
        return () => {
            if (window.electronAPI) {
                window.electronAPI.removeListeners('traceroute-data');
            }
        };
    }, []);

    const startTrace = async () => {
        setIsTracing(true);
        setHops([]);

        if (window.electronAPI) {
            await window.electronAPI.runTraceroute({ target });
            setIsTracing(false);
        } else {
            // Simulate Trace (In web demo)
            const simulatedHops: Hop[] = [
                { id: 1, ip: '192.168.1.1', latency: 1, hostname: 'gateway', status: 'pending' },
                { id: 2, ip: '10.20.0.1', latency: 8, hostname: 'isp-node-01', status: 'pending' },
                { id: 3, ip: '142.250.1.1', latency: 15, hostname: 'backbone-provider', status: 'pending' },
                { id: 4, ip: '172.217.1.1', latency: 22, hostname: 'google-edge', status: 'pending' },
                { id: 5, ip: target, latency: 24, hostname: 'dns.google', status: 'pending' }
            ];

            let current = 0;
            const interval = setInterval(() => {
                if (current >= simulatedHops.length) {
                    clearInterval(interval);
                    setIsTracing(false);
                    return;
                }

                const hop = simulatedHops[current];
                setHops(prev => [...prev, { ...hop, status: 'done' }]);
                current++;
            }, 800);
        }
    };

    const getIcon = (index: number, total: number) => {
        if (index === 0) return <Home size={16} />;
        if (index === total - 1) return <MapPin size={16} />;
        return <Server size={16} />;
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
            <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-theme-brand-primary/10 text-theme-brand-primary rounded-lg">
                        <Route size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-theme-text-primary">{t.traceroute}</h3>
                        <p className="text-xs text-theme-text-muted">{t.pathAnalysis}</p>
                    </div>
                </div>

                <div className="flex gap-2 mb-6">
                    <div className="relative flex-1">
                        <div className="absolute left-3 top-2.5 text-theme-text-tertiary">
                            <Globe size={16} />
                        </div>
                        <input
                            type="text"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            placeholder={t.exampleDomain}
                            className="w-full pl-9 pr-4 py-2 bg-theme-bg-tertiary border border-theme-border-primary rounded-lg text-sm font-mono focus:outline-none focus:border-theme-brand-primary text-theme-text-primary"
                        />
                    </div>
                    <button
                        onClick={startTrace}
                        disabled={isTracing || !target}
                        className="px-4 py-2 bg-theme-brand-primary hover:bg-theme-brand-hover text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <Play size={16} />
                        {t.startTrace}
                    </button>
                </div>

                {/* Visual Trace */}
                <div className="space-y-0 relative">
                    {/* Connecting Line */}
                    {hops.length > 1 && (
                        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-theme-border-primary -z-0" />
                    )}

                    {hops.map((hop, index) => (
                        <div key={hop.id} className="flex items-center gap-4 relative z-10 animate-in slide-in-from-left-2 fade-in duration-300">
                            <div className={`w-10 h-10 rounded-full border-4 border-theme-bg-secondary flex items-center justify-center shrink-0 ${hop.status === 'done'
                                ? (index === hops.length - 1 ? 'bg-emerald-500 text-white' : 'bg-theme-brand-primary text-white')
                                : 'bg-theme-bg-tertiary text-theme-text-muted'
                                }`}>
                                {getIcon(index, 5)}
                            </div>

                            <div className="flex-1 bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg p-3 flex items-center justify-between">
                                <div>
                                    <div className="font-mono text-sm font-semibold text-theme-text-primary">
                                        {hop.ip}
                                    </div>
                                    <div className="text-xs text-theme-text-muted">{hop.hostname}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className={`text-sm font-bold ${hop.latency < 20 ? 'text-emerald-500' : 'text-yellow-500'}`}>
                                            {hop.latency} ms
                                        </div>
                                        <div className="text-[10px] text-theme-text-muted">{t.hop} {hop.id}</div>
                                    </div>
                                    {/* Latency Bar */}
                                    <div className="w-16 h-1.5 bg-theme-bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${hop.latency < 20 ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                                            style={{ width: `${Math.min(100, hop.latency * 2)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {hops.length === 0 && !isTracing && (
                        <div className="text-center py-8 text-theme-text-muted text-sm">
                            {t.tracePlaceholder}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
