'use client';

import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/app/components/ui/breadcrumb';
import {Link} from '@/i18n/routing';
import {cn} from '@/app/components/ui/utils';

export type BreadcrumbEntry = {
  label: string;
  href?: string;
};

interface BreadcrumbTrailProps {
  items: BreadcrumbEntry[];
  className?: string;
  navLabel?: string;
}

export function BreadcrumbTrail({items, className, navLabel}: BreadcrumbTrailProps) {
  if (!items || items.length === 0) return null;

  return (
    <Breadcrumb
      aria-label={navLabel ?? 'Breadcrumb'}
      className={cn('mb-4 text-sm text-muted-foreground', className)}
    >
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const key = `${item.href ?? item.label}-${index}`;
          return (
            <React.Fragment key={key}>
              <BreadcrumbItem>
                {item.href && !isLast ? (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default BreadcrumbTrail;
