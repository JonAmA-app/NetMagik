import React, { useState } from 'react';
import { IpRangePreset } from '../types';
import { Search, Plus, Pencil, Trash2, X, Save, Zap, ChevronDown, ChevronUp } from 'lucide-react';

interface IpRangeButtonsProps {
  presets: IpRangePreset[];
  onUpdatePresets: (presets: IpRangePreset[]) => void;
  onFindAndAssign: (preset: IpRangePreset) => Promise<void>;
  isAssigning: boolean;
  assigningId: string | null;
  hasInterface: boolean;
  language: string;
  t: any;
}

const PRESET_COLORS = [
  { key: 'blue',   bg: 'bg-blue-600',   hover: 'hover:bg-blue-500',   ring: 'ring-blue-500/40',   text: 'text-blue-400',   badge: 'bg-blue-500/15 border-blue-500/30' },
  { key: 'emerald', bg: 'bg-emerald-600', hover: 'hover:bg-emerald-500', ring: 'ring-emerald-500/40', text: 'text-emerald-400', badge: 'bg-emerald-500/15 border-emerald-500/30' },
  { key: 'violet', bg: 'bg-violet-600',  hover: 'hover:bg-violet-500',  ring: 'ring-violet-500/40',  text: 'text-violet-400',  badge: 'bg-violet-500/15 border-violet-500/30' },
  { key: 'amber',  bg: 'bg-amber-600',   hover: 'hover:bg-amber-500',   ring: 'ring-amber-500/40',   text: 'text-amber-400',   badge: 'bg-amber-500/15 border-amber-500/30' },
  { key: 'rose',   bg: 'bg-rose-600',    hover: 'hover:bg-rose-500',    ring: 'ring-rose-500/40',    text: 'text-rose-400',    badge: 'bg-rose-500/15 border-rose-500/30' },
  { key: 'sky',    bg: 'bg-sky-600',     hover: 'hover:bg-sky-500',     ring: 'ring-sky-500/40',     text: 'text-sky-400',     badge: 'bg-sky-500/15 border-sky-500/30' },
];

const EMPTY_PRESET: Omit<IpRangePreset, 'id'> = {
  label: '',
  startIp: '',
  endIp: '',
  gateway: '',
  mask: '255.255.255.0',
  color: 'blue',
};

const getColor = (key?: string) =>
  PRESET_COLORS.find(c => c.key === key) || PRESET_COLORS[0];

