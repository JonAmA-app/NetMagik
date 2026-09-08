import React, { useState, useEffect, useRef } from 'react';
import { Profile, IpType, Language } from '../types';
import { Trash2, Shield, Check, Zap, Server, Edit2, HelpCircle, ChevronRight, MousePointerClick, Settings, RefreshCw, Activity, Monitor, Layout, Folder, FolderOpen, ChevronDown } from 'lucide-react';
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
  highlightId?: string | null;
}

// ─── Single Profile Card ──────────────────────────────────────────────────────
const ProfileCard: React.FC<{
  profile: Profile;
  isApplying: boolean;
  isAdmin: boolean;
  language: Language;
  onApply: (p: Profile) => void;
  onEdit: (p: Profile) => void;
  onDelete: (id: string) => void;
  onViewInventory: (id: string) => void;
  draggable: boolean;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  highlighted: boolean;
}> = ({ profile, isApplying, isAdmin, language, onApply, onEdit, onDelete, onViewInventory, draggable, isDragging, onDragStart, onDragOver, onDrop, highlighted }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
  const cardRef = useRef<HTMLDivElement>(null);

  // Scroll into view when highlighted
  useEffect(() => {
    if (highlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [highlighted]);

  return (
    <div
      ref={cardRef}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`group bg-theme-bg-secondary border rounded-xl p-3 px-4 transition-all duration-300 flex flex-col gap-2.5 relative overflow-hidden
        ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}
        ${isDragging ? 'opacity-50' : ''}
        ${highlighted
          ? 'border-theme-brand-primary shadow-xl shadow-theme-brand-primary/25 ring-2 ring-theme-brand-primary/40 animate-pulse-highlight'
          : 'border-theme-border-primary hover:border-theme-brand-primary/30 hover:shadow-lg hover:shadow-theme-brand-primary/5'
        }`}
    >
      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Type Indicator Bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${profile.type === IpType.DHCP ? 'bg-indigo-500' : 'bg-orange-500'
          } group-hover:w-1.5`} />

        {/* Profile Info */}
        <div className="flex items-center gap-3 min-w-[180px]">
          <div className={`p-2 rounded-lg shrink-0 transition-transform duration-500 group-hover:scale-105 ${profile.type === IpType.DHCP
            ? 'bg-theme-bg-tertiary text-sky-500'
            : 'bg-theme-bg-tertiary text-orange-500'
            }`}>
            {profile.type === IpType.DHCP ? <Zap size={16} /> : <Server size={16} />}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-theme-text-primary leading-tight truncate">{profile.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-bold text-theme-text-muted uppercase tracking-wider">{profile.type === IpType.DHCP ? t.automaticMode : t.staticMode}</span>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="flex-1 min-w-0 md:border-l border-theme-border-secondary md:pl-4">
          {profile.type === IpType.STATIC && profile.config ? (
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-theme-text-muted uppercase tracking-widest">{t.address}</span>
                <span className="font-mono text-xs font-semibold text-theme-text-secondary mt-0.5">{profile.config.ipAddress}</span>
              </div>
              {profile.config.additionalIps && profile.config.additionalIps.length > 0 && (
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-theme-text-muted uppercase tracking-widest">
                    {(t as any).additionalIpsTitle || 'Additional IPs'}
                  </span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {profile.config.additionalIps.map((addIp, idx) => (
                      <span key={idx} className="font-mono text-[10px] bg-theme-bg-tertiary text-theme-text-secondary px-1.5 py-0.5 rounded border border-theme-border-secondary" title={`Subnet: ${addIp.subnetMask}`}>
                        {addIp.ipAddress}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="hidden sm:flex flex-col">
                <span className="text-[9px] font-bold text-theme-text-muted uppercase tracking-widest">{t.gateway}</span>
                <span className="font-mono text-xs font-semibold text-theme-text-secondary mt-0.5">{profile.config.gateway || '---'}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-theme-text-muted italic">
              <Activity size={12} className="text-sky-400" />
              <span>{t.dhcpDescription}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onApply(profile)}
            disabled={isApplying || !isAdmin}
            className={`neo-button flex-1 md:flex-none h-8 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-xs shadow-sm disabled:opacity-50 ${!isAdmin
              ? 'bg-theme-bg-tertiary text-theme-text-muted border border-theme-border-primary cursor-not-allowed'
              : 'bg-theme-brand-primary hover:bg-theme-brand-hover text-white shadow-theme-brand-primary/20'
              }`}
          >
            {isApplying ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <>
                <span>{t.applyProfile}</span>
                <Check size={14} />
              </>
            )}
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(profile); }}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-theme-text-muted hover:bg-theme-bg-hover hover:text-theme-brand-primary transition-all border border-transparent hover:border-theme-border-secondary shrink-0"
              title={t.edit}
            >
              <Edit2 size={15} />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onDelete(profile.id); }}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-theme-text-muted hover:bg-rose-500/10 hover:text-rose-500 transition-all border border-transparent hover:border-rose-500/30 shrink-0"
              title={t.delete}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Access Footer */}
      <div className="border-t border-theme-border-secondary/40 pt-2 mt-0.5 flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <Monitor size={12} className="text-theme-text-muted" />
          <span className="text-[9px] font-bold text-theme-text-muted uppercase tracking-widest font-mono">
            {profile.devices?.length || 0} {t.savedDevices}
          </span>
        </div>
        <button
          onClick={() => onViewInventory(profile.id)}
          className="flex items-center gap-1.5 px-3 py-1 bg-theme-bg-tertiary text-theme-text-secondary rounded-md text-[9px] font-bold hover:bg-theme-brand-primary hover:text-white transition-all border border-transparent hover:border-theme-brand-hover"
        >
          <Layout size={10} />
          {t.manageInventory}
        </button>
      </div>
    </div>
  );
};

export const ProfileList: React.FC<ProfileListProps> = ({
  profiles, onApply, onEdit, onDelete, isApplying, language, isAdmin, onViewInventory, onUpdateOrder, highlightId
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
  const [showHelp, setShowHelp] = useState(false);
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);
  const [draggedProfileId, setDraggedProfileId] = useState<string | null>(null);
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('collapsedFolders');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem('collapsedFolders', JSON.stringify([...collapsedFolders]));
  }, [collapsedFolders]);

  type Block =
    | { type: 'folder', id: string, name: string, profiles: Profile[], originalIndexes: number[] }
    | { type: 'profile', id: string, profile: Profile, originalIndex: number };

  const blocks: Block[] = [];
  const seenFolders = new Set<string>();

  profiles.forEach((p, index) => {
    const folderName = p.folder?.trim();
    if (folderName) {
      if (!seenFolders.has(folderName)) {
        seenFolders.add(folderName);
        const folderProfiles = profiles.map((px, idx) => ({ px, idx })).filter(x => x.px.folder?.trim() === folderName);
        blocks.push({
          type: 'folder',
          id: `folder-${folderName}`,
          name: folderName,
          profiles: folderProfiles.map(x => x.px),
          originalIndexes: folderProfiles.map(x => x.idx)
        });
      }
    } else {
      blocks.push({
        type: 'profile',
        id: `profile-${p.id}`,
        profile: p,
        originalIndex: index
      });
    }
  });

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedBlockIndex(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  };
  const handleDrop = (index: number) => {
    if (draggedBlockIndex === null || !onUpdateOrder) return;
    if (draggedBlockIndex === index) {
      setDraggedBlockIndex(null);
      return;
    }
    
    const newBlocks = [...blocks];
    const [dragged] = newBlocks.splice(draggedBlockIndex, 1);
    newBlocks.splice(index, 0, dragged);

    const newProfiles = newBlocks.flatMap(b => b.type === 'folder' ? b.profiles : [b.profile]);
    onUpdateOrder(newProfiles);
    setDraggedBlockIndex(null);
  };

  const handleCardDragStart = (e: React.DragEvent, profileId: string) => {
    e.stopPropagation();
    setDraggedProfileId(profileId);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleCardDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleCardDrop = (e: React.DragEvent, targetProfileId: string) => {
    e.stopPropagation();
    if (!draggedProfileId || draggedProfileId === targetProfileId || !onUpdateOrder) {
      setDraggedProfileId(null);
      return;
    }

    const fromIndex = profiles.findIndex(p => p.id === draggedProfileId);
    const toIndex = profiles.findIndex(p => p.id === targetProfileId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const updatedProfiles = [...profiles];
      const [moved] = updatedProfiles.splice(fromIndex, 1);
      updatedProfiles.splice(toIndex, 0, moved);
      onUpdateOrder(updatedProfiles);
    }
    setDraggedProfileId(null);
  };

  const toggleFolder = (folderName: string) => {
    setCollapsedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderName)) next.delete(folderName);
      else next.add(folderName);
      return next;
    });
  };

  const cardProps = (profile: Profile) => ({
    profile,
    isApplying,
    isAdmin,
    language,
    onApply,
    onEdit,
    onDelete,
    onViewInventory,
    draggable: !!onUpdateOrder,
    isDragging: draggedProfileId === profile.id,
    onDragStart: (e: React.DragEvent) => handleCardDragStart(e, profile.id),
    onDragOver: (e: React.DragEvent) => handleCardDragOver(e),
    onDrop: (e: React.DragEvent) => handleCardDrop(e, profile.id),
    highlighted: highlightId === profile.id,
  });

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
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

      <div className="flex flex-col gap-4">
        {blocks.map((block, index) => {
          if (block.type === 'folder') {
            const isCollapsed = collapsedFolders.has(block.name);
            return (
              <div 
                key={block.id} 
                className={`rounded-2xl border border-theme-border-primary overflow-hidden ${draggedBlockIndex === index ? 'opacity-50' : ''}`}
                draggable={!!onUpdateOrder}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
              >
                <button
                  onClick={() => toggleFolder(block.name)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 bg-theme-bg-secondary hover:bg-theme-bg-hover transition-colors group ${!!onUpdateOrder ? 'cursor-grab active:cursor-grabbing' : ''}`}
                >
                  {isCollapsed
                    ? <Folder size={16} className="text-theme-brand-primary shrink-0" />
                    : <FolderOpen size={16} className="text-theme-brand-primary shrink-0" />
                  }
                  <span className="flex-1 text-left text-sm font-bold text-theme-text-primary">{block.name}</span>
                  <span className="text-[10px] font-bold text-theme-text-muted bg-theme-bg-tertiary px-2 py-0.5 rounded-full">
                    {block.profiles.length}
                  </span>
                  <ChevronDown size={16} className={`text-theme-text-muted transition-transform duration-300 ${isCollapsed ? '-rotate-90' : ''}`} />
                </button>

                {!isCollapsed && (
                  <div className="p-3 pt-2 bg-theme-bg-primary/40 grid grid-cols-1 gap-3">
                    {block.profiles.map((profile) => (
                      <ProfileCard key={profile.id} {...cardProps(profile)} />
                    ))}
                  </div>
                )}
              </div>
            );
          } else {
            return (
              <div 
                key={block.id} 
                draggable={!!onUpdateOrder}
                onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, index); }}
                onDragOver={handleDragOver}
                onDrop={(e) => { e.stopPropagation(); handleDrop(index); }}
                className={`${draggedBlockIndex === index ? 'opacity-50' : ''} ${!!onUpdateOrder ? 'cursor-grab active:cursor-grabbing' : ''}`}
              >
                <ProfileCard {...cardProps(block.profile)} />
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

