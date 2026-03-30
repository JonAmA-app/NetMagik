
import React, { useEffect, useRef } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    body?: string;
    duration?: number; // ms, default 4000
}

interface ToastItemProps {
    toast: Toast;
    onRemove: (id: string) => void;
}

const ICONS: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={18} />,
    error: <XCircle size={18} />,
    info: <Info size={18} />,
    warning: <AlertTriangle size={18} />,
};

const COLORS: Record<ToastType, string> = {
    success: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
    error: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
    info: 'text-theme-brand-primary bg-theme-brand-primary/10 border-theme-brand-primary/30',
    warning: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
};

const BAR_COLORS: Record<ToastType, string> = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    info: 'bg-theme-brand-primary',
    warning: 'bg-amber-500',
};

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
    const duration = toast.duration ?? 4500;
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), duration);

        // Animate the progress bar
        if (progressRef.current) {
            progressRef.current.style.transition = `width ${duration}ms linear`;
            // Force a reflow to start the animation
            progressRef.current.getBoundingClientRect();
            progressRef.current.style.width = '0%';
        }

        return () => clearTimeout(timer);
    }, [toast.id, duration]);

    return (
        <div
            className={`
                relative overflow-hidden flex items-start gap-3 p-4 rounded-xl border shadow-xl shadow-black/30
                bg-theme-bg-secondary
                ${COLORS[toast.type]}
                animate-in slide-in-from-right-4 fade-in duration-300
                max-w-sm w-full
            `}
        >
            {/* Icon */}
            <div className={`flex-shrink-0 mt-0.5 ${COLORS[toast.type].split(' ')[0]}`}>
                {ICONS[toast.type]}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-theme-text-primary leading-tight">{toast.title}</p>
                {toast.body && (
                    <p className="text-xs text-theme-text-muted mt-0.5 leading-relaxed">{toast.body}</p>
                )}
            </div>

            {/* Close button */}
            <button
                onClick={() => onRemove(toast.id)}
                className="flex-shrink-0 p-0.5 rounded-md text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-hover transition-colors"
            >
                <X size={14} />
            </button>

            {/* Progress bar at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-theme-border-primary/30">
                <div
                    ref={progressRef}
                    className={`h-full ${BAR_COLORS[toast.type]}`}
                    style={{ width: '100%' }}
                />
            </div>
        </div>
    );
};

interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
    language?: string;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove, language }) => {
    if (toasts.length === 0) return null;

    const t = language && TRANSLATIONS ? (TRANSLATIONS[language as any] || TRANSLATIONS['en']) : null;

    return (
        <div
            className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 items-end pointer-events-none"
            aria-live="polite"
            aria-label={t?.systemNotifications || "Notifications"}
        >
            {toasts.map(toast => (
                <div key={toast.id} className="pointer-events-auto">
                    <ToastItem toast={toast} onRemove={onRemove} />
                </div>
            ))}
        </div>
    );
};
