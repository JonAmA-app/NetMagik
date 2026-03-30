import React, { useState, useEffect } from 'react';
import './themes.css';
import {
  Plus, Settings, AlertTriangle, Monitor, Wifi, Activity,
  Clipboard as ClipboardIcon, Radar, Globe, KeyRound,
  Shield, HelpCircle, RefreshCw, Zap, Calculator,
  LayoutGrid, Network, Terminal, Heart, Search, Package, Layers
} from 'lucide-react';

import {
  INITIAL_PROFILES, INITIAL_SNIPPETS, INITIAL_CREDENTIALS,
  TRANSLATIONS, APP_VERSION, DONATION_URL
} from './constants';
import {
  Profile, IpType, AppSettings,
  ClipboardSnippet, DeviceCredential, ScannedDevice,
  PingTarget, ExternalApp
} from './types';

import { InterfaceCard } from './components/InterfaceCard';
import { ProfileList } from './components/ProfileList';
import { CreateProfileForm } from './components/CreateProfileForm';
import { SettingsModal } from './components/SettingsModal';
import { ConnectivityHub } from './components/ConnectivityHub';
import { ClipboardManager } from './components/ClipboardManager';
import { NetworkScanner } from './components/NetworkScanner';
import { InternetStatus } from './components/InternetStatus';
import { CredentialLibrary } from './components/CredentialLibrary';
import { HelpGuide } from './components/HelpGuide';
import { SystemHealth } from './components/SystemHealth';
import { SubnetCalculator } from './components/SubnetCalculator';
import { ToolsManager } from './components/ToolsManager';
import { NetworkCommands } from './components/NetworkCommands';
import { PortScanner } from './components/PortScanner';
import { ExternalAppLauncher } from './components/ExternalAppLauncher';
import { InstalledPrograms } from './components/InstalledPrograms';
import { SystemEvents } from './components/SystemEvents';
import { InputModal } from './components/InputModal';
import { ConfirmModal } from './components/ConfirmModal';
import { GlobalSearch } from './components/GlobalSearch';
import { InventoryManager } from './components/InventoryManager';
import { encryptData, decryptData } from './utils';
import { useInterfaces } from './hooks/useInterfaces';
import { useNetworkOps } from './hooks/useNetworkOps';
import { useLocalStorage } from './hooks/useLocalStorage';
import { TitleBar } from './components/TitleBar';
import { EasterEggTracker } from './components/EasterEggTracker';
import { useToast } from './context/ToastContext';
const App: React.FC = () => {
  // Hooks
  const { interfaces, isRefreshing, isToggling, loadInterfaces } = useInterfaces();

  const [profiles, setProfiles] = useLocalStorage<Profile[]>('netmajik_profiles', INITIAL_PROFILES);
  const [snippets, setSnippets] = useLocalStorage<ClipboardSnippet[]>('netmajik_snippets', INITIAL_SNIPPETS);
  const [credentials, setCredentials] = useLocalStorage<DeviceCredential[]>('netmajik_credentials', INITIAL_CREDENTIALS);
  const [externalApps, setExternalApps] = useLocalStorage<ExternalApp[]>('netmajik_external_apps', [
    { id: '1', name: 'Wireshark', path: 'C:\\Program Files\\Wireshark\\Wireshark.exe', iconName: 'activity' },
    { id: '2', name: 'Putty', path: 'C:\\Program Files\\PuTTY\\putty.exe', iconName: 'terminal' }
  ]);

  const [settings, setSettings] = useLocalStorage<AppSettings>('netmajik_settings', {
    theme: 'dark',
    language: 'en',
    startMaximized: false,
    favoriteTools: ['profiles', 'clipboard', 'connectivity', 'scanner', 'port-scanner', 'internet', 'credentials', 'system', 'subnet', 'commands', 'programs'],
    toolOrder: ['profiles', 'clipboard', 'connectivity', 'scanner', 'port-scanner', 'internet', 'credentials', 'system', 'subnet', 'commands', 'programs'],
    globalShortcuts: true,
    appHotkey: 'Alt+Shift+N',
    securityEnabled: false,
    passwordProtectSettings: false,
    passwordProtectWake: false,
    passwordProtectSnippets: false,
    encryptBackups: false,
    systemNotifications: true,
    notificationSound: false,
    monitorSystemEvents: false
  });

  // Background System Hardware Monitor
  useEffect(() => {
    if (!settings.monitorSystemEvents) return;
    
    // Check every 60 minutes
    const intervalId = setInterval(async () => {
      if (window.electronAPI) {
        try {
          const res = await window.electronAPI.getSystemEvents();
          if (res && res.success && res.events && res.events.length > 0) {
            
            // Get the most recent event to see if we should warn
            const latest = res.events[0];
            const msg = (latest.message || '').toLowerCase();
            const src = (latest.source || '').toLowerCase();
            
            // Ignore DCOM/Spam
            if (!(src.includes('distributedcom') || msg.includes('dcom') || latest.id === 10016 || latest.id === 10010)) {
              if (latest.level === 1 || latest.level === 2) {
                // If it's a critical or error level, send a system notification
                window.electronAPI.showNotification({
                  title: "⚠️ Windows Hardware Alert",
                  body: "A new critical system error was logged. Please check System Events."
                });
              }
            }
          }
        } catch (e) {
          console.error("Monitor error", e);
        }
      }
    }, 60 * 60 * 1000); // 1 hour
    
    return () => clearInterval(intervalId);
  }, [settings.monitorSystemEvents]);

  const [isLocked, setIsLocked] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [unlockCallback, setUnlockCallback] = useState<(() => void) | null>(null);
  const [capsLock, setCapsLock] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

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
    if (settings.securityEnabled && settings.password) {
      setIsLocked(true);
    }
  }, []);

  const [view, setView] = useState<string>('profiles');
  const [discoveredEggs, setDiscoveredEggs] = useState<string[]>(() => {
    const saved = localStorage.getItem('netmajik_easter_eggs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'netmajik_easter_eggs') {
        setDiscoveredEggs(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };
    window.addEventListener('storage', handleStorage);
    // Also poll every 2 seconds because storage event doesn't fire in the same window
    const interval = setInterval(() => {
      const saved = localStorage.getItem('netmajik_easter_eggs');
      const parsed = saved ? JSON.parse(saved) : [];
      if (parsed.length !== discoveredEggs.length) setDiscoveredEggs(parsed);
    }, 2000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [discoveredEggs.length]);

  const eggsActive = discoveredEggs.length > 0;
  const [selectedInterfaceId, setSelectedInterfaceId] = useState<string>('');
  const [scannedDevices, setScannedDevices] = useState<ScannedDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [pingTargets, setPingTargets] = useState<PingTarget[]>([]);
  const [targetPortScannerIp, setTargetPortScannerIp] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Custom Selection Modal
  const [showProfilePicker, setShowProfilePicker] = useState(false);
  const [devicesToSave, setDevicesToSave] = useState<ScannedDevice[]>([]);

  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  const [viewingInventoryProfileId, setViewingInventoryProfileId] = useState<string | null>(null);
  const [scannerReferenceProfileId, setScannerReferenceProfileId] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<{ profileId: string, deviceId: string } | null>(null);
  const { success, error, info } = useToast();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'backup-encrypt' | 'backup-decrypt' | 'rename-pc'>('backup-encrypt');
  const [modalInitialVal, setModalInitialVal] = useState('');
  const [pendingImportData, setPendingImportData] = useState<string | null>(null);

  // Global Search & Theme
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  useEffect(() => {
    const currentTheme = settings.theme || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);

    // Consolidate dark mode class based on theme
    const darkThemes = ['dark', 'matrix'];
    if (darkThemes.includes(currentTheme)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Update dynamic app icon in Electron
    if (window.electronAPI) {
      window.electronAPI.updateThemeIcon(currentTheme);
    }
  }, [settings.theme]);

  // Handle callback execution AFTER unlock re-render
  useEffect(() => {
    if (!isLocked && unlockCallback) {
      const timer = setTimeout(() => {
        unlockCallback();
        setUnlockCallback(null);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isLocked, unlockCallback]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [quickIp, setQuickIp] = useState('');
  const [quickMask, setQuickMask] = useState('');
  const [quickGateway, setQuickGateway] = useState('');

  const t = TRANSLATIONS[settings.language] || TRANSLATIONS['en'];
  const selectedInterface = interfaces.find(i => i.id === selectedInterfaceId);
  const currentProfile = profiles.find(p => p.id === selectedInterface?.currentProfileId);

  const { isApplying, applyProfile, autoConnect, showAdminPrompt, setShowAdminPrompt } = useNetworkOps(selectedInterface, t);

  // Effects
  useEffect(() => {
    if (window.electronAPI) {
      if (settings.startMaximized) {
        window.electronAPI.windowManage('maximize');
      }

      // Listen for navigation from main process
      window.electronAPI.onNavigateTo((target: string) => {
        setView(target);
      });

      // Sync shortcuts
      window.electronAPI.updateShortcuts(settings);

      const checkAdmin = async () => {
        const elevated = await window.electronAPI.isProcessElevated();
        setIsAdmin(elevated);
      };

      const fetchOUI = async () => {
        const { mergeVendorData } = await import('./mac-vendors');
        const result = await window.electronAPI.fetchOuiDatabase();
        if (result.success && result.data) {
          mergeVendorData(result.data);
        }
      };

      window.electronAPI.onSystemResume(() => {
        if (settings.securityEnabled && settings.passwordProtectWake && settings.password) {
          setIsLocked(true);
        }
      });

      checkAdmin();
      fetchOUI();

      return () => {
        window.electronAPI.removeListeners('navigate-to');
        window.electronAPI.removeListeners('system-resume');
      };
    }
  }, []);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.updateShortcuts(settings);
    }
  }, [settings.globalShortcuts, settings.appHotkey]);

  useEffect(() => {
    if (window.electronAPI && settings.globalShortcuts) {
      window.electronAPI.updateSnippetShortcuts(snippets);
    }
  }, [snippets, settings.globalShortcuts]);


  useEffect(() => {
    const allToolIds = ['profiles', 'clipboard', 'connectivity', 'scanner', 'port-scanner', 'internet', 'credentials', 'system', 'subnet', 'commands', 'programs'];

    const missingInOrder = allToolIds.filter(id => !settings.toolOrder.includes(id));
    const missingInFavs = allToolIds.filter(id => !settings.favoriteTools.includes(id));

    if (missingInOrder.length > 0 || missingInFavs.length > 0) {
      setSettings({
        ...settings,
        toolOrder: [...settings.toolOrder, ...missingInOrder],
        favoriteTools: [...settings.favoriteTools, ...missingInFavs]
      });
    }

    if (!selectedInterfaceId && interfaces.length > 0) {
      setSelectedInterfaceId(interfaces[0].id);
    }
  }, [interfaces]);



  const handleToggleIface = async (id: string, enable: boolean) => {
    if (window.electronAPI) {
      const iface = interfaces.find(i => i.id === id);
      if (!iface) return;
      const res = await window.electronAPI.toggleInterface({ ifaceName: iface.name, enable });
      if (res?.success) {
        success(enable ? t.interfaceEnabled : t.interfaceDisabled);
      } else {
        error(res?.error || 'Failed to toggle interface');
      }
    }
  };

  const handleInterfaceSelect = (id: string) => {
    setSelectedInterfaceId(id);
    setView('profiles');
    setIsCreating(false);
  };

  const handleApply = async (profile: Profile) => {
    setScannerReferenceProfileId(profile.id);
    const res = await applyProfile(profile);
    if (res?.success) {
      success(res.message!);
      loadInterfaces(false);
    } else if (res?.message) {
      error(res.message);
    }
  };

  const handleSaveDeviceToProfile = (scannedDevicesToSave: ScannedDevice[]) => {
    if (profiles.length === 0) {
      error(t.noProfilesToSave || "No profiles available to save to");
      return;
    }
    setDevicesToSave(scannedDevicesToSave);
    setShowProfilePicker(true);
  };

  const confirmSaveToProfile = (profileId: string) => {
    const selectedProfile = profiles.find(p => p.id === profileId);
    if (!selectedProfile) return;

    let existingDevices = [...(selectedProfile.devices || [])];
    let addedCount = 0;

    for (const dev of devicesToSave) {
      // Check exact match
      const exactMatchIndex = existingDevices.findIndex(e => e.ip === dev.ip && e.mac === dev.mac);
      if (exactMatchIndex !== -1) continue;

      // Check IP conflict
      const ipConflictIndex = existingDevices.findIndex(e => e.ip === dev.ip && e.mac !== dev.mac);
      if (ipConflictIndex !== -1) {
        const oldDev = existingDevices[ipConflictIndex];
        const msg = (t as any).ipConflict.replace('$ip', dev.ip).replace('$oldMac', oldDev.mac).replace('$newMac', dev.mac);
        if (window.confirm(msg)) {
          existingDevices[ipConflictIndex] = { ...oldDev, mac: dev.mac, vendor: dev.vendor || oldDev.vendor, lastSeen: new Date().toISOString() };
          addedCount++;
        }
        continue;
      }

      // Check MAC conflict
      const macConflictIndex = existingDevices.findIndex(e => e.mac === dev.mac && e.ip !== dev.ip);
      if (macConflictIndex !== -1) {
        const oldDev = existingDevices[macConflictIndex];
        const msg = (t as any).macConflict.replace('$mac', dev.mac).replace('$oldIp', oldDev.ip).replace('$newIp', dev.ip);
        if (window.confirm(msg)) {
          existingDevices[macConflictIndex] = { ...oldDev, ip: dev.ip, vendor: dev.vendor || oldDev.vendor, lastSeen: new Date().toISOString() };
          addedCount++;
        }
        continue;
      }

      // New Device
      let deviceName = dev.vendor || 'Unknown Device';
      if (devicesToSave.length === 1) {
        const promptName = prompt(t.deviceNamePrompt, deviceName);
        if (promptName === null) return;
        deviceName = promptName;
      }

      existingDevices.push({
        id: (Date.now() + Math.random()).toString(),
        name: deviceName,
        ip: dev.ip,
        mac: dev.mac,
        vendor: dev.vendor,
        type: 'Unknown',
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        isNew: true
      });
      addedCount++;
    }

    setProfiles(prev => prev.map(p => {
      if (p.id === profileId) {
        return { ...p, devices: existingDevices };
      }
      return p;
    }));

    setShowProfilePicker(false);
    setDevicesToSave([]);
    success(t.devicesSavedTo.replace('$count', addedCount.toString()).replace('$profile', selectedProfile.name));
  };

  const handleQuickApply = () => {
    if (!quickIp) return;
    handleApply({
      id: 'quick-temp', name: 'Quick Connect', type: IpType.STATIC,
      config: { ipAddress: quickIp, subnetMask: quickMask || '255.255.255.0', gateway: quickGateway, dnsPrimary: '', dnsSecondary: '' }
    });
  };

  const handleAutoConnect = async (targetIp: string) => {
    const res = await autoConnect(targetIp);
    if (res?.success) {
      success(res.message!);
      loadInterfaces(false);
    } else {
      error(res?.message || t.cmdFailed || 'Connection failed');
    }
  };


  const handleSaveProfile = (savedProfile: Profile) => {
    if (editingProfile) {
      setProfiles(prev => prev.map(p => p.id === savedProfile.id ? savedProfile : p));
      setScannerReferenceProfileId(savedProfile.id);
      success(t.profileUpdated || 'Profile updated');
    } else {
      setProfiles(prev => [...prev, savedProfile]);
      setScannerReferenceProfileId(savedProfile.id);
      success(t.profileCreated);
    }
    setIsCreating(false);
    setEditingProfile(null);
  };

  const performExport = async (data: any, filename: string, password?: string) => {
    let content = JSON.stringify(data, null, 2);

    if (password) {
      try {
        const encrypted = await encryptData(data, password);
        content = JSON.stringify({
          encrypted: true,
          version: APP_VERSION,
          data: encrypted
        });
        filename = `netmajik-secure-backup-${new Date().toISOString().split('T')[0]}.netmajik`;
      } catch (e) {
        error(t.encryptionFailed || 'Encryption failed');
        return;
      }
    } else if (settings.encryptBackups) {
      // Should not happen if flow is correct
      error(t.passwordRequired || 'Password required');
      return;
    }

    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    success(t.dataExported || 'Data exported successfully');
  };

  const handleExportData = async () => {
    const data = { profiles, snippets, credentials, settings, externalApps };
    let filename = `netmajik-backup-${new Date().toISOString().split('T')[0]}.json`;

    if (settings.encryptBackups) {
      setModalType('backup-encrypt');
      setModalOpen(true);
      return;
    }

    performExport(data, filename);
  };


  const processImportData = (data: any) => {
    if (data.profiles) setProfiles(data.profiles);
    if (data.snippets) setSnippets(data.snippets);
    if (data.credentials) setCredentials(data.credentials);
    if (data.settings) setSettings(data.settings);
    if (data.externalApps) setExternalApps(data.externalApps);
    success(t.dataImported);
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        let data: any = JSON.parse(e.target?.result as string);

        if (data.encrypted && data.data) {
          setPendingImportData(data.data);
          setModalType('backup-decrypt');
          setModalInitialVal('');
          setModalOpen(true);
          info(t.encryptedFileDetected || 'Encrypted file detected. Enter password.');
          return;
        }

        processImportData(data);
      } catch (err) {
        error(t.parseFailed || 'Failed to parse file');
      }
    };
    reader.readAsText(file);
  };


  const allTools = [
    { id: 'clipboard', label: t.clipboard, icon: <ClipboardIcon size={18} />, colorClass: "text-purple-500" },
    { id: 'connectivity', label: t.connectivity, icon: <Activity size={18} />, colorClass: "text-emerald-500" },
    { id: 'scanner', label: t.networkScanner, icon: <Radar size={18} />, colorClass: "text-indigo-500" },
    { id: 'port-scanner', label: t.portScanner, icon: <Network size={18} />, colorClass: "text-orange-500" },
    { id: 'internet', label: t.internetStatus, icon: <Globe size={18} />, colorClass: "text-sky-500" },
    { id: 'credentials', label: t.credentialLibrary, icon: <KeyRound size={18} />, colorClass: "text-amber-500" },
    { id: 'system', label: t.systemHealth, icon: <Activity size={18} />, colorClass: "text-rose-500" },
    { id: 'system-events', label: t.systemEvents || "Errores de PC", icon: <AlertTriangle size={18} />, colorClass: "text-red-600" },
    { id: 'commands', label: t.commands, icon: <Terminal size={18} />, colorClass: "text-slate-500" },
    { id: 'subnet', label: t.subnetCalculator, icon: <Calculator size={18} />, colorClass: "text-pink-500" },
    { id: 'programs', label: t.programs, icon: <Package size={18} />, colorClass: "text-emerald-600" }
  ];

  const sortedTools = [...allTools].sort((a, b) => {
    const toolOrder = settings.toolOrder || [];
    const idxA = toolOrder.indexOf(a.id);
    const idxB = toolOrder.indexOf(b.id);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });

  const SidebarItem = ({ id, icon, label, colorClass }: any) => (
    <button
      onClick={() => { setView(id); setIsCreating(false); }}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-300 border-l-4 ${view === id
        ? `bg-theme-bg-primary shadow-sm ${colorClass.replace('text-', 'border-')}`
        : 'border-transparent text-theme-text-muted hover:bg-theme-bg-hover hover:text-theme-text-primary'
        }`}
    >
      <div className={`${view === id ? colorClass : ''} transition-colors`}>{icon}</div>
      <span className={`text-sm font-semibold truncate ${view === id ? 'text-theme-text-primary' : ''}`}>{label}</span>
    </button>
  );

  return (
    <>
      <TitleBar theme={settings.theme} t={t} />
      <div className="h-screen pt-8 flex text-theme-text-primary overflow-hidden font-sans selection:bg-brand-500/30 relative" style={{ backgroundColor: settings.theme === 'matrix' ? 'transparent' : 'var(--color-bg-primary)' }}>

        <ExternalAppLauncher
          apps={externalApps}
          onUpdateApps={setExternalApps}
          language={settings.language}
          onNotify={(msg: string, type: 'success' | 'error' | 'info') => {
            if (type === 'success') success(msg);
            else if (type === 'error') error(msg);
            else info(msg);
          }}
        />

        <aside className="w-72 bg-theme-bg-secondary border-r border-theme-border-primary flex flex-col z-20 shadow-xl overflow-hidden">
          {/* Logo Area */}
          <div className="p-6 border-b border-theme-border-secondary">
            <div className="flex items-center justify-between w-full group cursor-default">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {(() => {
                    const themeIconMap: Record<string, string> = {
                      dark: './Dark.PNG',
                      light: './Light.PNG',
                      matrix: './Matrix.PNG',
                      sakura: './Sakura.PNG',
                    };
                    const iconSrc = themeIconMap[settings.theme] || './Dark.PNG';
                    return (
                      <div className="w-11 h-11 rounded-xl overflow-hidden group-hover:scale-105 transition-all duration-500 flex items-center justify-center">
                        <img
                          key={iconSrc}
                          src={iconSrc}
                          alt="NetMajik"
                          className="w-full h-full object-contain"
                          onLoad={(e) => {
                            e.currentTarget.style.display = 'block';
                            if (e.currentTarget.nextElementSibling) {
                              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'none';
                            }
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextElementSibling) {
                              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                        <div style={{ display: 'none' }} className="w-full h-full items-center justify-center bg-gradient-to-br from-theme-brand-primary to-theme-brand-hover rounded-xl">
                          <Layers size={24} className="text-white" />
                        </div>
                      </div>
                    );
                  })()}
                  <div className="absolute -inset-2 bg-theme-brand-primary/15 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-theme-text-primary tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-theme-text-primary to-theme-text-muted">NetMajik</h1>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] font-black bg-theme-brand-primary/10 text-theme-brand-primary px-1.5 py-0.5 rounded uppercase tracking-wider border border-theme-brand-primary/20">v{APP_VERSION}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsGlobalSearchOpen(true)}
                className="p-2 rounded-lg text-theme-text-muted hover:text-theme-brand-primary hover:bg-theme-bg-hover transition-all"
                title={`${t.globalSearch} (Ctrl+K)`}
              >
                <Search size={18} />
              </button>
            </div>
          </div>

          {/* Interfaces Area - FIXED */}
          <div className="px-4 py-4 border-b border-theme-border-secondary">
            <div className="flex items-center justify-between mb-3 px-3">
              <span className="text-xs font-bold text-theme-text-muted uppercase tracking-widest leading-none">Interfaces</span>
              <button onClick={() => loadInterfaces(false)} className="p-1 text-theme-text-muted hover:text-theme-brand-primary transition-colors">
                <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="space-y-1">
              {interfaces.length > 0 ? (
                interfaces.map(iface => (
                  <InterfaceCard
                    key={iface.id} iface={iface}
                    isSelected={iface.id === selectedInterfaceId}
                    onClick={handleInterfaceSelect} onToggle={handleToggleIface}
                    isToggling={isToggling === iface.id}
                  />
                ))
              ) : (
                <div className="px-3 py-4 text-center border-2 border-dashed border-theme-border-primary rounded-xl space-y-2">
                  <RefreshCw size={16} className="mx-auto text-theme-text-muted animate-spin" />
                  <p className="text-[10px] text-theme-text-muted font-medium">Buscando interfaces...</p>
                </div>
              )}
            </div>
          </div>

          {/* Tools Area - SCROLLABLE */}
          <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
            <div className="px-4 mb-4">
              <div className="px-3 mb-2">
                <span className="text-xs font-bold text-theme-text-muted uppercase tracking-widest leading-none">{t.tools}</span>
              </div>
              {sortedTools
                .filter(tool => (settings.favoriteTools || []).includes(tool.id))
                .map(tool => (
                  <SidebarItem key={tool.id} id={tool.id} label={tool.label} icon={tool.icon} colorClass={tool.colorClass} />
                ))
              }
              <button
                onClick={() => { setView('tools-manager'); setIsCreating(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 border-l-4 mt-2 ${view === 'tools-manager'
                  ? 'bg-theme-bg-primary shadow-sm border-theme-brand-primary text-theme-brand-primary'
                  : 'border-transparent text-theme-text-muted hover:bg-theme-bg-hover'
                  }`}
              >
                <LayoutGrid size={18} />
                <span className={`text-sm font-semibold truncate ${view === 'tools-manager' ? 'text-theme-text-primary' : ''}`}>{t.toolsManager}</span>
              </button>
            </div>
          </div>

          {/* Footer Area - FIXED */}
          <div className="p-4 bg-theme-bg-primary border-t border-theme-border-secondary space-y-1">
            <button
              onClick={() => window.open(DONATION_URL, '_blank')}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all text-sm font-bold"
            >
              <Heart size={18} />
              <span>{t.donate}</span>
            </button>

            <button
              onClick={() => setView('help')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-bold ${view === 'help' ? 'bg-theme-bg-secondary text-theme-brand-primary shadow-sm' : 'text-theme-text-muted hover:bg-theme-bg-hover'}`}
            >
              <HelpCircle size={18} />
              <span>{t.help}</span>
            </button>

            <button
              onClick={() => {
                if (settings.securityEnabled && settings.passwordProtectSettings && settings.password) {
                  setUnlockCallback(() => () => setIsSettingsOpen(true));
                  setIsLocked(true);
                  return;
                }
                setIsSettingsOpen(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-theme-text-muted hover:bg-theme-bg-hover transition-all text-sm font-bold group"
            >
              <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
              <span>{t.systemSettings}</span>
            </button>
          </div>
        </aside >

        <main className="flex-1 flex flex-col min-w-0 bg-theme-bg-primary relative h-full">
          <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
            <div className="max-w-5xl mx-auto animate-fade-in h-full">
              {view === 'profiles' && (
                selectedInterface ? (
                  <div className="animate-slide-up">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                      <div className="flex items-center gap-5">
                        <div className={`p-4 rounded-2xl shadow-sm ${selectedInterface.name.toLowerCase().includes('wi-fi') ? 'bg-theme-bg-tertiary text-sky-500' : 'bg-theme-bg-tertiary text-theme-brand-primary'}`}>
                          {selectedInterface.name.toLowerCase().includes('wi-fi') ? <Wifi size={32} /> : <Monitor size={32} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-3xl font-bold text-theme-text-primary flex items-center gap-3 tracking-tight">{selectedInterface.name}</h2>
                          <p className="text-theme-text-muted text-sm mt-1 font-medium">{selectedInterface.description} - {selectedInterface.macAddress}</p>
                        </div>
                      </div>
                      {!isCreating && (<button onClick={() => { setEditingProfile(null); setIsCreating(true); }} className="neo-button flex items-center gap-2 bg-theme-brand-primary hover:bg-theme-brand-hover text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-theme-brand-primary/20"><Plus size={18} /> {t.createProfile}</button>)}
                    </div>
                    {isCreating ? (
                      <CreateProfileForm initialProfile={editingProfile} onSave={handleSaveProfile} onCancel={() => setIsCreating(false)} language={settings.language} />
                    ) : (
                      <>
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                          <div className="lg:col-span-3 space-y-6">
                            <ProfileList
                              profiles={profiles}
                              onApply={handleApply}
                              onEdit={(p) => { 
                                setEditingProfile(p); 
                                setIsCreating(true); 
                                setScannerReferenceProfileId(p.id);
                              }}
                              onDelete={setProfileToDelete}
                              isApplying={isApplying}
                              language={settings.language}
                              isAdmin={isAdmin}
                              onViewInventory={(id) => {
                                setViewingInventoryProfileId(id);
                                setScannerReferenceProfileId(id);
                              }}
                              onUpdateOrder={setProfiles}
                            />
                          </div>

                          <div className="lg:col-span-1 sticky top-8">
                            <div className="glass-card border-none p-6 rounded-2xl space-y-5 shadow-xl shadow-theme-brand-primary/5">
                              <div className="flex items-center gap-2 pb-2 border-b border-theme-border-primary/50">
                                <Zap size={18} className="text-theme-brand-primary" />
                                <h3 className="font-bold text-theme-text-primary text-sm uppercase tracking-wider">{t.quickIp}</h3>
                              </div>

                              <div className="space-y-4">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest pl-1">{t.quickIp}</label>
                                  <input
                                    value={quickIp}
                                    onChange={(e) => setQuickIp(e.target.value)}
                                    className="w-full bg-theme-bg-tertiary border border-theme-border-primary rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-theme-brand-primary/50 focus:border-theme-brand-primary outline-none transition-all text-theme-text-primary placeholder:text-theme-text-muted/40"
                                    placeholder="192.168.1.55"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest pl-1">{t.mask}</label>
                                  <input
                                    value={quickMask}
                                    onChange={(e) => setQuickMask(e.target.value)}
                                    className="w-full bg-theme-bg-tertiary border border-theme-border-primary rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-theme-brand-primary/50 focus:border-theme-brand-primary outline-none transition-all text-theme-text-primary placeholder:text-theme-text-muted/40"
                                    placeholder="255.255.255.0"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest pl-1">{t.gateway}</label>
                                  <input
                                    value={quickGateway}
                                    onChange={(e) => setQuickGateway(e.target.value)}
                                    className="w-full bg-theme-bg-tertiary border border-theme-border-primary rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-theme-brand-primary/50 focus:border-theme-brand-primary outline-none transition-all text-theme-text-primary placeholder:text-theme-text-muted/40"
                                    placeholder="192.168.1.1"
                                  />
                                </div>

                                <button
                                  onClick={handleQuickApply}
                                  disabled={!quickIp || isApplying}
                                  className="neo-button w-full h-11 mt-2 bg-theme-brand-primary hover:bg-theme-brand-hover text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-theme-brand-primary/20 transition-all hover:-translate-y-0.5"
                                >
                                  <Zap size={16} />
                                  {t.quickApply}
                                </button>
                              </div>

                              <p className="text-[9px] text-theme-text-muted italic leading-tight text-center px-2">
                                {t.quickIpDesc}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-theme-text-muted border-2 border-dashed border-theme-border-primary rounded-2xl p-8 text-center">
                    <Monitor size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium">{t.selectInterfaceToManage}</p>
                  </div>
                )
              )}

              {view === 'tools-manager' && (<ToolsManager language={settings.language} settings={settings} onUpdateSettings={setSettings} availableTools={allTools} onSelectTool={setView} />)}
              {view === 'connectivity' && (
                selectedInterface ? (
                  <ConnectivityHub iface={selectedInterface} currentProfile={currentProfile} language={settings.language} targets={pingTargets} setTargets={setPingTargets} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-theme-text-muted border-2 border-dashed border-theme-border-primary rounded-2xl p-8 text-center">
                    <Activity size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium">{t.selectInterfaceToDiagnose}</p>
                  </div>
                )
              )}
              {view === 'scanner' && (
                selectedInterface ? (
                  <NetworkScanner
                    iface={selectedInterface}
                    language={settings.language}
                    scannedDevices={scannedDevices}
                    setScannedDevices={setScannedDevices}
                    isScanning={isScanning}
                    setIsScanning={setIsScanning}
                    progress={scanProgress}
                    setProgress={setScanProgress}
                    onDiagnose={(ip) => {
                      setPingTargets(prev => [...prev, { ip, status: 'unknown', lastResponse: '', history: [], stats: { sent: 0, received: 0, min: 0, max: 0, avg: 0, lastLatency: 0, loss: 0 } }]);
                      setView('connectivity');
                    }}
                    onScanPorts={(ip) => {
                      setTargetPortScannerIp(ip);
                      setView('port-scanner');
                    }}
                    onSaveToProfile={(dev) => handleSaveDeviceToProfile([dev])}
                    onSaveAllToProfile={() => handleSaveDeviceToProfile(scannedDevices)}
                    currentProfile={currentProfile}
                    profiles={profiles}
                    referenceProfileId={scannerReferenceProfileId}
                    setReferenceProfileId={setScannerReferenceProfileId}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-theme-text-muted border-2 border-dashed border-theme-border-primary rounded-2xl p-8 text-center">
                    <Radar size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium">{t.selectInterfaceToScan}</p>
                  </div>
                )
              )}
              <div className={view === 'port-scanner' ? 'block' : 'hidden'}>
                <PortScanner language={settings.language} initialIp={targetPortScannerIp} />
              </div>
              {view === 'system' && (<SystemHealth language={settings.language} eggsActive={eggsActive} />)}
              {view === 'system-events' && (<SystemEvents language={settings.language} />)}
              {view === 'subnet' && <SubnetCalculator language={settings.language} />}
              {view === 'clipboard' && (
                <ClipboardManager
                  snippets={snippets}
                  onAdd={(s) => setSnippets(prev => [...prev, s])}
                  onUpdate={(s) => setSnippets(prev => prev.map(p => p.id === s.id ? s : p))}
                  onDelete={(id) => setSnippets(prev => prev.filter(p => p.id !== id))}
                  onReorder={(newSnippets) => setSnippets(newSnippets)}
                  language={settings.language}
                  onRequirePassword={(callback: () => void) => {
                    if (settings.securityEnabled && settings.passwordProtectSnippets && settings.password) {
                      setUnlockCallback(() => callback);
                      setIsLocked(true);
                      return true;
                    }
                    return false;
                  }}
                />
              )}
              {view === 'internet' && <InternetStatus language={settings.language} />}
              {view === 'commands' && (
                selectedInterface ? (
                  <NetworkCommands
                    iface={selectedInterface}
                    language={settings.language}
                    onRenamePC={async () => {
                      let currentName = '';
                      try {
                        if ((window as any).require) {
                          const { ipcRenderer } = (window as any).require('electron');
                          const stats = await ipcRenderer.invoke('get-system-stats');
                          if (stats?.os?.computerName) currentName = stats.os.computerName;
                        }
                      } catch (e) { }
                      setModalType('rename-pc');
                      setModalInitialVal(currentName);
                      setModalOpen(true);
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-theme-text-muted border-2 border-dashed border-theme-border-primary rounded-2xl p-8 text-center">
                    <Terminal size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium">{t.selectInterfaceToCommand}</p>
                  </div>
                )
              )}
              {view === 'credentials' && <CredentialLibrary language={settings.language} credentials={credentials} onAdd={(c) => setCredentials([...credentials, c])} onUpdate={(c) => setCredentials(credentials.map(x => x.id === c.id ? c : x))} onDelete={(id) => setCredentials(credentials.filter(x => x.id !== id))} onApplyProfile={handleApply} onAutoConnect={handleAutoConnect} />}
              {view === 'programs' && <InstalledPrograms language={settings.language} eggsActive={eggsActive} />}
              {view === 'help' && <HelpGuide language={settings.language} />}
            </div>
          </div>
        </main>

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onUpdateSettings={setSettings}
          onExportData={handleExportData}
          onImportData={handleImportData}
        />

        <GlobalSearch
          isOpen={isGlobalSearchOpen}
          onClose={() => setIsGlobalSearchOpen(false)}
          profiles={profiles}
          snippets={snippets}
          credentials={credentials}
          language={settings.language as 'en' | 'es'}
          onSelectProfile={(id) => {
            const profile = profiles.find(p => p.id === id);
            if (profile) {
              if (!selectedInterfaceId && interfaces.length > 0) {
                setSelectedInterfaceId(interfaces[0].id);
              }
              setEditingProfile(profile);
              setIsCreating(false);
              setView('profiles');
              setScannerReferenceProfileId(id);
            }
          }}
          onSelectSnippet={(_id) => setView('clipboard')}
          onSelectCredential={(_id) => setView('credentials')}
          onSelectDevice={(profileId, _deviceId) => {
            if (!selectedInterfaceId && interfaces.length > 0) setSelectedInterfaceId(interfaces[0].id);
            setViewingInventoryProfileId(profileId);
            setView('profiles');
            setScannerReferenceProfileId(profileId);
          }}
        />

        {
          profileToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-bg-primary/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-theme-bg-secondary p-8 rounded-2xl shadow-2xl border border-theme-border-primary max-w-md w-full animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-4 text-rose-500 mb-6">
                  <div className="p-3 bg-rose-500/10 rounded-xl">
                    <AlertTriangle size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-theme-text-primary capitalize">{t.delete}</h3>
                    <p className="text-sm text-theme-text-muted mt-1">{t.deleteConfirm}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setProfileToDelete(null)} className="flex-1 py-3 bg-theme-bg-tertiary text-theme-text-muted rounded-xl font-semibold hover:bg-theme-bg-hover transition-all">{t.cancel}</button>
                  <button onClick={() => { setProfiles(profiles.filter(p => p.id !== profileToDelete)); setProfileToDelete(null); success('Profile deleted'); }} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 shadow-lg shadow-rose-500/20 transition-all">{t.delete}</button>
                </div>
              </div>
            </div>
          )
        }

        {
          showProfilePicker && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-theme-bg-primary/70 backdrop-blur-md animate-fade-in">
              <div className="bg-theme-bg-secondary w-full max-w-md rounded-3xl shadow-2xl border border-theme-border-primary overflow-hidden">
                <div className="p-6 border-b border-theme-border-secondary flex justify-between items-center bg-theme-bg-tertiary">
                  <div>
                    <h3 className="font-bold text-xl text-theme-text-primary">{t.pinToProfile}</h3>
                    <p className="text-theme-text-muted text-xs">{t.chooseDest?.replace('$count', devicesToSave.length.toString())}</p>
                  </div>
                  <button onClick={() => setShowProfilePicker(false)} className="p-2 hover:bg-theme-bg-hover rounded-full transition-colors text-theme-text-muted"><Plus size={20} className="rotate-45" /></button>
                </div>
                <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar space-y-2">
                  {profiles.map(p => (
                    <button
                      key={p.id}
                      onClick={() => confirmSaveToProfile(p.id)}
                      className="w-full p-4 rounded-2xl border border-theme-border-primary hover:border-theme-brand-primary hover:bg-theme-brand-primary/5 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-theme-bg-tertiary flex items-center justify-center text-theme-text-muted group-hover:text-theme-brand-primary group-hover:bg-theme-brand-primary/10 transition-colors">
                            <Network size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-theme-text-primary group-hover:text-theme-brand-primary">{p.name}</p>
                            <p className="text-[10px] text-theme-text-muted uppercase tracking-widest">{p.type === IpType.DHCP ? 'DHCP' : p.config?.ipAddress}</p>
                          </div>
                        </div>
                        <Plus size={16} className="text-theme-text-tertiary group-hover:text-theme-brand-primary" />
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-6 bg-theme-bg-tertiary">
                  <button onClick={() => setShowProfilePicker(false)} className="w-full py-3 rounded-xl font-bold text-theme-text-muted hover:bg-theme-bg-hover transition-colors">{t.cancel}</button>
                </div>
              </div>
            </div>
          )
        }

        {
          viewingInventoryProfileId && (
            <InventoryManager
              profileId={viewingInventoryProfileId}
              onClose={() => setViewingInventoryProfileId(null)}
              profiles={profiles}
              setProfiles={setProfiles}
              language={settings.language}
              onSuccess={success}
            />
          )
        }

        {
          isLocked && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-theme-bg-primary p-6 animate-in fade-in duration-500">
              <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

              <div className="w-full max-w-sm bg-theme-bg-secondary border border-theme-border-primary p-8 rounded-[2rem] shadow-2xl relative z-10 text-center animate-in zoom-in-95 duration-300">
                <div className="mb-6 inline-flex p-4 rounded-3xl bg-theme-brand-primary/10 text-theme-brand-primary">
                  <Shield size={48} className={isRecovering ? 'text-rose-500' : ''} />
                </div>
                <h2 className="text-2xl font-bold text-theme-text-primary mb-2">{isRecovering ? t.recoveryTitle : t.verifyPassword}</h2>
                <p className="text-xs text-theme-text-muted mb-8 uppercase tracking-widest font-bold">{t.secureAccess}</p>

                <div className="space-y-4">
                  {!isRecovering ? (
                    <>
                      <div className="relative">
                        <input
                          type="password"
                          autoFocus
                          placeholder="••••••••"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (e.currentTarget.value === settings.password) {
                                setIsLocked(false);
                                setPasswordError(false);
                              }
                              else {
                                setPasswordError(true);
                                e.currentTarget.classList.add('animate-shake');
                                setTimeout(() => e.currentTarget.classList.remove('animate-shake'), 500);
                              }
                            }
                          }}
                          onChange={() => setPasswordError(false)}
                          className={`w-full text-center py-4 bg-theme-bg-tertiary border rounded-2xl text-xl outline-none focus:ring-4 focus:ring-theme-brand-primary/10 transition-all text-theme-text-primary ${passwordError ? 'border-rose-500 focus:border-rose-500' : 'border-theme-border-primary focus:border-theme-brand-primary'}`}
                        />
                        {capsLock && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-black text-amber-500 uppercase tracking-tighter animate-pulse">
                            <Plus size={10} className="rotate-45" /> {t.capsLockOn}
                          </div>
                        )}
                      </div>
                      {passwordError && <p className="text-[10px] font-bold text-rose-500 uppercase animate-in fade-in slide-in-from-top-1">{t.wrongPassword || 'Incorrect Password'}</p>}
                      <button
                        onClick={() => setIsRecovering(true)}
                        className="text-[10px] text-theme-text-muted font-bold uppercase hover:text-theme-brand-primary transition-colors"
                      >
                        {t.recoveryLink}
                      </button>
                    </>
                  ) : (
                    <div className="space-y-4 text-left">
                      <div className="p-3 bg-theme-bg-tertiary rounded-xl border border-theme-border-primary">
                        <p className="text-[10px] font-bold text-theme-text-muted uppercase mb-1">{t.recoveryQuestion}</p>
                        <p className="text-sm text-theme-text-primary font-medium italic">"{(t as any)[`question${settings.recoveryQuestion?.charAt(0).toUpperCase()}${settings.recoveryQuestion?.slice(1)}`] || '???'}"</p>
                      </div>
                      <input
                        type="text"
                        placeholder={t.recoveryAnswer}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.toLowerCase() === settings.recoveryAnswer?.toLowerCase()) {
                            setIsLocked(false);
                            setIsRecovering(false);
                          }
                        }}
                        className="w-full py-3 px-4 bg-theme-bg-tertiary border border-theme-border-primary rounded-xl text-sm outline-none focus:border-rose-500 text-theme-text-primary"
                      />
                      <button
                        onClick={() => setIsRecovering(false)}
                        className="w-full py-2 text-xs font-bold text-theme-text-muted uppercase"
                      >
                        {t.backToLogin}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }

        {
          showAdminPrompt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-bg-primary/70 backdrop-blur-sm animate-fade-in">
              <div className="bg-theme-bg-secondary p-8 rounded-2xl shadow-2xl max-w-md border border-theme-border-primary">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-theme-brand-primary/10 text-theme-brand-primary rounded-xl">
                    <Shield size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-theme-text-primary">{t.adminNeeded}</h3>
                    <p className="text-theme-text-muted text-xs uppercase tracking-widest font-bold">{t.elevationRequired || "Elevation Required"}</p>
                  </div>
                </div>
                <p className="text-theme-text-muted text-sm mb-8 leading-relaxed">{t.adminNeededDesc}</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowAdminPrompt(false)} className="flex-1 py-3 bg-theme-bg-tertiary border border-theme-border-primary rounded-xl font-bold text-theme-text-muted">{t.gotIt || "Got it"}</button>
                  {isAdmin === false && (
                    <button onClick={() => (window as any).require('electron').ipcRenderer.invoke('relaunch-elevated')} className="flex-1 py-3 bg-theme-brand-primary text-white rounded-xl font-bold hover:bg-theme-brand-hover shadow-lg shadow-theme-brand-primary/20 transition-all">{t.relaunchAsAdmin || "Relaunch as Admin"}</button>
                  )}
                </div>
              </div>
            </div>
          )
        }

        <InputModal
          t={t}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={
            modalType === 'backup-encrypt' ? t.encryptBackups :
              modalType === 'backup-decrypt' ? t.encryptionPassword :
                modalType === 'rename-pc' ? t.changeNameTitle : ''
          }
          confirmLabel={modalType === 'backup-encrypt' ? t.export : modalType === 'backup-decrypt' ? t.import : modalType === 'rename-pc' ? t.apply : t.save}
          cancelLabel={t.cancel}
          message={modalType === 'backup-encrypt' || modalType === 'backup-decrypt' ? t.enterPasswordDesc : modalType === 'rename-pc' ? t.changeNameMessage : ''}
          defaultValue={modalInitialVal}
          placeholder={modalType === 'rename-pc' ? t.name : t.password}
          isPassword={modalType.startsWith('backup')}
          onConfirm={async (val) => {
            if (modalType === 'backup-encrypt') {
              performExport({ profiles, snippets, credentials, settings, externalApps }, `netmajik-backup-${new Date().toISOString().split('T')[0]}.json`, val);
            } else if (modalType === 'backup-decrypt') {
              if (!pendingImportData) return;
              try {
                const decrypted = await decryptData(pendingImportData, val);
                processImportData(decrypted);
                setPendingImportData(null);
              } catch (e) {
                error(t.decryptionFailed);
              }
            } else if (modalType === 'rename-pc') {
              try {
                if ((window as any).require) {
                  const { ipcRenderer } = (window as any).require('electron');
                  const res = await ipcRenderer.invoke('set-computer-name', { newName: val });
                  if (res.success) {
                    success(`${res.message}`);
                  }
                }
              } catch (err: any) {
                error(err.message || t.cmdFailed || 'Rename failed');
              }
            }
          }}
        />

        <ConfirmModal
          isOpen={!!deviceToDelete}
          onClose={() => setDeviceToDelete(null)}
          onConfirm={() => {
            if (deviceToDelete) {
              setProfiles(prev => prev.map(p => p.id === deviceToDelete.profileId ? { ...p, devices: p.devices?.filter(d => d.id !== deviceToDelete.deviceId) } : p));
              setDeviceToDelete(null);
              success('Device removed');
            }
          }}
          title={t.delete || 'Delete'}
          message={t.deleteDeviceConfirm || 'Are you sure you want to remove this device?'}
          confirmLabel={t.delete || 'Delete'}
          cancelLabel={t.cancel || 'Cancel'}
          variant="danger"
        />

      </div>


      {/* Easter Egg Tracker Component placed directly inside the main wrapper */}
      <EasterEggTracker theme={settings.theme} language={settings.language} />
    </>
  );
};

export default App;
