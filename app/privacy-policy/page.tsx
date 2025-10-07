/**
 * Privacy policy page outlining data collection, usage, and protection practices for the Safhira application.
 * This page provides transparent information about user privacy rights, data handling procedures, and security measures.
 * Features structured legal content with clear sections covering various aspects of data privacy and user rights.
 */
import BreadcrumbTrail from '@/app/components/BreadcrumbTrail';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import {getTranslations} from 'next-intl/server';
import Link from 'next/link';

export default async function PrivacyPolicyPage() {
  const tBreadcrumbs = await getTranslations('Common.breadcrumbs');
  const sectionCardClass = 'border border-gray-200/80 bg-white/80 shadow-sm backdrop-blur-sm dark:border-gray-800/70 dark:bg-gray-900/60';
  const sectionContentClass = 'space-y-6 text-base leading-relaxed text-gray-700 dark:text-gray-300';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8 sm:py-12 lg:py-16 px-3 sm:px-4">
      <div className="container mx-auto max-w-4xl">
        <BreadcrumbTrail
          items={[
            {label: tBreadcrumbs('home'), href: '/'},
            {label: tBreadcrumbs('privacyPolicy')},
          ]}
        />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">
          Privacy Policy
        </h1>
        <div className="space-y-10">
          <p className="text-sm font-medium uppercase tracking-wide text-teal-700 dark:text-teal-300">
            Last updated: Oct. 07, 2025
          </p>

          <Card className="border border-teal-100/70 bg-white/80 shadow-sm dark:border-teal-900/40 dark:bg-gray-900/60">
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                Our Privacy Commitment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-base leading-relaxed text-gray-700 dark:text-gray-300">
              <p>
                Safhira (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting the privacy of
                young people seeking accurate, stigma-free information about sexual and
                reproductive health.
              </p>
              <p>
                This Privacy Policy explains how we collect, use, disclose, and safeguard
                information when you visit our website, use our tools, or interact with
                Safhira AI. Please read this policy carefully to understand your rights and
                our obligations.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-teal-200/60 bg-teal-50/60 shadow-sm dark:border-teal-800/60 dark:bg-teal-950/40">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl font-semibold text-teal-900 dark:text-teal-200">
                In This Policy
              </CardTitle>
              <CardDescription className="text-sm text-teal-800 dark:text-teal-300">
                Jump to the section that matters most to you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="#info-we-collect"
                  className="group flex items-center gap-3 rounded-lg border border-teal-100/80 bg-white/90 px-4 py-3 text-sm font-semibold text-teal-900 transition hover:border-teal-300 hover:bg-white dark:border-teal-900/60 dark:bg-teal-950/60 dark:text-teal-200 dark:hover:border-teal-500/70"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 text-teal-700 transition group-hover:bg-teal-500/20 dark:text-teal-200">
                    1
                  </span>
                  Information We Collect
                </Link>
                <Link
                  href="#use-of-information"
                  className="group flex items-center gap-3 rounded-lg border border-teal-100/80 bg-white/90 px-4 py-3 text-sm font-semibold text-teal-900 transition hover:border-teal-300 hover:bg-white dark:border-teal-900/60 dark:bg-teal-950/60 dark:text-teal-200 dark:hover:border-teal-500/70"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 text-teal-700 transition group-hover:bg-teal-500/20 dark:text-teal-200">
                    2
                  </span>
                  How We Use Information
                </Link>
                <Link
                  href="#cookies"
                  className="group flex items-center gap-3 rounded-lg border border-teal-100/80 bg-white/90 px-4 py-3 text-sm font-semibold text-teal-900 transition hover:border-teal-300 hover:bg-white dark:border-teal-900/60 dark:bg-teal-950/60 dark:text-teal-200 dark:hover:border-teal-500/70"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 text-teal-700 transition group-hover:bg-teal-500/20 dark:text-teal-200">
                    3
                  </span>
                  Cookies &amp; Local Storage
                </Link>
                <Link
                  href="#ai-conversations"
                  className="group flex items-center gap-3 rounded-lg border border-teal-100/80 bg-white/90 px-4 py-3 text-sm font-semibold text-teal-900 transition hover:border-teal-300 hover:bg-white dark:border-teal-900/60 dark:bg-teal-950/60 dark:text-teal-200 dark:hover:border-teal-500/70"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 text-teal-700 transition group-hover:bg-teal-500/20 dark:text-teal-200">
                    4
                  </span>
                  Safhira AI Conversations
                </Link>
                <Link
                  href="#data-storage"
                  className="group flex items-center gap-3 rounded-lg border border-teal-100/80 bg-white/90 px-4 py-3 text-sm font-semibold text-teal-900 transition hover:border-teal-300 hover:bg-white dark:border-teal-900/60 dark:bg-teal-950/60 dark:text-teal-200 dark:hover:border-teal-500/70"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 text-teal-700 transition group-hover:bg-teal-500/20 dark:text-teal-200">
                    5
                  </span>
                  Data Storage &amp; Transfers
                </Link>
                <Link
                  href="#information-sharing"
                  className="group flex items-center gap-3 rounded-lg border border-teal-100/80 bg-white/90 px-4 py-3 text-sm font-semibold text-teal-900 transition hover:border-teal-300 hover:bg-white dark:border-teal-900/60 dark:bg-teal-950/60 dark:text-teal-200 dark:hover:border-teal-500/70"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 text-teal-700 transition group-hover:bg-teal-500/20 dark:text-teal-200">
                    6
                  </span>
                  Information Sharing
                </Link>
                <Link
                  href="#your-rights"
                  className="group flex items-center gap-3 rounded-lg border border-teal-100/80 bg-white/90 px-4 py-3 text-sm font-semibold text-teal-900 transition hover:border-teal-300 hover:bg-white dark:border-teal-900/60 dark:bg-teal-950/60 dark:text-teal-200 dark:hover:border-teal-500/70"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 text-teal-700 transition group-hover:bg-teal-500/20 dark:text-teal-200">
                    7
                  </span>
                  Your Rights &amp; Choices
                </Link>
                <Link
                  href="#data-retention"
                  className="group flex items-center gap-3 rounded-lg border border-teal-100/80 bg-white/90 px-4 py-3 text-sm font-semibold text-teal-900 transition hover:border-teal-300 hover:bg-white dark:border-teal-900/60 dark:bg-teal-950/60 dark:text-teal-200 dark:hover:border-teal-500/70"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 text-teal-700 transition group-hover:bg-teal-500/20 dark:text-teal-200">
                    8
                  </span>
                  Data Retention
                </Link>
                <Link
                  href="#security"
                  className="group flex items-center gap-3 rounded-lg border border-teal-100/80 bg-white/90 px-4 py-3 text-sm font-semibold text-teal-900 transition hover:border-teal-300 hover:bg-white dark:border-teal-900/60 dark:bg-teal-950/60 dark:text-teal-200 dark:hover:border-teal-500/70"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 text-teal-700 transition group-hover:bg-teal-500/20 dark:text-teal-200">
                    9
                  </span>
                  Security
                </Link>
                <Link
                  href="#third-party"
                  className="group flex items-center gap-3 rounded-lg border border-teal-100/80 bg-white/90 px-4 py-3 text-sm font-semibold text-teal-900 transition hover:border-teal-300 hover:bg-white dark:border-teal-900/60 dark:bg-teal-950/60 dark:text-teal-200 dark:hover:border-teal-500/70"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 text-teal-700 transition group-hover:bg-teal-500/20 dark:text-teal-200">
                    10
                  </span>
                  Third-Party Resources
                </Link>
                <Link
                  href="#young-people"
                  className="group flex items-center gap-3 rounded-lg border border-teal-100/80 bg-white/90 px-4 py-3 text-sm font-semibold text-teal-900 transition hover:border-teal-300 hover:bg-white dark:border-teal-900/60 dark:bg-teal-950/60 dark:text-teal-200 dark:hover:border-teal-500/70"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 text-teal-700 transition group-hover:bg-teal-500/20 dark:text-teal-200">
                    11
                  </span>
                  Children &amp; Young People
                </Link>
                <Link
                  href="#changes"
                  className="group flex items-center gap-3 rounded-lg border border-teal-100/80 bg-white/90 px-4 py-3 text-sm font-semibold text-teal-900 transition hover:border-teal-300 hover:bg-white dark:border-teal-900/60 dark:bg-teal-950/60 dark:text-teal-200 dark:hover:border-teal-500/70"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 text-teal-700 transition group-hover:bg-teal-500/20 dark:text-teal-200">
                    12
                  </span>
                  Changes to This Policy
                </Link>
                <Link
                  href="#contact"
                  className="group flex items-center gap-3 rounded-lg border border-teal-100/80 bg-white/90 px-4 py-3 text-sm font-semibold text-teal-900 transition hover:border-teal-300 hover:bg-white dark:border-teal-900/60 dark:bg-teal-950/60 dark:text-teal-200 dark:hover:border-teal-500/70"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 text-teal-700 transition group-hover:bg-teal-500/20 dark:text-teal-200">
                    13
                  </span>
                  Contact Us
                </Link>
              </div>
            </CardContent>
          </Card>

          <section id="info-we-collect">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  1. Information We Collect
                </CardTitle>
                <CardDescription className="text-base text-gray-600 dark:text-gray-300">
                  Safhira is designed to collect the minimum amount of personal data necessary to deliver the service.
                </CardDescription>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      a. Information you choose to provide
                    </h3>
                    <ul className="mt-3 space-y-2 list-disc pl-5 marker:text-teal-500 dark:marker:text-teal-300">
                      <li>
                        <strong>Messages and prompts.</strong> When you chat with Safhira AI or submit forms, we receive the text you provide so the service can respond to your request.
                      </li>
                      <li>
                        <strong>Feedback and survey responses.</strong> If you share feedback, report an issue, or sign up to participate in user research, we collect the information you submit, including contact details when provided.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      b. Information collected automatically
                    </h3>
                    <ul className="mt-3 space-y-2 list-disc pl-5 marker:text-teal-500 dark:marker:text-teal-300">
                      <li>
                        <strong>Usage data.</strong> We gather limited, aggregated analytics (for example, page views or feature usage counts) to understand how the platform is used and improve user experience. This data is processed without directly identifying individual users.
                      </li>
                      <li>
                        <strong>Technical data.</strong> We may log standard technical details sent by your browser or device, such as IP address, device type, browser version, and operating system. When collected, IP addresses are truncated or pseudonymised as quickly as possible.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      c. Derived or contextual information
                    </h3>
                    <p>
                      To keep conversations safe and relevant, Safhira AI may generate metadata about your session, such as conversation tags or safety moderation signals. These signals help us detect misuse, enforce safety policies, and improve content quality.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="use-of-information">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  2. How We Use Information
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <ul className="space-y-2 list-disc pl-5 marker:text-teal-500 dark:marker:text-teal-300">
                  <li>Provide core features, including the learning hub, STI resources, and AI chat.</li>
                  <li>Deliver personalised, context-aware responses within the same session.</li>
                  <li>Monitor safety, enforce acceptable use policies, and prevent abuse.</li>
                  <li>Analyse aggregated usage trends to enhance performance and accessibility.</li>
                  <li>Communicate service updates, respond to inquiries, or provide support when you contact us.</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          <section id="cookies">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  3. Cookies and Similar Technologies
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>
                  Safhira currently uses essential cookies and local storage only where needed to maintain session state, language preferences, and security. We do not run advertising or behavioural tracking pixels. If we introduce additional cookies in the future, we will update this policy and provide appropriate controls.
                </p>
              </CardContent>
            </Card>
          </section>

          <section id="ai-conversations">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  4. Safhira AI Conversations
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>
                  Conversations with Safhira AI may be processed by trusted technology providers solely to generate responses, apply safety filters, and improve model performance. We automatically remove or pseudonymise any personal identifiers detected in conversation logs, and retain the content only for as long as required to operate, secure, and improve the service.
                </p>
              </CardContent>
            </Card>
          </section>

          <section id="data-storage">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  5. Data Storage and International Transfers
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>
                  Safhira stores data on secure infrastructure located in regions that may be outside of your home country. Regardless of where data is processed, we implement technical and organisational measures aligned with ISO/IEC 27001, GDPR, and Malaysian PDPA principles to protect your information against unauthorised access, disclosure, or loss.
                </p>
              </CardContent>
            </Card>
          </section>

          <section id="information-sharing">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  6. Information Sharing
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>
                  We do not sell, rent, or trade your personal information. We may share limited data with:
                </p>
                <ul className="space-y-2 list-disc pl-5 marker:text-teal-500 dark:marker:text-teal-300">
                  <li>
                    <strong>Service providers.</strong> Vendors that host infrastructure, provide analytics, or enable AI processing. These partners are bound by confidentiality obligations and only process data on our instructions.
                  </li>
                  <li>
                    <strong>Educational and health partners.</strong> Aggregated, anonymised insights may be shared with collaborators to improve sexual health education resources.
                  </li>
                  <li>
                    <strong>Legal or safety requirements.</strong> We may disclose information if required by law or when necessary to protect the rights, safety, or wellbeing of users and the public.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          <section id="your-rights">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  7. Your Rights and Choices
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>You may have the following rights depending on your jurisdiction:</p>
                <ul className="space-y-2 list-disc pl-5 marker:text-teal-500 dark:marker:text-teal-300">
                  <li>Access, correct, or delete personal information you have provided.</li>
                  <li>Object to or restrict certain processing activities.</li>
                  <li>Request a copy of data in a portable format where technically feasible.</li>
                  <li>Withdraw consent when processing is based on consent.</li>
                </ul>
                <p>
                  To exercise these rights, contact us using the details below. We may ask you to verify your identity before fulfilling a request. Certain requests may be limited where we must retain data for legal, security, or operational reasons.
                </p>
              </CardContent>
            </Card>
          </section>

          <section id="data-retention">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  8. Data Retention
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>
                  We keep personal data only for as long as necessary to deliver the service, comply with legal obligations, resolve disputes, and enforce our agreements. AI conversation snippets used for safety or quality review are typically retained for no more than 30 days, unless a longer period is required for legal or investigatory purposes.
                </p>
              </CardContent>
            </Card>
          </section>

          <section id="security">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  9. Security
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>
                  Safhira employs encryption in transit, access controls, and regular security assessments to protect data. While we strive to safeguard your information, no method of transmission or storage is completely secure. Users should take care to keep their devices secure and avoid sharing sensitive personal information in chats or forms.
                </p>
              </CardContent>
            </Card>
          </section>

          <section id="third-party">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  10. Third-Party Links and Resources
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>
                  Our platform may link to external websites, clinics, or educational resources. We are not responsible for the privacy practices of third parties. We encourage you to review the privacy policies of any services you visit through Safhira.
                </p>
              </CardContent>
            </Card>
          </section>

          <section id="young-people">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  11. Children and Young People
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>
                  Safhira is intended for teens and young adults seeking sexual health education. We encourage users under the age of 18 to explore the platform with guidance from a trusted adult or guardian. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us so we can delete it.
                </p>
              </CardContent>
            </Card>
          </section>

          <section id="changes">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  12. Changes to This Policy
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>
                  We may update this Privacy Policy to reflect new features, legal requirements, or security improvements. When we make material changes, we will update the &ldquo;Last updated&rdquo; date and provide additional notice when required.
                </p>
              </CardContent>
            </Card>
          </section>

          <section id="contact">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  13. Contact Us
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>
                  If you have questions, concerns, or requests related to this Privacy Policy, please contact us at:
                </p>
                <ul className="space-y-2 list-disc pl-5 marker:text-teal-500 dark:marker:text-teal-300">
                  <li>Email: <a className="text-teal-600 underline transition hover:text-teal-700 dark:text-teal-300 dark:hover:text-teal-200" href="mailto:info@safhira.vercel.app">info@safhira.vercel.app</a></li>
                  <li>Website: <a className="text-teal-600 underline transition hover:text-teal-700 dark:text-teal-300 dark:hover:text-teal-200" href="https://www.safhira.vercel.app">www.safhira.vercel.app</a></li>
                </ul>
                <p>
                  We aim to respond to privacy inquiries within 14 days. Thank you for trusting Safhira as your companion for safe, evidence-based sexual health learning.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
