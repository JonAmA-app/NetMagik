import React from 'react';
import { NetworkInterface } from '../types';
import { Wifi, Network, Power, Activity } from 'lucide-react';

interface InterfaceCardProps {
    iface: NetworkInterface;
    isSelected: boolean;
    onClick: (id: string) => void;
    onToggle?: (id: string, enable: boolean) => void;
    isToggling?: boolean;
}

export const InterfaceCard: React.FC<InterfaceCardProps> = ({ iface, isSelected, onClick, onToggle, isToggling }) => {
    const isWifi = iface.name.toLowerCase().includes('wi-fi');
    const isDisabled = iface.status === 'Disabled';

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onToggle) {
            onToggle(iface.id, isDisabled);
        }
    };

    return (
        <div className={`relative group/card transition-all duration-500 ${isDisabled ? 'opacity-60 saturate-50' : ''}`}>
            <button
                onClick={() => onClick(iface.id)}
                disabled={isToggling}
                className={`
              w-full flex items-center gap-4 p-3.5 rounded-2xl text-left transition-all duration-300 relative overflow-hidden border
              ${isSelected
                        ? 'bg-theme-bg-secondary border-theme-brand-primary/50 shadow-lg shadow-theme-brand-primary/10 ring-1 ring-theme-brand-primary/20'
                        : 'bg-transparent border-transparent text-theme-text-muted hover:bg-theme-bg-secondary hover:border-theme-border-secondary hover:shadow-sm'
                    }
          `}
            >
                <div className={`
            flex items-center justify-center w-11 h-11 rounded-xl shrink-0 transition-all duration-500
            ${isSelected
                        ? 'bg-theme-brand-primary text-white shadow-lg shadow-theme-brand-primary/30 rotate-12 group-hover/card:rotate-0'
                        : 'bg-theme-bg-tertiary text-theme-text-muted group-hover/card:bg-theme-brand-primary/10 group-hover/card:text-theme-brand-primary'
                    }
        `}>
                    {isWifi ? <Wifi size={20} /> : <Network size={20} />}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-sm font-bold truncate transition-colors ${isSelected
                            ? 'text-theme-text-primary'
                            : 'text-theme-text-secondary group-hover/card:text-theme-text-primary'
                            }`}>
                            {iface.name}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`text-[11px] truncate font-mono tracking-tight transition-colors ${isSelected ? 'text-theme-text-secondary' : 'text-theme-text-muted'}`}>
                            {isDisabled ? 'Offline' : iface.currentIp}
                        </span>
                    </div>
                </div>

                {/* Status indicator for selected */}
                {isSelected && (
                    <div className="absolute top-0 right-0 p-1">
                        <Activity size={10} className="text-brand-500 opacity-50" />
                    </div>
                )}
            </button>

            {/* Toggle Button Overlay */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-x-2 group-hover/card:translate-x-0">
                <button
                    onClick={handleToggle}
                    disabled={isToggling}
                    className={`p-2.5 rounded-xl shadow-xl border backdrop-blur-md transition-all active:scale-90 ${isDisabled
                        ? 'bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-600'
                        : 'bg-theme-bg-secondary text-rose-500 border-theme-border-primary hover:bg-rose-500 hover:text-white hover:border-transparent'
                        }`}
                    title={isDisabled ? "Enable Interface" : "Disable Interface"}
                >
                    <Power size={14} className={isToggling ? 'animate-spin' : ''} />
                </button>
            </div>
        </div>
    );
};
