import React, { useState, useEffect } from 'react';
import { OnboardingTourConfig, Language } from '../types';
import { Sparkles, ArrowRight, ArrowLeft, X, Check } from 'lucide-react';

interface OnboardingTourProps {
  tour: OnboardingTourConfig;
  language: Language;
  onComplete: (tourId: string) => void;
  onSkip: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  tour,
  language,
  onComplete,
  onSkip
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const isEs = language === 'es';

  const currentStep = tour.steps[currentStepIndex];
  const totalSteps = tour.steps.length;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Track target element position & scrolling
  useEffect(() => {
    const updateTargetRect = () => {
      if (!currentStep?.targetSelector) {
        setTargetRect(null);
        return;
      }

      const el = document.querySelector(currentStep.targetSelector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    };

    updateTargetRect();
    const handleResize = () => updateTargetRect();
    const handleScroll = () => updateTargetRect();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    const timer = setTimeout(updateTargetRect, 200);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      clearTimeout(timer);
    };
  }, [currentStepIndex, currentStep?.targetSelector]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSkip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (isLastStep) {
          onComplete(tour.id);
        } else {
          setCurrentStepIndex(prev => Math.min(prev + 1, totalSteps - 1));
        }
      } else if (e.key === 'ArrowLeft' && currentStepIndex > 0) {
        setCurrentStepIndex(prev => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex, isLastStep, totalSteps, tour.id, onComplete, onSkip]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete(tour.id);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  // Helper to render bold markdown in text
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-theme-brand-primary font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Calculate tooltip position relative to spotlight
  const getTooltipStyle = () => {
    if (!targetRect) {
      // Centered fallback
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '480px'
      };
    }

    const padding = 16;
    const tooltipWidth = 420;
    const tooltipHeight = 220;

    let top = 0;
    let left = 0;

    const pos = currentStep.position || 'bottom';

    if (pos === 'bottom') {
      top = targetRect.bottom + padding;
      left = Math.max(padding, Math.min(window.innerWidth - tooltipWidth - padding, targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2)));
      if (top + tooltipHeight > window.innerHeight) {
        top = Math.max(padding, targetRect.top - tooltipHeight - padding);
      }
    } else if (pos === 'top') {
      top = Math.max(padding, targetRect.top - tooltipHeight - padding);
      left = Math.max(padding, Math.min(window.innerWidth - tooltipWidth - padding, targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2)));
    } else if (pos === 'right') {
      left = targetRect.right + padding;
      top = Math.max(padding, Math.min(window.innerHeight - tooltipHeight - padding, targetRect.top));
      if (left + tooltipWidth > window.innerWidth) {
        left = Math.max(padding, targetRect.left - tooltipWidth - padding);
      }
    } else if (pos === 'left') {
      left = Math.max(padding, targetRect.left - tooltipWidth - padding);
      top = Math.max(padding, Math.min(window.innerHeight - tooltipHeight - padding, targetRect.top));
    } else {
      top = targetRect.bottom + padding;
      left = targetRect.left;
    }

    return {
      top: `${Math.max(16, Math.min(window.innerHeight - 250, top))}px`,
      left: `${Math.max(16, Math.min(window.innerWidth - tooltipWidth - 16, left))}px`,
      maxWidth: `${tooltipWidth}px`
    };
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-auto select-none">
      {/* Dark overlay backdrop — static, no re-animation between steps */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        style={{ willChange: 'opacity' }}
        onClick={onSkip}
      />

      {/* Spotlight cutout border */}
      {targetRect && (
        <div
          className="absolute rounded-2xl border-2 border-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.6),inset_0_0_15px_rgba(56,189,248,0.2)] pointer-events-none transition-all duration-300 ease-out z-[100]"
          style={{
            top: `${Math.max(0, targetRect.top - 6)}px`,
            left: `${Math.max(0, targetRect.left - 6)}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
          }}
        />
      )}

      {/* Tour Card Tooltip */}
      <div
        className="fixed z-[101] bg-theme-bg-secondary border border-theme-border-primary rounded-3xl p-6 shadow-2xl pointer-events-auto"
        style={{ ...getTooltipStyle(), transition: 'top 0.25s ease, left 0.25s ease' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-theme-brand-primary/10 text-theme-brand-primary text-xs font-black uppercase tracking-wider border border-theme-brand-primary/20 flex items-center gap-1.5">
              <Sparkles size={12} />
              {currentStep.badge || tour.title}
            </span>
            <span className="text-xs font-bold text-theme-text-muted">
              {currentStepIndex + 1} / {totalSteps}
            </span>
          </div>

          <button
            onClick={onSkip}
            className="p-1.5 rounded-xl text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-tertiary transition-colors"
            title={isEs ? 'Cerrar guía (Esc)' : 'Close guide (Esc)'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Title & Body */}
        <h3 className="text-lg font-extrabold text-theme-text-primary mb-2 tracking-tight">
          {renderFormattedText(currentStep.title)}
        </h3>
        <p className="text-sm text-theme-text-secondary leading-relaxed mb-6 font-medium">
          {renderFormattedText(currentStep.content)}
        </p>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-theme-border-secondary">
          <button
            onClick={onSkip}
            className="text-xs font-bold text-theme-text-muted hover:text-theme-text-primary px-3 py-2 rounded-xl hover:bg-theme-bg-hover transition-colors"
          >
            {isEs ? 'Saltar tour' : 'Skip tour'}
          </button>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-2 rounded-xl bg-theme-bg-tertiary hover:bg-theme-bg-hover text-theme-text-primary text-xs font-bold transition-all flex items-center gap-1"
              >
                <ArrowLeft size={14} />
                {isEs ? 'Anterior' : 'Back'}
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-theme-brand-primary hover:bg-theme-brand-hover text-white text-xs font-bold shadow-lg shadow-theme-brand-primary/25 transition-all flex items-center gap-1.5 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>{isLastStep ? (isEs ? '¡Entendido!' : 'Got it!') : (isEs ? 'Siguiente' : 'Next')}</span>
              {isLastStep ? <Check size={14} /> : <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
