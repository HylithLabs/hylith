import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
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

export default nextConfig;
