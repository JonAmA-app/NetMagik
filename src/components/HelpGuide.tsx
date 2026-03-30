
import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import { TRANSLATIONS, APP_VERSION } from '../constants';
import { Activity, Clipboard as ClipboardIcon, Radar, Globe, KeyRound, ChevronDown, ChevronRight, Menu, LayoutDashboard, Calculator, Settings, Package, Search, X, Lightbulb, HelpCircle, Zap, Heart } from 'lucide-react';

interface HelpGuideProps {
  language: Language;
}

export const HelpGuide: React.FC<HelpGuideProps> = ({ language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    'dashboard-main': true // Auto expand first item
  });

  const toggleItem = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Structured Guide Data based on new User Request
  const sections = useMemo(() => [
    {
      id: 'dashboard',
      icon: <LayoutDashboard size={18} />,
      title: t.interfaces, // "Interfaces" matches Dashboard usually
      description: t.help_dashboard,
      items: [
        { id: 'main', title: t.help_dashboard, content: t.help_dashboard_content }
      ]
    },
    {
      id: 'scenarios',
      icon: <Lightbulb size={18} />,
      title: t.help_scenarios,
      description: t.help_scenarios_desc,
      items: [
        { id: 'no-internet', title: t.help_scenario_no_internet_title, content: t.help_scenario_no_internet_content },
        { id: 'find-device', title: t.help_scenario_find_device_title, content: t.help_scenario_find_device_content }
      ]
    },
    {
      id: 'glossary',
      icon: <HelpCircle size={18} />,
      title: t.help_glossary,
      description: t.help_glossary_desc,
      items: [
        { id: 'ip', title: t.help_glossary_ip_title, content: t.help_glossary_ip_content },
        { id: 'gateway', title: t.help_glossary_gateway_title, content: t.help_glossary_gateway_content },
        { id: 'dns', title: t.help_glossary_dns_title, content: t.help_glossary_dns_content }
      ]
    },
    {
      id: 'clipboard',
      icon: <ClipboardIcon size={18} />,
      title: t.clipboard,
      description: t.helpClipboardDesc,
      items: [
        { id: 'main', title: t.helpClipboardTitle, content: t.help_clipboard_content }
      ]
    },
    {
      id: 'diagnostics',
      icon: <Activity size={18} />,
      title: t.connectivity,
      description: t.helpDiagnosticsDesc,
      items: [
        { id: 'main', title: t.helpDiagnosticsTitle, content: t.help_diagnostics_content }
      ]
    },
    {
      id: 'scanner',
      icon: <Radar size={18} />,
      title: t.networkScanner,
      description: t.helpScannerDesc,
      items: [
        { id: 'main', title: t.helpScannerTitle, content: t.help_scanner_content }
      ]
    },
    {
      id: 'internet',
      icon: <Globe size={18} />,
      title: t.internetStatus,
      description: t.helpInternetDesc,
      items: [
        { id: 'main', title: t.helpInternetTitle, content: t.help_internet_content }
      ]
    },
    {
      id: 'credentials',
      icon: <KeyRound size={18} />,
      title: t.credentialLibrary,
      description: t.helpCredentialsDesc,
      items: [
        { id: 'main', title: t.helpCredentialsTitle, content: t.help_credentials_content }
      ]
    },
    {
      id: 'system',
      icon: <Activity size={18} />,
      title: t.systemHealth,
      description: t.ip_stats,
      items: [
        { id: 'main', title: t.systemHealth, content: t.help_system_content }
      ]
    },
    {
      id: 'subnet',
      icon: <Calculator size={18} />,
      title: t.subnetCalculator,
      description: t.cidr_label,
      items: [
        { id: 'main', title: t.subnetCalculator, content: t.help_subnet_content }
      ]
    },
    {
      id: 'programs',
      icon: <Package size={18} />,
      title: t.programs,
      description: t.system_apps,
      items: [
        { id: 'main', title: t.programs, content: t.help_programs_content }
      ]
    },
    {
      id: 'faq',
      icon: <HelpCircle size={18} />,
      title: t.help_faq,
      description: t.help_faq_desc,
      items: [
        { id: 'iface', title: t.help_faq_no_iface_title, content: t.help_faq_no_iface_content },
        { id: 'admin', title: t.help_faq_admin_title, content: t.help_faq_admin_content }
      ]
    },
    {
      id: 'tips',
      icon: <Zap size={18} />,
      title: t.help_tips,
      description: t.help_tips_desc,
      items: [
        { id: 'search', title: t.help_tips_search_title, content: t.help_tips_search_content },
        { id: 'shortcuts', title: t.help_tips_shortcuts_title, content: t.help_tips_shortcuts_content }
      ]
    },
    {
      id: 'shortcuts',
      icon: <Menu size={18} />,
      title: t.help_shortcuts,
      description: t.help_shortcuts_desc,
      items: [
        { id: 'keys', title: t.help_shortcuts, content: `• **Ctrl + K:** ${t.globalSearch}\n• **Ctrl + S:** ${t.save}\n• **Esc:** ${t.cancel}` }
      ]
    },
    {
      id: 'settings',
      icon: <Settings size={18} />,
      title: t.settingsTitle,
      description: t.helpAdminTitle,
      items: [
        { id: 'main', title: t.settingsTitle, content: `• ${t.theme}\n• ${t.language}\n• ${t.help_backup_title}: ${t.help_backup_desc}` }
      ]
    }
  ], [t]);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const query = searchQuery.toLowerCase();
    return sections.filter(section =>
      section.title.toLowerCase().includes(query) ||
      section.description.toLowerCase().includes(query) ||
      section.items.some(item =>
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query)
      )
    );
  }, [sections, searchQuery]);

  const activeContent = (filteredSections.length > 0) 
    ? (filteredSections.find(s => s.id === activeSection) || filteredSections[0])
    : null;

  return (
    <div className="flex flex-col md:flex-row gap-6 animate-in slide-in-from-bottom-2 duration-500 pt-4 h-full">
      {/* Sidebar Index */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-xl p-2 shadow-sm sticky top-4">

          {/* Search Bar */}
          <div className="px-2 pb-2 mt-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted group-focus-within:text-theme-brand-primary transition-colors" size={14} />
              <input
                type="text"
                placeholder={t.help_quick_search_desc}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg pl-9 pr-8 py-2 text-xs text-theme-text-primary focus:outline-none focus:border-theme-brand-primary transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-theme-bg-hover rounded-md text-theme-text-muted transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="px-4 py-3 flex items-center gap-2 border-b border-theme-border-secondary mb-2 mt-1">
            <Menu size={16} className="text-theme-text-muted" />
            <span className="text-xs font-bold text-theme-text-muted uppercase tracking-wider">{t.help_index}</span>
          </div>

          <nav className="space-y-1 max-h-[50vh] overflow-y-auto custom-scrollbar">
            {filteredSections.length > 0 ? (
              filteredSections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeSection === section.id
                    ? 'bg-theme-brand-primary/10 text-theme-brand-primary'
                    : 'text-theme-text-secondary hover:bg-theme-bg-hover'
                    }`}
                >
                  {section.icon}
                  <span className="truncate">{section.title}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-xs text-theme-text-muted">{t.help_no_results}</p>
              </div>
            )}
          </nav>

          {/* Support Footer */}
          <div className="mt-4 pt-4 border-t border-theme-border-secondary px-3 pb-2">
            <div className="bg-theme-bg-tertiary rounded-xl p-3 border border-theme-border-secondary">
              <p className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest mb-2">{t.netmajik}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-theme-text-secondary">{t.versionLabel}</span>
                <span className="text-xs font-mono font-bold text-theme-brand-primary">v{APP_VERSION}</span>
              </div>
              <button
                onClick={() => window.open('https://paypal.me/JONAMA_PLACEHOLDER', '_blank')}
                className="w-full py-2 bg-theme-brand-primary/10 hover:bg-theme-brand-primary/20 text-theme-brand-primary rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Heart size={12} className="text-rose-500" />
                {t.supportDonate || t.donate}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 pb-12">
        {activeContent && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300" key={activeContent.id}>

            {/* Header */}
            <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-theme-bg-tertiary rounded-xl text-theme-brand-primary">
                  {React.cloneElement(activeContent.icon as React.ReactElement<any>, { size: 32 })}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-theme-text-primary mb-2">{activeContent.title}</h2>
                  <p className="text-theme-text-muted leading-relaxed">
                    {activeContent.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Content Items */}
            <div className="space-y-3">
              {activeContent.items.map((item) => {
                const isOpen = expandedItems[`${activeContent.id}-${item.id}`] || searchQuery.length > 0;
                return (
                  <div
                    key={item.id}
                    className="bg-theme-bg-secondary border border-theme-border-primary rounded-xl overflow-hidden shadow-sm"
                  >
                    <button
                      onClick={() => toggleItem(`${activeContent.id}-${item.id}`)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-theme-bg-hover transition-colors"
                    >
                      <span className="font-semibold text-theme-text-primary">{item.title}</span>
                      {isOpen ? <ChevronDown size={20} className="text-theme-text-muted" /> : <ChevronRight size={20} className="text-theme-text-muted" />}
                    </button>
                    {isOpen && (
                      <div className="p-6 pt-0 text-sm text-theme-text-secondary border-t border-theme-border-secondary bg-theme-bg-tertiary leading-relaxed whitespace-pre-wrap">
                        <div className="pt-4 space-y-4">
                          {/* Markdown-ish formatting for bullets */}
                          {item.content.split('\n').map((line, i) => {
                            const isBullet = line.startsWith('•');

                            return (
                              <p key={i} className={isBullet ? 'pl-4 relative' : ''}>
                                {isBullet && <span className="absolute left-0 text-theme-brand-primary">•</span>}
                                {line.includes('**') ? (
                                  <>
                                    {line.split('**')[0].replace('• ', '')}
                                    <span className="font-bold text-theme-text-primary">
                                      {line.split('**')[1]}
                                    </span>
                                    {line.split('**')[2]}
                                  </>
                                ) : line.replace('• ', '')}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
