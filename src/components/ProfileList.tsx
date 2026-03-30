import React, { useState } from 'react';
import { Profile, IpType, Language } from '../types';
import { Trash2, Shield, Check, Zap, Server, Edit2, HelpCircle, ChevronRight, MousePointerClick, Settings, RefreshCw, Activity, Monitor, Layout } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface ProfileListProps {
  profiles: Profile[];
  onApply: (profile: Profile) => void;
  onEdit: (profile: Profile) => void;
  onDelete: (id: string) => void;
  isApplying: boolean;
  language: Language;
  isAdmin: boolean;
  onViewInventory: (profileId: string) => void;
  onUpdateOrder?: (profiles: Profile[]) => void;
}

export const ProfileList: React.FC<ProfileListProps> = ({ profiles, onApply, onEdit, onDelete, isApplying, language, isAdmin, onViewInventory, onUpdateOrder }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
  const [showHelp, setShowHelp] = useState(false);
  const [draggedProfileIndex, setDraggedProfileIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedProfileIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedProfileIndex === null || !onUpdateOrder) return;
    const newProfiles = [...profiles];
    const draggedItem = newProfiles[draggedProfileIndex];
    newProfiles.splice(draggedProfileIndex, 1);
    newProfiles.splice(index, 0, draggedItem);
    onUpdateOrder(newProfiles);
    setDraggedProfileIndex(null);
  };

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Admin Warning Banner */}
      {!isAdmin && (
        <div className="glass shadow-lg shadow-orange-500/10 border-orange-200/50 dark:border-orange-500/20 rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-500/30 shrink-0">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-theme-text-primary">{t.adminRequiredBanner}</p>
                <p className="text-xs text-theme-text-muted mt-0.5">{t.adminNeededDesc}</p>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 px-4 py-2 rounded-xl transition-all flex items-center gap-2 border border-orange-200 dark:border-orange-500/20"
            >
              <HelpCircle size={14} />
              {t.adminHowTo}
              <ChevronRight size={14} className={`transition-transform duration-300 ${showHelp ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {showHelp && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 grid md:grid-cols-2 gap-8 animate-in slide-in-from-top-2 fade-in duration-500">
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest flex items-center gap-2">
                  <MousePointerClick size={14} className="text-orange-500" />
                  {t.adminHowToTitle}
                </h4>
                <ul className="text-xs text-theme-text-muted space-y-2">
                  <li className="flex gap-2 text-theme-text-secondary"><span>1.</span> {t.adminStep1}</li>
                  <li className="flex gap-2 text-theme-text-secondary"><span>2.</span> {t.adminStep2}</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest flex items-center gap-2">
                  <Settings size={14} className="text-orange-500" />
                  {t.adminPermTitle}
                </h4>
                <ul className="text-xs text-theme-text-muted space-y-2">
                  <li className="flex gap-2 text-theme-text-secondary"><span>1.</span> {t.adminPermStep1}</li>
                  <li className="flex gap-2 text-theme-text-secondary"><span>2.</span> {t.adminPermStep2}</li>
                  <li className="flex gap-2 text-theme-text-secondary"><span>3.</span> {t.adminPermStep3}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {profiles.map((profile, index) => (
          <div
            key={profile.id}
            draggable={!!onUpdateOrder}
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            className={`group bg-theme-bg-secondary border border-theme-border-primary hover:border-theme-brand-primary/30 hover:shadow-xl hover:shadow-theme-brand-primary/5 rounded-2xl p-4 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden ${!!onUpdateOrder ? 'cursor-grab active:cursor-grabbing' : ''} ${draggedProfileIndex === index ? 'opacity-50' : ''}`}
          >
            {/* Main Content Area */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Type Indicator Bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 ${profile.type === IpType.DHCP ? 'bg-indigo-500' : 'bg-orange-500'
                } group-hover:w-2`} />

              {/* Profile Info */}
              <div className="flex items-center gap-4 min-w-[200px]">
                <div className={`p-3 rounded-xl shrink-0 transition-transform duration-500 group-hover:scale-110 ${profile.type === IpType.DHCP
                  ? 'bg-theme-bg-tertiary text-sky-500'
                  : 'bg-theme-bg-tertiary text-orange-500'
                  }`}>
                  {profile.type === IpType.DHCP ? <Zap size={20} /> : <Server size={20} />}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-theme-text-primary leading-tight truncate">{profile.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-theme-text-muted uppercase tracking-wider">{profile.type === IpType.DHCP ? t.automaticMode : t.staticMode}</span>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="flex-1 min-w-0 md:border-l border-theme-border-secondary md:pl-6">
                {profile.type === IpType.STATIC && profile.config ? (
                  <div className="flex flex-wrap items-center gap-8">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest">{t.address}</span>
                      <span className="font-mono text-sm font-semibold text-theme-text-secondary mt-0.5">{profile.config.ipAddress}</span>
                    </div>
                    <div className="hidden sm:flex flex-col">
                      <span className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest">{t.gateway}</span>
                      <span className="font-mono text-sm font-semibold text-theme-text-secondary mt-0.5">{profile.config.gateway || '---'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-theme-text-muted italic">
                    <Activity size={14} className="text-sky-400" />
                    <span>{t.dhcpDescription}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => onApply(profile)}
                  disabled={isApplying || !isAdmin}
                  className={`neo-button flex-1 md:flex-none h-11 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-3 text-sm shadow-md disabled:opacity-50 ${!isAdmin
                    ? 'bg-theme-bg-tertiary text-theme-text-muted border border-theme-border-primary cursor-not-allowed'
                    : 'bg-theme-brand-primary hover:bg-theme-brand-hover text-white shadow-theme-brand-primary/20'
                    }`}
                >
                  {isApplying ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <>
                      <span>{t.applyProfile}</span>
                      <Check size={18} />
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(profile); }}
                    className="h-11 w-11 flex items-center justify-center rounded-xl text-theme-text-muted hover:bg-theme-bg-hover hover:text-theme-brand-primary transition-all border border-transparent hover:border-theme-border-secondary shrink-0"
                    title={t.edit}
                  >
                    <Edit2 size={18} />
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(profile.id); }}
                    className="h-11 w-11 flex items-center justify-center rounded-xl text-theme-text-muted hover:bg-rose-500/10 hover:text-rose-500 transition-all border border-transparent hover:border-rose-500/30 shrink-0"
                    title={t.delete}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Inventory Access Footer */}
            <div className="md:border-t border-theme-border-secondary pt-3 mt-1 flex justify-between items-center px-1">
              <div className="flex items-center gap-2">
                <Monitor size={14} className="text-theme-text-muted" />
                <span className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest font-mono">
                  {profile.devices?.length || 0} {t.savedDevices}
                </span>
              </div>
              <button
                onClick={() => onViewInventory(profile.id)}
                className="flex items-center gap-2 px-4 py-1.5 bg-theme-bg-tertiary text-theme-text-secondary rounded-lg text-[10px] font-bold hover:bg-theme-brand-primary hover:text-white transition-all border border-transparent hover:border-theme-brand-hover"
              >
                <Layout size={12} />
                {t.manageInventory}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
