import PageClient, { type STISummary } from './PageClient'
import { db } from '../db'
import { sti } from '../../db/schema'

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
  const results = await db
    .select({
      name: sti.name,
      type: sti.type,
      severity: sti.severity,
      treatability: sti.treatability,
      treatment: sti.treatment,
      malaysianContext: sti.malaysianContext,
    })
    .from(sti)
    .orderBy(sti.name)

  const stis: STISummary[] = results.map((item) => ({
    slug: slugify(item.name),
    name: item.name,
    type: item.type as STISummary['type'],
    severity: item.severity as STISummary['severity'],
    treatability: item.treatability as STISummary['treatability'],
    description: truncateText(item.treatment || item.malaysianContext),
    prevalence: normalizeWhitespace(item.malaysianContext),
  }))

  return <PageClient stis={stis} />
}
