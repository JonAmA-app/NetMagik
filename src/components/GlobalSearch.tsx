import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Network, Clipboard, Key, Server, Zap } from 'lucide-react';
import { Profile, ClipboardSnippet, DeviceCredential } from '../types';
import { TRANSLATIONS } from '../constants';


interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
    profiles: Profile[];
    snippets: ClipboardSnippet[];
    credentials: DeviceCredential[];
    language: 'en' | 'es';
    onSelectProfile: (profileId: string) => void;
    onSelectSnippet: (snippetId: string) => void;
    onSelectCredential: (credentialId: string) => void;
    onSelectDevice: (profileId: string, deviceId: string) => void;
}

type SearchResult = {
    id: string;
    type: 'profile' | 'snippet' | 'credential' | 'device';
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    profileId?: string; // For devices
};

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
    isOpen,
    onClose,
    profiles,
    snippets,
    credentials,

    onSelectProfile,
    onSelectSnippet,
    language,
    onSelectCredential,
    onSelectDevice
}) => {
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const searchTerm = query.toLowerCase();

        // Easter Egg: Follow the white rabbit
        if (searchTerm === 'neo' || searchTerm === 'trinity' || searchTerm === 'morpheus') {
            window.dispatchEvent(new CustomEvent('easter-egg', { detail: { id: 'matrix', name: 'Sigue al conejo blanco' } }));
            window.document.documentElement.setAttribute('data-theme', 'matrix');
            // Allow state to persist on reload
            localStorage.setItem('NetMajik_settings', JSON.stringify({
                ...JSON.parse(localStorage.getItem('NetMajik_settings') || '{}'),
                theme: 'matrix'
            }));
        }

        // Easter Egg: Rickroll
        if (searchTerm === 'never gonna give you up' || searchTerm === 'rickroll') {
            window.dispatchEvent(new CustomEvent('easter-egg', { detail: { id: 'egg8', name: 'Rickroll' } }));
            window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
        }

        const allResults: SearchResult[] = [];

        // Search profiles
        profiles.forEach(profile => {
            if (
                profile.name.toLowerCase().includes(searchTerm) ||
                profile.config?.ipAddress?.toLowerCase().includes(searchTerm) ||
                profile.config?.gateway?.toLowerCase().includes(searchTerm)
            ) {
                allResults.push({
                    id: profile.id,
                    type: 'profile',
                    title: profile.name,
                    subtitle: profile.config?.ipAddress || 'DHCP',
                    icon: <Network size={18} className="text-theme-brand-primary" />
                });
            }

            // Search devices within profiles
            profile.devices?.forEach(device => {
                if (
                    device.name.toLowerCase().includes(searchTerm) ||
                    device.ip.toLowerCase().includes(searchTerm)
                ) {
                    allResults.push({
                        id: device.id,
                        type: 'device',
                        title: device.name,
                        subtitle: `${device.ip} • ${profile.name} `,
                        icon: <Server size={18} className="text-theme-brand-primary" />,
                        profileId: profile.id
                    });
                }
            });
        });

        // Search snippets
        snippets.forEach(snippet => {
            if (
                snippet.label.toLowerCase().includes(searchTerm) ||
                snippet.value.toLowerCase().includes(searchTerm)
            ) {
                allResults.push({
                    id: snippet.id,
                    type: 'snippet',
                    title: snippet.label,
                    subtitle: snippet.value.substring(0, 50) + (snippet.value.length > 50 ? '...' : ''),
                    icon: <Clipboard size={18} className="text-theme-brand-primary" />
                });
            }
        });

        // Search credentials
        credentials.forEach(cred => {
            if (
                cred.vendor.toLowerCase().includes(searchTerm) ||
                cred.model.toLowerCase().includes(searchTerm) ||
                cred.username.toLowerCase().includes(searchTerm)
            ) {
                allResults.push({
                    id: cred.id,
                    type: 'credential',
                    title: `${cred.vendor} ${cred.model} `,
                    subtitle: `${cred.username} • ${cred.type} `,
                    icon: <Key size={18} className="text-theme-brand-primary" />
                });
            }
        });

        setResults(allResults.slice(0, 20)); // Limit to 20 results
        setSelectedIndex(0);
    }, [query, profiles, snippets, credentials]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter' && results.length > 0) {
            handleSelect(results[selectedIndex]);
        }
    };

    const handleSelect = (result: SearchResult) => {
        switch (result.type) {
            case 'profile':
                onSelectProfile(result.id);
                break;
            case 'snippet':
                onSelectSnippet(result.id);
                break;
            case 'credential':
                onSelectCredential(result.id);
                break;
            case 'device':
                if (result.profileId) {
                    onSelectDevice(result.profileId, result.id);
                }
                break;
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-start justify-center pt-32 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl bg-theme-bg-secondary rounded-2xl shadow-2xl border border-theme-border-primary overflow-hidden animate-in slide-in-from-top-4 duration-300"
                onClick={e => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-theme-border-primary">
                    <Search size={20} className="text-theme-text-muted" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t.globalSearchPlaceholder}
                        className="flex-1 bg-transparent text-lg outline-none text-theme-text-primary placeholder:text-theme-text-muted"
                    />
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-theme-bg-hover rounded-lg transition-colors text-theme-text-muted"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {results.length === 0 && query.trim() ? (
                        <div className="p-8 text-center text-theme-text-muted">
                            <Search size={48} className="mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-medium">{t.noResultsFound}</p>
                            <p className="text-xs mt-1">{t.tryDifferentTerm}</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="p-8 text-center text-theme-text-muted">
                            <Zap size={48} className="mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-medium">{t.quickSearch}</p>
                            <p className="text-xs mt-1">{t.quickSearchDesc}</p>
                        </div>
                    ) : (
                        <div className="p-2">
                            {results.map((result, index) => (
                                <button
                                    key={`${result.type}-${result.id}`}
                                    onClick={() => handleSelect(result)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${index === selectedIndex
                                        ? 'bg-theme-brand-primary text-white shadow-lg shadow-theme-brand-primary/20'
                                        : 'hover:bg-theme-bg-hover'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg transition-colors ${index === selectedIndex
                                        ? 'bg-white/20 text-white'
                                        : 'bg-theme-bg-tertiary'
                                        }`}>
                                        {React.cloneElement(result.icon as React.ReactElement<any>, {
                                            className: index === selectedIndex ? 'text-white' : (result.icon as React.ReactElement<any>).props.className
                                        })}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                        <p className={`font-semibold truncate ${index === selectedIndex ? 'text-white' : 'text-theme-text-primary'}`}>
                                            {result.title}
                                        </p>
                                        <p className={`text-xs truncate ${index === selectedIndex ? 'text-white/80' : 'text-theme-text-muted'}`}>
                                            {result.subtitle}
                                        </p>
                                    </div>
                                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${index === selectedIndex
                                        ? 'bg-white/20 text-white'
                                        : 'bg-theme-bg-primary text-theme-text-muted'
                                        }`}>
                                        {(t as any)[result.type] || result.type}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {results.length > 0 && (
                    <div className="px-4 py-3 bg-theme-bg-tertiary border-t border-theme-border-primary flex items-center justify-between text-xs text-theme-text-muted">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-theme-bg-primary border border-theme-border-primary rounded text-[10px] font-mono">↑↓</kbd>
                                {t.navigate}
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-theme-bg-primary border border-theme-border-primary rounded text-[10px] font-mono">↵</kbd>
                                {t.select}
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-theme-bg-primary border border-theme-border-primary rounded text-[10px] font-mono">Esc</kbd>
                                {t.close}
                            </span>
                        </div>
                        <span className="font-medium">{results.length} {t.resultsFound}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
