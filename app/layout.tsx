import './globals.css';

import { GeistSans } from 'geist/font/sans';

let title = 'Safhira - Safe Sexual Health for Malaysian Youth';
let description =
  'Empowering young Malaysian adults aged 18-25 with stigma-free sexual health education, anonymous testing resources, and culturally sensitive support to combat rising STI rates.';

export const metadata = {
  title,
  description,
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
    <html lang="en">
      <body className={GeistSans.variable}>{children}</body>
    </html>
  );
}
