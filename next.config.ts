import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: { remotePatterns: [
    { protocol: 'https', hostname: 'covers.openlibrary.org'},
    { protocol: 'https', hostname: '67iqcsenxwsbmncd.public.blob.vercel-storage.com'},
  ]},
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
      bodySizeLimit: '100mb',
    },
  },
};

export default nextConfig;
