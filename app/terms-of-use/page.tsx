/**
 * Terms of use page detailing legal terms, conditions, and user responsibilities for the Safhira platform.
 * This page outlines acceptable use policies, user obligations, and platform limitations for legal compliance.
 * Features comprehensive terms covering liability, content usage, and service provision with clear legal language.
 */
import BreadcrumbTrail from '@/app/components/BreadcrumbTrail';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import {getTranslations} from 'next-intl/server';
import Link from 'next/link';

type TocItem = {
  id: string;
  label: string;
};

export default async function TermsOfUsePage() {
  const tBreadcrumbs = await getTranslations('Common.breadcrumbs');
  const pageTitle = tBreadcrumbs('termsOfUse');
  const lastUpdatedDate = 'March 15, 2025';
  
  const tocItems: TocItem[] = [
    { id: 'acceptance', label: 'Acceptance of Terms' },
    { id: 'service-description', label: 'Description of Service' },
    { id: 'user-accounts', label: 'User Accounts' },
    { id: 'acceptable-use', label: 'Acceptable Use Policy' },
    { id: 'user-content', label: 'User-Generated Content' },
    { id: 'health-disclaimer', label: 'Health Information Disclaimer' },
    { id: 'intellectual-property', label: 'Intellectual Property Rights' },
    { id: 'third-party', label: 'Third-Party Services' },
    { id: 'liability', label: 'Limitation of Liability' },
    { id: 'indemnification', label: 'Indemnification' },
    { id: 'termination', label: 'Termination' },
    { id: 'changes', label: 'Changes to Terms' },
    { id: 'governing-law', label: 'Governing Law' },
    { id: 'contact', label: 'Contact Us' },
  ];

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
            Last Updated: {lastUpdatedDate}
          </p>

          <Card className="border border-teal-100/70 bg-white/80 shadow-sm dark:border-teal-900/40 dark:bg-gray-900/60">
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                Welcome to Safhira
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-base leading-relaxed text-gray-700 dark:text-gray-300">
              <p>
                Thank you for choosing Safhira, a comprehensive sexual health education platform designed for Malaysian youth aged 18-25. These Terms of Use (&quot;Terms&quot;) govern your access to and use of our website, services, and features.
              </p>
              <p>
                By accessing or using Safhira, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our platform.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-teal-200/60 bg-teal-50/60 shadow-sm dark:border-teal-800/60 dark:bg-teal-950/40">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl font-semibold text-teal-900 dark:text-teal-200">
                Table of Contents
              </CardTitle>
              <CardDescription className="text-sm text-teal-800 dark:text-teal-300">
                Navigate to specific sections of our terms
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

          <section id="acceptance">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  1. Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>
                  By creating an account, accessing, or using any part of Safhira&apos;s services, you acknowledge that you have read, understood, and agree to be bound by these Terms, along with our Privacy Policy. These Terms apply to all users, including visitors, registered users, and contributors.
                </p>
                <p>
                  If you are using Safhira on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.
                </p>
              </CardContent>
            </Card>
          </section>

          <section id="service-description">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  2. Description of Service
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>
                  Safhira provides stigma-free sexual health education and resources, including but not limited to:
                </p>
                <ul className="space-y-2 list-disc pl-5 marker:text-teal-500 dark:marker:text-teal-300">
                  <li>Comprehensive information about sexually transmitted infections (STIs)</li>
                  <li>Interactive data visualizations of STI prevalence in Malaysia</li>
                  <li>AI-powered chat assistance for health-related questions</li>
                  <li>Interactive quizzes and educational games</li>
                  <li>AI conversation practice simulator for sensitive topics</li>
                  <li>Healthcare provider directory and location services</li>
                  <li>Living well resources and treatment adherence tools</li>
                  <li>Sexual health calculators and assessment tools</li>
                </ul>
                <p>
                  We reserve the right to modify, suspend, or discontinue any aspect of our services at any time without prior notice.
                </p>
              </CardContent>
            </Card>
          </section>

          <section id="user-accounts">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  3. User Accounts and Registration
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>
                  Some features of Safhira may require you to create an account. When creating an account, you agree to:
                </p>
                <ul className="space-y-2 list-disc pl-5 marker:text-teal-500 dark:marker:text-teal-300">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your information to keep it accurate</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities that occur under your account</li>
                  <li>Notify us immediately of any unauthorized access or security breaches</li>
                </ul>
                <p>
                  You must be at least 18 years old to create an account on Safhira. We reserve the right to refuse service, terminate accounts, or remove content at our sole discretion.
                </p>
              </CardContent>
            </Card>
          </section>

          <section id="acceptable-use">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  4. Acceptable Use Policy
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>
                  You agree to use Safhira only for lawful purposes and in accordance with these Terms. You agree NOT to:
                </p>
                <ul className="space-y-2 list-disc pl-5 marker:text-teal-500 dark:marker:text-teal-300">
                  <li>Violate any applicable laws, regulations, or third-party rights</li>
                  <li>Use the platform to harass, abuse, or harm others</li>
                  <li>Impersonate any person or entity, or falsely state or misrepresent your affiliation</li>
                  <li>Transmit malicious code, viruses, or any harmful technology</li>
                  <li>Attempt to gain unauthorized access to our systems or user accounts</li>
                  <li>Scrape, data mine, or use automated systems to access our content without permission</li>
                  <li>Use the platform for commercial purposes without our explicit consent</li>
                  <li>Share misleading or false health information</li>
                  <li>Upload content that is offensive, discriminatory, or promotes stigma</li>
                  <li>Interfere with or disrupt the platform&apos;s functionality or servers</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          <section id="user-content">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  5. User-Generated Content
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>
                  Safhira may allow you to submit content such as quiz answers, feedback, AI chat conversations, and simulator session data. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and analyze such content for the purposes of:
                </p>
                <ul className="space-y-2 list-disc pl-5 marker:text-teal-500 dark:marker-text-teal-300">
                  <li>Providing and improving our services</li>
                  <li>Training and refining AI models</li>
                  <li>Conducting research to improve sexual health education</li>
                  <li>Aggregating anonymized data for statistical analysis</li>
                </ul>
                <p>
                  You represent and warrant that you own or have the necessary rights to the content you submit, and that it does not violate any third-party rights or applicable laws.
                </p>
                <p>
                  We reserve the right to review, moderate, or remove any user-generated content that violates these Terms or is otherwise objectionable.
                </p>
              </CardContent>
            </Card>
          </section>

          <section id="health-disclaimer">
            <Card className="border border-pink-200/80 bg-pink-50/60 shadow-sm dark:border-pink-900/60 dark:bg-pink-950/40">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-pink-900 dark:text-pink-200">
                  6. Health Information Disclaimer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-base leading-relaxed text-pink-900/90 dark:text-pink-200/90">
                <div className="space-y-4">
                  <p className="font-semibold">
                    IMPORTANT: The information provided on Safhira is for educational purposes only and is not intended as a substitute for professional medical advice, diagnosis, or treatment.
                  </p>
                  <p>
                    Always seek the advice of qualified healthcare providers with any questions you may have regarding a medical condition or health concern. Never disregard professional medical advice or delay seeking it because of information you have read on Safhira.
                  </p>
                  <p>
                    Our AI chat assistant and simulator are educational tools designed to provide general information and practice scenarios. They do not provide medical diagnoses, prescribe treatments, or replace consultation with healthcare professionals.
                  </p>
                  <p>
                    If you think you may have a medical emergency, call your doctor or emergency services immediately. Safhira is not responsible for any health outcomes or decisions made based on information provided through our platform.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="intellectual-property">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  7. Intellectual Property Rights
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>
                  All content on Safhira, including but not limited to text, graphics, logos, images, data visualizations, software, and designs, is the property of Safhira or its content suppliers and is protected by international copyright, trademark, and other intellectual property laws.
                </p>
                <p>
                  You may access and use our content for personal, non-commercial educational purposes only. You may not:
                </p>
                <ul className="space-y-2 list-disc pl-5 marker:text-teal-500 dark:marker:text-teal-300">
                  <li>Reproduce, distribute, or publicly display our content without permission</li>
                  <li>Modify, adapt, or create derivative works from our content</li>
                  <li>Use our content for commercial purposes</li>
                  <li>Remove or alter any copyright, trademark, or proprietary notices</li>
                </ul>
                <p>
                  If you wish to use our content beyond these restrictions, please contact us for permission.
                </p>
              </CardContent>
            </Card>
          </section>

          <section id="third-party">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  8. Third-Party Services and Links
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>
                  Safhira integrates with and links to third-party services, including but not limited to:
                </p>
                <ul className="space-y-2 list-disc pl-5 marker:text-teal-500 dark:marker:text-teal-300">
                  <li>OpenAI for AI chat functionality</li>
                  <li>Google Maps for location services</li>
                  <li>External healthcare provider websites</li>
                  <li>Educational resources and references</li>
                </ul>
                <p>
                  We are not responsible for the content, privacy practices, or availability of third-party services. Your use of third-party services is subject to their respective terms and conditions and privacy policies.
                </p>
                <p>
                  The inclusion of any link does not imply endorsement by Safhira. We encourage you to review the terms and policies of any third-party services you access through our platform.
                </p>
              </CardContent>
            </Card>
          </section>

          <section id="liability">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  9. Limitation of Liability
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>
                  To the fullest extent permitted by applicable law, Safhira and its directors, employees, partners, suppliers, and affiliates shall not be liable for:
                </p>
                <ul className="space-y-2 list-disc pl-5 marker:text-teal-500 dark:marker:text-teal-300">
                  <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                  <li>Any loss of profits, revenue, data, or goodwill</li>
                  <li>Any damages resulting from your use or inability to use our services</li>
                  <li>Any damages resulting from unauthorized access to or alteration of your data</li>
                  <li>Any health outcomes or medical decisions made based on information from our platform</li>
                  <li>Any errors, omissions, or inaccuracies in our content</li>
                </ul>
                <p>
                  Our services are provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
                </p>
                <p>
                  In no event shall our total liability to you for all damages exceed the amount you paid us, if any, in the past twelve months.
                </p>
              </CardContent>
            </Card>
          </section>

          <section id="indemnification">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  10. Indemnification
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>
                  You agree to indemnify, defend, and hold harmless Safhira and its officers, directors, employees, contractors, agents, and affiliates from and against any claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys&apos; fees) arising from:
                </p>
                <ul className="space-y-2 list-disc pl-5 marker:text-teal-500 dark:marker:text-teal-300">
                  <li>Your use or misuse of our services</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any rights of another party</li>
                  <li>Your violation of any applicable laws or regulations</li>
                  <li>Any content you submit or transmit through our platform</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          <section id="termination">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  11. Termination
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>
                  We reserve the right to suspend or terminate your access to Safhira at any time, with or without notice, for any reason, including but not limited to:
                </p>
                <ul className="space-y-2 list-disc pl-5 marker:text-teal-500 dark:marker:text-teal-300">
                  <li>Violation of these Terms</li>
                  <li>Fraudulent, abusive, or illegal activity</li>
                  <li>Extended periods of inactivity</li>
                  <li>Requests by law enforcement or government agencies</li>
                </ul>
                <p>
                  Upon termination, your right to use our services will immediately cease. We may delete your account and any associated data, subject to our data retention policies and applicable laws.
                </p>
                <p>
                  You may terminate your account at any time by contacting us or using the account deletion features provided in our platform.
                </p>
              </CardContent>
            </Card>
          </section>

          <section id="changes">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  12. Changes to Terms
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>
                  We reserve the right to modify these Terms at any time. When we make changes, we will update the &quot;Last Updated&quot; date at the top of this page and, where appropriate, notify you through our platform or by email.
                </p>
                <p>
                  Your continued use of Safhira after changes to these Terms constitutes your acceptance of the modified Terms. If you do not agree to the modified Terms, you must stop using our services.
                </p>
                <p>
                  We encourage you to review these Terms periodically to stay informed about your rights and obligations.
                </p>
              </CardContent>
            </Card>
          </section>

          <section id="governing-law">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  13. Governing Law and Dispute Resolution
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of Malaysia, without regard to its conflict of law provisions.
                </p>
                <p>
                  Any disputes arising out of or relating to these Terms or your use of Safhira shall be resolved through:
                </p>
                <ul className="space-y-2 list-disc pl-5 marker:text-teal-500 dark:marker:text-teal-300">
                  <li><span className="font-semibold text-gray-800 dark:text-gray-100">Informal Resolution:</span> First, contact us to attempt to resolve the dispute informally</li>
                  <li><span className="font-semibold text-gray-800 dark:text-gray-100">Mediation:</span> If informal resolution fails, the parties agree to attempt mediation</li>
                  <li><span className="font-semibold text-gray-800 dark:text-gray-100">Jurisdiction:</span> If mediation is unsuccessful, disputes shall be subject to the exclusive jurisdiction of the courts of Malaysia</li>
                </ul>
                <p>
                  You agree to waive any right to a jury trial or to participate in a class action lawsuit against Safhira.
                </p>
              </CardContent>
            </Card>
          </section>

          <section id="contact">
            <Card className={sectionCardClass}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  14. Contact Us
                </CardTitle>
              </CardHeader>
              <CardContent className={sectionContentClass}>
                <p>
                  If you have any questions, concerns, or feedback about these Terms of Use, please contact us:
                </p>
                <ul className="space-y-2 list-disc pl-5 marker:text-teal-500 dark:marker:text-teal-300">
                  <li>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">Email:</span>{' '}
                    <a
                      className="text-teal-600 underline transition hover:text-teal-700 dark:text-teal-300 dark:hover:text-teal-200"
                      href="mailto:support@safhira.org"
                    >
                      support@safhira.org
                    </a>
                  </li>
                  <li>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">Website:</span>{' '}
                    <a
                      className="text-teal-600 underline transition hover:text-teal-700 dark:text-teal-300 dark:hover:text-teal-200"
                      href="https://safhira.org"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      https://safhira.org
                    </a>
                  </li>
                </ul>
                <p>
                  We strive to respond to all inquiries within 5-7 business days. For urgent matters related to your account or privacy, please indicate this clearly in your message.
                </p>
              </CardContent>
            </Card>
          </section>

          <Card className="border border-teal-200/60 bg-teal-50/60 shadow-sm dark:border-teal-800/60 dark:bg-teal-950/40">
            <CardContent className="pt-6">
              <p className="text-center text-sm text-teal-900 dark:text-teal-200">
                Thank you for using Safhira. Together, we&apos;re breaking stigmas and building knowledge about sexual health in Malaysia.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
