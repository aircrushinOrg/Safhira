import { Button } from '@/app/components/ui/button';
import ChatPractice, { type ChatTemplate } from '@/app/components/simulator/ChatPractice';
import { Link } from '@/i18n/routing';
import { SCENARIO_TEMPLATES, type ScenarioTemplate as ScenarioTemplateType } from '@/lib/simulator/scenarios';
import { ArrowLeft, MapPin, Sparkles } from 'lucide-react';

type PageProps = {
  searchParams?: Promise<{
    scenario?: string;
    npc?: string;
  }>;
};

function splitList(value: string) {
  return value
    .split(/\r?\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function resolveTemplate({ scenario, npc }: { scenario?: string; npc?: string }) {
  let template: ScenarioTemplateType | undefined;

  if (npc) {
    template = SCENARIO_TEMPLATES.find((item) => item.npc.id === npc);
  }

  if (!template && scenario) {
    template = SCENARIO_TEMPLATES.find((item) => item.id === scenario);
  }

  return template ?? SCENARIO_TEMPLATES[0];
}

export default async function SimulatorChatPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const { scenario: scenarioId, npc: npcId } = resolvedSearchParams;
  const template = resolveTemplate({ scenario: scenarioId, npc: npcId });

  const chatTemplate: ChatTemplate = {
    scenarioId: template.id,
    scenarioTitle: template.scenario.title,
    scenarioLabel: template.label,
    scenarioDescription: template.description,
    setting: template.scenario.setting,
    learningObjectives: splitList(template.scenario.learningObjectives),
    supportingFacts: splitList(template.scenario.supportingFacts),
    npcId: template.npc.id,
    npcName: template.npc.name,
    npcRole: template.npc.role,
    npcPersona: template.npc.persona,
    npcGoals: splitList(template.npc.goals),
    npcTactics: splitList(template.npc.tactics),
    npcBoundaries: splitList(template.npc.boundaries),
  };

  return (
    <div className="relative isolate overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-100/40 via-cyan-100/40 to-indigo-200/50 dark:from-teal-500/20 dark:via-cyan-600/10 dark:to-indigo-700/30" />
        <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/70" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 md:px-6 md:py-20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            asChild
            variant="ghost"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            <Link href="/simulator/npc-list">
              <ArrowLeft className="size-4" />
              Back to roster
            </Link>
          </Button>

          <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/40 bg-teal-500/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 dark:bg-teal-500/10 dark:text-teal-200">
            <Sparkles className="size-4" />
            Simulation practice
          </span>
        </div>

        <header className="space-y-4">
          <h1 className="text-balance text-3xl font-semibold leading-tight md:text-4xl">
            Chat with {chatTemplate.npcName}
          </h1>
          <p className="max-w-3xl text-pretty text-base text-slate-600 dark:text-slate-300">
            {template.description}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-slate-900/70">
              Scenario ID · {chatTemplate.scenarioId}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-slate-900/70">
              <MapPin className="size-4" />
              {chatTemplate.setting}
            </span>
          </div>
        </header>

        <ChatPractice template={chatTemplate} />
      </div>
    </div>
  );
}
