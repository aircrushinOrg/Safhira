import './globals.css';

import { Poppins } from 'next/font/google';
import { Suspense } from 'react';
import { ThemeProvider } from './components/theme-provider';
import { HeaderWrapper } from './components/HeaderWrapper';
import { FooterWrapper } from './components/FooterWrapper';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.variable}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <HeaderWrapper />
          </Suspense>
          {children}
          <Suspense fallback={null}>
            <FooterWrapper />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
