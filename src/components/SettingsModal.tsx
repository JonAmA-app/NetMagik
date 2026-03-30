
import React, { useRef, useState, useEffect } from 'react';
import { X, Monitor, Shield, Globe, Download, Upload, Maximize, Heart, Palette, Bell, Volume2, Lock, HelpCircle } from 'lucide-react';
import { AppSettings, Language, Theme } from '../types';
import { TRANSLATIONS, APP_VERSION, DONATION_URL } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
}

const HotkeyInput: React.FC<{ label: string; value: string; onChange: (val: string) => void; t: any }> = ({ label, value, onChange, t }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (!isRecording) return;
    e.preventDefault();

    // Ignore pure modifier keys
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

    let accelerator = '';
    if (e.ctrlKey) accelerator += 'Ctrl+';
    if (e.altKey) accelerator += 'Alt+';
    if (e.shiftKey) accelerator += 'Shift+';

    // Simple mapping for display
    const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
    accelerator += key;

    // Validate with Electron
    if (window.electronAPI) {
      const isAvailable = await (window.electronAPI as any).checkShortcut(accelerator);
      if (!isAvailable) {
        setError(t.hotkeyInUse);
        return;
      }
    }

    setError(null);
    onChange(accelerator);
    setIsRecording(false);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs bg-theme-bg-secondary p-2 rounded-lg border border-theme-border-primary shadow-sm">
        <span className="text-theme-text-muted">{label}</span>
        <div className="flex gap-1 items-center">
          <button
            onClick={() => setIsRecording(true)}
            className={`px-2 py-1 rounded font-bold transition-all ${isRecording ? 'bg-orange-500 text-white animate-pulse' : 'bg-theme-bg-tertiary text-theme-brand-primary hover:bg-theme-brand-primary hover:text-white'}`}
          >
            {isRecording ? t.listening : value}
          </button>
          {!isRecording && value && (
            <button
              onClick={() => onChange('')}
              className="p-1 px-2 hover:bg-red-500 hover:text-white rounded text-theme-text-muted transition-colors"
              title={t.removeShortcut || "Remove shortcut"}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      {isRecording && <input autoFocus onKeyDown={handleKeyDown} onBlur={() => setIsRecording(false)} className="opacity-0 h-0 w-0 absolute" />}
      {error && <p className="text-[9px] text-red-500 ml-1">{error}</p>}
    </div>
  );
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onExportData,
  onImportData
}) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminHelp, setShowAdminHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[settings.language] || TRANSLATIONS['en'];

  useEffect(() => {
    if (isOpen) {
      checkAdminStatus();
    }
  }, [isOpen]);

  const checkAdminStatus = async () => {
    if (window.electronAPI) {
      try {
        const status = await window.electronAPI.isProcessElevated();
        setIsAdmin(status);
      } catch (e) {
        console.error("Failed to check admin status", e);
      }
    }
  };

  if (!isOpen) return null;

  const toggleSetting = (key: keyof AppSettings) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key]
    });

    if (key === 'startMaximized' && !settings.startMaximized) {
      if (window.electronAPI) {
        window.electronAPI.windowManage('maximize');
      }
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateSettings({
      ...settings,
      language: e.target.value as Language
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportData(file);
    }
    if (e.target) e.target.value = '';
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-theme-bg-secondary border border-theme-border-primary rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-theme-border-secondary bg-theme-bg-tertiary flex-shrink-0">
          <h3 className="font-semibold text-theme-text-primary flex items-center gap-2">
            <Monitor size={18} className="text-theme-brand-primary" />
            {t.settingsTitle}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-hover rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-3 gap-6">
            {/* Column 1: Setup + Workflow */}
            <div className="space-y-6">
              {/* Section 1: General Rig Setup */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-theme-text-muted uppercase tracking-[0.2em] px-1 flex items-center justify-between">
                  <span>{t.setupSection}</span>
                  <Monitor size={12} className="opacity-50" />
                </div>

                <div
                  onClick={() => toggleSetting('startMaximized')}
                  className="flex items-center justify-between p-3 rounded-xl bg-theme-bg-primary border border-theme-border-secondary hover:border-theme-brand-primary/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Maximize size={16} className="text-teal-500" />
                    <span className="text-xs font-semibold text-theme-text-primary">{t.startMaximized}</span>
                  </div>
                  <div className={`w-7 h-3.5 rounded-full relative transition-colors ${settings.startMaximized ? 'bg-theme-brand-primary' : 'bg-theme-bg-tertiary'}`}>
                    <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm transition-all ${settings.startMaximized ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                </div>


                <div className="flex items-center justify-between p-3 rounded-xl bg-theme-bg-primary border border-theme-border-secondary">
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-blue-500" />
                    <span className="text-xs font-semibold text-theme-text-primary">{t.language}</span>
                  </div>
                  <select
                    value={settings.language}
                    onChange={handleLanguageChange}
                    className="bg-theme-bg-secondary border border-theme-border-secondary text-[10px] font-bold text-theme-text-primary rounded-lg px-2 py-1 outline-none"
                  >
                    <option value="en">{t.langEn}</option>
                    <option value="es">{t.langEs}</option>
                    <option value="pt">{t.langPt}</option>
                    <option value="de">{t.langDe}</option>
                    <option value="fr">{t.langFr}</option>
                    <option value="zh">{t.langZh}</option>
                    <option value="ja">{t.langJa}</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-theme-bg-primary border border-theme-border-secondary">
                  <div className="flex items-center gap-2">
                    <Palette size={16} className="text-pink-500" />
                    <div>
                      <span className="text-xs font-semibold text-theme-text-primary block">{t.theme}</span>
                      <span className="text-[9px] text-theme-text-muted">{t.themeDesc}</span>
                    </div>
                  </div>
                  <select
                    value={settings.theme}
                    onChange={(e) => onUpdateSettings({ ...settings, theme: e.target.value as Theme })}
                    className="bg-theme-bg-secondary border border-theme-border-secondary text-[10px] font-bold text-theme-text-primary rounded-lg px-2 py-1 outline-none"
                  >
                    <option value="dark">{t.themeDark}</option>
                    <option value="light">{t.themeLight}</option>
                    <option value="matrix">{t.themeMatrix}</option>
                    <option value="sakura">{t.themeSakura}</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <div
                    onClick={() => toggleSetting('systemNotifications')}
                    className="flex items-center justify-between p-3 rounded-xl bg-theme-bg-primary border border-theme-border-secondary hover:border-theme-brand-primary/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-cyan-500" />
                      <span className="text-xs font-semibold text-theme-text-primary">{t.systemNotifications}</span>
                    </div>
                    <div className={`w-7 h-3.5 rounded-full relative transition-colors ${settings.systemNotifications ? 'bg-theme-brand-primary' : 'bg-theme-bg-tertiary'}`}>
                      <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm transition-all ${settings.systemNotifications ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                  </div>

                  {settings.systemNotifications && (
                    <div
                      onClick={() => toggleSetting('notificationSound')}
                      className="flex items-center justify-between p-3 rounded-xl bg-theme-bg-tertiary border border-theme-border-secondary hover:border-theme-brand-primary/30 transition-all cursor-pointer group mt-2"
                    >
                      <div className="flex items-center gap-2">
                        <Volume2 size={16} className="text-emerald-500" />
                        <div>
                          <span className="text-xs font-semibold text-theme-text-primary block">{t.notificationSound}</span>
                          <span className="text-[9px] text-theme-text-muted">{t.notificationSoundDesc}</span>
                        </div>
                      </div>
                      <div className={`w-7 h-3.5 rounded-full relative transition-colors ${settings.notificationSound ? 'bg-theme-brand-primary' : 'bg-theme-bg-secondary'}`}>
                        <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm transition-all ${settings.notificationSound ? 'right-0.5' : 'left-0.5'}`} />
                      </div>
                    </div>
                  )}

                  <div
                    onClick={() => toggleSetting('monitorSystemEvents')}
                    className="flex items-center justify-between p-3 rounded-xl bg-theme-bg-primary border border-theme-border-secondary hover:border-theme-brand-primary/30 transition-all cursor-pointer group mt-2"
                  >
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-red-500" />
                      <div>
                        <span className="text-xs font-semibold text-theme-text-primary block">{t.monitorSystemEvents || "Antivirus Hardware"}</span>
                        <span className="text-[9px] text-theme-text-muted">{t.monitorSystemEventsDesc || "Check errors in background"}</span>
                      </div>
                    </div>
                    <div className={`w-7 h-3.5 rounded-full relative transition-colors ${settings.monitorSystemEvents ? 'bg-red-500' : 'bg-theme-bg-tertiary'}`}>
                      <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm transition-all ${settings.monitorSystemEvents ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Security */}
            <div className="space-y-6">
              {/* Section 2: Security & Trust */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-theme-text-muted uppercase tracking-[0.2em] px-1 flex items-center justify-between">
                  <span>{t.securitySection}</span>
                  <Shield size={12} className="opacity-50" />
                </div>

                <div className="p-3 rounded-xl bg-theme-bg-primary border border-theme-border-secondary space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isAdmin ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                        <Shield size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-theme-text-primary uppercase tracking-tight">{isAdmin ? t.runningAsAdmin : t.runningAsUser}</p>
                        <p className="text-[9px] text-theme-text-muted">{isAdmin ? t.fullControlEnabled : t.limitedPermissions}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!isAdmin && (
                        <button
                          onClick={() => window.electronAPI.relaunchElevated()}
                          className="px-2 py-1 bg-theme-bg-secondary border border-orange-500/30 text-[9px] font-bold text-orange-600 rounded-md hover:bg-orange-500 hover:text-white transition-colors"
                        >
                          {t.elevate}
                        </button>
                      )}
                      <button
                        onClick={() => setShowAdminHelp(!showAdminHelp)}
                        className={`p-1 rounded-md transition-all ${showAdminHelp ? 'bg-theme-brand-primary text-white' : 'hover:bg-theme-bg-tertiary text-theme-text-muted'}`}
                        title={t.help}
                      >
                        <HelpCircle size={14} />
                      </button>
                    </div>
                  </div>

                  {showAdminHelp && (
                    <div className="p-3 bg-theme-brand-primary/10 border border-theme-brand-primary/20 rounded-xl mt-3 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-2 mb-2">
                        <HelpCircle size={14} className="text-theme-brand-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-theme-text-primary">{t.adminShortcutHelpTitle}</span>
                      </div>
                      <p className="text-[10px] text-theme-text-muted leading-relaxed">
                        {t.adminShortcutHelpText}
                      </p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-theme-border-primary flex items-center justify-between" onClick={() => toggleSetting('securityEnabled')}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${settings.securityEnabled ? 'bg-rose-500/10 text-rose-500' : 'bg-theme-bg-tertiary text-theme-text-muted'}`}>
                        <Lock size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-theme-text-primary uppercase tracking-tight">{t.enablePassword}</p>
                        <p className="text-[9px] text-theme-text-muted">{t.lockWithPassword}</p>
                      </div>
                    </div>
                    <div className={`w-7 h-3.5 rounded-full relative transition-colors ${settings.securityEnabled ? 'bg-rose-600' : 'bg-theme-bg-tertiary'}`}>
                      <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm transition-all ${settings.securityEnabled ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                  </div>

                  {settings.securityEnabled && (
                    <div className="space-y-4 pt-3 border-t border-theme-border-secondary animate-in slide-in-from-top-2 duration-300">
                      <div className="text-[10px] font-bold text-theme-text-muted uppercase tracking-wider">{t.passwordSettings}</div>

                      <div className="grid grid-cols-1 gap-2">
                        <div
                          onClick={() => toggleSetting('passwordProtectSettings')}
                          className="flex items-center justify-between p-2 rounded-lg bg-theme-bg-tertiary border border-theme-border-primary hover:border-theme-brand-primary/30 transition-all cursor-pointer group"
                        >
                          <span className="text-[10px] font-semibold text-theme-text-primary">{t.passwordProtectSettings}</span>
                          <div className={`w-6 h-3 rounded-full relative transition-colors ${settings.passwordProtectSettings ? 'bg-theme-brand-primary' : 'bg-theme-bg-secondary'}`}>
                            <div className={`absolute top-0.5 w-2 h-2 bg-white rounded-full shadow-sm transition-all ${settings.passwordProtectSettings ? 'right-0.5' : 'left-0.5'}`} />
                          </div>
                        </div>

                        <div
                          onClick={() => toggleSetting('passwordProtectWake')}
                          className="flex items-center justify-between p-2 rounded-lg bg-theme-bg-tertiary border border-theme-border-primary hover:border-theme-brand-primary/30 transition-all cursor-pointer group"
                        >
                          <span className="text-[10px] font-semibold text-theme-text-primary">{t.passwordProtectWake}</span>
                          <div className={`w-6 h-3 rounded-full relative transition-colors ${settings.passwordProtectWake ? 'bg-theme-brand-primary' : 'bg-theme-bg-secondary'}`}>
                            <div className={`absolute top-0.5 w-2 h-2 bg-white rounded-full shadow-sm transition-all ${settings.passwordProtectWake ? 'right-0.5' : 'left-0.5'}`} />
                          </div>
                        </div>

                        <div
                          onClick={() => toggleSetting('passwordProtectSnippets')}
                          className="flex items-center justify-between p-2 rounded-lg bg-theme-bg-tertiary border border-theme-border-primary hover:border-theme-brand-primary/30 transition-all cursor-pointer group"
                        >
                          <span className="text-[10px] font-semibold text-theme-text-primary">{t.passwordProtectSnippets}</span>
                          <div className={`w-6 h-3 rounded-full relative transition-colors ${settings.passwordProtectSnippets ? 'bg-theme-brand-primary' : 'bg-theme-bg-secondary'}`}>
                            <div className={`absolute top-0.5 w-2 h-2 bg-white rounded-full shadow-sm transition-all ${settings.passwordProtectSnippets ? 'right-0.5' : 'left-0.5'}`} />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <input
                          type="password"
                          placeholder={t.setPassword}
                          value={settings.password || ''}
                          onChange={(e) => onUpdateSettings({ ...settings, password: e.target.value })}
                          className="w-full bg-theme-bg-tertiary border border-theme-border-primary rounded-lg px-3 py-1.5 text-xs outline-none focus:border-rose-500 text-theme-text-primary"
                        />
                        <div className="grid grid-cols-1 gap-2">
                          <select
                            value={settings.recoveryQuestion || ''}
                            onChange={(e) => onUpdateSettings({ ...settings, recoveryQuestion: e.target.value })}
                            className="w-full bg-theme-bg-tertiary border border-theme-border-primary text-theme-text-primary rounded-lg px-2 py-1.5 text-[10px] outline-none truncate"
                          >
                            <option value="">{t.recoveryQuestions}...</option>
                            <option value="pet">{t.questionPet}</option>
                            <option value="city">{t.questionCity}</option>
                            <option value="school">{t.questionSchool}</option>
                            <option value="mother">{t.questionMother}</option>
                          </select>
                          <input
                            type="text"
                            placeholder={t.recoveryAnswer}
                            value={settings.recoveryAnswer || ''}
                            onChange={(e) => onUpdateSettings({ ...settings, recoveryAnswer: e.target.value })}
                            className="w-full bg-theme-bg-tertiary border border-theme-border-primary text-theme-text-primary rounded-lg px-3 py-1.5 text-[10px] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Column 3: Data & Workflow */}
            <div className="space-y-6">
              {/* Section 3: Workflow Tools */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-theme-text-muted uppercase tracking-[0.2em] px-1 flex items-center justify-between">
                  <span>{t.workflowSection}</span>
                  <Maximize size={12} className="opacity-50" />
                </div>

                <div className="p-3 rounded-xl bg-theme-bg-primary border border-theme-border-secondary space-y-4">
                  <div className="flex items-center justify-between" onClick={() => toggleSetting('globalShortcuts')}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${settings.globalShortcuts ? 'bg-theme-brand-primary/10 text-theme-brand-primary' : 'bg-theme-bg-tertiary text-theme-text-muted'}`}>
                        <Monitor size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-theme-text-primary uppercase tracking-tight">{t.keyboardShortcuts}</p>
                        <p className="text-[9px] text-theme-text-muted">{t.systemWideTriggers}</p>
                      </div>
                    </div>
                    <div className={`w-7 h-3.5 rounded-full relative transition-colors ${settings.globalShortcuts ? 'bg-theme-brand-primary' : 'bg-theme-bg-tertiary'}`}>
                      <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm transition-all ${settings.globalShortcuts ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                  </div>

                  {settings.globalShortcuts && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                      <HotkeyInput
                        label={t.appHotkeyLabel}
                        value={settings.appHotkey}
                        onChange={(val) => onUpdateSettings({ ...settings, appHotkey: val })}
                        t={t}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Maintenance & Data */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-theme-text-muted uppercase tracking-[0.2em] px-1 flex items-center justify-between">
                  <span>{t.dataSection}</span>
                  <Download size={12} className="opacity-50" />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={onExportData}
                    className="flex items-center gap-3 p-3 rounded-xl bg-theme-bg-primary border border-theme-border-secondary hover:bg-theme-brand-primary hover:text-white transition-all group"
                  >
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-white/20 group-hover:text-white">
                      <Download size={16} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-tight">{t.exportConfig}</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-3 p-3 rounded-xl bg-theme-bg-primary border border-theme-border-secondary hover:bg-emerald-500 hover:text-white transition-all group"
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-white/20 group-hover:text-white">
                      <Upload size={16} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-tight">{t.importConfig}</span>
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json,.NetMajik" className="hidden" />
                </div>
                <div
                  onClick={() => toggleSetting('encryptBackups')}
                  className="flex items-center justify-between p-3 rounded-xl bg-theme-bg-primary border border-theme-border-secondary hover:border-theme-brand-primary/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Lock size={16} className="text-orange-500" />
                    <div>
                      <span className="text-xs font-semibold text-theme-text-primary block">{t.encryptBackups}</span>
                      <span className="text-[9px] text-theme-text-muted">{t.encryptBackupsDesc}</span>
                    </div>
                  </div>
                  <div className={`w-7 h-3.5 rounded-full relative transition-colors ${settings.encryptBackups ? 'bg-theme-brand-primary' : 'bg-theme-bg-tertiary'}`}>
                    <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm transition-all ${settings.encryptBackups ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Branding Footer */}
        <div className="p-4 border-t border-theme-border-secondary bg-theme-bg-tertiary flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-theme-text-primary tracking-tighter">NetMajik</span>
              <span className="px-1.5 py-0.5 bg-theme-brand-primary text-[8px] font-bold text-white rounded-md tracking-widest uppercase">PRO</span>
            </div>
            <p className="text-[9px] font-bold text-theme-text-muted mt-0.5">
              {t.automatedNetOps || "Automated NetOps Workstation"} • v{APP_VERSION}
            </p>
            <p className="text-[9px] text-theme-text-muted/60 mt-0.5">
              {t.developedBy || "Developed by"} <span className="text-theme-brand-primary font-bold">JonAmA</span>
            </p>
          </div>
          <a
            href={DONATION_URL}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
            title={t.supportDonate || t.donate}
          >
            <Heart size={14} className="fill-current" />
          </a>
        </div>
      </div>
    </div>
  );
};
