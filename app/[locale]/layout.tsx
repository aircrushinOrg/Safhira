import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {Suspense} from 'react';
import {HeaderWrapper} from '../components/HeaderWrapper';
import {FooterWrapper} from '../components/FooterWrapper';
import type {Metadata} from 'next';
import {locales} from '../../i18n/routing';
// Note: We intentionally do not 404 unknown first segments here
// because requests like /serviceWorker.js could be made by the browser.
// Instead, we fall back to the default locale to avoid i18n errors.

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export const metadata: Metadata = {};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const supported = new Set(locales as readonly string[]);
  const effectiveLocale = supported.has(locale) ? locale : 'en';

  setRequestLocale(effectiveLocale);
  const messages = await getMessages();
  return (
    <NextIntlClientProvider locale={effectiveLocale} messages={messages}>
      <Suspense fallback={null}>
        <HeaderWrapper />
      </Suspense>
      {children}
      <Suspense fallback={null}>
        <FooterWrapper />
      </Suspense>
    </NextIntlClientProvider>
  );
}
