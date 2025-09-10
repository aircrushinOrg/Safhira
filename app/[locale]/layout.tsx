import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {Suspense} from 'react';
import {HeaderWrapper} from '../components/HeaderWrapper';
import {FooterWrapper} from '../components/FooterWrapper';
import type {Metadata} from 'next';
import {locales} from '../../i18n/routing';

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
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
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
