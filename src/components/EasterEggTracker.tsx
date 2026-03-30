import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Sparkles } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

export const TOTAL_EGGS = 8;

export type EasterEggId = 'konami' | 'admin' | 'localhost' | 'teapot' | 'matrix' | 'egg6' | 'egg7' | 'egg8';

interface EasterEggTrackerProps {
    theme: string;
    language: string;
}

export const EasterEggTracker: React.FC<EasterEggTrackerProps> = ({ theme, language }) => {
    const t = useMemo(() => TRANSLATIONS[language] || TRANSLATIONS['en'], [language]);
    const [discoveredEggs, setDiscoveredEggs] = useLocalStorage<EasterEggId[]>('NetMajik_easter_eggs', []);
    const [showAnimation, setShowAnimation] = useState(false);
    const [lastDiscovered, setLastDiscovered] = useState<string | null>(null);
    const [activeOverlay, setActiveOverlay] = useState<EasterEggId | null>(null);
    const [showAllFound, setShowAllFound] = useState(false);
    const [showGlitch, setShowGlitch] = useState(false);

    // 10 Right Clicks to Reset
    useEffect(() => {
        let rightClickCount = 0;
        let rightClickTimer: NodeJS.Timeout | null = null;

        const handleContextMenu = (_e: MouseEvent) => {
            // Only count if it's an actual right click on the document/window
            rightClickCount++;

            if (rightClickCount >= 10) {
                // Trigger Glitch animation instead of instant silent clear
                setShowGlitch(true);
                setTimeout(() => {
                    setDiscoveredEggs([]);
                    setShowAllFound(false);
                    setShowGlitch(false);
                }, 3500); // Glitch stays for 3.5s before fully clearing and hiding

                rightClickCount = 0;
                console.log(t.easterEggsResetConsole);
            }

            if (rightClickTimer) clearTimeout(rightClickTimer);
            rightClickTimer = setTimeout(() => {
                rightClickCount = 0;
            }, 800); // Need to click fast (within 0.8s of each other)
        };

        window.addEventListener('contextmenu', handleContextMenu);
        return () => window.removeEventListener('contextmenu', handleContextMenu);
    }, [setDiscoveredEggs, setShowAllFound]);

    const discoverEgg = useCallback((id: EasterEggId, name: string) => {
        let isNew = false;
        let newDiscovered = [...discoveredEggs];
        if (!discoveredEggs.includes(id)) {
            newDiscovered.push(id);
            setDiscoveredEggs(newDiscovered);
            isNew = true;
        }

        setLastDiscovered(name);
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 5000);

        // Show specific overlay for easter egg
        if (id !== 'egg8') { // Rickroll already opens browser, skip overlay
            setActiveOverlay(id);
            setTimeout(() => setActiveOverlay(null), id === 'matrix' ? 5000 : 4000);
        }

        // Check if all eggs are found only on new discovery
        if (isNew && newDiscovered.length >= TOTAL_EGGS) {
            setTimeout(() => setShowAllFound(true), 2000);
        }
    }, [discoveredEggs, setDiscoveredEggs]);

    // Konami Code Logic
    useEffect(() => {
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let konamiIndex = 0;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

            if (e.key === konamiCode[konamiIndex] || e.key.toLowerCase() === konamiCode[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === konamiCode.length) {
                    discoverEgg('konami', t.eggKonamiName);
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [discoverEgg]);

    // Theme Image Map
    const themeEggMap: Record<string, string> = {
        dark: './egg_dark.png',
        light: './egg_light.png',
        matrix: './egg_matrix.png',
        sakura: './egg_sakura.png',
    };
    const eggSrc = themeEggMap[theme] || './egg_dark.png';

    // Custom Event Listener for other eggs
    useEffect(() => {
        const handleEggDiscovery = (e: Event) => {
            const customEvent = e as CustomEvent<{ id: EasterEggId, name: string }>;
            const id = customEvent.detail.id;

            // Map ID to correct translated name, ignoring hardcoded event names
            let translatedName = customEvent.detail.name;
            switch (id) {
                case 'konami': translatedName = t.eggKonamiName; break;
                case 'admin': translatedName = t.eggAdminName; break;
                case 'localhost': translatedName = t.eggLocalhostName; break;
                case 'teapot': translatedName = t.eggTeapotName; break;
                case 'matrix': translatedName = t.eggMatrixName; break;
                case 'egg6': translatedName = t.eggHomeName; break;
                case 'egg7': translatedName = t.eggPingName; break;
                case 'egg8': translatedName = t.eggRickrollName; break;
            }

            discoverEgg(id, translatedName);
        };

        window.addEventListener('easter-egg', handleEggDiscovery);
        return () => window.removeEventListener('easter-egg', handleEggDiscovery);
    }, [discoverEgg, t]);

    if (discoveredEggs.length === 0 && !showAnimation && !activeOverlay && !showGlitch) return null;

    return (
        <>
            {/* --- Glitch Reset Effect --- */}
            {showGlitch && (
                <div className="fixed inset-0 z-[9999] pointer-events-auto flex flex-col items-center justify-center bg-black overflow-hidden select-none">
                    {/* RGB Split Background Effects */}
                    <div className="absolute inset-0 bg-red-600/30 mix-blend-screen translate-x-3 translate-y-1 animate-pulse" style={{ animationDuration: '0.1s' }}></div>
                    <div className="absolute inset-0 bg-blue-600/30 mix-blend-screen -translate-x-3 -translate-y-2 animate-pulse" style={{ animationDuration: '0.15s' }}></div>

                    {/* VHS Static Lines */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)' }}></div>

                    {/* Glitch Content */}
                    <div className="z-10 text-center animate-shake" style={{ animationDuration: '0.3s' }}>
                        <div className="text-8xl md:text-[10rem] mb-6 md:mb-12 translate-x-[-10px] skew-x-[20deg] opacity-90 text-white drop-shadow-[5px_5px_0_red] [-webkit-text-stroke:2px_#fff]">
                            _▒▓█ ERROR █▓▒_
                        </div>
                        <p className="text-2xl md:text-4xl text-emerald-400 font-mono font-black px-6 py-4 max-w-5xl leading-relaxed 
                                      drop-shadow-[3px_0_0_teal] bg-black/60 border-l-8 border-r-8 border-red-600/90 uppercase tracking-widest skew-x-[-5deg]">
                            {t.eggGlitchReset}
                        </p>
                    </div>
                </div>
            )}

            {/* --- Easter Egg Overlays --- */}
            {activeOverlay === 'konami' && (
                <div className="fixed inset-0 z-[200] pointer-events-none flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-gradient-to-r from-teal-500/20 via-emerald-500/40 to-teal-500/20 p-12 rounded-3xl border-2 border-emerald-400 shadow-[0_0_100px_rgba(52,211,153,0.5)] text-center animate-pulse duration-700">
                        <h1 className="text-6xl font-black text-white mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] tracking-widest uppercase">
                            {t.eggGodModeActive}
                        </h1>
                        <p className="text-2xl text-emerald-300 font-mono font-bold mx-auto max-w-2xl bg-black/60 py-3 px-6 rounded-xl border border-emerald-500/50 shadow-inner">
                            {t.eggGodModeStats}
                        </p>
                    </div>
                </div>
            )}

            {activeOverlay === 'teapot' && (
                <div className="fixed inset-0 z-[200] pointer-events-none flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in text-emerald-400 font-mono">
                    <pre className="text-sm md:text-xl font-bold leading-tight mb-6 animate-bounce">
                        {`
               ;,'
       _o_    ;:;'
   ,-.'---\`.__ ;
  ((j\`=====',-'
   \`-\\     /
      \`-=-'     
                        `}
                    </pre>
                    <p className="text-2xl font-bold">{t.eggTeapotError}</p>
                </div>
            )}

            {activeOverlay === 'matrix' && (
                <div className="fixed inset-0 z-[200] pointer-events-none flex flex-col items-center justify-center bg-black animate-fade-in font-mono overflow-hidden">
                    {/* Fake generic matrix falling texts */}
                    <div className="absolute inset-0 opacity-40" style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.9)), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ctext y='20' x='0' fill='%2300ff00' opacity='0.4' font-family='monospace' font-size='15'%3E0 1 0 1 0 1%3C/text%3E%3Ctext y='40' x='10' fill='%2300ff00' opacity='0.2' font-family='monospace' font-size='15'%3E1 0 1 0 1 0%3C/text%3E%3C/svg%3E")`,
                        backgroundSize: '200px 200px',
                        animation: 'matrix-scroll 5s linear infinite'
                    }} />
                    <div className="z-10 bg-black/80 border border-emerald-500/30 p-8 rounded-xl shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                        <p className="text-4xl text-emerald-500 font-bold drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]">{t.eggMatrixWake}</p>
                    </div>
                </div>
            )}

            {activeOverlay === 'egg6' && ( // Home Sweet Home
                <div className="fixed inset-0 z-[200] pointer-events-none flex flex-col items-center justify-center bg-black/80 animate-fade-in">
                    <div className="p-10 bg-gradient-to-br from-sky-900/60 to-blue-900/60 border border-sky-400 rounded-3xl shadow-[0_0_80px_rgba(56,189,248,0.5)] text-center rotate-0 hover:scale-105 transition-all">
                        <div className="text-7xl mb-6">🏡</div>
                        <h2 className="text-3xl text-sky-200 font-bold mb-2">{t.eggHomeNoPlace}</h2>
                        <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-400 font-mono tracking-widest">127.0.0.1</p>
                    </div>
                </div>
            )}

            {activeOverlay === 'localhost' && ( // Diagnostico Existencial
                <div className="fixed inset-0 z-[200] pointer-events-none flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-purple-900/50 to-black animate-fade-in">
                    <div className="text-center p-12 bg-black/50 backdrop-blur-md border border-purple-500/30 rounded-[3rem] shadow-[0_0_100px_rgba(168,85,247,0.5)]">
                        <div className="text-5xl mb-4 animate-pulse">🌌</div>
                        <h2 className="text-3xl text-purple-300 font-serif italic mb-4 font-bold">{t.eggExistentialTalk}</h2>
                        <p className="text-xl text-purple-400/80 font-mono bg-purple-900/30 py-2 px-6 rounded-lg inline-block">{t.eggExistentialLatency}</p>
                    </div>
                </div>
            )}

            {activeOverlay === 'egg7' && ( // Ping of death
                <div className="fixed inset-0 z-[200] pointer-events-none flex flex-col items-center justify-center bg-red-950/90 animate-shake">
                    <div className="text-center">
                        <div className="text-9xl mb-6 drop-shadow-[0_0_50px_rgba(239,68,68,1)] animate-bounce duration-200">💀</div>
                        <h1 className="text-6xl font-black text-red-500 tracking-widest uppercase animate-pulse mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">{t.eggEliteDetected}</h1>
                        <div className="inline-block border border-red-500/50 bg-black/60 py-3 px-8 rounded-xl">
                            <p className="text-2xl text-red-400 font-mono font-bold">{t.eggEliteWelcome}</p>
                        </div>
                    </div>
                </div>
            )}

            {activeOverlay === 'admin' && ( // Admin Secreto
                <div className="fixed inset-0 z-[200] pointer-events-none flex flex-col items-center justify-center bg-amber-950/80 animate-fade-in">
                    <div className="text-center p-12 bg-gradient-to-b from-amber-600/30 to-amber-900/30 border-2 border-amber-400 rounded-2xl shadow-[0_0_150px_rgba(251,191,36,0.6)] backdrop-blur-sm animate-[bounce_1s_infinite]">
                        <div className="text-7xl mb-6 drop-shadow-[0_0_20px_rgba(251,191,36,1)]">⭐</div>
                        <h1 className="text-5xl font-black text-amber-300 tracking-widest uppercase mb-4 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">{t.eggLevelUp}</h1>
                        <p className="text-2xl text-amber-200 font-bold tracking-wider border-t border-amber-500/50 pt-6 mt-2">{t.eggPrivileges}</p>
                    </div>
                </div>
            )}
            {/* --------------------------- */}

            {/* Tracker Bottom Right */}
            {(discoveredEggs.length > 0 || showAnimation) && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto">
                    {/* Notification Pop */}
                    {showAnimation && lastDiscovered && (
                        <div className="bg-theme-bg-secondary border-2 border-theme-brand-primary shadow-xl shadow-theme-brand-primary/20 rounded-xl p-4 flex items-center gap-4 animate-bounce">
                            <Sparkles className="text-theme-brand-primary" size={24} />
                            <div>
                                <p className="text-xs text-theme-text-muted font-bold uppercase tracking-wider">{t.easterEggFound}</p>
                                <p className="text-base font-bold text-theme-text-primary">{lastDiscovered}</p>
                            </div>
                        </div>
                    )}

                    {/* Egg Icon + Counter */}
                    <div className="group relative flex items-center gap-3 bg-theme-bg-secondary/95 backdrop-blur-md border border-theme-border-primary rounded-2xl px-4 py-2 hover:border-theme-brand-primary transition-all cursor-pointer shadow-lg shadow-black/20 hover:-translate-y-1">
                        <div className="relative">
                            <img src={eggSrc} alt="Easter Egg" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_var(--color-brand-primary)] group-hover:drop-shadow-[0_0_12px_var(--color-brand-primary)] group-hover:scale-110 transition-all duration-300" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest leading-none">{t.easterEggsSecrets}</span>
                            <span className="text-lg font-black text-theme-text-primary leading-none tracking-wider mt-1">
                                {discoveredEggs.length}<span className="text-theme-text-muted/50 text-sm">/{TOTAL_EGGS}</span>
                            </span>
                        </div>

                        {/* Tooltip Content */}
                        <div className="absolute bottom-full right-0 pb-3 w-72 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none group-hover:pointer-events-auto">
                            <div className="bg-theme-bg-tertiary border border-theme-border-primary shadow-2xl rounded-xl p-4">
                                <h4 className="font-bold text-theme-brand-primary mb-2 flex items-center gap-2"><Sparkles size={16} /> {t.easterEggsHunter}</h4>
                                <p className="text-xs text-theme-text-muted mb-3 font-medium">{t.easterEggsDesc.replace('$total', TOTAL_EGGS.toString())}</p>
                                <div
                                    className="w-full bg-theme-bg-primary h-2 rounded-full overflow-hidden mb-4 cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_10px_var(--color-brand-primary)] transition-all"
                                    title={t.easterEggsResetTitle}
                                >
                                    <div
                                        className="h-full bg-theme-brand-primary transition-all duration-500"
                                        style={{ width: `${(discoveredEggs.length / TOTAL_EGGS) * 100}%` }}
                                    />
                                </div>

                                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                    {[
                                        { id: 'konami', name: t.eggKonamiName, hint: t.eggKonamiHint },
                                        { id: 'admin', name: t.eggAdminName, hint: t.eggAdminHint },
                                        { id: 'localhost', name: t.eggLocalhostName, hint: t.eggLocalhostHint },
                                        { id: 'teapot', name: t.eggTeapotName, hint: t.eggTeapotHint },
                                        { id: 'matrix', name: t.eggMatrixName, hint: t.eggMatrixHint },
                                        { id: 'egg6', name: t.eggHomeName, hint: t.eggHomeHint },
                                        { id: 'egg7', name: t.eggPingName, hint: t.eggPingHint },
                                        { id: 'egg8', name: t.eggRickrollName, hint: t.eggRickrollHint }
                                    ].map((egg) => (
                                        <div key={egg.id} className="flex items-center justify-between bg-theme-bg-primary/50 p-2 rounded-lg border border-theme-border-secondary">
                                            <div className="flex flex-col">
                                                <span className={`text-xs font-bold ${discoveredEggs.includes(egg.id as EasterEggId) ? 'text-theme-text-primary' : 'text-theme-text-muted blur-[2px] select-none'}`}>
                                                    {discoveredEggs.includes(egg.id as EasterEggId) ? egg.name : '???????????'}
                                                </span>
                                                {discoveredEggs.includes(egg.id as EasterEggId) && <span className="text-[9px] text-theme-brand-primary uppercase">{egg.hint}</span>}
                                            </div>
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${discoveredEggs.includes(egg.id as EasterEggId) ? 'bg-emerald-500/20 text-emerald-500' : 'bg-theme-bg-secondary text-theme-text-muted/30'}`}>
                                                {discoveredEggs.includes(egg.id as EasterEggId) ? '✓' : '?'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* All Eggs Found Celebration Array */}
            {showAllFound && (
                <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in" onClick={() => setShowAllFound(false)}>
                    <div className="bg-gradient-to-br from-theme-bg-secondary to-theme-bg-tertiary p-10 rounded-3xl border border-theme-brand-primary shadow-[0_0_150px_var(--color-brand-primary)] text-center max-w-lg mx-4 rotate-0 hover:scale-105 transition-transform duration-500 relative overflow-hidden group">

                        {/* Spinning rays background in the card */}
                        <div className="absolute inset-0 opacity-20 bg-[conic-gradient(from_0deg,transparent_0_340deg,var(--color-brand-primary)_360deg)] animate-[spin_4s_linear_infinite]"></div>

                        <Sparkles className="text-theme-brand-primary mx-auto mb-6 w-24 h-24 animate-pulse" />

                        <h2 className="text-4xl font-black text-white mb-2 tracking-tight uppercase">{t.eggMasterTitle}</h2>
                        <h3 className="text-xl font-bold text-theme-brand-primary mb-6">{t.eggMasterSubtitle}</h3>

                        <p className="text-theme-text-muted mb-8 leading-relaxed relative z-10 bg-theme-bg-primary/80 p-4 rounded-xl border border-theme-border-primary">
                            {t.eggMasterText}<span className="text-theme-text-primary font-bold">{t.eggMasterElite}</span>.
                        </p>

                        <button
                            className="bg-theme-brand-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-theme-brand-primary/30 hover:-translate-y-1 transition-all z-10 relative"
                            onClick={() => setShowAllFound(false)}
                        >
                            {t.eggMasterContinue}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
