'use client';

import { useMemo, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, MessageCircle, Sparkles, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import ChatPractice, { type ChatTemplate } from '@/app/components/simulator/ChatPractice';
import { getLocalizedScenarioTemplate } from '@/lib/simulator/scenarios';
import type { ScenarioTemplate } from '@/lib/simulator/scenarios';
import type { PlayerGender } from '@/types/game';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';
import { useTranslations } from 'next-intl';

type OverlayStage = 'preview' | 'chat';

export type GameConversationOverlayProps = {
  open: boolean;
  stage: OverlayStage;
  template: ScenarioTemplate | null;
  playerGender: PlayerGender;
  chatKey: string;
  onClose: () => void;
  onStageChange: (stage: OverlayStage) => void;
};

function getNpcImagePath(npcId: string): string {
  const imageMap: Record<string, string> = {
    'friend-girl-01': '/simulator-landing-friend-girl-01.png',
    'friend-boy-01': '/simulator-landing-friend-boy-01.png',
    'doctor-girl-01': '/simulator-landing-doctor-girl-01r.png',
    'doctor-boy-01': '/simulator-landing-doctor-boy-01.png',
    'classmate-both-01': '/simulator-landing-classmate-both-01.png',
  };

  return imageMap[npcId] || '/simulator-landing-classmate-both-01.png'; // fallback image
}

function scenarioToChatTemplate(template: ScenarioTemplate): ChatTemplate {
  return {
    scenarioId: template.id,
    scenarioTitle: template.scenario.title,
    scenarioLabel: template.label,
    scenarioDescription: template.description,
    setting: template.scenario.setting,
    learningObjectives: template.scenario.learningObjectives.split(/\r?\n|;/).map((item) => item.trim()).filter(Boolean),
    supportingFacts: template.scenario.supportingFacts.split(/\r?\n|;/).map((item) => item.trim()).filter(Boolean),
    npcId: template.npc.id,
    npcName: template.npc.name,
    npcRole: template.npc.role,
    npcPersona: template.npc.persona,
    npcGoals: template.npc.goals.split(/\r?\n|;/).map((item) => item.trim()).filter(Boolean),
    npcTactics: template.npc.tactics.split(/\r?\n|;/).map((item) => item.trim()).filter(Boolean),
    npcBoundaries: template.npc.boundaries.split(/\r?\n|;/).map((item) => item.trim()).filter(Boolean),
  };
}

// Custom hook to get header height dynamically
function useHeaderHeight() {
  const [headerHeight, setHeaderHeight] = useState(88); // Default fallback height (5.5rem = 88px)

  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector('header');
      if (header) {
        const height = header.getBoundingClientRect().height;
        setHeaderHeight(height);
      }
    };

    // Update on mount
    updateHeaderHeight();

    // Update on resize
    window.addEventListener('resize', updateHeaderHeight);

    // Use ResizeObserver for more accurate header size changes
    const header = document.querySelector('header');
    let resizeObserver: ResizeObserver | null = null;

    if (header && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(updateHeaderHeight);
      resizeObserver.observe(header);
    }

    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  return headerHeight;
}

export function GameConversationOverlay({
  open,
  stage,
  template,
  playerGender,
  chatKey,
  onClose,
  onStageChange,
}: GameConversationOverlayProps) {
  const t = useTranslations('Simulator.overlay');
  const howItWorksItems = (t.raw('howItWorks.items') as string[]) ?? [];
  const headerHeight = useHeaderHeight();
  const chatTemplate = useMemo(() => (template ? scenarioToChatTemplate(template) : null), [template]);
  const aiChatTemplate = useMemo(() => {
    if (!template) return null;
    const englishTemplate = getLocalizedScenarioTemplate(template.id, 'en');
    const baseTemplate = englishTemplate ?? template;
    return scenarioToChatTemplate(baseTemplate);
  }, [template]);

  // Prevent body scrolling when overlay is open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const scrollY = window.scrollY;

      // Lock the body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        // Restore original styles
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = '';

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && template && chatTemplate && (
        <motion.aside
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="font-[var(--font-poppins)] pointer-events-auto fixed inset-0 z-50 flex justify-end items-end bg-slate-950/60 backdrop-blur-sm md:bg-transparent"
          aria-modal="true"
          role="dialog"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
            className="pointer-events-auto relative flex w-full flex-col bg-white text-slate-900 shadow-2xl md:max-w-xl md:rounded-l-[32px] md:border-l md:border-slate-100 md:bg-white/95 md:backdrop-blur-lg dark:bg-slate-950 dark:text-slate-50 md:dark:border-white/5 md:dark:bg-slate-950/95"
            style={{ height: `calc(100vh - ${headerHeight}px)` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="size-9 rounded-full text-slate-700 hover:bg-white dark:text-slate-200 dark:hover:bg-slate-900"
              >
                <X className="size-4" />
                <span className="sr-only">{t('close')}</span>
              </Button>
            </div>

            <div className="flex-1 overflow-hidden px-6 pb-[2.5rem] pt-14 md:px-8">
              <div className="h-full overflow-y-scroll -mx-6 px-6">
              {stage === 'preview' ? (
                <div className="flex flex-col gap-6">
                  <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-6 shadow-lg shadow-slate-900/10 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-slate-950/40">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                      <MessageCircle className="size-4 text-teal-500" />
                      {t('ready')}
                    </div>
                    
                    <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                      {t('chatWith', { name: template.npc.name })}
                    </h2>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                      {template.description}
                    </p>

                    <dl className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                      <div>
                        <dt className="font-semibold text-slate-500 dark:text-slate-400">{t('setting')}</dt>
                        <dd className="mt-1">{template.scenario.setting}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-500 dark:text-slate-400">{t('npc')}</dt>
                        <dd className="mt-3 flex items-center gap-3">
                          <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-teal-200/50 dark:border-teal-700/50">
                            <Image
                              src={getNpcImagePath(template.npc.id)}
                              alt={`${template.npc.name} - ${template.npc.role}`}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">{template.npc.name}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">{template.npc.role}</div>
                          </div>
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-500 dark:text-slate-400">{t('learningGoals')}</dt>
                        <dd className="mt-2">
                          <ul className="space-y-1">
                            {template.scenario.learningObjectives
                              .split(/\r?\n|;/)
                              .map((objective) => objective.trim())
                              .filter(Boolean)
                              .slice(0, 3)
                              .map((objective) => (
                                <li key={objective} className="flex items-start gap-2 text-sm">
                                  <Sparkles className="mt-0.5 size-4 text-teal-500" />
                                  <span>{objective}</span>
                                </li>
                              ))}
                          </ul>
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-8 flex flex-col gap-3 md:flex-row">
                      <Button
                        className="h-12 flex-1 bg-teal-500 text-slate-900 hover:bg-teal-400"
                        onClick={() => onStageChange('chat')}
                      >
                        {t('start')}
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12 flex-1 border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                        onClick={onClose}
                      >
                        {t('notNow')}
                      </Button>
                    </div>
                  </div>

                  <div className="mb-3 rounded-3xl border border-slate-200/60 bg-white/80 p-5 text-sm shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                      {t('howItWorks.title')}
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      {howItWorksItems.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className={cn('flex flex-1 flex-col min-h-0')}>
                  <div className="mb-4 flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onStageChange('preview')}
                      className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                    >
                      <ArrowLeft className="mr-2 size-4" />
                      {t('backToPreview')}
                    </Button>
                  </div>
                  <ChatPractice key={chatKey} template={chatTemplate} aiTemplate={aiChatTemplate ?? undefined} />
                </div>
              )}
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 -z-10" />
          </motion.div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
