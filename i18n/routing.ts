import {createNavigation} from 'next-intl/navigation';
import type {Pathnames} from 'next-intl/routing';

export const locales = ['en', 'zh', 'ms'] as const;

// Prefix strategy: only include locale in URL for non-default locales
export const localePrefix = 'as-needed';

// Map route segments here if you localize pathnames later
export const pathnames = {
  '/': '/',
  '/stis': '/stis',
  '/stis/prevention': '/stis/prevention',
  '/stis/prevalence': '/stis/prevalence',
  '/chat': '/chat',
  '/chat/about': '/chat/about',
  '/quiz': '/quiz',
  '/find-healthcare': '/find-healthcare',
  '/find-healthcare/[id]': '/find-healthcare/[id]',
  '/living-well-with-sti': '/living-well-with-sti',
  '/living-well-with-sti/lifestyle': '/living-well-with-sti/lifestyle',
  '/living-well-with-sti/relationships': '/living-well-with-sti/relationships',
  '/living-well-with-sti/treatment': '/living-well-with-sti/treatment',
  '/privacy-policy': '/privacy-policy',
  '/terms-of-use': '/terms-of-use',
  // Add more pathnames as needed when localizing URLs
} satisfies Pathnames<typeof locales>;

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation({locales, localePrefix, defaultLocale: 'en'});
