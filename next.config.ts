import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  basePath: "/dwell",
  reactStrictMode: true,
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${process.env.API_ORIGIN ?? "http://127.0.0.1:4000"}/api/:path*` }];
  },
  turbopack: {
    root: process.cwd()
  }
};

export default nextConfig;
