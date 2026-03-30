import { useState } from 'react';
import { Profile } from '../types';

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
            if (errorMsg.includes('Admin') || errorMsg.includes('elevation')) {
                setShowAdminPrompt(true);
                return { success: false, adminRequired: true };
            }
            return { success: false, message: `${t.error}: ${errorMsg}` };
        } finally {
            setIsApplying(false);
        }
    };

    const autoConnect = async (targetIp: string) => {
        if (!selectedInterface) return { success: false, message: 'No interface selected' };
        setIsApplying(true);
        try {
            if (window.electronAPI) {
                const result = await window.electronAPI.findAndSetIp({ ifaceName: selectedInterface.name, targetIp: targetIp });
                if (result.success) {
                    setTimeout(() => window.open(`http://${targetIp}`, '_blank'), 1000);
                    return { success: true, message: `Assigned IP: ${result.assignedIp}` };
                } else {
                    return { success: false, message: result.message || 'Failed' };
                }
            }
        } catch (e: any) {
            return { success: false, message: `Error: ${e.message}` };
        } finally {
            setIsApplying(false);
        }
    };

    return { isApplying, applyProfile, autoConnect, showAdminPrompt, setShowAdminPrompt };
};
