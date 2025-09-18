import './globals.css';

import {Poppins} from 'next/font/google';
import {Suspense} from 'react';
import {ThemeProvider} from './providers/theme-provider';
import {getLocale} from 'next-intl/server';
import DifyChatbotEmbed from '@/app/components/DifyChatbotEmbed';
import Script from 'next/script';


const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

let title = 'Safhira - Safe Sexual Health for Malaysian Youth';
let description =
  'Empowering young Malaysian adults aged 18-25 with stigma-free sexual health education, anonymous testing resources, and culturally sensitive support to combat rising STI rates.';

export const metadata = {
  title,
  description,
  icons: {
    icon: [
      {
        url: '/logo.svg',
        sizes: '32x32',
        type: 'image/x-icon',
      },
    ],
    shortcut: '/logo.svg',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  metadataBase: new URL('https://safhira.vercel.app'),
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={poppins.variable}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
        <Script id="dify-config" strategy="beforeInteractive">
          {`
            window.difyChatbotConfig = {
              token: 'jR3TCPVG1DjZidxk',
              inputs: {},
              systemVariables: {},
              userVariables: {},
            };
          `}
        </Script>
        <Script
          src="https://udify.app/embed.min.js"
          id="jR3TCPVG1DjZidxk"
          strategy="beforeInteractive"
        />
        <DifyChatbotEmbed />
      </body>
    </html>
  );
}
