import React, { useState } from 'react';
import { Monitor, Plus, Clipboard as ClipboardIcon, LayoutGrid, Layout, Globe, Edit2, CheckSquare, Square, Trash2, Camera, Printer, Network, Terminal, Shield } from 'lucide-react';
import { Profile } from '../types';
import { TRANSLATIONS } from '../constants';
import { InputModal } from './InputModal';
import { ConfirmModal } from './ConfirmModal';

interface InventoryManagerProps {
  profileId: string | null;
  onClose: () => void;
  profiles: Profile[];
  setProfiles: (profiles: Profile[] | ((prev: Profile[]) => Profile[])) => void;
  language: 'en' | 'es' | string;
  onSuccess: (msg: string) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  profileId, onClose, profiles, setProfiles, language, onSuccess
}) => {
  const [layout, setLayout] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'ip'>('ip');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterVendor, setFilterVendor] = useState<string>('all');
  
  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [targetId, setTargetId] = useState<string>('');
  const [valName, setValName] = useState('');
  const [valIp, setValIp] = useState('');
  const [valClass, setValClass] = useState('');

  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS['en'];
  
  if (!profileId) return null;
  const profile = profiles.find(p => p.id === profileId);
  if (!profile) return null;

  const devices = profile.devices || [];

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === devices.length && devices.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(devices.map(d => d.id));
    }
  };

  const deleteSelected = () => {
    if (selectedIds.length === 0) return;
    setProfiles(prev => prev.map(p => p.id === profileId ? {
      ...p, devices: p.devices?.filter(d => !selectedIds.includes(d.id))
    } : p));
    setSelectedIds([]);
    onSuccess('Selected devices removed');
  };

  const deleteAll = () => {
    setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, devices: [] } : p));
    setConfirmDeleteAll(false);
    setSelectedIds([]);
    onSuccess('All devices removed');
  };

  const exportCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + ["Name,IP,MAC,Vendor,Class"].join(",") + "\n"
      + devices.map(d => `${d.name},${d.ip},${d.mac || ''},${d.vendor || ''},${d.customClass || d.type || ''}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${profile.name}_inventory.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleModalConfirm = (name: string, ip?: string, customClass?: string) => {
    if (modalType === 'edit') {
      setProfiles(prev => prev.map(p => p.id === profileId ? {
        ...p,
        devices: p.devices?.map(d => d.id === targetId ? { ...d, name, ip: ip || d.ip, customClass } : d)
      } : p));
      onSuccess(t.deviceUpdated || 'Device updated');
    } else {
      setProfiles(prev => prev.map(p => p.id === profileId ? {
        ...p,
        devices: [...(p.devices || []), { id: Date.now().toString(), name, ip: ip || '', customClass, type: 'Unknown' }]
      } : p));
      onSuccess(t.deviceAdded || 'Device added');
    }
  };

  const uniqueClasses = Array.from(new Set(devices.map(d => d.customClass || 'Unknown').filter(Boolean))).sort();
  const uniqueVendors = Array.from(new Set(devices.map(d => d.vendor || 'Unknown').filter(Boolean))).sort();

  const filteredDevices = devices.filter(d => {
    const dClass = d.customClass || 'Unknown';
    const dVendor = d.vendor || 'Unknown';
    if (filterClass !== 'all' && filterClass !== dClass) return false;
    if (filterVendor !== 'all' && filterVendor !== dVendor) return false;
    return true;
  });

  const sortedDevices = [...filteredDevices].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    const ipA = a.ip.split('.').map(Number);
    const ipB = b.ip.split('.').map(Number);
    for (let i = 0; i < 4; i++) {
      if (ipA[i] !== ipB[i]) return (ipA[i] || 0) - (ipB[i] || 0);
    }
    return 0;
  });

  const getDeviceIcon = (className?: string) => {
    if (!className) return <Monitor size={18} />;
    const lower = className.toLowerCase();
    if (lower.includes('camera') || lower.includes('cam')) return <Camera size={18} />;
    if (lower.includes('printer') || lower.includes('print')) return <Printer size={18} />;
    if (lower.includes('switch') || lower.includes('hub')) return <Network size={18} />;
    if (lower.includes('server') || lower.includes('host')) return <Terminal size={18} />;
    if (lower.includes('firewall') || lower.includes('security')) return <Shield size={18} />;
    return <Monitor size={18} />;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-theme-bg-primary/70 backdrop-blur-md animate-fade-in">
      <div className="bg-theme-bg-secondary w-[95%] max-w-7xl rounded-3xl shadow-2xl border border-theme-border-primary overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-theme-border-secondary flex justify-between items-center bg-theme-bg-tertiary">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-theme-brand-primary text-white rounded-2xl shadow-lg shadow-theme-brand-primary/20">
              <Monitor size={24} />
            </div>
            <div>
              <h3 className="font-bold text-xl text-theme-text-primary">{t.inventory}</h3>
              <p className="text-theme-text-muted text-xs">{t.manageInventory || 'Manage'}: <span className="text-theme-brand-primary font-bold">{profile.name}</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mr-2">
              <button onClick={() => setSortBy('name')} title={t.sortByName} className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${sortBy === 'name' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-500' : 'text-slate-400'}`}>AZ</button>
              <button onClick={() => setSortBy('ip')} title={t.sortByIp} className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${sortBy === 'ip' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-500' : 'text-slate-400'}`}>IP</button>
            </div>

            <button onClick={exportCsv} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 font-bold text-xs flex items-center gap-2">
              <ClipboardIcon size={14} /> {t.exportCsv || 'Export CSV'}
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mr-2">
              <button onClick={() => setLayout('grid')} className={`p-1.5 rounded-md transition-all ${layout === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-500' : 'text-slate-400'}`}><LayoutGrid size={14} /></button>
              <button onClick={() => setLayout('list')} className={`p-1.5 rounded-md transition-all ${layout === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-500' : 'text-slate-400'}`}><Layout size={14} /></button>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400">
              <Plus size={24} className="rotate-45" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-3 px-6 bg-theme-bg-secondary border-b border-theme-border-primary flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm text-theme-text-muted hover:text-theme-text-primary transition-colors">
              {selectedIds.length === devices.length && devices.length > 0 ? <CheckSquare size={16} className="text-theme-brand-primary" /> : <Square size={16} />}
              {t.selectAll}
            </button>
            <div className="h-4 w-px bg-theme-border-primary"></div>
            
            <div className="flex items-center gap-2">
               <span className="text-[10px] uppercase font-bold text-theme-text-muted">{t.class}:</span>
               <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="bg-theme-bg-tertiary border border-theme-border-primary rounded cursor-pointer text-xs p-1 text-theme-text-primary outline-none focus:border-theme-brand-primary">
                 <option value="all">{t.all || 'All'}</option>
                 {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
            </div>

            <div className="flex items-center gap-2">
               <span className="text-[10px] uppercase font-bold text-theme-text-muted">{t.vendor}:</span>
               <select value={filterVendor} onChange={e => setFilterVendor(e.target.value)} className="bg-theme-bg-tertiary border border-theme-border-primary rounded cursor-pointer text-xs p-1 text-theme-text-primary outline-none focus:border-theme-brand-primary">
                 <option value="all">{t.all || 'All'}</option>
                 {uniqueVendors.map(v => <option key={v} value={v}>{v}</option>)}
               </select>
            </div>

          </div>
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
                <button onClick={deleteSelected} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-bold transition-all">
                  <Trash2 size={14} /> {t.delete} {t.select} ({selectedIds.length})
                </button>
            )}
            <button onClick={() => setConfirmDeleteAll(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 text-white hover:bg-rose-600 rounded-lg text-xs font-bold transition-all shadow-md">
               <Trash2 size={14} /> {t.deleteAll}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-theme-bg-primary">

          {layout === 'grid' ? (
            /* Grid view */
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedDevices.map(device => (
                <div key={device.id} className="bg-theme-bg-tertiary border border-theme-border-primary rounded-2xl p-4 flex flex-col group hover:border-theme-brand-primary/30 transition-all gap-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleSelect(device.id)} className="text-theme-text-muted hover:text-theme-brand-primary shrink-0">
                      {selectedIds.includes(device.id) ? <CheckSquare size={16} className="text-theme-brand-primary" /> : <Square size={16} />}
                    </button>
                    <div className="p-2 rounded-xl bg-theme-bg-secondary shadow-sm text-theme-text-muted group-hover:text-theme-brand-primary transition-colors shrink-0">
                      {getDeviceIcon(device.customClass || device.type)}
                    </div>
                    <p className="font-bold text-theme-text-primary truncate">{device.name}</p>
                  </div>
                  <div className="pl-10 space-y-1">
                    <p className="text-xs font-mono text-theme-text-muted">{device.ip}</p>
                    {device.vendor && <span className="inline-block px-1.5 py-0.5 bg-sky-500/10 text-sky-500 rounded text-[9px] uppercase font-sans tracking-wide">{device.vendor}</span>}
                    {device.customClass && <span className="inline-block px-1.5 py-0.5 bg-purple-500/10 text-purple-500 rounded text-[9px] uppercase font-sans tracking-wide ml-1">{device.customClass}</span>}
                  </div>
                  <div className="flex gap-1 justify-end border-t border-theme-border-primary/50 pt-2 mt-auto">
                    <button onClick={() => window.open(`http://${device.ip}`, '_blank')} title={t.openWeb} className="p-1.5 text-theme-text-muted hover:text-theme-brand-primary hover:bg-theme-bg-secondary rounded-lg transition-all"><Globe size={14} /></button>
                    <button onClick={() => { setModalType('edit'); setTargetId(device.id); setValName(device.name); setValIp(device.ip); setValClass(device.customClass || ''); setModalOpen(true); }} title={t.editDevice || 'Edit'} className="p-1.5 text-theme-text-muted hover:text-theme-brand-primary hover:bg-theme-bg-secondary rounded-lg transition-all"><Edit2 size={14} /></button>
                  </div>
                </div>
              ))}
              <button onClick={() => { setModalType('add'); setValName(''); setValIp(''); setValClass(''); setModalOpen(true); }}
                className="border-2 border-dashed border-theme-border-primary rounded-2xl p-6 flex flex-col items-center justify-center text-theme-text-muted hover:border-theme-brand-primary hover:text-theme-brand-primary transition-all group min-h-[140px]">
                <Plus size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">{t.addDevice || 'Add Device'}</span>
              </button>
            </div>
          ) : (
            /* List / Table view */
            <table className="w-full text-sm">
              <thead className="bg-theme-bg-tertiary border-b border-theme-border-primary sticky top-0 z-10">
                <tr>
                  <th className="w-8 py-3 px-4">
                    <button onClick={toggleSelectAll} className="text-theme-text-muted hover:text-theme-brand-primary transition-colors">
                      {selectedIds.length === devices.length && devices.length > 0 ? <CheckSquare size={15} className="text-theme-brand-primary" /> : <Square size={15} />}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest text-theme-text-muted">{t.name}</th>
                  <th className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest text-theme-text-muted">{t.ipAddress}</th>
                  <th className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest text-theme-text-muted">{t.vendor}</th>
                  <th className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest text-theme-text-muted">{t.class}</th>
                  <th className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest text-theme-text-muted">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {sortedDevices.map((device, idx) => (
                  <tr key={device.id} className={`border-b border-theme-border-primary/50 hover:bg-theme-bg-tertiary transition-colors group ${ idx % 2 === 0 ? '' : 'bg-theme-bg-primary/40'}`}>
                    <td className="py-2.5 px-4">
                      <button onClick={() => toggleSelect(device.id)} className="text-theme-text-muted hover:text-theme-brand-primary">
                        {selectedIds.includes(device.id) ? <CheckSquare size={15} className="text-theme-brand-primary" /> : <Square size={15} />}
                      </button>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-theme-text-muted group-hover:text-theme-brand-primary transition-colors">{getDeviceIcon(device.customClass || device.type)}</span>
                        <span className="font-bold text-theme-text-primary truncate max-w-[160px]">{device.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-theme-text-muted text-xs">{device.ip}</td>
                    <td className="py-2.5 px-4">
                      {device.vendor
                        ? <span className="px-2 py-0.5 bg-sky-500/10 text-sky-500 rounded-full text-[10px] uppercase font-bold tracking-wide">{device.vendor}</span>
                        : <span className="text-theme-text-muted/30 text-xs">—</span>
                      }
                    </td>
                    <td className="py-2.5 px-4">
                      {device.customClass
                        ? <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 rounded-full text-[10px] uppercase font-bold tracking-wide">{device.customClass}</span>
                        : <span className="text-theme-text-muted/30 text-xs">—</span>
                      }
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => window.open(`http://${device.ip}`, '_blank')} title={t.openWeb} className="p-1.5 text-theme-text-muted hover:text-theme-brand-primary hover:bg-theme-bg-secondary rounded-lg transition-all"><Globe size={14} /></button>
                        <button onClick={() => { setModalType('edit'); setTargetId(device.id); setValName(device.name); setValIp(device.ip); setValClass(device.customClass || ''); setModalOpen(true); }} title={t.editDevice || 'Edit'} className="p-1.5 text-theme-text-muted hover:text-theme-brand-primary hover:bg-theme-bg-secondary rounded-lg transition-all"><Edit2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={6} className="p-3">
                    <button onClick={() => { setModalType('add'); setValName(''); setValIp(''); setValClass(''); setModalOpen(true); }}
                      className="w-full py-3 border-2 border-dashed border-theme-border-primary rounded-xl flex items-center justify-center gap-2 text-theme-text-muted hover:border-theme-brand-primary hover:text-theme-brand-primary transition-all text-xs font-bold uppercase tracking-widest">
                      <Plus size={16} /> {t.addDevice || 'Add Device'}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-theme-bg-tertiary border-t border-theme-border-secondary flex justify-end">
          <button onClick={onClose} className="px-8 py-3 bg-theme-brand-primary hover:bg-theme-brand-hover text-white rounded-xl font-bold shadow-lg transition-all hover:scale-105">{t.closeInventory || 'Close'}</button>
        </div>

        {/* Modals */}
        <InputModal
          t={t}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={modalType === 'edit' ? (t.editDevice || 'Edit Device') : (t.addDevice || 'Add Device')}
          confirmLabel={t.save || 'Save'}
          cancelLabel={t.cancel || 'Cancel'}
          defaultValue={valName}
          secondaryDefaultValue={valIp}
          tertiaryDefaultValue={valClass}
          placeholder={t.deviceName || 'Name'}
          secondaryPlaceholder={t.deviceIp || 'IP'}
          tertiaryPlaceholder={t.customClassPlaceholder}
          onConfirm={handleModalConfirm}
        />

        <ConfirmModal
            isOpen={confirmDeleteAll}
            onClose={() => setConfirmDeleteAll(false)}
            onConfirm={deleteAll}
            title={t.deleteAll}
            message={t.deleteConfirm}
            confirmLabel={t.delete}
            cancelLabel={t.cancel}
            variant="danger"
            t={t}
        />

      </div>
    </div>
  );
};
