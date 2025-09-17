export {default} from '../../../stis/[sti]/page';

import type {Metadata} from 'next';
import {locales} from '../../../../i18n/routing';
import {getTranslations} from 'next-intl/server';
import {searchSTIs} from '../../../database_query_endpoint/sti-actions';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function chooseNameBySlug(results: { name: string }[], slug: string): string | null {
  for (const r of results) {
    const base = r.name.replace(/\s*\([^)]*\)\s*/g, '');
    const paren = r.name.match(/\(([^)]+)\)/)?.[1] ?? '';
    const baseSlug = slugify(base);
    const parenSlug = paren ? slugify(paren) : '';
    if (baseSlug === slug || (parenSlug && parenSlug === slug)) return r.name;
  }
  return results[0]?.name ?? null;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string; sti: string}>;
}): Promise<Metadata> {
  const {locale, sti} = await params;
  const t = await getTranslations('STIsSEO');

  let displayName = '';
  try {
    const results = await searchSTIs(sti.toLowerCase());
    displayName = chooseNameBySlug(results, sti.toLowerCase()) ?? sti.replace(/-/g, ' ');
  } catch {
    displayName = sti.replace(/-/g, ' ');
  }

  const title = t('detail.title', {name: displayName});
  const description = t('detail.description', {name: displayName});

  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = `/${l}/stis/${sti}`;
  }

  return {
    title,
    description,
    alternates: {languages}
  };
}
