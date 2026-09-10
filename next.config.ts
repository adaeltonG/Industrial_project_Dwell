import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  basePath: "/dwell",
  reactStrictMode: true,
  turbopack: {
    root: process.cwd()
  }
};

export default nextConfig;
