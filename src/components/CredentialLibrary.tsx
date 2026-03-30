
import React, { useState } from 'react';
import { DeviceCredential, Language, Profile } from '../types';
import { TRANSLATIONS } from '../constants';
import { useToast } from '../context/ToastContext';
import { Search, Copy, Check, Server, Router, Wifi, Camera, HardDrive, CircleDot, Plus, Edit2, Trash2, X, Save, KeyRound, Zap } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface CredentialLibraryProps {
  language: Language;
  credentials: DeviceCredential[];
  onAdd: (cred: DeviceCredential) => void;
  onUpdate: (cred: DeviceCredential) => void;
  onDelete: (id: string) => void;
  onApplyProfile: (profile: Profile) => void; // Legacy, kept for typing compatibility if needed
  onAutoConnect: (targetIp: string) => void; // NEW: Smart connection
}

export const CredentialLibrary: React.FC<CredentialLibraryProps> = ({
  language,
  credentials,
  onAdd,
  onUpdate,
  onDelete,
  onAutoConnect
}) => {
  const { success, warning } = useToast();
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'ip'>('name');
  const [credToDelete, setCredToDelete] = useState<{ id: string, name: string } | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<DeviceCredential, 'id'>>({
    vendor: '',
    model: '',
    ip: '',
    username: 'admin',
    password: '',
    type: 'Other'
  });

  const filteredCredentials = credentials
    .filter(cred => {
      const search = searchTerm.toLowerCase();
      return (
        cred.vendor.toLowerCase().includes(search) ||
        cred.model.toLowerCase().includes(search) ||
        cred.ip.includes(search)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.vendor.localeCompare(b.vendor);
      } else {
        // Simple IP sorting
        return a.ip.localeCompare(b.ip, undefined, { numeric: true });
      }
    });

  const handleCopy = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
    success(t.copied, `${label}: ${text}`);
  };

  const getIcon = (type: DeviceCredential['type']) => {
    switch (type) {
      case 'Router': return <Router size={20} className="text-theme-brand-primary" />;
      case 'Switch': return <Server size={20} className="text-theme-brand-primary" />;
      case 'AP': return <Wifi size={20} className="text-theme-brand-primary" />;
      case 'Camera': return <Camera size={20} className="text-emerald-500" />;
      case 'Modem': return <HardDrive size={20} className="text-orange-500" />;
      default: return <CircleDot size={20} className="text-theme-text-muted" />;
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ vendor: '', model: '', ip: '', username: 'admin', password: '', type: 'Other' });
    setIsModalOpen(true);
  };

  const openEditModal = (cred: DeviceCredential) => {
    setEditingId(cred.id);
    setFormData({ ...cred });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate({ ...formData, id: editingId });
      success(t.saveSuccess);
    } else {
      onAdd({ ...formData, id: Date.now().toString() });
      success(t.saveSuccess);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500 pt-0">
      {/* Header & Search */}
      <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-theme-text-primary flex items-center gap-2">
              <KeyRound size={28} className="text-theme-brand-primary" />
              {t.credentialLibrary}
            </h2>
            <p className="text-sm text-theme-text-muted mt-1">
              {t.credDesc}
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-theme-brand-primary hover:bg-theme-brand-hover text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-theme-brand-primary/20"
          >
            <Plus size={18} />
            {t.addDevice}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-3 text-theme-text-muted">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder={t.searchDevice}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-theme-bg-tertiary border border-theme-border-primary rounded-xl text-base focus:outline-none focus:border-theme-brand-primary text-theme-text-primary placeholder-theme-text-muted transition-colors"
            />
          </div>
          <div className="flex bg-theme-bg-tertiary rounded-xl p-1 border border-theme-border-primary">
            <button
              onClick={() => setSortBy('name')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${sortBy === 'name' ? 'bg-theme-brand-primary text-white shadow-sm' : 'text-theme-text-muted hover:text-theme-text-primary'}`}
            >
              {t.sortByName}
            </button>
            <button
              onClick={() => setSortBy('ip')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${sortBy === 'ip' ? 'bg-theme-brand-primary text-white shadow-sm' : 'text-theme-text-muted hover:text-theme-text-primary'}`}
            >
              {t.sortByIp}
            </button>
          </div>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCredentials.length > 0 ? (
          filteredCredentials.map(cred => (
            <div
              key={cred.id}
              className="bg-theme-bg-secondary border border-theme-border-primary rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group relative"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-theme-bg-tertiary rounded-lg">
                    {getIcon(cred.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-theme-text-primary">{cred.vendor}</h3>
                    <p className="text-xs text-theme-text-muted">{cred.model}</p>
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(cred)}
                    className="p-2 text-theme-text-muted hover:text-theme-brand-primary hover:bg-theme-bg-hover rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setCredToDelete({ id: cred.id, name: cred.vendor })}
                    className="p-2 text-theme-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => onAutoConnect(cred.ip)}
                    className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 rounded-lg transition-colors"
                    title={t.smartConnectTooltip}
                  >
                    <Zap size={16} fill="currentColor" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 bg-theme-bg-tertiary rounded-lg p-3 border border-theme-border-secondary">
                {/* IP Row */}
                <div className="flex justify-between items-center group/item">
                  <span className="text-xs font-semibold text-theme-text-muted uppercase w-16">{t.ipAddress}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-medium text-theme-text-primary">{cred.ip}</span>
                    <button
                      onClick={() => handleCopy(cred.ip, `ip-${cred.id}`, t.ipAddress)}
                      className="opacity-0 group-hover/item:opacity-100 transition-opacity text-theme-text-muted hover:text-theme-brand-primary"
                    >
                      {copiedId === `ip-${cred.id}` ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {/* User Row */}
                <div className="flex justify-between items-center group/item">
                  <span className="text-xs font-semibold text-theme-text-muted uppercase w-16">{t.username}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-theme-text-secondary">{cred.username}</span>
                    <button
                      onClick={() => handleCopy(cred.username, `user-${cred.id}`, t.username)}
                      className="opacity-0 group-hover/item:opacity-100 transition-opacity text-theme-text-muted hover:text-theme-brand-primary"
                    >
                      {copiedId === `user-${cred.id}` ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {/* Pass Row */}
                <div className="flex justify-between items-center group/item">
                  <span className="text-xs font-semibold text-theme-text-muted uppercase w-16">{t.password}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-theme-text-secondary">{cred.password}</span>
                    <button
                      onClick={() => handleCopy(cred.password, `pass-${cred.id}`, t.password)}
                      className="opacity-0 group-hover/item:opacity-100 transition-opacity text-theme-text-muted hover:text-theme-brand-primary"
                    >
                      {copiedId === `pass-${cred.id}` ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-theme-text-muted bg-theme-bg-secondary border border-dashed border-theme-border-primary rounded-xl">
            <Search size={32} className="mx-auto mb-2 opacity-20" />
            <p>{t.noCredentialsFound}</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-theme-bg-secondary border border-theme-border-primary rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-theme-border-secondary bg-theme-bg-tertiary">
              <h3 className="font-semibold text-theme-text-primary flex items-center gap-2">
                {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
                {editingId ? t.edit : t.addDevice}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-theme-text-muted hover:text-theme-text-primary">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-theme-text-muted uppercase">{t.vendor}</label>
                  <input
                    required type="text"
                    value={formData.vendor} onChange={e => setFormData({ ...formData, vendor: e.target.value })}
                    className="w-full bg-theme-bg-primary border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-theme-brand-primary text-theme-text-primary"
                    placeholder={t.exampleVendor}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-theme-text-muted uppercase">{t.model}</label>
                  <input
                    type="text"
                    value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-theme-bg-primary border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-theme-brand-primary text-theme-text-primary"
                    placeholder={t.exampleModel}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-theme-text-muted uppercase">{t.ipAddress}</label>
                  <input
                    required type="text"
                    value={formData.ip} onChange={e => setFormData({ ...formData, ip: e.target.value })}
                    className="w-full bg-theme-bg-primary border border-theme-border-primary rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-theme-brand-primary text-theme-text-primary"
                    placeholder={t.exampleIp}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-theme-text-muted uppercase">{t.deviceType}</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as DeviceCredential['type'] })}
                    className="w-full bg-theme-bg-primary border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-theme-brand-primary text-theme-text-primary"
                  >
                    <option value="Camera">{t.typeCamera}</option>
                    <option value="Router">{t.typeRouter}</option>
                    <option value="Switch">{t.typeSwitch}</option>
                    <option value="AP">{t.typeAP}</option>
                    <option value="Modem">{t.typeModem}</option>
                    <option value="Other">{t.typeOther}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-theme-text-muted uppercase">{t.username}</label>
                  <input
                    type="text"
                    value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-theme-bg-primary border border-theme-border-primary rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-theme-brand-primary text-theme-text-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-theme-text-muted uppercase">{t.password}</label>
                  <input
                    type="text"
                    value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-theme-bg-primary border border-theme-border-primary rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-theme-brand-primary text-theme-text-primary"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-theme-bg-tertiary rounded-lg text-theme-text-secondary hover:bg-theme-bg-hover">
                  {t.cancel}
                </button>
                <button type="submit" className="flex-1 py-2 bg-theme-brand-primary hover:bg-theme-brand-hover text-white rounded-lg flex items-center justify-center gap-2">
                  <Save size={16} />
                  {t.saveDevice}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!credToDelete}
        onClose={() => setCredToDelete(null)}
        onConfirm={() => {
          if (credToDelete) {
            onDelete(credToDelete.id);
            warning(t.delete || 'Deleted', credToDelete.name);
            setCredToDelete(null);
          }
        }}
        title={t.delete || 'Delete'}
        message={t.deleteConfirm || 'Are you sure?'}
        confirmLabel={t.delete || 'Delete'}
        cancelLabel={t.cancel || 'Cancel'}
        variant="danger"
        t={t}
      />
    </div>
  );
};
