import React, { useState } from 'react';
import { Language, AppSettings } from '../types';
import { TRANSLATIONS } from '../constants';
import {
  Settings,
  Star,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Check
} from 'lucide-react';

interface ToolsManagerProps {
  language: Language;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  availableTools: any[];
  onSelectTool: (id: string) => void;
}

export const ToolsManager: React.FC<ToolsManagerProps> = ({
  language,
  settings,
  onUpdateSettings,
  availableTools,
  onSelectTool
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [draggedToolId, setDraggedToolId] = useState<string | null>(null);

  // Sort tools according to current order in settings
  // If an ID is missing from toolOrder, push it to the end
  const orderedTools = [...availableTools].sort((a, b) => {
    const idxA = settings.toolOrder.indexOf(a.id);
    const idxB = settings.toolOrder.indexOf(b.id);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });

  const toggleFavorite = (e: React.MouseEvent, toolId: string) => {
    e.stopPropagation();
    const isFav = settings.favoriteTools.includes(toolId);
    let newFavs = [...settings.favoriteTools];

    if (isFav) {
      newFavs = newFavs.filter(id => id !== toolId);
    } else {
      newFavs.push(toolId);
    }

    onUpdateSettings({
      ...settings,
      favoriteTools: newFavs
    });
  };

  const moveTool = (toolId: string, targetIdx: number) => {
    // Create a complete order if tool is missing from toolOrder
    let currentOrder = [...settings.toolOrder];
    availableTools.forEach(tool => {
      if (!currentOrder.includes(tool.id)) currentOrder.push(tool.id);
    });

    const idx = currentOrder.indexOf(toolId);
    if (idx === -1) return;

    if (targetIdx < 0 || targetIdx >= currentOrder.length) return;

    const newOrder = [...currentOrder];
    const [movedItem] = newOrder.splice(idx, 1);
    newOrder.splice(targetIdx, 0, movedItem);

    onUpdateSettings({
      ...settings,
      toolOrder: newOrder
    });
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!isEditingOrder) return;
    window.getSelection()?.removeAllRanges();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    setDraggedToolId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isEditingOrder) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (targetId: string) => {
    if (!isEditingOrder || !draggedToolId || draggedToolId === targetId) return;

    // Resolve target index in the orderedTools array
    const targetIdx = settings.toolOrder.indexOf(targetId);
    moveTool(draggedToolId, targetIdx === -1 ? settings.toolOrder.length : targetIdx);
    setDraggedToolId(null);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500 select-none">
      <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-theme-brand-primary/10 text-theme-brand-primary rounded-xl shrink-0">
              <Settings size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-theme-text-primary select-none">{t.toolsManager}</h2>
              <p className="text-theme-text-muted text-sm mt-1 select-none">
                {t.manageToolsDesc}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              window.getSelection()?.removeAllRanges();
              setIsEditingOrder(!isEditingOrder);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border select-none shrink-0 cursor-pointer ${isEditingOrder
              ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-theme-bg-tertiary border-theme-border-primary text-theme-text-muted hover:bg-theme-bg-hover hover:text-theme-text-primary'
              }`}
          >
            {isEditingOrder ? <Check size={18} className="pointer-events-none" /> : <Edit3 size={18} className="pointer-events-none" />}
            <span className="select-none pointer-events-none">{isEditingOrder ? t.done : t.editOrder}</span>
          </button>
        </div>

        <div className="space-y-3">
          {orderedTools.map((tool, index) => {
            const isFav = settings.favoriteTools.includes(tool.id);
            const isDragging = draggedToolId === tool.id;

            return (
              <div
                key={tool.id}
                draggable={isEditingOrder}
                onDragStart={(e) => handleDragStart(e, tool.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(tool.id)}
                onDragEnd={() => setDraggedToolId(null)}
                onClick={() => !isEditingOrder && onSelectTool(tool.id)}
                className={`
                  relative flex items-center min-h-[72px] p-4 rounded-2xl border transition-all duration-300 group select-none
                  ${isEditingOrder ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer hover:shadow-lg hover:-translate-x-1'}
                  ${isEditingOrder ? 'border-theme-brand-primary bg-theme-brand-primary/10' : 'bg-theme-bg-tertiary border-theme-border-secondary hover:bg-theme-bg-primary'}
                  ${isDragging ? 'opacity-40 scale-[0.98] border-dashed border-theme-brand-primary' : 'opacity-100'}
                `}
              >
                {/* Tool Icon */}
                <div className={`p-3 rounded-xl mr-5 ${tool.colorClass.replace('text-', 'bg-').concat('/10')} ${tool.colorClass} group-hover:scale-110 transition-transform flex-shrink-0 pointer-events-none`}>
                  {React.cloneElement(tool.icon, { size: 24 })}
                </div>

                {/* Label & Description (placeholder for future) */}
                <div className="flex-1 min-w-0 pointer-events-none select-none">
                  <h4 className="font-black text-theme-text-primary text-base uppercase tracking-tight select-none">
                    {tool.label}
                  </h4>
                  <p className="text-[10px] text-theme-text-muted font-bold uppercase tracking-widest opacity-60 select-none">
                     SYSTEM TOOL
                  </p>
                </div>

                {/* Favorite Star */}
                 <button
                  onClick={(e) => toggleFavorite(e, tool.id)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={`
                    p-2 rounded-xl transition-all mr-2 select-none shrink-0
                    ${isFav ? 'text-amber-500 scale-110' : 'text-theme-text-tertiary hover:text-theme-text-muted'}
                  `}
                >
                  <Star size={20} fill={isFav ? 'currentColor' : 'none'} strokeWidth={isFav ? 0 : 2} className="pointer-events-none" />
                </button>

                {/* Reorder Arrows in Edit Mode */}
                {isEditingOrder && (
                  <div className="flex items-center gap-1.5 ml-4 animate-in fade-in slide-in-from-right-2 duration-200 select-none shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveTool(tool.id, index - 1); }}
                      onMouseDown={(e) => e.stopPropagation()}
                      disabled={index === 0}
                      className="p-2 bg-theme-bg-secondary border border-theme-border-primary rounded-xl shadow-sm text-theme-text-muted hover:text-theme-brand-primary disabled:opacity-20 select-none"
                    >
                      <ChevronLeft size={18} className="rotate-90 pointer-events-none" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveTool(tool.id, index + 1); }}
                      onMouseDown={(e) => e.stopPropagation()}
                      disabled={index === availableTools.length - 1}
                      className="p-2 bg-theme-bg-secondary border border-theme-border-primary rounded-xl shadow-sm text-theme-text-muted hover:text-theme-brand-primary disabled:opacity-20 select-none"
                    >
                      <ChevronRight size={18} className="rotate-90 pointer-events-none" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
