import PageClient, { type STISummary } from './PageClient'
import { db } from '../db'
import { sti, stiTranslations } from '../../db/schema'
import { getLocale } from 'next-intl/server'
import { sql } from 'drizzle-orm'

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function truncateText(text: string, maxLength = 220): string {
  const normalized = normalizeWhitespace(text)
  if (normalized.length <= maxLength) {
    return normalized
  }

  const truncated = normalized.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > 60) {
    return `${truncated.slice(0, lastSpace)}…`
  }

  return `${truncated}…`
}

export default async function STIsPage() {
  const locale = await getLocale()
  const results = await db
    .select({
      id: sti.stiId,
      baseName: sti.name,
      name: sql<string>`COALESCE(${stiTranslations.name}, ${sti.name})`,
      // Always use base enums for these fields so translation keys remain stable
      type: sql<string>`${sti.type}`,
      severity: sql<string>`${sti.severity}`,
      treatability: sql<string>`${sti.treatability}`,
      treatment: sql<string>`COALESCE(${stiTranslations.treatment}, ${sti.treatment})`,
      malaysianContext: sql<string>`COALESCE(${stiTranslations.malaysianContext}, ${sti.malaysianContext})`,
    })
    .from(sti)
    .leftJoin(
      stiTranslations,
      sql`${stiTranslations.stiId} = ${sti.stiId} AND ${stiTranslations.locale} = ${locale}`,
    )
    .orderBy(sti.name)

  const stis: STISummary[] = results.map((item) => ({
    id: Number(item.id),
    slug: slugify(item.baseName),
    name: item.name,
    type: item.type as STISummary['type'],
    severity: item.severity as STISummary['severity'],
    treatability: item.treatability as STISummary['treatability'],
    description: truncateText(item.treatment || item.malaysianContext),
    prevalence: normalizeWhitespace(item.malaysianContext),
  }))

  return <PageClient stis={stis} />
}
