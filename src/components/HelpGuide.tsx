import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import { APP_VERSION } from '../constants';
import {
  ChevronDown, ChevronRight, LayoutDashboard, Search, X, Sliders,
  Radar, KeyRound, BookOpen, Sparkles
} from 'lucide-react';

interface HelpGuideProps {
  language: Language;
}

// ─────────────────────────────────────────────────────────────────────────────
// UI LABELS (tab titles, badges, search placeholder, header)
// ─────────────────────────────────────────────────────────────────────────────
const LABELS_DICT: Record<string, {
  title: string; sub: string; searchPlaceholder: string;
  catGettingStarted: string; catWinTools: string; catAnalysis: string;
  catAuxiliary: string; catSecrets: string;
  badgeBasic: string; badgeFeatured: string; badgeUseful: string;
  badgeAdvanced: string; badgeTechnical: string; badgePowerful: string;
  badgeSecurity: string; badgeUtility: string; badgeMonitoring: string;
  badgeProductivity: string; badgeShortcut: string; badgeMystery: string;
}> = {
  en: {
    title: 'Help Center & Complete Manual',
    sub: 'Detailed usage guide, pro tips, and troubleshooting for all NetMajik tools.',
    searchPlaceholder: 'Search in manual (e.g. free IP, ARP, DNS...)',
    catGettingStarted: '🏁 1. Getting Started & IP Config',
    catWinTools: '🛠️ 2. Windows Features & Maintenance',
    catAnalysis: '📊 3. Analysis, Discovery & Network',
    catAuxiliary: '🔐 4. Credentials, Clipboard & Search',
    catSecrets: '🎮 5. Secret Riddles (Easter Eggs)',
    badgeBasic: 'Basic', badgeFeatured: 'Featured', badgeUseful: 'Useful',
    badgeAdvanced: 'Advanced', badgeTechnical: 'Technical', badgePowerful: 'Powerful',
    badgeSecurity: 'Security', badgeUtility: 'Utility', badgeMonitoring: 'Monitoring',
    badgeProductivity: 'Productivity', badgeShortcut: 'Shortcut', badgeMystery: 'Mystery',
  },
  es: {
    title: 'Centro de Ayuda y Manual Completo',
    sub: 'Guía detallada de uso, consejos pro y resolución de problemas para todas las herramientas de NetMajik.',
    searchPlaceholder: 'Buscar en el manual (ej: IP libre, ARP, DNS...)',
    catGettingStarted: '🏁 1. Primeros Pasos y Configuración IP',
    catWinTools: '🛠️ 2. Funciones de Windows y Mantenimiento',
    catAnalysis: '📊 3. Análisis, Descubrimiento y Red',
    catAuxiliary: '🔐 4. Credenciales, Portapapeles y Búsqueda',
    catSecrets: '🎮 5. Acertijos Secretos (Huevos de Pascua)',
    badgeBasic: 'Básico', badgeFeatured: 'Destacado', badgeUseful: 'Útil',
    badgeAdvanced: 'Avanzado', badgeTechnical: 'Técnico', badgePowerful: 'Potente',
    badgeSecurity: 'Seguridad', badgeUtility: 'Utilidad', badgeMonitoring: 'Monitorización',
    badgeProductivity: 'Productividad', badgeShortcut: 'Atajo', badgeMystery: 'Misterio',
  },
  pt: {
    title: 'Central de Ajuda e Manual Completo',
    sub: 'Guia detalhado de uso, dicas pro e solução de problemas para todas as ferramentas do NetMajik.',
    searchPlaceholder: 'Pesquisar no manual (ex: IP livre, ARP, DNS...)',
    catGettingStarted: '🏁 1. Primeiros Passos e Configuração de IP',
    catWinTools: '🛠️ 2. Recursos do Windows e Manutenção',
    catAnalysis: '📊 3. Análise, Descoberta e Rede',
    catAuxiliary: '🔐 4. Credenciais, Área de Transferência e Busca',
    catSecrets: '🎮 5. Enigmas Secretos (Easter Eggs)',
    badgeBasic: 'Básico', badgeFeatured: 'Destaque', badgeUseful: 'Útil',
    badgeAdvanced: 'Avançado', badgeTechnical: 'Técnico', badgePowerful: 'Poderoso',
    badgeSecurity: 'Segurança', badgeUtility: 'Utilitário', badgeMonitoring: 'Monitoramento',
    badgeProductivity: 'Produtividade', badgeShortcut: 'Atalho', badgeMystery: 'Mistério',
  },
  de: {
    title: 'Hilfe-Center & Vollständiges Handbuch',
    sub: 'Detaillierte Anleitung, Profi-Tipps und Fehlerbehebung für alle NetMajik-Tools.',
    searchPlaceholder: 'Handbuch durchsuchen (z.B. freie IP, ARP, DNS...)',
    catGettingStarted: '🏁 1. Erste Schritte & IP-Konfiguration',
    catWinTools: '🛠️ 2. Windows-Funktionen & Wartung',
    catAnalysis: '📊 3. Analyse, Erkennung & Netzwerk',
    catAuxiliary: '🔐 4. Anmeldedaten, Zwischenablage & Suche',
    catSecrets: '🎮 5. Geheime Rätsel (Easter Eggs)',
    badgeBasic: 'Basis', badgeFeatured: 'Hervorgehoben', badgeUseful: 'Nützlich',
    badgeAdvanced: 'Fortgeschritten', badgeTechnical: 'Technisch', badgePowerful: 'Leistungsstark',
    badgeSecurity: 'Sicherheit', badgeUtility: 'Dienstprogramm', badgeMonitoring: 'Überwachung',
    badgeProductivity: 'Produktivität', badgeShortcut: 'Tastenkürzel', badgeMystery: 'Geheimnis',
  },
  fr: {
    title: "Centre d'Aide et Manuel Complet",
    sub: "Guide d'utilisation détaillé, conseils pro et dépannage pour tous les outils NetMajik.",
    searchPlaceholder: 'Rechercher dans le manuel (ex: IP libre, ARP, DNS...)',
    catGettingStarted: '🏁 1. Premiers Pas et Config IP',
    catWinTools: '🛠️ 2. Fonctionnalités Windows et Maintenance',
    catAnalysis: '📊 3. Analyse, Découverte et Réseau',
    catAuxiliary: "🔐 4. Identifiants, Presse-papiers et Recherche",
    catSecrets: '🎮 5. Énigmes Secrètes (Easter Eggs)',
    badgeBasic: 'Basique', badgeFeatured: 'En vedette', badgeUseful: 'Utile',
    badgeAdvanced: 'Avancé', badgeTechnical: 'Technique', badgePowerful: 'Puissant',
    badgeSecurity: 'Sécurité', badgeUtility: 'Utilitaire', badgeMonitoring: 'Surveillance',
    badgeProductivity: 'Productivité', badgeShortcut: 'Raccourci', badgeMystery: 'Mystère',
  },
  zh: {
    title: '帮助中心与完整手册',
    sub: 'NetMajik 所有工具的详细使用指南、高级技巧与故障排除。',
    searchPlaceholder: '手册搜索（例如：空闲 IP、ARP、DNS...）',
    catGettingStarted: '🏁 1. 入门与 IP 配置',
    catWinTools: '🛠️ 2. Windows 功能与维护',
    catAnalysis: '📊 3. 分析、发现与网络',
    catAuxiliary: '🔐 4. 凭据、剪贴板与搜索',
    catSecrets: '🎮 5. 隐藏谜题（彩蛋）',
    badgeBasic: '基础', badgeFeatured: '精选', badgeUseful: '实用',
    badgeAdvanced: '高级', badgeTechnical: '技术', badgePowerful: '强大',
    badgeSecurity: '安全', badgeUtility: '工具', badgeMonitoring: '监控',
    badgeProductivity: '效率', badgeShortcut: '快捷键', badgeMystery: '神秘',
  },
  ja: {
    title: 'ヘルプセンターと完全マニュアル',
    sub: 'NetMajik 全ツールの詳細な使用法、プロのコツ、トラブルシューティング。',
    searchPlaceholder: 'マニュアルを検索（例: フリーIP、ARP、DNS...）',
    catGettingStarted: '🏁 1. はじめに & IP 設定',
    catWinTools: '🛠️ 2. Windows 機能とメンテナンス',
    catAnalysis: '📊 3. 解析・検出・ネットワーク',
    catAuxiliary: '🔐 4. 資格情報・クリップボード・検索',
    catSecrets: '🎮 5. 秘密の謎解き（イースターエッグ）',
    badgeBasic: '基本', badgeFeatured: '注目', badgeUseful: '便利',
    badgeAdvanced: '高度', badgeTechnical: '技術的', badgePowerful: '強力',
    badgeSecurity: 'セキュリティ', badgeUtility: 'ユーティリティ', badgeMonitoring: '監視',
    badgeProductivity: '生産性', badgeShortcut: 'ショートカット', badgeMystery: 'ミステリー',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// GUIDE CONTENT — All translated text for each article section
// Structure: GUIDE_CONTENT[lang][articleId][sectionIndex] = { heading, content }
// ─────────────────────────────────────────────────────────────────────────────
const GUIDE_CONTENT: Record<string, Record<string, Array<{ heading: string; content: string }>>> = {
  en: {
    interfaces: [
      {
        heading: '🎯 What is it and what is it for?',
        content: 'The main **Interfaces** screen shows a real-time list of all physical and virtual network adapters on your machine (Ethernet, Wi-Fi, VPN tunnels, Hyper-V virtual switches, etc.). For each adapter you can see its current IP, subnet mask, default gateway, primary and secondary DNS servers, MAC address, and link/cable status.\n\nIt is the command center from which all IP configuration actions start.',
      },
      {
        heading: '🚀 Step-by-step guide',
        content: '1. **Select an adapter:** Click any card in the left list to set it as the active interface.\n2. **DHCP mode (Automatic):** Click "Switch to DHCP" to let your router assign the IP automatically via DHCP negotiation.\n3. **Static mode:** Enter the IP address, subnet mask (default 255.255.255.0), gateway, and primary/secondary DNS (e.g. 8.8.8.8 / 1.1.1.1) then click **Apply**.\n4. **Refresh:** Use the refresh button to reload the adapter list without restarting the app.',
      },
      {
        heading: '💡 Pro tips & keyboard shortcuts',
        content: '• **Double-click an adapter:** Opens the Windows network adapter properties panel directly.\n• **Enter key:** Press Enter in any text field to apply changes without clicking.\n• **Admin required:** Changing static IP settings requires NetMajik to be run as Administrator. If not elevated, a warning banner will appear.\n• **Copy values:** Click on the IP address, mask or gateway displayed in the info panel to copy it to the clipboard instantly.',
      },
      {
        heading: '⚠️ Troubleshooting',
        content: '• **No adapters appear:** Make sure your network card drivers are installed and recognized by Windows Device Manager.\n• **IP change has no effect:** Check if a VPN client or enterprise policy is overriding the routing table.\n• **Adapter greyed out:** A disabled adapter cannot be configured. Right-click it in Windows Device Manager and choose "Enable".',
      },
    ],
    quickip: [
      {
        heading: '🎯 What is it and what is it for?',
        content: 'The **Quick IP** widget at the top of the main view lets you assign a new IP address in seconds without opening Windows settings menus. The default subnet mask is automatically set to **255.255.255.0** (/24) to save time on the most common scenarios.',
      },
      {
        heading: '🚀 How to use Free IP Search (ARP scan)',
        content: '1. Click the subnet range button of your choice (e.g. 192.168.1.X or 10.0.0.X).\n2. NetMajik temporarily assigns a **wide subnet mask** to the network card so it can perform a full ARP sweep across all IP addresses in that segment.\n3. The app sends ARP requests and ultra-fast pings to discover active hosts.\n4. When it finds an IP with no response (free/unused), it automatically assigns that address to your adapter using the configured mask and gateway.',
      },
      {
        heading: '💡 Pro tips',
        content: '• The default mask is always **255.255.255.0**.\n• Press **Enter** in any Quick IP field (IP, gateway) to apply immediately.\n• The scan will avoid reserved IPs (network address, broadcast, gateway) automatically.\n• You can customize the predefined range buttons in the Settings panel.',
      },
    ],
    profiles: [
      {
        heading: '🎯 What is it and what is it for?',
        content: '**Network Profiles** save a complete IP configuration (IP, mask, gateway, DNS) under a memorable name. Technicians who work on-site at different client networks (office, industrial plant, lab, data center) can switch IP configurations with a single click instead of manually typing each time.',
      },
      {
        heading: '🚀 How to create and apply a Profile',
        content: '1. In the side menu, click **"Create Profile"**.\n2. Assign a descriptive name (e.g. "Main Office", "Hikvision Camera Subnet 10", "Client Server Room").\n3. Enter the IP, mask, gateway, and DNS values then save.\n4. To apply a saved profile, select it from the list and click **Apply Profile**.\n5. The selected profile is instantly applied to the currently active adapter.',
      },
      {
        heading: '💡 Pro tips',
        content: '• Create a **Loopback profile** with IP 127.0.0.1 for quick testing without real network hardware.\n• You can export / import profiles as JSON files for backup or sharing with a team.\n• Profiles are stored locally, so they persist across sessions without needing a server.',
      },
    ],
    winshortcuts: [
      {
        heading: '🎯 What is it and what is it for?',
        content: 'The **Windows Features** section is a unified control panel that combines native Windows system tools (.cpl, .msc, .exe) with the most frequently used network maintenance scripts — all from a single interface without memorizing commands or navigating multiple menus.',
      },
      {
        heading: '🚀 Filter Tabs and Categories',
        content: '• **All:** Shows every item in the catalog in a single grid.\n• **Maintenance & Scripts:** Runs internal repair and reporting actions (flush DNS, ARP table, routes, Winsock reset). Report commands open a floating interactive window with the full output so you can copy or examine it.\n• **System Tools:** Opens native Windows panels directly (Device Manager, Firewall, Services, Task Manager, etc.).\n• **Custom:** Shows only the shortcuts created by the user.',
      },
      {
        heading: '➕ How to add custom shortcuts',
        content: '1. Click the **"+ Add Shortcut"** button in the upper right corner.\n2. Enter a **Name** (e.g. "SQL Management Studio", "Log Viewer", "Custom VPN Script").\n3. Specify the **Command or path**: Accepts executables (.exe), Control Panel applets (.cpl), MMC consoles (.msc), and commands with arguments (e.g. `msdt.exe /id NetworkDiagnosticsNetworkAdapter`).\n4. Save the shortcut. It appears in your catalog with a delete option at any time.',
      },
    ],
    maintenance: [
      {
        heading: '📜 Maintenance Command Glossary',
        content: '• **Flush DNS Cache (`ipconfig /flushdns`):** Clears DNS name resolutions stored in memory. Use when a domain has recently changed its server IP or is not loading correctly because the old IP is cached.\n\n• **Renew IP (`ipconfig /release & renew`):** Forces the adapter to drop its current IP and request a new lease from the DHCP server. Resolves IP conflicts and connectivity issues after network changes.\n\n• **Reset Winsock Catalog (`netsh winsock reset`):** Rebuilds the Windows TCP/IP communication stack from scratch. The definitive fix when the network loses connectivity despite having a valid IP assigned.\n\n• **ARP Table (`arp -a`):** Displays the memory map of IP-to-MAC address mappings learned on the local segment. Useful for finding devices and detecting ARP spoofing.\n\n• **Routing Table (`route print`):** Shows the metrics and gateways through which the OS routes data packets. Essential for diagnosing routing loops or incorrect default gateway.\n\n• **Reboot to BIOS (`shutdown /r /fw /t 0`):** Reboots the PC and directly enters UEFI/BIOS firmware setup without pressing any keys at startup.',
      },
    ],
    networkscanner: [
      {
        heading: '🎯 What is it and what is it for?',
        content: 'The **Network Scanner** sends ping requests and inspects ARP responses for all IP ranges associated with your adapter to list every device present in your local network: printers, servers, phones, IP cameras, routers, managed switches, NAS drives, etc.',
      },
      {
        heading: '🚀 Key features',
        content: '• **MAC Manufacturer Resolution:** Queries the IEEE OUI assignment database to identify device manufacturers (Hikvision, Cisco, Apple, TP-Link, Intel, Dahua, etc.) from the first 3 bytes of the MAC address.\n• **Latency Diagnostics:** Displays the response time in milliseconds for each discovered device — identifies slow devices or congested network segments.\n• **Quick Actions:** From any discovered host you can: send it directly to the Ping Monitor, pass its IP to the Port Scanner, save it to your device inventory, or open a traceroute to it.',
      },
      {
        heading: '💡 Pro tips',
        content: '• Scan with a /24 mask (255.255.255.0) for networks up to 254 hosts, or widen to /16 for larger segments (note: longer scan time).\n• Devices that block ICMP (ping) may still appear if they respond to ARP.\n• Export the scan results as CSV for documentation or inventory reports.',
      },
    ],
    portscanner: [
      {
        heading: '🎯 What is it and what is it for?',
        content: 'The **Port Scanner** checks which TCP ports are open on a target device. This is fundamental for verifying:\n• If an IP camera has its HTTP web panel active (port 80, 8080, 443)\n• If a server has SSH (22), Remote Desktop RDP (3389), or FTP (21)\n• If database servers are accessible: MySQL (3306), SQL Server (1433), PostgreSQL (5432)\n• If security devices or NVRs are listening on expected ports',
      },
      {
        heading: '🚀 How to use it',
        content: '1. Enter the target IP address in the field.\n2. Choose a port range or use one of the presets:\n   - **Web:** 80, 443, 8080, 8443\n   - **Admin:** 22 (SSH), 23 (Telnet), 3389 (RDP)\n   - **CCTV:** 554 (RTSP), 8000 (Hikvision SDK), 37777 (Dahua)\n   - **Databases:** 3306, 1433, 5432, 27017\n3. Start the scan. Open ports appear in green with service name identification, closed/filtered ports appear in red.\n4. The scanner shows an ETA and progress percentage for large scans.',
      },
      {
        heading: '⚠️ Important notice',
        content: '• Only scan devices you own or have explicit authorization to scan. Port scanning unauthorized systems is illegal in many jurisdictions.\n• Corporate firewalls may filter some ports even if the service is running — a "closed" result does not always mean the service is off.\n• The scanner performs TCP connection probes (SYN), not ICMP, so firewalls that block ping may still have ports detected correctly.',
      },
    ],
    subnet: [
      {
        heading: '🎯 What is it and what is it for?',
        content: 'The **Subnet Calculator** instantly computes all IPv4 parameters needed to design or configure any network segment. Enter any IP address and a CIDR prefix (e.g. /24, /28, /16) or a decimal mask (e.g. 255.255.255.0) and the calculator outputs every derived value.',
      },
      {
        heading: '🚀 Calculated outputs',
        content: '• **Network Address:** First IP of the segment (not assignable to hosts).\n• **Broadcast Address:** Last IP — used for sending messages to all devices simultaneously.\n• **Usable Range:** First and last IP assignable to real machines.\n• **Maximum Hosts:** Number of usable addresses (2ⁿ - 2, where n = host bits).\n• **Wildcard Mask:** Inverse of the subnet mask — used in Cisco router ACLs and firewall rules.\n• **Binary representation:** Shows the IP and mask in binary for deep CIDR understanding.',
      },
      {
        heading: '💡 CIDR Quick Reference',
        content: '/30 → 2 hosts (point-to-point links)\n/29 → 6 hosts\n/28 → 14 hosts\n/27 → 30 hosts\n/26 → 62 hosts\n/25 → 126 hosts\n/24 → 254 hosts (most common LAN)\n/23 → 510 hosts\n/22 → 1022 hosts\n/21 → 2046 hosts\n/16 → 65534 hosts (large campus)',
      },
    ],
    connectivity: [
      {
        heading: '🎯 What is it and what is it for?',
        content: '• **Multi-target Ping Monitor:** Add multiple destinations (8.8.8.8, local router, web server, DNS) to display a real-time latency graph and packet loss percentage for each target simultaneously.\n• **Traceroute:** Traces the hop-by-hop path (intermediate routers) a packet takes to reach its destination. Identifies where congestion or routing failure occurs in the chain.',
      },
      {
        heading: '🚀 How to get the most out of Ping Monitor',
        content: '1. Click **"Add Target"** and enter an IP or hostname.\n2. The graph updates every second showing latency trends.\n3. Color coding: green (<50ms), yellow (50–150ms), red (>150ms or loss).\n4. Pin important targets using the star icon — they persist across sessions.\n5. Use **"Export log"** to save a timestamped CSV of the ping session.',
      },
      {
        heading: '🔭 How to interpret Traceroute results',
        content: '• Each row is a "hop" — a router through which the packet passed.\n• **High latency at a specific hop:** Congestion or throttling on that router.\n• **"* * *" rows:** The router did not respond to ICMP TTL-expired messages (firewall rule — does not necessarily mean the route is broken).\n• **Latency increasing from hop X onwards:** The bottleneck is at or after hop X.\n• **Loop detected:** The packet is being routed back through previous hops — serious routing misconfiguration.',
      },
    ],
    credentials: [
      {
        heading: '🎯 What is it and what is it for?',
        content: 'The **Credential Library** stores a secure local database of default credentials for network equipment (routers, switches, IP cameras, NVRs, access points). Technicians no longer need to consult paper manuals during field installations — the library is always accessible within the app.',
      },
      {
        heading: '🚀 How to use it',
        content: '1. Navigate to the Credentials section.\n2. Search by device brand (Hikvision, Dahua, Cisco, Ubiquiti, MikroTik, TP-Link, etc.) or by type (camera, router, switch).\n3. Click a credential entry to copy the username or password to the clipboard.\n4. Add custom entries for devices specific to your environment using the **"+ Add"** button.',
      },
      {
        heading: '🔒 Security note',
        content: '• Credentials are stored locally in encrypted form — they never leave your machine.\n• Always change default credentials on devices after installation. This library is only for initial access during setup.\n• Do not store production or high-privilege passwords here; use a proper secrets manager for those.',
      },
    ],
    clipboard: [
      {
        heading: '🎯 What is it and what is it for?',
        content: 'The **Clipboard & Snippets Manager** is a quick-access notepad for storing text fragments you use frequently: DNS servers (1.1.1.1, 8.8.8.8), IP ranges, server paths, VLAN IDs, commands, etc. Click any snippet to copy it to the clipboard instantly.',
      },
      {
        heading: '🚀 How to add and manage snippets',
        content: '1. Click **"+ New Snippet"**.\n2. Give it a label (e.g. "Cloudflare DNS", "Client Server IP", "Admin SSH Command").\n3. Enter the text value.\n4. Save it — it appears in the grid for one-click copy.\n5. Snippets are organized in the order you create them; drag to reorder.',
      },
    ],
    globalsearch: [
      {
        heading: '🚀 How to use Global Search',
        content: 'Press **Ctrl + K** anywhere in the app to open the universal floating search bar. Type the name of any function, profile, adapter, or tool to jump to it immediately without using the side menu.',
      },
      {
        heading: '💡 Search tips',
        content: '• Search is case-insensitive and works on partial matches.\n• You can type "ping" to go directly to the Ping Monitor, "scan" for the Network Scanner, "port" for the Port Scanner, etc.\n• The search also indexes your saved profiles by name.\n• Press **Esc** to close the search bar without navigating.',
      },
    ],
    riddles: [
      {
        heading: '📜 Riddle I — The Mirror of the Infinite Loop',
        content: '"He who seeks his own reflection in the digital realm must forge an identity bearing the sacred number of the local origin — the ancient address of the self that always returns to itself... Summon it, and the gateway to the first mystery shall open."',
      },
      {
        heading: '📜 Riddle II — The Whistle of the Sacred Teapot',
        content: '"In the vast sea of transport protocols, an ancient teapot slumbers — declared by RFC 2324 to refuse coffee forever (HTTP Error 418). Query its exact port in the service scanner, and you shall hear it whistle across the network..."',
      },
      {
        heading: '📜 Riddle III — The Song of the Unyielding Bard',
        content: '"Among the list of installed realms and applications, whisper the words of the anthem that shall never give you up, never let you down, never run around and desert you... Speak its name, and the bard will appear."',
      },
      {
        heading: '📜 Riddle IV — The Illusion of the Green Code',
        content: '"In the search of diagnosis or the system console, type the name of the world of the green simulation — where reality is questioned and nothing is what it seems. Awaken the code, and the matrix will reveal itself."',
      },
      {
        heading: '📜 Riddle V — The Call of the Golden Echo',
        content: '"There is a legendary address known by every network engineer — the resolver of the world, keeper of DNS at the four repeated digit. Send your ping packets to this oracle, and watch the elite animation respond to your summons..."',
      },
    ],
  },

  es: {
    interfaces: [
      {
        heading: '🎯 ¿Qué es y para qué sirve?',
        content: 'La pantalla principal de **Interfaces** muestra en tiempo real todos los adaptadores físicos y virtuales de tu equipo (Ethernet, Wi-Fi, túneles VPN, switches virtuales de Hyper-V, etc.). Para cada adaptador puedes ver su IP actual, máscara de subred, puerta de enlace, servidores DNS primario y secundario, dirección MAC y estado del cable o enlace Wi-Fi.\n\nEs el centro de mando desde donde parten todas las acciones de configuración de red.',
      },
      {
        heading: '🚀 Guía paso a paso',
        content: '1. **Seleccionar un adaptador:** Haz clic en cualquier tarjeta de la lista izquierda para marcarla como interfaz activa.\n2. **Modo DHCP (Automático):** Pulsa "Cambiar a DHCP" para que tu router asigne la IP automáticamente mediante negociación DHCP.\n3. **Modo Estático:** Introduce la IP, máscara de subred (predeterminada 255.255.255.0), gateway y DNS primario/secundario (ej. 8.8.8.8 / 1.1.1.1) y pulsa **Aplicar**.\n4. **Actualizar:** Usa el botón de refresco para recargar la lista de adaptadores sin reiniciar la app.',
      },
      {
        heading: '💡 Consejos Pro y Atajos de Teclado',
        content: '• **Doble clic en un adaptador:** Abre directamente el panel de propiedades de red de Windows.\n• **Tecla Enter:** Puedes pulsar Enter en cualquier campo de texto para aplicar los cambios sin hacer clic.\n• **Permisos de administrador:** Cambiar la configuración de IP estática requiere ejecutar NetMajik como Administrador. Si no tiene elevación, aparecerá un aviso amarillo.\n• **Copiar valores:** Haz clic en la IP, máscara o puerta de enlace mostrada en el panel de información para copiarla al portapapeles al instante.',
      },
      {
        heading: '⚠️ Resolución de Problemas',
        content: '• **No aparecen adaptadores:** Asegúrate de que los controladores de red estén instalados y reconocidos por el Administrador de Dispositivos de Windows.\n• **El cambio de IP no surte efecto:** Comprueba si un cliente VPN o una política de empresa está sobrescribiendo la tabla de rutas.\n• **Adaptador en gris:** Un adaptador desactivado no se puede configurar. Haz clic derecho en el Administrador de Dispositivos y selecciona "Habilitar".',
      },
    ],
    quickip: [
      {
        heading: '🎯 ¿Qué es y para qué sirve?',
        content: 'El widget de **IP Rápida** en la parte superior de la vista principal permite asignar una nueva dirección IP en segundos sin abrir los menús de configuración de Windows. La máscara de subred predeterminada se establece automáticamente en **255.255.255.0** (/24) para ahorrar tiempo en los escenarios más comunes.',
      },
      {
        heading: '🚀 Cómo usar la Búsqueda de IP Libre (escaneo ARP)',
        content: '1. Haz clic en el botón de rango de subred deseado (ej. 192.168.1.X o 10.0.0.X).\n2. NetMajik configura temporalmente una **máscara ancha** en tu tarjeta de red para poder realizar un barrido ARP completo sobre todas las IPs del segmento.\n3. La app envía peticiones ARP y pings ultrarrápidos para descubrir hosts activos.\n4. Al encontrar una IP sin respuesta (libre/desocupada), la asigna automáticamente a tu adaptador con la máscara y gateway configurados.',
      },
      {
        heading: '💡 Consejos Pro',
        content: '• La máscara predeterminada es siempre **255.255.255.0**.\n• Pulsa **Enter** en cualquier campo de IP Rápida (IP, gateway) para aplicar de forma inmediata.\n• El escáner evita automáticamente las IPs reservadas (dirección de red, broadcast, gateway).\n• Puedes personalizar los botones de rango predefinidos desde el panel de Configuración.',
      },
    ],
    profiles: [
      {
        heading: '🎯 ¿Qué es y para qué sirve?',
        content: 'Los **Perfiles de Red** guardan una configuración IP completa (IP, máscara, gateway, DNS) con un nombre memorable. Los técnicos que trabajan en distintas redes de cliente (oficina, planta industrial, laboratorio, centro de datos) pueden cambiar configuración de red con un solo clic en lugar de teclear manualmente cada vez.',
      },
      {
        heading: '🚀 Cómo crear y aplicar un Perfil',
        content: '1. En el menú lateral, pulsa **"Crear Perfil"**.\n2. Asigna un nombre descriptivo (ej. "Oficina Principal", "Subred Cámaras Hikvision 10", "Sala de Servidores del Cliente").\n3. Introduce los valores de IP, máscara, gateway y DNS y guarda.\n4. Para aplicar un perfil guardado, selecciónalo de la lista y haz clic en **Aplicar Perfil**.\n5. El perfil seleccionado se aplica instantáneamente al adaptador activo.',
      },
      {
        heading: '💡 Consejos Pro',
        content: '• Crea un **perfil Loopback** con IP 127.0.0.1 para pruebas rápidas sin hardware de red real.\n• Puedes exportar / importar perfiles como archivos JSON para hacer copias de seguridad o compartirlos con un equipo.\n• Los perfiles se almacenan localmente, por lo que persisten entre sesiones sin necesitar servidor.',
      },
    ],
    winshortcuts: [
      {
        heading: '🎯 ¿Qué es y para qué sirve?',
        content: 'La sección **Funciones de Windows** es un panel de control unificado que combina las herramientas nativas del sistema operativo (.cpl, .msc, .exe) con los scripts de mantenimiento de red más frecuentes — todo desde una única interfaz sin necesidad de memorizar comandos ni navegar múltiples menús.',
      },
      {
        heading: '🚀 Pestañas de Filtro y Categorías',
        content: '• **Todas:** Muestra todo el catálogo disponible en una única cuadrícula.\n• **Mantenimiento y Scripts:** Ejecuta acciones de reparación interna (limpiar DNS, tabla ARP, rutas, reiniciar Winsock). Los comandos de informe abren una ventana flotante interactiva con el resultado completo para copiar o examinar.\n• **Herramientas del Sistema:** Abre paneles nativos externos de Windows directamente (Administrador de Dispositivos, Firewall, Servicios, Administrador de Tareas, etc.).\n• **Personalizadas:** Muestra únicamente los accesos directos creados por el usuario.',
      },
      {
        heading: '➕ Cómo añadir accesos directos personalizados',
        content: '1. Haz clic en el botón **"+ Añadir Acceso"** en la esquina superior derecha.\n2. Escribe un **Nombre** (ej. "SQL Management Studio", "Visor de Registro", "Script VPN Personalizado").\n3. Especifica el **Comando o ruta**: Admite ejecutables (.exe), applets del Panel de Control (.cpl), consolas MMC (.msc) y comandos con argumentos (ej. `msdt.exe /id NetworkDiagnosticsNetworkAdapter`).\n4. Guarda el acceso. Aparece en tu catálogo con opción de eliminar en cualquier momento.',
      },
    ],
    maintenance: [
      {
        heading: '📜 Glosario de Comandos de Mantenimiento',
        content: '• **Limpiar Caché DNS (`ipconfig /flushdns`):** Borra las resoluciones de nombres almacenadas en memoria. Úsalo cuando un dominio ha cambiado recientemente su IP de servidor o no carga correctamente porque la IP antigua está en caché.\n\n• **Renovar IP (`ipconfig /release & renew`):** Fuerza al adaptador a descartar su IP actual y pedir una nueva concesión al servidor DHCP. Resuelve conflictos de IP y problemas de conectividad tras cambios de red.\n\n• **Reiniciar Catálogo Winsock (`netsh winsock reset`):** Reconstruye desde cero la pila de comunicación TCP/IP de Windows. Solución definitiva cuando la red pierde conectividad a pesar de tener una IP válida asignada.\n\n• **Tabla ARP (`arp -a`):** Muestra el mapa de memoria de asociaciones IP-MAC aprendidas en el segmento local. Útil para localizar dispositivos y detectar suplantación ARP (ARP spoofing).\n\n• **Tabla de Rutas (`route print`):** Muestra las métricas y puertas de enlace por las que el SO envía los paquetes de datos. Esencial para diagnosticar bucles de enrutamiento o puerta de enlace incorrecta.\n\n• **Reiniciar en BIOS (`shutdown /r /fw /t 0`):** Reinicia el equipo y entra directamente en la configuración del firmware UEFI/BIOS sin presionar teclas al encender.',
      },
    ],
    networkscanner: [
      {
        heading: '🎯 ¿Qué es y para qué sirve?',
        content: 'El **Escáner de Red** envía pings e inspecciona respuestas ARP de todos los rangos IP asociados a tu adaptador para listar todos los dispositivos presentes en tu red local: impresoras, servidores, teléfonos, cámaras IP, routers, switches gestionados, NAS, etc.',
      },
      {
        heading: '🚀 Funciones Clave',
        content: '• **Resolución de Fabricante por MAC:** Consulta la base de datos de asignación OUI de IEEE para identificar fabricantes de dispositivos (Hikvision, Cisco, Apple, TP-Link, Intel, Dahua, etc.) a partir de los 3 primeros bytes de la MAC.\n• **Diagnóstico de Latencia:** Muestra el tiempo de respuesta en milisegundos de cada dispositivo descubierto — identifica equipos lentos o segmentos de red congestionados.\n• **Acciones Rápidas:** Desde cualquier host descubierto puedes: enviarlo directamente al Monitor de Ping, pasar su IP al Escáner de Puertos, guardarlo en tu inventario o abrir un traceroute hacia él.',
      },
      {
        heading: '💡 Consejos Pro',
        content: '• Escanea con máscara /24 (255.255.255.0) para redes de hasta 254 hosts, o amplía a /16 para segmentos más grandes (el escaneo tarda más).\n• Los dispositivos que bloquean ICMP (ping) pueden seguir apareciendo si responden a ARP.\n• Exporta los resultados como CSV para documentación o informes de inventario.',
      },
    ],
    portscanner: [
      {
        heading: '🎯 ¿Qué es y para qué sirve?',
        content: 'El **Escáner de Puertos** comprueba qué puertos TCP están abiertos en un dispositivo destino. Es fundamental para verificar:\n• Si una cámara IP tiene activo su panel web HTTP (puerto 80, 8080, 443)\n• Si un servidor tiene SSH (22), Escritorio Remoto RDP (3389) o FTP (21)\n• Si los servidores de bases de datos son accesibles: MySQL (3306), SQL Server (1433), PostgreSQL (5432)\n• Si dispositivos de seguridad o NVRs están escuchando en los puertos esperados',
      },
      {
        heading: '🚀 Cómo utilizarlo',
        content: '1. Introduce la dirección IP destino en el campo.\n2. Elige un rango de puertos o usa uno de los presets:\n   - **Web:** 80, 443, 8080, 8443\n   - **Administración:** 22 (SSH), 23 (Telnet), 3389 (RDP)\n   - **CCTV:** 554 (RTSP), 8000 (SDK Hikvision), 37777 (Dahua)\n   - **Bases de datos:** 3306, 1433, 5432, 27017\n3. Inicia el escaneo: puertos abiertos aparecen en verde con identificación del servicio; cerrados/filtrados en rojo.\n4. El escáner muestra un tiempo estimado y porcentaje de progreso para escaneos grandes.',
      },
      {
        heading: '⚠️ Aviso importante',
        content: '• Escanea únicamente dispositivos que sean de tu propiedad o para los que tengas autorización explícita. El escaneo de puertos en sistemas no autorizados es ilegal en muchas jurisdicciones.\n• Los cortafuegos corporativos pueden filtrar puertos aunque el servicio esté activo — un resultado "cerrado" no siempre significa que el servicio está apagado.\n• El escáner realiza sondeos de conexión TCP (SYN), no ICMP, por lo que equipos que bloquean ping pueden tener sus puertos detectados correctamente.',
      },
    ],
    subnet: [
      {
        heading: '🎯 ¿Qué es y para qué sirve?',
        content: 'La **Calculadora de Subred** calcula al instante todos los parámetros IPv4 necesarios para diseñar o configurar cualquier segmento de red. Introduce cualquier dirección IP y un prefijo CIDR (ej. /24, /28, /16) o máscara decimal (ej. 255.255.255.0) y la calculadora devuelve todos los valores derivados.',
      },
      {
        heading: '🚀 Datos Calculados',
        content: '• **Dirección de Red:** Primera IP del segmento (no asignable a hosts).\n• **Dirección de Broadcast:** Última IP — usada para enviar mensajes a todos los dispositivos simultáneamente.\n• **Rango Utilizable:** Primera y última IP asignable a máquinas reales.\n• **Hosts Máximos:** Número de direcciones utilizables (2ⁿ - 2, donde n = bits de host).\n• **Máscara Wildcard:** Inversa de la máscara de subred — usada en ACLs de routers Cisco y reglas de firewall.\n• **Representación binaria:** Muestra la IP y la máscara en binario para comprender CIDR en profundidad.',
      },
      {
        heading: '💡 Referencia rápida CIDR',
        content: '/30 → 2 hosts (enlaces punto a punto)\n/29 → 6 hosts\n/28 → 14 hosts\n/27 → 30 hosts\n/26 → 62 hosts\n/25 → 126 hosts\n/24 → 254 hosts (LAN más común)\n/23 → 510 hosts\n/22 → 1022 hosts\n/21 → 2046 hosts\n/16 → 65534 hosts (campus grande)',
      },
    ],
    connectivity: [
      {
        heading: '🎯 ¿Qué es y para qué sirve?',
        content: '• **Monitor de Ping Múltiple:** Añade varios destinos (8.8.8.8, router local, servidor web, DNS) para ver un gráfico de latencia y porcentaje de pérdida de paquetes de cada objetivo en tiempo real y de forma simultánea.\n• **Traceroute:** Muestra el camino salto a salto (routers intermedios) que recorre un paquete hasta alcanzar su destino. Identifica dónde se produce una congestión o fallo de ruta en la cadena.',
      },
      {
        heading: '🚀 Cómo sacar el máximo partido al Monitor de Ping',
        content: '1. Haz clic en **"Añadir Objetivo"** e introduce una IP o nombre de host.\n2. El gráfico se actualiza cada segundo mostrando tendencias de latencia.\n3. Código de colores: verde (<50ms), amarillo (50–150ms), rojo (>150ms o pérdida).\n4. Fija objetivos importantes con el icono de estrella — persisten entre sesiones.\n5. Usa **"Exportar registro"** para guardar un CSV con marcas de tiempo de la sesión de ping.',
      },
      {
        heading: '🔭 Cómo interpretar los resultados de Traceroute',
        content: '• Cada fila es un "salto" — un router por el que pasó el paquete.\n• **Latencia alta en un salto concreto:** Congestión o limitación de velocidad en ese router.\n• **Filas con "* * *":** El router no respondió a mensajes ICMP TTL-expirado (regla de firewall — no significa necesariamente que la ruta esté rota).\n• **Latencia creciente a partir del salto X:** El cuello de botella está en el salto X o después.\n• **Bucle detectado:** El paquete vuelve a pasar por saltos anteriores — configuración de enrutamiento incorrecta grave.',
      },
    ],
    credentials: [
      {
        heading: '🎯 ¿Qué es y para qué sirve?',
        content: 'La **Biblioteca de Credenciales** almacena una base de datos local segura con las credenciales por defecto de equipos de red (routers, switches, cámaras IP, NVRs, puntos de acceso). Los técnicos ya no necesitan consultar manuales en papel durante las instalaciones en campo — la biblioteca siempre es accesible dentro de la app.',
      },
      {
        heading: '🚀 Cómo usarla',
        content: '1. Navega a la sección de Credenciales.\n2. Busca por marca (Hikvision, Dahua, Cisco, Ubiquiti, MikroTik, TP-Link, etc.) o por tipo (cámara, router, switch).\n3. Haz clic en una entrada para copiar el usuario o contraseña al portapapeles.\n4. Añade entradas personalizadas para dispositivos específicos de tu entorno con el botón **"+ Añadir"**.',
      },
      {
        heading: '🔒 Nota de seguridad',
        content: '• Las credenciales se almacenan localmente en forma cifrada — nunca salen de tu equipo.\n• Cambia siempre las credenciales por defecto en los dispositivos tras la instalación. Esta biblioteca solo es para el acceso inicial durante la puesta en marcha.\n• No guardes contraseñas de producción o con altos privilegios aquí; usa un gestor de secretos adecuado.',
      },
    ],
    clipboard: [
      {
        heading: '🎯 ¿Qué es y para qué sirve?',
        content: 'El **Gestor de Portapapeles y Snippets** es un bloc de notas de acceso rápido para almacenar fragmentos de texto que usas frecuentemente: servidores DNS (1.1.1.1, 8.8.8.8), rangos de IP, rutas de servidor, IDs de VLAN, comandos, etc. Haz clic en cualquier snippet para copiarlo al portapapeles al instante.',
      },
      {
        heading: '🚀 Cómo añadir y gestionar snippets',
        content: '1. Haz clic en **"+ Nuevo Snippet"**.\n2. Dale una etiqueta (ej. "DNS Cloudflare", "IP Servidor Cliente", "Comando SSH Admin").\n3. Introduce el valor de texto.\n4. Guárdalo — aparece en la cuadrícula para copiarlo con un clic.\n5. Los snippets se organizan en el orden en que los creas; arrástralos para reordenarlos.',
      },
    ],
    globalsearch: [
      {
        heading: '🚀 Cómo usar la Búsqueda Global',
        content: 'Pulsa **Ctrl + K** en cualquier parte de la app para abrir la barra de búsqueda flotante universal. Escribe el nombre de cualquier función, perfil, adaptador o herramienta para saltar a ella de forma inmediata sin usar el menú lateral.',
      },
      {
        heading: '💡 Consejos de búsqueda',
        content: '• La búsqueda no distingue mayúsculas y funciona con coincidencias parciales.\n• Escribe "ping" para ir directamente al Monitor de Ping, "escan" para el Escáner de Red, "puerto" para el Escáner de Puertos, etc.\n• La búsqueda también indexa tus perfiles guardados por nombre.\n• Pulsa **Esc** para cerrar la barra de búsqueda sin navegar.',
      },
    ],
    riddles: [
      {
        heading: '📜 Acertijo I — El Espejo del Bucle Infinito',
        content: '"Aquel que busca su propio reflejo en el plano digital debe forjar una identidad con el número sagrado del origen local — la dirección antigua del ser que siempre regresa a sí mismo... Invócala, y la puerta al primer misterio se abrirá."',
      },
      {
        heading: '📜 Acertijo II — El Silbido de la Tetera Sagrada',
        content: '"En el vasto mar de los protocolos de transporte, una tetera ancestral dormita — declarada por el RFC 2324 para negarse eternamente a servir café (Error HTTP 418). Interroga a su puerto exacto en el escáner de servicios, y oirás su silbido cruzar la red..."',
      },
      {
        heading: '📜 Acertijo III — El Canto del Bardo Inquebrantable',
        content: '"Entre la lista de reinos y aplicaciones instaladas, susurra las palabras del himno que jamás te abandonará ni te dejará caer, que nunca correrá lejos de ti... Pronuncia su nombre, y el bardo aparecerá ante ti."',
      },
      {
        heading: '📜 Acertijo IV — La Ilusión del Código Verde',
        content: '"En la búsqueda del diagnóstico o la consola del sistema, teclea el nombre del mundo de la simulación verde — donde la realidad se cuestiona y nada es lo que parece. Despierta el código, y la matrix se revelará."',
      },
      {
        heading: '📜 Acertijo V — La Llamada al Eco Dorado',
        content: '"Existe una dirección legendaria conocida por todo ingeniero de redes — el resolvedor del mundo, guardián del DNS en el dígito cuádruple repetido. Envía tus paquetes de Ping a este oráculo, y observa cómo la animación élite responde a tu invocación..."',
      },
    ],
  },

  pt: {
    interfaces: [
      { heading: '🎯 O que é e para que serve?', content: 'A tela principal de **Interfaces** exibe em tempo real todos os adaptadores físicos e virtuais do seu computador (Ethernet, Wi-Fi, túneis VPN, switches virtuais Hyper-V, etc.). Para cada adaptador você pode ver o IP atual, máscara de sub-rede, gateway padrão, servidores DNS primário e secundário, endereço MAC e status do cabo ou link Wi-Fi.' },
      { heading: '🚀 Guia passo a passo', content: '1. **Selecionar um adaptador:** Clique em qualquer cartão da lista à esquerda para defini-lo como interface ativa.\n2. **Modo DHCP (Automático):** Clique em "Mudar para DHCP" para que o roteador atribua o IP automaticamente.\n3. **Modo Estático:** Insira o IP, máscara (padrão 255.255.255.0), gateway e DNS e clique em **Aplicar**.\n4. **Atualizar:** Use o botão de atualizar para recarregar a lista sem reiniciar o app.' },
      { heading: '💡 Dicas Pro', content: '• **Duplo clique no adaptador:** Abre as propriedades de rede do Windows diretamente.\n• **Tecla Enter:** Pressione Enter em qualquer campo para aplicar sem clicar.\n• **Requer administrador:** Alterar IP estático requer NetMajik executado como Administrador.' },
      { heading: '⚠️ Solução de Problemas', content: '• **Nenhum adaptador aparece:** Verifique se os drivers de rede estão instalados.\n• **Mudança de IP sem efeito:** Verifique se um cliente VPN está sobrescrevendo a tabela de roteamento.\n• **Adaptador acinzentado:** Um adaptador desabilitado não pode ser configurado.' },
    ],
    quickip: [
      { heading: '🎯 O que é e para que serve?', content: 'O widget **IP Rápido** permite atribuir um novo endereço IP em segundos sem abrir as configurações do Windows. A máscara padrão é automaticamente **255.255.255.0** (/24).' },
      { heading: '🚀 Como usar a Busca de IP Livre (varredura ARP)', content: '1. Clique no botão de faixa de sub-rede desejada.\n2. O NetMajik configura temporariamente uma **máscara ampla** no adaptador para varredura ARP completa.\n3. O app envia requisições ARP e pings rápidos para descobrir hosts ativos.\n4. Ao encontrar um IP sem resposta (livre), atribui automaticamente ao adaptador.' },
      { heading: '💡 Dicas Pro', content: '• A máscara padrão é sempre **255.255.255.0**.\n• Pressione **Enter** em qualquer campo de IP Rápido para aplicar imediatamente.\n• O scanner evita automaticamente IPs reservados (rede, broadcast, gateway).' },
    ],
    profiles: [
      { heading: '🎯 O que é e para que serve?', content: 'Os **Perfis de Rede** salvam uma configuração IP completa com um nome memorável. Técnicos que trabalham em redes de clientes diferentes podem trocar configurações com um único clique.' },
      { heading: '🚀 Como criar e aplicar um Perfil', content: '1. No menu lateral, clique em **"Criar Perfil"**.\n2. Atribua um nome descritivo.\n3. Insira IP, máscara, gateway e DNS e salve.\n4. Para aplicar, selecione o perfil e clique em **Aplicar Perfil**.' },
      { heading: '💡 Dicas Pro', content: '• Crie um **perfil Loopback** com IP 127.0.0.1 para testes rápidos.\n• Exporte/importe perfis como arquivos JSON para backup ou compartilhamento.' },
    ],
    winshortcuts: [
      { heading: '🎯 O que é e para que serve?', content: 'A seção **Recursos do Windows** é um painel de controle unificado que combina ferramentas nativas do sistema operacional (.cpl, .msc, .exe) com scripts de manutenção de rede — tudo em uma única interface.' },
      { heading: '🚀 Abas de Filtro e Categorias', content: '• **Todas:** Mostra todo o catálogo em uma única grade.\n• **Manutenção e Scripts:** Executa ações de reparo interno (limpar DNS, tabela ARP, rotas, reset Winsock).\n• **Ferramentas do Sistema:** Abre painéis nativos do Windows diretamente.\n• **Personalizadas:** Exibe apenas os atalhos criados pelo usuário.' },
      { heading: '➕ Como adicionar atalhos personalizados', content: '1. Clique em **"+ Adicionar Atalho"**.\n2. Insira um **Nome** e o **Comando ou caminho**.\n3. Salve — aparece no catálogo com opção de excluir a qualquer momento.' },
    ],
    maintenance: [
      { heading: '📜 Glossário de Comandos de Manutenção', content: '• **Limpar Cache DNS (`ipconfig /flushdns`):** Apaga resoluções de nomes armazenadas em memória.\n• **Renovar IP (`ipconfig /release & renew`):** Força o adaptador a descartar o IP atual e solicitar novo ao DHCP.\n• **Resetar Winsock (`netsh winsock reset`):** Reconstrói a pilha TCP/IP do Windows. Solução definitiva quando a rede perde conectividade.\n• **Tabela ARP (`arp -a`):** Exibe o mapa de endereços IP-MAC aprendidos no segmento local.\n• **Tabela de Rotas (`route print`):** Mostra as métricas e gateways de roteamento do SO.\n• **Reiniciar na BIOS (`shutdown /r /fw /t 0`):** Reinicia o PC e entra diretamente na configuração UEFI/BIOS.' },
    ],
    networkscanner: [
      { heading: '🎯 O que é e para que serve?', content: 'O **Scanner de Rede** envia pings e inspeciona respostas ARP para listar todos os dispositivos na sua rede local: impressoras, servidores, câmeras IP, roteadores, switches, NAS, etc.' },
      { heading: '🚀 Funções Principais', content: '• **Resolução de Fabricante por MAC:** Identifica fabricantes pelo banco de dados IEEE OUI (Hikvision, Cisco, Apple, etc.).\n• **Diagnóstico de Latência:** Exibe o tempo de resposta em milissegundos de cada dispositivo.\n• **Ações Rápidas:** Enviar host para o Ping Monitor, Scanner de Portas, inventário ou traceroute.' },
      { heading: '💡 Dicas Pro', content: '• Escaneie com /24 para redes de até 254 hosts.\n• Dispositivos que bloqueiam ICMP ainda podem aparecer se responderem a ARP.\n• Exporte os resultados como CSV para documentação.' },
    ],
    portscanner: [
      { heading: '🎯 O que é e para que serve?', content: 'O **Scanner de Portas** verifica quais portas TCP estão abertas em um dispositivo de destino. Essencial para: câmeras IP (80, 8080, 443), SSH (22), RDP (3389), bancos de dados MySQL (3306), SQL Server (1433).' },
      { heading: '🚀 Como usar', content: '1. Insira o IP de destino.\n2. Escolha um intervalo ou use os presets: Web, Admin, CCTV, Bancos de dados.\n3. Inicie o scan: portas abertas em verde, fechadas em vermelho.\n4. O scanner exibe ETA e progresso percentual.' },
      { heading: '⚠️ Aviso importante', content: '• Escaneie apenas dispositivos de sua propriedade ou com autorização explícita.\n• Firewalls corporativos podem filtrar portas mesmo com o serviço ativo.' },
    ],
    subnet: [
      { heading: '🎯 O que é e para que serve?', content: 'A **Calculadora de Sub-rede** calcula instantaneamente todos os parâmetros IPv4. Insira qualquer IP e prefixo CIDR (ex: /24, /28) ou máscara decimal e obtenha todos os valores derivados.' },
      { heading: '🚀 Dados Calculados', content: '• Endereço de Rede, Broadcast, Faixa Utilizável, Hosts Máximos, Máscara Wildcard e representação binária.' },
      { heading: '💡 Referência rápida CIDR', content: '/30 → 2 hosts | /29 → 6 | /28 → 14 | /27 → 30 | /26 → 62 | /25 → 126 | /24 → 254 hosts (LAN mais comum) | /16 → 65534 hosts' },
    ],
    connectivity: [
      { heading: '🎯 O que é e para que serve?', content: '• **Monitor de Ping Múltiplo:** Adicione vários destinos para ver gráfico de latência em tempo real.\n• **Traceroute:** Rastreia o caminho salto a salto até o destino. Identifica congestionamentos ou falhas de roteamento.' },
      { heading: '🚀 Como interpretar resultados de Traceroute', content: '• Cada linha é um "salto" — um roteador pelo qual o pacote passou.\n• **"* * *":** O roteador não respondeu a TTL expirado (regra de firewall).\n• **Latência crescente:** O gargalo está naquele salto ou após ele.' },
    ],
    credentials: [
      { heading: '🎯 O que é e para que serve?', content: 'A **Biblioteca de Credenciais** armazena um banco de dados local seguro com credenciais padrão de equipamentos de rede (roteadores, câmeras, NVRs, switches).' },
      { heading: '🚀 Como usar', content: '1. Busque por marca (Hikvision, Dahua, Cisco, etc.) ou tipo.\n2. Clique em uma entrada para copiar usuário/senha.\n3. Adicione entradas personalizadas com o botão **"+ Adicionar"**.' },
      { heading: '🔒 Nota de segurança', content: 'Credenciais armazenadas localmente de forma criptografada. Sempre altere as credenciais padrão após a instalação.' },
    ],
    clipboard: [
      { heading: '🎯 O que é e para que serve?', content: 'O **Gerenciador de Área de Transferência e Snippets** é um bloco de notas de acesso rápido para armazenar fragmentos de texto frequentes (DNS, IPs, comandos).' },
      { heading: '🚀 Como adicionar e gerenciar snippets', content: '1. Clique em **"+ Novo Snippet"**, dê uma etiqueta e insira o valor de texto.\n2. Salve — aparece na grade para cópia com um clique.' },
    ],
    globalsearch: [
      { heading: '🚀 Como usar a Busca Global', content: 'Pressione **Ctrl + K** em qualquer parte do app para abrir a barra de busca flutuante. Digite o nome de qualquer função, perfil ou ferramenta para navegar imediatamente.' },
      { heading: '💡 Dicas de busca', content: '• Insensível a maiúsculas, funciona com correspondências parciais.\n• Pressione **Esc** para fechar sem navegar.' },
    ],
    riddles: [
      { heading: '📜 Enigma I — O Espelho do Loop Infinito', content: '"Aquele que busca seu próprio reflexo no plano digital deve criar uma identidade com o número sagrado da origem local — o antigo endereço do ser que sempre retorna a si mesmo..."' },
      { heading: '📜 Enigma II — O Apito do Bule Sagrado', content: '"No vasto mar dos protocolos de transporte, um bule ancestral dorme — declarado pelo RFC 2324 para recusar café para sempre (HTTP Error 418). Interrogue sua porta exata no scanner de serviços..."' },
      { heading: '📜 Enigma III — A Canção do Bardo Inabalável', content: '"Entre a lista de reinos e aplicativos instalados, sussurre as palavras do hino que jamais irá te abandonar... Pronuncie seu nome, e o bardo aparecerá."' },
      { heading: '📜 Enigma IV — A Ilusão do Código Verde', content: '"Na busca de diagnóstico ou no console do sistema, digite o nome do mundo da simulação verde — onde a realidade é questionada. Desperte o código, e a matrix se revelará."' },
      { heading: '📜 Enigma V — O Chamado do Eco Dourado', content: '"Existe um endereço lendário conhecido por todo engenheiro de redes — o resolvedor do mundo, guardião do DNS no dígito quádruplo repetido. Envie seus pings para este oráculo..."' },
    ],
  },

  de: {
    interfaces: [
      { heading: '🎯 Was ist es und wofür dient es?', content: 'Der **Interfaces**-Hauptbildschirm zeigt in Echtzeit alle physischen und virtuellen Netzwerkadapter Ihres Computers (Ethernet, WLAN, VPN-Tunnel, virtuelle Hyper-V-Switches usw.). Für jeden Adapter sehen Sie die aktuelle IP, Subnetzmaske, Standard-Gateway, DNS-Server, MAC-Adresse und Verbindungsstatus.' },
      { heading: '🚀 Schritt-für-Schritt-Anleitung', content: '1. **Adapter auswählen:** Klicken Sie auf eine Karte in der linken Liste.\n2. **DHCP-Modus:** Klicken Sie auf "Auf DHCP umschalten" für automatische IP-Zuweisung.\n3. **Statischer Modus:** IP, Maske (Standard 255.255.255.0), Gateway und DNS eingeben und **Übernehmen** klicken.\n4. **Aktualisieren:** Adapter-Liste neu laden ohne App-Neustart.' },
      { heading: '💡 Profi-Tipps', content: '• **Doppelklick auf Adapter:** Öffnet Windows-Netzwerkadaptereigenschaften direkt.\n• **Eingabetaste:** Änderungen ohne Mausklick übernehmen.\n• **Admin erforderlich:** Statische IP-Änderungen erfordern Administratorrechte.' },
      { heading: '⚠️ Fehlerbehebung', content: '• **Keine Adapter angezeigt:** Stellen Sie sicher, dass Netzwerktreiber installiert sind.\n• **IP-Änderung ohne Wirkung:** Prüfen Sie, ob ein VPN-Client die Routing-Tabelle überschreibt.' },
    ],
    quickip: [
      { heading: '🎯 Was ist es und wofür dient es?', content: 'Das **Schnell-IP**-Widget ermöglicht die Zuweisung einer neuen IP-Adresse in Sekunden ohne Windows-Einstellungsmenüs. Die Standard-Subnetzmaske ist automatisch **255.255.255.0** (/24).' },
      { heading: '🚀 Freie IP-Suche (ARP-Scan)', content: '1. Klicken Sie auf die gewünschte Subnetz-Bereichsschaltfläche.\n2. NetMajik weist vorübergehend eine **breite Maske** zu für vollständigen ARP-Sweep.\n3. Die App sendet ARP-Anfragen und Ultra-Schnell-Pings.\n4. Bei einer freien IP wird diese automatisch zugewiesen.' },
      { heading: '💡 Profi-Tipps', content: '• Standard-Maske ist immer **255.255.255.0**.\n• **Eingabetaste** in jedem Schnell-IP-Feld für sofortige Anwendung.' },
    ],
    profiles: [
      { heading: '🎯 Was ist es und wofür dient es?', content: '**Netzwerkprofile** speichern eine vollständige IP-Konfiguration unter einem einprägsamen Namen. Techniker, die in verschiedenen Kundennetzwerken arbeiten, können mit einem Klick zwischen Konfigurationen wechseln.' },
      { heading: '🚀 Profil erstellen und anwenden', content: '1. Im Seitenmenü **"Profil erstellen"** klicken.\n2. Beschreibenden Namen eingeben.\n3. IP, Maske, Gateway, DNS eingeben und speichern.\n4. Gespeichertes Profil auswählen und **Profil anwenden** klicken.' },
      { heading: '💡 Profi-Tipps', content: '• **Loopback-Profil** mit IP 127.0.0.1 für schnelle Tests ohne echte Netzwerkhardware.\n• Profile als JSON exportieren/importieren für Backup oder Teamfreigabe.' },
    ],
    winshortcuts: [
      { heading: '🎯 Was ist es und wofür dient es?', content: 'Der Abschnitt **Windows-Funktionen** ist ein einheitliches Bedienfeld, das native Windows-Systemwerkzeuge (.cpl, .msc, .exe) mit den häufigsten Netzwerkwartungsskripten kombiniert.' },
      { heading: '🚀 Filterregisterkarten und Kategorien', content: '• **Alle:** Zeigt den gesamten Katalog in einem einzigen Raster.\n• **Wartung & Skripte:** Führt interne Reparaturaktionen aus.\n• **Systemwerkzeuge:** Öffnet native Windows-Panels direkt.\n• **Benutzerdefiniert:** Zeigt nur benutzererstellte Verknüpfungen.' },
      { heading: '➕ Benutzerdefinierte Verknüpfungen hinzufügen', content: '1. Schaltfläche **"+ Verknüpfung hinzufügen"** klicken.\n2. **Name** und **Befehl oder Pfad** eingeben.\n3. Speichern — erscheint im Katalog mit Löschoption.' },
    ],
    maintenance: [
      { heading: '📜 Wartungsbefehl-Glossar', content: '• **DNS-Cache leeren (`ipconfig /flushdns`):** Löscht gespeicherte Namensauflösungen. Nützlich wenn eine Domain kürzlich ihre Server-IP geändert hat.\n• **IP erneuern (`ipconfig /release & renew`):** Zwingt den Adapter, die aktuelle IP zu verwerfen und eine neue vom DHCP-Server anzufordern.\n• **Winsock zurücksetzen (`netsh winsock reset`):** Baut den Windows TCP/IP-Kommunikationsstapel neu auf. Die endgültige Lösung wenn das Netzwerk trotz gültiger IP keine Verbindung hat.\n• **ARP-Tabelle (`arp -a`):** Zeigt die IP-zu-MAC-Adresskarte des lokalen Segments.\n• **Routing-Tabelle (`route print`):** Zeigt Metriken und Gateways für die Datenübertragung.\n• **In BIOS neustarten (`shutdown /r /fw /t 0`):** Neustart direkt in die UEFI/BIOS-Firmware.' },
    ],
    networkscanner: [
      { heading: '🎯 Was ist es und wofür dient es?', content: 'Der **Netzwerkscanner** sendet Pings und überprüft ARP-Antworten, um alle Geräte im lokalen Netzwerk aufzulisten: Drucker, Server, Kameras, Router, Switches, NAS usw.' },
      { heading: '🚀 Hauptfunktionen', content: '• **MAC-Hersteller-Auflösung:** Identifiziert Hersteller aus der IEEE OUI-Datenbank.\n• **Latenzdiagnose:** Zeigt Reaktionszeiten in Millisekunden.\n• **Schnellaktionen:** Host direkt an Ping-Monitor, Port-Scanner oder Inventar senden.' },
      { heading: '💡 Profi-Tipps', content: '• Scannen mit /24-Maske für Netzwerke bis 254 Hosts.\n• Ergebnisse als CSV exportieren für Dokumentation.' },
    ],
    portscanner: [
      { heading: '🎯 Was ist es und wofür dient es?', content: 'Der **Port-Scanner** prüft welche TCP-Ports auf einem Zielgerät geöffnet sind. Wesentlich für: IP-Kameras (80, 8080, 443), SSH (22), RDP (3389), Datenbanken (3306, 1433).' },
      { heading: '🚀 Verwendung', content: '1. Ziel-IP eingeben.\n2. Port-Bereich oder Voreinstellung wählen: Web, Admin, CCTV, Datenbanken.\n3. Scan starten: offene Ports grün, geschlossene rot.\n4. Scanner zeigt geschätzte Zeit und Fortschritt.' },
      { heading: '⚠️ Wichtiger Hinweis', content: '• Nur Geräte scannen die Ihnen gehören oder für die Sie ausdrückliche Genehmigung haben.\n• Unternehmens-Firewalls können Ports filtern auch wenn der Dienst aktiv ist.' },
    ],
    subnet: [
      { heading: '🎯 Was ist es und wofür dient es?', content: 'Der **Subnetz-Rechner** berechnet sofort alle IPv4-Parameter. IP-Adresse und CIDR-Präfix (z.B. /24) oder Dezimalmaske eingeben und alle abgeleiteten Werte erhalten.' },
      { heading: '🚀 Berechnete Ausgaben', content: '• Netzwerkadresse, Broadcast, Nutzbarer Bereich, Maximale Hosts, Wildcard-Maske, Binärdarstellung.' },
      { heading: '💡 CIDR Schnellreferenz', content: '/30 → 2 Hosts | /29 → 6 | /28 → 14 | /27 → 30 | /26 → 62 | /25 → 126 | /24 → 254 Hosts (häufigstes LAN) | /16 → 65534 Hosts' },
    ],
    connectivity: [
      { heading: '🎯 Was ist es und wofür dient es?', content: '• **Multi-Ziel-Ping-Monitor:** Mehrere Ziele hinzufügen für Echtzeit-Latenzgraph.\n• **Traceroute:** Verfolgt den Hop-für-Hop-Pfad zum Ziel. Identifiziert Engpässe oder Routing-Fehler.' },
      { heading: '🔭 Traceroute-Ergebnisse interpretieren', content: '• Jede Zeile ist ein "Hop" — ein Router durch den das Paket ging.\n• **"* * *":** Router hat nicht auf TTL-abgelaufene ICMP-Nachrichten geantwortet.\n• **Zunehmende Latenz:** Der Engpass liegt bei oder nach diesem Hop.' },
    ],
    credentials: [
      { heading: '🎯 Was ist es und wofür dient es?', content: 'Die **Anmeldedaten-Bibliothek** speichert eine sichere lokale Datenbank mit Standard-Anmeldedaten für Netzwerkgeräte (Router, Switches, IP-Kameras, NVRs).' },
      { heading: '🚀 Verwendung', content: '1. Nach Marke (Hikvision, Dahua, Cisco usw.) oder Typ suchen.\n2. Auf Eintrag klicken um Benutzername/Passwort zu kopieren.\n3. Benutzerdefinierte Einträge mit **"+ Hinzufügen"** hinzufügen.' },
      { heading: '🔒 Sicherheitshinweis', content: 'Anmeldedaten werden lokal verschlüsselt gespeichert. Standard-Anmeldedaten nach Installation immer ändern.' },
    ],
    clipboard: [
      { heading: '🎯 Was ist es und wofür dient es?', content: 'Der **Zwischenablage & Snippets-Manager** ist ein Schnellzugriff-Notizbuch für häufig verwendete Textfragmente (DNS, IPs, Befehle).' },
      { heading: '🚀 Snippets hinzufügen und verwalten', content: '1. **"+ Neues Snippet"** klicken, Bezeichnung und Textwert eingeben.\n2. Speichern — erscheint im Raster für Ein-Klick-Kopie.' },
    ],
    globalsearch: [
      { heading: '🚀 Globale Suche verwenden', content: '**Strg + K** überall in der App drücken um die universelle Suchleiste zu öffnen. Name einer Funktion, eines Profils oder Werkzeugs eingeben.' },
      { heading: '💡 Suchtipps', content: '• Groß-/Kleinschreibung egal, funktioniert mit Teilübereinstimmungen.\n• **Esc** zum Schließen ohne Navigation.' },
    ],
    riddles: [
      { heading: '📜 Rätsel I — Der Spiegel der Endlosschleife', content: '"Wer sein eigenes Spiegelbild im digitalen Reich sucht, muss eine Identität mit der heiligen Zahl des lokalen Ursprungs erschaffen — der uralten Adresse des Selbst, das stets zu sich zurückkehrt..."' },
      { heading: '📜 Rätsel II — Der Pfiff der heiligen Teekanne', content: '"Im weiten Meer der Transportprotokolle schlummert eine uralte Teekanne — durch RFC 2324 für ewig erklärt, keinen Kaffee zu servieren (HTTP-Fehler 418). Befrage ihren genauen Port im Dienst-Scanner..."' },
      { heading: '📜 Rätsel III — Das Lied des unbeirrten Barden', content: '"In der Liste der installierten Reiche, flüstere die Worte der Hymne, die dich niemals im Stich lässt... Sprich seinen Namen aus, und der Barde wird erscheinen."' },
      { heading: '📜 Rätsel IV — Die Illusion des grünen Codes', content: '"Bei der Suche in der Diagnose oder Systemkonsole, tippe den Namen der Welt der grünen Simulation — wo die Realität hinterfragt wird. Erwecke den Code..."' },
      { heading: '📜 Rätsel V — Der Ruf des goldenen Echos', content: '"Es gibt eine legendäre Adresse, die jeder Netzwerkingenieur kennt — der Auflöser der Welt, Hüter des DNS in der vierfach wiederholten Ziffer. Sende deine Pings an dieses Orakel..."' },
    ],
  },

  fr: {
    interfaces: [
      { heading: '🎯 Qu\'est-ce et à quoi ça sert?', content: 'L\'écran principal **Interfaces** affiche en temps réel tous les adaptateurs physiques et virtuels de votre machine (Ethernet, Wi-Fi, tunnels VPN, commutateurs virtuels Hyper-V, etc.). Pour chaque adaptateur: IP actuelle, masque, passerelle, DNS, MAC et état du lien.' },
      { heading: '🚀 Guide étape par étape', content: '1. **Sélectionner un adaptateur:** Cliquez sur une carte dans la liste de gauche.\n2. **Mode DHCP:** Cliquez "Passer en DHCP" pour attribution IP automatique.\n3. **Mode statique:** Entrez IP, masque (défaut 255.255.255.0), passerelle et DNS puis cliquez **Appliquer**.\n4. **Actualiser:** Rechargez la liste sans redémarrer l\'app.' },
      { heading: '💡 Conseils Pro', content: '• **Double-clic sur adaptateur:** Ouvre les propriétés réseau Windows directement.\n• **Touche Entrée:** Appliquer les changements sans cliquer.\n• **Droits admin requis:** La configuration IP statique nécessite des droits d\'administrateur.' },
      { heading: '⚠️ Dépannage', content: '• **Aucun adaptateur visible:** Vérifiez que les pilotes réseau sont installés.\n• **Changement IP sans effet:** Vérifiez si un client VPN écrase la table de routage.' },
    ],
    quickip: [
      { heading: '🎯 Qu\'est-ce et à quoi ça sert?', content: 'Le widget **IP Rapide** permet d\'attribuer une nouvelle adresse IP en quelques secondes sans ouvrir les menus Windows. Le masque par défaut est automatiquement **255.255.255.0** (/24).' },
      { heading: '🚀 Recherche IP libre (scan ARP)', content: '1. Cliquez sur le bouton de plage de sous-réseau souhaité.\n2. NetMajik configure temporairement un **masque large** pour un balayage ARP complet.\n3. L\'app envoie des requêtes ARP et des pings ultra-rapides.\n4. Quand une IP libre est trouvée, elle est automatiquement assignée à l\'adaptateur.' },
      { heading: '💡 Conseils Pro', content: '• Le masque par défaut est toujours **255.255.255.0**.\n• Touche **Entrée** dans tout champ IP Rapide pour application immédiate.' },
    ],
    profiles: [
      { heading: '🎯 Qu\'est-ce et à quoi ça sert?', content: 'Les **Profils Réseau** sauvegardent une configuration IP complète sous un nom mémorable. Les techniciens travaillant sur différents réseaux clients peuvent changer de configuration en un seul clic.' },
      { heading: '🚀 Créer et appliquer un profil', content: '1. Dans le menu latéral, cliquez **"Créer un profil"**.\n2. Attribuez un nom descriptif.\n3. Entrez IP, masque, passerelle et DNS, puis sauvegardez.\n4. Sélectionnez le profil et cliquez **Appliquer le profil**.' },
      { heading: '💡 Conseils Pro', content: '• Créez un **profil Loopback** avec IP 127.0.0.1 pour tests rapides.\n• Exportez/importez les profils en JSON pour sauvegarde ou partage d\'équipe.' },
    ],
    winshortcuts: [
      { heading: '🎯 Qu\'est-ce et à quoi ça sert?', content: 'La section **Fonctionnalités Windows** est un panneau de contrôle unifié combinant outils système natifs (.cpl, .msc, .exe) et scripts de maintenance réseau — le tout depuis une seule interface.' },
      { heading: '🚀 Onglets de filtre et catégories', content: '• **Tous:** Affiche tout le catalogue dans une grille.\n• **Maintenance & Scripts:** Exécute des actions de réparation interne.\n• **Outils Système:** Ouvre des panneaux Windows natifs directement.\n• **Personnalisés:** Affiche uniquement les raccourcis créés par l\'utilisateur.' },
      { heading: '➕ Ajouter des raccourcis personnalisés', content: '1. Bouton **"+ Ajouter un raccourci"**.\n2. Entrez un **Nom** et la **Commande ou le chemin**.\n3. Sauvegardez — apparaît dans le catalogue avec option de suppression.' },
    ],
    maintenance: [
      { heading: '📜 Glossaire des commandes de maintenance', content: '• **Vider le cache DNS (`ipconfig /flushdns`):** Efface les résolutions de noms stockées en mémoire.\n• **Renouveler IP (`ipconfig /release & renew`):** Force l\'adaptateur à abandonner son IP et en demander une nouvelle au DHCP.\n• **Réinitialiser Winsock (`netsh winsock reset`):** Reconstruit la pile TCP/IP Windows. Solution définitive quand le réseau perd la connectivité.\n• **Table ARP (`arp -a`):** Affiche la carte des associations IP-MAC du segment local.\n• **Table de routage (`route print`):** Affiche les métriques et passerelles de routage.\n• **Redémarrer en BIOS (`shutdown /r /fw /t 0`):** Redémarre directement dans la configuration UEFI/BIOS.' },
    ],
    networkscanner: [
      { heading: '🎯 Qu\'est-ce et à quoi ça sert?', content: 'Le **Scanner Réseau** envoie des pings et inspecte les réponses ARP pour lister tous les appareils du réseau local: imprimantes, serveurs, caméras IP, routeurs, switches, NAS, etc.' },
      { heading: '🚀 Fonctions principales', content: '• **Résolution fabricant par MAC:** Identifie les fabricants via la base de données IEEE OUI.\n• **Diagnostic de latence:** Affiche le temps de réponse en millisecondes.\n• **Actions rapides:** Envoyer un hôte au Ping Monitor, Port Scanner ou inventaire.' },
      { heading: '💡 Conseils Pro', content: '• Scannez avec /24 pour les réseaux jusqu\'à 254 hôtes.\n• Exportez les résultats en CSV pour documentation.' },
    ],
    portscanner: [
      { heading: '🎯 Qu\'est-ce et à quoi ça sert?', content: 'Le **Scanner de Ports** vérifie quels ports TCP sont ouverts sur un appareil cible. Essentiel pour: caméras IP (80, 8080, 443), SSH (22), RDP (3389), bases de données (3306, 1433).' },
      { heading: '🚀 Comment l\'utiliser', content: '1. Entrez l\'IP cible.\n2. Choisissez une plage ou un preset: Web, Admin, CCTV, Bases de données.\n3. Lancez le scan: ports ouverts en vert, fermés en rouge.\n4. Le scanner affiche ETA et progression.' },
      { heading: '⚠️ Avertissement important', content: '• Scannez uniquement les appareils vous appartenant ou avec autorisation explicite.\n• Les pare-feu d\'entreprise peuvent filtrer des ports même si le service est actif.' },
    ],
    subnet: [
      { heading: '🎯 Qu\'est-ce et à quoi ça sert?', content: 'La **Calculatrice de Sous-réseau** calcule instantanément tous les paramètres IPv4. Entrez une IP et un préfixe CIDR (ex: /24) ou un masque décimal pour obtenir toutes les valeurs dérivées.' },
      { heading: '🚀 Données calculées', content: '• Adresse réseau, Broadcast, Plage utilisable, Hôtes max, Masque Wildcard, Représentation binaire.' },
      { heading: '💡 Référence rapide CIDR', content: '/30 → 2 hôtes | /29 → 6 | /28 → 14 | /27 → 30 | /26 → 62 | /25 → 126 | /24 → 254 hôtes (LAN le plus courant) | /16 → 65534 hôtes' },
    ],
    connectivity: [
      { heading: '🎯 Qu\'est-ce et à quoi ça sert?', content: '• **Moniteur Ping Multi-cible:** Ajoutez plusieurs destinations pour un graphique de latence en temps réel.\n• **Traceroute:** Trace le chemin saut par saut jusqu\'à la destination. Identifie les congestions ou défaillances de routage.' },
      { heading: '🔭 Interpréter les résultats Traceroute', content: '• Chaque ligne est un "saut" — un routeur par lequel le paquet est passé.\n• **"* * *":** Le routeur n\'a pas répondu aux messages TTL expiré.\n• **Latence croissante:** Le goulot d\'étranglement est à ce saut ou après.' },
    ],
    credentials: [
      { heading: '🎯 Qu\'est-ce et à quoi ça sert?', content: 'La **Bibliothèque de Credentials** stocke une base de données locale sécurisée avec les identifiants par défaut des équipements réseau (routeurs, caméras, NVRs, switches).' },
      { heading: '🚀 Comment l\'utiliser', content: '1. Recherchez par marque (Hikvision, Dahua, Cisco, etc.) ou type.\n2. Cliquez sur une entrée pour copier utilisateur/mot de passe.\n3. Ajoutez des entrées personnalisées avec **"+ Ajouter"**.' },
      { heading: '🔒 Note de sécurité', content: 'Identifiants stockés localement de façon chiffrée. Changez toujours les identifiants par défaut après l\'installation.' },
    ],
    clipboard: [
      { heading: '🎯 Qu\'est-ce et à quoi ça sert?', content: 'Le **Gestionnaire Presse-papiers & Snippets** est un bloc-notes d\'accès rapide pour stocker des fragments de texte fréquents (DNS, IPs, commandes).' },
      { heading: '🚀 Ajouter et gérer des snippets', content: '1. Cliquez **"+ Nouveau snippet"**, donnez une étiquette et entrez la valeur.\n2. Sauvegardez — apparaît dans la grille pour copie en un clic.' },
    ],
    globalsearch: [
      { heading: '🚀 Utiliser la Recherche Globale', content: 'Appuyez **Ctrl + K** n\'importe où dans l\'app pour ouvrir la barre de recherche flottante universelle. Tapez le nom de n\'importe quelle fonction, profil ou outil.' },
      { heading: '💡 Conseils de recherche', content: '• Insensible à la casse, fonctionne avec des correspondances partielles.\n• **Échap** pour fermer sans naviguer.' },
    ],
    riddles: [
      { heading: '📜 Énigme I — Le Miroir de la Boucle Infinie', content: '"Celui qui cherche son propre reflet dans le plan numérique doit forger une identité avec le nombre sacré de l\'origine locale — l\'ancienne adresse du soi qui revient toujours à lui-même..."' },
      { heading: '📜 Énigme II — Le Sifflement de la Théière Sacrée', content: '"Dans la vaste mer des protocoles de transport, une théière ancestrale sommeille — déclarée par le RFC 2324 pour refuser le café à jamais (Erreur HTTP 418). Interrogez son port exact dans le scanner de services..."' },
      { heading: '📜 Énigme III — Le Chant du Barde Inébranlable', content: '"Parmi la liste des royaumes et applications installés, murmurez les paroles de l\'hymne qui ne vous abandonnera jamais... Prononcez son nom, et le barde apparaîtra."' },
      { heading: '📜 Énigme IV — L\'Illusion du Code Vert', content: '"Dans la recherche de diagnostic ou la console système, tapez le nom du monde de la simulation verte — où la réalité est remise en question. Éveillez le code, et la matrice se révélera."' },
      { heading: '📜 Énigme V — L\'Appel de l\'Écho Doré', content: '"Il existe une adresse légendaire connue de tout ingénieur réseau — le résolveur du monde, gardien du DNS au chiffre quadruple répété. Envoyez vos pings à cet oracle..."' },
    ],
  },

  zh: {
    interfaces: [
      { heading: '🎯 它是什么，有什么用？', content: '**接口**主屏幕实时显示您计算机上所有物理和虚拟网络适配器（以太网、Wi-Fi、VPN 隧道、Hyper-V 虚拟交换机等）。可查看每个适配器的当前 IP、子网掩码、默认网关、DNS 服务器、MAC 地址和连接状态。' },
      { heading: '🚀 分步指南', content: '1. **选择适配器：** 点击左侧列表中的任意卡片将其设为活动接口。\n2. **DHCP 模式（自动）：** 点击"切换到 DHCP"让路由器自动分配 IP。\n3. **静态模式：** 输入 IP、子网掩码（默认 255.255.255.0）、网关和 DNS，然后点击**应用**。\n4. **刷新：** 使用刷新按钮重新加载适配器列表。' },
      { heading: '💡 专业技巧', content: '• **双击适配器：** 直接打开 Windows 网络适配器属性。\n• **回车键：** 在任意文本框按回车即可应用更改。\n• **需要管理员权限：** 更改静态 IP 需要以管理员身份运行 NetMajik。' },
      { heading: '⚠️ 故障排除', content: '• **没有显示适配器：** 确保网络驱动程序已安装。\n• **IP 更改无效：** 检查 VPN 客户端是否覆盖了路由表。' },
    ],
    quickip: [
      { heading: '🎯 它是什么，有什么用？', content: '**快速 IP** 小部件允许在几秒钟内分配新的 IP 地址，无需打开 Windows 设置菜单。默认子网掩码自动设为 **255.255.255.0** (/24)。' },
      { heading: '🚀 如何使用空闲 IP 搜索（ARP 扫描）', content: '1. 点击所需子网范围按钮。\n2. NetMajik 临时为网卡配置**宽子网掩码**以执行完整 ARP 扫描。\n3. 应用发送 ARP 请求和超快 ping。\n4. 发现无响应（空闲）IP 后，自动将其分配给适配器。' },
      { heading: '💡 专业技巧', content: '• 默认掩码始终为 **255.255.255.0**。\n• 在任意快速 IP 字段按**回车**立即应用。' },
    ],
    profiles: [
      { heading: '🎯 它是什么，有什么用？', content: '**网络配置文件**以易记的名称保存完整的 IP 配置。在不同客户网络工作的技术人员可以一键切换配置。' },
      { heading: '🚀 如何创建和应用配置文件', content: '1. 在侧边菜单中点击**"创建配置文件"**。\n2. 分配描述性名称。\n3. 输入 IP、掩码、网关和 DNS 并保存。\n4. 选择配置文件并点击**应用配置文件**。' },
      { heading: '💡 专业技巧', content: '• 创建 IP 为 127.0.0.1 的**回环配置文件**用于快速测试。\n• 将配置文件导出/导入为 JSON 文件以备份或共享。' },
    ],
    winshortcuts: [
      { heading: '🎯 它是什么，有什么用？', content: '**Windows 功能**部分是一个统一控制面板，将原生 Windows 系统工具（.cpl、.msc、.exe）与最常用的网络维护脚本组合在单一界面中。' },
      { heading: '🚀 过滤标签和分类', content: '• **全部：** 在单一网格中显示所有目录。\n• **维护与脚本：** 运行内部修复操作（清除 DNS、ARP 表、路由、重置 Winsock）。\n• **系统工具：** 直接打开原生 Windows 面板。\n• **自定义：** 仅显示用户创建的快捷方式。' },
      { heading: '➕ 如何添加自定义快捷方式', content: '1. 点击**"+ 添加快捷方式"**按钮。\n2. 输入**名称**和**命令或路径**。\n3. 保存 — 出现在目录中，可随时删除。' },
    ],
    maintenance: [
      { heading: '📜 维护命令词汇表', content: '• **清除 DNS 缓存 (`ipconfig /flushdns`)：** 清除内存中存储的名称解析。当域名最近更改了服务器 IP 时使用。\n• **更新 IP (`ipconfig /release & renew`)：** 强制适配器丢弃当前 IP 并向 DHCP 服务器请求新的。\n• **重置 Winsock (`netsh winsock reset`)：** 重建 Windows TCP/IP 通信栈。当网络在有效 IP 的情况下失去连接时的终极解决方案。\n• **ARP 表 (`arp -a`)：** 显示本地段学习到的 IP 到 MAC 地址映射。\n• **路由表 (`route print`)：** 显示操作系统路由数据包的指标和网关。\n• **重启到 BIOS (`shutdown /r /fw /t 0`)：** 直接重启进入 UEFI/BIOS 固件设置。' },
    ],
    networkscanner: [
      { heading: '🎯 它是什么，有什么用？', content: '**网络扫描仪**发送 ping 请求并检查 ARP 响应，列出局域网中所有设备：打印机、服务器、手机、IP 摄像头、路由器、交换机、NAS 等。' },
      { heading: '🚀 主要功能', content: '• **MAC 制造商解析：** 通过 IEEE OUI 数据库识别设备制造商（海康、思科、苹果、TP-Link 等）。\n• **延迟诊断：** 显示每台设备的毫秒级响应时间。\n• **快速操作：** 直接将主机发送到 Ping 监控、端口扫描仪或保存到库存。' },
      { heading: '💡 专业技巧', content: '• 使用 /24 掩码扫描最多 254 台主机的网络。\n• 将结果导出为 CSV 用于文档或库存报告。' },
    ],
    portscanner: [
      { heading: '🎯 它是什么，有什么用？', content: '**端口扫描仪**检查目标设备上哪些 TCP 端口是开放的。对于 IP 摄像头（80、8080、443）、SSH（22）、RDP（3389）、数据库（3306、1433）至关重要。' },
      { heading: '🚀 如何使用', content: '1. 输入目标 IP 地址。\n2. 选择端口范围或预设：Web、管理、CCTV、数据库。\n3. 开始扫描：开放端口显示为绿色，关闭/过滤端口显示为红色。\n4. 扫描仪显示预计时间和进度百分比。' },
      { heading: '⚠️ 重要提示', content: '• 仅扫描您拥有或有明确授权的设备。\n• 企业防火墙可能过滤端口，即使服务正在运行。' },
    ],
    subnet: [
      { heading: '🎯 它是什么，有什么用？', content: '**子网计算器**即时计算所有 IPv4 参数。输入任何 IP 地址和 CIDR 前缀（如 /24、/28）或十进制掩码，获取所有派生值。' },
      { heading: '🚀 计算输出', content: '• 网络地址、广播地址、可用范围、最大主机数、通配符掩码、二进制表示。' },
      { heading: '💡 CIDR 快速参考', content: '/30 → 2 主机 | /29 → 6 | /28 → 14 | /27 → 30 | /26 → 62 | /25 → 126 | /24 → 254 主机（最常见 LAN）| /16 → 65534 主机' },
    ],
    connectivity: [
      { heading: '🎯 它是什么，有什么用？', content: '• **多目标 Ping 监控：** 添加多个目标，实时显示延迟图表和丢包率。\n• **Traceroute：** 追踪数据包到达目标的逐跳路径。识别链路中的拥塞或路由故障。' },
      { heading: '🔭 如何解读 Traceroute 结果', content: '• 每行是一个"跳"— 数据包经过的路由器。\n• **"* * *"：** 路由器未响应 TTL 超时 ICMP 消息（防火墙规则）。\n• **延迟递增：** 瓶颈在该跳或之后。' },
    ],
    credentials: [
      { heading: '🎯 它是什么，有什么用？', content: '**凭据库**存储网络设备默认凭据的安全本地数据库（路由器、摄像头、NVR、交换机）。' },
      { heading: '🚀 如何使用', content: '1. 按品牌（海康、大华、思科等）或类型搜索。\n2. 点击条目复制用户名/密码到剪贴板。\n3. 使用**"+ 添加"**按钮添加自定义条目。' },
      { heading: '🔒 安全提示', content: '凭据以加密形式本地存储。安装后请务必更改默认凭据。' },
    ],
    clipboard: [
      { heading: '🎯 它是什么，有什么用？', content: '**剪贴板和片段管理器**是用于存储常用文本片段（DNS、IP、命令）的快速访问记事本。' },
      { heading: '🚀 如何添加和管理片段', content: '1. 点击**"+ 新建片段"**，输入标签和文本值。\n2. 保存 — 出现在网格中，一键复制。' },
    ],
    globalsearch: [
      { heading: '🚀 如何使用全局搜索', content: '在应用的任何位置按 **Ctrl + K** 打开通用浮动搜索栏。输入任何功能、配置文件或工具的名称即可立即跳转。' },
      { heading: '💡 搜索技巧', content: '• 不区分大小写，支持部分匹配。\n• 按 **Esc** 关闭而不导航。' },
    ],
    riddles: [
      { heading: '📜 谜题 I — 无限循环之镜', content: '"在数字领域寻找自我倒影之人，必须以本地起源的神圣数字铸造身份——那个永远回归自身的古老地址……"' },
      { heading: '📜 谜题 II — 神圣茶壶之哨', content: '"在广阔的传输协议之海中，一把古老的茶壶沉睡——由 RFC 2324 宣告永远拒绝提供咖啡（HTTP 错误 418）。在服务扫描仪中查询其确切端口……"' },
      { heading: '📜 谜题 III — 坚定吟游诗人之歌', content: '"在已安装程序列表中，低语那首永不抛弃你、永不让你失望的颂歌之词……说出其名，吟游诗人将会现身。"' },
      { heading: '📜 谜题 IV — 绿色代码的幻觉', content: '"在诊断搜索或系统控制台中，输入绿色模拟世界的名称——在那里现实受到质疑。唤醒代码，矩阵将会显现。"' },
      { heading: '📜 谜题 V — 黄金回声之召唤', content: '"有一个传说中的地址，每位网络工程师都知道——世界的解析者，四重重复数字的 DNS 守护者。向这个神谕发送你的 ping 数据包……"' },
    ],
  },

  ja: {
    interfaces: [
      { heading: '🎯 これは何ですか、何のためですか？', content: '**インターフェース**のメイン画面は、コンピューター上のすべての物理・仮想ネットワークアダプター（イーサネット、Wi-Fi、VPNトンネル、Hyper-V仮想スイッチなど）をリアルタイムで表示します。各アダプターの現在のIP、サブネットマスク、デフォルトゲートウェイ、DNSサーバー、MACアドレス、リンク状態を確認できます。' },
      { heading: '🚀 ステップバイステップガイド', content: '1. **アダプターを選択：** 左のリストのカードをクリックしてアクティブなインターフェースに設定。\n2. **DHCPモード：** 「DHCPに切り替え」をクリックしてルーターが自動的にIPを割り当て。\n3. **静的モード：** IP、マスク（デフォルト255.255.255.0）、ゲートウェイ、DNSを入力して**適用**をクリック。\n4. **更新：** 更新ボタンでアプリを再起動せずにアダプターリストをリロード。' },
      { heading: '💡 プロのヒント', content: '• **アダプターをダブルクリック：** Windowsネットワークアダプタープロパティを直接開く。\n• **Enterキー：** テキストフィールドでEnterを押して変更を適用。\n• **管理者権限が必要：** 静的IP設定を変更するには管理者として実行が必要。' },
      { heading: '⚠️ トラブルシューティング', content: '• **アダプターが表示されない：** ネットワークドライバーがインストールされているか確認。\n• **IP変更が反映されない：** VPNクライアントがルーティングテーブルを上書きしていないか確認。' },
    ],
    quickip: [
      { heading: '🎯 これは何ですか、何のためですか？', content: '**クイックIP**ウィジェットを使うと、Windowsの設定メニューを開かずに数秒で新しいIPアドレスを割り当てられます。デフォルトのサブネットマスクは自動的に**255.255.255.0** (/24)に設定されます。' },
      { heading: '🚀 空きIP検索（ARPスキャン）の使い方', content: '1. 希望するサブネット範囲ボタンをクリック。\n2. NetMajikが一時的に**広いマスク**をネットワークカードに設定して完全なARPスイープを実行。\n3. アプリがARP要求と超高速pingを送信。\n4. 応答のないIP（空き）が見つかると、そのアドレスが自動的にアダプターに割り当てられます。' },
      { heading: '💡 プロのヒント', content: '• デフォルトマスクは常に**255.255.255.0**。\n• クイックIPフィールドで**Enter**を押すと即座に適用。' },
    ],
    profiles: [
      { heading: '🎯 これは何ですか、何のためですか？', content: '**ネットワークプロファイル**は、完全なIP設定を覚えやすい名前で保存します。異なるクライアントネットワークで作業する技術者は、ワンクリックで設定を切り替えられます。' },
      { heading: '🚀 プロファイルの作成と適用', content: '1. サイドメニューで**「プロファイルを作成」**をクリック。\n2. 説明的な名前を割り当てる。\n3. IP、マスク、ゲートウェイ、DNSを入力して保存。\n4. プロファイルを選択して**プロファイルを適用**をクリック。' },
      { heading: '💡 プロのヒント', content: '• IP 127.0.0.1の**ループバックプロファイル**を作成して、実際のネットワークハードウェアなしで素早くテスト。\n• プロファイルをJSONとしてエクスポート/インポートしてバックアップや共有。' },
    ],
    winshortcuts: [
      { heading: '🎯 これは何ですか、何のためですか？', content: '**Windows機能**セクションは、ネイティブWindowsシステムツール（.cpl、.msc、.exe）と最も頻繁に使用されるネットワークメンテナンススクリプトを単一のインターフェースで組み合わせた統合コントロールパネルです。' },
      { heading: '🚀 フィルタータブとカテゴリ', content: '• **すべて：** 単一グリッドでカタログ全体を表示。\n• **メンテナンス＆スクリプト：** 内部修復アクションを実行（DNS清理、ARPテーブル、ルート、Winsockリセット）。\n• **システムツール：** Windowsのネイティブパネルを直接開く。\n• **カスタム：** ユーザーが作成したショートカットのみ表示。' },
      { heading: '➕ カスタムショートカットの追加方法', content: '1. **「+ ショートカットを追加」**ボタンをクリック。\n2. **名前**と**コマンドまたはパス**を入力。\n3. 保存 — カタログに表示され、いつでも削除可能。' },
    ],
    maintenance: [
      { heading: '📜 メンテナンスコマンド用語集', content: '• **DNSキャッシュ削除 (`ipconfig /flushdns`)：** メモリに格納された名前解決をクリア。ドメインが最近サーバーIPを変更した場合に使用。\n• **IP更新 (`ipconfig /release & renew`)：** アダプターが現在のIPを破棄し、DHCPサーバーから新しいIPを要求。\n• **Winsockリセット (`netsh winsock reset`)：** Windows TCP/IP通信スタックを再構築。有効なIPがあるにも関わらず接続が失われた場合の最終解決策。\n• **ARPテーブル (`arp -a`)：** ローカルセグメントで学習したIP-MACアドレスマッピングを表示。\n• **ルーティングテーブル (`route print`)：** OSがパケットをルーティングするメトリクスとゲートウェイを表示。\n• **BIOSへ再起動 (`shutdown /r /fw /t 0`)：** 起動時にキーを押さずに直接UEFI/BIOSファームウェア設定に入る。' },
    ],
    networkscanner: [
      { heading: '🎯 これは何ですか、何のためですか？', content: '**ネットワークスキャナー**はpingを送信してARP応答を検査し、ローカルネットワーク上のすべてのデバイスをリスト表示します：プリンター、サーバー、スマートフォン、IPカメラ、ルーター、スイッチ、NASなど。' },
      { heading: '🚀 主要機能', content: '• **MACメーカー解析：** IEEE OUIデータベースでメーカーを識別（Hikvision、Cisco、Apple、TP-Linkなど）。\n• **レイテンシ診断：** 各デバイスのミリ秒単位の応答時間を表示。\n• **クイックアクション：** 発見したホストをPingモニター、ポートスキャナー、インベントリに送信。' },
      { heading: '💡 プロのヒント', content: '• /24マスクで最大254ホストのネットワークをスキャン。\n• ドキュメントやインベントリレポート用にCSVとして結果をエクスポート。' },
    ],
    portscanner: [
      { heading: '🎯 これは何ですか、何のためですか？', content: '**ポートスキャナー**はターゲットデバイスでどのTCPポートが開いているかを確認します。IPカメラ（80、8080、443）、SSH（22）、RDP（3389）、データベース（3306、1433）の確認に不可欠です。' },
      { heading: '🚀 使い方', content: '1. ターゲットIPアドレスを入力。\n2. ポート範囲またはプリセットを選択：Web、管理者、CCTV、データベース。\n3. スキャン開始：開いたポートは緑、閉じた/フィルタリングされたポートは赤。\n4. スキャナーはETAと進捗率を表示。' },
      { heading: '⚠️ 重要な注意事項', content: '• 自分のデバイスまたは明示的に許可されたデバイスのみスキャン。\n• 企業ファイアウォールはサービスが実行中でもポートをフィルタリングする場合があります。' },
    ],
    subnet: [
      { heading: '🎯 これは何ですか、何のためですか？', content: '**サブネット計算機**はすべてのIPv4パラメーターを即座に計算します。IPアドレスとCIDRプレフィックス（例：/24、/28）または10進数マスクを入力して、すべての派生値を取得します。' },
      { heading: '🚀 計算される出力', content: '• ネットワークアドレス、ブロードキャスト、使用可能範囲、最大ホスト数、ワイルドカードマスク、バイナリ表現。' },
      { heading: '💡 CIDRクイックリファレンス', content: '/30 → 2ホスト | /29 → 6 | /28 → 14 | /27 → 30 | /26 → 62 | /25 → 126 | /24 → 254ホスト（最も一般的なLAN）| /16 → 65534ホスト' },
    ],
    connectivity: [
      { heading: '🎯 これは何ですか、何のためですか？', content: '• **マルチターゲットPingモニター：** 複数の宛先を追加してリアルタイムのレイテンシグラフとパケットロス率を確認。\n• **トレースルート：** パケットが目的地に到達するまでのホップバイホップパスをトレース。チェーン内の輻輳やルーティング障害を特定。' },
      { heading: '🔭 トレースルート結果の解釈', content: '• 各行は「ホップ」— パケットが通過したルーター。\n• **「* * *」：** ルーターがTTL期限切れICMPメッセージに応答しなかった（ファイアウォールルール）。\n• **レイテンシの増加：** そのホップ以降にボトルネックがある。' },
    ],
    credentials: [
      { heading: '🎯 これは何ですか、何のためですか？', content: '**認証情報ライブラリ**はネットワーク機器（ルーター、スイッチ、IPカメラ、NVR）のデフォルト認証情報を安全なローカルデータベースに保存します。' },
      { heading: '🚀 使い方', content: '1. ブランド（Hikvision、Dahua、Ciscoなど）またはタイプで検索。\n2. エントリをクリックしてユーザー名/パスワードをコピー。\n3. **「+ 追加」**ボタンでカスタムエントリを追加。' },
      { heading: '🔒 セキュリティ注意事項', content: '認証情報はローカルで暗号化されて保存されます。インストール後は常にデフォルト認証情報を変更してください。' },
    ],
    clipboard: [
      { heading: '🎯 これは何ですか、何のためですか？', content: '**クリップボード＆スニペットマネージャー**は、よく使うテキストフラグメント（DNS、IP、コマンド）を保存するためのクイックアクセスメモ帳です。' },
      { heading: '🚀 スニペットの追加と管理', content: '1. **「+ 新しいスニペット」**をクリックして、ラベルとテキスト値を入力。\n2. 保存 — グリッドに表示され、ワンクリックでコピー。' },
    ],
    globalsearch: [
      { heading: '🚀 グローバル検索の使い方', content: 'アプリのどこでも**Ctrl + K**を押してユニバーサルフローティング検索バーを開きます。機能、プロファイル、ツールの名前を入力して即座にジャンプします。' },
      { heading: '💡 検索のヒント', content: '• 大文字小文字を区別せず、部分一致で機能します。\n• **Esc**でナビゲートせずに閉じる。' },
    ],
    riddles: [
      { heading: '📜 謎解き I — 無限ループの鏡', content: '"デジタルの領域で自分の映像を求める者は、ローカルの起源の神聖な数字で身元を作らなければならない — 常に自分自身に戻る古い自己のアドレス……"' },
      { heading: '📜 謎解き II — 神聖なティーポットの笛の音', content: '"広大なトランスポートプロトコルの海で、古いティーポットが眠っている — RFC 2324によってコーヒーを永遠に断るように宣言されている（HTTPエラー 418）。サービススキャナーでその正確なポートを照会してください……"' },
      { heading: '📜 謎解き III — 揺るぎない吟遊詩人の歌', content: '"インストールされた王国とアプリケーションのリストの中で、決してあなたを見捨てない讃歌の言葉を囁いてください……その名を言えば、吟遊詩人が現れるでしょう。"' },
      { heading: '📜 謎解き IV — 緑のコードの幻想', content: '"診断の検索やシステムコンソールで、現実が疑われる緑のシミュレーションの世界の名前を入力してください。コードを呼び覚ましてください、マトリックスが明らかになるでしょう。"' },
      { heading: '📜 謎解き V — 黄金のエコーの呼びかけ', content: '"すべてのネットワークエンジニアが知る伝説のアドレスがある — 世界の解析者、四重に繰り返された数字のDNSの守護者。このオラクルにPingパケットを送ってください……"' },
    ],
  },
};

// Helper to get content for a given lang, falling back to 'en'
const getContent = (lang: string, key: string): Array<{ heading: string; content: string }> => {
  const langData = GUIDE_CONTENT[lang] || GUIDE_CONTENT.en;
  return langData[key] || GUIDE_CONTENT.en[key] || [];
};

export const HelpGuide: React.FC<HelpGuideProps> = ({ language }) => {
  const lang = language || 'en';
  const labels = LABELS_DICT[lang] || LABELS_DICT.en;

  const [activeCategory, setActiveCategory] = useState<string>('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    'interfaces-main': true,
    'easter-riddles': true,
  });

  const toggleItem = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Build guide data from multilingual content
  const guideData = useMemo(() => [
    {
      category: 'getting-started',
      categoryTitle: labels.catGettingStarted,
      categoryDesc: lang === 'es' ? 'Gestión de adaptadores, cambio rápido de dirección IP y perfiles de red.'
        : lang === 'pt' ? 'Gerenciamento de adaptadores, alteração rápida de IP e perfis de rede.'
        : lang === 'de' ? 'Adapterverwaltung, schnelle IP-Änderung und Netzwerkprofile.'
        : lang === 'fr' ? 'Gestion des adaptateurs, changement rapide d\'IP et profils réseau.'
        : lang === 'zh' ? '适配器管理、快速 IP 更改和网络配置文件。'
        : lang === 'ja' ? 'アダプター管理、クイックIP変更、ネットワークプロファイル。'
        : 'Adapter management, quick IP changing, and network profiles.',
      icon: <LayoutDashboard size={18} />,
      items: [
        {
          id: 'interfaces-main',
          title: '🖥️ ' + (lang === 'es' ? 'Adaptadores e Interfaces de Red' : lang === 'pt' ? 'Adaptadores e Interfaces de Rede' : lang === 'de' ? 'Netzwerkadapter und Schnittstellen' : lang === 'fr' ? 'Adaptateurs et Interfaces Réseau' : lang === 'zh' ? '网络适配器和接口' : lang === 'ja' ? 'ネットワークアダプターとインターフェース' : 'Network Adapters & Interfaces'),
          badge: labels.badgeBasic,
          badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          summary: lang === 'es' ? 'Consulta el estado de tus tarjetas Ethernet, Wi-Fi y virtuales, ve su velocidad, estado de enlace y cambia su configuración.'
            : lang === 'pt' ? 'Consulte o status dos seus adaptadores Ethernet, Wi-Fi e virtuais, veja sua velocidade e altere a configuração.'
            : lang === 'de' ? 'Status Ihrer Ethernet-, WLAN- und virtuellen Karten anzeigen und Konfiguration ändern.'
            : lang === 'fr' ? 'Consultez l\'état de vos cartes Ethernet, Wi-Fi et virtuelles, modifiez leur configuration.'
            : lang === 'zh' ? '查询以太网、Wi-Fi 和虚拟网卡的状态、速度和链路状态，并更改其配置。'
            : lang === 'ja' ? 'イーサネット、Wi-Fi、仮想カードの状態、速度、リンク状態を確認し、設定を変更します。'
            : 'Check the status of your Ethernet, Wi-Fi and virtual cards, view link speed and change their configuration.',
          sections: getContent(lang, 'interfaces'),
        },
        {
          id: 'quickip-main',
          title: '⚡ ' + (lang === 'es' ? 'IP Rápida y Búsqueda de IP Libre por ARP' : lang === 'pt' ? 'IP Rápido e Busca de IP Livre por ARP' : lang === 'de' ? 'Schnell-IP und freie IP-Suche per ARP' : lang === 'fr' ? 'IP Rapide et Recherche d\'IP libre par ARP' : lang === 'zh' ? '快速 IP 和 ARP 空闲 IP 搜索' : lang === 'ja' ? 'クイックIPとARPによる空きIP検索' : 'Quick IP & Free IP Search by ARP'),
          badge: labels.badgeFeatured,
          badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          summary: lang === 'es' ? 'Cómo asignar direcciones IP al instante y utilizar el escáner inteligente ARP de IP libre.'
            : lang === 'pt' ? 'Como atribuir endereços IP instantaneamente e usar o scanner inteligente ARP de IP livre.'
            : lang === 'de' ? 'IP-Adressen sofort zuweisen und den intelligenten ARP-Scanner für freie IPs nutzen.'
            : lang === 'fr' ? 'Comment attribuer des adresses IP instantanément et utiliser le scanner ARP intelligent pour les IP libres.'
            : lang === 'zh' ? '如何即时分配 IP 地址并使用智能 ARP 空闲 IP 扫描仪。'
            : lang === 'ja' ? 'IPアドレスを即座に割り当て、スマートARP空きIPスキャナーを使用する方法。'
            : 'How to assign IP addresses instantly and use the smart ARP free IP scanner.',
          sections: getContent(lang, 'quickip'),
        },
        {
          id: 'profiles-main',
          title: '📂 ' + (lang === 'es' ? 'Perfiles de Red' : lang === 'pt' ? 'Perfis de Rede' : lang === 'de' ? 'Netzwerkprofile' : lang === 'fr' ? 'Profils Réseau' : lang === 'zh' ? '网络配置文件' : lang === 'ja' ? 'ネットワークプロファイル' : 'Network Profiles'),
          badge: labels.badgeUseful,
          badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          summary: lang === 'es' ? 'Guarda combinaciones frecuentes de IP/DNS y cámbialas con un solo clic.'
            : lang === 'pt' ? 'Salve combinações frequentes de IP/DNS e altere-as com um único clique.'
            : lang === 'de' ? 'Häufige IP/DNS-Kombinationen speichern und mit einem Klick wechseln.'
            : lang === 'fr' ? 'Sauvegardez les combinaisons IP/DNS fréquentes et changez-les en un seul clic.'
            : lang === 'zh' ? '保存常用的 IP/DNS 组合，一键切换。'
            : lang === 'ja' ? '頻繁に使用するIP/DNS組み合わせを保存し、ワンクリックで切り替えます。'
            : 'Save frequent IP/DNS combinations and switch them with a single click.',
          sections: getContent(lang, 'profiles'),
        },
      ],
    },

    {
      category: 'win-tools',
      categoryTitle: labels.catWinTools,
      categoryDesc: lang === 'es' ? 'Acceso directo a ejecutables del sistema, applets del Panel de Control, consolas y scripts de mantenimiento.'
        : lang === 'pt' ? 'Acesso direto a executáveis do sistema, applets do Painel de Controle, consoles e scripts de manutenção.'
        : lang === 'de' ? 'Direkter Zugriff auf Systemdateien, Systemsteuerungs-Applets, Konsolen und Wartungsskripte.'
        : lang === 'fr' ? 'Accès direct aux exécutables système, applets du Panneau de configuration, consoles et scripts de maintenance.'
        : lang === 'zh' ? '直接访问系统可执行文件、控制面板小程序、控制台和维护脚本。'
        : lang === 'ja' ? 'システム実行ファイル、コントロールパネルアプレット、コンソール、メンテナンススクリプトへの直接アクセス。'
        : 'Direct access to system executables, Control Panel applets, MMC consoles, and maintenance scripts.',
      icon: <Sliders size={18} />,
      items: [
        {
          id: 'win-shortcuts-main',
          title: '🎛️ ' + (lang === 'es' ? 'Vista Unificada: Funciones de Windows' : lang === 'pt' ? 'Vista Unificada: Recursos do Windows' : lang === 'de' ? 'Einheitliche Ansicht: Windows-Funktionen' : lang === 'fr' ? 'Vue Unifiée: Fonctionnalités Windows' : lang === 'zh' ? '统一视图：Windows 功能' : lang === 'ja' ? '統合ビュー：Windows機能' : 'Unified View: Windows Features'),
          badge: labels.badgeAdvanced,
          badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          summary: lang === 'es' ? 'Consola central para lanzar utilidades nativas de Windows y ejecutar comandos de mantenimiento de red.'
            : lang === 'pt' ? 'Console central para iniciar utilitários nativos do Windows e executar comandos de manutenção de rede.'
            : lang === 'de' ? 'Zentralkonsole zum Starten nativer Windows-Dienstprogramme und Ausführen von Netzwerkwartungsbefehlen.'
            : lang === 'fr' ? 'Console centrale pour lancer des utilitaires Windows natifs et exécuter des commandes de maintenance réseau.'
            : lang === 'zh' ? '用于启动原生 Windows 实用程序和执行网络维护命令的中央控制台。'
            : lang === 'ja' ? 'ネイティブWindowsユーティリティの起動とネットワークメンテナンスコマンド実行のための中央コンソール。'
            : 'Central console to launch native Windows utilities and run network maintenance commands.',
          sections: getContent(lang, 'winshortcuts'),
        },
        {
          id: 'maintenance-scripts',
          title: '🔧 ' + (lang === 'es' ? 'Comandos de Mantenimiento Explicados' : lang === 'pt' ? 'Comandos de Manutenção Explicados' : lang === 'de' ? 'Wartungsbefehle erklärt' : lang === 'fr' ? 'Commandes de maintenance expliquées' : lang === 'zh' ? '维护命令详解' : lang === 'ja' ? 'メンテナンスコマンド解説' : 'Maintenance Commands Explained'),
          badge: labels.badgeTechnical,
          badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          summary: lang === 'es' ? 'Qué hace exactamente cada comando de mantenimiento de red disponible.'
            : lang === 'pt' ? 'O que cada comando de manutenção de rede disponível faz exatamente.'
            : lang === 'de' ? 'Was genau jeder verfügbare Netzwerkwartungsbefehl tut.'
            : lang === 'fr' ? 'Ce que fait exactement chaque commande de maintenance réseau disponible.'
            : lang === 'zh' ? '每个可用网络维护命令的确切功能。'
            : lang === 'ja' ? '利用可能な各ネットワークメンテナンスコマンドが正確に何をするか。'
            : 'What each available network maintenance command does exactly.',
          sections: getContent(lang, 'maintenance'),
        },
      ],
    },

    {
      category: 'analysis',
      categoryTitle: labels.catAnalysis,
      categoryDesc: lang === 'es' ? 'Escáner de red local, identificación de fabricantes por MAC, escáner de puertos y calculadora de subredes.'
        : lang === 'pt' ? 'Scanner de rede local, identificação de fabricantes por MAC, scanner de portas e calculadora de sub-redes.'
        : lang === 'de' ? 'Lokaler Netzwerk-Scanner, MAC-Herstellererkennung, Port-Scanner und Subnetz-Rechner.'
        : lang === 'fr' ? 'Scanner de réseau local, identification des fabricants par MAC, scanner de ports et calculatrice de sous-réseau.'
        : lang === 'zh' ? '局域网扫描仪、MAC 制造商标识、端口扫描仪和子网计算器。'
        : lang === 'ja' ? 'ローカルネットワークスキャナー、MACメーカー識別、ポートスキャナー、サブネット計算機。'
        : 'Local network scanner, MAC manufacturer ID, port scanner, subnet calculator, ping and traceroute.',
      icon: <Radar size={18} />,
      items: [
        {
          id: 'network-scanner',
          title: '📡 ' + (lang === 'es' ? 'Descubrimiento de Red e Inventario' : lang === 'pt' ? 'Descoberta de Rede e Inventário' : lang === 'de' ? 'Netzwerkerkennung und Inventar' : lang === 'fr' ? 'Découverte Réseau et Inventaire' : lang === 'zh' ? '网络发现与库存' : lang === 'ja' ? 'ネットワーク検出とインベントリ' : 'Network Discovery & Inventory'),
          badge: labels.badgePowerful,
          badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
          summary: lang === 'es' ? 'Escanea el segmento de red para descubrir dispositivos conectados, sus nombres de host y fabricantes por MAC.'
            : lang === 'pt' ? 'Varre o segmento de rede para descobrir dispositivos conectados, nomes de host e fabricantes por MAC.'
            : lang === 'de' ? 'Scannt das Netzwerksegment, um angeschlossene Geräte, Hostnamen und MAC-Hersteller zu entdecken.'
            : lang === 'fr' ? 'Scanne le segment réseau pour découvrir les appareils connectés, leurs noms d\'hôtes et fabricants par MAC.'
            : lang === 'zh' ? '扫描网络段以发现连接的设备、主机名和 MAC 制造商。'
            : lang === 'ja' ? 'ネットワークセグメントをスキャンして接続デバイス、ホスト名、MACメーカーを検出。'
            : 'Scans the network segment to discover connected devices, hostnames and MAC manufacturers.',
          sections: getContent(lang, 'networkscanner'),
        },
        {
          id: 'port-scanner',
          title: '🔍 ' + (lang === 'es' ? 'Escáner de Puertos TCP' : lang === 'pt' ? 'Scanner de Portas TCP' : lang === 'de' ? 'TCP-Port-Scanner' : lang === 'fr' ? 'Scanner de Ports TCP' : lang === 'zh' ? 'TCP 端口扫描仪' : lang === 'ja' ? 'TCPポートスキャナー' : 'TCP Port Scanner'),
          badge: labels.badgeSecurity,
          badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
          summary: lang === 'es' ? 'Identifica qué servicios (Web, SSH, RDP, Base de datos, Cámaras) están escuchando en una IP destino.'
            : lang === 'pt' ? 'Identifica quais serviços (Web, SSH, RDP, Banco de dados, Câmeras) estão ouvindo em um IP de destino.'
            : lang === 'de' ? 'Identifiziert welche Dienste (Web, SSH, RDP, Datenbank, Kameras) auf einer Ziel-IP lauschen.'
            : lang === 'fr' ? 'Identifie quels services (Web, SSH, RDP, Base de données, Caméras) écoutent sur une IP cible.'
            : lang === 'zh' ? '识别目标 IP 上哪些服务（Web、SSH、RDP、数据库、摄像头）正在监听。'
            : lang === 'ja' ? 'ターゲットIPでどのサービス（Web、SSH、RDP、データベース、カメラ）が待機しているか識別。'
            : 'Identifies which services (Web, SSH, RDP, Database, Cameras) are listening on a target IP.',
          sections: getContent(lang, 'portscanner'),
        },
        {
          id: 'subnet-calculator',
          title: '📐 ' + (lang === 'es' ? 'Calculadora de Subred CIDR' : lang === 'pt' ? 'Calculadora de Sub-rede CIDR' : lang === 'de' ? 'CIDR-Subnetz-Rechner' : lang === 'fr' ? 'Calculatrice de Sous-réseau CIDR' : lang === 'zh' ? 'CIDR 子网计算器' : lang === 'ja' ? 'CIDRサブネット計算機' : 'CIDR Subnet Calculator'),
          badge: labels.badgeUtility,
          badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
          summary: lang === 'es' ? 'Calcula rangos de IP utilizables, Broadcast, Wildcard mask y número máximo de hosts por subred.'
            : lang === 'pt' ? 'Calcula intervalos de IP utilizáveis, Broadcast, Wildcard mask e número máximo de hosts por sub-rede.'
            : lang === 'de' ? 'Berechnet nutzbare IP-Bereiche, Broadcast, Wildcard-Maske und maximale Hosts pro Subnetz.'
            : lang === 'fr' ? 'Calcule les plages IP utilisables, Broadcast, masque Wildcard et nombre maximum d\'hôtes par sous-réseau.'
            : lang === 'zh' ? '计算可用 IP 范围、广播、通配符掩码和每个子网的最大主机数。'
            : lang === 'ja' ? '使用可能なIP範囲、ブロードキャスト、ワイルドカードマスク、サブネットあたりの最大ホスト数を計算。'
            : 'Calculates usable IP ranges, Broadcast, Wildcard mask and max hosts per subnet.',
          sections: getContent(lang, 'subnet'),
        },
        {
          id: 'connectivity-hub',
          title: '📈 ' + (lang === 'es' ? 'Hub de Conectividad, Ping y Traceroute' : lang === 'pt' ? 'Hub de Conectividade, Ping e Traceroute' : lang === 'de' ? 'Konnektivitäts-Hub, Ping und Traceroute' : lang === 'fr' ? 'Hub de Connectivité, Ping et Traceroute' : lang === 'zh' ? '连接性中心、Ping 和 Traceroute' : lang === 'ja' ? '接続性ハブ、PingとTraceroute' : 'Connectivity Hub, Ping & Traceroute'),
          badge: labels.badgeMonitoring,
          badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          summary: lang === 'es' ? 'Monitoriza latencias de varios hosts en paralelo y traza los saltos de enrutamiento hacia un servidor remoto.'
            : lang === 'pt' ? 'Monitora latências de vários hosts em paralelo e rastreia os saltos de roteamento até um servidor remoto.'
            : lang === 'de' ? 'Überwacht Latenzen mehrerer Hosts parallel und verfolgt Routing-Hops zu einem entfernten Server.'
            : lang === 'fr' ? 'Surveille les latences de plusieurs hôtes en parallèle et trace les sauts de routage vers un serveur distant.'
            : lang === 'zh' ? '并行监控多台主机的延迟，并追踪到远程服务器的路由跳数。'
            : lang === 'ja' ? '複数ホストのレイテンシを並行して監視し、リモートサーバーへのルーティングホップを追跡。'
            : 'Monitors latencies of multiple hosts in parallel and traces routing hops to a remote server.',
          sections: getContent(lang, 'connectivity'),
        },
      ],
    },

    {
      category: 'auxiliary',
      categoryTitle: labels.catAuxiliary,
      categoryDesc: lang === 'es' ? 'Biblioteca de claves de dispositivos, snippets de texto rápido para IPs y buscador global.'
        : lang === 'pt' ? 'Biblioteca de credenciais de dispositivos, snippets de texto rápido e busca global.'
        : lang === 'de' ? 'Geräteanmeldedaten-Bibliothek, Schnellsnippets für IPs und globale Suche.'
        : lang === 'fr' ? 'Bibliothèque d\'identifiants d\'appareils, snippets de texte rapide et recherche globale.'
        : lang === 'zh' ? '设备凭据库、快速文本片段和全局搜索。'
        : lang === 'ja' ? 'デバイス認証情報ライブラリ、IP用クイックテキストスニペット、グローバル検索。'
        : 'Device credential library, quick-copy text snippets, and global keyboard search.',
      icon: <KeyRound size={18} />,
      items: [
        {
          id: 'credential-library',
          title: '🔑 ' + (lang === 'es' ? 'Biblioteca de Credenciales de Dispositivos' : lang === 'pt' ? 'Biblioteca de Credenciais de Dispositivos' : lang === 'de' ? 'Geräteanmeldedaten-Bibliothek' : lang === 'fr' ? 'Bibliothèque de Credentials' : lang === 'zh' ? '设备凭据库' : lang === 'ja' ? 'デバイス認証情報ライブラリ' : 'Device Credential Library'),
          badge: labels.badgeSecurity,
          badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          summary: lang === 'es' ? 'Guarda usuarios y contraseñas por defecto de equipos de red (Hikvision, Dahua, Cisco, Ubiquiti, MikroTik).'
            : lang === 'pt' ? 'Armazena usuários e senhas padrão de equipamentos de rede (Hikvision, Dahua, Cisco, Ubiquiti, MikroTik).'
            : lang === 'de' ? 'Speichert Standard-Benutzer und -Passwörter von Netzwerkgeräten (Hikvision, Dahua, Cisco, Ubiquiti, MikroTik).'
            : lang === 'fr' ? 'Stocke les utilisateurs et mots de passe par défaut des équipements réseau (Hikvision, Dahua, Cisco, Ubiquiti, MikroTik).'
            : lang === 'zh' ? '存储网络设备的默认用户名和密码（海康、大华、思科、Ubiquiti、MikroTik）。'
            : lang === 'ja' ? 'ネットワーク機器のデフォルトユーザー名とパスワードを保存（Hikvision、Dahua、Cisco、Ubiquiti、MikroTik）。'
            : 'Stores default usernames and passwords for network devices (Hikvision, Dahua, Cisco, Ubiquiti, MikroTik).',
          sections: getContent(lang, 'credentials'),
        },
        {
          id: 'clipboard-snippets',
          title: '📋 ' + (lang === 'es' ? 'Gestor de Portapapeles y Snippets' : lang === 'pt' ? 'Gerenciador de Área de Transferência e Snippets' : lang === 'de' ? 'Zwischenablage & Snippets-Manager' : lang === 'fr' ? 'Gestionnaire Presse-papiers & Snippets' : lang === 'zh' ? '剪贴板和片段管理器' : lang === 'ja' ? 'クリップボード＆スニペットマネージャー' : 'Clipboard & Snippets Manager'),
          badge: labels.badgeProductivity,
          badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          summary: lang === 'es' ? 'Guarda direcciones IP habituales, máscaras o comandos para copiarlos al portapapeles con un clic.'
            : lang === 'pt' ? 'Salve endereços IP habituais, máscaras ou comandos para copiá-los com um clique.'
            : lang === 'de' ? 'Häufige IP-Adressen, Masken oder Befehle speichern und mit einem Klick in die Zwischenablage kopieren.'
            : lang === 'fr' ? 'Sauvegardez les adresses IP habituelles, masques ou commandes et copiez-les en un clic.'
            : lang === 'zh' ? '保存常用 IP 地址、掩码或命令，一键复制到剪贴板。'
            : lang === 'ja' ? 'よく使うIPアドレス、マスク、コマンドを保存してワンクリックでコピー。'
            : 'Save common IP addresses, masks or commands to copy them to the clipboard with one click.',
          sections: getContent(lang, 'clipboard'),
        },
        {
          id: 'global-search',
          title: '🔍 ' + (lang === 'es' ? 'Búsqueda Global (Ctrl + K)' : lang === 'pt' ? 'Busca Global (Ctrl + K)' : lang === 'de' ? 'Globale Suche (Strg + K)' : lang === 'fr' ? 'Recherche Globale (Ctrl + K)' : lang === 'zh' ? '全局搜索 (Ctrl + K)' : lang === 'ja' ? 'グローバル検索 (Ctrl + K)' : 'Global Search (Ctrl + K)'),
          badge: labels.badgeShortcut,
          badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          summary: lang === 'es' ? 'Navega por cualquier sección o función de NetMajik usando solo el teclado.'
            : lang === 'pt' ? 'Navegue por qualquer seção ou função do NetMajik usando apenas o teclado.'
            : lang === 'de' ? 'Navigieren Sie zu jedem Abschnitt oder jeder Funktion von NetMajik nur mit der Tastatur.'
            : lang === 'fr' ? 'Naviguez vers n\'importe quelle section ou fonction de NetMajik avec seulement le clavier.'
            : lang === 'zh' ? '仅使用键盘导航到 NetMajik 的任何部分或功能。'
            : lang === 'ja' ? 'キーボードだけでNetMajikの任意のセクションや機能にナビゲート。'
            : 'Navigate to any section or function in NetMajik using only the keyboard.',
          sections: getContent(lang, 'globalsearch'),
        },
      ],
    },

    {
      category: 'secrets',
      categoryTitle: labels.catSecrets,
      categoryDesc: lang === 'es' ? 'Acertijos enigmáticos para descubrir los secretos escondidos dentro de NetMajik.'
        : lang === 'pt' ? 'Enigmas para descobrir os segredos escondidos dentro do NetMajik.'
        : lang === 'de' ? 'Rätselhafte Enigmas um die versteckten Geheimnisse in NetMajik zu entdecken.'
        : lang === 'fr' ? 'Énigmes mystérieuses pour découvrir les secrets cachés dans NetMajik.'
        : lang === 'zh' ? '神秘谜题，发现 NetMajik 中隐藏的秘密。'
        : lang === 'ja' ? 'NetMajikに隠された秘密を発見するための謎めいた謎解き。'
        : 'Enigmatic riddles to discover the hidden secrets inside NetMajik.',
      icon: <Sparkles size={18} />,
      items: [
        {
          id: 'easter-riddles',
          title: '🔮 ' + (lang === 'es' ? 'El Grimorio de los Secretos Ocultos' : lang === 'pt' ? 'O Grimório dos Segredos Ocultos' : lang === 'de' ? 'Das Grimoire der verborgenen Geheimnisse' : lang === 'fr' ? 'Le Grimoire des Secrets Cachés' : lang === 'zh' ? '隐藏秘密的魔法书' : lang === 'ja' ? '隠された秘密の魔導書' : 'The Grimoire of Hidden Secrets'),
          badge: labels.badgeMystery,
          badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
          summary: lang === 'es' ? 'Pistas y acertijos crípticos para los exploradores que buscan desencadenar las animaciones y logros secretos.'
            : lang === 'pt' ? 'Pistas e enigmas crípticos para os exploradores que buscam desencadear as animações e conquistas secretas.'
            : lang === 'de' ? 'Kryptische Hinweise und Rätsel für Entdecker, die geheime Animationen und Erfolge freischalten wollen.'
            : lang === 'fr' ? 'Indices et énigmes cryptiques pour les explorateurs cherchant à déclencher les animations et succès secrets.'
            : lang === 'zh' ? '为寻求触发秘密动画和成就的探险者提供的神秘线索和谜题。'
            : lang === 'ja' ? '秘密のアニメーションと実績を解放しようとする探索者のための謎めいたヒントと謎解き。'
            : 'Cryptic clues and riddles for explorers seeking to trigger secret animations and achievements.',
          sections: getContent(lang, 'riddles'),
        },
      ],
    },
  ], [labels, lang]);

  // Categories list
  const categories = [
    { id: 'getting-started', label: labels.catGettingStarted, count: guideData.find(g => g.category === 'getting-started')?.items.length || 0 },
    { id: 'win-tools', label: labels.catWinTools, count: guideData.find(g => g.category === 'win-tools')?.items.length || 0 },
    { id: 'analysis', label: labels.catAnalysis, count: guideData.find(g => g.category === 'analysis')?.items.length || 0 },
    { id: 'auxiliary', label: labels.catAuxiliary, count: guideData.find(g => g.category === 'auxiliary')?.items.length || 0 },
    { id: 'secrets', label: labels.catSecrets, count: guideData.find(g => g.category === 'secrets')?.items.length || 0 },
  ];

  const currentCategoryData = guideData.find(g => g.category === activeCategory) || guideData[0];

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return guideData;
    const query = searchQuery.toLowerCase();
    return guideData.map(cat => ({
      ...cat,
      items: cat.items.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.sections.some(s => s.heading.toLowerCase().includes(query) || s.content.toLowerCase().includes(query))
      ),
    })).filter(cat => cat.items.length > 0);
  }, [guideData, searchQuery]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      {/* Top Header */}
      <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-500/15 text-blue-400 rounded-2xl border border-blue-500/20 shadow-inner">
            <BookOpen size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-theme-text-primary">{labels.title}</h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                v{APP_VERSION}
              </span>
            </div>
            <p className="text-theme-text-muted text-sm mt-0.5">{labels.sub}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-theme-text-muted" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={labels.searchPlaceholder}
            className="bg-theme-bg-tertiary border border-theme-border-primary rounded-xl pl-9 pr-8 py-2 text-sm text-theme-text-primary placeholder:text-theme-text-muted/40 focus:ring-2 focus:ring-blue-500/50 outline-none w-full md:w-72 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 p-1 text-theme-text-muted hover:text-theme-text-primary rounded-lg transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      {!searchQuery && (
        <div className="flex items-center gap-2 border-b border-theme-border-primary pb-3 overflow-x-auto custom-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-theme-bg-secondary text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-tertiary'
              }`}
            >
              {cat.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-theme-bg-tertiary text-theme-text-muted'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <div className="space-y-6">
        {(searchQuery ? filteredData : [currentCategoryData]).map(categoryGroup => (
          <div key={categoryGroup.category} className="space-y-4">
            {searchQuery && (
              <h3 className="text-base font-bold text-theme-text-primary flex items-center gap-2 border-b border-theme-border-primary pb-2">
                {categoryGroup.categoryTitle}
              </h3>
            )}

            <div className="space-y-4">
              {categoryGroup.items.map(item => {
                const isExpanded = expandedItems[item.id] ?? false;
                return (
                  <div
                    key={item.id}
                    className="bg-theme-bg-secondary border border-theme-border-primary rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:border-theme-border-secondary"
                  >
                    {/* Header Accordion Trigger */}
                    <div
                      onClick={() => toggleItem(item.id)}
                      className="p-5 cursor-pointer flex items-center justify-between gap-4 select-none hover:bg-theme-bg-tertiary/40 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="p-2.5 bg-theme-bg-tertiary rounded-xl border border-theme-border-primary/50 text-blue-400">
                          {categoryGroup.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-theme-text-primary text-base">{item.title}</h3>
                            {item.badge && (
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-theme-text-muted mt-1 leading-relaxed">{item.summary}</p>
                        </div>
                      </div>
                      <div className="p-2 rounded-xl text-theme-text-muted hover:text-theme-text-primary transition-transform duration-200 flex-shrink-0">
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </div>
                    </div>

                    {/* Collapsible Content */}
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 border-t border-theme-border-primary/60 bg-theme-bg-tertiary/20 space-y-5 animate-in fade-in duration-200">
                        {item.sections.map((sec, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">{sec.heading}</h4>
                            <div className="text-xs text-theme-text-secondary leading-relaxed whitespace-pre-wrap font-sans pl-3 border-l-2 border-blue-500/20">
                              {sec.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
