import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface InputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (value: string, secondaryValue?: string, tertiaryValue?: string) => void;
    title: string;
    message?: string;
    defaultValue?: string;
    secondaryDefaultValue?: string; // For cases like Name + IP
    tertiaryDefaultValue?: string; // For class/type
    placeholder?: string;
    secondaryPlaceholder?: string;
    tertiaryPlaceholder?: string;
    isPassword?: boolean;
    confirmLabel?: string;
    cancelLabel?: string;
    t: any;
}

export const InputModal: React.FC<InputModalProps> = ({
    isOpen, onClose, onConfirm, title, message,
    defaultValue = '', secondaryDefaultValue = '', tertiaryDefaultValue = '',
    placeholder = '', secondaryPlaceholder = '', tertiaryPlaceholder = '',
    isPassword = false, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
    t
}) => {
    const [value, setValue] = useState(defaultValue);
    const [secondaryValue, setSecondaryValue] = useState(secondaryDefaultValue);
    const [tertiaryValue, setTertiaryValue] = useState(tertiaryDefaultValue);
    const [capsLock, setCapsLock] = useState(false);

    useEffect(() => {
        const checkCaps = (e: KeyboardEvent) => {
            if (e.getModifierState) setCapsLock(e.getModifierState('CapsLock'));
        };
        window.addEventListener('keydown', checkCaps);
        window.addEventListener('keyup', checkCaps);
        return () => {
            window.removeEventListener('keydown', checkCaps);
            window.removeEventListener('keyup', checkCaps);
        };
    }, []);

    useEffect(() => {
        if (isOpen) {
            setValue(defaultValue);
            setSecondaryValue(secondaryDefaultValue);
            setTertiaryValue(tertiaryDefaultValue);
        }
    }, [isOpen, defaultValue, secondaryDefaultValue, tertiaryDefaultValue]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(value, secondaryValue, tertiaryValue);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-theme-bg-primary/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-theme-bg-secondary w-full max-w-md rounded-2xl shadow-2xl border border-theme-border-primary overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-theme-text-primary">{title}</h3>
                            <button type="button" onClick={onClose} className="text-theme-text-muted hover:text-theme-brand-primary">
                                <X size={20} />
                            </button>
                        </div>

                        {message && <p className="text-theme-text-muted text-sm mb-6">{message}</p>}

                        <div className="space-y-4">
                            <div>
                                <div className="relative">
                                    <input
                                        autoFocus
                                        type={isPassword ? "password" : "text"}
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        placeholder={placeholder}
                                        className="w-full px-4 py-3 bg-theme-bg-primary border border-theme-border-primary rounded-xl text-theme-text-primary focus:ring-2 focus:ring-theme-brand-primary outline-none transition-all placeholder-theme-text-muted"
                                    />
                                    {isPassword && capsLock && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[8px] font-black text-amber-500 uppercase tracking-tighter">
                                            {t.capsLockOn || "Caps Lock ON"}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {secondaryPlaceholder && (
                                <div>
                                    <input
                                        type="text"
                                        value={secondaryValue}
                                        onChange={(e) => setSecondaryValue(e.target.value)}
                                        placeholder={secondaryPlaceholder}
                                        className="w-full px-4 py-3 bg-theme-bg-primary border border-theme-border-primary rounded-xl text-theme-text-primary focus:ring-2 focus:ring-theme-brand-primary outline-none transition-all placeholder-theme-text-muted"
                                    />
                                </div>
                            )}

                            {tertiaryPlaceholder && (
                                <div>
                                    <input
                                        type="text"
                                        value={tertiaryValue}
                                        onChange={(e) => setTertiaryValue(e.target.value)}
                                        placeholder={tertiaryPlaceholder}
                                        className="w-full px-4 py-3 bg-theme-bg-primary border border-theme-border-primary rounded-xl text-theme-text-primary focus:ring-2 focus:ring-theme-brand-primary outline-none transition-all placeholder-theme-text-muted"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 px-4 bg-theme-bg-tertiary text-theme-text-secondary font-bold rounded-xl hover:bg-theme-bg-hover transition-colors"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 px-4 bg-theme-brand-primary text-white font-bold rounded-xl hover:bg-theme-brand-hover shadow-lg shadow-theme-brand-primary/20 transition-all flex items-center justify-center gap-2"
                            >
                                <span>{confirmLabel}</span>
                                <Check size={18} />
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
