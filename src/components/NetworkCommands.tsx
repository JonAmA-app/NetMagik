
import React, { useState } from 'react';
import { Language, NetworkInterface } from '../types';
import { TRANSLATIONS } from '../constants';
import { Terminal, RefreshCw, Trash2, Shield, AlertTriangle, CheckCircle2, Monitor, Network, Activity, FileText, Zap, Edit2, Minimize2, Maximize2, X } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface NetworkCommandsProps {
    iface: NetworkInterface;
    language: Language;
    onRenamePC: () => void;
}

export const NetworkCommands: React.FC<NetworkCommandsProps> = ({ iface, language, onRenamePC }) => {
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
    const [executing, setExecuting] = useState<string | null>(null);
    const [result, setResult] = useState<{ id: string, success: boolean, message: string, output?: string } | null>(null);
    const [showOutput, setShowOutput] = useState(false);
    const [showBiosConfirm, setShowBiosConfirm] = useState(false);
    const [showFloatingOutput, setShowFloatingOutput] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);

    const executeCommand = async (cmdId: string) => {
        if (cmdId === 'rename-pc') {
            onRenamePC();
            return;
        }

        setExecuting(cmdId);
        setResult(null);

        try {
            if (window.electronAPI) {
                let res;
                if (cmdId === 'reboot-to-bios') {
                    setShowBiosConfirm(true);
                    setExecuting(null);
                    return;
                } else {
                    res = await window.electronAPI.executeNetworkCommand({ command: cmdId, params: { ifaceName: iface.name } });
                }

                setResult({
                    id: cmdId,
                    success: true,
                    message: t.cmdSuccess,
                    output: res?.output
                });

                if (['arp-a', 'route-print', 'ifconfig'].includes(cmdId)) {
                    setShowFloatingOutput(true);
                } else {
                    setShowOutput(true);
                }
            } else {
                // Simulation
                await new Promise(resolve => setTimeout(resolve, 1500));
                setResult({
                    id: cmdId,
                    success: true,
                    message: t.cmdSuccess + ' (Simulated)'
                });
            }
        } catch (err: any) {
            let errorMsg = err.message || t.cmdFailed;

            // Translate Admin Privileges message from backend
            if (errorMsg.includes('Admin') || errorMsg.includes('privileges') || errorMsg.includes('elevation')) {
                errorMsg = t.adminRequired;
            }

            setResult({
                id: cmdId,
                success: false,
                message: errorMsg
            });
        } finally {
            setExecuting(null);
        }
    };

    const commands = [
        {
            id: 'flush-dns',
            title: t.flushDns,
            description: t.flushDnsDesc,
            icon: <Trash2 size={20} className="text-orange-500" />,
            color: 'hover:border-orange-200 dark:hover:border-orange-500/30'
        },
        {
            id: 'renew-ip',
            title: t.renewIp,
            description: t.renewIpDesc,
            icon: <RefreshCw size={20} className="text-blue-500" />,
            color: 'hover:border-blue-200 dark:hover:border-blue-500/30'
        },
        {
            id: 'reset-winsock',
            title: t.resetWinsock,
            description: t.resetWinsockDesc,
            icon: <Shield size={20} className="text-purple-500" />,
            color: 'hover:border-purple-200 dark:hover:border-purple-500/30'
        },
        {
            id: 'netplwiz',
            title: t.netplwiz,
            description: t.netplwizDesc,
            icon: <Shield size={20} className="text-amber-500" />,
            color: 'hover:border-amber-200 dark:hover:border-amber-500/30'
        },
        {
            id: 'shell-startup',
            title: t.shellStartup,
            description: t.shellStartupDesc,
            icon: <Zap size={20} className="text-yellow-500" />,
            color: 'hover:border-yellow-200 dark:hover:border-yellow-500/30'
        },
        {
            id: 'rename-pc',
            title: t.renameComputer,
            description: t.renameComputerDesc,
            icon: <Edit2 size={20} className="text-emerald-500" />,
            color: 'hover:border-emerald-200 dark:hover:border-emerald-500/30'
        },
        {
            id: 'arp-a',
            title: t.arpTable,
            description: t.arpTableDesc,
            icon: <Monitor size={20} className="text-slate-500" />,
            color: 'hover:border-slate-200 dark:hover:border-slate-500/30'
        },
        {
            id: 'route-print',
            title: t.routingTable,
            description: t.routingTableDesc,
            icon: <Network size={20} className="text-sky-500" />,
            color: 'hover:border-sky-200 dark:hover:border-sky-500/30'
        },
        {
            id: 'ifconfig',
            title: t.adapterStatus,
            description: t.adapterStatusDesc,
            icon: <Activity size={20} className="text-rose-500" />,
            color: 'hover:border-rose-200 dark:hover:border-rose-500/30'
        },
        {
            id: 'reboot-to-bios',
            title: t.rebootBios,
            description: t.rebootBiosDesc,
            icon: <Zap size={20} className="text-rose-600" />,
            color: 'hover:border-rose-300 dark:hover:border-rose-600/30'
        }
    ];

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
            <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-theme-bg-tertiary rounded-lg text-theme-text-muted">
                        <Terminal size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-theme-text-primary">{t.commands}</h3>
                        <p className="text-xs text-theme-text-muted">{t.systemMaintenanceDesc}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {commands.map((cmd) => (
                        <button
                            key={cmd.id}
                            onClick={() => executeCommand(cmd.id)}
                            disabled={!!executing}
                            className={`text-left p-4 rounded-xl border border-theme-border-primary bg-theme-bg-tertiary transition-all ${cmd.color} hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 bg-theme-bg-secondary rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                                    {cmd.icon}
                                </div>
                                {executing === cmd.id && (
                                    <RefreshCw size={16} className="animate-spin text-theme-text-muted" />
                                )}
                            </div>
                            <h4 className="font-semibold text-theme-text-primary text-sm mb-1">{cmd.title}</h4>
                            <p className="text-xs text-theme-text-muted leading-relaxed">{cmd.description}</p>

                            {/* Result Overlay */}
                            {result && result.id === cmd.id && (
                                <div className={`absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-theme-bg-secondary/90 transition-opacity animate-in fade-in`}>
                                    <div className={`flex flex-col items-center gap-1 ${result.success ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {result.success ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                                        <span className="text-xs font-bold text-center px-2">{result.message}</span>
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {result && result.output && showOutput && (
                    <div className="mt-8 animate-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-theme-text-muted uppercase tracking-widest">
                                <FileText size={14} /> {t.output || "Output"}: {commands.find(c => c.id === result.id)?.title}
                            </div>
                            <button onClick={() => setShowOutput(false)} className="text-[10px] font-bold text-theme-text-muted hover:text-theme-text-primary uppercase tracking-tighter">{t.closeOutput || "Close Output"}</button>
                        </div>
                        <div className="bg-theme-bg-tertiary rounded-xl p-4 border border-theme-border-primary shadow-inner max-h-[300px] overflow-auto custom-scrollbar">
                            <pre className="text-[11px] font-mono text-theme-text-secondary whitespace-pre-wrap leading-relaxed">{result.output}</pre>
                        </div>
                    </div>
                )}

                <div className="mt-4 p-3 bg-theme-brand-primary/10 border border-theme-brand-primary/20 rounded-lg flex items-start gap-3">
                    <AlertTriangle size={16} className="text-theme-brand-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-theme-text-primary">
                        {t.adminRequired}
                    </p>
                </div>
            </div>

            <ConfirmModal
                isOpen={showBiosConfirm}
                onClose={() => setShowBiosConfirm(false)}
                onConfirm={async () => {
                    try {
                        if (window.electronAPI) {
                            await window.electronAPI.rebootToBios();
                        }
                    } catch (e) { }
                }}
                title={t.rebootBios || 'Reboot to BIOS'}
                message={t.rebootBiosConfirm || 'This will restart your PC into BIOS/UEFI. Save your work. Continue?'}
                confirmLabel={t.apply || 'Reboot Now'}
                cancelLabel={t.cancel || 'Cancel'}
                subTitle={t.confirmationRequired}
                variant="danger"
            />

            {/* Floating Output Modal */}
            {showFloatingOutput && result && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-theme-bg-primary/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className={`bg-theme-bg-secondary border border-theme-border-primary rounded-2xl shadow-2xl flex flex-col transition-all duration-300 overflow-hidden ${isMaximized ? 'w-full h-full' : 'w-full max-w-4xl h-[80vh]'}`}>
                        {/* Modal Header */}
                        <div className="p-4 bg-theme-bg-tertiary border-b border-theme-border-secondary flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-theme-bg-secondary rounded-lg text-theme-brand-primary">
                                    {commands.find(c => c.id === result.id)?.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-theme-text-primary">{commands.find(c => c.id === result.id)?.title}</h3>
                                    <p className="text-[10px] text-theme-text-muted uppercase tracking-widest font-black">{t.systemOutput || "System Output"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsMaximized(!isMaximized)}
                                    className="p-2 text-theme-text-muted hover:text-theme-brand-primary hover:bg-theme-bg-hover rounded-lg transition-all"
                                    title={isMaximized ? (t.restore || 'Restore') : (t.maximize || 'Maximize')}
                                >
                                    {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                                </button>
                                <button
                                    onClick={() => { setShowFloatingOutput(false); setIsMaximized(false); }}
                                    className="p-2 text-theme-text-muted hover:text-rose-500 hover:bg-theme-bg-hover rounded-lg transition-all"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-auto p-6 bg-theme-bg-primary custom-scrollbar">
                            <pre className="text-[13px] font-mono text-theme-text-primary whitespace-pre-wrap leading-relaxed">
                                {result.output || t.noOutputData || 'No output data available.'}
                            </pre>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-theme-bg-tertiary border-t border-theme-border-secondary flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(result.output || '');
                                }}
                                className="px-4 py-2 bg-theme-bg-secondary text-theme-text-secondary rounded-xl text-sm font-bold border border-theme-border-primary hover:bg-theme-bg-hover transition-colors flex items-center gap-2"
                            >
                                <FileText size={16} /> {t.copyLink || 'Copy'}
                            </button>
                            <button
                                onClick={() => { setShowFloatingOutput(false); setIsMaximized(false); }}
                                className="px-6 py-2 bg-theme-brand-primary hover:bg-theme-brand-hover text-white rounded-xl text-sm font-bold shadow-lg shadow-theme-brand-primary/20 transition-all"
                            >
                                {t.close || 'Close'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
