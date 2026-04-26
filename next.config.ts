import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Route group `(onboarding)` did not include `/onboarding` in the URL; these paths
  // may have been used or linked before the real `app/onboarding/*` segment existed.
  async redirects() {
    return [
      { source: "/company", destination: "/onboarding/company", permanent: true },
      { source: "/warehouse", destination: "/onboarding/warehouse", permanent: true },
      { source: "/sample-data", destination: "/onboarding/sample-data", permanent: true },
    ]
  },
};

export default nextConfig;
