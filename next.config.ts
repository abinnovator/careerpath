import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // compiler: {
  //   // Remove all console logs
  //   removeConsole: true,
  // },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "", // Leave empty if no specific port
        pathname: "/ki5emlag8/**", // Use a wildcard if paths can vary widely
      },
      // Add other remote patterns if you have images from other domains
    ],
  },
  // Other Next.js configurations might be here
};

export default nextConfig;
