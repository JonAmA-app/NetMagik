import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import NotificationApp from './NotificationApp';
import './index.css';

import { ToastProvider } from './context/ToastContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

const isNotificationWindow = window.location.search.includes('window=notification');

if (isNotificationWindow) {
    root.render(
        <React.StrictMode>
            <NotificationApp />
        </React.StrictMode>
    );
} else {
    root.render(
        <React.StrictMode>
            <ToastProvider>
                <App />
            </ToastProvider>
        </React.StrictMode>
    );
}
