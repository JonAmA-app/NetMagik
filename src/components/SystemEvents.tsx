import React, { useState, useEffect, useMemo } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { AlertTriangle, Loader2, DownloadCloud, Activity, Bug, RefreshCw, XCircle, Info, AlertCircle, Bot, Eye, EyeOff, Copy, Check, ExternalLink, Filter, HardDrive, Zap, Network, LayoutGrid, ChevronDown, ChevronUp, History } from 'lucide-react';

interface SystemEvent {
    id: number;
    date: string;
    source: string;
    message: string;
    level?: number;
    levelName?: string;
}

interface SystemEventsProps {
    language: Language;
}

export const SystemEvents: React.FC<SystemEventsProps> = ({ language }) => {
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
    const [events, setEvents] = useState<SystemEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [showIgnored, setShowIgnored] = useState(false);
    const [filterType, setFilterType] = useState<'all'|'storage'|'power'|'network'|'system'>('all');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    const toggleGroup = (key: string) => {
        setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const fetchEvents = async () => {
        setIsLoading(true);
        setErrorMsg(null);
        try {
            if (window.electronAPI) {
                const res = await window.electronAPI.getSystemEvents();
                if (res.success && res.events) {
                    setEvents(res.events);
                } else {
                    setErrorMsg(res.error || "Unknown error fetching events.");
                    setEvents([]);
                }
            }
        } catch (e: any) {
            console.error('Failed to fetch events:', e);
            setErrorMsg(e.message || "Failed to fetch events.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const exportToCSV = () => {
        if (events.length === 0) return;

        const headers = ["ID", "Level", t.eventDate || "Date", t.eventSource || "Source", t.eventMessage || "Message"];
        const rows = events.map(e => [
            e.id,
            `"${e.levelName || 'Unknown'}"`,
            `"${e.date}"`,
            `"${e.source}"`,
            `"${e.message.replace(/"/g, '""').replace(/\n/g, ' ')}"`
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `system_events_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const getEventIcon = (level?: number) => {
        switch (level) {
            case 1: return <XCircle size={24} className="text-red-500" />; // Critical
            case 2: return <AlertCircle size={24} className="text-rose-500" />; // Error
            case 3: return <AlertTriangle size={24} className="text-amber-500" />; // Warning
            default: return <Info size={24} className="text-blue-500" />;
        }
    };

    const handleCopyPrompt = (prompt: string, uniqueId: string) => {
        navigator.clipboard.writeText(prompt);
        setCopiedId(uniqueId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    /**
     * Translates technical system logs and provides AI prompts
     */
    const translateError = (ev: SystemEvent) => {
        const msg = (ev.message || '').toLowerCase();
        const src = (ev.source || '').toLowerCase();
        
        let isIgnored = false;
        
        // 1. Detect if it's an irrelevant/spammy error
        if (
            src.includes('distributedcom') || msg.includes('dcom') || ev.id === 10016 || ev.id === 10010 ||
            msg.includes('suspensión') || msg.includes('sleep') || msg.includes('standby') ||
            msg.includes('perdió la comunicación') || msg.includes('loss of communication') ||
            src.includes('bthusb') || src.includes('bthport') || msg.includes('disconnected') || msg.includes('desconectado')
        ) {
            isIgnored = true;
            return {
                isIgnored,
                title: t.ignoredEventTitle || (language === 'es' ? "Evento Normal (Ignorado)" : "Normal Event (Ignored)"),
                desc: t.ignoredEventDesc || (language === 'es' ? "Aviso técnico o evento de rutina. Puedes ignorarlo con seguridad." : "Technical notice or routine event. You can safely ignore this.")
            };
        }

        // 2. Generate a helpful AI prompt for relevant errors
        let aiPrompt = t.aiPromptDefault || (language === 'es' 
            ? `Actúa como un experto en soporte IT de Windows. Tengo el siguiente error en mi Visor de Eventos:\n\nOrigen: {source}\nID del Evento: {id}\nMensaje: {message}...\n\n¿Podrías explicarme de forma sencilla qué significa esto y cuáles son los pasos exactos para solucionarlo?`
            : `Act as a Windows IT support expert. I have the following error in my Event Viewer:\n\nSource: {source}\nEvent ID: {id}\nMessage: {message}...\n\nCould you explain simply what this means and give me exact steps to fix it?`);
        
        aiPrompt = aiPrompt.replace('{source}', ev.source).replace('{id}', ev.id.toString()).replace('{message}', ev.message.substring(0, 300));

        if (ev.id === 1001 || src.includes('bugcheck')) {
            let aiPromptBsod = t.aiPromptBsod || (language === 'es' 
                ? `Actúa como un experto en soporte IT de Windows. He sufrido un pantallazo azul (BSOD) (BugCheck ID: {id}). El código de error completo es: \n\n{message}...\n\n¿Puedes decirme qué archivo o módulo está causando esto y cómo solucionarlo?`
                : `Act as a Windows IT support expert. I had a Blue Screen (BSOD) (BugCheck ID: {id}). The error code is: \n\n{message}...\n\nCan you tell me which file or module caused this and how to fix it?`);
            aiPromptBsod = aiPromptBsod.replace('{id}', ev.id.toString()).replace('{message}', ev.message.substring(0, 500));

            return {
                isIgnored,
                title: t.bsodTitle || (language === 'es' ? "¡Pantallazo Azul (BSOD)!" : "Blue Screen of Death (BSOD)!"),
                desc: t.bsodDesc || (language === 'es' ? "El sistema se bloqueó gravemente por un error interno o de drivers." : "The system crashed severely due to an internal or driver error."),
                aiPrompt: aiPromptBsod
            };
        }

        if (msg.includes('disk') || msg.includes('disco')) {
            return {
                isIgnored,
                title: t.storageAlertTitle || (language === 'es' ? "Alerta de Almacenamiento" : "Storage Alert"),
                desc: t.storageAlertDesc || (language === 'es' ? "Posible problema con el disco duro o una unidad defectuosa." : "Potential issue with the hard disk or a faulty drive."),
                aiPrompt
            };
        }
        if (msg.includes('volsnap') || msg.includes('shadow copy')) {
            return {
                isIgnored,
                title: t.vssAlertTitle || (language === 'es' ? "Copia de Seguridad/VSS" : "Windows Backup/VSS"),
                desc: t.vssAlertDesc || (language === 'es' ? "Fallo al crear un punto de restauración del sistema." : "Failed to create a system restore point."),
                aiPrompt
            };
        }
        if (src.includes('kernel-power')) {
            return {
                isIgnored,
                title: t.powerAlertTitle || (language === 'es' ? "Reinicio Inesperado" : "Unexpected Reboot"),
                desc: t.powerAlertDesc || (language === 'es' ? "El PC se apagó bruscamente (corte de luz o fallo)." : "PC was turned off suddenly (power failure or crash)."),
                aiPrompt
            };
        }
        
        // Default for other relevant errors
        return {
            isIgnored,
            title: t.defaultAlertTitle || (language === 'es' ? "Error del Sistema Relevante" : "Relevant System Error"),
            desc: t.defaultAlertDesc || (language === 'es' ? "Este evento puede afectar la estabilidad. Pregunta a una IA para buscar una solución." : "This event might affect stability. Ask an AI for a solution."),
            aiPrompt
        };
    };

    const filteredEvents = useMemo(() => {
        return events.map(ev => ({ ev, info: translateError(ev) }))
                     .filter(item => {
                         // Filter ignored
                         if (!showIgnored && item.info?.isIgnored) return false;
                         
                         // Filter by category
                         if (filterType === 'all') return true;
                         
                         const msg = (item.ev.message || '').toLowerCase();
                         const src = (item.ev.source || '').toLowerCase();
                         
                         if (filterType === 'storage') return msg.includes('disk') || msg.includes('disco') || src.includes('disk') || msg.includes('volsnap') || msg.includes('shadow copy');
                         if (filterType === 'power') return src.includes('kernel-power');
                         if (filterType === 'network') return src.includes('tcpip') || src.includes('wlan') || src.includes('netwtw') || msg.includes('network');
                         if (filterType === 'system') return src.includes('bugcheck') || item.ev.id === 1001 || src.includes('service control');
                         
                         return false;
                     });
    }, [events, showIgnored, filterType, language]);

    const ignoredCount = events.length - filteredEvents.length;

    const groupedEvents = useMemo(() => {
        const groups: Record<string, { item: typeof filteredEvents[0], occurrences: string[], key: string }> = {};
        
        filteredEvents.forEach(item => {
            const key = `${item.ev.id}-${item.ev.source}-${item.ev.message.substring(0, 100)}`;
            if (!groups[key]) {
                groups[key] = { item, occurrences: [item.ev.date], key };
            } else {
                groups[key].occurrences.push(item.ev.date);
            }
        });
        
        return Object.values(groups);
    }, [filteredEvents]);

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500 pt-0">
            <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
                            <Bug size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-theme-text-primary">
                                {t.systemEvents || "Eventos del Sistema"}
                            </h2>
                            <p className="text-sm text-theme-text-muted mt-1 leading-relaxed">
                                {t.systemEventsSub || (language === 'es' 
                                    ? "Filtrado inteligente de problemas críticos de Windows" 
                                    : "Smart filtering for critical Windows issues")}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {ignoredCount > 0 && !showIgnored && (
                            <span className="text-xs text-theme-text-muted mr-2">
                                ({ignoredCount} {t.hidden || (language === 'es' ? "ocultos" : "hidden")})
                            </span>
                        )}
                        <button
                            onClick={() => setShowIgnored(!showIgnored)}
                            className="px-4 py-2 bg-theme-bg-tertiary hover:bg-theme-bg-hover text-theme-text-primary rounded-lg transition-colors border border-theme-border-primary flex items-center gap-2 text-xs font-bold"
                        >
                            {showIgnored ? <EyeOff size={16} /> : <Eye size={16} />}
                            {showIgnored 
                                ? t.hideIgnored || (language === 'es' ? "Ocultar ignorados" : "Hide ignored") 
                                : t.showIgnored || (language === 'es' ? "Mostrar ignorados" : "Show ignored")}
                        </button>
                        <button
                            onClick={fetchEvents}
                            disabled={isLoading}
                            className="px-4 py-2 bg-theme-bg-tertiary hover:bg-theme-bg-hover text-theme-text-primary rounded-lg transition-colors border border-theme-border-primary flex items-center gap-2 text-xs font-bold disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> {(t as any).refresh || "Refrescar"}
                        </button>
                        <button
                            onClick={exportToCSV}
                            disabled={events.length === 0 || isLoading}
                            className="px-4 py-2 bg-theme-bg-tertiary hover:bg-theme-bg-hover text-theme-text-secondary rounded-lg transition-colors border border-theme-border-primary flex items-center gap-2 text-xs font-bold disabled:opacity-50"
                        >
                            <DownloadCloud size={16} /> {t.exportCsv || "Exportar CSV"}
                        </button>
                        <button
                            onClick={() => { if (window.electronAPI) window.electronAPI.openEventViewer(); }}
                            className="px-4 py-2 bg-theme-bg-tertiary hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition-colors border border-theme-border-primary flex items-center gap-2 text-xs font-bold group shadow-sm"
                            title={t.openOfficialViewerLabel || (language === 'es' ? "Abrir Visor de Eventos de Windows" : "Open Windows Event Viewer")}
                        >
                            <ExternalLink size={16} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" /> 
                            {t.officialViewer || (language === 'es' ? "Visor Oficial" : "Official Viewer")}
                        </button>
                    </div>
                </div>
                
                {/* Chip Filters */}
                {events.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-theme-border-secondary">
                        <Filter size={14} className="text-theme-text-muted mx-1" />
                        <button onClick={() => setFilterType('all')} className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${filterType === 'all' ? 'bg-theme-brand-primary text-white' : 'hover:bg-theme-bg-tertiary text-theme-text-muted bg-theme-bg-primary border border-theme-border-primary'}`}>
                            <LayoutGrid size={12} /> {t.filterAll || (language === 'es' ? "Todos" : "All")}
                        </button>
                        <button onClick={() => setFilterType('storage')} className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${filterType === 'storage' ? 'bg-theme-brand-primary text-white' : 'hover:bg-theme-bg-tertiary text-theme-text-muted bg-theme-bg-primary border border-theme-border-primary'}`}>
                            <HardDrive size={12} /> {t.filterStorage || (language === 'es' ? "Almacenamiento" : "Storage")}
                        </button>
                        <button onClick={() => setFilterType('power')} className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${filterType === 'power' ? 'bg-theme-brand-primary text-white' : 'hover:bg-theme-bg-tertiary text-theme-text-muted bg-theme-bg-primary border border-theme-border-primary'}`}>
                            <Zap size={12} /> {t.filterPower || (language === 'es' ? "Energía" : "Power")}
                        </button>
                        <button onClick={() => setFilterType('network')} className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${filterType === 'network' ? 'bg-theme-brand-primary text-white' : 'hover:bg-theme-bg-tertiary text-theme-text-muted bg-theme-bg-primary border border-theme-border-primary'}`}>
                            <Network size={12} /> {t.filterNetwork || (language === 'es' ? "Red" : "Network")}
                        </button>
                        <button onClick={() => setFilterType('system')} className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${filterType === 'system' ? 'bg-theme-brand-primary text-white' : 'hover:bg-theme-bg-tertiary text-theme-text-muted bg-theme-bg-primary border border-theme-border-primary'}`}>
                            <AlertTriangle size={12} /> {t.filterSystem || (language === 'es' ? "Sistema/Crash" : "System/Crash")}
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-xl overflow-hidden shadow-sm">
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar min-h-[300px]">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-theme-text-muted gap-4">
                            <Loader2 size={48} className="animate-spin text-rose-500" />
                            <p className="font-medium">{t.retrievingEvents || "Cargando eventos de Windows..."}</p>
                        </div>
                    ) : errorMsg ? (
                        <div className="py-20 flex flex-col items-center justify-center text-theme-text-muted gap-4 px-6 text-center">
                            <XCircle size={48} className="text-red-500 opacity-80" />
                            <p className="text-lg font-bold text-red-500">{t.errorReadingEvents || "Error leyendo eventos"}</p>
                            <p className="text-sm mt-1 max-w-md bg-theme-bg-tertiary p-3 rounded border border-red-500/20 text-red-400 font-mono text-xs">{errorMsg}</p>
                            <button onClick={fetchEvents} className="mt-4 text-xs bg-theme-bg-tertiary border border-theme-border-primary px-4 py-2 rounded-lg hover:bg-theme-bg-hover transition-colors font-bold flex items-center gap-2">
                                <RefreshCw size={14} /> {t.retry || "Reintentar"}
                            </button>
                        </div>
                    ) : groupedEvents.length > 0 ? (
                        <div className="flex flex-col">
                            {groupedEvents.map(({ item, occurrences, key }, groupIdx) => {
                                const { ev, info } = item;
                                const isExpanded = expandedGroups[key];
                                const hasMultiple = occurrences.length > 1;
                                const isCopied = copiedId === `${ev.id}-${groupIdx}`;
                                
                                return (
                                    <div key={key} className={`border-b transition-colors flex flex-col ${info?.isIgnored ? "bg-theme-bg-primary/50 border-theme-border-secondary opacity-70 grayscale" : "border-theme-border-secondary hover:bg-theme-bg-hover"}`}>
                                        <div className="p-4 flex gap-4">
                                            <div className="mt-1 flex-shrink-0">
                                                {info?.isIgnored ? <Info size={24} className="text-theme-text-muted" /> : getEventIcon(ev.level)}
                                            </div>
                                            <div className="flex flex-col gap-1 w-full overflow-hidden">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-theme-text-primary truncate">{ev.source}</h4>
                                                        {hasMultiple && (
                                                            <span className="text-[10px] font-bold bg-theme-brand-primary/10 text-theme-brand-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                <History size={10} /> {occurrences.length} {language === 'es' ? 'veces' : 'times'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-mono whitespace-nowrap bg-theme-bg-tertiary rounded px-2 py-0.5 text-theme-text-muted border border-theme-border-primary">{ev.date}</span>
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-2 items-center mt-1">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border transition-colors ${
                                                        info?.isIgnored ? "bg-theme-bg-tertiary border-theme-border-primary text-theme-text-muted" :
                                                        ev.level === 1 ? "bg-red-500/10 border-red-500/20 text-red-500" :
                                                        ev.level === 2 ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                                                        "bg-theme-bg-tertiary border-theme-border-secondary text-theme-text-muted"
                                                    }`}>
                                                        {ev.levelName || "Desconocido"}
                                                    </span>
                                                    <p className="text-[12px] font-mono text-theme-text-muted uppercase tracking-widest">{t.eventId || "ID Evento"}: {ev.id}</p>
                                                    
                                                    {hasMultiple && (
                                                        <button 
                                                            onClick={() => toggleGroup(key)}
                                                            className="text-[10px] font-bold text-theme-brand-primary flex items-center gap-1 ml-auto hover:underline"
                                                        >
                                                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                                            {isExpanded 
                                                                ? (language === 'es' ? 'Ocultar historial' : 'Hide history') 
                                                                : (language === 'es' ? 'Ver historial' : 'Show history')}
                                                        </button>
                                                    )}
                                                </div>
                                                
                                                {isExpanded && hasMultiple && (
                                                    <div className="mt-2 p-3 bg-theme-bg-primary/50 border border-theme-border-primary rounded-lg">
                                                        <p className="text-[10px] uppercase font-bold text-theme-text-muted mb-2 flex items-center gap-1">
                                                            <History size={12} /> {language === 'es' ? 'Ocurrencias detectadas' : 'Detected occurrences'}
                                                        </p>
                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                            {occurrences.map((date, dIdx) => (
                                                                <div key={dIdx} className="text-[9px] font-mono bg-theme-bg-tertiary px-2 py-1 rounded text-theme-text-secondary border border-theme-border-secondary">
                                                                    {date}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {info && (
                                                    <div className={`mt-3 p-3 rounded-lg flex flex-col gap-2 ${info.isIgnored ? "bg-theme-bg-tertiary border border-theme-border-primary" : "bg-blue-500/5 border border-blue-500/20"}`}>
                                                        <div className="flex gap-2 items-start">
                                                            <Info size={16} className={`mt-0.5 shrink-0 ${info.isIgnored ? "text-theme-text-muted" : "text-blue-500"}`} />
                                                            <div>
                                                                <p className={`text-xs font-bold uppercase tracking-tighter ${info.isIgnored ? "text-theme-text-muted" : "text-blue-500"}`}>{info.title}</p>
                                                                <p className="text-xs text-theme-text-secondary mt-0.5 leading-relaxed">{info.desc}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        {!info.isIgnored && info.aiPrompt && (
                                                            <div className="mt-2 pt-2 border-t border-blue-500/10 flex items-center justify-between gap-6 bg-theme-bg-primary rounded p-2">
                                                                <div className="flex gap-2 items-center text-xs text-theme-text-muted">
                                                                    <Bot size={14} className="text-emerald-500" />
                                                                    <span>{t.dontKnowHowToFix || (language === 'es' ? "¿No sabes cómo resolverlo?" : "Don't know how to fix it?")}</span>
                                                                </div>
                                                                <button 
                                                                    onClick={() => handleCopyPrompt(info.aiPrompt!, `${ev.id}-${groupIdx}`)}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded font-bold text-xs transition-colors shrink-0"
                                                                >
                                                                    {isCopied ? <Check size={14} /> : <Copy size={14} />}
                                                                    {isCopied 
                                                                        ? t.copied || (language === 'es' ? "¡Copiado!" : "Copied!") 
                                                                        : t.copyAiPrompt || (language === 'es' ? "Copiar Prompt IA" : "Copy AI Prompt")}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {!info?.isIgnored && (
                                                    <p className="text-sm text-theme-text-primary mt-3 whitespace-pre-wrap break-words line-clamp-2 hover:line-clamp-none transition-all cursor-help bg-black/5 p-2 rounded border border-white/5 font-mono text-xs">
                                                        {ev.message || t.noDescriptionAvailable || "Sin detalles disponibles."}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-20 text-center text-theme-text-muted flex flex-col items-center">
                            <Activity size={48} className="mx-auto mb-4 opacity-10 text-emerald-500" />
                            <p className="text-lg font-bold">{t.pcIsClean || "System Clean!"}</p>
                            <p className="text-sm mt-1">
                                {t.noRelevantErrors || (language === 'es' 
                                    ? "No hay errores relevantes. (Todos los reportes actuales fueron ignorados de forma segura)." 
                                    : "No relevant errors found. (All current reports were safely ignored).")}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
