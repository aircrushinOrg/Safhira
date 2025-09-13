import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // Supported locales
  locales: ['en', 'zh', 'ms'],
  // Default locale
  defaultLocale: 'en',
  // Only prefix non-default locales
  localePrefix: 'as-needed',
  // !remove this to enable browser location language
  // Disable automatic locale detection from browser language
  localeDetection: false
});

// Skip paths that should not be internationalized
export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};

