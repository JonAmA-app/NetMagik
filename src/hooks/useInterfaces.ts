import { useState, useEffect, useRef } from 'react';
import { NetworkInterface } from '../types';

export const useInterfaces = () => {
    const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isToggling, setIsToggling] = useState<string | null>(null);
    const prevInterfacesRef = useRef<string>('');

    const loadInterfaces = async (isAutoRefresh = false) => {
        if (!isAutoRefresh) setIsRefreshing(true);
        try {
            if (window.electronAPI) {
                const netshList: any[] = await window.electronAPI.getWindowsInterfaces();
                const detected: NetworkInterface[] = [];

                netshList.forEach(iface => {
                    let status: 'Connected' | 'Disconnected' | 'Disabled' = 'Disconnected';
                    const adminStateLower = iface.adminState?.toLowerCase() || '';
                    if (adminStateLower.includes('disabl') || adminStateLower.includes('deshab')) status = 'Disabled';
                    else if (iface.connectionState?.toLowerCase().includes('connect')) status = 'Connected';
                    
                    let desc = "Ethernet Adapter";
                    const lowerName = iface.name.toLowerCase();
                    if (lowerName.includes('wi-fi') || lowerName.includes('wlan') || lowerName.includes('inalámbrica')) desc = "Wireless Adapter";
                    
                    detected.push({
                        id: iface.name, 
                        name: iface.name, 
                        description: desc, 
                        status: status,
                        macAddress: iface.mac || '??:??:??:??:??:??',
                        currentIp: iface.ip || '0.0.0.0',
                        netmask: iface.netmask || '0.0.0.0'
                    });
                });

                const final = detected.filter(d => d.currentIp !== '127.0.0.1' && !d.name.toLowerCase().includes('pseudo') && !d.name.toLowerCase().includes('loopback'));
                const stringified = JSON.stringify(final);
                if (stringified !== prevInterfacesRef.current) {
                    setInterfaces(final);
                    prevInterfacesRef.current = stringified;
                }
            } else {
                // Dummy interfaces for browser testing
                const dummy: NetworkInterface[] = [
                    { id: 'eth0', name: 'Ethernet (Sim)', description: 'Ethernet Adapter', status: 'Connected', macAddress: '00:11:22:33:44:55', currentIp: '192.168.1.10', netmask: '255.255.255.0' },
                    { id: 'wlan0', name: 'Wi-Fi (Sim)', description: 'Wireless Adapter', status: 'Disconnected', macAddress: 'AA:BB:CC:DD:EE:FF', currentIp: '0.0.0.0', netmask: '0.0.0.0' }
                ];
                setInterfaces(dummy);
            }
        } catch (err) { console.warn("Could not load interfaces:", err); }
        finally { if (!isAutoRefresh) setTimeout(() => setIsRefreshing(false), 500); }
    };

    useEffect(() => {
        loadInterfaces();
        const interval = setInterval(() => loadInterfaces(true), 5000);
        return () => clearInterval(interval);
    }, []);

    const toggleInterface = async (id: string, enable: boolean) => {
        setIsToggling(id);
        const iface = interfaces.find(i => i.id === id);
        if (!iface) return;
        try {
            if (window.electronAPI) {
                await window.electronAPI.toggleInterface({ ifaceName: iface.name, action: enable ? 'enable' : 'disable' });
                setTimeout(() => loadInterfaces(false), 2500);
                return { success: true };
            }
        } catch (e: any) {
            return { success: false, error: e.message || 'Action failed' };
        }
        finally { setTimeout(() => setIsToggling(null), 2500); }
    };

    return { interfaces, isRefreshing, isToggling, loadInterfaces, toggleInterface };
};
