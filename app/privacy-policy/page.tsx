/**
 * Privacy policy page outlining data collection, usage, and protection practices for the Safhira application.
 * This page provides transparent information about user privacy rights, data handling procedures, and security measures.
 * Features structured legal content with clear sections covering various aspects of data privacy and user rights.
 */
import BreadcrumbTrail from '@/app/components/BreadcrumbTrail';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import {getTranslations} from 'next-intl/server';
import Link from 'next/link';

type TocItem = {
  id: string;
  label: string;
};

type SectionListItem = {
  name: string;
  description: string;
};

type SectionGroup = {
  title: string;
  description?: string;
  items?: SectionListItem[];
};

type InformationSharingItem = {
  name: string;
  description: string;
};

type ContactItem = {
  label: string;
  value: string;
  href: string;
};

type PolicySections = {
  infoWeCollect: {
    title: string;
    summary: string;
    groups: SectionGroup[];
  };
  useOfInformation: {
    title: string;
    items: string[];
  };
  cookies: {
    title: string;
    body: string;
  };
  aiConversations: {
    title: string;
    body: string;
  };
  dataStorage: {
    title: string;
    body: string;
  };
  informationSharing: {
    title: string;
    body: string;
    items: InformationSharingItem[];
  };
  yourRights: {
    title: string;
    body: string;
    items: string[];
    footer: string;
  };
  dataRetention: {
    title: string;
    body: string;
  };
  security: {
    title: string;
    body: string;
  };
  thirdParty: {
    title: string;
    body: string;
  };
  youngPeople: {
    title: string;
    body: string;
  };
  changes: {
    title: string;
    body: string;
  };
  contact: {
    title: string;
    body: string;
    contacts: ContactItem[];
    footer: string;
  };
};

