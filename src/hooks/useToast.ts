
import { useState, useCallback } from 'react';
import { Toast, ToastType } from '../components/ToastNotification';

let toastCounter = 0;

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((type: ToastType, title: string, body?: string, duration?: number) => {
        const id = `toast-${++toastCounter}-${Date.now()}`;
        setToasts(prev => [...prev, { id, type, title, body, duration }]);
        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const success = useCallback((title: string, body?: string, duration?: number) =>
        addToast('success', title, body, duration), [addToast]);

    const error = useCallback((title: string, body?: string, duration?: number) =>
        addToast('error', title, body, duration), [addToast]);

    const info = useCallback((title: string, body?: string, duration?: number) =>
        addToast('info', title, body, duration), [addToast]);

    const warning = useCallback((title: string, body?: string, duration?: number) =>
        addToast('warning', title, body, duration), [addToast]);

    return { toasts, addToast, removeToast, success, error, info, warning };
}
