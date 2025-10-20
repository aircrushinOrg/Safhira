import { asc, count, desc, eq } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";

import { db } from "@/app/db";
import { BreadcrumbTrail } from "@/app/components/BreadcrumbTrail";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { cn } from "@/app/components/ui/utils";
import { aiScenarioSessions, aiScenarioTurns } from "@/db/schema";
import { Link } from "@/i18n/routing";

const SESSION_PAGE_SIZE = 10;

type SessionRecord = typeof aiScenarioSessions.$inferSelect;
type TurnRecord = typeof aiScenarioTurns.$inferSelect;

type SessionListItem = Pick<
  SessionRecord,
  "sessionId" | "npcName" | "scenarioTitle" | "scenarioId" | "updatedAt"
>;

type SessionPageResult = {
  sessions: SessionListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

type PageProps = {
  searchParams?: Promise<{
    sessionId?: string;
    page?: string;
  }>;
};

async function fetchSessionPage(requestedPage: number): Promise<SessionPageResult> {
  const [{ value }] = await db
    .select({ value: count() })
    .from(aiScenarioSessions);

  const totalCount = Number(value ?? 0);
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / SESSION_PAGE_SIZE) : 1;
  const safePage = totalCount > 0 ? Math.min(Math.max(requestedPage, 1), totalPages) : 1;
  const offset = (safePage - 1) * SESSION_PAGE_SIZE;

  const sessions = await db
    .select({
      sessionId: aiScenarioSessions.sessionId,
      npcName: aiScenarioSessions.npcName,
      scenarioTitle: aiScenarioSessions.scenarioTitle,
      scenarioId: aiScenarioSessions.scenarioId,
      updatedAt: aiScenarioSessions.updatedAt,
    })
    .from(aiScenarioSessions)
    .orderBy(desc(aiScenarioSessions.updatedAt))
    .limit(SESSION_PAGE_SIZE)
    .offset(offset);

  return {
    sessions,
    totalCount,
    totalPages,
    currentPage: safePage,
  };
}

async function fetchSessionDetails(sessionId: string) {
  const [session] = await db
    .select()
    .from(aiScenarioSessions)
    .where(eq(aiScenarioSessions.sessionId, sessionId))
    .limit(1);

  if (!session) {
    return { session: null, turns: [] as TurnRecord[] } as const;
  }

  const turns = await db
    .select({
      sessionId: aiScenarioTurns.sessionId,
      createdAt: aiScenarioTurns.createdAt,
      id: aiScenarioTurns.id,
      turnIndex: aiScenarioTurns.turnIndex,
      role: aiScenarioTurns.role,
      content: aiScenarioTurns.content,
    })
    .from(aiScenarioTurns)
    .where(eq(aiScenarioTurns.sessionId, sessionId))
    .orderBy(asc(aiScenarioTurns.turnIndex));

  return { session, turns } as const;
}

function formatDate(value: Date | null, locale: string, fallback = "—") {
  if (!value) return fallback;
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(value);
  } catch {
    return value.toISOString();
  }
}

function ConversationTurnRow({
  content,
  isPlayer,
  roleLabel,
  timestampLabel,
  turnIndexLabel,
}: {
  content: string;
  isPlayer: boolean;
  roleLabel: string;
  timestampLabel: string;
  turnIndexLabel: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl border border-slate-200/70 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-900/60",
        isPlayer ? "items-end" : "items-start",
      )}
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <span>{roleLabel}</span>
        <span>·</span>
        <span>{timestampLabel}</span>
        <span>·</span>
        <span>{turnIndexLabel}</span>
      </div>
      <p className={cn(
        "text-sm leading-relaxed text-slate-700 dark:text-slate-200",
        isPlayer ? "text-right" : "text-left",
      )}
      >
        {content}
      </p>
    </div>
  );
}