export default async function PrivacyPolicyPage() {
  const tBreadcrumbs = await getTranslations('Common.breadcrumbs');
  const tPolicy = await getTranslations('PrivacyPolicy');
  const pageTitle = tBreadcrumbs('privacyPolicy');
  const lastUpdatedDate = 'March 15, 2025';
  const updatedCopy = tPolicy('meta.updated', {date: lastUpdatedDate});
  const introTitle = tPolicy('intro.title');
  const introParagraphs = tPolicy.raw('intro.paragraphs') as string[];
  const tocTitle = tPolicy('toc.title');
  const tocDescription = tPolicy('toc.description');
  const tocItems = tPolicy.raw('toc.items') as TocItem[];
  const sections = tPolicy.raw('sections') as PolicySections;
  const sectionCardClass = 'border border-gray-200/80 bg-white/80 shadow-sm backdrop-blur-sm dark:border-gray-800/70 dark:bg-gray-900/60';
  const sectionContentClass = 'space-y-6 text-base leading-relaxed text-gray-700 dark:text-gray-300';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8 sm:py-12 lg:py-16 px-3 sm:px-4">
      <div className="container mx-auto max-w-4xl">
        <BreadcrumbTrail
          items={[
            {label: tBreadcrumbs('home'), href: '/'},
            {label: pageTitle},
          ]}
        />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">
          {pageTitle}
        </h1>
        <div className="space-y-10">
          <p className="text-sm font-medium uppercase tracking-wide text-teal-700 dark:text-teal-300">
            {updatedCopy}
          </p>

          <Card className="border border-teal-100/70 bg-white/80 shadow-sm dark:border-teal-900/40 dark:bg-gray-900/60">
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                {introTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-base leading-relaxed text-gray-700 dark:text-gray-300">
              {introParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-teal-200/60 bg-teal-50/60 shadow-sm dark:border-teal-800/60 dark:bg-teal-950/40">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl font-semibold text-teal-900 dark:text-teal-200">
                {tocTitle}
              </CardTitle>
              <CardDescription className="text-sm text-teal-800 dark:text-teal-300">
                {tocDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {tocItems.map((item, index) => (
                  <Link
                    key={item.id}
                    href={`#${item.id}`}
                    className="group flex items-center gap-3 rounded-lg border border-teal-100/80 bg-white/90 px-4 py-3 text-sm font-semibold text-teal-900 transition hover:border-teal-300 hover:bg-white dark:border-teal-900/60 dark:bg-teal-950/60 dark:text-teal-200 dark:hover:border-teal-500/70"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 text-teal-700 transition group-hover:bg-teal-500/20 dark:text-teal-200">
                      {index + 1}
                    </span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <section id="info-we-collect">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {sections.infoWeCollect.title}
                </CardTitle>
                <CardDescription className="text-base text-gray-600 dark:text-gray-300">
                  {sections.infoWeCollect.summary}
                </CardDescription>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <div className="space-y-4">
                  {sections.infoWeCollect.groups.map((group) => (
                    <div key={group.title}>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {group.title}
                      </h3>
                      {group.items ? (
                        <ul className="mt-3 space-y-2 list-disc pl-5 marker:text-teal-500 dark:marker:text-teal-300">
                          {group.items.map((item) => (
                            <li key={item.name}>
                              <span className="font-semibold text-gray-800 dark:text-gray-100">{item.name}</span>.
                              {' '}
                              {item.description}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {group.description ? <p className="mt-3">{group.description}</p> : null}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="use-of-information">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {sections.useOfInformation.title}
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <ul className="space-y-2 list-disc pl-5 marker:text-teal-500 dark:marker:text-teal-300">
                  {sections.useOfInformation.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          <section id="cookies">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {sections.cookies.title}
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>{sections.cookies.body}</p>
              </CardContent>
            </Card>
          </section>

          <section id="ai-conversations">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {sections.aiConversations.title}
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>{sections.aiConversations.body}</p>
              </CardContent>
            </Card>
          </section>

          <section id="data-storage">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {sections.dataStorage.title}
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>{sections.dataStorage.body}</p>
              </CardContent>
            </Card>
          </section>

          <section id="information-sharing">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {sections.informationSharing.title}
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>{sections.informationSharing.body}</p>
                <ul className="space-y-2 list-disc pl-5 marker:text-teal-500 dark:marker:text-teal-300">
                  {sections.informationSharing.items.map((item) => (
                    <li key={item.name}>
                      <span className="font-semibold text-gray-800 dark:text-gray-100">{item.name}</span>.
                      {' '}
                      {item.description}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          <section id="your-rights">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {sections.yourRights.title}
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>{sections.yourRights.body}</p>
                <ul className="space-y-2 list-disc pl-5 marker:text-teal-500 dark:marker:text-teal-300">
                  {sections.yourRights.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p>{sections.yourRights.footer}</p>
              </CardContent>
            </Card>
          </section>

          <section id="data-retention">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {sections.dataRetention.title}
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>{sections.dataRetention.body}</p>
              </CardContent>
            </Card>
          </section>

          <section id="security">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {sections.security.title}
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>{sections.security.body}</p>
              </CardContent>
            </Card>
          </section>

          <section id="third-party">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {sections.thirdParty.title}
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>{sections.thirdParty.body}</p>
              </CardContent>
            </Card>
          </section>

          <section id="young-people">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {sections.youngPeople.title}
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>{sections.youngPeople.body}</p>
              </CardContent>
            </Card>
          </section>

          <section id="changes">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {sections.changes.title}
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>{sections.changes.body}</p>
              </CardContent>
            </Card>
          </section>

          <section id="contact">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {sections.contact.title}
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>{sections.contact.body}</p>
                <ul className="space-y-2 list-disc pl-5 marker:text-teal-500 dark:marker:text-teal-300">
                  {sections.contact.contacts.map((item) => (
                    <li key={item.label}>
                      <span className="font-semibold text-gray-800 dark:text-gray-100">{item.label}:</span>{' '}
                      <a
                        className="text-teal-600 underline transition hover:text-teal-700 dark:text-teal-300 dark:hover:text-teal-200"
                        href={item.href}
                      >
                        {item.value}
                      </a>
                    </li>
                  ))}
                </ul>
                <p>{sections.contact.footer}</p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
