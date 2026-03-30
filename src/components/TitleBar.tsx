import React from 'react';
import { Minus, Square, X } from 'lucide-react';
import { APP_VERSION } from '../constants';

interface TitleBarProps {
    theme?: string;
    t: any;
}

const themeIconMap: Record<string, string> = {
    dark: './Dark.PNG',
    light: './Light.PNG',
    matrix: './Matrix.PNG',
    sakura: './Sakura.PNG',
};

export const TitleBar: React.FC<TitleBarProps> = ({ theme = 'dark', t }) => {
    const [, setClickCount] = React.useState(0);
    const clickTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const handleVersionClick = () => {
        setClickCount(prev => {
            const newCount = prev + 1;
            if (newCount >= 5) {
                window.dispatchEvent(new CustomEvent('easter-egg', { detail: { id: 'admin', name: 'El Admin Secreto' } }));
                return 0;
            }
            return newCount;
        });

        // Reset click counter if there's a pause of more than 1 second
        if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = setTimeout(() => {
            setClickCount(0);
        }, 1000);
    };

    const handleAction = async (action: 'minimize' | 'maximize' | 'close') => {
        if (window.electronAPI) {
            await window.electronAPI.windowManage(action);
        }
    };

    const iconSrc = themeIconMap[theme] || './Dark.PNG';

    return (
        <div className="h-8 bg-theme-bg-secondary flex items-center justify-between select-none z-50 fixed top-0 left-0 right-0 border-b border-theme-border-primary" style={{ WebkitAppRegion: 'drag' } as any}>
            <div className="flex items-center gap-2 pl-3">
                <div className="w-4 h-4 overflow-hidden flex items-center justify-center">
                    <img
                        key={iconSrc}
                        src={iconSrc}
                        alt="NetMajik"
                        className="w-full h-full object-contain"
                        onLoad={(e) => {
                            e.currentTarget.style.display = 'block';
                            if (e.currentTarget.nextElementSibling) {
                                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'none';
                            }
                        }}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextElementSibling) {
                                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                            }
                        }}
                    />
                    <div style={{ display: 'none' }} className="w-full h-full items-center justify-center bg-theme-bg-tertiary">
                        <span className="text-[10px] font-bold">NR</span>
                    </div>
                </div>
                <span
                    className="text-[10px] font-bold text-theme-text-primary tracking-wider uppercase"
                >
                    NetMajik <span
                        className="text-theme-text-muted opacity-60 ml-1 cursor-pointer"
                        style={{ WebkitAppRegion: 'no-drag' } as any}
                        onClick={handleVersionClick}
                    >
                        v{APP_VERSION}
                    </span>
                    <span className="text-[9px] text-theme-brand-primary opacity-40 ml-2 font-black italic tracking-tighter">JonAmA</span>
                </span>
            </div>

            <div className="flex items-stretch h-full" style={{ WebkitAppRegion: 'no-drag' } as any}>
                <button
                    onClick={() => handleAction('minimize')}
                    className="px-4 hover:bg-theme-bg-hover text-theme-text-muted hover:text-theme-text-primary transition-colors flex items-center justify-center focus:outline-none"
                    title={t.minimize || "Minimize"}
                >
                    <Minus size={14} />
                </button>
                <button
                    onClick={() => handleAction('maximize')}
                    className="px-4 hover:bg-theme-bg-hover text-theme-text-muted hover:text-theme-text-primary transition-colors flex items-center justify-center focus:outline-none"
                    title={t.maximize || "Maximize"}
                >
                    <Square size={12} />
                </button>
                <button
                    onClick={() => handleAction('close')}
                    className="px-4 hover:bg-rose-500 hover:text-white text-theme-text-muted transition-colors flex items-center justify-center focus:outline-none"
                    title={t.close || "Close"}
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};
