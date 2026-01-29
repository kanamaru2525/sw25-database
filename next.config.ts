import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable Turbopack to avoid caching issues with Prisma Client
  turbopack: undefined,
};

export default nextConfig;
