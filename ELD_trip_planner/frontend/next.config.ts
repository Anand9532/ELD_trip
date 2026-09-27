import type { NextConfig } from 'next';

if (process.env.VERCEL === '1' && !process.env.NEXT_PUBLIC_API_BASE) {
  console.warn(
    '\n⚠️  NEXT_PUBLIC_API_BASE is not set. Add it in Vercel → Project → Settings → Environment Variables.\n'
  );
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  poweredByHeader: false,
};

export default nextConfig;
