import React, { useState } from 'react';
import {
  Clipboard as ClipboardIcon,
  Search,
  Scan,
  KeyRound,
  Wifi,
  Monitor,
  ArrowRight,
  Star,
  Settings2,
  Plus,
  Check,
  RefreshCw,
  MoreVertical,
  Layers,
  Shield,
  SlidersHorizontal,
  ChevronRight,
  Loader2,
  Heart,
  HelpCircle,
  Settings,
  Folder,
  FolderOpen,
  ChevronDown,
  Zap
} from 'lucide-react';
import { NetworkInterface, Profile, IpType, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface BasicDashboardProps {
  interfaces: NetworkInterface[];
  selectedInterface?: NetworkInterface;
  onSelectInterface: (iface: NetworkInterface) => void;
  profiles: Profile[];
  onApplyProfile: (profile: Profile) => void;
  isApplying?: boolean;
  onSelectView: (view: string) => void;
  onCreateProfile: () => void;
  onManageProfiles: () => void;
  onOpenSettings: () => void;
  onOpenDonate: () => void;
  onOpenHelp: () => void;
  language: Language;
  onRefreshInterfaces?: () => void;
  isRefreshing?: boolean;
  onRenewIp?: () => void;
}

export const BasicDashboard: React.FC<BasicDashboardProps> = ({
  interfaces,
  selectedInterface,
  onSelectInterface,
  profiles,
  onApplyProfile,
  isApplying,
  onSelectView,
  onCreateProfile,
  onManageProfiles,
  onOpenSettings,
  onOpenDonate,
  onOpenHelp,
  language,
  onRefreshInterfaces,
  isRefreshing,
  onRenewIp
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (folderName: string) => {
    setCollapsedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderName)) next.delete(folderName);
      else next.add(folderName);
      return next;
    });
  };

  // Current interface IP / details
  const activeIface = selectedInterface || interfaces.find(i => i.status === 'Connected' || (i.currentIp && i.currentIp !== '0.0.0.0')) || interfaces[0];
  const isAnyConnected = interfaces.some(i => i.status === 'Connected' || (!!i.currentIp && i.currentIp !== '0.0.0.0' && i.currentIp !== '127.0.0.1'));
  const isCurrentConnected = activeIface?.status === 'Connected' || (!!activeIface?.currentIp && activeIface.currentIp !== '0.0.0.0' && activeIface.currentIp !== '127.0.0.1');

  // Subnet / Gateway / DNS fallbacks
  const currentIp = (activeIface?.currentIp && activeIface.currentIp !== '0.0.0.0') ? activeIface.currentIp : (isCurrentConnected ? '192.168.1.100' : '0.0.0.0');
  const defaultGw = currentIp !== '0.0.0.0' ? `${currentIp.split('.').slice(0, 3).join('.')}.1` : '0.0.0.0';
  const currentGateway = (activeIface?.gateway && activeIface.gateway !== '0.0.0.0') ? activeIface.gateway : (isCurrentConnected ? defaultGw : '0.0.0.0');
  const currentMask = (activeIface?.netmask && activeIface.netmask !== '0.0.0.0') ? activeIface.netmask : (isCurrentConnected ? '255.255.255.0' : '0.0.0.0');
  const currentDns = isCurrentConnected ? '1.1.1.1 / 8.8.8.8' : '—';

  // Check if profile is active on active interface
  const isProfileActive = (p: Profile) => {
    if (!activeIface) return false;
    return activeIface.currentProfileId === p.id;
  };

  // Group profiles into folders vs standalone
  type Block =
    | { type: 'folder'; name: string; profiles: Profile[] }
    | { type: 'profile'; profile: Profile };

  const blocks: Block[] = [];
  const seenFolders = new Set<string>();

  profiles.forEach(p => {
    const folderName = p.folder?.trim();
    if (folderName) {
      if (!seenFolders.has(folderName)) {
        seenFolders.add(folderName);
        const folderProfiles = profiles.filter(x => x.folder?.trim() === folderName);
        blocks.push({
          type: 'folder',
          name: folderName,
          profiles: folderProfiles
        });
      }
    } else {
      blocks.push({
        type: 'profile',
        profile: p
      });
    }
  });

  const renderProfileItem = (profile: Profile) => {
    const isActive = isProfileActive(profile);
    const isDhcp = profile.type === IpType.DHCP;
    const ipDisplay = isDhcp
      ? (t.dhcpDescription || 'DHCP Automático')
      : `${profile.config?.ipAddress || '192.168.1.50'}/${profile.config?.subnetMask === '255.255.255.0' ? '24' : '24'}`;

    return (
      <div
        key={profile.id}
        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
          isActive
            ? 'bg-blue-600/15 border-blue-500/50 shadow-sm ring-1 ring-blue-500/20'
            : 'bg-theme-bg-tertiary/50 border-theme-border-primary/60 hover:border-theme-border-primary'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2 rounded-lg ${
            isActive ? 'bg-blue-500 text-white shadow-sm' : 'bg-theme-bg-secondary text-sky-400 border border-theme-border-primary'
          }`}>
            {isDhcp ? <Layers size={16} /> : <Shield size={16} />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-theme-text-primary truncate">
                {profile.name}
              </h4>
              {profile.folder && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                  {profile.folder}
                </span>
              )}
            </div>
            <p className="text-[11px] text-theme-text-muted font-mono truncate">
              {ipDisplay}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onApplyProfile(profile)}
            disabled={isApplying}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1.5 ${
              isActive
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
            }`}
            title={isActive ? 'Re-aplicar configuración' : 'Aplicar configuración'}
          >
            {isApplying ? (
              <Loader2 size={12} className="animate-spin" />
            ) : isActive ? (
              <>
                <Check size={12} />
                <span>{t.apply || 'Aplicar'}</span>
              </>
            ) : (
              <span>{t.apply || 'Aplicar'}</span>
            )}
          </button>
          <button
            onClick={onManageProfiles}
            className="p-1 rounded text-theme-text-muted hover:text-theme-text-primary transition-colors"
            title={t.manage || 'Gestionar'}
          >
            <MoreVertical size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      {/* 1. Header / Greeting Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-theme-text-primary tracking-tight">
            {t.helloUser || 'Hola,'}
          </h1>
          <p className="text-sm text-theme-text-muted mt-1 font-medium">
            {t.basicDashboardSubtitle || 'Selecciona una opción para empezar o elige una red / rango rápido.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Clean Status Indicator */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md transition-all ${
            isAnyConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/10'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isAnyConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{isAnyConnected ? (t.onlineStatus || 'En línea') : (t.disconnectedStatus || 'Sin conexión')}</span>
          </div>

          {onRefreshInterfaces && (
            <button
              onClick={onRefreshInterfaces}
              className="p-2 rounded-xl bg-theme-bg-secondary hover:bg-theme-bg-hover text-theme-text-muted hover:text-theme-text-primary border border-theme-border-primary transition-all"
              title={t.refresh || 'Refrescar'}
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          )}

          {/* Quick Actions in Header */}
          <button
            onClick={onOpenDonate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all shadow-sm group"
            title={t.donate || 'Donar'}
          >
            <Heart size={14} className="group-hover:scale-110 transition-transform fill-rose-500/30 text-rose-400" />
            <span>{t.donate || 'Donar'}</span>
          </button>

          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-bg-secondary hover:bg-theme-bg-hover text-theme-text-muted hover:text-theme-text-primary border border-theme-border-primary text-xs font-bold transition-all shadow-sm"
            title={t.help || 'Ayuda'}
          >
            <HelpCircle size={14} />
            <span>{t.help || 'Ayuda'}</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-bg-secondary hover:bg-theme-bg-hover text-theme-text-muted hover:text-theme-text-primary border border-theme-border-primary text-xs font-bold transition-all shadow-sm group"
            title={t.systemSettings || 'Ajustes'}
          >
            <Settings size={14} className="group-hover:rotate-45 transition-transform duration-300" />
            <span>{t.systemSettings || 'Ajustes'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Portapapeles (Top Priority Core Tool) */}
        <div
          onClick={() => onSelectView('clipboard')}
          className="group relative rounded-2xl p-5 bg-gradient-to-b from-sky-950/30 via-theme-bg-secondary to-theme-bg-secondary border border-sky-500/40 hover:border-sky-400 shadow-lg shadow-sky-500/5 hover:shadow-sky-500/15 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300 shadow-sm">
              <ClipboardIcon size={22} />
            </div>
            <h3 className="text-lg font-bold text-theme-text-primary group-hover:text-sky-300 transition-colors">
              {t.clipboardCardTitle || 'Portapapeles'}
            </h3>
            <p className="text-xs text-theme-text-muted mt-1.5 leading-relaxed">
              {t.clipboardCardDesc || 'Accede rápidamente con tus recortes, IPs y comandos guardados.'}
            </p>
          </div>
          <div className="flex justify-end mt-4">
            <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-all">
              <ArrowRight size={15} />
            </div>
          </div>
        </div>

        {/* Card 2: Ping */}
        <div
          onClick={() => onSelectView('connectivity')}
          className="group relative rounded-2xl p-5 bg-gradient-to-b from-indigo-950/25 via-theme-bg-secondary to-theme-bg-secondary border border-theme-border-primary hover:border-indigo-500/50 shadow-lg shadow-indigo-500/5 hover:shadow-indigo-500/15 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-sm">
              <Search size={22} />
            </div>
            <h3 className="text-lg font-bold text-theme-text-primary group-hover:text-indigo-300 transition-colors">
              {t.pingCardTitle || 'Ping'}
            </h3>
            <p className="text-xs text-theme-text-muted mt-1.5 leading-relaxed">
              {t.pingCardDesc || 'Comprueba si una IP o equipo responde.'}
            </p>
          </div>
          <div className="flex justify-end mt-4">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
              <ArrowRight size={15} />
            </div>
          </div>
        </div>

        {/* Card 3: Descubrir equipos */}
        <div
          onClick={() => onSelectView('scanner')}
          className="group relative rounded-2xl p-5 bg-gradient-to-b from-teal-950/25 via-theme-bg-secondary to-theme-bg-secondary border border-theme-border-primary hover:border-teal-500/50 shadow-lg shadow-teal-500/5 hover:shadow-teal-500/15 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 shadow-sm">
              <Scan size={22} />
            </div>
            <h3 className="text-lg font-bold text-theme-text-primary group-hover:text-teal-300 transition-colors">
              {t.discoverCardTitle || 'Descubrir equipos'}
            </h3>
            <p className="text-xs text-theme-text-muted mt-1.5 leading-relaxed">
              {t.discoverCardDesc || 'Escanea la red y encuentra dispositivos.'}
            </p>
          </div>
          <div className="flex justify-end mt-4">
            <div className="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-all">
              <ArrowRight size={15} />
            </div>
          </div>
        </div>

        {/* Card 4: Credenciales */}
        <div
          onClick={() => onSelectView('credentials')}
          className="group relative rounded-2xl p-5 bg-gradient-to-b from-purple-950/25 via-theme-bg-secondary to-theme-bg-secondary border border-theme-border-primary hover:border-purple-500/50 shadow-lg shadow-purple-500/5 hover:shadow-purple-500/15 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-sm">
              <KeyRound size={22} />
            </div>
            <h3 className="text-lg font-bold text-theme-text-primary group-hover:text-purple-300 transition-colors">
              {t.credentialsCardTitle || 'Credenciales'}
            </h3>
            <p className="text-xs text-theme-text-muted mt-1.5 leading-relaxed">
              {t.credentialsCardDesc || 'Accede rápidamente con tus credenciales guardadas.'}
            </p>
          </div>
          <div className="flex justify-end mt-4">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
              <ArrowRight size={15} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Red actual vs Rangos / Perfiles rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Panel: Red actual */}
        <div className="rounded-2xl p-5 bg-theme-bg-secondary border border-theme-border-primary shadow-lg flex flex-col justify-between space-y-4">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-theme-border-primary/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400">
                  <Wifi size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-theme-text-primary">
                    {t.currentNetwork || 'Red actual'}
                  </h2>
                </div>
              </div>
              <button
                onClick={onManageProfiles}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
                title={t.networkInterfacesLink || 'Gestionar interfaces'}
              >
                <span>{activeIface?.name || 'Wi-Fi'}</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* List of Interfaces */}
            <div className="mt-4 space-y-3">
              {interfaces.length > 0 ? (
                interfaces.map(iface => {
                  const isSelected = activeIface?.id === iface.id;
                  const isConnected = iface.status === 'Connected' || (!!iface.currentIp && iface.currentIp !== '0.0.0.0' && iface.currentIp !== '127.0.0.1');
                  const isWifi = iface.name.toLowerCase().includes('wi-fi') || iface.name.toLowerCase().includes('wireless') || iface.name.toLowerCase().includes('wlan');
                  const extraIps = (iface.allIps || []).filter(ip => ip !== iface.currentIp && ip !== '0.0.0.0');

                  return (
                    <div
                      key={iface.id}
                      onClick={() => onSelectInterface(iface)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-theme-bg-tertiary/95 border-sky-500 shadow-md ring-2 ring-sky-500/30'
                          : 'bg-theme-bg-tertiary/40 border-theme-border-primary/50 hover:border-theme-border-primary opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2.5 rounded-xl ${
                            isSelected
                              ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                              : isConnected
                                ? (isWifi ? 'bg-sky-500/20 text-sky-400' : 'bg-emerald-500/20 text-emerald-400')
                                : 'bg-theme-bg-secondary text-theme-text-muted'
                          }`}>
                            {isWifi ? <Wifi size={18} /> : <Monitor size={18} />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-theme-text-primary truncate">{iface.name}</span>
                              {isSelected && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center gap-1">
                                  <Check size={10} className="stroke-[3]" />
                                  {t.selectedInterfaceBadge || 'Seleccionada'}
                                </span>
                              )}
                              {!isConnected && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                                  {t.disconnectedStatus || 'Sin conexión'}
                                </span>
                              )}
                            </div>

                            {/* IP Information: Primary IP + Secondary IPs */}
                            <div className="mt-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold font-mono text-theme-text-primary">
                                  {isConnected ? `${iface.currentIp}` : '0.0.0.0'}
                                </span>
                                {isConnected && iface.currentIp && iface.currentIp !== '0.0.0.0' && (
                                  <span className="text-[9px] font-sans font-semibold px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30">
                                    {(t as any).primaryIp || 'Principal'}
                                  </span>
                                )}
                              </div>

                              {/* Additional IPs */}
                              {isConnected && extraIps.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1 mt-1">
                                  <span className="text-[10px] text-theme-text-muted font-sans font-medium">
                                    {(t as any).otherIps || 'Otras IPs'}:
                                  </span>
                                  {extraIps.map((ip, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20"
                                    >
                                      {ip}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex items-center gap-2 shrink-0 ml-auto">
                            {onRenewIp && isConnected && (
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  onRenewIp();
                                }}
                                disabled={isApplying}
                                className="px-2.5 py-1.5 rounded-lg bg-theme-bg-secondary hover:bg-amber-500 hover:text-white border border-theme-border-primary text-xs font-semibold text-theme-text-primary flex items-center gap-1.5 transition-all shadow-sm group/renew"
                                title={t.reassignIpDesc || 'Reasignar IP / Renovar DHCP'}
                              >
                                <Zap size={13} className="text-amber-400 group-hover/renew:text-white transition-colors" />
                                <span>{t.reassignIp || 'Reasignar IP'}</span>
                              </button>
                            )}
                            {isConnected && (
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  onManageProfiles();
                                }}
                                className="px-3 py-1.5 rounded-lg bg-theme-bg-secondary hover:bg-sky-500 hover:text-white border border-theme-border-primary text-xs font-semibold text-theme-text-primary flex items-center gap-1.5 transition-all shadow-sm"
                              >
                                <SlidersHorizontal size={13} />
                                <span>{t.changeNetworkOrRange || 'Cambiar red'}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Network Details Grid for Selected Interface */}
                      {isSelected && isConnected && (
                        <div className="mt-3 pt-3 border-t border-theme-border-primary/50 grid grid-cols-3 gap-4 text-left">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-theme-text-muted tracking-wider block">
                              {t.gateway || 'Puerta de enlace'}
                            </span>
                            <span className="text-xs font-mono font-semibold text-theme-text-primary">
                              {iface.gateway || currentGateway}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-theme-text-muted tracking-wider block">
                              {t.subnetMask || 'Máscara de subred'}
                            </span>
                            <span className="text-xs font-mono font-semibold text-theme-text-primary">
                              {iface.netmask || currentMask}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-theme-text-muted tracking-wider block">
                              DNS
                            </span>
                            <span className="text-xs font-mono font-semibold text-theme-text-primary truncate block">
                              {currentDns}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-theme-text-muted border border-dashed border-theme-border-primary rounded-xl text-xs">
                  {t.noInterfaces || 'No se detectaron interfaces'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Rangos / Perfiles rápidos */}
        <div className="rounded-2xl p-5 bg-theme-bg-secondary border border-theme-border-primary shadow-lg flex flex-col justify-between space-y-4">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-theme-border-primary/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400">
                  <Star size={18} />
                </div>
                <h2 className="text-base font-bold text-theme-text-primary">
                  {t.quickRangesAndProfiles || 'Rangos / Perfiles rápidos'}
                </h2>
              </div>
              <button
                onClick={onManageProfiles}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-theme-bg-tertiary border border-theme-border-primary transition-colors"
              >
                <Settings2 size={13} />
                <span>{t.manage || 'Gestionar'}</span>
              </button>
            </div>

            {/* Clear target interface indicator banner */}
            <div className="mt-3 px-3.5 py-2 rounded-xl bg-sky-500/10 border border-sky-500/25 text-xs text-sky-300 flex items-center justify-between gap-2 shadow-inner">
              <div className="flex items-center gap-2 truncate">
                <span className="text-theme-text-muted text-[11px] uppercase font-bold tracking-wider">{t.applyingChangesTo || 'Aplicando cambios en:'}</span>
                <strong className="font-extrabold text-theme-text-primary truncate">{activeIface?.name || 'Wi-Fi'}</strong>
              </div>
              <span className="font-mono text-[11px] text-sky-400 font-bold bg-sky-500/15 px-2 py-0.5 rounded border border-sky-500/30 shrink-0">
                {currentIp}
              </span>
            </div>

            {/* Scrollable Profiles List with Folders */}
            <div className="mt-3 space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {blocks.length > 0 ? (
                blocks.map(block => {
                  if (block.type === 'folder') {
                    const isCollapsed = collapsedFolders.has(block.name);
                    return (
                      <div key={block.name} className="space-y-1.5 border border-theme-border-primary/40 rounded-xl p-2 bg-theme-bg-secondary/40">
                        <button
                          onClick={() => toggleFolder(block.name)}
                          className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-theme-bg-hover text-xs font-bold text-amber-400 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {isCollapsed ? <Folder size={14} /> : <FolderOpen size={14} />}
                            <span>{block.name}</span>
                            <span className="text-[10px] text-theme-text-muted font-normal">({block.profiles.length})</span>
                          </div>
                          <ChevronDown size={14} className={`text-theme-text-muted transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
                        </button>
                        {!isCollapsed && (
                          <div className="space-y-2 pl-2">
                            {block.profiles.map(p => renderProfileItem(p))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return renderProfileItem(block.profile);
                })
              ) : (
                <div className="p-4 text-center text-theme-text-muted text-xs border border-dashed border-theme-border-primary rounded-xl">
                  {t.noProfilesToSave || 'No hay perfiles guardados'}
                </div>
              )}
            </div>
          </div>

          {/* Add Custom Range / Profile Button */}
          <button
            onClick={onCreateProfile}
            className="w-full py-2.5 rounded-xl border border-dashed border-sky-500/40 text-sky-400 hover:bg-sky-500/10 text-xs font-bold flex items-center justify-center gap-2 transition-all mt-2"
          >
            <Plus size={15} />
            <span>{t.addCustomRange || '+ Añadir rango personalizado'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
