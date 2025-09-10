import {createNavigation} from 'next-intl/navigation';
import type {Pathnames} from 'next-intl/routing';

export const locales = ['en', 'zh', 'ms'] as const;

// Prefix strategy: always include the locale in the URL for clarity and SEO
export const localePrefix = 'always';

// Map route segments here if you localize pathnames later
export const pathnames = {
  '/': '/',
  '/stis': '/stis',
  '/chat': '/chat',
  '/quiz': '/quiz',
  '/privacy-policy': '/privacy-policy',
  '/terms-of-use': '/terms-of-use',
  '/rights': '/rights'
  // Add more pathnames as needed when localizing URLs
} satisfies Pathnames<typeof locales>;

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation({locales, localePrefix});
