import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Ensure Next/Turbopack treats this directory as the workspace root
  // to avoid warnings when multiple lockfiles exist on the machine.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;

