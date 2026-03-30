
import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer } from './components/ToastNotification';
import './index.css';
import './themes.css';

declare global {
    interface Window {
        notificationAPI?: {
            onShowToast: (callback: (toast: Toast) => void) => void;
            onClearToasts: (callback: () => void) => void;
            notifyEmpty: () => void;
            removeListeners: (channel: string) => void;
        };
    }
}

const NotificationApp: React.FC = () => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        // Ensure transparency for overlay
        document.body.style.background = 'transparent';
        document.documentElement.style.background = 'transparent';
        
        if (window.notificationAPI) {
            const handleNewToast = (toast: Toast) => {
                setToasts(prev => [...prev, toast]);
            };

            const handleClearToasts = () => {
                setToasts([]);
            };

            window.notificationAPI.onShowToast(handleNewToast);
            window.notificationAPI.onClearToasts(handleClearToasts);

            return () => {
                window.notificationAPI?.removeListeners('show-custom-toast');
                window.notificationAPI?.removeListeners('clear-custom-toasts');
            };
        }
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => {
            const newList = prev.filter(t => t.id !== id);
            // Notify main process if empty so it can hide the window
            if (newList.length === 0 && window.notificationAPI) {
                window.notificationAPI.notifyEmpty();
            }
            return newList;
        });
    };

    if (toasts.length === 0) return null;

    return (
        <div className="w-full h-full flex items-end justify-end p-6 bg-transparent">
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
};

export default NotificationApp;
