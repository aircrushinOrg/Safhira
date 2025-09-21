/**
 * Language/locale switcher component that allows users to change the application language.
 * This component provides a dropdown menu with flag icons for different supported languages (English, Chinese, Malay).
 * Integrates with Next.js internationalization routing to preserve the current page while switching locales.
 */
'use client'

import {Languages} from 'lucide-react';
import {Button} from './ui/button';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from './ui/dropdown-menu';
import {useRouter, usePathname} from '../../i18n/routing';
import {useLocale} from 'next-intl';
import {locales} from '../../i18n/routing';

const flags: Record<string, string> = {
  en: '🇬🇧',
  zh: '🇨🇳',
  ms: '🇲🇾'
};

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as (typeof locales)[number];

  const changeLocale = (next: (typeof locales)[number]) => {
    if (next === locale) return;
    router.replace(pathname || '/', {locale: next});
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Change language">
          <Languages className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-28 z-[70]">
        {(locales as readonly string[]).map((l) => (
          <DropdownMenuItem key={l} onSelect={() => changeLocale(l as (typeof locales)[number])} className="flex items-center gap-2">
            <span className="text-base leading-none">{flags[l] ?? '🏳️'}</span>
            <span className="text-xs uppercase">{l}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
