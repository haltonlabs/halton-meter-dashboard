import type { NextConfig } from "next";

const DAEMON_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8765";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/v1/:path*", destination: `${DAEMON_URL}/v1/:path*` },
      { source: "/health", destination: `${DAEMON_URL}/health` },
    ];
  },
};

export default nextConfig;