export default async function SimulatorHistoryPage({ searchParams }: PageProps) {
  const resolvedParams = (await searchParams) ?? {};
  const requestedSessionId = resolvedParams.sessionId;
  const requestedPage = Number.parseInt(resolvedParams.page ?? "1", 10);
  const parsedPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [t, tCommon, locale, sessionPage] = await Promise.all([
    getTranslations("Simulator.history"),
    getTranslations("Common"),
    getLocale(),
    fetchSessionPage(parsedPage),
  ]);

  const sessionList = sessionPage.sessions;
  const currentPage = sessionPage.currentPage;
  const totalPages = sessionPage.totalPages;

  const selectedSessionId =
    requestedSessionId && sessionList.some((session) => session.sessionId === requestedSessionId)
      ? requestedSessionId
      : sessionList[0]?.sessionId ?? null;

  let detailSessionId: string | null = selectedSessionId;
  let detail = { session: null as SessionRecord | null, turns: [] as TurnRecord[] };

  if (detailSessionId) {
    detail = await fetchSessionDetails(detailSessionId);
    if (!detail.session && requestedSessionId) {
      detailSessionId = null;
    }
  }

  const breadcrumbs = [
    { label: tCommon("breadcrumbs.home"), href: "/" },
    { label: t("breadcrumbs.simulator"), href: "/simulator" },
    { label: t("badge") },
  ];

  const conversationLabels = {
    player: t("details.labels.player"),
    npc: t("details.labels.npc"),
  };

  const turnLabel = (value: number) => t("details.labels.turnLabel", { value });

  const paginationLabels = {
    previous: t("pagination.previous"),
    next: t("pagination.next"),
    status: t("pagination.pageStatus", { current: currentPage, total: totalPages }),
  };

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const createPageHref = (pageValue: number, sessionId?: string | null) => {
    const params = new URLSearchParams();
    if (pageValue > 1) {
      params.set("page", String(pageValue));
    }
    if (sessionId) {
      params.set("sessionId", sessionId);
    }
    const query = params.toString();
    return query ? `/simulator/history?${query}` : "/simulator/history";
  };

  return (
    <div className="relative isolate min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/40 via-cyan-100/30 to-indigo-100/40 dark:from-emerald-500/20 dark:via-cyan-600/10 dark:to-indigo-700/30" />
        <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/80" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-16">
        <div className="flex flex-col gap-6">
          <BreadcrumbTrail items={breadcrumbs} />
          <div className="flex flex-col gap-2">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
              {t("badge")}
            </span>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50 md:text-4xl">{t("title")}</h1>
            <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-200 md:text-base">{t("subtitle")}</p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="h-full border-slate-200/70 bg-white/80 dark:border-white/10 dark:bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-base text-slate-800 dark:text-slate-100">{t("list.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              {sessionList.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-300">{t("list.empty")}</p>
              ) : (
                <>
                  <ScrollArea className="h-[480px] pr-3">
                    <div className="space-y-3">
                      {sessionList.map((session) => {
                        const isActive = session.sessionId === detailSessionId;
                        return (
                          <Link
                            key={session.sessionId}
                            href={createPageHref(currentPage, session.sessionId)}
                            className={cn(
                              "block rounded-2xl border border-slate-200/70 bg-white/70 p-4 text-sm transition hover:border-emerald-400/50 hover:bg-white/90 dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-emerald-400/40 dark:hover:bg-slate-900/80",
                              isActive &&
                                "border-emerald-500 bg-white shadow-lg shadow-emerald-500/20 dark:border-emerald-400/60 dark:bg-slate-900/80",
                            )}
                          >
                            <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              <span>{session.npcName}</span>
                              <span>{formatDate(session.updatedAt ?? null, locale)}</span>
                            </div>
                            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                              {session.scenarioTitle ?? session.scenarioId}
                            </p>
                            <span className="mt-3 inline-flex rounded-full bg-slate-200/70 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
                              {session.sessionId}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="min-w-[96px]"
                        disabled={!hasPrev}
                      >
                        <Link
                          href={hasPrev ? createPageHref(currentPage - 1) : "#"}
                          aria-disabled={!hasPrev}
                          tabIndex={hasPrev ? undefined : -1}
                        >
                          {paginationLabels.previous}
                        </Link>
                      </Button>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-200">
                        {paginationLabels.status}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="min-w-[96px]"
                        disabled={!hasNext}
                      >
                        <Link
                          href={hasNext ? createPageHref(currentPage + 1) : "#"}
                          aria-disabled={!hasNext}
                          tabIndex={hasNext ? undefined : -1}
                        >
                          {paginationLabels.next}
                        </Link>
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 bg-white/80 dark:border-white/10 dark:bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-base text-slate-800 dark:text-slate-100">
                {t("details.conversation")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!detail.session ? (
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  {requestedSessionId ? t("details.notFound") : t("details.noSelection")}
                </p>
              ) : detail.turns.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-300">{t("details.noTurns")}</p>
              ) : (
                <ScrollArea className="h-[540px] pr-5">
                  <div className="space-y-4">
                    {detail.turns.map((turn) => {
                      const isPlayer = turn.role === "player";
                      return (
                        <ConversationTurnRow
                          key={`${turn.turnIndex}-${turn.role}`}
                          content={turn.content}
                          isPlayer={isPlayer}
                          roleLabel={isPlayer ? conversationLabels.player : conversationLabels.npc}
                          timestampLabel={formatDate(turn.createdAt ?? null, locale)}
                          turnIndexLabel={turnLabel(turn.turnIndex)}
                        />
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
