import React from 'react';
import { X, AlertTriangle, Check } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    subTitle?: string;
    variant?: 'danger' | 'primary' | 'warning';
    t?: any;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel,
    cancelLabel,
    subTitle,
    variant = 'primary',
    t
}) => {
    if (!isOpen) return null;

    const finalConfirmLabel = confirmLabel || t?.confirm || 'Confirm';
    const finalCancelLabel = cancelLabel || t?.cancel || 'Cancel';
    const finalSubTitle = subTitle || t?.confirmationRequired || 'Confirmation Required';

    const variantStyles = {
        danger: {
            icon: <AlertTriangle size={32} className="text-rose-500" />,
            bgIcon: 'bg-rose-500/10',
            button: 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20',
            text: 'text-rose-500'
        },
        warning: {
            icon: <AlertTriangle size={32} className="text-amber-500" />,
            bgIcon: 'bg-amber-500/10',
            button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
            text: 'text-amber-500'
        },
        primary: {
            icon: <Check size={32} className="text-theme-brand-primary" />,
            bgIcon: 'bg-theme-brand-primary/10',
            button: 'bg-theme-brand-primary hover:bg-theme-brand-hover shadow-theme-brand-primary/20',
            text: 'text-theme-brand-primary'
        }
    };

    const style = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-theme-bg-primary/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-theme-bg-secondary w-full max-w-md rounded-2xl shadow-2xl border border-theme-border-primary overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 ${style.bgIcon} rounded-xl`}>
                                {style.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-theme-text-primary">{title}</h3>
                                <p className="text-xs text-theme-text-muted uppercase tracking-widest font-bold mt-1">{finalSubTitle}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-theme-text-muted hover:text-theme-brand-primary transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <p className="text-theme-text-muted text-sm mb-8 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-theme-bg-tertiary text-theme-text-secondary font-bold rounded-xl hover:bg-theme-bg-hover transition-colors"
                        >
                            {finalCancelLabel}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 py-3 px-4 text-white font-bold rounded-xl shadow-lg transition-all ${style.button}`}
                        >
                            {finalConfirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
