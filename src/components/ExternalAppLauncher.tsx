
import React, { useState, useRef, useEffect } from 'react';
import { ExternalApp, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import {
    Zap,
    Plus,
    Settings2,
    Terminal,
    Activity,
    Cpu,
    Network,
    Monitor,
    X,
    FolderOpen,
    Save,
    ChevronLeft,
    ChevronRight,
    Search
} from 'lucide-react';

interface ExternalAppLauncherProps {
    apps: ExternalApp[];
    onUpdateApps: (apps: ExternalApp[]) => void;
    language: Language;
    onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const FALLBACK_ICONS: Record<string, React.ReactNode> = {
    terminal: <Terminal size={18} />,
    activity: <Activity size={18} />,
    cpu: <Cpu size={18} />,
    network: <Network size={18} />,
    monitor: <Monitor size={18} />,
    zap: <Zap size={18} />,
};

export const ExternalAppLauncher: React.FC<ExternalAppLauncherProps> = ({
    apps,
    onUpdateApps,
    language,
    onNotify
}) => {
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
    const [isOpen, setIsOpen] = useState(false);
    const [isConfigMode, setIsConfigMode] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Omit<ExternalApp, 'id'>>({
        name: '',
        path: '',
        iconName: 'zap',
        iconData: undefined
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node) && isOpen) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleDragStart = (index: number) => {
        setDraggedItemIndex(index);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (index: number) => {
        if (draggedItemIndex === null) return;
        const newApps = [...apps];
        const draggedItem = newApps[draggedItemIndex];
        newApps.splice(draggedItemIndex, 1);
        newApps.splice(index, 0, draggedItem);
        onUpdateApps(newApps);
        setDraggedItemIndex(null);
    };

    const launchApp = async (appPath: string) => {
        if (!window.electronAPI) return;
        try {
            const result = await window.electronAPI.launchExternalApp(appPath);
            if (!result.success) {
                onNotify(`${t.launchFailed}: ${result.error}`, 'error');
            }
        } catch (e) {
            onNotify(t.launchFailed, 'error');
        }
    };

    const handleBrowseFiles = async () => {
        if (!window.electronAPI) return;
        try {
            const result = await window.electronAPI.selectExecutableFile();

            if (result.success) {
                setFormData(prev => ({
                    ...prev,
                    path: result.path,
                    // Si el nombre está vacío, sugerir el nombre del archivo extraído
                    name: prev.name === '' ? result.suggestedName : prev.name,
                    iconData: result.iconData
                }));
            }
        } catch (e) {
            onNotify('Error al abrir el explorador', 'error');
        }
    };

    const handleAddApp = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateApps([...apps, { ...formData, id: Date.now().toString() }]);
        setIsAddModalOpen(false);
        setFormData({ name: '', path: '', iconName: 'zap', iconData: undefined });
        onNotify(t.appliedSuccess, 'success');
    };

    const removeApp = (id: string) => {
        onUpdateApps(apps.filter(a => a.id !== id));
    };

    return (
        <>
            {/* Drawer / Barra lateral derecha */}
            <div
                ref={containerRef}
                className={`fixed right-0 top-1/2 -translate-y-1/2 z-[60] transition-all duration-300 flex items-center ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-12px)]'
                    }`}
            >
                {/* Botón de alternancia */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-10 h-20 bg-theme-bg-secondary text-theme-text-primary rounded-l-xl flex items-center justify-center shadow-lg border border-r-0 border-theme-border-primary hover:bg-theme-bg-hover transition-colors group"
                >
                    {isOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />}
                </button>

                {/* Panel de Aplicaciones */}
                <div className="w-20 bg-theme-bg-primary border border-theme-border-primary shadow-2xl rounded-l-2xl py-4 flex flex-col items-center gap-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <div className="w-full px-2 border-b border-theme-border-secondary pb-2 mb-2 flex justify-center">
                        <span className="text-[9px] font-bold text-theme-text-muted uppercase tracking-tighter">{t.apps}</span>
                    </div>

                    {apps.map((app, index) => (
                        <div
                            key={app.id}
                            className={`relative group/app ${isConfigMode ? 'cursor-grab active:cursor-grabbing' : ''} ${draggedItemIndex === index ? 'opacity-50' : ''}`}
                            draggable={isConfigMode}
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(index)}
                        >
                            <button
                                onClick={() => !isConfigMode && launchApp(app.path)}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isConfigMode
                                    ? 'bg-theme-bg-tertiary text-theme-text-muted cursor-default'
                                    : 'bg-theme-bg-secondary border border-theme-border-primary text-theme-text-primary hover:bg-theme-brand-primary hover:text-white hover:shadow-lg hover:shadow-theme-brand-primary/20 hover:-translate-y-1'
                                    }`}
                                title={app.name}
                            >
                                {app.iconData ? (
                                    <img src={app.iconData} alt="" className="w-8 h-8 object-contain pointer-events-none drop-shadow-sm" />
                                ) : (
                                    FALLBACK_ICONS[app.iconName] || <Zap size={18} />
                                )}
                            </button>

                            {isConfigMode && (
                                <button
                                    onClick={() => removeApp(app.id)}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors"
                                >
                                    <X size={10} />
                                </button>
                            )}

                            {/* Tooltip de nombre */}
                            {!isOpen && (
                                <div className="absolute right-full mr-4 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover/app:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    {app.name}
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            title={t.addApp}
                        >
                            <Plus size={18} />
                        </button>
                        <button
                            onClick={() => setIsConfigMode(!isConfigMode)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isConfigMode
                                ? 'bg-orange-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                                }`}
                            title={t.manageApps}
                        >
                            <Settings2 size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal para añadir App */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-theme-bg-primary rounded-2xl shadow-2xl border border-theme-border-primary overflow-hidden">
                        <div className="flex items-center justify-between p-4 bg-theme-bg-secondary border-b border-theme-border-primary">
                            <h3 className="font-bold text-theme-text-primary flex items-center gap-2">
                                <Zap size={18} className="text-theme-brand-primary" />
                                {t.addApp}
                            </h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-theme-text-muted hover:text-theme-text-primary">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddApp} className="p-6 space-y-4">
                            {/* Previsualización del Icono */}
                            <div className="flex flex-col items-center gap-2 py-2">
                                <span className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest">{t.iconDetected}</span>
                                <div className="w-24 h-24 rounded-2xl bg-theme-bg-tertiary border border-theme-border-secondary flex items-center justify-center shadow-inner group">
                                    {formData.iconData ? (
                                        <img src={formData.iconData} alt="Extracted icon" className="w-16 h-16 object-contain drop-shadow-md" />
                                    ) : (
                                        <Search size={32} className="text-theme-text-muted animate-pulse" />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-theme-text-muted uppercase tracking-wider">{t.appPath}</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            required
                                            type="text"
                                            value={formData.path}
                                            onChange={e => setFormData({ ...formData, path: e.target.value })}
                                            placeholder={t.appPathPlaceholder}
                                            className="w-full h-11 pl-4 pr-10 bg-theme-bg-tertiary border border-theme-border-primary rounded-xl text-[10px] font-mono text-theme-text-primary focus:outline-none focus:border-theme-brand-primary"
                                        />
                                        <FolderOpen size={16} className="absolute right-3 top-3.5 text-theme-text-muted" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleBrowseFiles}
                                        className="px-3 bg-theme-bg-tertiary text-theme-text-primary rounded-xl border border-theme-border-primary hover:bg-theme-brand-primary hover:text-white hover:border-transparent transition-all flex items-center gap-2 font-bold text-xs"
                                        title={t.searchInTeam}
                                    >
                                        <Search size={16} />
                                        {t.searchInTeam.split(' ')[0]}
                                    </button>
                                </div>
                                <p className="text-[10px] text-theme-text-muted italic mt-1 px-1">{t.appPathHelp}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-theme-text-muted uppercase tracking-wider">{t.appName}</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder={t.exampleAppName}
                                    className="w-full h-11 px-4 bg-theme-bg-tertiary border border-theme-border-primary rounded-xl text-theme-text-primary text-sm focus:outline-none focus:border-theme-brand-primary"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 h-11 bg-theme-bg-tertiary text-theme-text-muted rounded-xl font-bold hover:bg-theme-bg-hover transition-colors"
                                >
                                    {t.cancel}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 h-11 bg-theme-brand-primary text-white rounded-xl font-bold hover:bg-theme-brand-hover transition-all flex items-center justify-center gap-2 shadow-lg shadow-theme-brand-primary/20"
                                >
                                    <Save size={18} />
                                    {t.saveProfile}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};
