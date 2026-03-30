
import React, { useState } from 'react';
import { NetworkInterface, Profile, Language, PingTarget } from '../types';
import { TRANSLATIONS } from '../constants';
import { PingManager } from './PingManager';
import { Traceroute } from './Traceroute';
import { Activity, Route } from 'lucide-react';

interface ConnectivityHubProps {
    iface: NetworkInterface;
    currentProfile?: Profile;
    language: Language;
    targets: PingTarget[];
    setTargets: React.Dispatch<React.SetStateAction<PingTarget[]>>;
}

export const ConnectivityHub: React.FC<ConnectivityHubProps> = ({ iface, currentProfile, language, targets, setTargets }) => {
    const [activeTab, setActiveTab] = useState<'ping' | 'trace'>('ping');
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];

    return (
        <div className="animate-in slide-in-from-bottom-2 duration-500">
            {/* Internal Tabs */}
            <div className="flex gap-2 mb-6 p-1 bg-theme-bg-tertiary rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('ping')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'ping'
                            ? 'bg-theme-bg-primary text-theme-brand-primary shadow-sm'
                            : 'text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-hover'
                        }`}
                >
                    <Activity size={16} />
                    {t.pingTool}
                </button>
                <button
                    onClick={() => setActiveTab('trace')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'trace'
                            ? 'bg-theme-bg-primary text-theme-brand-primary shadow-sm'
                            : 'text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-hover'
                        }`}
                >
                    <Route size={16} />
                    {t.traceroute}
                </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'ping' && (
                    <PingManager
                        iface={iface}
                        currentProfile={currentProfile}
                        language={language}
                        targets={targets}
                        setTargets={setTargets}
                    />
                )}
                {activeTab === 'trace' && (
                    <Traceroute language={language} />
                )}
            </div>
        </div>
    );
};
