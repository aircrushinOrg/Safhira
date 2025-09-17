export {default} from '../../stis/page';

import type {Metadata} from 'next';
import {locales} from '../../../i18n/routing';
import {getTranslations} from 'next-intl/server';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations('STIsSEO');

  const title = t('list.title');
  const description = t('list.description');

  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = `/${l}/stis`;
  }

  return {
    title,
    description,
    alternates: {languages}
  };
}
