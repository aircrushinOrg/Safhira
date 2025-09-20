import Client, { type STIInfo } from './Client';
import { notFound } from 'next/navigation';
import { searchSTIs } from '../../actions/sti-actions';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function chooseBySlug(results: STIInfo[], slug: string): STIInfo | null {
  for (const r of results) {
    const base = r.name.replace(/\s*\([^)]*\)\s*/g, '');
    const paren = r.name.match(/\(([^)]+)\)/)?.[1] ?? '';
    const baseSlug = slugify(base);
    const parenSlug = paren ? slugify(paren) : '';
    if (baseSlug === slug || (parenSlug && parenSlug === slug)) return r;
  }
  return results[0] ?? null;
}

export default async function Page({ params }: { params: Promise<{ sti: string }> }) {
  const { sti } = await params;
  const slug = sti.toLowerCase();

  const results = await searchSTIs(slug);
  const stiInfo = chooseBySlug(results as STIInfo[], slug);

  if (!stiInfo) {
    notFound();
  }

  return <Client stiInfo={stiInfo} />;
}