export const IpRangeButtons: React.FC<IpRangeButtonsProps> = ({
  presets,
  onUpdatePresets,
  onFindAndAssign,
  isAssigning,
  assigningId,
  hasInterface,
  t,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<IpRangePreset | null>(null);
  const [form, setForm] = useState<Omit<IpRangePreset, 'id'>>(EMPTY_PRESET);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openAdd = () => {
    setEditingPreset(null);
    setForm(EMPTY_PRESET);
    setModalOpen(true);
  };

  const openEdit = (preset: IpRangePreset, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPreset(preset);
    setForm({ label: preset.label, startIp: preset.startIp, endIp: preset.endIp, gateway: preset.gateway, mask: preset.mask, color: preset.color });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.label.trim() || !form.startIp.trim() || !form.endIp.trim()) return;
    if (editingPreset) {
      onUpdatePresets(presets.map(p => p.id === editingPreset.id ? { ...p, ...form } : p));
    } else {
      onUpdatePresets([...presets, { id: Date.now().toString(), ...form }]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    onUpdatePresets(presets.filter(p => p.id !== id));
    setConfirmDeleteId(null);
  };

  return (
    <div className="border-t border-theme-border-primary bg-theme-bg-secondary">
      {/* Section header */}
      <button
        onClick={() => setIsExpanded(v => !v)}
        className="w-full flex items-center justify-between px-6 py-3 hover:bg-theme-bg-hover transition-colors group"
      >
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-amber-400" />
          <span className="text-xs font-bold text-theme-text-muted uppercase tracking-widest">
            {t.ipRangePresets || 'IP Range Buttons'}
          </span>
          {presets.length > 0 && (
            <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full font-bold">
              {presets.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); openAdd(); }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-theme-text-muted hover:text-theme-brand-primary hover:bg-theme-bg-tertiary transition-all"
            title={t.addRangePreset}
          >
            <Plus size={13} />
          </button>
          {isExpanded ? <ChevronUp size={13} className="text-theme-text-muted" /> : <ChevronDown size={13} className="text-theme-text-muted" />}
        </div>
      </button>

      {/* Preset buttons grid */}
      {isExpanded && (
        <div className="px-4 pb-4">
          {presets.length === 0 ? (
            <button
              onClick={openAdd}
              className="w-full border-2 border-dashed border-theme-border-primary rounded-xl py-3 px-4 text-xs text-theme-text-muted hover:border-theme-brand-primary/50 hover:text-theme-brand-primary transition-all flex items-center justify-center gap-2"
            >
              <Plus size={14} />
              {t.addRangePreset || 'Add Range Button'}
            </button>
          ) : (
            <div className="flex flex-wrap gap-2">
              {presets.map(preset => {
                const color = getColor(preset.color);
                const isCurrentlyAssigning = assigningId === preset.id;
                return (
                  <div key={preset.id} className="relative group/btn">
                    <button
                      onClick={() => !isAssigning && hasInterface && onFindAndAssign(preset)}
                      disabled={isAssigning || !hasInterface}
                      title={hasInterface
                        ? `${preset.startIp} → ${preset.endIp}${preset.gateway ? ` | GW: ${preset.gateway}` : ''}`
                        : t.presetNoInterface}
                      className={`
                        relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold text-white
                        transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                        ${color.bg} ${color.hover} shadow-md hover:shadow-lg hover:-translate-y-0.5
                        ring-2 ring-transparent hover:${color.ring} focus:outline-none focus:ring-2
                      `}
                    >
                      {isCurrentlyAssigning ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                      ) : (
                        <Search size={13} className="shrink-0" />
                      )}
                      <span className="max-w-[120px] truncate">
                        {isCurrentlyAssigning ? (t.presetSearching || 'Searching...') : preset.label}
                      </span>
                    </button>

                    {/* Hover action strip */}
                    <div className="absolute -top-2 right-0 hidden group-hover/btn:flex items-center gap-0.5 bg-theme-bg-secondary border border-theme-border-primary rounded-lg shadow-lg px-1 py-0.5 z-20">
                      <button
                        onClick={(e) => openEdit(preset, e)}
                        className="p-1 text-theme-text-muted hover:text-theme-brand-primary rounded transition-colors"
                        title={t.editRangePreset}
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(preset.id); }}
                        className="p-1 text-theme-text-muted hover:text-rose-400 rounded transition-colors"
                        title={t.deleteRangePreset}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add new inline */}
              <button
                onClick={openAdd}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border-2 border-dashed border-theme-border-primary text-theme-text-muted hover:border-theme-brand-primary/50 hover:text-theme-brand-primary transition-all hover:-translate-y-0.5"
              >
                <Plus size={12} />
              </button>
            </div>
          )}

          {presets.length > 0 && (
            <p className="text-[9px] text-theme-text-muted mt-2 px-1 leading-tight">
              {t.presetDesc || 'Scans the range, confirms free IPs via ping, then assigns the first available one.'}
            </p>
          )}
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-2xl p-6 shadow-2xl w-80 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/15 rounded-xl">
                <Trash2 size={18} className="text-rose-400" />
              </div>
              <h3 className="font-bold text-theme-text-primary">{t.deleteRangePreset || 'Delete'}</h3>
            </div>
            <p className="text-sm text-theme-text-muted">
              {presets.find(p => p.id === confirmDeleteId)?.label}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-2 rounded-xl border border-theme-border-primary text-sm font-bold text-theme-text-muted hover:bg-theme-bg-hover transition-all">
                {t.presetCancelBtn || 'Cancel'}
              </button>
              <button onClick={() => handleDelete(confirmDeleteId)} className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold transition-all">
                {t.deleteRangePreset || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div
            className="bg-theme-bg-secondary border border-theme-border-primary rounded-2xl shadow-2xl w-[440px] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border-primary">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/15 rounded-xl">
                  <Zap size={16} className="text-amber-400" />
                </div>
                <h2 className="font-bold text-theme-text-primary">
                  {editingPreset ? (t.editRangePreset || 'Edit Range Button') : (t.addRangePreset || 'Add Range Button')}
                </h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl text-theme-text-muted hover:bg-theme-bg-hover transition-all">
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Label */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest">
                  {t.presetLabel || 'Button Label'} <span className="text-rose-400">*</span>
                </label>
                <input
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="Oficina 192.168.1.x"
                  className="w-full bg-theme-bg-tertiary border border-theme-border-primary rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-theme-brand-primary/50 focus:border-theme-brand-primary outline-none transition-all text-theme-text-primary placeholder:text-theme-text-muted/40"
                  autoFocus
                />
              </div>

              {/* Start / End IP side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest">
                    {t.rangeStart || 'Start IP'} <span className="text-rose-400">*</span>
                  </label>
                  <input
                    value={form.startIp}
                    onChange={e => setForm(f => ({ ...f, startIp: e.target.value }))}
                    placeholder="192.168.1.10"
                    className="w-full bg-theme-bg-tertiary border border-theme-border-primary rounded-xl px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-theme-brand-primary/50 focus:border-theme-brand-primary outline-none transition-all text-theme-text-primary placeholder:text-theme-text-muted/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest">
                    {t.rangeEnd || 'End IP'} <span className="text-rose-400">*</span>
                  </label>
                  <input
                    value={form.endIp}
                    onChange={e => setForm(f => ({ ...f, endIp: e.target.value }))}
                    placeholder="192.168.1.100"
                    className="w-full bg-theme-bg-tertiary border border-theme-border-primary rounded-xl px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-theme-brand-primary/50 focus:border-theme-brand-primary outline-none transition-all text-theme-text-primary placeholder:text-theme-text-muted/40"
                  />
                </div>
              </div>

              {/* Gateway / Mask side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest">
                    {t.presetGateway || 'Gateway'}
                  </label>
                  <input
                    value={form.gateway}
                    onChange={e => setForm(f => ({ ...f, gateway: e.target.value }))}
                    placeholder="192.168.1.1"
                    className="w-full bg-theme-bg-tertiary border border-theme-border-primary rounded-xl px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-theme-brand-primary/50 focus:border-theme-brand-primary outline-none transition-all text-theme-text-primary placeholder:text-theme-text-muted/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest">
                    {t.presetMask || 'Subnet Mask'}
                  </label>
                  <input
                    value={form.mask}
                    onChange={e => setForm(f => ({ ...f, mask: e.target.value }))}
                    placeholder="255.255.255.0"
                    className="w-full bg-theme-bg-tertiary border border-theme-border-primary rounded-xl px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-theme-brand-primary/50 focus:border-theme-brand-primary outline-none transition-all text-theme-text-primary placeholder:text-theme-text-muted/40"
                  />
                </div>
              </div>

              {/* Color picker */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c.key}
                      onClick={() => setForm(f => ({ ...f, color: c.key }))}
                      className={`w-7 h-7 rounded-lg ${c.bg} transition-all border-2 ${form.color === c.key ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      title={c.key}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              {form.label && (
                <div className="rounded-xl bg-theme-bg-tertiary border border-theme-border-primary p-3 flex items-center gap-3">
                  <span className="text-[10px] text-theme-text-muted font-bold uppercase tracking-widest">Preview</span>
                  <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold text-white ${getColor(form.color).bg} shadow-md`}>
                    <Search size={13} />
                    <span className="max-w-[140px] truncate">{form.label}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-theme-bg-primary border-t border-theme-border-primary flex gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-theme-border-primary text-sm font-bold text-theme-text-muted hover:bg-theme-bg-hover transition-all"
              >
                {t.presetCancelBtn || 'Cancel'}
              </button>
              <button
                onClick={handleSave}
                disabled={!form.label.trim() || !form.startIp.trim() || !form.endIp.trim()}
                className="flex-1 py-2.5 rounded-xl bg-theme-brand-primary hover:bg-theme-brand-hover text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 transition-all shadow-lg shadow-theme-brand-primary/20"
              >
                <Save size={14} />
                {t.presetSaveBtn || 'Save Button'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
