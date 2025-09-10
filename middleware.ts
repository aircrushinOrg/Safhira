import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // Supported locales
  locales: ['en', 'zh', 'ms'],
  // Default locale
  defaultLocale: 'en',
  // Always prefix locale in paths
  localePrefix: 'always'
});

// Skip paths that should not be internationalized
export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};

