import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Ensure Next/Turbopack treats this directory as the workspace root
  // to avoid warnings when multiple lockfiles exist on the machine.
  turbopack: {
    root: __dirname,
  },
};

export default withNextIntl(nextConfig);
