import {getRequestConfig} from 'next-intl/server';

// Load translation messages for the current request/locale
export default getRequestConfig(async ({requestLocale, locale}) => {
  const supported = new Set(['en', 'zh', 'ms']);
  const segmentLocale = await requestLocale;
  const raw = locale ?? segmentLocale;
  const safeLocale = supported.has(raw || '') ? (raw as string) : 'en';

  return {
    locale: safeLocale,
    messages: (await import(`../messages/${safeLocale}.json`)).default
  };
});
