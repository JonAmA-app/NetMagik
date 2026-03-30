
export enum IpType {
  DHCP = 'DHCP',
  STATIC = 'Static'
}

export interface IpConfig {
  ipAddress: string;
  subnetMask: string;
  gateway: string;
  dnsPrimary: string;
  dnsSecondary: string;
}

export interface Profile {
  id: string;
  name: string;
  type: IpType;
  config?: IpConfig;
  devices?: ProfileDevice[];
  lastScanDate?: string;
  scanHistory?: ScannedDevice[];
}

export interface ProfileDevice {
  id: string;
  name: string;
  ip: string;
  mac?: string;
  type?: 'PC' | 'Laptop' | 'Server' | 'Mobile' | 'Router' | 'Switch' | 'Printer' | 'Camera' | 'Unknown' | string;
  customClass?: string;
  vendor?: string;
  firstSeen?: string;
  lastSeen?: string;
  isNew?: boolean;
}

export interface ScannedDevice {
  ip: string;
  mac: string;
  hostname: string;
  vendor: string;
  latency?: number;
  type?: DeviceType;
  status?: 'online' | 'offline';
  label?: string;
  isNew?: boolean;       // IP not found in saved profile
  macChanged?: boolean;  // IP found but MAC is different
  savedMac?: string;     // The MAC address previously saved in the profile
}

export type DeviceType = 'Router' | 'Switch' | 'AP' | 'Camera' | 'Printer' | 'PC' | 'Mobile' | 'Server' | 'IoT' | 'Unknown';

export interface NetworkInterface {
  id: string;
  name: string;
  description: string;
  status: 'Connected' | 'Disconnected' | 'Disabled';
  currentProfileId?: string;
  macAddress: string;
  currentIp: string;
  netmask: string;
  gateway?: string;
}

export interface ClipboardSnippet {
  id: string;
  label: string;
  value: string;
  shortcut?: string;
  autoPaste?: boolean;
}

export interface PingTarget {
  ip: string;
  status: 'active' | 'timeout' | 'unreachable' | 'net_unreachable' | 'unknown';
  lastResponse: string;
  stats: PingStats;
  history: number[];
}

export interface PingStats {
  sent: number;
  received: number;
  min: number;
  max: number;
  avg: number;
  lastLatency: number;
  loss: number;
}

export interface PingHistory {
  timestamp: number;
  latency: number;
}



export interface PublicIpInfo {
  query: string;
  isp: string;
  org: string;
  country: string;
  countryCode: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
}

export interface DeviceCredential {
  id: string;
  vendor: string;
  model: string;
  ip: string;
  username: string;
  password: string;
  type: 'Router' | 'Switch' | 'AP' | 'Camera' | 'Modem' | 'Other';
}

export interface ExternalApp {
  id: string;
  name: string;
  path: string;
  iconName: string;
  iconData?: string; // Base64 data of the original icon
}

export interface StorageInfo {
  drive: string;
  free: number;
  total: number;
  label: string;
  status: string;
  type: string;
  model?: string;
  windowsSize?: number;
}

export interface SystemStats {
  cpu: {
    model: string;
    cores: number;
  };
  mem: {
    total: number;
    free: number;
    type: string;
    speed: number;
    slotsTotal: number;
    slotsUsed: number;
  };
  storage: StorageInfo[];
  os: {
    platform: string;
    distro: string;
    release: string;
    arch: string;
    hostname: string;
    computerName: string;
    firewallStatus: 'Active' | 'Inactive';
    firewallProvider: string;
  };
}

export type Language = 'en' | 'es' | 'pt' | 'de' | 'fr' | 'zh' | 'ja';
export type Theme = 'dark' | 'light' | 'matrix' | 'sakura';

export interface AppSettings {
  theme: Theme;
  language: Language;
  startMaximized: boolean;
  favoriteTools: string[];
  toolOrder: string[];
  globalShortcuts: boolean;
  appHotkey: string;
  securityEnabled: boolean;
  password?: string;
  recoveryQuestion?: string;
  recoveryAnswer?: string;
  passwordProtectSettings: boolean;
  passwordProtectWake: boolean;
  passwordProtectSnippets: boolean;
  encryptBackups: boolean;
  systemNotifications: boolean;
  notificationSound: boolean;
  monitorSystemEvents: boolean;
}

declare global {
  interface Window {
    electronAPI: {
      windowManage: (action: string) => Promise<any>;
      updateThemeIcon: (theme: string) => void;
      updateShortcuts: (settings: any) => void;
      updateSnippetShortcuts: (snippets: any[]) => void;
      updateMinimizeBehavior: (behavior: 'taskbar' | 'tray') => void;
      isProcessElevated: () => Promise<boolean>;
      relaunchElevated: () => Promise<void>;
      rebootToBios: () => Promise<any>;
      showNotification: (payload: { title: string, body: string }) => Promise<void>;
      sendCustomToast: (payload: { toast: any, playSound: boolean }) => void;
      notificationWindowEmpty: () => void;
      getWingetUpdates: () => Promise<any>;
      updateWingetApp: (appId: string) => Promise<any>;
      checkShortcut: (shortcut: string) => Promise<boolean>;
      getWindowsInterfaces: () => Promise<any[]>;
      toggleInterface: (payload: { ifaceName: string, enable?: boolean, action?: string }) => Promise<any>;
      changeIpConfig: (payload: { ifaceName: string, profile: any }) => Promise<any>;
      findAndSetIp: (payload: { ifaceName: string, targetIp: string }) => Promise<any>;
      executeNetworkCommand: (payload: { command: string, params?: any }) => Promise<any>;
      pingTarget: (payload: { ip: string }) => Promise<any>;
      scanRange: (payload: { startIp: string, endIp: string }) => Promise<any>;
      stopScanRange: () => void;
      scanMdns: () => Promise<any[]>;
      checkPort: (payload: { host: string, port: number }) => Promise<boolean>;
      openExternalCmd: (payload: { targetIp: string }) => Promise<any>;
      toggleFirewall: (payload: { action: string }) => Promise<any>;
      getSystemStats: () => Promise<any>;
      getSystemEvents: () => Promise<any>;
      openEventViewer: () => Promise<any>;
      getInstalledPrograms: () => Promise<any[]>;
      exportPrograms: (payload: { programs: any[], format: string }) => Promise<any>;
      checkDiskErrors: (drive: string) => Promise<any>;
      selectExecutableFile: () => Promise<any>;
      launchExternalApp: (appPath: string) => Promise<any>;
      fetchOuiDatabase: () => Promise<any>;
      manualSnippetAction: (payload: { autoPaste: boolean, value: string }) => void;
      onNavigateTo: (callback: (target: string) => void) => void;
      onSystemResume: (callback: () => void) => void;
      onWingetProgress: (callback: (data: any) => void) => void;
      onScanRangeProgress: (callback: (data: any) => void) => void;
      onShowCustomToast: (callback: (toast: any) => void) => void;
      runTraceroute: (payload: { target: string }) => Promise<any>;
      onTracerouteData: (callback: (data: string) => void) => void;
      removeListeners: (channel: string) => void;
    };
  }

}
