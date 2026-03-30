
import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { Toast, ToastType, ToastContainer } from '../components/ToastNotification';

interface ToastContextType {
    success: (title: string, body?: string, duration?: number) => void;
    error: (title: string, body?: string, duration?: number) => void;
    info: (title: string, body?: string, duration?: number) => void;
    warning: (title: string, body?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastCounter = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((type: ToastType, title: string, body?: string, duration?: number) => {
        const id = `toast-${++toastCounter}-${Date.now()}`;
        const toast = { id, type, title, body, duration };
        
        // Read notification settings
        let notificationsEnabled = true;
        let playSound = false;
        try {
            const settingsStr = localStorage.getItem('netmajik_settings');
            if (settingsStr) {
                const s = JSON.parse(settingsStr);
                if (s.systemNotifications === false) {
                    notificationsEnabled = false;
                }
                if (s.notificationSound === true) {
                    playSound = true;
                }
            }
        } catch (e) {
            // ignore
        }

        // If notifications are disabled, don't show anything
        if (!notificationsEnabled) {
            console.log(`[ToastContext] Notifications disabled, suppressing: ${title}`);
            return;
        }

        // Show in-app toast
        setToasts(prev => [...prev, toast]);

        // Send to Electron for overlay display (when minimized) + sound
        if (window.electronAPI && (window.electronAPI as any).sendCustomToast) {
            console.log(`[ToastContext] Sending toast to Electron. Sound: ${playSound}`);
            (window.electronAPI as any).sendCustomToast({ toast, playSound });
        }
    }, []);

    const success = useCallback((title: string, body?: string, duration?: number) => addToast('success', title, body, duration), [addToast]);
    const error = useCallback((title: string, body?: string, duration?: number) => addToast('error', title, body, duration), [addToast]);
    const info = useCallback((title: string, body?: string, duration?: number) => addToast('info', title, body, duration), [addToast]);
    const warning = useCallback((title: string, body?: string, duration?: number) => addToast('warning', title, body, duration), [addToast]);

    const [language, setLanguage] = useState<string>('en');

    useEffect(() => {
        const checkLang = () => {
            const settingsStr = localStorage.getItem('netmajik_settings');
            if (settingsStr) {
                try {
                    const s = JSON.parse(settingsStr);
                    if (s.language) setLanguage(s.language);
                } catch (e) {}
            }
        };
        checkLang();
        // Listen for storage changes if other windows change it
        window.addEventListener('storage', checkLang);
        return () => window.removeEventListener('storage', checkLang);
    }, []);

    return (
        <ToastContext.Provider value={{ success, error, info, warning }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} language={language} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
