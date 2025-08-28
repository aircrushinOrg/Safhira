import './globals.css';

import { GeistSans } from 'geist/font/sans';
import { Suspense } from 'react';
import { ThemeProvider } from './components/theme-provider';
import { HeaderWrapper } from './components/HeaderWrapper';

let title = 'Safhira - Safe Sexual Health for Malaysian Youth';
let description =
  'Empowering young Malaysian adults aged 18-25 with stigma-free sexual health education, anonymous testing resources, and culturally sensitive support to combat rising STI rates.';

export const metadata = {
  title,
  description,
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
    ],
    shortcut: '/favicon.ico',
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
      <body className={GeistSans.variable}>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
