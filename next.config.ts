import type { NextConfig } from "next";
import path from "node:path";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async redirects() {
    return [
      {
        source: "/opengraph-image",
        destination: "/assets/OGImage.png",
        permanent: true,
      },
      {
        source: "/twitter-image",
        destination: "/assets/OGImage.png",
        permanent: true,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
