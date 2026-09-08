import { useState } from 'react';
import { Profile } from '../types';

const formatNetworkError = (rawMsg: string, t: any): string => {
    if (!rawMsg) return t.errorGenericFailed || 'Error configuring network profile';
    if (rawMsg.includes('ADMIN_REQUIRED') || rawMsg.includes('Admin') || rawMsg.includes('elevation') || rawMsg.includes('access is denied')) {
        return t.adminRequired || 'Administrator privileges required';
    }
    if (rawMsg.includes('IP_CONFLICT') || rawMsg.includes('already exists') || rawMsg.includes('ya existe') || rawMsg.includes('parameter is incorrect')) {
        return t.errorIpConflict || 'IP conflict with another interface';
    }
    if (rawMsg.includes('INTERFACE_DISABLED') || rawMsg.includes('disabled') || rawMsg.includes('deshabilitada')) {
        return t.errorInterfaceDisabled || 'Interface disabled in Windows';
    }
    if (rawMsg.includes('MEDIA_DISCONNECTED') || rawMsg.includes('disconnected') || rawMsg.includes('desconectados')) {
        return t.errorMediaDisconnected || 'Network media disconnected';
    }
    let clean = rawMsg.replace(/^(Error:\s*)+/i, '').replace(/^(Failed:\s*)+/i, '');
    return `${t.error || 'Error'}: ${clean}`;
};

export const useNetworkOps = (selectedInterface: any, t: any) => {
    const [isApplying, setIsApplying] = useState(false);
    const [showAdminPrompt, setShowAdminPrompt] = useState(false);

    const applyProfile = async (profile: Profile) => {
        if (!selectedInterface) return;
        setIsApplying(true);
        try {
            if (window.electronAPI) {
                const result = await window.electronAPI.changeIpConfig({ ifaceName: selectedInterface.name, profile });
                if (result.alreadyActive && profile.type === 'DHCP') {
                    return { success: true, message: t.dhcpAlreadyActive };
                }
                return { success: true, message: `${t.appliedSuccess} "${profile.name}"` };
            }
        } catch (error: any) {
            let errorMsg = error.message || 'Unknown error';
            if (errorMsg.includes('ADMIN_REQUIRED') || errorMsg.includes('Admin') || errorMsg.includes('elevation')) {
                setShowAdminPrompt(true);
                return { success: false, adminRequired: true, message: t.adminRequired };
            }
            return { success: false, message: formatNetworkError(errorMsg, t) };
        } finally {
            setIsApplying(false);
        }
    };

    const autoConnect = async (targetIp: string, openBrowser: boolean = true) => {
        if (!selectedInterface) return { success: false, message: 'No interface selected' };
        setIsApplying(true);
        try {
            if (window.electronAPI) {
                const result = await window.electronAPI.findAndSetIp({ ifaceName: selectedInterface.name, targetIp: targetIp });
                if (result.success) {
                    if (openBrowser) {
                        setTimeout(() => window.open(`http://${targetIp}`, '_blank'), 1000);
                    }
                    return { success: true, message: `Assigned IP: ${result.assignedIp}` };
                } else {
                    return { success: false, message: result.message || 'Failed' };
                }
            }
        } catch (e: any) {
            return { success: false, message: formatNetworkError(e.message, t) };
        } finally {
            setIsApplying(false);
        }
    };

    const findFreeIpAndAssign = async (startIp: string, endIp: string, gateway?: string, subnetMask?: string) => {
        if (!selectedInterface) return { success: false, message: 'No interface selected' };
        setIsApplying(true);
        try {
            if (window.electronAPI) {
                const result = await window.electronAPI.findFreeIpAndAssign({ ifaceName: selectedInterface.name, startIp, endIp, gateway, subnetMask });
                if (result.success) {
                    return { success: true, message: `Free IP found & assigned: ${result.assignedIp}` };
                } else {
                    return { success: false, message: result.message || 'Failed to locate/assign IP' };
                }
            }
        } catch (e: any) {
            return { success: false, message: formatNetworkError(e.message, t) };
        } finally {
            setIsApplying(false);
        }
    };

    return { isApplying, applyProfile, autoConnect, findFreeIpAndAssign, showAdminPrompt, setShowAdminPrompt };
};
