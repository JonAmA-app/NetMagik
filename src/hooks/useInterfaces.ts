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
                    const adminStateLower = (iface.adminState || '').toLowerCase();
                    const connLower = (iface.connectionState || '').toLowerCase();
                    const hasIp = !!(iface.ip && iface.ip !== '0.0.0.0' && iface.ip !== '127.0.0.1');

                    if (adminStateLower.includes('disabl') || adminStateLower.includes('deshab')) {
                        status = 'Disabled';
                    } else if (connLower.includes('connect') || connLower.includes('conect') || hasIp) {
                        status = 'Connected';
                    }
                    
                    let desc = "Ethernet Adapter";
                    const lowerName = iface.name.toLowerCase();
                    if (lowerName.includes('wi-fi') || lowerName.includes('wlan') || lowerName.includes('inalámbrica') || lowerName.includes('wireless')) desc = "Wireless Adapter";
                    else if (iface.isVirtual) desc = "Virtual Adapter";

                    const defaultGw = hasIp ? `${iface.ip.split('.').slice(0, 3).join('.')}.1` : '0.0.0.0';
                    
                    detected.push({
                        id: iface.name, 
                        name: iface.name, 
                        description: desc, 
                        status: status,
                        macAddress: iface.mac || '??:??:??:??:??:??',
                        currentIp: iface.ip || '0.0.0.0',
                        allIps: iface.allIps || [iface.ip || '0.0.0.0'],
                        netmask: iface.netmask || (hasIp ? '255.255.255.0' : '0.0.0.0'),
                        gateway: iface.gateway || defaultGw,
                        isVirtual: iface.isVirtual || false
                    });
                });

                const final = detected.filter(d => d.currentIp !== '127.0.0.1' && !d.name.toLowerCase().includes('pseudo') && !d.name.toLowerCase().includes('loopback'));
                
                // Prioritize Wired Ethernet over Virtual Adapters, and put Wi-Fi LAST in the list
                final.sort((a, b) => {
                    const isWifi = (name: string, desc: string = '') => {
                        const str = `${name} ${desc}`.toLowerCase();
                        return str.includes('wi-fi') || str.includes('wifi') || str.includes('wlan') || str.includes('inalámbrica') || str.includes('inalambrica') || str.includes('wireless') || str.includes('802.11');
                    };

                    const isVirt = (name: string, desc: string = '', isVirtFlag?: boolean) => {
                        if (isVirtFlag) return true;
                        const str = `${name} ${desc}`.toLowerCase();
                        return str.includes('virtual') || str.includes('vmware') || str.includes('vbox') || str.includes('hyper-v') || str.includes('docker') || str.includes('vpn') || str.includes('bluetooth');
                    };

                    const getPrio = (iface: NetworkInterface) => {
                        const wifi = isWifi(iface.name, iface.description);
                        const virt = isVirt(iface.name, iface.description, iface.isVirtual);
                        const isConn = iface.status === 'Connected';

                        if (wifi) return isConn ? 40 : 41; // Wi-Fi is LAST
                        if (virt) return isConn ? 30 : 31;
                        return isConn ? 10 : 11; // Wired Ethernet is FIRST
                    };

                    const prioA = getPrio(a);
                    const prioB = getPrio(b);
                    if (prioA !== prioB) return prioA - prioB;
                    return a.name.localeCompare(b.name);
                });

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
        
        let intervalId: NodeJS.Timeout | null = null;
        
        const startPolling = () => {
            if (!intervalId) {
                intervalId = setInterval(() => {
                    if (!document.hidden) {
                        loadInterfaces(true);
                    }
                }, 5000);
            }
        };
        
        const stopPolling = () => {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        };
        
        startPolling();
        
        const handleVisibility = () => {
            if (document.hidden) {
                stopPolling();
            } else {
                loadInterfaces(true);
                startPolling();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibility);
        return () => {
            stopPolling();
            document.removeEventListener('visibilitychange', handleVisibility);
        };
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
