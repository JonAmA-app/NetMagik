import React, { useState, useEffect } from 'react';
import { Language, NetworkInterface } from '../types';
import { TRANSLATIONS } from '../constants';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from './ConfirmModal';
import {
  Sliders, Search, Plus, Trash2, Terminal, Shield, Cpu, Activity,
  Globe, Network, FileText, Database, Wrench, ExternalLink, X, Save,
  RefreshCw, Zap, Edit2, Monitor, Minimize2, Maximize2
} from 'lucide-react';

interface CustomShortcut {
  id: string;
  name: string;
  command: string;
  description?: string;
  category?: string;
}

interface WindowsShortcutsProps {
  language: Language;
  iface?: NetworkInterface;
  onRenamePC?: () => void;
}

export const WindowsShortcuts: React.FC<WindowsShortcutsProps> = ({ language, iface, onRenamePC }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
  const { success, error } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'maintenance' | 'system' | 'custom'>('all');
  const [customShortcuts, setCustomShortcuts] = useState<CustomShortcut[]>(() => {
    const saved = localStorage.getItem('NetMajik_custom_win_shortcuts');
    return saved ? JSON.parse(saved) : [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', command: '', description: '' });

  // Command execution state
  const [executing, setExecuting] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; success: boolean; message: string; output?: string } | null>(null);
  const [showBiosConfirm, setShowBiosConfirm] = useState(false);
  const [showFloatingOutput, setShowFloatingOutput] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    localStorage.setItem('NetMajik_custom_win_shortcuts', JSON.stringify(customShortcuts));
  }, [customShortcuts]);

  // Execute external Windows app/shortcut
  const handleLaunchExternal = async (command: string, name: string) => {
    if (!window.electronAPI) {
      error(t.launchFailed || 'Error al ejecutar en este entorno');
      return;
    }
    try {
      const res = await window.electronAPI.launchWinShortcut(command);
      if (res?.success) {
        success((t as any).shortcutLaunched || 'Abriendo ' + name);
      } else {
        error(res?.error || t.launchFailed || 'No se pudo abrir ' + name);
      }
    } catch (e: any) {
      error(e.message || 'Error al ejecutar ' + command);
    }
  };

  // Execute internal system maintenance command
  const handleExecuteMaintenance = async (cmdId: string) => {
    if (cmdId === 'rename-pc') {
      if (onRenamePC) onRenamePC();
      else error('No disponible');
      return;
    }

    if (cmdId === 'reboot-to-bios') {
      setShowBiosConfirm(true);
      return;
    }

    setExecuting(cmdId);
    setResult(null);

    try {
      if (window.electronAPI) {
        const res = await window.electronAPI.executeNetworkCommand({
          command: cmdId,
          params: { ifaceName: iface?.name || '' }
        });

        setResult({
          id: cmdId,
          success: true,
          message: t.cmdSuccess || 'Comando ejecutado con éxito',
          output: res?.output
        });

        if (['arp-a', 'route-print', 'ifconfig'].includes(cmdId)) {
          setShowFloatingOutput(true);
        } else {
          success(t.cmdSuccess || 'Comando ejecutado con éxito');
        }
      } else {
        // Simulation mode
        await new Promise(resolve => setTimeout(resolve, 1000));
        setResult({
          id: cmdId,
          success: true,
          message: (t.cmdSuccess || 'Comando ejecutado') + ' (Simulado)'
        });
        success('Comando ejecutado (Simulado)');
      }
    } catch (err: any) {
      let errorMsg = err.message || t.cmdFailed || 'Error al ejecutar comando';
      if (errorMsg.includes('Admin') || errorMsg.includes('privileges') || errorMsg.includes('elevation')) {
        errorMsg = t.adminRequired || 'Se requieren privilegios de Administrador';
      }
      setResult({
        id: cmdId,
        success: false,
        message: errorMsg
      });
      error(errorMsg);
    } finally {
      setExecuting(null);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.command.trim()) return;

    const newShortcut: CustomShortcut = {
      id: Date.now().toString(),
      name: form.name.trim(),
      command: form.command.trim(),
      description: form.description.trim() || 'Acceso directo personalizado'
    };

    setCustomShortcuts(prev => [...prev, newShortcut]);
    setForm({ name: '', command: '', description: '' });
    setIsModalOpen(false);
    success(t.appliedSuccess || 'Acceso directo añadido');
  };

  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomShortcuts(prev => prev.filter(s => s.id !== id));
  };

  // Base Shortcuts list (Multilingual)
  const langKey = (language || 'en') as Language;
  const DEFAULT_WINDOWS_SHORTCUTS = [
    {
      id: 'ncpa',
      name: langKey === 'es' ? 'Conexiones de Red' : langKey === 'pt' ? 'Conexões de Rede' : langKey === 'de' ? 'Netzwerkverbindungen' : langKey === 'fr' ? 'Connexions réseau' : langKey === 'zh' ? '网络连接' : langKey === 'ja' ? 'ネットワーク接続' : 'Network Connections',
      command: 'ncpa.cpl',
      description: langKey === 'es' ? 'Carpeta de adaptadores de red e interfaces TCP/IP' : langKey === 'pt' ? 'Pasta de adaptadores de rede e interfaces TCP/IP' : langKey === 'de' ? 'Ordner für Netzwerkadapter und TCP/IP-Schnittstellen' : langKey === 'fr' ? 'Dossier des adaptateurs réseau et interfaces TCP/IP' : langKey === 'zh' ? '网络适配器和 TCP/IP 接口文件夹' : langKey === 'ja' ? 'ネットワークアダプターおよびTCP/IPインターフェースフォルダ' : 'Network adapters and TCP/IP interfaces folder',
      type: 'external',
      category: 'system',
      icon: <Network className="text-sky-400" size={22} />,
      color: 'from-sky-500/10 to-blue-500/10 border-sky-500/30 hover:border-sky-400'
    },
    {
      id: 'control',
      name: langKey === 'es' ? 'Panel de Control' : langKey === 'pt' ? 'Painel de Controle' : langKey === 'de' ? 'Systemsteuerung' : langKey === 'fr' ? 'Panneau de configuration' : langKey === 'zh' ? '控制面板' : langKey === 'ja' ? 'コントロールパネル' : 'Control Panel',
      command: 'control',
      description: langKey === 'es' ? 'Panel de control clásico de configuración del sistema' : langKey === 'pt' ? 'Painel de controle clássico de configurações do sistema' : langKey === 'de' ? 'Klassische Systemsteuerungs-Systemeinstellungen' : langKey === 'fr' ? 'Panneau de configuration classique du système' : langKey === 'zh' ? '经典系统设置控制面板' : langKey === 'ja' ? 'クラシックなシステム設定コントロールパネル' : 'Classic system settings control panel',
      type: 'external',
      category: 'system',
      icon: <Sliders className="text-indigo-400" size={22} />,
      color: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/30 hover:border-indigo-400'
    },
    {
      id: 'devmgmt',
      name: langKey === 'es' ? 'Administrador de Dispositivos' : langKey === 'pt' ? 'Gerenciador de Dispositivos' : langKey === 'de' ? 'Geräte-Manager' : langKey === 'fr' ? 'Gestionnaire de périphériques' : langKey === 'zh' ? '设备管理器' : langKey === 'ja' ? 'デバイスマネージャー' : 'Device Manager',
      command: 'devmgmt.msc',
      description: langKey === 'es' ? 'Gestión de controladores y hardware instalado' : langKey === 'pt' ? 'Gerenciamento de drivers e hardware instalado' : langKey === 'de' ? 'Verwaltung installierter Treiber und Hardware' : langKey === 'fr' ? 'Gestion des pilotes et du matériel installé' : langKey === 'zh' ? '已安装驱动程序和硬件管理' : langKey === 'ja' ? 'インストールされているドライバーとハードウェアの管理' : 'Management of installed drivers and hardware',
      type: 'external',
      category: 'system',
      icon: <Cpu className="text-emerald-400" size={22} />,
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 hover:border-emerald-400'
    },
    {
      id: 'firewall',
      name: langKey === 'es' ? 'Firewall de Windows' : langKey === 'pt' ? 'Firewall do Windows' : langKey === 'de' ? 'Windows-Firewall' : langKey === 'fr' ? 'Pare-feu Windows' : langKey === 'zh' ? 'Windows 防火墙' : langKey === 'ja' ? 'Windowsファイアウォール' : 'Windows Firewall',
      command: 'firewall.cpl',
      description: langKey === 'es' ? 'Configuración de seguridad, reglas de entrada y salida' : langKey === 'pt' ? 'Configurações de segurança, regras de entrada e saída' : langKey === 'de' ? 'Sicherheitseinstellungen, Eingehende und Ausgehende Regeln' : langKey === 'fr' ? 'Paramètres de sécurité, règles entrantes et sortantes' : langKey === 'zh' ? '安全设置、入站和出站规则' : langKey === 'ja' ? 'セキュリティ設定、受信および送信ルール' : 'Security settings, inbound and outbound rules',
      type: 'external',
      category: 'system',
      icon: <Shield className="text-amber-400" size={22} />,
      color: 'from-amber-500/10 to-orange-500/10 border-amber-500/30 hover:border-amber-400'
    },
    {
      id: 'services',
      name: langKey === 'es' ? 'Servicios del Sistema' : langKey === 'pt' ? 'Serviços do Sistema' : langKey === 'de' ? 'Dienste' : langKey === 'fr' ? 'Services système' : langKey === 'zh' ? '系统服务' : langKey === 'ja' ? 'システムサービス' : 'System Services',
      command: 'services.msc',
      description: langKey === 'es' ? 'Administración de servicios en segundo plano' : langKey === 'pt' ? 'Administração de serviços em segundo plano' : langKey === 'de' ? 'Verwaltung von Hintergrunddiensten' : langKey === 'fr' ? 'Administration des services en arrière-plan' : langKey === 'zh' ? '后台服务管理' : langKey === 'ja' ? 'バックグラウンドサービスの管理' : 'Background services administration',
      type: 'external',
      category: 'system',
      icon: <Activity className="text-rose-400" size={22} />,
      color: 'from-rose-500/10 to-pink-500/10 border-rose-500/30 hover:border-rose-400'
    },
    {
      id: 'taskmgr',
      name: langKey === 'es' ? 'Administrador de Tareas' : langKey === 'pt' ? 'Gerenciador de Tarefas' : langKey === 'de' ? 'Task-Manager' : langKey === 'fr' ? 'Gestionnaire des tâches' : langKey === 'zh' ? '任务管理器' : langKey === 'ja' ? 'タスクマネージャー' : 'Task Manager',
      command: 'taskmgr',
      description: langKey === 'es' ? 'Rendimiento en tiempo real y procesos activos' : langKey === 'pt' ? 'Desempenho em tempo real e processos ativos' : langKey === 'de' ? 'Echtzeit-Leistung und aktive Prozesse' : langKey === 'fr' ? 'Performances en temps réel et processus actifs' : langKey === 'zh' ? '实时性能和活动进程' : langKey === 'ja' ? 'リアルタイムのパフォーマンスとアクティブなプロセス' : 'Real-time performance and active processes',
      type: 'external',
      category: 'system',
      icon: <Activity className="text-cyan-400" size={22} />,
      color: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/30 hover:border-cyan-400'
    },
    {
      id: 'eventvwr',
      name: langKey === 'es' ? 'Visor de Eventos' : langKey === 'pt' ? 'Visualizador de Eventos' : langKey === 'de' ? 'Ereignisanzeige' : langKey === 'fr' ? 'Observateur d\'événements' : langKey === 'zh' ? '事件查看器' : langKey === 'ja' ? 'イベントビューアー' : 'Event Viewer',
      command: 'eventvwr.msc',
      description: langKey === 'es' ? 'Registros de sistema, aplicaciones y auditorías' : langKey === 'pt' ? 'Logs do sistema, aplicativos e auditorias' : langKey === 'de' ? 'Systemprotokolle, Anwendungen und Überprüfungen' : langKey === 'fr' ? 'Journaux système, applications et audits' : langKey === 'zh' ? '系统日志、应用程序和审计' : langKey === 'ja' ? 'システムログ、アプリケーション、監査' : 'System logs, applications and audits',
      type: 'external',
      category: 'system',
      icon: <FileText className="text-violet-400" size={22} />,
      color: 'from-violet-500/10 to-purple-500/10 border-violet-500/30 hover:border-violet-400'
    },
    {
      id: 'ssms',
      name: 'SQL Server Management Studio',
      command: 'ssms.exe',
      description: langKey === 'es' ? 'Consola de gestión Microsoft SQL Server (si está instalado)' : langKey === 'pt' ? 'Console de gerenciamento Microsoft SQL Server (se instalado)' : langKey === 'de' ? 'Microsoft SQL Server-Verwaltungskonsole (falls installiert)' : langKey === 'fr' ? 'Console de gestion Microsoft SQL Server (si installé)' : langKey === 'zh' ? 'Microsoft SQL Server 管理控制台（如果已安装）' : langKey === 'ja' ? 'Microsoft SQL Server管理コンソール（インストールされている場合）' : 'Microsoft SQL Server management console (if installed)',
      type: 'external',
      category: 'system',
      icon: <Database className="text-red-400" size={22} />,
      color: 'from-red-500/10 to-rose-500/10 border-red-500/30 hover:border-red-400'
    },
    {
      id: 'cmd',
      name: langKey === 'es' ? 'Símbolo del Sistema (CMD)' : langKey === 'pt' ? 'Prompt de Comando (CMD)' : langKey === 'de' ? 'Eingabeaufforderung (CMD)' : langKey === 'fr' ? 'Invite de commandes (CMD)' : langKey === 'zh' ? '命令提示符 (CMD)' : langKey === 'ja' ? 'コマンドプロンプト (CMD)' : 'Command Prompt (CMD)',
      command: 'cmd.exe',
      description: langKey === 'es' ? 'Consola de comandos estándar de Windows' : langKey === 'pt' ? 'Console de comandos padrão do Windows' : langKey === 'de' ? 'Standard-Windows-Befehlskonsole' : langKey === 'fr' ? 'Console de commandes Windows standard' : langKey === 'zh' ? '标准 Windows 命令控制台' : langKey === 'ja' ? '標準のWindowsコマンドコンソール' : 'Standard Windows command console',
      type: 'external',
      category: 'system',
      icon: <Terminal className="text-slate-400" size={22} />,
      color: 'from-slate-500/10 to-zinc-500/10 border-slate-500/30 hover:border-slate-400'
    },
    {
      id: 'powershell',
      name: 'Windows PowerShell',
      command: 'powershell.exe',
      description: langKey === 'es' ? 'Entorno de línea de comandos y scripting avanzado' : langKey === 'pt' ? 'Ambiente de linha de comando e scripting avançado' : langKey === 'de' ? 'Erweiterte Befehlszeilen- und Skriptumgebung' : langKey === 'fr' ? 'Environnement de ligne de commande et de script avancé' : langKey === 'zh' ? '高级命令行和脚本环境' : langKey === 'ja' ? '高度なコマンドラインおよびスクリプト環境' : 'Advanced command-line environment and scripting',
      type: 'external',
      category: 'system',
      icon: <Terminal className="text-blue-400" size={22} />,
      color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/30 hover:border-blue-400'
    },
    {
      id: 'netdiag',
      name: langKey === 'es' ? 'Diagnóstico de Red' : langKey === 'pt' ? 'Diagnóstico de Rede' : langKey === 'de' ? 'Netzwerkdiagnose' : langKey === 'fr' ? 'Diagnostic réseau' : langKey === 'zh' ? '网络诊断' : langKey === 'ja' ? 'ネットワーク診断' : 'Network Diagnostics',
      command: 'msdt.exe /id NetworkDiagnosticsNetworkAdapter',
      description: langKey === 'es' ? 'Asistente nativo para solución de problemas de red' : langKey === 'pt' ? 'Assistente nativo para solução de problemas de rede' : langKey === 'de' ? 'Nativer Windows-Netzwerkdiagnoseassistent' : langKey === 'fr' ? 'Assistant natif de dépannage réseau Windows' : langKey === 'zh' ? '原生 Windows 网络疑难解答向导' : langKey === 'ja' ? 'ネイティブのWindowsネットワークトラブルシューティングウィザード' : 'Native Windows network troubleshooting wizard',
      type: 'external',
      category: 'system',
      icon: <Globe className="text-teal-400" size={22} />,
      color: 'from-teal-500/10 to-emerald-500/10 border-teal-500/30 hover:border-teal-400'
    }
  ];

  // Maintenance Commands list
  const MAINTENANCE_COMMANDS = [
    {
      id: 'flush-dns',
      name: t.flushDns || 'Limpiar Caché DNS',
      command: 'ipconfig /flushdns',
      description: t.flushDnsDesc || 'Vacía la memoria caché de resolución DNS del equipo',
      type: 'maintenance',
      category: 'maintenance',
      icon: <Trash2 className="text-orange-400" size={22} />,
      color: 'from-orange-500/10 to-amber-500/10 border-orange-500/30 hover:border-orange-400'
    },
    {
      id: 'renew-ip',
      name: t.renewIp || 'Renovar IP (DHCP)',
      command: 'ipconfig /release & renew',
      description: t.renewIpDesc || 'Libera y solicita una nueva dirección IP al servidor DHCP',
      type: 'maintenance',
      category: 'maintenance',
      icon: <RefreshCw className="text-blue-400" size={22} />,
      color: 'from-blue-500/10 to-sky-500/10 border-blue-500/30 hover:border-blue-400'
    },
    {
      id: 'reset-winsock',
      name: t.resetWinsock || 'Reiniciar Catálogo Winsock',
      command: 'netsh winsock reset',
      description: t.resetWinsockDesc || 'Restablece la pila TCP/IP y socket a estado original',
      type: 'maintenance',
      category: 'maintenance',
      icon: <Shield className="text-purple-400" size={22} />,
      color: 'from-purple-500/10 to-indigo-500/10 border-purple-500/30 hover:border-purple-400'
    },
    {
      id: 'netplwiz',
      name: t.netplwiz || 'Cuentas de Usuario (netplwiz)',
      command: 'netplwiz',
      description: t.netplwizDesc || 'Gestión avanzada de cuentas de usuario del sistema',
      type: 'maintenance',
      category: 'maintenance',
      icon: <Shield className="text-amber-400" size={22} />,
      color: 'from-amber-500/10 to-yellow-500/10 border-amber-500/30 hover:border-amber-400'
    },
    {
      id: 'shell-startup',
      name: t.shellStartup || 'Carpeta de Inicio de Windows',
      command: 'shell:startup',
      description: t.shellStartupDesc || 'Abre la carpeta de programas que inician con el sistema',
      type: 'maintenance',
      category: 'maintenance',
      icon: <Zap className="text-yellow-400" size={22} />,
      color: 'from-yellow-500/10 to-amber-500/10 border-yellow-500/30 hover:border-yellow-400'
    },
    {
      id: 'rename-pc',
      name: t.renameComputer || 'Renombrar este Equipo',
      command: 'sysdm.cpl',
      description: t.renameComputerDesc || 'Cambia el nombre de red o grupo de trabajo de este PC',
      type: 'maintenance',
      category: 'maintenance',
      icon: <Edit2 className="text-emerald-400" size={22} />,
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 hover:border-emerald-400'
    },
    {
      id: 'arp-a',
      name: t.arpTable || 'Tabla ARP',
      command: 'arp -a',
      description: t.arpTableDesc || 'Muestra la tabla de correspondencias IP-MAC aprendidas',
      type: 'maintenance',
      category: 'maintenance',
      icon: <Monitor className="text-slate-400" size={22} />,
      color: 'from-slate-500/10 to-zinc-500/10 border-slate-500/30 hover:border-slate-400'
    },
    {
      id: 'route-print',
      name: t.routingTable || 'Tabla de Rutas IP',
      command: 'route print',
      description: t.routingTableDesc || 'Visualiza la tabla de enrutamiento IP del sistema',
      type: 'maintenance',
      category: 'maintenance',
      icon: <Network className="text-sky-400" size={22} />,
      color: 'from-sky-500/10 to-cyan-500/10 border-sky-500/30 hover:border-sky-400'
    },
    {
      id: 'ifconfig',
      name: t.adapterStatus || 'Detalles ipconfig /all',
      command: 'ipconfig /all',
      description: t.adapterStatusDesc || 'Obtiene la configuración IP completa de todos los adaptadores',
      type: 'maintenance',
      category: 'maintenance',
      icon: <Activity className="text-rose-400" size={22} />,
      color: 'from-rose-500/10 to-pink-500/10 border-rose-500/30 hover:border-rose-400'
    },
    {
      id: 'reboot-to-bios',
      name: t.rebootBios || 'Reiniciar en BIOS / UEFI',
      command: 'shutdown /r /fw /t 0',
      description: t.rebootBiosDesc || 'Reinicia el equipo directamente en la pantalla de la BIOS',
      type: 'maintenance',
      category: 'maintenance',
      icon: <Zap className="text-rose-500" size={22} />,
      color: 'from-rose-600/10 to-red-600/10 border-rose-600/30 hover:border-rose-500'
    }
  ];

  // Combine all items
  const allItems = [
    ...MAINTENANCE_COMMANDS,
    ...DEFAULT_WINDOWS_SHORTCUTS,
    ...customShortcuts.map(c => ({
      id: c.id,
      name: c.name,
      command: c.command,
      description: c.description || 'Personalizado',
      type: 'custom',
      category: 'custom',
      icon: <Wrench className="text-amber-400" size={22} />,
      color: 'from-amber-500/10 to-yellow-500/10 border-amber-500/30 hover:border-amber-400',
      isCustom: true
    }))
  ];

  // Filter items by search term and active category
  const filteredItems = allItems.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat =
      activeCategory === 'all' ||
      (activeCategory === 'maintenance' && item.type === 'maintenance') ||
      (activeCategory === 'system' && item.type === 'external') ||
      (activeCategory === 'custom' && item.type === 'custom');

    return matchesSearch && matchesCat;
  });

  const handleCardClick = (item: any) => {
    if (item.type === 'maintenance') {
      handleExecuteMaintenance(item.id);
    } else {
      handleLaunchExternal(item.command, item.name);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-500/15 text-blue-400 rounded-2xl border border-blue-500/20 shadow-inner">
            <Sliders size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-theme-text-primary">
              {(t as any).winShortcuts || 'Funciones de Windows'}
            </h2>
            <p className="text-theme-text-muted text-sm mt-0.5">
              {(t as any).winShortcutsDesc || 'Mantenimiento del sistema, consolas administrativas, paneles de control y accesos directos personalizados.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-theme-text-muted" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar función o comando..."
              className="bg-theme-bg-tertiary border border-theme-border-primary rounded-xl pl-9 pr-4 py-2 text-sm text-theme-text-primary placeholder:text-theme-text-muted/40 focus:ring-2 focus:ring-blue-500/50 outline-none w-48 md:w-64 transition-all"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Añadir Acceso</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-theme-border-primary pb-3 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeCategory === 'all'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-theme-bg-secondary text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-tertiary'
          }`}
        >
          <Sliders size={14} />
          Todas ({allItems.length})
        </button>

        <button
          onClick={() => setActiveCategory('maintenance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeCategory === 'maintenance'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-theme-bg-secondary text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-tertiary'
          }`}
        >
          <Wrench size={14} />
          Mantenimiento y Scripts ({MAINTENANCE_COMMANDS.length})
        </button>

        <button
          onClick={() => setActiveCategory('system')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeCategory === 'system'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-theme-bg-secondary text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-tertiary'
          }`}
        >
          <Cpu size={14} />
          Herramientas del Sistema ({DEFAULT_WINDOWS_SHORTCUTS.length})
        </button>

        <button
          onClick={() => setActiveCategory('custom')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeCategory === 'custom'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-theme-bg-secondary text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-tertiary'
          }`}
        >
          <Plus size={14} />
          Personalizadas ({customShortcuts.length})
        </button>
      </div>

      {/* Grid of Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div
            key={item.id}
            onClick={() => handleCardClick(item)}
            className={`
              relative group cursor-pointer p-5 rounded-2xl border bg-gradient-to-br transition-all duration-300
              shadow-sm hover:shadow-xl hover:-translate-y-1 ${item.color}
              ${executing === item.id ? 'opacity-70 pointer-events-none' : ''}
            `}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-theme-bg-tertiary/80 rounded-xl border border-theme-border-primary/50 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-theme-text-primary text-base group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                    {item.name}
                  </h3>
                  <code className="text-[10px] font-mono font-semibold text-theme-text-muted bg-theme-bg-tertiary px-1.5 py-0.5 rounded border border-theme-border-primary/40 inline-block mt-1">
                    {item.command}
                  </code>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {executing === item.id ? (
                  <RefreshCw size={18} className="animate-spin text-blue-400" />
                ) : (item as any).isCustom ? (
                  <button
                    onClick={(e) => handleDeleteCustom(item.id, e)}
                    className="p-1.5 text-theme-text-muted hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Eliminar acceso personalizado"
                  >
                    <Trash2 size={15} />
                  </button>
                ) : (
                  <div className="p-2 rounded-xl text-theme-text-muted group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-all">
                    {item.type === 'maintenance' ? <Zap size={16} /> : <ExternalLink size={16} />}
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-theme-text-muted mt-3 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      {/* Add Custom Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-theme-bg-secondary border border-theme-border-primary rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border-primary">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/15 text-blue-400 rounded-xl">
                  <Sliders size={18} />
                </div>
                <h3 className="font-bold text-theme-text-primary">Añadir Acceso Directo de Windows</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-theme-text-muted hover:text-theme-text-primary rounded-xl hover:bg-theme-bg-hover transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCustom} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest">
                  Nombre del Acceso <span className="text-rose-400">*</span>
                </label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Visor de Registro"
                  className="w-full bg-theme-bg-tertiary border border-theme-border-primary rounded-xl px-4 py-2.5 text-sm font-medium text-theme-text-primary focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest">
                  Comando o Ruta Ejecutable <span className="text-rose-400">*</span>
                </label>
                <input
                  required
                  value={form.command}
                  onChange={e => setForm(f => ({ ...f, command: e.target.value }))}
                  placeholder="Ej: regedit.exe  |  ncpa.cpl  |  msdt.exe /id NetworkDiagnosticsNetworkAdapter"
                  className="w-full bg-theme-bg-tertiary border border-theme-border-primary rounded-xl px-4 py-2.5 text-sm font-mono text-theme-text-primary focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                />
                <p className="text-[10px] text-theme-text-muted italic px-1">
                  Admite: ejecutables (.exe), applets del Panel de Control (.cpl), complementos MMC (.msc) y comandos con argumentos (ej: <code className="bg-theme-bg-tertiary px-1 rounded">msdt.exe /id ...</code>).
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest">
                  Descripción Corta
                </label>
                <input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Ej: Editor del registro de Windows"
                  className="w-full bg-theme-bg-tertiary border border-theme-border-primary rounded-xl px-4 py-2.5 text-sm font-medium text-theme-text-primary focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-theme-border-primary text-sm font-bold text-theme-text-muted hover:bg-theme-bg-hover transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
                >
                  <Save size={16} />
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal for BIOS reboot */}
      <ConfirmModal
        isOpen={showBiosConfirm}
        onClose={() => setShowBiosConfirm(false)}
        onConfirm={async () => {
          try {
            if (window.electronAPI) {
              await window.electronAPI.rebootToBios();
            }
          } catch (e) {}
        }}
        title={t.rebootBios || 'Reiniciar en BIOS'}
        message={t.rebootBiosConfirm || 'Esto reiniciará el equipo inmediatamente para entrar en la BIOS/UEFI. Guarda tu trabajo. ¿Continuar?'}
        confirmLabel={t.apply || 'Reiniciar Ahora'}
        cancelLabel={t.cancel || 'Cancelar'}
        subTitle={t.confirmationRequired}
        variant="danger"
      />

      {/* Floating Output Modal for ARP, Route Print, IPConfig /all */}
      {showFloatingOutput && result && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-theme-bg-primary/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`bg-theme-bg-secondary border border-theme-border-primary rounded-2xl shadow-2xl flex flex-col transition-all duration-300 overflow-hidden ${isMaximized ? 'w-full h-full' : 'w-full max-w-4xl h-[80vh]'}`}>
            {/* Modal Header */}
            <div className="p-4 bg-theme-bg-tertiary border-b border-theme-border-secondary flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/15 rounded-lg text-blue-400">
                  <Terminal size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-theme-text-primary">
                    {MAINTENANCE_COMMANDS.find(c => c.id === result.id)?.name || 'Resultado del Comando'}
                  </h3>
                  <p className="text-[10px] text-theme-text-muted uppercase tracking-widest font-black">Consola del Sistema</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-2 text-theme-text-muted hover:text-blue-400 hover:bg-theme-bg-hover rounded-lg transition-all"
                >
                  {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button
                  onClick={() => { setShowFloatingOutput(false); setIsMaximized(false); setResult(null); }}
                  className="p-2 text-theme-text-muted hover:text-rose-400 hover:bg-theme-bg-hover rounded-lg transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6 bg-theme-bg-primary custom-scrollbar">
              <pre className="text-[13px] font-mono text-theme-text-primary whitespace-pre-wrap leading-relaxed">
                {result.output || t.noOutputData || 'Sin datos de salida.'}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-theme-bg-tertiary border-t border-theme-border-secondary flex justify-end gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.output || '');
                  success('Copiado al portapapeles');
                }}
                className="px-4 py-2 bg-theme-bg-secondary text-theme-text-secondary rounded-xl text-sm font-bold border border-theme-border-primary hover:bg-theme-bg-hover transition-colors flex items-center gap-2"
              >
                <FileText size={16} /> Copiar Salida
              </button>
              <button
                onClick={() => { setShowFloatingOutput(false); setIsMaximized(false); setResult(null); }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
