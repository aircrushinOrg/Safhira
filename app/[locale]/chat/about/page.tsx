export {default} from '../../../chat/about/page';

import type {Metadata} from 'next';
import {locales} from '../../../../i18n/routing';
import {getTranslations} from 'next-intl/server';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations('ChatAboutSEO');

  const title = t('page.title');
  const description = t('page.description');

  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = `/${l}/chat/about`;
  }

  return {
    title,
    description,
    alternates: {languages}
  };
}
