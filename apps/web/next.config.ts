import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@al-infaaq/api",
    "@al-infaaq/payments",
    "@al-infaaq/ui",
    "@al-infaaq/utils",
  ],
};

export default nextConfig;
