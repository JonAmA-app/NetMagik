
import React, { useState } from 'react';
import { ClipboardSnippet, Language } from '../types';
import { Copy, Plus, Trash2, Check, X, Clipboard as ClipboardIcon, Edit2, Save, Eye, EyeOff, Keyboard } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from './ConfirmModal';

interface ClipboardManagerProps {
  snippets: ClipboardSnippet[];
  onAdd: (snippet: ClipboardSnippet) => void;
  onUpdate: (snippet: ClipboardSnippet) => void;
  onDelete: (id: string) => void;
  onReorder?: (snippets: ClipboardSnippet[]) => void;
  language: Language;
  onRequirePassword?: (revealCallback: () => void) => boolean;
}

export const ClipboardManager: React.FC<ClipboardManagerProps> = ({
  snippets, onAdd, onUpdate, onDelete, onReorder, language, onRequirePassword
}) => {
  const { success } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [label, setLabel] = useState('');
  const [value, setValue] = useState('');
  const [shortcut, setShortcut] = useState('');
  const [autoPaste, setAutoPaste] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleSnippets, setVisibleSnippets] = useState<Record<string, boolean>>({});

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [snippetToDelete, setSnippetToDelete] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId || !onReorder) return;
    
    const draggedIndex = snippets.findIndex(s => s.id === draggedId);
    const targetIndex = snippets.findIndex(s => s.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const newSnippets = [...snippets];
    const [draggedSnippet] = newSnippets.splice(draggedIndex, 1);
    newSnippets.splice(targetIndex, 0, draggedSnippet);
    onReorder(newSnippets);
    setDraggedId(null);
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];

  const handleCopy = (snippet: ClipboardSnippet) => {
    navigator.clipboard.writeText(snippet.value);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId(null), 1500);

    success(t.clipboard, `${snippet.label}: ${snippet.value}`);

    if (snippet.autoPaste) {
    if (snippet.autoPaste) {
      if (window.electronAPI) {
        window.electronAPI.manualSnippetAction({
          autoPaste: snippet.autoPaste,
          value: snippet.value
        });
      }
    }
    }
  };

  const toggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const reveal = () => setVisibleSnippets(prev => ({ ...prev, [id]: !prev[id] }));

    if (!visibleSnippets[id] && onRequirePassword) {
      const locked = onRequirePassword(reveal);
      if (locked) return;
    }
    reveal();
  };

  const handleEditClick = (snippet: ClipboardSnippet, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(snippet.id);
    setLabel(snippet.label);
    setValue(snippet.value);
    setShortcut(snippet.shortcut || '');
    setAutoPaste(snippet.autoPaste || false);
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setLabel('');
    setValue('');
    setShortcut('');
    setAutoPaste(false);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (label && value) {
      if (editingId) {
        onUpdate({ id: editingId, label, value, shortcut, autoPaste });
      } else {
        onAdd({ id: Date.now().toString(), label, value, shortcut, autoPaste });
      }
      resetForm();
    }
  };

  const handleShortcutInput = (e: React.KeyboardEvent) => {
    e.preventDefault();
    if (e.key === 'Backspace' || e.key === 'Delete') {
      setShortcut('');
      return;
    }
    const keys = [];
    if (e.ctrlKey) keys.push('CommandOrControl');
    if (e.altKey) keys.push('Alt');
    if (e.shiftKey) keys.push('Shift');

    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
      let key = e.key.toUpperCase();
      if (key === ' ') key = 'Space';
      keys.push(key);
    }

    if (keys.length > 0 && !['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
      setShortcut(keys.join('+'));
    }
  };

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-theme-text-primary flex items-center gap-2">
          <ClipboardIcon className="text-theme-brand-primary" />
          {t.clipboard}
        </h3>
        <button
          onClick={() => {
            if (isFormOpen) { resetForm(); } else { setIsFormOpen(true); }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-theme-brand-primary hover:bg-theme-brand-hover text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-theme-brand-primary/20"
        >
          {isFormOpen ? <X size={16} /> : <Plus size={16} />}
          {isFormOpen ? t.cancel : t.addSnippet}
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-theme-bg-secondary w-full max-w-lg rounded-3xl border border-theme-border-primary shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-theme-border-primary/50 flex items-center justify-between bg-theme-bg-tertiary">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-theme-brand-primary/10 text-theme-brand-primary rounded-xl">
                  {editingId ? <Edit2 size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-theme-text-primary">{editingId ? t.edit : t.addSnippet}</h3>
                  <p className="text-xs text-theme-text-muted uppercase tracking-widest font-bold">{t.netmajikClipboard}</p>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-theme-bg-hover rounded-xl text-theme-text-muted transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-theme-text-muted uppercase tracking-wider">{t.snippetLabel}</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder={t.examplePassword}
                    className="w-full bg-theme-bg-tertiary border border-theme-border-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-theme-brand-primary text-theme-text-primary transition-all shadow-inner"
                    autoFocus
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-theme-text-muted uppercase tracking-wider">{t.snippetValue}</label>
                  <div className="relative">
                    <textarea
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={t.snippetValuePlaceholder || '...'}
                      className="w-full bg-theme-bg-tertiary border border-theme-border-primary rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-theme-brand-primary text-theme-text-primary min-h-[100px] resize-none transition-all shadow-inner"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-theme-text-muted uppercase tracking-wider">{t.shortcut}</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={shortcut}
                        onKeyDown={handleShortcutInput}
                        onChange={() => { }}
                        placeholder={t.clickToRecord}
                        className="w-full bg-theme-bg-tertiary border border-theme-border-primary rounded-xl pl-10 pr-4 py-3 text-sm font-mono focus:outline-none focus:border-theme-brand-primary text-theme-text-primary cursor-pointer transition-all shadow-inner"
                      />
                      <Keyboard size={18} className="absolute left-3.5 top-3.5 text-theme-text-muted pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col justify-end gap-3">
                    <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setAutoPaste(!autoPaste)}
                          className={`w-full py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${autoPaste ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-theme-bg-tertiary border-theme-border-primary text-theme-text-muted hover:border-emerald-500/50'}`}
                          title={t.autoPaste}
                        >
                          <Save size={16} />
                          <span className="text-[10px] font-bold uppercase">{t.autoPaste}</span>
                        </button>
                    </div>
                  </div>
                </div>
              </div>

              {autoPaste && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <div className={`p-4 rounded-2xl border bg-emerald-500/5 border-emerald-500/20 text-emerald-500 text-xs italic flex items-start gap-3`}>
                    <div className={`w-1.5 h-10 rounded-full shrink-0 bg-emerald-500`} />
                    <p className="leading-relaxed">
                      {t.autoPasteDesc}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 bg-theme-bg-tertiary text-theme-text-primary rounded-xl text-sm font-bold border border-theme-border-primary hover:bg-theme-bg-hover transition-all"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={!label || !value}
                  className="flex-[2] py-3 bg-theme-brand-primary hover:bg-theme-brand-hover text-white rounded-xl text-sm font-bold shadow-lg shadow-theme-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {editingId ? t.saveProfile : t.saveProfile}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {snippets.map((snippet) => (
          <div
            key={snippet.id}
            draggable={!!onReorder}
            onDragStart={(e) => handleDragStart(e, snippet.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, snippet.id)}
            onClick={() => handleCopy(snippet)}
            className={`group flex items-center justify-between p-3 bg-theme-bg-secondary border border-theme-border-primary hover:border-theme-brand-primary rounded-lg cursor-pointer transition-all duration-200 hover:bg-theme-bg-hover shadow-sm ${draggedId === snippet.id ? 'opacity-50 border-theme-brand-primary border-dashed' : ''}`}
          >
            <div className="flex-1 min-w-0 flex items-center gap-4">
              <div className={`p-2 rounded-lg transition-colors ${copiedId === snippet.id
                ? 'bg-emerald-500/20 text-emerald-500'
                : 'bg-theme-brand-primary/10 text-theme-brand-primary'
                }`}>
                {copiedId === snippet.id ? <Check size={18} /> : <Copy size={18} />}
              </div>

              <div className="flex-1 min-w-0 grid md:grid-cols-2 gap-4 items-center">
                <span className="font-semibold text-theme-text-primary truncate">
                  {snippet.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-theme-text-muted bg-theme-bg-tertiary px-2 py-0.5 rounded border border-theme-border-primary truncate max-w-full">
                    {visibleSnippets[snippet.id] ? snippet.value : '••••••••••••'}
                  </span>
                  {snippet.shortcut && (
                    <span className="text-[10px] bg-theme-brand-primary/10 text-theme-brand-primary px-1.5 py-0.5 rounded font-bold uppercase border border-theme-brand-primary/20 flex items-center gap-1">
                      <Keyboard size={10} />
                      {snippet.shortcut.replace('CommandOrControl', 'Ctrl')}
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    {snippet.autoPaste && (
                      <span className="p-1 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20" title={t.autoPaste}>
                        <Save size={10} />
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => toggleVisibility(snippet.id, e)}
                    className="p-1 text-theme-text-muted hover:text-theme-text-primary"
                  >
                    {visibleSnippets[snippet.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  {copiedId === snippet.id && (
                    <span className="text-xs text-emerald-500 font-bold animate-in fade-in zoom-in">{t.copied}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 pl-4 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleEditClick(snippet, e)}
                className="p-2 text-theme-text-muted hover:text-theme-brand-primary hover:bg-theme-bg-hover rounded-md transition-colors"
                title={t.edit}
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setSnippetToDelete(snippet.id); }}
                className="p-2 text-theme-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
                title={t.delete}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {snippets.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-theme-border-primary rounded-xl">
          <p className="text-theme-text-muted">{t.noSnippets}</p>
        </div>
      )}

      <ConfirmModal
        isOpen={!!snippetToDelete}
        onClose={() => setSnippetToDelete(null)}
        onConfirm={() => {
          if (snippetToDelete) {
            onDelete(snippetToDelete);
            setSnippetToDelete(null);
          }
        }}
        title={t.delete || "Delete"}
        message={t.deleteConfirm || "Are you sure you want to delete this snippet?"}
        confirmLabel={t.delete || "Delete"}
        cancelLabel={t.cancel || "Cancel"}
        variant="danger"
        t={t}
      />
    </div>
  );
};
